import React, { useState, useEffect } from 'react';
import { X, Sparkles, Save } from 'lucide-react';
import type { Topping } from '../types/tea';
import { playSuccessSound } from '../utils/audio';

interface ToppingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (topping: Topping) => void;
  initialTopping?: Topping | null;
}

const PRESET_CATEGORIES = [
  'Trân châu',
  'Thạch & Trái cây',
  'Kem & Bọt',
  'Hạt ngũ cốc',
  'Topping Đặc Biệt',
  'Khác',
];

export const ToppingFormModal: React.FC<ToppingFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTopping,
}) => {
  const isEditing = Boolean(initialTopping);

  const [name, setName] = useState<string>('');
  const [price, setPrice] = useState<number>(10000);
  const [category, setCategory] = useState<string>('Trân châu');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [isAvailable, setIsAvailable] = useState<boolean>(true);

  useEffect(() => {
    if (initialTopping) {
      setName(initialTopping.name);
      setPrice(initialTopping.price);
      setIsAvailable(initialTopping.isAvailable !== false);
      const cat = initialTopping.category || 'Trân châu';
      if (PRESET_CATEGORIES.includes(cat)) {
        setCategory(cat);
        setCustomCategory('');
      } else {
        setCategory('Khác');
        setCustomCategory(cat);
      }
    } else {
      setName('');
      setPrice(10000);
      setCategory('Trân châu');
      setCustomCategory('');
      setIsAvailable(true);
    }
  }, [initialTopping, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Vui lòng nhập tên Topping!');
      return;
    }
    if (price < 0) {
      alert('Giá tiền không thể âm!');
      return;
    }

    const finalCategory = category === 'Khác' && customCategory.trim() ? customCategory.trim() : category;

    const toppingData: Topping = {
      id: initialTopping ? initialTopping.id : `t-${Date.now()}`,
      name: name.trim(),
      price: Number(price),
      category: finalCategory,
      isAvailable: isAvailable,
    };

    onSave(toppingData);
    playSuccessSound();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-emerald-100 flex flex-col my-8 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-sm">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold tracking-wide">
                {isEditing ? 'Chỉnh Sửa Topping' : 'Thêm Topping Mới'}
              </h2>
              <p className="text-xs text-emerald-200/80">
                {isEditing ? `Mã: ${initialTopping?.id}` : 'Thêm topping hoặc phụ liệu pha chế'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Tên Topping */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Tên Topping / Phụ Liệu <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Trân châu đường đen, Kem Cheese tươi, Thạch củ năng..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium text-gray-800 transition-all text-sm"
            />
          </div>

          {/* Giá phụ thu */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Giá Phụ Thu (VNĐ) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                ₫
              </span>
              <input
                type="number"
                required
                min={0}
                step={1000}
                placeholder="10000"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-bold text-emerald-800 transition-all text-sm"
              />
            </div>
            <div className="flex gap-2 mt-2">
              {[5000, 8000, 10000, 12000, 15000].map((quickPrice) => (
                <button
                  type="button"
                  key={quickPrice}
                  onClick={() => setPrice(quickPrice)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                    price === quickPrice
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
                  }`}
                >
                  +{quickPrice.toLocaleString('vi-VN')}đ
                </button>
              ))}
            </div>
          </div>

          {/* Phân Loại */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Nhóm Phân Loại
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {PRESET_CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                    category === cat
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-bold ring-1 ring-emerald-600 shadow-sm'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {category === 'Khác' && (
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Nhập tên nhóm phân loại tự chọn..."
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm"
                />
              </div>
            )}
          </div>

          {/* Tình Trạng Phục Vụ */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
            <div>
              <span className="block text-xs font-bold text-gray-800">
                Trạng Thái Phục Vụ
              </span>
              <span className="text-xs text-gray-500">
                {isAvailable ? 'Đang sẵn sàng phục vụ khách' : 'Tạm hết nguyên liệu / ẩn khỏi menu'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsAvailable(!isAvailable)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                isAvailable ? 'bg-emerald-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-md ${
                  isAvailable ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-800 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isEditing ? 'Cập Nhật Topping' : 'Lưu Topping Mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
