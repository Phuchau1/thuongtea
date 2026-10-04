import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { connectToDatabase, getDatabase } from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '15mb' }));

// Server-Sent Events (SSE) subscribers for real-time order sync
const sseClients = new Set();

function broadcastSse(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

// --------------------------------------------------------------------------
// 1. HEALTH & STATUS
// --------------------------------------------------------------------------
app.get('/api/health', async (req, res) => {
  const { isMongo } = getDatabase();
  res.json({
    status: 'ok',
    database: isMongo ? 'mongodb_atlas' : 'local_storage',
    clientsCount: sseClients.size,
    timestamp: new Date().toISOString()
  });
});

// --------------------------------------------------------------------------
// 2. REALTIME ORDERS SSE STREAM (/api/orders/stream)
// --------------------------------------------------------------------------
app.get('/api/orders/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  res.write(': connected\n\n');
  sseClients.add(res);

  // Heartbeat every 20s to keep connection alive through proxies/Render
  const interval = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch {
      clearInterval(interval);
      sseClients.delete(res);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(interval);
    sseClients.delete(res);
  });
});

// --------------------------------------------------------------------------
// 3. ORDERS API
// --------------------------------------------------------------------------
// GET /api/orders
app.get('/api/orders', async (req, res) => {
  try {
    const { db, isMongo, getLocalData } = getDatabase();
    if (isMongo) {
      const orders = await db.collection('orders').find({}).sort({ createdTimestamp: -1 }).toArray();
      // Clean up Mongo _id from output if needed
      const sanitized = orders.map(({ _id, ...rest }) => rest);
      return res.json({ success: true, data: sanitized });
    }
    const local = getLocalData();
    res.json({ success: true, data: local.orders || [] });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/orders (Create or upsert)
app.post('/api/orders', async (req, res) => {
  try {
    const newOrder = req.body;
    if (!newOrder || !newOrder.id) {
      return res.status(400).json({ success: false, error: 'Thiếu thông tin đơn hàng' });
    }

    const orderData = {
      ...newOrder,
      createdTimestamp: newOrder.createdTimestamp || Date.now()
    };

    const { db, isMongo, getLocalData, saveLocalData } = getDatabase();
    if (isMongo) {
      await db.collection('orders').updateOne(
        { id: orderData.id },
        { $set: orderData },
        { upsert: true }
      );
    } else {
      const local = getLocalData();
      local.orders = local.orders || [];
      const idx = local.orders.findIndex((o) => o.id === orderData.id);
      if (idx >= 0) {
        local.orders[idx] = { ...local.orders[idx], ...orderData };
      } else {
        local.orders.unshift(orderData);
      }
      saveLocalData(local);
    }

    // Broadcast to all POS / kitchen screens in real time
    broadcastSse('NEW_ORDER', orderData);
    res.json({ success: true, data: orderData });
  } catch (err) {
    console.error('Error saving order:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/orders/check/:id (Check & mark preparing)
app.post('/api/orders/check/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const checkedAt = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const updates = { checked: true, status: 'preparing', checkedAt };

    const { db, isMongo, getLocalData, saveLocalData } = getDatabase();
    let updatedOrder = null;

    if (isMongo) {
      await db.collection('orders').updateOne({ id: orderId }, { $set: updates });
      const doc = await db.collection('orders').findOne({ id: orderId });
      if (doc) {
        const { _id, ...rest } = doc;
        updatedOrder = rest;
      }
    } else {
      const local = getLocalData();
      local.orders = (local.orders || []).map((o) => {
        if (o.id === orderId) {
          updatedOrder = { ...o, ...updates };
          return updatedOrder;
        }
        return o;
      });
      saveLocalData(local);
    }

    broadcastSse('CHECK_ORDER', { orderId, checkedAt, order: updatedOrder });
    res.json({ success: true, data: updatedOrder });
  } catch (err) {
    console.error('Error checking order:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/orders/:id (Update status / fields)
app.put('/api/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const updates = req.body;

    const { db, isMongo, getLocalData, saveLocalData } = getDatabase();
    let updatedOrder = null;

    if (isMongo) {
      await db.collection('orders').updateOne({ id: orderId }, { $set: updates });
      const doc = await db.collection('orders').findOne({ id: orderId });
      if (doc) {
        const { _id, ...rest } = doc;
        updatedOrder = rest;
      }
    } else {
      const local = getLocalData();
      local.orders = (local.orders || []).map((o) => {
        if (o.id === orderId) {
          updatedOrder = { ...o, ...updates };
          return updatedOrder;
        }
        return o;
      });
      saveLocalData(local);
    }

    broadcastSse('UPDATE_ORDER', { orderId, updates, order: updatedOrder });
    res.json({ success: true, data: updatedOrder });
  } catch (err) {
    console.error('Error updating order:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/orders/:id
app.delete('/api/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const { db, isMongo, getLocalData, saveLocalData } = getDatabase();

    if (isMongo) {
      await db.collection('orders').deleteOne({ id: orderId });
    } else {
      const local = getLocalData();
      local.orders = (local.orders || []).filter((o) => o.id !== orderId);
      saveLocalData(local);
    }

    broadcastSse('DELETE_ORDER', { orderId });
    res.json({ success: true, orderId });
  } catch (err) {
    console.error('Error deleting order:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/orders/clear-duplicates
app.post('/api/orders/clear-duplicates', async (req, res) => {
  try {
    const { db, isMongo, getLocalData, saveLocalData } = getDatabase();
    let uniqueOrders = [];

    if (isMongo) {
      const all = await db.collection('orders').find({}).sort({ createdTimestamp: -1 }).toArray();
      const seen = new Set();
      const idsToDelete = [];
      for (const o of all) {
        const key = `${o.tableNumber || ''}-${o.customer?.phone || ''}-${o.total || 0}-${(o.items || []).map(i => i.cartItemId).join(',')}`;
        if (seen.has(key)) {
          idsToDelete.push(o._id);
        } else {
          seen.add(key);
          const { _id, ...rest } = o;
          uniqueOrders.push(rest);
        }
      }
      if (idsToDelete.length > 0) {
        await db.collection('orders').deleteMany({ _id: { $in: idsToDelete } });
      }
    } else {
      const local = getLocalData();
      const seen = new Set();
      for (const o of (local.orders || [])) {
        const key = `${o.tableNumber || ''}-${o.customer?.phone || ''}-${o.total || 0}-${(o.items || []).map(i => i.cartItemId).join(',')}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueOrders.push(o);
        }
      }
      local.orders = uniqueOrders;
      saveLocalData(local);
    }

    broadcastSse('ORDERS_RESET', uniqueOrders);
    res.json({ success: true, data: uniqueOrders });
  } catch (err) {
    console.error('Error clearing duplicates:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// --------------------------------------------------------------------------
// 4. TABLES & TABLE CLEARING
// --------------------------------------------------------------------------
// POST /api/tables/clear (Dọn trả bàn trống)
app.post('/api/tables/clear', async (req, res) => {
  try {
    const { tableNumber } = req.body;
    const cleanTbl = (tableNumber || '').trim().toLowerCase();

    const { db, isMongo, getLocalData, saveLocalData } = getDatabase();
    if (isMongo) {
      // Find orders matching tableNumber that are not yet cleared
      const allOrders = await db.collection('orders').find({
        tableCleared: { $ne: true },
        status: { $ne: 'cancelled' }
      }).toArray();

      const matchedIds = allOrders
        .filter(o => {
          const t = (o.tableNumber || o.customer?.tableNumber || '').trim().toLowerCase();
          return t === cleanTbl;
        })
        .map(o => o.id);

      if (matchedIds.length > 0) {
        await db.collection('orders').updateMany(
          { id: { $in: matchedIds } },
          { $set: { tableCleared: true, paymentStatus: 'paid' } }
        );
      }
    } else {
      const local = getLocalData();
      local.orders = (local.orders || []).map(o => {
        const t = (o.tableNumber || o.customer?.tableNumber || '').trim().toLowerCase();
        if (t === cleanTbl && !o.tableCleared && o.status !== 'cancelled') {
          return { ...o, tableCleared: true, paymentStatus: 'paid' };
        }
        return o;
      });
      saveLocalData(local);
    }

    broadcastSse('CLEAR_TABLE', { tableNumber });
    res.json({ success: true, tableNumber });
  } catch (err) {
    console.error('Error clearing table:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/tables/clear-all
app.post('/api/tables/clear-all', async (req, res) => {
  try {
    const { db, isMongo, getLocalData, saveLocalData } = getDatabase();
    if (isMongo) {
      await db.collection('orders').updateMany(
        { tableCleared: { $ne: true }, status: { $ne: 'cancelled' } },
        { $set: { tableCleared: true, paymentStatus: 'paid' } }
      );
    } else {
      const local = getLocalData();
      local.orders = (local.orders || []).map(o => {
        if ((o.tableNumber || o.customer?.tableNumber) && !o.tableCleared && o.status !== 'cancelled') {
          return { ...o, tableCleared: true, paymentStatus: 'paid' };
        }
        return o;
      });
      saveLocalData(local);
    }

    broadcastSse('CLEAR_ALL_TABLES', {});
    res.json({ success: true });
  } catch (err) {
    console.error('Error clearing all tables:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET & POST /api/tables
app.get('/api/tables', async (req, res) => {
  try {
    const { db, isMongo, getLocalData } = getDatabase();
    if (isMongo) {
      const doc = await db.collection('config').findOne({ key: 'tables' });
      return res.json({ success: true, data: doc?.list || [] });
    }
    const local = getLocalData();
    res.json({ success: true, data: local.tables || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/tables', async (req, res) => {
  try {
    const { tables } = req.body;
    const { db, isMongo, getLocalData, saveLocalData } = getDatabase();
    if (isMongo) {
      await db.collection('config').updateOne(
        { key: 'tables' },
        { $set: { key: 'tables', list: tables, updatedAt: Date.now() } },
        { upsert: true }
      );
    } else {
      const local = getLocalData();
      local.tables = tables;
      saveLocalData(local);
    }
    res.json({ success: true, data: tables });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --------------------------------------------------------------------------
// 5. PRODUCTS & TOPPINGS
// --------------------------------------------------------------------------
// Products
app.get('/api/products', async (req, res) => {
  try {
    const { db, isMongo, getLocalData } = getDatabase();
    if (isMongo) {
      const doc = await db.collection('config').findOne({ key: 'products' });
      return res.json({ success: true, data: doc?.list || [] });
    }
    const local = getLocalData();
    res.json({ success: true, data: local.products || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { products } = req.body;
    const { db, isMongo, getLocalData, saveLocalData } = getDatabase();
    if (isMongo) {
      await db.collection('config').updateOne(
        { key: 'products' },
        { $set: { key: 'products', list: products, updatedAt: Date.now() } },
        { upsert: true }
      );
    } else {
      const local = getLocalData();
      local.products = products;
      saveLocalData(local);
    }
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Toppings
app.get('/api/toppings', async (req, res) => {
  try {
    const { db, isMongo, getLocalData } = getDatabase();
    if (isMongo) {
      const doc = await db.collection('config').findOne({ key: 'toppings' });
      return res.json({ success: true, data: doc?.list || [] });
    }
    const local = getLocalData();
    res.json({ success: true, data: local.toppings || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/toppings', async (req, res) => {
  try {
    const { toppings } = req.body;
    const { db, isMongo, getLocalData, saveLocalData } = getDatabase();
    if (isMongo) {
      await db.collection('config').updateOne(
        { key: 'toppings' },
        { $set: { key: 'toppings', list: toppings, updatedAt: Date.now() } },
        { upsert: true }
      );
    } else {
      const local = getLocalData();
      local.toppings = toppings;
      saveLocalData(local);
    }
    res.json({ success: true, data: toppings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --------------------------------------------------------------------------
// 6. MEMBERS & LOYALTY
// --------------------------------------------------------------------------
app.get('/api/members', async (req, res) => {
  try {
    const { db, isMongo, getLocalData } = getDatabase();
    if (isMongo) {
      const list = await db.collection('members').find({}).toArray();
      const sanitized = list.map(({ _id, ...rest }) => rest);
      return res.json({ success: true, data: sanitized });
    }
    const local = getLocalData();
    res.json({ success: true, data: local.members || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/members', async (req, res) => {
  try {
    const member = req.body;
    const cleanPhone = (member.phone || '').replace(/\D/g, '');
    if (!cleanPhone) {
      return res.status(400).json({ success: false, error: 'Số điện thoại không hợp lệ' });
    }

    const standardized = {
      ...member,
      id: cleanPhone,
      phone: cleanPhone,
      updatedAt: Date.now()
    };

    const { db, isMongo, getLocalData, saveLocalData } = getDatabase();
    if (isMongo) {
      await db.collection('members').updateOne(
        { phone: cleanPhone },
        { $set: standardized },
        { upsert: true }
      );
    } else {
      const local = getLocalData();
      local.members = local.members || [];
      const idx = local.members.findIndex(m => m.phone === cleanPhone);
      if (idx >= 0) {
        local.members[idx] = standardized;
      } else {
        local.members.push(standardized);
      }
      saveLocalData(local);
    }

    res.json({ success: true, data: standardized });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/members/:id', async (req, res) => {
  try {
    const rawId = req.params.id;
    const cleanPhone = String(rawId).replace(/\D/g, '');

    const { db, isMongo, getLocalData, saveLocalData } = getDatabase();
    if (isMongo) {
      await db.collection('members').deleteMany({
        $or: [{ phone: cleanPhone }, { id: rawId }, { phone: rawId }]
      });
    } else {
      const local = getLocalData();
      local.members = (local.members || []).filter(m => m.phone !== cleanPhone && m.id !== rawId);
      saveLocalData(local);
    }
    res.json({ success: true, id: rawId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --------------------------------------------------------------------------
// 7. STAFF & ATTENDANCE
// --------------------------------------------------------------------------
app.get('/api/staff', async (req, res) => {
  try {
    const { db, isMongo, getLocalData } = getDatabase();
    if (isMongo) {
      const doc = await db.collection('config').findOne({ key: 'staff' });
      return res.json({ success: true, data: doc?.list || [] });
    }
    const local = getLocalData();
    res.json({ success: true, data: local.staff || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/staff', async (req, res) => {
  try {
    const { staff } = req.body;
    const { db, isMongo, getLocalData, saveLocalData } = getDatabase();
    if (isMongo) {
      await db.collection('config').updateOne(
        { key: 'staff' },
        { $set: { key: 'staff', list: staff, updatedAt: Date.now() } },
        { upsert: true }
      );
    } else {
      const local = getLocalData();
      local.staff = staff;
      saveLocalData(local);
    }
    res.json({ success: true, data: staff });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/attendance', async (req, res) => {
  try {
    const { db, isMongo, getLocalData } = getDatabase();
    if (isMongo) {
      const records = await db.collection('attendance').find({}).sort({ timestamp: -1 }).toArray();
      const sanitized = records.map(({ _id, ...rest }) => rest);
      return res.json({ success: true, data: sanitized });
    }
    const local = getLocalData();
    res.json({ success: true, data: local.attendance || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/attendance/record', async (req, res) => {
  try {
    const record = req.body;
    const docId = record.id || `att-${Date.now()}`;
    const standardized = { ...record, id: docId };

    const { db, isMongo, getLocalData, saveLocalData } = getDatabase();
    if (isMongo) {
      await db.collection('attendance').updateOne(
        { id: docId },
        { $set: standardized },
        { upsert: true }
      );
    } else {
      const local = getLocalData();
      local.attendance = local.attendance || [];
      const idx = local.attendance.findIndex(a => a.id === docId);
      if (idx >= 0) {
        local.attendance[idx] = standardized;
      } else {
        local.attendance.unshift(standardized);
      }
      saveLocalData(local);
    }
    res.json({ success: true, data: standardized });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --------------------------------------------------------------------------
// 8. COUPONS & STOCK STATUS
// --------------------------------------------------------------------------
app.get('/api/coupons', async (req, res) => {
  try {
    const { db, isMongo, getLocalData } = getDatabase();
    if (isMongo) {
      const doc = await db.collection('config').findOne({ key: 'coupons' });
      return res.json({ success: true, data: doc?.list || [] });
    }
    const local = getLocalData();
    res.json({ success: true, data: local.coupons || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/coupons', async (req, res) => {
  try {
    const { coupons } = req.body;
    const { db, isMongo, getLocalData, saveLocalData } = getDatabase();
    if (isMongo) {
      await db.collection('config').updateOne(
        { key: 'coupons' },
        { $set: { key: 'coupons', list: coupons, updatedAt: Date.now() } },
        { upsert: true }
      );
    } else {
      const local = getLocalData();
      local.coupons = coupons;
      saveLocalData(local);
    }
    res.json({ success: true, data: coupons });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/stock', async (req, res) => {
  try {
    const { db, isMongo, getLocalData } = getDatabase();
    if (isMongo) {
      const doc = await db.collection('config').findOne({ key: 'stock' });
      return res.json({ success: true, data: doc?.status || {} });
    }
    const local = getLocalData();
    res.json({ success: true, data: local.stock || {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/stock', async (req, res) => {
  try {
    const { stock } = req.body;
    const { db, isMongo, getLocalData, saveLocalData } = getDatabase();
    if (isMongo) {
      await db.collection('config').updateOne(
        { key: 'stock' },
        { $set: { key: 'stock', status: stock, updatedAt: Date.now() } },
        { upsert: true }
      );
    } else {
      const local = getLocalData();
      local.stock = stock;
      saveLocalData(local);
    }
    res.json({ success: true, data: stock });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --------------------------------------------------------------------------
// 9. SERVE PRODUCTION FRONTEND (Vite Build in dist/)
// --------------------------------------------------------------------------
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

// For all non-API routes, serve index.html (SPA client routing)
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  res.sendFile(path.resolve(distPath, 'index.html'));
});

// Start Server & Connect MongoDB Atlas
async function start() {
  await connectToDatabase();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`===============================================`);
    console.log(`🍵 THUONGTEA Backend Server running on port ${PORT}`);
    console.log(`📡 Realtime SSE Order Stream at: /api/orders/stream`);
    console.log(`===============================================`);
  });
}

start();
