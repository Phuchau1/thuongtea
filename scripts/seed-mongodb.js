import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'thuongtea';

if (!uri) {
  console.error('❌ Lỗi: MONGODB_URI chưa được thiết lập trong file .env!');
  console.log('👉 Vui lòng thêm MONGODB_URI vào file .env trước khi chạy seed.');
  process.exit(1);
}

// Lấy dữ liệu mẫu từ db.json hoặc cấu hình mặc định
const dataDir = path.resolve(process.cwd(), 'data');
const dbFile = path.resolve(dataDir, 'db.json');

let localData = { orders: [], members: [], products: [], toppings: [], tables: [], staff: [], attendance: [], coupons: [], stock: {} };
if (fs.existsSync(dbFile)) {
  try {
    localData = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
  } catch {}
}

const INITIAL_STAFF = [
  {
    id: 'NV-ADMIN-01',
    code: '1234',
    name: 'Ngô Thành Phúc Hậu',
    role: 'admin',
    roleTitle: 'Chủ Quán / Quản Lý Cấp Cao',
    phone: '0794999406',
    avatar: '👨‍💼',
    hourlyWage: 55000,
    isActive: true,
    createdAt: '01/01/2026',
  },
  {
    id: 'NV-CASHIER-01',
    code: '1001',
    name: 'Trần Thu Trang',
    role: 'cashier',
    roleTitle: 'Thu Ngân Đứng Quầy (Ca Sáng)',
    phone: '0938112233',
    avatar: '👩‍💼',
    hourlyWage: 28000,
    isActive: true,
    createdAt: '15/02/2026',
  },
  {
    id: 'NV-CASHIER-02',
    code: '1002',
    name: 'Lê Tuấn Kiệt',
    role: 'cashier',
    roleTitle: 'Thu Ngân Đứng Quầy (Ca Chiều)',
    phone: '0977223344',
    avatar: '🧑‍💼',
    hourlyWage: 28000,
    isActive: true,
    createdAt: '01/03/2026',
  },
  {
    id: 'NV-BARISTA-01',
    code: '2001',
    name: 'Phạm Gia Huy',
    role: 'barista',
    roleTitle: 'Trưởng Ca Pha Chế',
    phone: '0912445566',
    avatar: '👨‍🍳',
    hourlyWage: 32000,
    isActive: true,
    createdAt: '10/01/2026',
  },
];

const INITIAL_MEMBERS = [
  {
    id: '0908123456',
    name: 'Nguyễn Thùy Linh',
    phone: '0908123456',
    tier: 'gold',
    points: 450,
    totalSpent: 4500000,
    joinedDate: '10/01/2026',
  },
  {
    id: '0933888999',
    name: 'Trần Minh Quân',
    phone: '0933888999',
    tier: 'silver',
    points: 180,
    totalSpent: 1800000,
    joinedDate: '15/02/2026',
  },
  {
    id: '0977654321',
    name: 'Lê Hoàng Yến',
    phone: '0977654321',
    tier: 'platinum',
    points: 820,
    totalSpent: 8200000,
    joinedDate: '01/12/2025',
  },
];

const INITIAL_TABLES = Array.from({ length: 12 }, (_, i) => {
  const num = String(i + 1).padStart(2, '0');
  const isFloor2 = i >= 6;
  return {
    id: `tbl-${num}`,
    name: `Bàn ${num}`,
    zone: isFloor2 ? 'Tầng 2 (Ban công)' : 'Tầng 1 (Trong nhà)',
    capacity: i === 11 ? 8 : i % 2 === 0 ? 4 : 2,
    isActive: true,
    notes: isFloor2 ? 'View thoáng ban công lộng gió' : 'Không gian ấm cúng trong nhà',
  };
});

const INITIAL_COUPONS = [
  {
    id: 'cp-welcome',
    code: 'THUONGTEA10',
    title: 'Giảm 10% Cho Khách Hàng Mới',
    description: 'Giảm 10% tối đa 30.000đ cho đơn hàng từ 50.000đ',
    type: 'percentage',
    value: 10,
    maxDiscount: 30000,
    minOrderTotal: 50000,
    isActive: true,
    usageLimit: 500,
    usedCount: 42,
    expiryDate: '31/12/2026',
  },
  {
    id: 'cp-freeship',
    code: 'FREESHIP20',
    title: 'Miễn Phí Giao Hàng',
    description: 'Giảm trực tiếp 20.000đ phí giao hàng cho đơn từ 100.000đ',
    type: 'fixed',
    value: 20000,
    minOrderTotal: 100000,
    isActive: true,
    usageLimit: 200,
    usedCount: 88,
    expiryDate: '31/12/2026',
  },
];

async function seed() {
  console.log('🚀 Đang kết nối tới MongoDB Atlas...');
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    console.log(`✅ Kết nối thành công cơ sở dữ liệu: ${dbName}`);

    // 1. Cấu hình bảng config
    console.log('📦 Đang đồng bộ cấu hình (Bàn, Nhân viên, Mã giảm giá)...');
    await db.collection('config').updateOne(
      { key: 'tables' },
      { $set: { key: 'tables', list: (localData.tables && localData.tables.length > 0) ? localData.tables : INITIAL_TABLES, updatedAt: Date.now() } },
      { upsert: true }
    );

    await db.collection('config').updateOne(
      { key: 'staff' },
      { $set: { key: 'staff', list: (localData.staff && localData.staff.length > 0) ? localData.staff : INITIAL_STAFF, updatedAt: Date.now() } },
      { upsert: true }
    );

    await db.collection('config').updateOne(
      { key: 'coupons' },
      { $set: { key: 'coupons', list: (localData.coupons && localData.coupons.length > 0) ? localData.coupons : INITIAL_COUPONS, updatedAt: Date.now() } },
      { upsert: true }
    );

    // 2. Thành viên
    console.log('👤 Đang đồng bộ danh sách thành viên tích điểm...');
    const membersToSeed = (localData.members && localData.members.length > 0) ? localData.members : INITIAL_MEMBERS;
    for (const m of membersToSeed) {
      const cleanPhone = (m.phone || '').replace(/\D/g, '');
      if (cleanPhone) {
        await db.collection('members').updateOne(
          { phone: cleanPhone },
          { $set: { ...m, id: cleanPhone, phone: cleanPhone } },
          { upsert: true }
        );
      }
    }

    // 3. Đơn hàng (nếu có từ db.json)
    if (localData.orders && localData.orders.length > 0) {
      console.log(`🛒 Đang đồng bộ ${localData.orders.length} đơn hàng...`);
      for (const o of localData.orders) {
        if (o.id) {
          await db.collection('orders').updateOne(
            { id: o.id },
            { $set: o },
            { upsert: true }
          );
        }
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
