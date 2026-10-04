import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import {
  INITIAL_ORDERS,
  INITIAL_MEMBERS,
  INITIAL_STAFF,
  INITIAL_TABLES,
  INITIAL_TOPPINGS,
  INITIAL_COUPONS,
  INITIAL_PRODUCTS
} from '../server/initialData.js';

dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'thuongtea';

if (!uri) {
  console.error('❌ Lỗi: MONGODB_URI chưa được thiết lập!');
  console.log('👉 Vui lòng thêm MONGODB_URI vào file .env hoặc biến môi trường trước khi chạy.');
  process.exit(1);
}

async function seed() {
  console.log('🚀 Đang kết nối tới MongoDB Atlas...');
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    console.log(`✅ Kết nối thành công cơ sở dữ liệu: ${dbName}`);

    // 1. Cấu hình bảng config
    console.log('📦 Đang đồng bộ cấu hình (Sản phẩm menu, Bàn, Topping, Nhân viên, Mã giảm giá)...');
    await db.collection('config').updateOne(
      { key: 'products' },
      { $set: { key: 'products', list: INITIAL_PRODUCTS, updatedAt: Date.now() } },
      { upsert: true }
    );

    await db.collection('config').updateOne(
      { key: 'tables' },
      { $set: { key: 'tables', list: INITIAL_TABLES, updatedAt: Date.now() } },
      { upsert: true }
    );

    await db.collection('config').updateOne(
      { key: 'toppings' },
      { $set: { key: 'toppings', list: INITIAL_TOPPINGS, updatedAt: Date.now() } },
      { upsert: true }
    );

    await db.collection('config').updateOne(
      { key: 'staff' },
      { $set: { key: 'staff', list: INITIAL_STAFF, updatedAt: Date.now() } },
      { upsert: true }
    );

    await db.collection('config').updateOne(
      { key: 'coupons' },
      { $set: { key: 'coupons', list: INITIAL_COUPONS, updatedAt: Date.now() } },
      { upsert: true }
    );

    // 2. Thành viên
    console.log('👤 Đang đồng bộ danh sách thành viên tích điểm...');
    for (const m of INITIAL_MEMBERS) {
      const cleanPhone = (m.phone || '').replace(/\D/g, '');
      if (cleanPhone) {
        await db.collection('members').updateOne(
          { phone: cleanPhone },
          { $set: { ...m, id: cleanPhone, phone: cleanPhone } },
          { upsert: true }
        );
      }
    }

    // 3. Đơn hàng
    console.log(`🛒 Đang đồng bộ ${INITIAL_ORDERS.length} đơn hàng...`);
    for (const o of INITIAL_ORDERS) {
      if (o.id) {
        await db.collection('orders').updateOne(
          { id: o.id },
          { $set: o },
          { upsert: true }
        );
      }
    }

    // Tạo Index tăng tốc truy vấn
    console.log('⚡ Đang khởi tạo Indexes...');
    await db.collection('orders').createIndex({ id: 1 }, { unique: true });
    await db.collection('orders').createIndex({ createdTimestamp: -1 });
    await db.collection('members').createIndex({ phone: 1 }, { unique: true });
    await db.collection('config').createIndex({ key: 1 }, { unique: true });

    console.log('🎉 KHỞI TẠO DỮ LIỆU MONGODB ATLAS THÀNH CÔNG VÀ HOÀN TẤT!');
  } catch (err) {
    console.error('❌ Lỗi khi khởi tạo dữ liệu MongoDB Atlas:', err);
  } finally {
    await client.close();
  }
}

seed();
