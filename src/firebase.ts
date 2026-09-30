import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDSFhTJFKnuHvtEUoVSeJ91paWZV00xRxU",
  authDomain: "thuongtea-80a0b.firebaseapp.com",
  projectId: "thuongtea-80a0b",
  storageBucket: "thuongtea-80a0b.firebasestorage.app",
  messagingSenderId: "469777387233",
  appId: "1:469777387233:web:c1049c78b5c98e0c63b1a0",
  measurementId: "G-JJ0N9JJCD8"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo Firestore Database
export const db = getFirestore(app);
