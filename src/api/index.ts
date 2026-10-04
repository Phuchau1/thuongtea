import type { PosOrder } from '../types/pos';
import { sortOrdersNewestFirst } from '../types/pos';
import type { MemberUser } from '../types/user';
import type { FruitTeaItem, Topping, DiningTable } from '../types/tea';
import type { StaffMember, AttendanceRecord } from '../types/staff';
import type { Coupon } from '../types/coupon';
import { INITIAL_COUPONS } from '../types/coupon';

/**
 * Cấu hình Base API URL:
 * - Khi chạy cùng backend trên Render/Vite proxy: dùng chuỗi rỗng '' (tương ứng '/api/...')
 * - Khi deploy frontend độc lập: có thể set VITE_API_URL
 */
const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      ...options,
    });
    if (!res.ok) {
      return null;
    }
    const json = await res.json();
    return json?.data !== undefined ? json.data : json;
  } catch (err) {
    console.debug(`[API] Fetch error for ${endpoint}:`, err);
    return null;
  }
}

// --------------------------------------------------------------------------
// 1. REALTIME ORDERS (SSE EventSource kết hợp polling nhẹ)
// --------------------------------------------------------------------------
export function apiListenOrders(callback: (orders: PosOrder[]) => void): () => void {
  let eventSource: EventSource | null = null;
  let isUnmounted = false;
  let pollTimer: ReturnType<typeof setInterval> | null = null;

  const refreshOrders = async () => {
    const list = await apiGetOrders();
    if (list && list.length > 0 && !isUnmounted) {
      callback(list);
    }
  };

  // Khởi tạo SSE Stream từ MongoDB Backend
  const setupSse = () => {
    if (typeof window === 'undefined' || !window.EventSource) return;

    try {
      const sseUrl = `${BASE_URL}/api/orders/stream`;
      eventSource = new EventSource(sseUrl);

      eventSource.addEventListener('NEW_ORDER', () => {
        refreshOrders();
      });

      eventSource.addEventListener('CHECK_ORDER', () => {
        refreshOrders();
      });

      eventSource.addEventListener('UPDATE_ORDER', () => {
        refreshOrders();
      });

      eventSource.addEventListener('DELETE_ORDER', () => {
        refreshOrders();
      });

      eventSource.addEventListener('CLEAR_TABLE', () => {
        refreshOrders();
      });

      eventSource.addEventListener('CLEAR_ALL_TABLES', () => {
        refreshOrders();
      });

      eventSource.addEventListener('ORDERS_RESET', (e: MessageEvent) => {
        try {
          const list = JSON.parse(e.data);
          if (Array.isArray(list) && !isUnmounted) {
            const sorted = sortOrdersNewestFirst(list);
            localStorage.setItem('AN_TRA_ORDERS', JSON.stringify(sorted));
            callback(sorted);
          }
        } catch {
          refreshOrders();
        }
      });

      eventSource.onerror = () => {
        // SSE bị ngắt, đóng và tự kết nối lại sau 4 giây
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        if (!isUnmounted) {
          setTimeout(setupSse, 4000);
        }
      };
    } catch {
      // Fallback nếu trình duyệt chặn SSE
    }
  };

  setupSse();

  // Polling nhẹ phụ trợ mỗi 8s để đảm bảo đồng bộ hoàn hảo kể cả khi mạng chập chờn
  pollTimer = setInterval(() => {
    if (!isUnmounted) {
      refreshOrders();
    }
  }, 8000);

  return () => {
    isUnmounted = true;
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    if (pollTimer) {
      clearInterval(pollTimer);
    }
  };
}

// --------------------------------------------------------------------------
// 2. ORDERS CRUD
// --------------------------------------------------------------------------
export async function apiGetOrders(): Promise<PosOrder[]> {
  const result = await fetchJson<PosOrder[]>('/api/orders');
  if (result && Array.isArray(result) && result.length > 0) {
    const sorted = sortOrdersNewestFirst(result);
    try {
      localStorage.setItem('AN_TRA_ORDERS', JSON.stringify(sorted));
    } catch {}
    return sorted;
  }

  // Fallback nếu server chưa khởi động hoặc chưa có mạng
  try {
    const saved = localStorage.getItem('AN_TRA_ORDERS');
    return saved ? sortOrdersNewestFirst(JSON.parse(saved)) : [];
  } catch {
    return [];
  }
}

