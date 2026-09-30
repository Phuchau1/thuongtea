import React, { useState } from 'react';
import { X, Plus, Minus, Check, ShoppingBag, Flame, Zap } from 'lucide-react';
import type { FruitTeaItem, Topping, CartItem } from '../types/tea';
import { useOrders } from '../context/OrderContext';

interface TeaCustomizerModalProps {
  tea: FruitTeaItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
  onBuyNow?: (item: CartItem) => void;
}

export const TeaCustomizerModal: React.FC<TeaCustomizerModalProps> = ({
  tea,
  isOpen,
  onClose,
  onAddToCart,
  onBuyNow,
}) => {
  const { toppings } = useOrders();
  const availableToppings = toppings.filter((t) => t.isAvailable !== false);
  const [size, setSize] = useState<'M' | 'L'>('M');
  const [sugar, setSugar] = useState<number>(70);
  const [ice, setIce] = useState<number>(70);
  const [selectedToppings, setSelectedToppings] = useState<Topping[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [note, setNote] = useState<string>('');
  const [isAddedSuccess, setIsAddedSuccess] = useState<boolean>(false);

  if (!isOpen || !tea) return null;

  const sizeExtraPrice = size === 'L' ? 8000 : 0;
  const toppingsPrice = selectedToppings.reduce((sum, t) => sum + t.price, 0);
  const unitPrice = tea.price + sizeExtraPrice + toppingsPrice;
  const totalPrice = unitPrice * quantity;

  const toggleTopping = (topping: Topping) => {
    if (selectedToppings.some((t) => t.id === topping.id)) {
      setSelectedToppings(selectedToppings.filter((t) => t.id !== topping.id));
    } else {
      setSelectedToppings([...selectedToppings, topping]);
    }
  };

  const handleConfirmAddToCart = () => {
    const cartItem: CartItem = {
      cartItemId: `${tea.id}-${size}-${sugar}-${ice}-${selectedToppings.map(t => t.id).sort().join('-')}-${Date.now()}`,
      tea,
      size,
      sugar,
      ice,
      toppings: selectedToppings,
      quantity,
      unitPrice,
      totalPrice,
      note,
    };

    onAddToCart(cartItem);
    setIsAddedSuccess(true);
    setTimeout(() => {
      setIsAddedSuccess(false);
      onClose();
    }, 600);
  };

  const handleConfirmBuyNow = () => {
    const cartItem: CartItem = {
      cartItemId: `${tea.id}-${size}-${sugar}-${ice}-${selectedToppings.map(t => t.id).sort().join('-')}-${Date.now()}`,
      tea,
      size,
      sugar,
      ice,
      toppings: selectedToppings,
      quantity,
      unitPrice,
      totalPrice,
      note,
    };

    if (onBuyNow) {
      onBuyNow(cartItem);
    } else {
      onAddToCart(cartItem);
      onClose();
    }
  };

  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden backdrop-blur-md bg-black/60 animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-full sm:max-w-2xl lg:max-w-3xl bg-white rounded-t-[28px] sm:rounded-3xl overflow-hidden shadow-2xl text-[#222B25] z-10 flex flex-col max-h-[92vh] sm:max-h-[90vh] border-t sm:border border-[#E8E1D2] animate-slideUp">
        
        {/* Thanh gạt drag trên điện thoại (Mobile Handle) */}
        <div className="w-12 h-1.5 rounded-full bg-[#D5CDBD] mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        {/* Top Header Với Nền Trắng Kem Tinh Tế & Cân Đối */}
        <div className="relative p-3.5 sm:p-6 flex items-center justify-between border-b border-[#EAE3D2] bg-[#FAF7F2] shrink-0">
          <div className="relative z-10 max-w-[210px] sm:max-w-md pr-2">
            <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#F5EFE9] text-[#322821] border border-[#C5DDD2]">
              {tea.badge || 'Trà Tươi'}
            </span>
            <h2 className="font-display font-black text-lg sm:text-2xl md:text-3xl text-[#322821] mt-1 sm:mt-1.5 leading-tight line-clamp-2">
              {tea.name}
            </h2>
            <div className="flex items-center gap-2 sm:gap-3 mt-1 sm:mt-1.5 text-xs sm:text-sm font-medium text-[#65736B]">
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-[#D95829]" />
                {tea.calories} kcal
              </span>
              <span>•</span>
              <span className="text-[#D95829] font-black text-base sm:text-xl">
                {formatVND(tea.price)}
              </span>
            </div>
          </div>

          {/* Ảnh ly trà cân đối */}
          <div className="relative z-10 w-20 h-24 sm:w-36 sm:h-36 md:w-40 md:h-40 flex items-center justify-center shrink-0 pr-7 sm:pr-0">
            <img
              src={tea.image}
              alt={tea.name}
              className="max-h-full w-auto object-contain filter drop-shadow-md sm:drop-shadow-xl transition-transform hover:scale-105"
            />
          </div>

          {/* Nút đóng */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white text-[#525F57] hover:bg-[#EAE3D2] hover:text-[#222B25] flex items-center justify-center border border-[#DDD6C8] shadow-sm transition-transform active:scale-95 cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Nội Dung Tùy Chỉnh Menu - Cuộn mượt mà trên mobile */}
        <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1 bg-white overscroll-contain">
          
          {/* 1. Chọn Size Ly */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-[#322821]">
                1. Kích Cỡ Ly
              </span>
              <span className="text-[11px] sm:text-xs font-semibold text-[#8A958E]">Bắt buộc</span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setSize('M')}
                className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  size === 'M'
                    ? 'border-[#322821] bg-[#F5EFE9] font-bold text-[#322821] ring-2 ring-[#322821] shadow-2xs'
                    : 'border-[#EAE3D2] bg-[#FAF7F2] text-[#47524A] hover:bg-[#F3EDE2]'
                }`}
              >
                <div>
                  <div className="text-xs sm:text-base font-bold text-[#322821]">Size M (500ml)</div>
                  <div className="text-[10px] sm:text-xs text-[#78857D] font-normal mt-0.5">Tiêu chuẩn</div>
                </div>
                <div className="text-[11px] sm:text-xs font-bold text-[#322821] px-2 py-0.5 bg-white/90 rounded-lg border border-[#DDD6C8]">Cơ bản</div>
              </button>

              <button
                type="button"
                onClick={() => setSize('L')}
                className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  size === 'L'
                    ? 'border-[#322821] bg-[#F5EFE9] font-bold text-[#322821] ring-2 ring-[#322821] shadow-2xs'
                    : 'border-[#EAE3D2] bg-[#FAF7F2] text-[#47524A] hover:bg-[#F3EDE2]'
                }`}
              >
                <div>
                  <div className="text-xs sm:text-base font-bold text-[#322821]">Size L (700ml)</div>
                  <div className="text-[10px] sm:text-xs text-[#78857D] font-normal mt-0.5">Thỏa thích</div>
                </div>
                <div className="text-[11px] sm:text-xs font-extrabold text-[#D95829] px-2 py-0.5 bg-amber-50 rounded-lg border border-amber-200">+8.000 đ</div>
              </button>
            </div>
          </div>

          {/* 2. Mức Đường */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-[#322821]">
                2. Độ Ngọt (Mức Đường Mía)
              </span>
              <span className="text-xs sm:text-sm text-[#322821] font-black bg-amber-100/70 px-2 py-0.5 rounded-lg border border-amber-200">{sugar}%</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5">
              {[100, 70, 50, 30, 0].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSugar(s)}
                  className={`py-2 px-1 sm:py-3 sm:px-2 rounded-xl sm:rounded-2xl border text-center transition-all cursor-pointer ${
                    sugar === s
                      ? 'border-[#322821] bg-[#322821] text-white font-black shadow-md'
                      : 'border-[#EAE3D2] bg-[#FAF7F2] text-[#47524A] hover:bg-[#F3EDE2]'
                  }`}
                >
                  <div className="text-xs sm:text-sm font-extrabold">{s}%</div>
                  <div className={`text-[10px] sm:text-xs mt-0.5 truncate ${sugar === s ? 'text-amber-200 font-semibold' : 'text-stone-500'}`}>
                    {s === 70 ? 'Chuẩn' : s === 0 ? 'Không' : s === 50 ? 'Dịu' : s === 30 ? 'Ít' : 'Ngọt'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Mức Đá */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-[#322821]">
                3. Lượng Đá Mát Lạnh
              </span>
              <span className="text-xs sm:text-sm text-[#322821] font-black bg-amber-100/70 px-2 py-0.5 rounded-lg border border-amber-200">{ice === 0 ? 'Không đá' : `${ice}%`}</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5">
              {[100, 70, 50, 0].map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIce(ic)}
                  className={`py-2 px-1 sm:py-3 sm:px-2 rounded-xl sm:rounded-2xl border text-center transition-all cursor-pointer ${
                    ice === ic
                      ? 'border-[#322821] bg-[#322821] text-white font-black shadow-md'
                      : 'border-[#EAE3D2] bg-[#FAF7F2] text-[#47524A] hover:bg-[#F3EDE2]'
                  }`}
                >
                  <div className="text-xs sm:text-sm font-extrabold">{ic === 0 ? '0%' : `${ic}%`}</div>
                  <div className={`text-[10px] sm:text-xs mt-0.5 truncate ${ice === ic ? 'text-cyan-200 font-semibold' : 'text-stone-500'}`}>
                    {ic === 70 ? 'Vừa phải' : ic === 100 ? 'Nhiều đá' : ic === 50 ? 'Ít đá' : 'Không đá'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Topping - Chuẩn cân đối 1 cột trên điện thoại, 2 cột trên máy tính */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-[#322821]">
                4. Topping Tươi Giòn Thêm
              </span>
              <span className="text-[11px] sm:text-xs font-semibold text-[#8A958E]">Tùy chọn</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
              {availableToppings.map((top) => {
                const isSelected = selectedToppings.some((t) => t.id === top.id);
                return (
                  <button
                    key={top.id}
                    type="button"
                    onClick={() => toggleTopping(top)}
                    className={`py-2.5 px-3 sm:py-3 sm:px-3.5 rounded-xl sm:rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#322821] bg-[#F5EFE9] text-[#322821] font-bold ring-1 ring-[#322821]'
                        : 'border-[#EAE3D2] bg-[#FAF7F2] text-[#47524A] hover:bg-[#F3EDE2]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-md sm:rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? 'bg-[#322821] border-[#322821] text-white' : 'border-[#C2B7A4] bg-white'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />}
                      </div>
                      <span className="text-xs sm:text-sm font-semibold truncate">{top.name}</span>
                    </div>
                    <span className="text-xs sm:text-sm font-extrabold text-[#D95829] shrink-0 ml-2">+{formatVND(top.price)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-[#55625A] mb-1.5">
              Lời nhắn cho Barista pha chế:
            </label>
            <input
              type="text"
              placeholder="VD: Không lấy ống hút, đóng túi riêng từng ly..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[#DDD6C8] rounded-xl sm:rounded-2xl px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm text-[#222B25] placeholder-[#9EA9A2] focus:outline-none focus:border-[#322821] focus:ring-1 focus:ring-[#322821]"
            />
          </div>

        </div>

        {/* Thanh Chốt Đơn Dưới Cùng - Chuẩn cân đối 1 hàng cho điện thoại & máy tính */}
        <div className="p-3 sm:p-4 md:p-5 pb-safe pb-4 sm:pb-5 bg-[#FAF7F2] border-t border-[#EAE3D2] flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Bộ chọn số lượng */}
          <div className="flex items-center gap-1 bg-white rounded-xl sm:rounded-2xl p-1 border border-[#DDD6C8] shadow-2xs shrink-0">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#FAF7F2] hover:bg-[#EAE3D2] active:scale-95 flex items-center justify-center text-[#222B25] transition-transform cursor-pointer"
              title="Giảm số lượng"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-6 sm:w-8 text-center font-black text-sm sm:text-base font-sans">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#FAF7F2] hover:bg-[#EAE3D2] active:scale-95 flex items-center justify-center text-[#222B25] transition-transform cursor-pointer"
              title="Tăng số lượng"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 2 Nút Hành Động: Thêm Giỏ & Đặt Ngay */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Nút 1: Thêm vào giỏ */}
            <button
              type="button"
              onClick={handleConfirmAddToCart}
              className={`py-2.5 sm:py-3.5 px-2.5 sm:px-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm uppercase flex items-center justify-center gap-1 sm:gap-1.5 border border-[#DDD6C8] shadow-2xs transition-all duration-200 active:scale-95 cursor-pointer shrink-0 sm:flex-1 ${
                isAddedSuccess
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white hover:bg-[#F2ECE1] text-[#322821]'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-[#C88B4A] shrink-0" />
              <span className="hidden min-[380px]:inline truncate">{isAddedSuccess ? 'ĐÃ THÊM!' : 'THÊM GIỎ'}</span>
            </button>

            {/* Nút 2: ĐẶT NGAY (Primary) */}
            <button
              type="button"
              onClick={handleConfirmBuyNow}
              className="flex-1 py-2.5 sm:py-3.5 px-3 sm:px-5 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm tracking-wide uppercase flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#D95829] to-[#C88B4A] hover:brightness-105 active:scale-95 text-white shadow-md shadow-[#D95829]/25 transition-all duration-200 cursor-pointer min-w-0"
            >
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white shrink-0" />
              <span className="whitespace-nowrap">ĐẶT NGAY</span>
              <span className="font-sans text-xs sm:text-sm font-extrabold opacity-95 pl-1 border-l border-white/30 truncate">
                {formatVND(totalPrice)}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
