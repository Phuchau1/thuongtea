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
    id: 'user-01',
    name: 'Nguyễn Thùy Linh',
    phone: '0908123456',
    points: 185,
    tier: 'Hạng Vàng',
    totalSpent: 1850000,
    registeredAt: '12/01/2026',
  },
  {
    id: 'user-02',
    name: 'Trần Minh Quân',
    phone: '0933888999',
    points: 90,
    tier: 'Hạng Bạc',
    totalSpent: 900000,
    registeredAt: '28/02/2026',
  },
  {
    id: 'user-03',
    name: 'Lê Hoàng Nam',
    phone: '0912345678',
    points: 320,
    tier: 'Kim Cương',
    totalSpent: 3200000,
    registeredAt: '05/11/2025',
  },
  {
    id: 'user-04',
    name: 'Hậu',
    phone: '0838484885',
    points: 30,
    tier: 'Thành Viên',
    totalSpent: 300000,
    registeredAt: '26/09/2026',
  }
];
