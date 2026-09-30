import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import type { PosOrder, OrderStatus, MenuItemStockStatus } from '../types/pos';
import type { MemberUser } from '../types/user';
import { INITIAL_MEMBERS } from '../types/user';
import type { FruitTeaItem, Topping, DiningTable } from '../types/tea';
import { FRUIT_TEAS, TOPPINGS, INITIAL_TABLES } from '../data/teas';
import type { StaffMember, AttendanceRecord } from '../types/staff';
import { INITIAL_STAFF, INITIAL_ATTENDANCE } from '../types/staff';
import type { Coupon } from '../types/coupon';
import { INITIAL_COUPONS } from '../types/coupon';
import { 
  apiGetOrders, 
  apiCreateOrder, 
  apiUpdateOrder, 
  apiCheckOrder, 
  apiClearTable,
  apiClearDuplicateOrders,
  apiGetMembers,
  apiSaveMember,
  apiGetProducts,
  apiSaveProducts,
  apiGetToppings,
  apiSaveToppings,
  apiGetTables,
  apiSaveTables,
  apiListenOrders,
  apiGetStaff,
  apiSaveStaff,
  apiGetAttendance,
  apiSaveAttendanceRecord,
  apiDeleteOrder,
  apiGetStock,
  apiSaveStock,
  apiDeleteMember,
  apiGetCoupons,
  apiSaveCoupons
} from '../api';

interface OrderContextType {
  orders: PosOrder[];
  addOrder: (order: PosOrder) => void;
  deleteOrder: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updatePaymentStatus: (orderId: string, paymentStatus: 'paid' | 'unpaid') => void;
  updateOrder: (orderId: string, updated: Partial<PosOrder>) => void;
  markOrderAsChecked: (orderId: string) => void;
  clearDuplicateOrders: () => void;
  stockStatus: MenuItemStockStatus;
  toggleStock: (teaId: string) => void;
  activeCustomerOrder: PosOrder | null;
  setActiveCustomerOrderId: (id: string | null) => void;
  unreadPosOrdersCount: number;
  markPosOrdersAsRead: () => void;
  
  // Quản lý sản phẩm (Thêm / Sửa / Xóa)
  products: FruitTeaItem[];
  addProduct: (product: FruitTeaItem) => void;
  updateProduct: (id: string, updated: Partial<FruitTeaItem>) => void;
  deleteProduct: (id: string) => void;
  resetProductsToDefault: () => void;

  // Quản lý Topping & Phụ Liệu (Thêm / Sửa / Xóa)
  toppings: Topping[];
  addTopping: (topping: Topping) => void;
  updateTopping: (id: string, updated: Partial<Topping>) => void;
  deleteTopping: (id: string) => void;
  toggleToppingAvailability: (id: string) => void;
  resetToppingsToDefault: () => void;

  // Quản lý Bàn (Thêm / Sửa / Xóa)
  tables: DiningTable[];
  allTablesList: string[]; // Danh sách tên bàn active: ['Bàn 01', 'Bàn 02', ...]
  addTable: (table: DiningTable) => void;
  updateTable: (id: string, updated: Partial<DiningTable>) => void;
  deleteTable: (id: string) => { success: boolean; message?: string };
  resetTablesToDefault: () => void;

  // Tích Điểm & Thành Viên
  currentUser: MemberUser | null;
  members: MemberUser[];
  loginMember: (phone: string, name?: string) => MemberUser;
  logoutMember: () => void;
  addPointsToMember: (phone: string, points: number, spentAmount: number) => void;
  deductPointsFromMember: (phone: string, points: number) => boolean;
  addMember: (member: MemberUser) => void;
  updateMember: (phone: string, updated: Partial<MemberUser>) => void;
  adjustMemberPoints: (phone: string, pointsDelta: number) => void;
  deleteMember: (phone: string) => void;

