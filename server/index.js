import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { connectToDatabase, getDatabase, autoMigrateToMongo } from './db.js';

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
// 1. HEALTH & MIGRATION TRIGGER
// --------------------------------------------------------------------------
app.get('/api/health', (req, res) => {
  const { isMongo } = getDatabase();
  res.json({
    status: 'ok',
    database: isMongo ? 'mongodb_atlas' : 'connecting',
    clientsCount: sseClients.size,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/migrate-now', async (req, res) => {
  try {
    const { db, isMongo } = getDatabase();
    if (!isMongo || !db) {
      return res.status(503).json({ success: false, error: 'Chưa kết nối được với MongoDB Atlas' });
    }
    await autoMigrateToMongo(db);
    res.json({ success: true, message: 'Đã hoàn tất đồng bộ toàn bộ dữ liệu vào MongoDB Atlas!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
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

  // Heartbeat every 20s to keep connection alive
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
// 3. ORDERS API (MONGODB ATLAS EXCLUSIVE)
// --------------------------------------------------------------------------
// GET /api/orders
app.get('/api/orders', async (req, res) => {
  try {
    const { db } = getDatabase();
    if (!db) return res.json({ success: true, data: [] });

    const orders = await db.collection('orders').find({}).sort({ createdTimestamp: -1 }).toArray();
    const sanitized = orders.map(({ _id, ...rest }) => rest);
    res.json({ success: true, data: sanitized });
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

    const { db } = getDatabase();
    if (db) {
      await db.collection('orders').updateOne(
        { id: orderData.id },
        { $set: orderData },
        { upsert: true }
      );
    }

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

    const { db } = getDatabase();
    let updatedOrder = null;

    if (db) {
      await db.collection('orders').updateOne({ id: orderId }, { $set: updates });
      const doc = await db.collection('orders').findOne({ id: orderId });
      if (doc) {
        const { _id, ...rest } = doc;
        updatedOrder = rest;
      }
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

    const { db } = getDatabase();
    let updatedOrder = null;

    if (db) {
      await db.collection('orders').updateOne({ id: orderId }, { $set: updates });
      const doc = await db.collection('orders').findOne({ id: orderId });
      if (doc) {
        const { _id, ...rest } = doc;
        updatedOrder = rest;
      }
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
    const { db } = getDatabase();

    if (db) {
      await db.collection('orders').deleteOne({ id: orderId });
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
    const { db } = getDatabase();
    let uniqueOrders = [];

    if (db) {
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

    const { db } = getDatabase();
    if (db) {
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
    const { db } = getDatabase();
    if (db) {
      await db.collection('orders').updateMany(
        { tableCleared: { $ne: true }, status: { $ne: 'cancelled' } },
        { $set: { tableCleared: true, paymentStatus: 'paid' } }
      );
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
    const { db } = getDatabase();
    if (!db) return res.json({ success: true, data: [] });

    const doc = await db.collection('config').findOne({ key: 'tables' });
    res.json({ success: true, data: doc?.list || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/tables', async (req, res) => {
  try {
    const { tables } = req.body;
    const { db } = getDatabase();
    if (db) {
      await db.collection('config').updateOne(
        { key: 'tables' },
        { $set: { key: 'tables', list: tables, updatedAt: Date.now() } },
        { upsert: true }
      );
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
    const { db } = getDatabase();
    if (!db) return res.json({ success: true, data: [] });

    const doc = await db.collection('config').findOne({ key: 'products' });
    res.json({ success: true, data: doc?.list || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { products } = req.body;
    const { db } = getDatabase();
    if (db) {
      await db.collection('config').updateOne(
        { key: 'products' },
        { $set: { key: 'products', list: products, updatedAt: Date.now() } },
        { upsert: true }
      );
    }
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Toppings
app.get('/api/toppings', async (req, res) => {
  try {
    const { db } = getDatabase();
    if (!db) return res.json({ success: true, data: [] });

    const doc = await db.collection('config').findOne({ key: 'toppings' });
    res.json({ success: true, data: doc?.list || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/toppings', async (req, res) => {
  try {
    const { toppings } = req.body;
    const { db } = getDatabase();
    if (db) {
      await db.collection('config').updateOne(
        { key: 'toppings' },
        { $set: { key: 'toppings', list: toppings, updatedAt: Date.now() } },
        { upsert: true }
      );
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
    const { db } = getDatabase();
    if (!db) return res.json({ success: true, data: [] });

    const list = await db.collection('members').find({}).toArray();
    const sanitized = list.map(({ _id, ...rest }) => rest);
    res.json({ success: true, data: sanitized });
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

    const { db } = getDatabase();
    if (db) {
      await db.collection('members').updateOne(
        { phone: cleanPhone },
        { $set: standardized },
        { upsert: true }
      );
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

    const { db } = getDatabase();
    if (db) {
      await db.collection('members').deleteMany({
        $or: [{ phone: cleanPhone }, { id: rawId }, { phone: rawId }]
      });
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
    const { db } = getDatabase();
    if (!db) return res.json({ success: true, data: [] });

    const doc = await db.collection('config').findOne({ key: 'staff' });
    res.json({ success: true, data: doc?.list || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/staff', async (req, res) => {
  try {
    const { staff } = req.body;
    const { db } = getDatabase();
    if (db) {
      await db.collection('config').updateOne(
        { key: 'staff' },
        { $set: { key: 'staff', list: staff, updatedAt: Date.now() } },
        { upsert: true }
      );
    }
    res.json({ success: true, data: staff });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/attendance', async (req, res) => {
  try {
    const { db } = getDatabase();
    if (!db) return res.json({ success: true, data: [] });

    const records = await db.collection('attendance').find({}).sort({ timestamp: -1 }).toArray();
    const sanitized = records.map(({ _id, ...rest }) => rest);
    res.json({ success: true, data: sanitized });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/attendance/record', async (req, res) => {
  try {
    const record = req.body;
    const docId = record.id || `att-${Date.now()}`;
    const standardized = { ...record, id: docId };

    const { db } = getDatabase();
    if (db) {
      await db.collection('attendance').updateOne(
        { id: docId },
        { $set: standardized },
        { upsert: true }
      );
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
    const { db } = getDatabase();
    if (!db) return res.json({ success: true, data: [] });

    const doc = await db.collection('config').findOne({ key: 'coupons' });
    res.json({ success: true, data: doc?.list || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/coupons', async (req, res) => {
  try {
    const { coupons } = req.body;
    const { db } = getDatabase();
    if (db) {
      await db.collection('config').updateOne(
        { key: 'coupons' },
        { $set: { key: 'coupons', list: coupons, updatedAt: Date.now() } },
        { upsert: true }
      );
    }
    res.json({ success: true, data: coupons });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/stock', async (req, res) => {
  try {
    const { db } = getDatabase();
    if (!db) return res.json({ success: true, data: {} });

    const doc = await db.collection('config').findOne({ key: 'stock' });
    res.json({ success: true, data: doc?.status || {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/stock', async (req, res) => {
  try {
    const { stock } = req.body;
    const { db } = getDatabase();
    if (db) {
      await db.collection('config').updateOne(
        { key: 'stock' },
        { $set: { key: 'stock', status: stock, updatedAt: Date.now() } },
        { upsert: true }
      );
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
    console.log(`🍃 Connected exclusively to MongoDB Atlas`);
    console.log(`📡 Realtime SSE Order Stream at: /api/orders/stream`);
    console.log(`===============================================`);
  });
}

start();
