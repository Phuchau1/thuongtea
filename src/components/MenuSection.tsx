import React, { useState } from 'react';
import { Search, Plus, Leaf, Flame } from 'lucide-react';
import type { FruitTeaItem } from '../types/tea';
import { useOrders } from '../context/OrderContext';

interface MenuSectionProps {
  onSelectTea: (tea: FruitTeaItem) => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({ onSelectTea }) => {
  const { stockStatus, products } = useOrders();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTeas = products.filter((tea) => {
    const matchesCategory =
      activeCategory === 'all' ||
      (activeCategory === 'bestseller' && tea.isBestSeller) ||
      (activeCategory === 'signature' && tea.category === 'signature') ||
      (activeCategory === 'fruit' && tea.category === 'fruit-tea') ||
      (activeCategory === 'milk' && tea.category === 'milk-tea');

    const matchesSearch =
      tea.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tea.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tea.ingredients.some((ing) => ing.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  return (
    <section id="menu" className="py-16 px-4 sm:px-8 bg-[#F5EFE6] text-[#222B25] border-t border-[#EAE3D2]">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Mục Thực Đơn */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#DDD6C8] text-xs font-semibold text-[#322821] mb-2.5 shadow-2xs">
              <Leaf className="w-3.5 h-3.5 text-[#C88B4A]" />
              <span>THỰC ĐƠN THƯỢNG HẠNG • EST 2026</span>
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-4xl text-[#322821] tracking-tight">
              Thực Đơn Trà & Trà Sữa Thượng
            </h2>
            <p className="text-xs sm:text-sm text-[#5C6760] mt-1.5 max-w-xl">
              Chắt lọc tinh hoa từ cốt trà Ô Long Bảo Lộc, trái cây tươi tự nhiên và trà sữa chuẩn vị nghệ nhân.
            </p>
          </div>

          {/* Ô Tìm Kiếm Món */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7F8B83]" />
            <input
              type="text"
              placeholder="Tìm theo loại quả, tên món..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#D5CDBD] rounded-full pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#222B25] placeholder-[#949F98] focus:outline-none focus:border-[#322821] shadow-sm"
            />
          </div>
        </div>

        {/* Tab Phân Loại */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none">
          {[
            { id: 'all', label: `🍃 Tất Cả Món (${products.length})` },
            { id: 'signature', label: '👑 Trà Sen Vàng & Signature' },
            { id: 'fruit', label: '🍑 Trà Trái Cây Tươi' },
            { id: 'milk', label: '🧋 Trà Sữa Đậm Vị' },
            { id: 'bestseller', label: '🔥 Món Bán Chạy Nhất' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-[#322821] text-white shadow-md shadow-[#322821]/20'
                  : 'bg-white border border-[#DDD6C8] text-[#4A554E] hover:bg-[#EBE4D6]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* LƯỚI SẢN PHẨM: ĐIỆN THOẠI 1 HÀNG 2 SẢN PHẨM, MÁY TÍNH 1 HÀNG 4 SẢN PHẨM */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
          {filteredTeas.map((tea) => {
            const isAvailable = stockStatus[tea.id] !== false;

            return (
              <div
                key={tea.id}
                className={`group relative rounded-xl sm:rounded-2xl bg-white border transition-all duration-300 overflow-hidden flex flex-col justify-between p-2.5 sm:p-4 shadow-sm hover:shadow-lg hover:-translate-y-1 ${
                  isAvailable
                    ? 'border-[#E8E1D2] hover:border-[#322821]/40'
                    : 'border-slate-200 opacity-70 bg-slate-50'
                }`}
              >
                <div>
                  {/* Top info & Badge nhỏ gọn */}
                  <div className="flex items-center justify-between gap-1 mb-1.5 sm:mb-2">
                    <span
                      className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2.5 py-0.5 rounded-full border truncate max-w-[80px] sm:max-w-none ${
                        !isAvailable
                          ? 'bg-slate-200 text-slate-700 border-slate-300'
                          : tea.isBestSeller
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : tea.isNew
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : 'bg-[#F5EFE9] text-[#322821] border-[#C5DDD2]'
                      }`}
                    >
                      {!isAvailable ? 'TẠM HẾT' : tea.badge || 'Trà Tươi'}
                    </span>

                    <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-[11px] font-semibold text-[#7C8780] shrink-0">
                      <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#D95829]" />
                      <span>{tea.calories} kcal</span>
                    </div>
                  </div>

                  {/* Hình ảnh ly trà kích thước vừa vặn, cân đối */}
                  <div 
                    onClick={() => isAvailable && onSelectTea(tea)}
                    className={`h-32 sm:h-44 md:h-48 flex items-center justify-center my-1.5 sm:my-2 relative transition-transform duration-300 ${
                      isAvailable ? 'cursor-pointer group-hover:scale-105' : 'cursor-not-allowed opacity-50'
                    }`}
                  >
                    {/* Vòng bóng tròn mờ tự nhiên dưới đáy cốc */}
                    <div 
                      className="absolute bottom-1 w-20 sm:w-28 h-3 sm:h-5 rounded-full blur-md opacity-25 pointer-events-none"
                      style={{ backgroundColor: tea.bg }}
                    />

                    <img
                      src={tea.image}
                      alt={tea.name}
                      loading="lazy"
                      decoding="async"
                      className="max-h-full w-auto object-contain select-none filter drop-shadow-sm"
                      draggable={false}
                    />

                    {!isAvailable && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/75 backdrop-blur-2xs rounded-xl">
                        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-slate-800 text-white text-[9px] sm:text-[11px] font-bold uppercase tracking-wider">
                          Tạm hết
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Tên món tiếng Việt rõ ràng, cỡ vừa phải */}
                  <h3 className="font-display font-bold text-xs sm:text-base text-[#322821] group-hover:text-[#D95829] transition-colors leading-snug line-clamp-1">
                    {tea.name}
                  </h3>

                  {/* Mô tả 1 dòng ngắn gọn, kích thích vị giác */}
                  <p className="text-[10px] sm:text-[11px] text-[#55635B] line-clamp-1 sm:line-clamp-2 leading-relaxed mt-0.5 sm:mt-1">
                    {tea.tagline}
                  </p>

                  {/* Ghi chú hương vị tự nhiên (ẩn trên mobile để thẻ gọn gàng đồng đều) */}
                  <div className="hidden sm:flex items-center gap-1 flex-wrap pt-2.5 mt-2 border-t border-[#F0EAE0]">
                    {tea.flavorNotes.slice(0, 2).map((note, i) => (
                      <span key={i} className="text-[10px] font-medium text-[#49544E] bg-[#F7F3EB] px-2 py-0.5 rounded border border-[#EDE5D6]">
                        • {note}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Phần Chân Card: Giá tiền & Nút Mua gọn gàng */}
                <div className="pt-2 sm:pt-3 mt-2 sm:mt-3 border-t border-[#F0EAE0] flex items-center justify-between gap-1">
                  <div>
                    <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
                      <span className="text-xs sm:text-base font-bold font-sans text-[#D95829]">
                        {formatVND(tea.price)}
                      </span>
                      {tea.originalPrice && (
                        <span className="hidden sm:inline text-[11px] text-[#9FA8A2] line-through font-sans">
                          {formatVND(tea.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => isAvailable && onSelectTea(tea)}
                    disabled={!isAvailable}
                    className={`h-7 sm:h-9 px-2 sm:px-3.5 rounded-full font-bold text-[10px] sm:text-xs uppercase tracking-wide flex items-center gap-1 transition-all shrink-0 ${
                      isAvailable
                        ? 'bg-[#322821] text-white hover:bg-[#211A15] shadow-sm shadow-[#322821]/20 active:scale-95'
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>{isAvailable ? 'CHỌN' : 'HẾT'}</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
