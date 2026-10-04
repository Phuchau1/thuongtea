import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
import {
  INITIAL_ORDERS,
  INITIAL_MEMBERS,
  INITIAL_STAFF,
  INITIAL_TABLES,
  INITIAL_TOPPINGS,
  INITIAL_COUPONS
} from './initialData.js';

dotenv.config();

const uri = process.env.MONGODB_URI || '';
const dbName = process.env.MONGODB_DB_NAME || 'thuongtea';

let client = null;
let dbInstance = null;
let isConnecting = false;

// Tự động kiểm tra và di chuyển toàn bộ dữ liệu mẫu/localhost lên MongoDB Atlas nếu chưa có
export async function autoMigrateToMongo(db) {
  try {
    console.log('[MongoDB Atlas] Checking & syncing data into Atlas...');

    // 1. Đồng bộ Đơn Hàng (Orders)
    const ordersCount = await db.collection('orders').countDocuments();
    if (ordersCount === 0 && INITIAL_ORDERS.length > 0) {
      console.log(`[MongoDB Atlas] Migrating ${INITIAL_ORDERS.length} initial orders...`);
      for (const order of INITIAL_ORDERS) {
        await db.collection('orders').updateOne(
          { id: order.id },
          { $set: order },
          { upsert: true }
        );
      }
    }

    // 2. Đồng bộ Thành Viên (Members)
    const membersCount = await db.collection('members').countDocuments();
    if (membersCount === 0 && INITIAL_MEMBERS.length > 0) {
      console.log(`[MongoDB Atlas] Migrating ${INITIAL_MEMBERS.length} initial members...`);
      for (const mem of INITIAL_MEMBERS) {
        const cleanPhone = (mem.phone || '').replace(/\D/g, '');
        if (cleanPhone) {
          await db.collection('members').updateOne(
            { phone: cleanPhone },
            { $set: { ...mem, id: cleanPhone, phone: cleanPhone } },
            { upsert: true }
          );
        }
      }
    }

    // 3. Đồng bộ Bàn ăn (Tables)
    const tablesDoc = await db.collection('config').findOne({ key: 'tables' });
    if (!tablesDoc || !tablesDoc.list || tablesDoc.list.length === 0) {
      console.log('[MongoDB Atlas] Migrating 12 initial dining tables...');
      await db.collection('config').updateOne(
        { key: 'tables' },
        { $set: { key: 'tables', list: INITIAL_TABLES, updatedAt: Date.now() } },
        { upsert: true }
      );
    }

    // 4. Đồng bộ Toppings
    const toppingsDoc = await db.collection('config').findOne({ key: 'toppings' });
    if (!toppingsDoc || !toppingsDoc.list || toppingsDoc.list.length === 0) {
      console.log('[MongoDB Atlas] Migrating initial toppings...');
      await db.collection('config').updateOne(
        { key: 'toppings' },
        { $set: { key: 'toppings', list: INITIAL_TOPPINGS, updatedAt: Date.now() } },
        { upsert: true }
      );
    }

    // 5. Đồng bộ Nhân viên (Staff)
    const staffDoc = await db.collection('config').findOne({ key: 'staff' });
    if (!staffDoc || !staffDoc.list || staffDoc.list.length === 0) {
      console.log('[MongoDB Atlas] Migrating initial staff members...');
      await db.collection('config').updateOne(
        { key: 'staff' },
        { $set: { key: 'staff', list: INITIAL_STAFF, updatedAt: Date.now() } },
        { upsert: true }
      );
    }

    // 6. Đồng bộ Mã giảm giá (Coupons)
    const couponsDoc = await db.collection('config').findOne({ key: 'coupons' });
    if (!couponsDoc || !couponsDoc.list || couponsDoc.list.length === 0) {
      console.log('[MongoDB Atlas] Migrating initial coupons...');
      await db.collection('config').updateOne(
        { key: 'coupons' },
        { $set: { key: 'coupons', list: INITIAL_COUPONS, updatedAt: Date.now() } },
        { upsert: true }
      );
    }

    console.log('[MongoDB Atlas] All collections verified and ready on Atlas!');
  } catch (err) {
    console.error('[MongoDB Atlas] Auto migration check warning:', err.message);
  }
}

export async function connectToDatabase() {
  if (dbInstance) {
    return { db: dbInstance, isMongo: true };
  }

  if (!uri || uri.trim() === '') {
    console.warn('[MongoDB Atlas] MONGODB_URI chưa được cấu hình trong biến môi trường.');
    return { db: null, isMongo: false };
  }

  if (isConnecting) {
    await new Promise((r) => setTimeout(r, 200));
    if (dbInstance) return { db: dbInstance, isMongo: true };
  }

  isConnecting = true;
  try {
    console.log('[MongoDB Atlas] Connecting to cluster...');
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: false,
        deprecationErrors: true,
      },
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      maxPoolSize: 20,
    });

    await client.connect();
    dbInstance = client.db(dbName);
    console.log(`[MongoDB Atlas] ✅ Successfully connected to database: "${dbName}"!`);

    // Ensure unique indexes for fast lookups
    try {
      await dbInstance.collection('orders').createIndex({ id: 1 }, { unique: true });
      await dbInstance.collection('members').createIndex({ phone: 1 }, { unique: true });
      await dbInstance.collection('staff').createIndex({ id: 1 });
      await dbInstance.collection('attendance').createIndex({ id: 1 });
      await dbInstance.collection('config').createIndex({ key: 1 }, { unique: true });
    } catch (idxErr) {
      console.debug('[MongoDB Atlas] Indexes check/creation:', idxErr.message);
    }

    // Tự động chuyển toàn bộ dữ liệu mẫu lên MongoDB Atlas
    await autoMigrateToMongo(dbInstance);

    isConnecting = false;
    return { db: dbInstance, isMongo: true };
  } catch (err) {
    isConnecting = false;
    console.error('[MongoDB Atlas] Connection failed:', err.message);
    return { db: null, isMongo: false };
  }
}

export function getDatabase() {
  return { db: dbInstance, isMongo: !!dbInstance };
}
