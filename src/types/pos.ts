import type { CartItem, OrderCustomerInfo } from './tea';

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type OrderType = 'delivery' | 'takeaway' | 'dine-in';

export interface PosOrder {
  id: string; // e.g. AT-892145
  orderNumber: number; // e.g. #042
  createdAt: string; // ISO or local time string
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