export async function apiCreateOrder(order: PosOrder): Promise<PosOrder> {
  const orderWithTs: PosOrder = {
    ...order,
    createdTimestamp: order.createdTimestamp || Date.now(),
  };

  const saved = await fetchJson<PosOrder>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(orderWithTs),
  });

  return saved || orderWithTs;
}

export async function apiCheckOrder(orderId: string): Promise<PosOrder | null> {
  const updated = await fetchJson<PosOrder>(`/api/orders/check/${encodeURIComponent(orderId)}`, {
    method: 'POST',
  });
  return updated;
}

export async function apiUpdateOrder(orderId: string, updates: Partial<PosOrder>): Promise<PosOrder | null> {
  const updated = await fetchJson<PosOrder>(`/api/orders/${encodeURIComponent(orderId)}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return updated;
}

export async function apiDeleteOrder(orderId: string): Promise<void> {
  await fetchJson(`/api/orders/${encodeURIComponent(orderId)}`, {
    method: 'DELETE',
  });
}

export async function apiClearDuplicateOrders(): Promise<PosOrder[]> {
  const list = await fetchJson<PosOrder[]>('/api/orders/clear-duplicates', {
    method: 'POST',
  });
  return list || [];
}

// --------------------------------------------------------------------------
// 3. TABLE MANAGEMENT
// --------------------------------------------------------------------------
export async function apiClearTable(tableNumber: string): Promise<void> {
  await fetchJson('/api/tables/clear', {
    method: 'POST',
    body: JSON.stringify({ tableNumber }),
  });
}

export async function apiClearAllTables(): Promise<void> {
  await fetchJson('/api/tables/clear-all', {
    method: 'POST',
  });
}

export async function apiGetTables(): Promise<DiningTable[]> {
  const res = await fetchJson<DiningTable[]>('/api/tables');
  if (res && Array.isArray(res) && res.length > 0) {
    try {
      localStorage.setItem('AN_TRA_TABLES', JSON.stringify(res));
    } catch {}
    return res;
  }
  try {
    const saved = localStorage.getItem('AN_TRA_TABLES');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export async function apiSaveTables(tables: DiningTable[]): Promise<void> {
  try {
    localStorage.setItem('AN_TRA_TABLES', JSON.stringify(tables));
  } catch {}
  await fetchJson('/api/tables', {
    method: 'POST',
    body: JSON.stringify({ tables }),
  });
}

// --------------------------------------------------------------------------
// 4. MEMBERS & LOYALTY
// --------------------------------------------------------------------------
export async function apiGetMembers(): Promise<MemberUser[]> {
  const res = await fetchJson<MemberUser[]>('/api/members');
  if (res && Array.isArray(res) && res.length > 0) {
    try {
      localStorage.setItem('AN_TRA_MEMBERS', JSON.stringify(res));
    } catch {}
    return res;
  }
  try {
    const saved = localStorage.getItem('AN_TRA_MEMBERS');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export async function apiSaveMember(member: MemberUser): Promise<void> {
  const cleanPhone = (member.phone || '').replace(/\D/g, '');
  if (!cleanPhone) return;

  const standardized: MemberUser = {
    ...member,
    id: cleanPhone,
    phone: cleanPhone,
  };

  await fetchJson('/api/members', {
    method: 'POST',
    body: JSON.stringify(standardized),
  });
}

export async function apiDeleteMember(memberIdOrPhone: string): Promise<void> {
  await fetchJson(`/api/members/${encodeURIComponent(memberIdOrPhone)}`, {
    method: 'DELETE',
  });
}

// --------------------------------------------------------------------------
// 5. PRODUCTS & TOPPINGS
// --------------------------------------------------------------------------
export async function apiGetProducts(): Promise<FruitTeaItem[]> {
  const res = await fetchJson<FruitTeaItem[]>('/api/products');
  if (res && Array.isArray(res) && res.length > 0) {
    try {
      localStorage.setItem('AN_TRA_PRODUCTS', JSON.stringify(res));
    } catch {}
    return res;
  }
  try {
    const saved = localStorage.getItem('AN_TRA_PRODUCTS');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export async function apiSaveProducts(products: FruitTeaItem[]): Promise<void> {
  try {
    localStorage.setItem('AN_TRA_PRODUCTS', JSON.stringify(products));
  } catch {}
  await fetchJson('/api/products', {
    method: 'POST',
    body: JSON.stringify({ products }),
  });
}

export async function apiGetToppings(): Promise<Topping[]> {
  const res = await fetchJson<Topping[]>('/api/toppings');
  if (res && Array.isArray(res) && res.length > 0) {
    try {
      localStorage.setItem('AN_TRA_TOPPINGS', JSON.stringify(res));
    } catch {}
    return res;
  }
  try {
    const saved = localStorage.getItem('AN_TRA_TOPPINGS');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export async function apiSaveToppings(toppings: Topping[]): Promise<void> {
  try {
    localStorage.setItem('AN_TRA_TOPPINGS', JSON.stringify(toppings));
  } catch {}
  await fetchJson('/api/toppings', {
    method: 'POST',
    body: JSON.stringify({ toppings }),
  });
}

// --------------------------------------------------------------------------
// 6. STAFF & ATTENDANCE
// --------------------------------------------------------------------------
export async function apiGetStaff(): Promise<StaffMember[]> {
  const res = await fetchJson<StaffMember[]>('/api/staff');
  if (res && Array.isArray(res) && res.length > 0) {
    try {
      localStorage.setItem('AN_TRA_STAFF', JSON.stringify(res));
    } catch {}
    return res;
  }
  try {
    const saved = localStorage.getItem('AN_TRA_STAFF');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export async function apiSaveStaff(staff: StaffMember[]): Promise<void> {
  try {
    localStorage.setItem('AN_TRA_STAFF', JSON.stringify(staff));
  } catch {}
  await fetchJson('/api/staff', {
    method: 'POST',
    body: JSON.stringify({ staff }),
  });
}

export async function apiGetAttendance(): Promise<AttendanceRecord[]> {
  const res = await fetchJson<AttendanceRecord[]>('/api/attendance');
  if (res && Array.isArray(res) && res.length > 0) {
    try {
      localStorage.setItem('AN_TRA_ATTENDANCE', JSON.stringify(res));
    } catch {}
    return res;
  }
  try {
    const saved = localStorage.getItem('AN_TRA_ATTENDANCE');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export async function apiSaveAttendanceRecord(record: AttendanceRecord): Promise<void> {
  await fetchJson('/api/attendance/record', {
    method: 'POST',
    body: JSON.stringify(record),
  });
}

// --------------------------------------------------------------------------
// 7. STOCK STATUS & COUPONS
// --------------------------------------------------------------------------
export async function apiGetStock(): Promise<Record<string, boolean>> {
  const res = await fetchJson<Record<string, boolean>>('/api/stock');
  if (res && typeof res === 'object') {
    try {
      localStorage.setItem('AN_TRA_STOCK', JSON.stringify(res));
    } catch {}
    return res;
  }
  try {
    const saved = localStorage.getItem('AN_TRA_STOCK');
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

export async function apiSaveStock(stock: Record<string, boolean>): Promise<void> {
  try {
    localStorage.setItem('AN_TRA_STOCK', JSON.stringify(stock));
  } catch {}
  await fetchJson('/api/stock', {
    method: 'POST',
    body: JSON.stringify({ stock }),
  });
}

export async function apiGetCoupons(): Promise<Coupon[]> {
  const res = await fetchJson<Coupon[]>('/api/coupons');
  if (res && Array.isArray(res) && res.length > 0) {
    try {
      localStorage.setItem('AN_TRA_COUPONS', JSON.stringify(res));
    } catch {}
    return res;
  }
  try {
    const saved = localStorage.getItem('AN_TRA_COUPONS');
    return saved ? JSON.parse(saved) : INITIAL_COUPONS;
  } catch {
    return INITIAL_COUPONS;
  }
}

export async function apiSaveCoupons(coupons: Coupon[]): Promise<void> {
  try {
    localStorage.setItem('AN_TRA_COUPONS', JSON.stringify(coupons));
  } catch {}
  await fetchJson('/api/coupons', {
    method: 'POST',
    body: JSON.stringify({ coupons }),
  });
}
