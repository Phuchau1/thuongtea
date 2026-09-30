const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

const firebaseConfig = {
  apiKey: "AIzaSyDSFhTJFKnuHvtEUoVSeJ91paWZV00xRxU",
  authDomain: "thuongtea-80a0b.firebaseapp.com",
  projectId: "thuongtea-80a0b",
  storageBucket: "thuongtea-80a0b.firebasestorage.app",
  messagingSenderId: "469777387233",
  appId: "1:469777387233:web:c1049c78b5c98e0c63b1a0",
  measurementId: "G-JJ0N9JJCD8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const INITIAL_STAFF = [
  {
    id: 'NV-ADMIN-01',
    code: '1234',
    name: 'Nguyễn Hoàng An',
    role: 'admin',
    roleTitle: 'Chủ Quán / Quản Lý Cấp Cao',
    phone: '0908886688',
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

const INITIAL_ATTENDANCE = [
  {
    id: 'ATT-20260925-01',
    staffId: 'NV-CASHIER-01',
    staffCode: '1001',
    staffName: 'Trần Thu Trang',
    staffRole: 'cashier',
    roleTitle: 'Thu Ngân Đứng Quầy (Ca Sáng)',
    date: '25/09/2026',
    checkInTime: '07:30:12',
    checkOutTime: '15:35:45',
    status: 'completed',
    totalMinutes: 485,
    ordersHandled: 24,
    note: 'Hoàn thành ca sáng tốt, đối soát tiền mặt khớp 100%',
  },
  {
    id: 'ATT-20260925-02',
    staffId: 'NV-BARISTA-01',
    staffCode: '2001',
    staffName: 'Phạm Gia Huy',
    staffRole: 'barista',
    roleTitle: 'Trưởng Ca Pha Chế',
    date: '25/09/2026',
    checkInTime: '08:00:00',
    checkOutTime: '16:00:20',
    status: 'completed',
    totalMinutes: 480,
    ordersHandled: 36,
    note: 'Đã chuẩn bị đầy đủ syrup và thạch cho ca chiều',
  },
  {
    id: 'ATT-20260925-03',
    staffId: 'NV-CASHIER-02',
    staffCode: '1002',
    staffName: 'Lê Tuấn Kiệt',
    staffRole: 'cashier',
    roleTitle: 'Thu Ngân Đứng Quầy (Ca Chiều)',
    date: '25/09/2026',
    checkInTime: '15:30:05',
    status: 'in-shift',
    ordersHandled: 8,
    note: 'Đang trực quầy ca tối',
  },
];

async function seed() {
  console.log('🚀 Đang đọc file data/db.json...');
  const dbRaw = fs.readFileSync(path.resolve(__dirname, '../data/db.json'), 'utf-8');
  const dbData = JSON.parse(dbRaw);

  console.log('📦 1. Đang tải danh mục Thực đơn (products) lên Firestore...');
  if (dbData.products && dbData.products.length > 0) {
    await setDoc(doc(db, 'config', 'products'), { list: dbData.products });
    console.log(`✅ Đã tải ${dbData.products.length} món ăn/đồ uống.`);
  }

  console.log('📦 2. Đang tải danh sách Topping lên Firestore...');
  if (dbData.toppings && dbData.toppings.length > 0) {
    await setDoc(doc(db, 'config', 'toppings'), { list: dbData.toppings });
    console.log(`✅ Đã tải ${dbData.toppings.length} topping.`);
  }

  console.log('📦 3. Đang tải danh sách Bàn lên Firestore...');
  if (dbData.tables && dbData.tables.length > 0) {
    await setDoc(doc(db, 'config', 'tables'), { list: dbData.tables });
    console.log(`✅ Đã tải ${dbData.tables.length} bàn.`);
  }

  console.log('📦 4. Đang tải danh sách Thành viên (members) lên Firestore...');
  if (dbData.members && dbData.members.length > 0) {
    for (const member of dbData.members) {
      const docId = member.id || member.phone;
      if (docId) {
        await setDoc(doc(db, 'members', String(docId)), member);
      }
    }
    console.log(`✅ Đã tải ${dbData.members.length} thành viên.`);
  }

  console.log('📦 5. Đang tải danh sách Đơn hàng (orders) lên Firestore...');
  if (dbData.orders && dbData.orders.length > 0) {
    for (const order of dbData.orders) {
      if (order.id) {
        await setDoc(doc(db, 'orders', String(order.id)), order);
      }
    }
    console.log(`✅ Đã tải ${dbData.orders.length} đơn hàng.`);
  }

  console.log('📦 6. Đang tải danh sách Nhân viên (staff) lên Firestore...');
  await setDoc(doc(db, 'config', 'staff'), { list: INITIAL_STAFF });
  console.log(`✅ Đã lưu ${INITIAL_STAFF.length} tài khoản nhân viên vào cơ sở dữ liệu.`);

  console.log('📦 7. Đang tải lịch sử Chấm công (attendance) lên Firestore...');
  for (const record of INITIAL_ATTENDANCE) {
    if (record.id) {
      await setDoc(doc(db, 'attendance', String(record.id)), record);
    }
  }
  console.log(`✅ Đã lưu ${INITIAL_ATTENDANCE.length} bản ghi chấm công vào cơ sở dữ liệu.`);

  console.log('\n🎉 Hoàn thành chuyển toàn bộ dữ liệu lên Firebase Firestore thành công!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Lỗi khi tải dữ liệu lên:', err);
  process.exit(1);
});
