import React, { useState, useEffect } from 'react';
import { X, UserPlus, KeyRound, ShieldCheck, Save, Phone, DollarSign } from 'lucide-react';
import type { StaffMember, StaffRole } from '../types/staff';
import { playSuccessSound } from '../utils/audio';

interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (staff: StaffMember) => void;
  initialStaff?: StaffMember | null;
}

export const StaffFormModal: React.FC<StaffFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialStaff,
}) => {
  const isEditing = Boolean(initialStaff);

  const [name, setName] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [role, setRole] = useState<StaffRole>('cashier');
  const [phone, setPhone] = useState<string>('');
  const [hourlyWage, setHourlyWage] = useState<number>(28000);
  const [avatar, setAvatar] = useState<string>('👩‍💼');
  const [isActive, setIsActive] = useState<boolean>(true);

  useEffect(() => {
    if (initialStaff) {
      setName(initialStaff.name);
      setCode(initialStaff.code);
      setRole(initialStaff.role);
      setPhone(initialStaff.phone);
      setHourlyWage(initialStaff.hourlyWage || 28000);
      setAvatar(initialStaff.avatar || '👩‍💼');
      setIsActive(initialStaff.isActive);
    } else {
      setName('');
      setCode(String(Math.floor(1000 + Math.random() * 9000)));
      setRole('cashier');
      setPhone('');
      setHourlyWage(28000);
      setAvatar('👩‍💼');
      setIsActive(true);
    }
  }, [initialStaff, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    let roleTitle = 'Thu Ngân Đứng Quầy';
    if (role === 'admin') roleTitle = 'Quản Lý Cấp Cao / Chủ Quán';
    if (role === 'barista') roleTitle = 'Pha Chế / Bếp';

    const staffData: StaffMember = {
      id: initialStaff?.id || `NV-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      code: code.trim(),
      role,
      roleTitle,
      phone: phone.trim(),
      avatar,
      hourlyWage: Number(hourlyWage) || 28000,
      isActive,
      createdAt: initialStaff?.createdAt || new Date().toLocaleDateString('vi-VN'),
    };

    playSuccessSound(true);
    onSave(staffData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl z-10 border border-[#E8E1D2] text-[#222B25] max-h-[92vh] overflow-y-auto">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FAF7F2] text-[#69776E] hover:bg-[#EAE3D2] flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Tiêu đề */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#F5EFE9] text-[#322821] flex items-center justify-center shadow-inner">
            <UserPlus className="w-6 h-6 text-[#322821]" />
          </div>
          <div>
            <h3 className="font-display font-bold text-xl text-[#322821]">
              {isEditing ? 'Cập Nhật Tài Khoản Nhân Viên' : 'Tạo Tài Khoản Nhân Viên Mới'}
            </h3>
            <p className="text-xs text-[#6F7D74] mt-0.5">
              Cấp mã code riêng để nhân viên đăng nhập & chấm công
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
          {/* Họ và tên */}
          <div>
            <label className="block text-xs font-bold text-[#35423A] mb-1">
              Họ Và Tên Nhân Viên *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Nguyễn Văn An"
              className="w-full bg-[#FAF7F2] border border-[#DDD6C8] rounded-xl px-3.5 py-2 text-sm font-semibold text-[#322821] focus:outline-none focus:border-[#322821]"
            />
          </div>

          {/* Mã PIN / Code đăng nhập */}
          <div>
            <label className="block text-xs font-bold text-[#35423A] mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#D95829]" />
                <span>Mã Số Code / PIN Cá Nhân *</span>
              </span>
              <span className="text-[10px] text-[#7A8780]">Dùng để chấm công & mở ca</span>
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="VD: 1003"
              className="w-full bg-[#FAF7F2] border border-[#DDD6C8] rounded-xl px-3.5 py-2 text-sm font-mono font-bold text-[#D95829] tracking-widest focus:outline-none focus:border-[#322821]"
            />
          </div>

          {/* Vai trò / Cấp bậc */}
          <div>
            <label className="block text-xs font-bold text-[#35423A] mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#322821]" />
              <span>Phân Vai Cấp (Quyền Hạn Vào Hệ Thống) *</span>
            </label>
            <select
              value={role}
              onChange={(e) => {
                const r = e.target.value as StaffRole;
                setRole(r);
                if (r === 'admin') setAvatar('👨‍💼');
                else if (r === 'barista') setAvatar('👨‍🍳');
                else setAvatar('👩‍💼');
              }}
              className="w-full bg-[#FAF7F2] border border-[#DDD6C8] rounded-xl px-3.5 py-2 text-xs font-bold text-[#322821] focus:outline-none focus:border-[#322821]"
            >
              <option value="cashier">Thu Ngân (Chỉ POS Quầy, Sơ Đồ Bàn, Chấm Công)</option>
              <option value="barista">Pha Chế (Chỉ Màn Hình Bếp KDS, Chấm Công)</option>
              <option value="admin">Quản Lý Cấp Cao / Chủ Quán (Toàn Quyền Hệ Thống)</option>
            </select>
          </div>

          {/* Số điện thoại & Lương giờ */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#35423A] mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3 text-[#322821]" />
                <span>Số Điện Thoại</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09xx..."
                className="w-full bg-[#FAF7F2] border border-[#DDD6C8] rounded-xl px-3 py-1.5 text-xs text-[#322821] focus:outline-none focus:border-[#322821]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#35423A] mb-1 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-emerald-600" />
                <span>Lương Giờ (VNĐ)</span>
              </label>
              <input
                type="number"
                step="1000"
                value={hourlyWage}
                onChange={(e) => setHourlyWage(Number(e.target.value))}
                placeholder="28000"
                className="w-full bg-[#FAF7F2] border border-[#DDD6C8] rounded-xl px-3 py-1.5 text-xs font-bold text-emerald-700 focus:outline-none focus:border-[#322821]"
              />
            </div>
          </div>

          {/* Chọn Icon đại diện */}
          <div>
            <label className="block text-xs font-bold text-[#35423A] mb-1">
              Biểu Tượng Đại Diện:
            </label>
            <div className="flex gap-2">
              {['👨‍💼', '👩‍💼', '🧑‍💼', '👨‍🍳', '👩‍🍳', '✨'].map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setAvatar(emoji)}
                  className={`w-9 h-9 rounded-xl border text-lg flex items-center justify-center transition-all ${
                    avatar === emoji
                      ? 'border-[#322821] bg-[#F5EFE9] scale-110'
                      : 'border-[#EAE3D2] bg-[#FAF7F2] hover:bg-[#F0EAE0]'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Trạng thái hoạt động */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#37453D]">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-[#322821] focus:ring-0"
              />
              <span>Tài khoản đang hoạt động (Bỏ tích để khóa tạm dừng)</span>
            </label>
          </div>

          {/* Nút Submit */}
          <div className="flex justify-end gap-2 pt-4 border-t border-[#F0EAE0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#DDD6C8] text-xs font-bold text-[#627068] hover:bg-[#F3EDE2] transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#322821] hover:bg-[#211A15] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5 text-emerald-300" />
              <span>{isEditing ? 'Lưu Thay Đổi' : 'Tạo Tài Khoản'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
