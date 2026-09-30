import React, { useState, useEffect } from 'react';
import { X, UserPlus, Phone, Award, Coins, Save, CreditCard } from 'lucide-react';
import type { MemberUser, MemberTier } from '../types/user';
import { playSuccessSound } from '../utils/audio';

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: MemberUser) => void;
  initialMember?: MemberUser | null;
}

export const MemberFormModal: React.FC<MemberFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialMember,
}) => {
  const isEditing = Boolean(initialMember);

  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [points, setPoints] = useState<number>(20);
  const [tier, setTier] = useState<MemberTier>('Thành Viên');
  const [totalSpent, setTotalSpent] = useState<number>(0);

  useEffect(() => {
    if (initialMember) {
      setName(initialMember.name);
      setPhone(initialMember.phone);
      setPoints(initialMember.points || 0);
      setTier(initialMember.tier || 'Thành Viên');
      setTotalSpent(initialMember.totalSpent || 0);
    } else {
      setName('');
      setPhone('');
      setPoints(20);
      setTier('Thành Viên');
      setTotalSpent(0);
    }
  }, [initialMember, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\s+/g, '');
    if (!name.trim() || !cleanPhone) return;

    const memberData: MemberUser = {
      id: initialMember?.id || `user-${Date.now()}`,
      name: name.trim(),
      phone: cleanPhone,
      points: Number(points) || 0,
      tier,
      totalSpent: Number(totalSpent) || 0,
      registeredAt: initialMember?.registeredAt || new Date().toLocaleDateString('vi-VN'),
    };

    playSuccessSound(true);
    onSave(memberData);
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
              {isEditing ? 'Sửa Khách Hàng Thành Viên' : 'Thêm Khách Hàng Mới'}
            </h3>
            <p className="text-xs text-[#6F7D74] mt-0.5">
              Quản lý thông tin tài khoản và điểm tích lũy đổi thưởng
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
          {/* Họ và tên */}
          <div>
            <label className="block text-xs font-bold text-[#35423A] mb-1">
              Họ Và Tên Khách Hàng *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Nguyễn Thùy Linh"
              className="w-full bg-[#FAF7F2] border border-[#DDD6C8] rounded-xl px-3.5 py-2 text-sm font-semibold text-[#322821] focus:outline-none focus:border-[#322821]"
            />
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="block text-xs font-bold text-[#35423A] mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#D95829]" />
              <span>Số Điện Thoại (Định danh tài khoản) *</span>
            </label>
            <input
              type="tel"
              required
              disabled={isEditing}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="VD: 0908123456"
              className={`w-full border rounded-xl px-3.5 py-2 text-sm font-mono font-bold focus:outline-none ${
                isEditing
                  ? 'bg-stone-100 text-stone-500 border-stone-200 cursor-not-allowed'
                  : 'bg-[#FAF7F2] border-[#DDD6C8] text-[#322821] focus:border-[#322821]'
              }`}
            />
            {isEditing && (
              <span className="text-[10px] text-[#7A8780] mt-1 block">
                Số điện thoại là mã định danh không thể thay đổi
              </span>
            )}
          </div>

          {/* Hạng thành viên */}
          <div>
            <label className="block text-xs font-bold text-[#35423A] mb-1 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#322821]" />
              <span>Hạng Thẻ Khách Hàng</span>
            </label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value as MemberTier)}
              className="w-full bg-[#FAF7F2] border border-[#DDD6C8] rounded-xl px-3.5 py-2 text-sm font-semibold text-[#322821] focus:outline-none focus:border-[#322821]"
            >
              <option value="Thành Viên">Thành Viên (Tân thủ)</option>
              <option value="Hạng Bạc">Hạng Bạc (Tích lũy từ 1.000.000đ)</option>
              <option value="Hạng Vàng">Hạng Vàng (Tích lũy từ 2.000.000đ)</option>
              <option value="Kim Cương">Kim Cương (VIP từ 5.000.000đ)</option>
            </select>
          </div>

          {/* Điểm tích lũy */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#35423A] mb-1 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                <span>Điểm Thưởng</span>
              </label>
              <input
                type="number"
                min={0}
                value={points}
                onChange={(e) => setPoints(Number(e.target.value) || 0)}
                className="w-full bg-[#FAF7F2] border border-[#DDD6C8] rounded-xl px-3 py-2 text-sm font-bold text-amber-700 focus:outline-none focus:border-[#322821]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#35423A] mb-1 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tổng Tiêu (VNĐ)</span>
              </label>
              <input
                type="number"
                min={0}
                step={10000}
                value={totalSpent}
                onChange={(e) => setTotalSpent(Number(e.target.value) || 0)}
                className="w-full bg-[#FAF7F2] border border-[#DDD6C8] rounded-xl px-3 py-2 text-sm font-semibold text-stone-700 focus:outline-none focus:border-[#322821]"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#DDD6C8] text-[#55635B] hover:bg-[#FAF7F2] text-xs font-bold"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#322821] hover:bg-[#211A15] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md"
            >
              <Save className="w-4 h-4 text-emerald-300" />
              <span>{isEditing ? 'Cập Nhật' : 'Lưu Thành Viên'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
