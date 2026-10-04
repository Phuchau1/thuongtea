import type { CartItem, OrderCustomerInfo } from './tea';

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type OrderType = 'delivery' | 'takeaway' | 'dine-in';

export interface PosOrder {
  id: string; // e.g. AT-892145
  orderNumber: number; // e.g. #042
  createdAt: string; // ISO or local time string
  createdTimestamp?: number; // epoch ms for sorting newest first
  customer: OrderCustomerInfo;
  orderType: OrderType;
  tableNumber?: string;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: 'paid' | 'unpaid';
  tableCleared?: boolean; // true = khách đã rời đi / bàn đã dọn trả trống
  checked?: boolean; // true = thu ngân đã check/nhận đơn 1 lần
  checkedAt?: string; // thời gian thu ngân bấm nhận đơn
  staffNote?: string;
}

export interface MenuItemStockStatus {
  [teaId: string]: boolean; // true = còn hàng, false = tạm hết
}

/**
 * Trích xuất timestamp chính xác nhất của đơn hàng để sắp xếp theo thời gian mới nhất
 */
export function getOrderTimestamp(order: PosOrder): number {
  if (typeof order.createdTimestamp === 'number' && order.createdTimestamp > 0) {
    return order.createdTimestamp;
  }
  // Tìm timestamp 13 chữ số trong cartItemId (VD: tea-01-...-1790743629460)
  if (order.items && order.items.length > 0) {
    let maxTs = 0;
    for (const it of order.items) {
      const match = String(it.cartItemId || '').match(/(\d{13})/);
      if (match) {
        const val = parseInt(match[1], 10);
        if (val > 1000000000000 && val < 3000000000000 && val > maxTs) {
          maxTs = val;
        }
      }
    }
    if (maxTs > 0) return maxTs;
  }
  // Nếu createdAt là chuỗi ngày ISO hoặc chuỗi ngày đầy đủ
  if (order.createdAt) {
    const parsed = Date.parse(order.createdAt);
    if (!isNaN(parsed) && parsed > 1000000000000) {
      return parsed;
    }
    // Nếu createdAt là giờ dạng "HH:mm" hoặc "HH:mm:ss"
    const timeMatch = order.createdAt.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (timeMatch) {
      const h = parseInt(timeMatch[1], 10);
      const m = parseInt(timeMatch[2], 10);
      const s = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
      return h * 3600000 + m * 60000 + s * 1000;
    }
  }
  return order.orderNumber || 0;
}

/**
 * Sắp xếp danh sách đơn hàng đưa ĐƠN MỚI NHẤT LÊN ĐẦU TIÊN
 */
export function sortOrdersNewestFirst(orders: PosOrder[]): PosOrder[] {
  return [...orders].sort((a, b) => {
    const tsA = getOrderTimestamp(a);
    const tsB = getOrderTimestamp(b);
    if (tsB !== tsA) {
      return tsB - tsA; // Mới nhất lên đầu tiên (giảm dần)
    }
    if ((b.orderNumber || 0) !== (a.orderNumber || 0)) {
      return (b.orderNumber || 0) - (a.orderNumber || 0);
    }
    return b.id.localeCompare(a.id);
  });
}
