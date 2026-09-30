export type StaffRole = 'admin' | 'cashier' | 'barista';

export interface StaffPermission {
  id: string;
  name: string;
  description: string;
  allowedRoles: StaffRole[];
}

export const STAFF_PERMISSIONS: StaffPermission[] = [
  {
    id: 'pos_cashier',
    name: 'Bán Hàng Thu Ngân (POS)',
    description: 'Tạo đơn tại quầy, tính tiền mặt, quét VietQR, in hóa đơn K80',
    allowedRoles: ['admin', 'cashier'],
  },
  {
    id: 'table_map',
    name: 'Sơ Đồ Bàn & Đặt Bàn',
    description: 'Xem trạng thái 12 bàn, nạp đơn bàn chưa thanh toán',
    allowedRoles: ['admin', 'cashier'],
  },
  {
    id: 'kds_kitchen',
    name: 'Màn Hình Bếp Pha Chế (KDS)',
    description: 'Xem danh sách món cần làm, đổi trạng thái đang pha / hoàn thành',
    allowedRoles: ['admin', 'barista'],
  },
  {
    id: 'menu_crud',
    name: 'Quản Lý Sản Phẩm (Thêm / Sửa / Xóa)',
    description: 'Thêm món trà mới, chỉnh sửa giá bán/ảnh/mô tả, xóa món, bật tắt kho',
    allowedRoles: ['admin'],
  },
  {
    id: 'revenue_reports',
    name: 'Quản Lý Doanh Thu & Báo Cáo Tài Chính',
    description: 'Xem tổng doanh thu, báo cáo theo ngày/tháng, cơ cấu tiền mặt & QR, top món',
    allowedRoles: ['admin'],
  },
  {
    id: 'staff_management',
    name: 'Quản Lý Nhân Viên & Cấp Mã Code',
    description: 'Thêm tài khoản nhân viên, đổi mã code, phân quyền vai trò',
    allowedRoles: ['admin'],
  },
  {
    id: 'attendance_clock',
    name: 'Chấm Công Đứng Quầy',
    description: 'Chấm công vào ca / ra ca bằng mã code nhân viên cá nhân',
    allowedRoles: ['admin', 'cashier', 'barista'],
  },
  {
    id: 'table_qr_print',
    name: 'Quản Lý & In Mã QR Bàn',
    description: 'Tạo và in tem mica QR đặt bàn cho khách tự gọi món',
    allowedRoles: ['admin'],
  },
];

export interface StaffMember {
  id: string;
  code: string; // Mã số cá nhân / PIN đăng nhập (e.g. 1234, 1001, 1002, 2001)
  name: string;
  role: StaffRole;
  roleTitle: string;
  phone: string;
  avatar: string;
  hourlyWage: number; // Lương giờ (VNĐ/h)
  isActive: boolean;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  staffCode: string;
  staffName: string;
  staffRole: StaffRole;
  roleTitle: string;
  date: string; // e.g. 25/09/2026
  checkInTime: string; // e.g. 08:00:15
  checkOutTime?: string; // e.g. 16:30:20
  status: 'in-shift' | 'completed';
  totalMinutes?: number;
  ordersHandled?: number;
  note?: string;
}

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'NV-ADMIN-01',
    code: '1234',
    name: 'Ngô Thành Phúc Hậu',
    role: 'admin',
    roleTitle: 'Chủ Quán / Quản Lý Cấp Cao',
    phone: '0794999406',
    avatar: '👨‍💼',
    hourlyWage: 55000,
    isActive: true,
    createdAt: '01/01/2026',
  },
  {
    id: 'NV-CASHIER-01',
    code: '1001',
    name: 'Trần Thu Trang',
    role: 'cashier',
    roleTitle: 'Thu Ngân Đứng Quầy (Ca Sáng)',
    phone: '0938112233',
    avatar: '👩‍💼',
    hourlyWage: 28000,
    isActive: true,
    createdAt: '15/02/2026',
  },
  {
    id: 'NV-CASHIER-02',
    code: '1002',
    name: 'Lê Tuấn Kiệt',
    role: 'cashier',
    roleTitle: 'Thu Ngân Đứng Quầy (Ca Chiều)',
    phone: '0977223344',
    avatar: '🧑‍💼',
    hourlyWage: 28000,
    isActive: true,
    createdAt: '01/03/2026',
  },
  {
    id: 'NV-BARISTA-01',
    code: '2001',
    name: 'Phạm Gia Huy',
    role: 'barista',
    roleTitle: 'Trưởng Ca Pha Chế',
    phone: '0912445566',
    avatar: '👨‍🍳',
    hourlyWage: 32000,
    isActive: true,
    createdAt: '10/01/2026',
  },
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'ATT-20260925-01',
    staffId: 'NV-CASHIER-01',
    staffCode: '1001',
    staffName: 'Trần Thu Trang',
    staffRole: 'cashier',
    roleTitle: 'Thu Ngân Đứng Quầy (Ca Sáng)',
    date: '25/09/2026',
    checkInTime: '07:30:12',
    checkOutTime: '15:35:45',
    status: 'completed',
    totalMinutes: 485,
    ordersHandled: 24,
    note: 'Hoàn thành ca sáng tốt, đối soát tiền mặt khớp 100%',
  },
  {
    id: 'ATT-20260925-02',
    staffId: 'NV-BARISTA-01',
    staffCode: '2001',
    staffName: 'Phạm Gia Huy',
    staffRole: 'barista',
    roleTitle: 'Trưởng Ca Pha Chế',
    date: '25/09/2026',
    checkInTime: '08:00:00',
    checkOutTime: '16:00:20',
    status: 'completed',
    totalMinutes: 480,
    ordersHandled: 36,
    note: 'Đã chuẩn bị đầy đủ syrup và thạch cho ca chiều',
  },
  {
    id: 'ATT-20260925-03',
    staffId: 'NV-CASHIER-02',
    staffCode: '1002',
    staffName: 'Lê Tuấn Kiệt',
    staffRole: 'cashier',
    roleTitle: 'Thu Ngân Đứng Quầy (Ca Chiều)',
    date: '25/09/2026',
    checkInTime: '15:30:05',
    status: 'in-shift',
    ordersHandled: 8,
    note: 'Đang trực quầy ca tối',
  },
];
