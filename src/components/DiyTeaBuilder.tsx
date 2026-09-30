import React, { useState } from 'react';
import { Leaf, Check, Wand2, Edit3 } from 'lucide-react';
import type { CartItem, FruitTeaItem, Topping } from '../types/tea';
import { playSuccessSound } from '../utils/audio';
import { useOrders } from '../context/OrderContext';

const TEA_BASES = [
  { id: 'base-jasmine', name: 'Lục Trà Lài Thượng Hạng', shortName: 'Lục Trà Lài', desc: 'Hương nhài thơm dịu, vị thanh mát giải nhiệt', tag: 'Thanh Nhẹ', icon: '🌿' },
  { id: 'base-oolong', name: 'Trà Ô Long Tứ Quý Mộc', shortName: 'Ô Long Tứ Quý', desc: 'Ủ lạnh giữ trọn hương mộc, hậu ngọt sâu', tag: 'Đậm Vị', icon: '🍂' },
  { id: 'base-ceylon', name: 'Hồng Trà Ceylon Cổ Điển', shortName: 'Hồng Trà Ceylon', desc: 'Màu hổ phách quyến rũ, vị chát êm ái', tag: 'Cổ Điển', icon: '🫖' },
];

const FRUITS = [
  { id: 'f-peach', name: 'Đào Vàng Giòn', shortName: 'Đào Vàng', emoji: '🍑', color: '#F4A261' },
  { id: 'f-strawberry', name: 'Dâu Tây Đà Lạt', shortName: 'Dâu Tây', emoji: '🍓', color: '#E63946' },
  { id: 'f-mango', name: 'Xoài Cát Hòa Lộc', shortName: 'Xoài Cát', emoji: '🥭', color: '#F4C430' },
  { id: 'f-guava', name: 'Ổi Hồng Xá Lị', shortName: 'Ổi Hồng', emoji: '🍈', color: '#F28482' },
  { id: 'f-lychee', name: 'Vải Thiều Lục Ngạn', shortName: 'Vải Thiều', emoji: '🍒', color: '#52B788' },
  { id: 'f-blueberry', name: 'Việt Quất Bắc Mỹ', shortName: 'Việt Quất', emoji: '🫐', color: '#5B5EA6' },
];

interface DiyTeaBuilderProps {
  onAddCustomTea: (item: CartItem) => void;
}

