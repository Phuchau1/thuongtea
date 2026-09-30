export type CouponType = 'fixed' | 'percent';

export interface Coupon {
  id: string;
  code: string; // e.g. "FRESH20", "GIAM10"
  description: string; // e.g. "Giảm 20.000đ cho đơn từ 60.000đ"
  type: CouponType; // 'fixed' | 'percent'
  value: number; // e.g. 20000 or 10 (%)
  minOrderTotal: number; // e.g. 60000
  maxDiscount?: number; // e.g. 30000 (cho loại percent)
  isActive: boolean;
  usageCount: number;
  maxUsage?: number;
  expiryDate?: string; // dd/mm/yyyy or yyyy-mm-dd
  createdAt: string;
}

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'CP-FRESH20',
    code: 'FRESH20',
    description: 'Giảm ngay 20.000đ cho đơn hàng từ 60.000đ',
    type: 'fixed',
    value: 20000,
    minOrderTotal: 60000,
    isActive: true,
    usageCount: 18,
    createdAt: '01/01/2026',
  },
  {
    id: 'CP-GIAM10',
    code: 'GIAM10',
    description: 'Giảm 10% tổng hóa đơn (tối đa 30.000đ) từ 50.000đ',
    type: 'percent',
    value: 10,
    minOrderTotal: 50000,
    maxDiscount: 30000,
    isActive: true,
    usageCount: 42,
    createdAt: '10/01/2026',
  },
  {
    id: 'CP-FREESHIP',
    code: 'FREESHIP',
    description: 'Miễn phí giao hàng (trợ giá 20.000đ ship) cho đơn từ 50.000đ',
    type: 'fixed',
    value: 20000,
    minOrderTotal: 50000,
    isActive: true,
    usageCount: 25,
    createdAt: '15/01/2026',
  },
  {
    id: 'CP-TRIAN50',
    code: 'TRIAN50',
    description: 'Tri ân khách hàng: Giảm 50.000đ cho đơn nhóm từ 160.000đ',
    type: 'fixed',
    value: 50000,
    minOrderTotal: 160000,
    isActive: true,
    usageCount: 9,
    createdAt: '20/02/2026',
  },
];
