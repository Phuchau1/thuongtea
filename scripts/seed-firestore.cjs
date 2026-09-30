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

  console.log('\n🎉 Hoàn thành chuyển toàn bộ dữ liệu lên Firebase Firestore thành công!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Lỗi khi tải dữ liệu lên:', err);
  process.exit(1);
});
