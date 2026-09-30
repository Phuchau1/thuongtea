export type MemberTier = 'Thành Viên' | 'Hạng Bạc' | 'Hạng Vàng' | 'Kim Cương';

export interface MemberUser {
  id: string;
  name: string;
  phone: string;
  points: number; // 10.000đ = 1 điểm
  tier: MemberTier;
  totalSpent: number;
  registeredAt: string;
}

export const INITIAL_MEMBERS: MemberUser[] = [
  {
    id: '0908123456',
    name: 'Nguyễn Thùy Linh',
    phone: '0908123456',
    points: 185,
    tier: 'Hạng Vàng',
    totalSpent: 1850000,
    registeredAt: '12/01/2026',
  },
  {
    id: '0933888999',
    name: 'Trần Minh Quân',
    phone: '0933888999',
    points: 90,
    tier: 'Hạng Bạc',
    totalSpent: 900000,
    registeredAt: '28/02/2026',
  },
  {
    id: '0912345678',
    name: 'Lê Hoàng Nam',
    phone: '0912345678',
    points: 320,
    tier: 'Kim Cương',
    totalSpent: 3200000,
    registeredAt: '05/11/2025',
  },
  {
    id: '0838484885',
    name: 'Hậu',
    phone: '0838484885',
    points: 182,
    tier: 'Hạng Bạc',
    totalSpent: 1727000,
    registeredAt: '26/09/2026',
  }
];
