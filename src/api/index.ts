import { db } from '../firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import type { PosOrder } from '../types/pos';
import type { MemberUser } from '../types/user';
import type { FruitTeaItem, Topping, DiningTable } from '../types/tea';
import type { StaffMember, AttendanceRecord } from '../types/staff';

/**
 * Lắng nghe đơn hàng Realtime từ Firestore (thay vì polling lặp lại liên tục)
 */
export function apiListenOrders(callback: (orders: PosOrder[]) => void): () => void {
  try {
    return onSnapshot(collection(db, 'orders'), (snap) => {
      const orders: PosOrder[] = [];
      snap.forEach((d) => orders.push(d.data() as PosOrder));
      if (orders.length > 0) {
        try {
          localStorage.setItem('AN_TRA_ORDERS', JSON.stringify(orders));
        } catch {}
        callback(orders);
      }
    }, (err) => {
      console.debug('Firestore onSnapshot listen error:', err);
    });
  } catch (err) {
    console.debug('apiListenOrders fallback error:', err);
    return () => {};
  }
}

/**
 * Lấy danh sách toàn bộ đơn hàng từ Firestore
 */
export async function apiGetOrders(): Promise<PosOrder[]> {
  try {
    const snap = await getDocs(collection(db, 'orders'));
    const orders: PosOrder[] = [];
    snap.forEach((d) => {
      orders.push(d.data() as PosOrder);
    });
    if (orders.length > 0) {
      try {
        localStorage.setItem('AN_TRA_ORDERS', JSON.stringify(orders));
      } catch {}
      return orders;
    }
  } catch (err) {
    console.debug('Firebase get orders fallback to localStorage', err);
  }
  try {
    const saved = localStorage.getItem('AN_TRA_ORDERS');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

/**
 * Tạo mới đơn hàng trên Firestore
 */
export async function apiCreateOrder(order: PosOrder): Promise<PosOrder> {
  try {
    const docId = order.id || `order-${Date.now()}`;
    await setDoc(doc(db, 'orders', docId), order);
  } catch (err) {
    console.debug('Firebase create order fallback', err);
  }
  return order;
}

/**
 * Check và nhận đơn 1 lần duy nhất (cập nhật checked: true, status: 'preparing')
 */
export async function apiCheckOrder(orderId: string): Promise<PosOrder | null> {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { checked: true, status: 'preparing' });
    const snap = await getDoc(orderRef);
    return snap.exists() ? (snap.data() as PosOrder) : null;
  } catch (err) {
    console.debug('Firebase check order fallback', err);
  }
  return null;
}

/**
 * Cập nhật thông tin đơn hàng trên Firestore
 */
export async function apiUpdateOrder(orderId: string, updates: Partial<PosOrder>): Promise<PosOrder | null> {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, updates);
    const snap = await getDoc(orderRef);
    return snap.exists() ? (snap.data() as PosOrder) : null;
  } catch (err) {
    console.debug('Firebase update order fallback', err);
  }
  return null;
}

/**
 * Xóa vĩnh viễn một đơn hàng khỏi Firestore
 */
export async function apiDeleteOrder(orderId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'orders', orderId));
  } catch (err) {
    console.debug('Firebase delete order fallback', err);
  }
}

/**
 * Xóa bỏ các đơn trùng lặp trên Firestore
 */
export async function apiClearDuplicateOrders(): Promise<PosOrder[]> {
  try {
    const snap = await getDocs(collection(db, 'orders'));
    const orders: PosOrder[] = [];
    const seen = new Set<string>();
    for (const docSnap of snap.docs) {
      const data = docSnap.data() as PosOrder;
      const key = `${data.tableNumber || ''}-${data.customer?.phone || ''}-${data.total || 0}-${(data.items || []).map((i) => i.cartItemId).join(',')}`;
      if (seen.has(key)) {
        await deleteDoc(doc(db, 'orders', docSnap.id));
      } else {
        seen.add(key);
        orders.push(data);
      }
    }
    return orders;
  } catch (err) {
    console.debug('Firebase clear duplicates fallback', err);
  }
  return [];
}

/**
 * Dọn trả bàn trống trên Firestore (đánh dấu tableCleared: true)
 */
export async function apiClearTable(tableNumber: string): Promise<void> {
  try {
    const snap = await getDocs(collection(db, 'orders'));
    for (const docSnap of snap.docs) {
      const data = docSnap.data() as PosOrder;
      if (data.tableNumber === tableNumber && data.status !== 'completed' && data.status !== 'cancelled') {
        await updateDoc(doc(db, 'orders', docSnap.id), { tableCleared: true });
      }
    }
  } catch (err) {
    console.debug('Firebase clear table fallback', err);
  }
}

/**
 * Lấy danh sách thành viên tích điểm từ Firestore
 */