  // Quản lý Mã Giảm Giá & Voucher
  coupons: Coupon[];
  addCoupon: (coupon: Coupon) => void;
  updateCoupon: (id: string, updated: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;
  toggleCouponActive: (id: string) => void;
  validateCoupon: (code: string, orderTotal: number) => { valid: boolean; discount: number; message: string; coupon?: Coupon };

  // Quản lý Nhân Viên & Phân Quyền
  staffMembers: StaffMember[];
  currentStaff: StaffMember | null;
  loginStaff: (code: string) => { success: boolean; staff?: StaffMember; message?: string };
  logoutStaff: () => void;
  addStaffMember: (staff: StaffMember) => void;
  updateStaffMember: (id: string, updated: Partial<StaffMember>) => void;
  deleteStaffMember: (id: string) => void;

  // Chấm Công Nhân Viên Bằng Mã Code
  attendanceRecords: AttendanceRecord[];
  clockIn: (staffCode: string) => { success: boolean; message: string; record?: AttendanceRecord };
  clockOut: (staffCode: string, note?: string) => { success: boolean; message: string; record?: AttendanceRecord };

  // Quét Mã QR Bàn
  scannedTable: string | null;
  setScannedTable: (table: string | null) => void;

  // Quản Lý Trạng Thái Bàn
  getTableStatus: (tableId: string) => 'available' | 'occupied_unpaid' | 'occupied_paid';
  getTableOrder: (tableId: string) => PosOrder | null;
  clearTable: (tableId: string) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Initial sample orders so the POS screen is ready to demo right away
const INITIAL_DEMO_ORDERS: PosOrder[] = [
  {
    id: 'AT-812044',
    orderNumber: 101,
    createdAt: new Date(Date.now() - 12 * 60000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    customer: {
      name: 'Nguyễn Thùy Linh',
      phone: '0908123456',
      address: 'Phòng 402, Tòa nhà Landmark 81, Bình Thạnh',
      servingType: 'delivery',
      paymentMethod: 'vietqr',
      deliveryTime: 'now',
      note: 'Giao lên lễ tân giúp mình'
    },
    orderType: 'delivery',
    items: [
      {
        cartItemId: 'sample-1',
        tea: {
          id: 'tea-01',
          name: 'Trà Đào Cam Sả Hoàng Gia',
          subtitle: 'PEACH ORANGE LEMONGRASS',
          tagline: 'Vị ngọt thanh đào giòn',
          price: 49000,
          category: 'signature',
          image: '/teas/tra-dao-cam-sa.png',
          bg: '#D95D39',
          panel: '#F18F01',
          description: '',
          ingredients: [],
          calories: 145,
          sweetnessDefault: 70,
          iceDefault: 70,
          flavorNotes: []
        },
        size: 'L',
        sugar: 50,
        ice: 70,
        toppings: [{ id: 't1', name: 'Trân châu trắng 3Q giòn', price: 10000 }],
        quantity: 2,
        unitPrice: 67000,
        totalPrice: 134000,
        note: 'Ít ngọt'
      }
    ],
    subtotal: 134000,
    shippingFee: 0,
    discount: 20000,
    total: 114000,
    status: 'preparing',
    paymentStatus: 'paid'
  },
  {
    id: 'AT-812045',
    orderNumber: 102,
    createdAt: new Date(Date.now() - 4 * 60000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    customer: {
      name: 'Trần Minh Quân',
      phone: '0933888999',
      address: 'Bàn số 04 (Tại quán)',
      servingType: 'dine-in',
      tableNumber: 'Bàn 04',
      paymentMethod: 'cod',
      deliveryTime: 'now',
      note: 'Cho mình xin thêm 1 ly đá riêng'
    },
    orderType: 'dine-in',
    tableNumber: 'Bàn 04',
    items: [
      {
        cartItemId: 'sample-2',
        tea: {
          id: 'tea-02',
          name: 'Trà Dâu Tây Tươi Đà Lạt',
          subtitle: 'FRESH STRAWBERRY TEA',
          tagline: 'Sắc đỏ dâu tây tươi',
          price: 52000,
          category: 'fruit-tea',
          image: '/teas/tra-dau-tay-nhiet-doi.png',
          bg: '#C1121F',
          panel: '#E63946',
          description: '',
          ingredients: [],
          calories: 160,
          sweetnessDefault: 70,
          iceDefault: 70,
          flavorNotes: []
        },
        size: 'M',
        sugar: 70,
        ice: 70,
        toppings: [],
        quantity: 1,
        unitPrice: 52000,
        totalPrice: 52000
      }
    ],
    subtotal: 52000,
    shippingFee: 0,
    discount: 0,
    total: 52000,
    status: 'pending',
    paymentStatus: 'unpaid'
  }
];

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<PosOrder[]>(() => {
    try {
      const saved = localStorage.getItem('AN_TRA_ORDERS');
      return saved ? JSON.parse(saved) : INITIAL_DEMO_ORDERS;
    } catch {
      return INITIAL_DEMO_ORDERS;
    }
  });

  const [stockStatus, setStockStatus] = useState<MenuItemStockStatus>(() => {
    try {
      const saved = localStorage.getItem('AN_TRA_STOCK');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [activeCustomerOrderId, setActiveCustomerOrderId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('AN_TRA_ACTIVE_ORDER') || null;
    } catch {
      return null;
    }
  });

  const [unreadPosOrdersCount, setUnreadPosOrdersCount] = useState<number>(0);

  // 1. Quản lý Sản Phẩm Menu (Thêm / Sửa / Xóa)
  const [products, setProducts] = useState<FruitTeaItem[]>(() => {
    try {
      const saved = localStorage.getItem('AN_TRA_PRODUCTS');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= FRUIT_TEAS.length) {
          return parsed;
        }
      }
      return FRUIT_TEAS;
    } catch {
      return FRUIT_TEAS;
    }
  });

  // 1b. Quản lý Topping & Phụ Liệu (Thêm / Sửa / Xóa)
  const [toppings, setToppings] = useState<Topping[]>(() => {
    try {
      const saved = localStorage.getItem('AN_TRA_TOPPINGS');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      return TOPPINGS;
    } catch {
      return TOPPINGS;
    }
  });

  // 1c. Quản lý Bàn Ăn / Sơ Đồ Bàn (Thêm / Sửa / Xóa)
  const [tables, setTables] = useState<DiningTable[]>(() => {
    try {
      const saved = localStorage.getItem('AN_TRA_TABLES');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      return INITIAL_TABLES;
    } catch {
      return INITIAL_TABLES;
    }
  });

  // Danh sách tên bàn đang hoạt động
  const allTablesList = useMemo(() => {
    return tables.filter((t) => t.isActive !== false).map((t) => t.name);
  }, [tables]);

  // 2. Danh sách Thành viên & Điểm tích lũy (Chuẩn hóa duy nhất 1 số điện thoại = 1 tài khoản)
  const [members, setMembers] = useState<MemberUser[]>(() => {
    try {
      const saved = localStorage.getItem('AN_TRA_MEMBERS');
      const memMap = new Map<string, MemberUser>();
      if (saved) {
        const parsed: MemberUser[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach((m) => {
            const p = (m.phone || '').replace(/\D/g, '');
            if (p) {
              if (!memMap.has(p)) {
                memMap.set(p, { ...m, id: p, phone: p });
              } else {
                const ex = memMap.get(p)!;
                const higher = (m.totalSpent || 0) >= (ex.totalSpent || 0) ? m : ex;
                memMap.set(p, {
                  ...higher,
                  id: p,
                  phone: p,
                  points: Math.max(m.points || 0, ex.points || 0),
                  totalSpent: Math.max(m.totalSpent || 0, ex.totalSpent || 0),
                });
              }
            }
          });
        }
      }
      // Bổ sung các thành viên mẫu nếu chưa có
      INITIAL_MEMBERS.forEach((im) => {
        const p = im.phone.replace(/\D/g, '');
        if (p && !memMap.has(p)) {
          memMap.set(p, { ...im, id: p, phone: p });
        }
      });
      const res = Array.from(memMap.values());
      try { localStorage.setItem('AN_TRA_MEMBERS', JSON.stringify(res)); } catch {}
      return res;
    } catch {
      return INITIAL_MEMBERS;
    }
  });

  // Thành viên đang đăng nhập (khách hàng)
  const [currentUser, setCurrentUser] = useState<MemberUser | null>(() => {
    try {
      const saved = localStorage.getItem('AN_TRA_CURRENT_USER');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // 3. Quản lý Nhân Viên Đứng Quầy & Phân Quyền
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(() => {
    try {
      const saved = localStorage.getItem('AN_TRA_STAFF');
      return saved ? JSON.parse(saved) : INITIAL_STAFF;
    } catch {
      return INITIAL_STAFF;
    }
  });

  // Nhân viên đang đăng nhập làm việc tại quầy
  const [currentStaff, setCurrentStaff] = useState<StaffMember | null>(() => {
    try {
      const saved = localStorage.getItem('AN_TRA_CURRENT_STAFF');
      if (saved) return JSON.parse(saved);
      return INITIAL_STAFF[0]; // Mặc định Admin
    } catch {
      return INITIAL_STAFF[0];
    }
  });

  // 4. Quản lý Chấm Công
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem('AN_TRA_ATTENDANCE');
      return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
    } catch {
      return INITIAL_ATTENDANCE;
    }
  });

  // Mã bàn được quét từ QR (ví dụ 'Bàn 03')
  const [scannedTable, setScannedTable] = useState<string | null>(() => {
    try {
      return localStorage.getItem('AN_TRA_SCANNED_TABLE') || null;
    } catch {
      return null;
    }
  });

  // 5. Quản lý Mã Giảm Giá & Voucher
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem('AN_TRA_COUPONS');
      return saved ? JSON.parse(saved) : INITIAL_COUPONS;
    } catch {
      return INITIAL_COUPONS;
    }
  });

  const isInitialFirestoreLoadedRef = useRef(false);

  // Tự động tải dữ liệu từ Firestore khi khởi động (bảo đảm không bị ghi đè dữ liệu cũ)
  useEffect(() => {
    Promise.allSettled([
      apiGetOrders(),
      apiGetMembers(),
      apiGetProducts(),
      apiGetToppings(),
      apiGetTables(),
      apiGetStaff(),
      apiGetAttendance(),
      apiGetStock(),
      apiGetCoupons()
    ]).then(([ordersRes, membersRes, prodsRes, topsRes, tabsRes, staffRes, attRes, stockRes, couponsRes]) => {
      if (ordersRes.status === 'fulfilled' && ordersRes.value && ordersRes.value.length > 0) {
        setOrders(ordersRes.value);
      }
      if (membersRes.status === 'fulfilled' && membersRes.value && membersRes.value.length > 0) {
        const memMap = new Map<string, MemberUser>();
        membersRes.value.forEach((m) => {
          const p = (m.phone || '').replace(/\D/g, '');
          if (p) {
            if (!memMap.has(p)) {
              memMap.set(p, { ...m, id: p, phone: p });
            } else {
              const ex = memMap.get(p)!;
              const higher = (m.totalSpent || 0) >= (ex.totalSpent || 0) ? m : ex;
              memMap.set(p, {
                ...higher,
                id: p,
                phone: p,
                points: Math.max(m.points || 0, ex.points || 0),
                totalSpent: Math.max(m.totalSpent || 0, ex.totalSpent || 0),
              });
            }
          }
        });
        const cleanMembers = Array.from(memMap.values());
        setMembers(cleanMembers);
        try { localStorage.setItem('AN_TRA_MEMBERS', JSON.stringify(cleanMembers)); } catch {}
      }
      if (prodsRes.status === 'fulfilled' && prodsRes.value && prodsRes.value.length > 0) {
        setProducts(prodsRes.value);
      }
      if (topsRes.status === 'fulfilled' && topsRes.value && topsRes.value.length > 0) {
        setToppings(topsRes.value);
      }
      if (tabsRes.status === 'fulfilled' && tabsRes.value && tabsRes.value.length > 0) {
        setTables(tabsRes.value);
      }
      if (staffRes.status === 'fulfilled' && staffRes.value && staffRes.value.length > 0) {
        setStaffMembers(staffRes.value);
        setCurrentStaff((curr) => {
          if (!curr) return staffRes.value[0];
          const matched = staffRes.value.find((s) => s.id === curr.id || s.code === curr.code);
          return matched ? { ...curr, ...matched } : staffRes.value[0];
        });
      }
      if (attRes.status === 'fulfilled' && attRes.value && attRes.value.length > 0) {
        setAttendanceRecords(attRes.value);
      }
      if (stockRes.status === 'fulfilled' && stockRes.value && Object.keys(stockRes.value).length > 0) {
        setStockStatus(stockRes.value);
      }
      if (couponsRes.status === 'fulfilled' && couponsRes.value && couponsRes.value.length > 0) {
        setCoupons(couponsRes.value);
      }
      // Đánh dấu đã tải xong toàn bộ dữ liệu từ Firestore
      isInitialFirestoreLoadedRef.current = true;
    });
  }, []);

  // Đồng bộ Realtime từ Firebase Firestore (WebSocket realtime không chiếm băng thông)
  useEffect(() => {
    const unsub = apiListenOrders((newOrders) => {
      if (newOrders && newOrders.length > 0) {
        setOrders(newOrders);
      }
    });
    return () => unsub();
  }, []);

  // Lưu localStorage mỗi khi thay đổi
  useEffect(() => {
    try {
      localStorage.setItem('AN_TRA_ORDERS', JSON.stringify(orders));
    } catch (e) {
      console.warn('Could not save orders', e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('AN_TRA_STOCK', JSON.stringify(stockStatus));
      if (isInitialFirestoreLoadedRef.current) {
        apiSaveStock(stockStatus);
      }
    } catch (e) {
      console.warn('Could not save stock', e);
    }
  }, [stockStatus]);

  useEffect(() => {
    if (activeCustomerOrderId) {
      localStorage.setItem('AN_TRA_ACTIVE_ORDER', activeCustomerOrderId);
    }
  }, [activeCustomerOrderId]);

  useEffect(() => {
    try {
      localStorage.setItem('AN_TRA_PRODUCTS', JSON.stringify(products));
      if (isInitialFirestoreLoadedRef.current) {
        apiSaveProducts(products);
      }
    } catch (e) {
      console.warn('Could not save products', e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('AN_TRA_TOPPINGS', JSON.stringify(toppings));
      if (isInitialFirestoreLoadedRef.current) {
        apiSaveToppings(toppings);
      }
    } catch (e) {
      console.warn('Could not save toppings', e);
    }
  }, [toppings]);

  useEffect(() => {
    try {
      localStorage.setItem('AN_TRA_TABLES', JSON.stringify(tables));
      if (isInitialFirestoreLoadedRef.current) {
        apiSaveTables(tables);
      }
    } catch (e) {
      console.warn('Could not save tables', e);
    }
  }, [tables]);

  useEffect(() => {
    try {
      localStorage.setItem('AN_TRA_MEMBERS', JSON.stringify(members));
      if (isInitialFirestoreLoadedRef.current) {
        members.forEach((m) => apiSaveMember(m));
      }
    } catch (e) {
      console.warn('Could not save members', e);
    }
  }, [members]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('AN_TRA_CURRENT_USER', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('AN_TRA_CURRENT_USER');
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem('AN_TRA_STAFF', JSON.stringify(staffMembers));
      if (isInitialFirestoreLoadedRef.current) {
        apiSaveStaff(staffMembers);
      }
    } catch (e) {
      console.warn('Could not save staff', e);
    }
  }, [staffMembers]);

  useEffect(() => {
    if (currentStaff) {
      localStorage.setItem('AN_TRA_CURRENT_STAFF', JSON.stringify(currentStaff));
    } else {
      localStorage.removeItem('AN_TRA_CURRENT_STAFF');
    }
  }, [currentStaff]);

  useEffect(() => {
    try {
      localStorage.setItem('AN_TRA_ATTENDANCE', JSON.stringify(attendanceRecords));
    } catch (e) {
      console.warn('Could not save attendance', e);
    }
  }, [attendanceRecords]);

  useEffect(() => {
    if (scannedTable) {
      localStorage.setItem('AN_TRA_SCANNED_TABLE', scannedTable);
    } else {
      localStorage.removeItem('AN_TRA_SCANNED_TABLE');
    }
  }, [scannedTable]);

  useEffect(() => {
    try {
      localStorage.setItem('AN_TRA_COUPONS', JSON.stringify(coupons));
      if (isInitialFirestoreLoadedRef.current) {
        apiSaveCoupons(coupons);
      }
    } catch (e) {
      console.warn('Could not save coupons', e);
    }
  }, [coupons]);

  // BroadcastChannel & Storage Event để đồng bộ Realtime đa tab
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'AN_TRA_MEMBERS' && e.newValue) {
        try { setMembers(JSON.parse(e.newValue)); } catch {}
      } else if (e.key === 'AN_TRA_CURRENT_USER' && e.newValue) {
        try { setCurrentUser(JSON.parse(e.newValue)); } catch {}
      } else if (e.key === 'AN_TRA_ORDERS' && e.newValue) {
        try { setOrders(JSON.parse(e.newValue)); } catch {}
      } else if (e.key === 'AN_TRA_TOPPINGS' && e.newValue) {
        try { setToppings(JSON.parse(e.newValue)); } catch {}
      } else if (e.key === 'AN_TRA_TABLES' && e.newValue) {
        try { setTables(JSON.parse(e.newValue)); } catch {}
      } else if (e.key === 'AN_TRA_COUPONS' && e.newValue) {
        try { setCoupons(JSON.parse(e.newValue)); } catch {}
      } else if (e.key === 'AN_TRA_STAFF' && e.newValue) {
        try {
          const list = JSON.parse(e.newValue);
          setStaffMembers(list);
          setCurrentStaff((curr) => {
            if (!curr) return null;
            const matched = list.find((s: StaffMember) => s.id === curr.id || s.code === curr.code);
            return matched ? { ...curr, ...matched } : curr;
          });
        } catch {}
      } else if (e.key === 'AN_TRA_CURRENT_STAFF' && e.newValue) {
        try { setCurrentStaff(JSON.parse(e.newValue)); } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);

    let channel: BroadcastChannel | null = null;
    if ('BroadcastChannel' in window) {
      channel = new BroadcastChannel('AN_TRA_CHANNEL');
      channel.onmessage = (event) => {
        const { type, payload } = event.data;
        if (type === 'NEW_ORDER') {
          setOrders((prev) => [payload, ...prev.filter((o) => o.id !== payload.id)]);
          setUnreadPosOrdersCount((c) => c + 1);
        } else if (type === 'DELETE_ORDER') {
          setOrders((prev) => prev.filter((o) => o.id !== payload));
        } else if (type === 'UPDATE_STATUS') {
          setOrders((prev) =>
            prev.map((o) => (o.id === payload.orderId ? { ...o, status: payload.status } : o))
          );
        } else if (type === 'UPDATE_PAYMENT') {
          setOrders((prev) =>
            prev.map((o) => (o.id === payload.orderId ? { ...o, paymentStatus: payload.paymentStatus } : o))
          );
        } else if (type === 'UPDATE_ORDER') {
          setOrders((prev) =>
            prev.map((o) => (o.id === payload.orderId ? { ...o, ...payload.updated } : o))
          );
        } else if (type === 'CHECK_ORDER') {
          setOrders((prev) =>
            prev.map((o) => (o.id === payload.orderId ? { ...o, checked: true, status: 'preparing', checkedAt: payload.checkedAt } : o))
          );
        } else if (type === 'CLEAR_DUPLICATES') {
          setOrders(payload);
        } else if (type === 'UPDATE_STOCK') {
          setStockStatus(payload);
        } else if (type === 'UPDATE_PRODUCTS') {
          setProducts(payload);
        } else if (type === 'UPDATE_TOPPINGS') {
          setToppings(payload);
        } else if (type === 'UPDATE_TABLES') {
          setTables(payload);
        } else if (type === 'UPDATE_COUPONS') {
          setCoupons(payload);
          try {
            localStorage.setItem('AN_TRA_COUPONS', JSON.stringify(payload));
          } catch {}
        } else if (type === 'UPDATE_STAFF') {
          const list = payload as StaffMember[];
          setStaffMembers(list);
          try {
            localStorage.setItem('AN_TRA_STAFF', JSON.stringify(list));
          } catch {}
          setCurrentStaff((curr) => {
            if (!curr) return null;
            const matched = list.find((s) => s.id === curr.id || s.code === curr.code);
            return matched ? { ...curr, ...matched } : curr;
          });
        } else if (type === 'UPDATE_CURRENT_STAFF') {
          setCurrentStaff(payload as StaffMember);
          try {
            localStorage.setItem('AN_TRA_CURRENT_STAFF', JSON.stringify(payload));
          } catch {}
        } else if (type === 'UPDATE_MEMBERS') {
          setMembers(payload);
        } else if (type === 'UPDATE_CURRENT_USER') {
          setCurrentUser(payload);
        } else if (type === 'CLEAR_TABLE') {
          setOrders((prev) =>
            prev.map((o) =>
              o.tableNumber === payload && !o.tableCleared
                ? { ...o, tableCleared: true, paymentStatus: 'paid' }
                : o
            )
          );
        }
      };
    }

    return () => {
      window.removeEventListener('storage', handleStorage);
      if (channel) channel.close();
    };
  }, []);

  const broadcast = (type: string, payload: unknown) => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const channel = new BroadcastChannel('AN_TRA_CHANNEL');
        channel.postMessage({ type, payload });
        channel.close();
      } catch (e) {
        console.warn('BroadcastChannel error', e);
      }
    }
  };

  // ==========================================
  // THAO TÁC SẢN PHẨM (THÊM / SỬA / XÓA)
  // ==========================================
  const addProduct = (newProduct: FruitTeaItem) => {
    setProducts((prev) => {
      const updated = [newProduct, ...prev];
      broadcast('UPDATE_PRODUCTS', updated);
      apiSaveProducts(updated);
      return updated;
    });
  };

  const updateProduct = (id: string, updated: Partial<FruitTeaItem>) => {
    setProducts((prev) => {
      const updatedList = prev.map((item) => (item.id === id ? { ...item, ...updated } : item));
      broadcast('UPDATE_PRODUCTS', updatedList);
      apiSaveProducts(updatedList);
      return updatedList;
    });
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => {
      const updatedList = prev.filter((item) => item.id !== id);
      broadcast('UPDATE_PRODUCTS', updatedList);
      apiSaveProducts(updatedList);
      return updatedList;
    });
  };

  const resetProductsToDefault = () => {
    setProducts(FRUIT_TEAS);
    broadcast('UPDATE_PRODUCTS', FRUIT_TEAS);
    apiSaveProducts(FRUIT_TEAS);
  };

  // ==========================================
  // THAO TÁC TOPPING & PHỤ LIỆU (THÊM / SỬA / XÓA)
  // ==========================================
  const addTopping = (newTopping: Topping) => {
    setToppings((prev) => {
      const updated = [...prev, newTopping];
      broadcast('UPDATE_TOPPINGS', updated);
      apiSaveToppings(updated);
      return updated;
    });
  };

  const updateTopping = (id: string, updated: Partial<Topping>) => {
    setToppings((prev) => {
      const updatedList = prev.map((item) => (item.id === id ? { ...item, ...updated } : item));
      broadcast('UPDATE_TOPPINGS', updatedList);
      apiSaveToppings(updatedList);
      return updatedList;
    });
  };

  const deleteTopping = (id: string) => {
    setToppings((prev) => {
      const updatedList = prev.filter((item) => item.id !== id);
      broadcast('UPDATE_TOPPINGS', updatedList);
      apiSaveToppings(updatedList);
      return updatedList;
    });
  };

  const toggleToppingAvailability = (id: string) => {
    setToppings((prev) => {
      const updatedList = prev.map((item) =>
        item.id === id ? { ...item, isAvailable: item.isAvailable === false ? true : false } : item
      );
      broadcast('UPDATE_TOPPINGS', updatedList);
      apiSaveToppings(updatedList);
      return updatedList;
    });
  };

  const resetToppingsToDefault = () => {
    setToppings(TOPPINGS);
    broadcast('UPDATE_TOPPINGS', TOPPINGS);
    apiSaveToppings(TOPPINGS);
  };

  // ==========================================
  // THÀNH VIÊN & TÍCH ĐIỂM
  // ==========================================
  const loginMember = (phone: string, name?: string): MemberUser => {
    const cleanPhone = phone.replace(/\D/g, '');
    const existingIdx = members.findIndex((m) => (m.phone || '').replace(/\D/g, '') === cleanPhone);

    if (existingIdx >= 0) {
      let existing = members[existingIdx];
      // Nếu khách có tên mới hoặc cụ thể hơn, cập nhật lại tên thành viên
      if (name && name.trim() && (existing.name.startsWith('Khách hàng ') || existing.name !== name.trim())) {
        existing = { ...existing, name: name.trim(), id: cleanPhone, phone: cleanPhone };
        const updated = members.map((m, idx) => idx === existingIdx ? existing : m);
        setMembers(updated);
        try { localStorage.setItem('AN_TRA_MEMBERS', JSON.stringify(updated)); } catch {}
        broadcast('UPDATE_MEMBERS', updated);
        apiSaveMember(existing);
      }
      setCurrentUser(existing);
      try { localStorage.setItem('AN_TRA_CURRENT_USER', JSON.stringify(existing)); } catch {}
      broadcast('UPDATE_CURRENT_USER', existing);
      return existing;
    }

    // Nếu chưa có, tạo tài khoản mới tặng 20 điểm chào mừng
    const newMember: MemberUser = {
      id: cleanPhone,
      name: name?.trim() || `Khách hàng ${cleanPhone.slice(-4)}`,
      phone: cleanPhone,
      points: 20, // Tặng 20 điểm tân thủ
      tier: 'Thành Viên',
      totalSpent: 0,
      registeredAt: new Date().toLocaleDateString('vi-VN'),
    };

    const updated = [newMember, ...members.filter((m) => (m.phone || '').replace(/\D/g, '') !== cleanPhone)];
    setMembers(updated);
    setCurrentUser(newMember);
    try {
      localStorage.setItem('AN_TRA_MEMBERS', JSON.stringify(updated));
      localStorage.setItem('AN_TRA_CURRENT_USER', JSON.stringify(newMember));
    } catch {}
    broadcast('UPDATE_MEMBERS', updated);
    broadcast('UPDATE_CURRENT_USER', newMember);
    apiSaveMember(newMember);
    return newMember;
  };

  const logoutMember = () => {
    setCurrentUser(null);
    try { localStorage.removeItem('AN_TRA_CURRENT_USER'); } catch {}
    broadcast('UPDATE_CURRENT_USER', null);
  };

  // Cộng điểm khi đặt đơn thành công (10.000đ = 1 điểm)
  const addPointsToMember = (phone: string, points: number, spentAmount: number) => {
    const cleanPhone = phone.replace(/\D/g, '');
    setMembers((prev) => {
      let targetToSave: MemberUser | null = null;
      const updated = prev.map((m) => {
        if ((m.phone || '').replace(/\D/g, '') === cleanPhone) {
          const newPoints = m.points + points;
          const newSpent = m.totalSpent + spentAmount;
          let tier = m.tier;
          if (newSpent >= 5000000) tier = 'Kim Cương';
          else if (newSpent >= 2000000) tier = 'Hạng Vàng';
          else if (newSpent >= 1000000) tier = 'Hạng Bạc';

          const updatedMember = { ...m, id: cleanPhone, phone: cleanPhone, points: newPoints, totalSpent: newSpent, tier };
          targetToSave = updatedMember;
          if (currentUser && (currentUser.phone || '').replace(/\D/g, '') === cleanPhone) {
            setCurrentUser(updatedMember);
          }
          return updatedMember;
        }
        return m;
      });
      try { localStorage.setItem('AN_TRA_MEMBERS', JSON.stringify(updated)); } catch {}
      broadcast('UPDATE_MEMBERS', updated);
      if (targetToSave) {
        apiSaveMember(targetToSave);
      }
      return updated;
    });
  };

  const deductPointsFromMember = (phone: string, points: number): boolean => {
    const cleanPhone = phone.replace(/\D/g, '');
    const member = members.find((m) => (m.phone || '').replace(/\D/g, '') === cleanPhone);
    if (!member || member.points < points) return false;

    setMembers((prev) => {
      let targetToSave: MemberUser | null = null;
      const updated = prev.map((m) => {
        if ((m.phone || '').replace(/\D/g, '') === cleanPhone) {
          const updatedMember = { ...m, id: cleanPhone, phone: cleanPhone, points: m.points - points };
          targetToSave = updatedMember;
          if (currentUser && (currentUser.phone || '').replace(/\D/g, '') === cleanPhone) {
            setCurrentUser(updatedMember);
          }
          return updatedMember;
        }
        return m;
      });
      try { localStorage.setItem('AN_TRA_MEMBERS', JSON.stringify(updated)); } catch {}
      broadcast('UPDATE_MEMBERS', updated);
      if (targetToSave) {
        apiSaveMember(targetToSave);
      }
      return updated;
    });
    return true;
  };

  const addMember = (newMember: MemberUser) => {
    const cleanPhone = (newMember.phone || '').replace(/\D/g, '');
    const formatted: MemberUser = {
      ...newMember,
      id: cleanPhone,
      phone: cleanPhone,
      registeredAt: newMember.registeredAt || new Date().toLocaleDateString('vi-VN'),
    };
    setMembers((prev) => {
      const updated = [formatted, ...prev.filter((m) => (m.phone || '').replace(/\D/g, '') !== cleanPhone)];
      try { localStorage.setItem('AN_TRA_MEMBERS', JSON.stringify(updated)); } catch {}
      broadcast('UPDATE_MEMBERS', updated);
      apiSaveMember(formatted);
      return updated;
    });
  };

  const updateMember = (phone: string, updated: Partial<MemberUser>) => {
    const cleanPhone = phone.replace(/\D/g, '');
    setMembers((prev) => {
      let target: MemberUser | null = null;
      const updatedList = prev.map((m) => {
        if ((m.phone || '').replace(/\D/g, '') === cleanPhone) {
          const res = { ...m, ...updated, id: cleanPhone, phone: cleanPhone };
          target = res;
          if (currentUser && (currentUser.phone || '').replace(/\D/g, '') === cleanPhone) {
            setCurrentUser(res);
          }
          return res;
        }
        return m;
      });
      try { localStorage.setItem('AN_TRA_MEMBERS', JSON.stringify(updatedList)); } catch {}
      broadcast('UPDATE_MEMBERS', updatedList);
      if (target) {
        apiSaveMember(target);
      }
      return updatedList;
    });
  };

  const adjustMemberPoints = (phone: string, pointsDelta: number) => {
    const cleanPhone = phone.replace(/\D/g, '');
    setMembers((prev) => {
      let target: MemberUser | null = null;
      const updatedList = prev.map((m) => {
        if ((m.phone || '').replace(/\D/g, '') === cleanPhone) {
          const newPts = Math.max(0, m.points + pointsDelta);
          const res = { ...m, id: cleanPhone, phone: cleanPhone, points: newPts };
          target = res;
          if (currentUser && (currentUser.phone || '').replace(/\D/g, '') === cleanPhone) {
            setCurrentUser(res);
          }
          return res;
        }
        return m;
      });
      try { localStorage.setItem('AN_TRA_MEMBERS', JSON.stringify(updatedList)); } catch {}
      broadcast('UPDATE_MEMBERS', updatedList);
      if (target) {
        apiSaveMember(target);
      }
      return updatedList;
    });
  };

  const deleteMember = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    setMembers((prev) => {
      const updated = prev.filter((m) => (m.phone || '').replace(/\D/g, '') !== cleanPhone);
      try { localStorage.setItem('AN_TRA_MEMBERS', JSON.stringify(updated)); } catch {}
      broadcast('UPDATE_MEMBERS', updated);
      return updated;
    });
    apiDeleteMember(cleanPhone);
  };

  // ==========================================
  // QUẢN LÝ MÃ GIẢM GIÁ & VOUCHER
  // ==========================================
  const addCoupon = (newCoupon: Coupon) => {
    setCoupons((prev) => {
      const updated = [newCoupon, ...prev.filter((c) => c.id !== newCoupon.id)];
      try { localStorage.setItem('AN_TRA_COUPONS', JSON.stringify(updated)); } catch {}
      broadcast('UPDATE_COUPONS', updated);
      apiSaveCoupons(updated);
      return updated;
    });
  };

  const updateCoupon = (id: string, updated: Partial<Coupon>) => {
    setCoupons((prev) => {
      const updatedList = prev.map((c) => (c.id === id ? { ...c, ...updated } : c));
      try { localStorage.setItem('AN_TRA_COUPONS', JSON.stringify(updatedList)); } catch {}
      broadcast('UPDATE_COUPONS', updatedList);
      apiSaveCoupons(updatedList);
      return updatedList;
    });
  };

  const deleteCoupon = (id: string) => {
    setCoupons((prev) => {
      const updatedList = prev.filter((c) => c.id !== id);
      try { localStorage.setItem('AN_TRA_COUPONS', JSON.stringify(updatedList)); } catch {}
      broadcast('UPDATE_COUPONS', updatedList);
      apiSaveCoupons(updatedList);
      return updatedList;
    });
  };

  const toggleCouponActive = (id: string) => {
    setCoupons((prev) => {
      const updatedList = prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c));
      try { localStorage.setItem('AN_TRA_COUPONS', JSON.stringify(updatedList)); } catch {}
      broadcast('UPDATE_COUPONS', updatedList);
      apiSaveCoupons(updatedList);
      return updatedList;
    });
  };

  const validateCoupon = (code: string, orderTotal: number): { valid: boolean; discount: number; message: string; coupon?: Coupon } => {
    const cleanCode = code.trim().toUpperCase();
    const found = coupons.find((c) => c.code.trim().toUpperCase() === cleanCode);
    if (!found) {
      return { valid: false, discount: 0, message: 'Mã giảm giá không tồn tại hoặc đã hết hạn.' };
    }
    if (!found.isActive) {
      return { valid: false, discount: 0, message: 'Mã giảm giá này hiện đang tạm dừng áp dụng.' };
    }
    if (orderTotal < found.minOrderTotal) {
      return {
        valid: false,
        discount: 0,
        message: `Đơn hàng tối thiểu phải từ ${new Intl.NumberFormat('vi-VN').format(found.minOrderTotal)}đ để áp dụng mã này.`
      };
    }
    let calculated = 0;
    if (found.type === 'fixed') {
      calculated = Math.min(orderTotal, found.value);
    } else {
      calculated = Math.round((orderTotal * found.value) / 100);
      if (found.maxDiscount && calculated > found.maxDiscount) {
        calculated = found.maxDiscount;
      }
    }
    return {
      valid: true,
      discount: calculated,
      message: `Áp dụng mã ${found.code} thành công: Giảm ${new Intl.NumberFormat('vi-VN').format(calculated)}đ!`,
      coupon: found,
    };
  };

  // ==========================================
  // NHÂN VIÊN & PHÂN QUYỀN
  // ==========================================
  const loginStaff = (code: string): { success: boolean; staff?: StaffMember; message?: string } => {
    const cleanCode = code.trim();
    const found = staffMembers.find((s) => s.code === cleanCode);
    if (!found) {
      return { success: false, message: 'Mã số code không tồn tại trong hệ thống!' };
    }
    if (!found.isActive) {
      return { success: false, message: 'Tài khoản nhân viên này đang bị khóa tạm thời!' };
    }
    setCurrentStaff(found);
    return { success: true, staff: found };
  };

  const logoutStaff = () => {
    setCurrentStaff(null);
  };

  const addStaffMember = (newStaff: StaffMember) => {
    setStaffMembers((prev) => {
      const updated = [newStaff, ...prev];
      try {
        localStorage.setItem('AN_TRA_STAFF', JSON.stringify(updated));
      } catch {}
      broadcast('UPDATE_STAFF', updated);
      apiSaveStaff(updated);
      return updated;
    });
  };

  const updateStaffMember = (id: string, updated: Partial<StaffMember>) => {
    setStaffMembers((prev) => {
      const updatedList = prev.map((s) => (s.id === id ? { ...s, ...updated } : s));
      try {
        localStorage.setItem('AN_TRA_STAFF', JSON.stringify(updatedList));
      } catch {}
      broadcast('UPDATE_STAFF', updatedList);
      apiSaveStaff(updatedList);
      return updatedList;
    });

    // Cập nhật currentStaff nếu nhân viên đang trực là tài khoản này
    setCurrentStaff((prev) => {
      if (prev && (prev.id === id || prev.code === updated.code)) {
        const nextStaff = { ...prev, ...updated };
        try {
          localStorage.setItem('AN_TRA_CURRENT_STAFF', JSON.stringify(nextStaff));
        } catch {}
        broadcast('UPDATE_CURRENT_STAFF', nextStaff);
        return nextStaff;
      }
      return prev;
    });

    // Cập nhật tên hiển thị trong lịch sử chấm công
    if (updated.name) {
      setAttendanceRecords((prev) => {
        const nextAtt = prev.map((r) => (r.staffId === id ? { ...r, staffName: updated.name! } : r));
        try {
          localStorage.setItem('AN_TRA_ATTENDANCE', JSON.stringify(nextAtt));
        } catch {}
        return nextAtt;
      });
    }
  };

  const deleteStaffMember = (id: string) => {
    setStaffMembers((prev) => {
      const updatedList = prev.filter((s) => s.id !== id);
      try {
        localStorage.setItem('AN_TRA_STAFF', JSON.stringify(updatedList));
      } catch {}
      broadcast('UPDATE_STAFF', updatedList);
      apiSaveStaff(updatedList);
      return updatedList;
    });
  };

  // ==========================================
  // CHẤM CÔNG NHÂN VIÊN BẰNG MÃ CODE
  // ==========================================
  const clockIn = (staffCode: string): { success: boolean; message: string; record?: AttendanceRecord } => {
    const cleanCode = staffCode.trim();
    const staff = staffMembers.find((s) => s.code === cleanCode);
    if (!staff) {
      return { success: false, message: 'Mã số nhân viên không hợp lệ!' };
    }
    if (!staff.isActive) {
      return { success: false, message: 'Tài khoản nhân viên đang bị tạm dừng!' };
    }

    const todayDate = new Date().toLocaleDateString('vi-VN');
    // Kiểm tra xem đã có ca đang làm việc chưa
    const existingActive = attendanceRecords.find(
      (r) => r.staffId === staff.id && r.date === todayDate && r.status === 'in-shift'
    );
    if (existingActive) {
      return {
        success: false,
        message: `${staff.name} đã vào ca lúc ${existingActive.checkInTime} rồi!`,
      };
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const newRecord: AttendanceRecord = {
      id: `ATT-${Date.now()}`,
      staffId: staff.id,
      staffCode: staff.code,
      staffName: staff.name,
      staffRole: staff.role,
      roleTitle: staff.roleTitle,
      date: todayDate,
      checkInTime: timeStr,
      status: 'in-shift',
      ordersHandled: 0,
      note: 'Vào ca thành công',
    };

    setAttendanceRecords((prev) => [newRecord, ...prev]);
    apiSaveAttendanceRecord(newRecord);
    return {
      success: true,
      message: `Chấm công vào ca thành công! Chào ${staff.name} (${staff.roleTitle}).`,
      record: newRecord,
    };
  };

  const clockOut = (staffCode: string, note?: string): { success: boolean; message: string; record?: AttendanceRecord } => {
    const cleanCode = staffCode.trim();
    const staff = staffMembers.find((s) => s.code === cleanCode);
    if (!staff) {
      return { success: false, message: 'Mã số nhân viên không hợp lệ!' };
    }

    const activeIndex = attendanceRecords.findIndex(
      (r) => r.staffId === staff.id && r.status === 'in-shift'
    );

    if (activeIndex === -1) {
      return {
        success: false,
        message: `${staff.name} hiện không có ca làm việc nào đang mở để ra ca!`,
      };
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const activeRec = attendanceRecords[activeIndex];
    // Tính phút ước lượng
    const updatedRecords = [...attendanceRecords];
    const completedRecord: AttendanceRecord = {
      ...activeRec,
      checkOutTime: timeStr,
      status: 'completed',
      totalMinutes: 480, // khoảng 8 tiếng hoặc ước tính
      note: note || 'Ra ca thành công, hoàn thành phiên trực.',
    };

    updatedRecords[activeIndex] = completedRecord;
    setAttendanceRecords(updatedRecords);
    apiSaveAttendanceRecord(completedRecord);

    return {
      success: true,
      message: `Chấm công ra ca thành công cho ${staff.name} lúc ${timeStr}!`,
      record: completedRecord,
    };
  };

  // ==========================================
  // ĐƠN HÀNG POS
  // ==========================================
  const addOrder = (order: PosOrder) => {
    const orderWithCheck: PosOrder = {
      ...order,
      checked: false,
    };
    setOrders((prev) => [orderWithCheck, ...prev.filter(o => o.id !== orderWithCheck.id)]);
    setActiveCustomerOrderId(order.id);
    setUnreadPosOrdersCount((c) => c + 1);
    apiCreateOrder(orderWithCheck);
    broadcast('NEW_ORDER', orderWithCheck);

    // Tăng số đơn đã xử lý cho nhân viên đang trực nếu có
    if (currentStaff) {
      setAttendanceRecords((prev) =>
        prev.map((r) => {
          if (r.staffId === currentStaff.id && r.status === 'in-shift') {
            return { ...r, ordersHandled: (r.ordersHandled || 0) + 1 };
          }
          return r;
        })
      );
    }

    // Tự động tích điểm nếu khách hàng có số điện thoại
    if (order.customer.phone) {
      const earnedPoints = Math.floor(order.total / 10000);
      if (earnedPoints > 0) {
        addPointsToMember(order.customer.phone, earnedPoints, order.total);
      }
    }
  };

  // Check và nhận đơn 1 lần duy nhất (vĩnh viễn)
  const markOrderAsChecked = (orderId: string) => {
    const checkedAt = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, checked: true, status: 'preparing', checkedAt } : o))
    );
    apiCheckOrder(orderId);
    broadcast('CHECK_ORDER', { orderId, checkedAt });
  };

  // Dọn dẹp đơn trùng lặp
  const clearDuplicateOrders = () => {
    setOrders((prev) => {
      const seen = new Set<string>();
      const unique: PosOrder[] = [];
      for (const o of prev) {
        if (!seen.has(o.id)) {
          seen.add(o.id);
          unique.push(o);
        }
      }
      broadcast('CLEAR_DUPLICATES', unique);
      return unique;
    });
    apiClearDuplicateOrders();
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    apiUpdateOrder(orderId, { status });
    broadcast('UPDATE_STATUS', { orderId, status });
  };

  const updatePaymentStatus = (orderId: string, paymentStatus: 'paid' | 'unpaid') => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, paymentStatus } : o))
    );
    apiUpdateOrder(orderId, { paymentStatus });
    broadcast('UPDATE_PAYMENT', { orderId, paymentStatus });
  };

  const updateOrder = (orderId: string, updated: Partial<PosOrder>) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, ...updated } : o))
    );
    apiUpdateOrder(orderId, updated);
    broadcast('UPDATE_ORDER', { orderId, updated });
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => {
      const updated = prev.filter((o) => o.id !== orderId);
      broadcast('DELETE_ORDER', orderId);
      return updated;
    });
    apiDeleteOrder(orderId);
  };

  const toggleStock = (teaId: string) => {
    setStockStatus((prev) => {
      const next = { ...prev, [teaId]: prev[teaId] === false ? true : false };
      broadcast('UPDATE_STOCK', next);
      apiSaveStock(next);
      return next;
    });
  };

  const markPosOrdersAsRead = () => {
    setUnreadPosOrdersCount(0);
  };

  // ==========================================
  // QUẢN LÝ TRẠNG THÁI BÀN (BÀN ĐANG NGỒI / BÀN TRỐNG)
  // ==========================================
  const getTableStatus = (tableId: string): 'available' | 'occupied_unpaid' | 'occupied_paid' => {
    const activeOrders = orders.filter(
      (o) => o.tableNumber === tableId && !o.tableCleared && o.status !== 'cancelled'
    );
    if (activeOrders.length === 0) return 'available';

    const hasUnpaid = activeOrders.some((o) => o.paymentStatus === 'unpaid');
    if (hasUnpaid) return 'occupied_unpaid';

    return 'occupied_paid';
  };

  const getTableOrder = (tableId: string): PosOrder | null => {
    const activeOrders = orders.filter(
      (o) => o.tableNumber === tableId && !o.tableCleared && o.status !== 'cancelled'
    );
    if (activeOrders.length === 0) return null;
    if (activeOrders.length === 1) return activeOrders[0];

    // Gộp tất cả các đợt gọi thêm của bàn này lại để Thu ngân tính tổng tiền chính xác
    const allItems = activeOrders.flatMap((o) => o.items);
    const totalSub = activeOrders.reduce((sum, o) => sum + o.subtotal, 0);
    const totalDiscount = activeOrders.reduce((sum, o) => sum + (o.discount || 0), 0);
    const grandTot = activeOrders.reduce((sum, o) => sum + o.total, 0);
    const hasUnpaid = activeOrders.some((o) => o.paymentStatus === 'unpaid');
    const primary = activeOrders[0];

    return {
      ...primary,
      items: allItems,
      subtotal: totalSub,
      discount: totalDiscount,
      total: grandTot,
      paymentStatus: hasUnpaid ? 'unpaid' : 'paid',
      staffNote: `${tableId}: Tổng hợp ${activeOrders.length} đợt gọi món`,
    };
  };

  const clearTable = (tableId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.tableNumber === tableId && !o.tableCleared
          ? { ...o, tableCleared: true, paymentStatus: 'paid' }
          : o
      )
    );
    apiClearTable(tableId);
    broadcast('CLEAR_TABLE', tableId);
  };

  // ==========================================
  // THAO TÁC QUẢN LÝ BÀN (THÊM / SỬA / XÓA)
  // ==========================================
  const addTable = (newTable: DiningTable) => {
    setTables((prev) => {
      const updated = [...prev, newTable];
      broadcast('UPDATE_TABLES', updated);
      apiSaveTables(updated);
      return updated;
    });
  };

  const updateTable = (id: string, updated: Partial<DiningTable>) => {
    setTables((prev) => {
      const targetTable = prev.find((t) => t.id === id);
      const oldName = targetTable?.name;
      const updatedList = prev.map((t) => (t.id === id ? { ...t, ...updated } : t));
      broadcast('UPDATE_TABLES', updatedList);
      apiSaveTables(updatedList);

      // Nếu tên bàn thay đổi và có đơn hàng đang ở bàn cũ, cập nhật theo
      if (updated.name && oldName && updated.name !== oldName) {
        setOrders((orderPrev) => {
          const updatedOrders = orderPrev.map((o) =>
            o.tableNumber === oldName ? { ...o, tableNumber: updated.name! } : o
          );
          return updatedOrders;
        });
      }

      return updatedList;
    });
  };

  const deleteTable = (id: string): { success: boolean; message?: string } => {
    const targetTable = tables.find((t) => t.id === id);
    if (!targetTable) {
      return { success: false, message: 'Không tìm thấy bàn cần xóa!' };
    }

    // Kiểm tra xem bàn có đang có khách hoặc chưa dọn không
    const status = getTableStatus(targetTable.name);
    if (status !== 'available') {
      return {
        success: false,
        message: `Không thể xóa "${targetTable.name}" vì bàn đang có khách hoặc chưa dọn dẹp xong!`,
      };
    }

    setTables((prev) => {
      const updatedList = prev.filter((t) => t.id !== id);
      broadcast('UPDATE_TABLES', updatedList);
      apiSaveTables(updatedList);
      return updatedList;
    });

    return { success: true };
  };

  const resetTablesToDefault = () => {
    setTables(INITIAL_TABLES);
    broadcast('UPDATE_TABLES', INITIAL_TABLES);
    apiSaveTables(INITIAL_TABLES);
  };

  const activeCustomerOrder = orders.find((o) => o.id === activeCustomerOrderId) || null;

  return (
    <OrderContext.Provider
      value={{
        orders,
        addOrder,
        deleteOrder,
        updateOrderStatus,
        updatePaymentStatus,
        updateOrder,
        markOrderAsChecked,
        clearDuplicateOrders,
        stockStatus,
        toggleStock,
        activeCustomerOrder,
        setActiveCustomerOrderId,
        unreadPosOrdersCount,
        markPosOrdersAsRead,

        // Quản lý sản phẩm
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        resetProductsToDefault,

        // Quản lý Topping & Phụ Liệu
        toppings,
        addTopping,
        updateTopping,
        deleteTopping,
        toggleToppingAvailability,
        resetToppingsToDefault,

        // Quản lý Bàn
        tables,
        allTablesList,
        addTable,
        updateTable,
        deleteTable,
        resetTablesToDefault,

        // Thành viên & Khách hàng
        currentUser,
        members,
        loginMember,
        logoutMember,
        addPointsToMember,
        deductPointsFromMember,
        addMember,
        updateMember,
        adjustMemberPoints,
        deleteMember,

        // Quản lý Mã Giảm Giá & Voucher
        coupons,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        toggleCouponActive,
        validateCoupon,

        // Nhân viên & Phân quyền
        staffMembers,
        currentStaff,
        loginStaff,
        logoutStaff,
        addStaffMember,
        updateStaffMember,
        deleteStaffMember,

        // Chấm công
        attendanceRecords,
        clockIn,
        clockOut,

        // Quét QR bàn
        scannedTable,
        setScannedTable,

        // Quản lý trạng thái bàn
        getTableStatus,
        getTableOrder,
        clearTable,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
