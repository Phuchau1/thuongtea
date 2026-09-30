import React, { useState, useEffect } from 'react';
import { X, Tag, DollarSign, Percent, Save } from 'lucide-react';
import type { Coupon, CouponType } from '../types/coupon';
import { playSuccessSound } from '../utils/audio';

interface CouponFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (coupon: Coupon) => void;
  initialCoupon?: Coupon | null;
}

export const CouponFormModal: React.FC<CouponFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialCoupon,
}) => {
  const isEditing = Boolean(initialCoupon);

  const [code, setCode] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [type, setType] = useState<CouponType>('fixed');
  const [value, setValue] = useState<number>(20000);
  const [minOrderTotal, setMinOrderTotal] = useState<number>(50000);
  const [maxDiscount, setMaxDiscount] = useState<number>(30000);
  const [isActive, setIsActive] = useState<boolean>(true);

  useEffect(() => {
    if (initialCoupon) {
      setCode(initialCoupon.code);
      setDescription(initialCoupon.description);
      setType(initialCoupon.type);
      setValue(initialCoupon.value);
      setMinOrderTotal(initialCoupon.minOrderTotal || 0);
      setMaxDiscount(initialCoupon.maxDiscount || 30000);
      setIsActive(initialCoupon.isActive);
    } else {
      setCode('');
      setDescription('');
      setType('fixed');
      setValue(20000);
      setMinOrderTotal(50000);
      setMaxDiscount(30000);
      setIsActive(true);
    }
  }, [initialCoupon, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase().replace(/\s+/g, '');
    if (!cleanCode) return;

    const couponData: Coupon = {
      id: initialCoupon?.id || `CP-${cleanCode}-${Date.now().toString().slice(-4)}`,
      code: cleanCode,
      description: description.trim() || (type === 'fixed' ? `Giảm ${new Intl.NumberFormat('vi-VN').format(value)}đ cho đơn từ ${new Intl.NumberFormat('vi-VN').format(minOrderTotal)}đ` : `Giảm ${value}% cho đơn từ ${new Intl.NumberFormat('vi-VN').format(minOrderTotal)}đ`),
      type,
      value: Number(value) || 0,
      minOrderTotal: Number(minOrderTotal) || 0,
      maxDiscount: type === 'percent' ? Number(maxDiscount) || undefined : undefined,
      isActive,
      usageCount: initialCoupon?.usageCount || 0,
      createdAt: initialCoupon?.createdAt || new Date().toLocaleDateString('vi-VN'),
    };

    playSuccessSound(true);
    onSave(couponData);
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
          <div className="w-12 h-12 rounded-2xl bg-[#F5EFE9] text-[#D95829] flex items-center justify-center shadow-inner">
            <Tag className="w-6 h-6 text-[#D95829]" />
          </div>
          <div>
            <h3 className="font-display font-bold text-xl text-[#322821]">
              {isEditing ? 'Sửa Mã Giảm Giá' : 'Tạo Mã Giảm Giá Mới'}
            </h3>
            <p className="text-xs text-[#6F7D74] mt-0.5">
              Thiết lập voucher giảm giá theo số tiền hoặc phần trăm
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
          {/* Mã Code */}
          <div>
            <label className="block text-xs font-bold text-[#35423A] mb-1">
              Mã Giảm Giá (Code) *
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="VD: KHUYENMAI20, GIAM10K"
              className="w-full bg-[#FAF7F2] border border-[#DDD6C8] rounded-xl px-3.5 py-2 text-sm font-mono font-bold text-[#D95829] tracking-wider focus:outline-none focus:border-[#322821]"
            />
          </div>

          {/* Loại giảm giá */}
          <div>
            <label className="block text-xs font-bold text-[#35423A] mb-1">
              Hình Thức Giảm Giá *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('fixed')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  type === 'fixed'
                    ? 'bg-[#322821] text-white border-[#322821] shadow-xs'
                    : 'bg-[#FAF7F2] text-[#69776E] border-[#DDD6C8]'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>Số tiền cố định (VNĐ)</span>
              </button>

              <button
                type="button"
                onClick={() => setType('percent')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  type === 'percent'
                    ? 'bg-[#322821] text-white border-[#322821] shadow-xs'
                    : 'bg-[#FAF7F2] text-[#69776E] border-[#DDD6C8]'
                }`}
              >
                <Percent className="w-4 h-4" />
                <span>Theo phần trăm (%)</span>
              </button>
            </div>
          </div>

          {/* Mức giảm */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#35423A] mb-1">
                {type === 'fixed' ? 'Số Tiền Giảm (VNĐ) *' : 'Phần Trăm Giảm (%) *'}
              </label>
              <input
                type="number"
                required
                min={1}
                max={type === 'percent' ? 100 : 1000000}
                step={type === 'percent' ? 1 : 5000}
                value={value}
                onChange={(e) => setValue(Number(e.target.value) || 0)}
                className="w-full bg-[#FAF7F2] border border-[#DDD6C8] rounded-xl px-3 py-2 text-sm font-bold text-[#D95829] focus:outline-none focus:border-[#322821]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#35423A] mb-1">
                Đơn Tối Thiểu (VNĐ)
              </label>
              <input
                type="number"
                min={0}
                step={10000}
                value={minOrderTotal}
                onChange={(e) => setMinOrderTotal(Number(e.target.value) || 0)}
                className="w-full bg-[#FAF7F2] border border-[#DDD6C8] rounded-xl px-3 py-2 text-sm font-semibold text-[#322821] focus:outline-none focus:border-[#322821]"
              />
            </div>
          </div>

          {/* Giảm tối đa nếu là percent */}
          {type === 'percent' && (
            <div>
              <label className="block text-xs font-bold text-[#35423A] mb-1 flex items-center justify-between">
                <span>Giảm Tối Đa (VNĐ)</span>
                <span className="text-[10px] text-[#7A8780]">Hạn mức trần cho voucher %</span>
              </label>
              <input
                type="number"
                min={1000}
                step={5000}
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(Number(e.target.value) || 0)}
                className="w-full bg-[#FAF7F2] border border-[#DDD6C8] rounded-xl px-3.5 py-2 text-sm font-semibold text-[#322821] focus:outline-none focus:border-[#322821]"
              />
            </div>
          )}

          {/* Mô tả hiển thị */}
          <div>
            <label className="block text-xs font-bold text-[#35423A] mb-1">
              Mô Tả Mã Khuyến Mãi (Tùy chọn)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="VD: Giảm 20.000đ cho đơn từ 60.000đ"
              className="w-full bg-[#FAF7F2] border border-[#DDD6C8] rounded-xl px-3.5 py-2 text-sm text-[#322821] focus:outline-none focus:border-[#322821]"
            />
          </div>

          {/* Bật / Tắt kích hoạt */}
          <div className="pt-2 flex items-center justify-between p-3 rounded-2xl bg-[#FAF7F2] border border-[#DDD6C8]">
            <span className="text-xs font-bold text-[#35423A]">Trạng Thái Kích Hoạt</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
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
              <span>{isEditing ? 'Cập Nhật' : 'Tạo Mã Giảm'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
