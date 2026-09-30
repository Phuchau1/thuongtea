import React, { useState } from 'react';
import { X, Award, Phone, User, Crown, LogOut, ArrowRight } from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { playClickSound, playSuccessSound } from '../utils/audio';

interface MemberLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MemberLoginModal: React.FC<MemberLoginModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, loginMember, logoutMember, members } = useOrders();
  const [phone, setPhone] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\s+/g, '');
    if (!cleanPhone || cleanPhone.length < 9) {
      setErrorMsg('Vui lòng nhập số điện thoại hợp lệ (từ 10 số)!');
      return;
    }

    playSuccessSound(true);
    loginMember(cleanPhone, name.trim() || undefined);
    setErrorMsg(null);
    onClose();
  };

  const handleSelectSample = (samplePhone: string, sampleName: string) => {
    playClickSound(true);
    loginMember(samplePhone, sampleName);
    onClose();
  };

  const handleLogout = () => {
    playClickSound(true);
    logoutMember();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl z-10 border border-[#E8E1D2] text-[#222B25]">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FAF7F2] text-[#69776E] hover:bg-[#EAE3D2] flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* NẾU ĐÃ ĐĂNG NHẬP: HIỂN THỊ THẺ THÀNH VIÊN VÀ ĐIỂM */}
        {currentUser ? (
          <div className="text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-[#F5EFE9] text-[#322821] flex items-center justify-center mx-auto shadow-inner">
              <Award className="w-8 h-8 text-[#D95829]" />
            </div>

            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold mb-2">
                ⭐ {currentUser.tier}
              </div>
              <h3 className="font-display font-bold text-2xl text-[#322821]">
                {currentUser.name}
              </h3>
              <p className="text-xs font-mono text-[#6A7870] mt-0.5">
                {currentUser.phone}
              </p>
            </div>

            {/* Thẻ Điểm Sang Trọng */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#322821] to-[#211A15] text-white text-left shadow-lg relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 rounded-full bg-white/5 blur-xl pointer-events-none" />
              <div className="flex items-center justify-between text-xs text-emerald-200">
                <span>ĐIỂM TÍCH LŨY KHÁCH HÀNG</span>
                <span>THƯỢNG MEMBER</span>
              </div>
              <div className="font-sans font-extrabold text-3xl sm:text-4xl text-[#F4A261] mt-2 mb-3">
                {currentUser.points} <span className="text-lg font-normal text-white/80">điểm</span>
              </div>
              <div className="text-[11px] text-white/70 border-t border-white/10 pt-2 flex items-center justify-between">
                <span>Tổng chi tiêu: {new Intl.NumberFormat('vi-VN').format(currentUser.totalSpent)} đ</span>
                <span>10.000đ = 1 điểm</span>
              </div>
            </div>

            {/* Quyền lợi thành viên */}
            <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8E1D2] text-xs text-left text-[#55635B] space-y-1">
              <div className="font-bold text-[#322821] flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <span>Quyền lợi độc quyền của bạn:</span>
              </div>
              <div>• Dùng 50 điểm để trừ 20.000đ trực tiếp khi thanh toán</div>
              <div>• Tự động tích lũy điểm khi gọi món tại bàn hoặc giao hàng</div>
              <div>• Ưu đãi tặng topping miễn phí trong tháng sinh nhật</div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-full bg-[#322821] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#211A15] transition-all shadow-md"
              >
                Tiếp Tục Đặt Trà
              </button>
              <button
                onClick={handleLogout}
                className="py-3 px-4 rounded-full border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-all flex items-center gap-1"
                title="Đăng xuất tài khoản"
              >
                <LogOut className="w-4 h-4" />
                <span>Thoát</span>
              </button>
            </div>
          </div>
        ) : (
          /* NẾU CHƯA ĐĂNG NHẬP: FORM NHẬP SĐT TÍCH ĐIỂM */
          <div>
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#F5EFE9] text-[#322821] flex items-center justify-center mx-auto mb-2.5 shadow-sm">
                <Award className="w-6 h-6 text-[#D95829]" />
              </div>
              <h3 className="font-display font-bold text-xl sm:text-2xl text-[#322821]">
                Đăng Nhập Tích Điểm
              </h3>
              <p className="text-xs text-[#6A7870] mt-1">
                Tích lũy 1 điểm cho mỗi 10.000đ • Tặng ngay <strong className="text-[#D95829]">20 điểm</strong> cho thành viên mới
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#35423A] mb-1">
                  Số Điện Thoại <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7E8C83]" />
                  <input
                    type="tel"
                    required
                    placeholder="Ví dụ: 0908 123 456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#DDD6C8] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#222B25] placeholder-[#909D95] focus:outline-none focus:border-[#322821] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#35423A] mb-1">
                  Họ Và Tên (Tùy chọn)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7E8C83]" />
                  <input
                    type="text"
                    placeholder="Ví dụ: Nguyễn Văn A"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#DDD6C8] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#222B25] placeholder-[#909D95] focus:outline-none focus:border-[#322821]"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="text-xs text-red-600 font-semibold text-center bg-red-50 py-1.5 rounded-lg border border-red-200">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-[#322821] hover:bg-[#211A15] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#322821]/25 transition-all flex items-center justify-center gap-2"
              >
                <span>ĐĂNG NHẬP & TÍCH ĐIỂM</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Chọn nhanh tài khoản mẫu để trải nghiệm */}
            <div className="mt-6 pt-4 border-t border-[#F0EAE0]">
              <div className="text-[11px] font-bold text-[#7A8780] uppercase tracking-wider mb-2.5">
                Hoặc chọn nhanh tài khoản có sẵn:
              </div>
              <div className="space-y-1.5">
                {members.slice(0, 2).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleSelectSample(m.phone, m.name)}
                    className="w-full p-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#EAE3D2] border border-[#DDD6C8] text-left flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <span className="font-bold text-[#322821]">{m.name}</span>
                      <span className="text-[#7A8780] font-mono ml-2">({m.phone})</span>
                    </div>
                    <span className="font-bold text-[#D95829] font-mono bg-white px-2 py-0.5 rounded border border-[#E2DAD0]">
                      ⭐ {m.points} đ
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