export async function apiGetMembers(): Promise<MemberUser[]> {
  try {
    const snap = await getDocs(collection(db, 'members'));
    const members: MemberUser[] = [];
    snap.forEach((d) => members.push(d.data() as MemberUser));
    if (members.length > 0) {
      try {
        localStorage.setItem('AN_TRA_MEMBERS', JSON.stringify(members));
      } catch {}
      return members;
    }
  } catch (err) {}
  try {
    const saved = localStorage.getItem('AN_TRA_MEMBERS');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

/**
 * Lưu / cập nhật thành viên tích điểm lên Firestore
 */
export async function apiSaveMember(member: MemberUser): Promise<void> {
  try {
    const docId = member.id || member.phone;
    if (docId) {
      await setDoc(doc(db, 'members', String(docId)), member);
    }
  } catch (err) {}
}

/**
 * Lấy danh sách sản phẩm menu từ Firestore
 */
export async function apiGetProducts(): Promise<FruitTeaItem[]> {
  try {
    const snap = await getDoc(doc(db, 'config', 'products'));
    if (snap.exists() && Array.isArray(snap.data()?.list)) {
      return snap.data().list as FruitTeaItem[];
    }
  } catch (err) {}
  return [];
}

/**
 * Lưu danh sách sản phẩm menu lên Firestore
 */
export async function apiSaveProducts(products: FruitTeaItem[]): Promise<void> {
  try {
    await setDoc(doc(db, 'config', 'products'), { list: products });
  } catch (err) {}
}

/**
 * Lấy danh sách Topping từ Firestore
 */
export async function apiGetToppings(): Promise<Topping[]> {
  try {
    const snap = await getDoc(doc(db, 'config', 'toppings'));
    if (snap.exists() && Array.isArray(snap.data()?.list)) {
      return snap.data().list as Topping[];
    }
  } catch (err) {}
  try {
    const saved = localStorage.getItem('AN_TRA_TOPPINGS');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

/**
 * Lưu danh sách Topping lên Firestore
 */
export async function apiSaveToppings(toppings: Topping[]): Promise<void> {
  try {
    await setDoc(doc(db, 'config', 'toppings'), { list: toppings });
  } catch (err) {}
}

/**
 * Lấy danh sách Bàn từ Firestore
 */
export async function apiGetTables(): Promise<DiningTable[]> {
  try {
    const snap = await getDoc(doc(db, 'config', 'tables'));
    if (snap.exists() && Array.isArray(snap.data()?.list)) {
      return snap.data().list as DiningTable[];
    }
  } catch (err) {}
  try {
    const saved = localStorage.getItem('AN_TRA_TABLES');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

/**
 * Lưu danh sách Bàn lên Firestore
 */
export async function apiSaveTables(tables: DiningTable[]): Promise<void> {
  try {
    await setDoc(doc(db, 'config', 'tables'), { list: tables });
  } catch (err) {}
}

/**
 * Lấy danh sách Nhân viên từ Firestore
 */
export async function apiGetStaff(): Promise<StaffMember[]> {
  try {
    const snap = await getDoc(doc(db, 'config', 'staff'));
    if (snap.exists() && Array.isArray(snap.data()?.list)) {
      return snap.data().list as StaffMember[];
    }
  } catch (err) {}
  try {
    const saved = localStorage.getItem('AN_TRA_STAFF');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

/**
 * Lưu danh sách Nhân viên lên Firestore
 */
export async function apiSaveStaff(staff: StaffMember[]): Promise<void> {
  try {
    await setDoc(doc(db, 'config', 'staff'), { list: staff });
  } catch (err) {}
}

/**
 * Lấy danh sách Chấm công từ Firestore
 */
export async function apiGetAttendance(): Promise<AttendanceRecord[]> {
  try {
    const snap = await getDocs(collection(db, 'attendance'));
    const records: AttendanceRecord[] = [];
    snap.forEach((d) => records.push(d.data() as AttendanceRecord));
    if (records.length > 0) {
      try {
        localStorage.setItem('AN_TRA_ATTENDANCE', JSON.stringify(records));
      } catch {}
      return records;
    }
  } catch (err) {}
  try {
    const saved = localStorage.getItem('AN_TRA_ATTENDANCE');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

/**
 * Lưu bản ghi Chấm công lên Firestore
 */
export async function apiSaveAttendanceRecord(record: AttendanceRecord): Promise<void> {
  try {
    const docId = record.id || `att-${Date.now()}`;
    await setDoc(doc(db, 'attendance', String(docId)), record);
  } catch (err) {}
}

/**
 * Lấy trạng thái tồn kho từ Firestore
 */
export async function apiGetStock(): Promise<Record<string, boolean>> {
  try {
    const snap = await getDoc(doc(db, 'config', 'stock'));
    if (snap.exists() && snap.data()?.status) {
      return snap.data().status as Record<string, boolean>;
    }
  } catch (err) {}
  try {
    const saved = localStorage.getItem('AN_TRA_STOCK');
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

/**
 * Lưu trạng thái tồn kho lên Firestore
 */
export async function apiSaveStock(stock: Record<string, boolean>): Promise<void> {
  try {
    await setDoc(doc(db, 'config', 'stock'), { status: stock });
  } catch (err) {}
}

/**
 * Xóa thành viên khỏi Firestore
 */
export async function apiDeleteMember(memberId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'members', String(memberId)));
  } catch (err) {}
}