export const DiyTeaBuilder: React.FC<DiyTeaBuilderProps> = ({ onAddCustomTea }) => {
  const { toppings } = useOrders();
  const availableToppings = toppings.filter((t) => t.isAvailable !== false);
  const [selectedBase, setSelectedBase] = useState(TEA_BASES[0]);
  const [selectedFruits, setSelectedFruits] = useState<typeof FRUITS>([FRUITS[0], FRUITS[1]]);
  const [selectedToppings, setSelectedToppings] = useState<Topping[]>(() => [availableToppings[0] || { id: 't1', name: 'Trân châu trắng 3Q giòn', price: 10000 }]);
  const [teaCustomName, setTeaCustomName] = useState<string>('Trà Trái Cây Độc Bản');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const toggleFruit = (fruit: typeof FRUITS[0]) => {
    if (selectedFruits.some((f) => f.id === fruit.id)) {
      if (selectedFruits.length > 1) {
        setSelectedFruits(selectedFruits.filter((f) => f.id !== fruit.id));
      }
    } else {
      if (selectedFruits.length >= 2) {
        setSelectedFruits([selectedFruits[1], fruit]);
      } else {
        setSelectedFruits([...selectedFruits, fruit]);
      }
    }
  };

  const toggleTopping = (topping: Topping) => {
    if (selectedToppings.some((t) => t.id === topping.id)) {
      setSelectedToppings(selectedToppings.filter((t) => t.id !== topping.id));
    } else {
      setSelectedToppings([...selectedToppings, topping]);
    }
  };

  const basePrice = 45000;
  const fruitExtraPrice = (selectedFruits.length - 1) * 6000;
  const toppingsPrice = selectedToppings.reduce((sum, t) => sum + t.price, 0);
  const totalPrice = basePrice + fruitExtraPrice + toppingsPrice;

  const handleAddDiyToCart = () => {
    const customItem: FruitTeaItem = {
      id: `diy-${Date.now()}`,
      name: teaCustomName.trim() || 'Trà Tự Pha Riêng',
      subtitle: `${selectedBase.shortName} + ${selectedFruits.map((f) => f.shortName).join(' & ')}`,
      tagline: 'Công thức độc bản được sáng tạo bởi bạn tại Thượng Studio',
      price: totalPrice,
      category: 'signature',
      image: '/teas/tra-dao-cam-sa.png',
      bg: selectedFruits[0].color,
      panel: selectedFruits[1]?.color || selectedFruits[0].color,
      description: `Cốt trà: ${selectedBase.name}. Trái cây: ${selectedFruits.map((f) => f.name).join(', ')}.`,
      ingredients: [selectedBase.name, ...selectedFruits.map((f) => f.name), ...selectedToppings.map((t) => t.name)],
      calories: 150,
      sweetnessDefault: 70,
      iceDefault: 70,
      badge: 'TỰ SÁNG TẠO',
      flavorNotes: ['Vị riêng độc bản', '100% Trái cây tươi'],
    };

    const cartItem: CartItem = {
      cartItemId: `diy-${Date.now()}`,
      tea: customItem,
      size: 'L',
      sugar: 70,
      ice: 70,
      toppings: selectedToppings,
      quantity: 1,
      unitPrice: totalPrice,
      totalPrice: totalPrice,
      note: 'Ly tự sáng tạo công thức',
    };

    onAddCustomTea(cartItem);
    playSuccessSound(true);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 2000);
  };

  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  return (
    <section id="diy-builder" className="py-12 sm:py-20 px-3.5 sm:px-6 lg:px-8 bg-[#FAF7F2] text-[#222B25] border-t border-[#EAE3D2] relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Tiêu đề mục Tự Mix Vị */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF4EB] border border-[#DDD6C8] text-[11px] sm:text-xs font-semibold text-[#8B5E3C] mb-2 shadow-2xs">
            <Leaf className="w-3.5 h-3.5 text-[#C88B4A]" />
            <span className="tracking-wider uppercase">QUẦY PHA CHẾ THỬ VỊ</span>
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-4xl lg:text-5xl text-[#322821] tracking-tight">
            Tự Sáng Tạo Ly Trà Của Bạn
          </h2>
          <p className="text-xs sm:text-sm text-[#5C6760] mt-1.5 max-w-md mx-auto leading-relaxed">
            Tự do phối hợp cốt trà hảo hạng và các loại hoa quả tươi chín mọng theo đúng gu sở thích của bạn.
          </p>
        </div>

        {/* ======================================================== */}
        {/* BẢNG ĐIỀU KHIỂN PHA CHẾ (TỐI ƯU CỰC KỲ DỄ DÙNG TRÊN ĐIỆN THOẠI) */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-stretch">
          
          {/* CỘT TRÁI / TRÊN CÙNG: KHU VỰC XEM TRƯỚC MÔ PHỎNG LY TRÀ */}
          <div className="lg:col-span-5 bg-white border border-[#E8E1D2] rounded-2xl sm:rounded-3xl p-4 sm:p-7 flex flex-col justify-between shadow-xs relative">
            
            {/* Phiên bản Desktop (Ảnh to, đầy đủ không gian) */}
            <div className="hidden lg:flex flex-col items-center justify-between h-full">
              <div className="w-full text-center">
                <span className="text-xs font-bold text-[#8A958E] uppercase tracking-wider">
                  Mô Phỏng Trực Quan
                </span>
              </div>

              {/* Ly trà trung tâm */}
              <div className="relative my-8 flex items-center justify-center">
                <div 
                  className="absolute inset-0 rounded-full blur-3xl opacity-25 transition-colors duration-500 pointer-events-none"
                  style={{ backgroundColor: selectedFruits[0]?.color }}
                />
                <img
                  src="/teas/tra-dao-cam-sa.png"
                  alt="Trà phối vị"
                  className="max-h-72 w-auto object-contain filter drop-shadow-xl select-none"
                />

                {/* Tag nguyên liệu nổi bật */}
                <div className="absolute top-2 -right-2 bg-white border border-[#E5DEC9] px-3 py-1 rounded-full text-xs font-bold text-[#322821] shadow-md animate-bounce">
                  {selectedFruits[0]?.emoji} {selectedFruits[0]?.name}
                </div>
                {selectedFruits[1] && (
                  <div className="absolute bottom-8 -left-2 bg-white border border-[#E5DEC9] px-3 py-1 rounded-full text-xs font-bold text-[#322821] shadow-md">
                    {selectedFruits[1]?.emoji} {selectedFruits[1]?.name}
                  </div>
                )}
              </div>

              {/* Đặt tên ly trà */}
              <div className="w-full">
                <label className="block text-xs font-bold text-[#4B564F] mb-1.5">
                  Đặt tên cho ly trà của bạn:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={teaCustomName}
                    onChange={(e) => setTeaCustomName(e.target.value)}
                    placeholder="Nhập tên ly trà..."
                    maxLength={35}
                    className="w-full bg-[#FAF7F2] border border-[#DDD6C8] rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#322821] focus:outline-none focus:border-[#322821]"
                  />
                  <Edit3 className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Phiên bản Mobile (Card nhỏ gọn, thông minh, không chiếm màn hình) */}
            <div className="flex lg:hidden items-center gap-3">
              {/* Ly trà nhỏ gọn với hiệu ứng hào quang */}
              <div className="relative w-24 h-28 shrink-0 flex items-center justify-center bg-[#FAF5EC] rounded-2xl border border-[#EAE3D2] overflow-hidden">
                <div 
                  className="absolute inset-0 rounded-full blur-xl opacity-40 transition-colors duration-500"
                  style={{ backgroundColor: selectedFruits[0]?.color }}
                />
                <img
                  src="/teas/tra-dao-cam-sa.png"
                  alt="Trà phối vị"
                  className="max-h-24 w-auto object-contain filter drop-shadow-md z-10"
                />
              </div>

              {/* Tóm tắt nhanh thành phần đã chọn & Đặt tên */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-bold text-[#8B5E3C] uppercase tracking-wider bg-[#FAF4EB] px-2 py-0.5 rounded-full border border-[#EAE3D2]">
                    Công Thức Của Bạn
                  </span>
                </div>

                <div className="relative mb-2">
                  <input
                    type="text"
                    value={teaCustomName}
                    onChange={(e) => setTeaCustomName(e.target.value)}
                    placeholder="Đặt tên ly trà..."
                    maxLength={30}
                    className="w-full bg-[#FAF7F2] border border-[#DDD6C8] rounded-lg px-2.5 py-1 text-xs font-bold text-[#322821] focus:outline-none focus:border-[#322821]"
                  />
                </div>

                {/* Các tag nguyên liệu đã chọn trên mobile */}
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[10px] font-medium bg-[#F0EAE0] text-[#322821] px-2 py-0.5 rounded-md border border-[#E5DEC9]">
                    {selectedBase.icon} {selectedBase.shortName}
                  </span>
                  {selectedFruits.map((f) => (
                    <span key={f.id} className="text-[10px] font-medium bg-[#FDF2ED] text-[#D95829] px-2 py-0.5 rounded-md border border-[#F3D5C8]">
                      {f.emoji} {f.shortName}
                    </span>
                  ))}
                  {selectedToppings.length > 0 && (
                    <span className="text-[10px] font-medium bg-[#EBF7F0] text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                      +{selectedToppings.length} topping
                    </span>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* CỘT PHẢI: BẢNG CHỌN NGUYÊN LIỆU (THIẾT KẾ CỰC KỲ DỄ THAO TÁC) */}
          <div className="lg:col-span-7 bg-white border border-[#E8E1D2] rounded-2xl sm:rounded-3xl p-4 sm:p-7 space-y-5 sm:space-y-6 shadow-xs">
            
            {/* BƯỚC 1: CHỌN CỐT TRÀ Ủ LẠNH 12H */}
            <div>
              <div className="flex items-center justify-between mb-2 sm:mb-2.5">
                <span className="font-bold text-xs sm:text-sm text-[#322821] uppercase tracking-wide flex items-center gap-1.5 sm:gap-2">
                  <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#322821] text-white text-[10px] sm:text-xs flex items-center justify-center font-bold">1</span>
                  <span>Chọn Cốt Trà Ủ Lạnh 12H</span>
                </span>
                <span className="text-[11px] text-[#8A958E] font-medium">Bắt buộc (1 loại)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
                {TEA_BASES.map((base) => {
                  const isSelected = selectedBase.id === base.id;
                  return (
                    <button
                      key={base.id}
                      onClick={() => setSelectedBase(base)}
                      className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border text-left transition-all active:scale-[0.98] ${
                        isSelected
                          ? 'border-[#322821] bg-[#F5EFE9] ring-1 ring-[#322821]'
                          : 'border-[#EAE3D2] bg-[#FAF7F2] hover:bg-[#F3EDE2]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-[#322821]">
                          <span>{base.icon}</span>
                          <span>{base.name}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#322821] stroke-[2.5]" />}
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-[#69756D] mt-1 leading-tight line-clamp-2">
                        {base.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BƯỚC 2: CHỌN 2 LOẠI TRÁI CÂY TƯƠI MỌNG (LƯỚI 3 CỘT TIỆN BẤM TRÊN MOBILE) */}
            <div>
              <div className="flex items-center justify-between mb-2 sm:mb-2.5">
                <span className="font-bold text-xs sm:text-sm text-[#D95829] uppercase tracking-wide flex items-center gap-1.5 sm:gap-2">
                  <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#D95829] text-white text-[10px] sm:text-xs flex items-center justify-center font-bold">2</span>
                  <span>Chọn 2 Loại Trái Cây</span>
                </span>
                <span className="text-[10px] sm:text-xs font-bold text-[#D95829] bg-[#FDF2ED] px-2.5 py-0.5 rounded-full border border-[#F3D5C8]">
                  Đã chọn: {selectedFruits.length}/2
                </span>
              </div>

              {/* Lưới 3 cột trên mobile giúp bấm cực nhanh, không kéo dài màn hình */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {FRUITS.map((fruit) => {
                  const isSelected = selectedFruits.some((f) => f.id === fruit.id);
                  return (
                    <button
                      key={fruit.id}
                      onClick={() => toggleFruit(fruit)}
                      className={`p-2 sm:p-2.5 rounded-xl border text-left flex items-center justify-between transition-all active:scale-[0.98] ${
                        isSelected
                          ? 'border-[#D95829] bg-[#FDF2ED] font-bold text-[#D95829] ring-1 ring-[#D95829] shadow-2xs'
                          : 'border-[#EAE3D2] bg-[#FAF7F2] text-[#333C35] hover:bg-[#F3EDE2]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-base">{fruit.emoji}</span>
                        <span className="line-clamp-1">{fruit.name}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#D95829] stroke-[2.5] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BƯỚC 3: TOPPING THÊM GIÒN DAI */}
            <div>
              <div className="flex items-center justify-between mb-2 sm:mb-2.5">
                <span className="font-bold text-xs sm:text-sm text-[#322821] uppercase tracking-wide flex items-center gap-1.5 sm:gap-2">
                  <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#322821] text-white text-[10px] sm:text-xs flex items-center justify-center font-bold">3</span>
                  <span>Topping Thêm Giòn Dai</span>
                </span>
                <span className="text-[11px] text-[#8A958E]">Tùy chọn</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {availableToppings.slice(0, 6).map((top) => {
                  const isSelected = selectedToppings.some((t) => t.id === top.id);
                  return (
                    <button
                      key={top.id}
                      onClick={() => toggleTopping(top)}
                      className={`p-2 sm:p-2.5 rounded-xl border text-left flex items-center justify-between transition-all text-xs active:scale-[0.98] ${
                        isSelected
                          ? 'border-[#322821] bg-[#F5EFE9] text-[#322821] font-bold shadow-2xs'
                          : 'border-[#EAE3D2] bg-[#FAF7F2] text-[#47524A] hover:bg-[#F3EDE2]'
                      }`}
                    >
                      <span className="line-clamp-1">{top.name}</span>
                      <span className="text-[#D95829] font-bold text-[11px] shrink-0 ml-1">
                        +{formatVND(top.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CHÂN BẢNG: TỔNG TIỀN & NÚT THÊM VÀO GIỎ (RÕ RÀNG, DỄ BẤM VỚI NGÓN CÁI) */}
            <div className="pt-3.5 border-t border-[#EAE3D2] flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] sm:text-xs text-[#7B867E]">Tổng tiền ly (Size L):</div>
                <div className="font-sans font-extrabold text-xl sm:text-2xl text-[#D95829]">
                  {formatVND(totalPrice)}
                </div>
              </div>

              <button
                onClick={handleAddDiyToCart}
                className={`h-11 sm:h-12 px-5 sm:px-7 rounded-full font-bold text-xs sm:text-sm tracking-wide uppercase flex items-center gap-2 shadow-md transition-all active:scale-95 ${
                  isSuccess
                    ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                    : 'bg-[#322821] hover:bg-[#211A15] text-white shadow-[#322821]/25'
                }`}
              >
                <Wand2 className="w-4 h-4 text-[#F4A261]" />
                <span>{isSuccess ? 'ĐÃ THÊM VÀO GIỎ!' : 'THÊM VÀO GIỎ HÀNG'}</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
