import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowLeft, ArrowRight, Leaf, ShoppingBag, Phone, 
  Truck, ChevronRight, Eye, Bike, UtensilsCrossed, Award, Menu, X 
} from 'lucide-react';
import { FRUIT_TEAS } from '../data/teas';
import type { FruitTeaItem } from '../types/tea';
import { useOrders } from '../context/OrderContext';
import { playSwooshSound, playClickSound } from '../utils/audio';

interface FruitTeaHeroProps {
  onSelectTea: (tea: FruitTeaItem) => void;
  cartCount: number;
  onOpenCart: () => void;
  servingPreference: 'delivery' | 'dine-in';
  onChangeServingPreference: (mode: 'delivery' | 'dine-in') => void;
  tableNumber: string;
  onChangeTableNumber: (table: string) => void;
  onOpenTracker: () => void;
  onOpenMemberModal?: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const FruitTeaHero: React.FC<FruitTeaHeroProps> = ({
  onSelectTea,
  cartCount,
  onOpenCart,
  servingPreference,
  onChangeServingPreference,
  tableNumber,
  onChangeTableNumber,
  onOpenTracker,
  onOpenMemberModal,
  soundEnabled,
  onToggleSound,
}) => {
  const { activeCustomerOrder, currentUser, products, getTableStatus, allTablesList } = useOrders();
  const heroTeas = products && products.length > 0 ? products : FRUIT_TEAS;
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') return window.innerWidth < 768;
    return false;
  });

  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const count = heroTeas.length;

  const navigate = useCallback((direction: 'next' | 'prev') => {
    if (isAnimating) return;
    setIsAnimating(true);
    playSwooshSound(soundEnabled);

    setActiveIndex((prev) => {
      if (direction === 'next') return (prev + 1) % count;
      return (prev + count - 1) % count;
    });

    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  }, [isAnimating, count, soundEnabled]);

  const goToIndex = useCallback((index: number) => {
    if (isAnimating || index === activeIndex) return;
    setIsAnimating(true);
    playSwooshSound(soundEnabled);
    setActiveIndex(index % count);

    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  }, [isAnimating, activeIndex, count, soundEnabled]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) navigate('prev');
      else navigate('next');
    }
    touchStartX.current = null;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    const { clientX, clientY, currentTarget } = e;
    const { width, height, left, top } = currentTarget.getBoundingClientRect();
    const x = ((clientX - left) / width - 0.5) * 2;
    const y = ((clientY - top) / height - 0.5) * 2;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  const currentTea = heroTeas[activeIndex] || heroTeas[0];

  const getRole = (index: number): 'center' | 'left' | 'right' | 'back' => {
    if (index === activeIndex) return 'center';
    if (index === (activeIndex + count - 1) % count) return 'left';
    if (index === (activeIndex + 1) % count) return 'right';
    return 'back';
  };

  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  return (
    <div className="relative w-full bg-[#FAF7F2] text-[#222B25] overflow-hidden">
      {/* Top Banner Thông Báo */}
      <div className="bg-[#322821] text-white text-[11px] sm:text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
        <span className="flex items-center gap-1.5 whitespace-nowrap">
          <Truck className="w-3.5 h-3.5 text-[#F4A261] shrink-0" />
          <span className="whitespace-nowrap">Freeship cho đơn hàng từ 99.000đ</span>
        </span>
        <span className="hidden sm:inline opacity-40">•</span>
        <span className="hidden sm:flex items-center gap-1.5 whitespace-nowrap">
          <Leaf className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="whitespace-nowrap">Tặng mã <strong className="text-yellow-300">FRESH20</strong> giảm 20.000đ cho đơn đầu tiên</span>
        </span>
        <span className="hidden md:inline opacity-40">•</span>
        <span className="hidden md:flex items-center gap-1.5 whitespace-nowrap">
          <Phone className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
          <span className="whitespace-nowrap">Hotline đặt giao nhanh: <strong>1900 8866</strong></span>
        </span>
      </div>

      {/* Main Header Chuẩn Website Khách Hàng F&B */}
      <header className="sticky top-0 z-50 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#EAE3D2] transition-colors">
        <div className="w-full max-w-[1700px] mx-auto px-3 sm:px-6 lg:px-8 h-15 sm:h-20 flex items-center justify-between gap-2 sm:gap-3 lg:gap-5 xl:gap-8">
          
          {/* Logo & Tên Quán (Sử dụng biểu tượng Búp Trà thuần tự nhiên, KHÔNG icon AI) */}
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0" onClick={() => goToIndex(0)}>
            <img 
              src="/logo-icon.png" 
              alt="Thượng Logo" 
              className="w-9 h-9 sm:w-11 sm:h-11 object-contain drop-shadow-xs shrink-0" 
            />
            <div className="shrink-0">
              <div className="font-display font-black text-lg sm:text-2xl text-[#322821] tracking-wider leading-none uppercase whitespace-nowrap">
                THƯỢNG
              </div>
              <p className="text-[9px] sm:text-[10px] text-[#6B6058] font-bold tracking-widest uppercase mt-0.5 flex items-center gap-1.5 whitespace-nowrap">
                <span>TRÀ & TRÀ SỮA</span>
                <span className="opacity-40">•</span>
                <span className="text-[#C88B4A]">EST 2026</span>
              </p>
            </div>
          </div>

          {/* Thanh Chọn Phương Thức Trên Desktop: Giao Tận Nơi vs Tại Bàn */}
          <div className="hidden lg:flex items-center p-1 bg-[#F0EAE0] rounded-2xl border border-[#DDD5C5] shrink-0">
            <button
              onClick={() => onChangeServingPreference('delivery')}
              className={`flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                servingPreference === 'delivery'
                  ? 'bg-[#322821] text-white shadow-sm'
                  : 'text-[#506056] hover:text-[#322821]'
              }`}
            >
              <Bike className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">GIAO TẬN NƠI</span>
            </button>
            <button
              onClick={() => onChangeServingPreference('dine-in')}
              className={`flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                servingPreference === 'dine-in'
                  ? 'bg-[#322821] text-white shadow-sm'
                  : 'text-[#506056] hover:text-[#322821]'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">NGỒI TẠI BÀN {servingPreference === 'dine-in' && tableNumber ? `(${tableNumber})` : ''}</span>
            </button>
          </div>

          {/* Navigation Links Tiếng Việt Chuẩn Trên Desktop */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7 2xl:gap-8 text-sm font-medium text-[#37413A] shrink-0">
            <a href="#hero" className="text-[#322821] font-bold border-b-2 border-[#322821] pb-1 whitespace-nowrap shrink-0">Trang Chủ</a>
            <a href="#menu" className="hover:text-[#322821] transition-colors whitespace-nowrap shrink-0">Thực Đơn</a>
            <a href="#diy-builder" className="hover:text-[#322821] transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0">
              <span className="whitespace-nowrap">Tự Mix Vị</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#E0633A] text-white whitespace-nowrap">Mới</span>
            </a>
            <a href="#story" className="hover:text-[#322821] transition-colors whitespace-nowrap shrink-0">Không Gian Quán</a>
          </nav>

          {/* Right Action Tools (Tối ưu cho cả điện thoại và máy tính, KHÔNG BAO GIỜ BỊ MẤT NÚT GIỎ HÀNG) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 lg:gap-3 shrink-0">
            
            {/* Nút Theo dõi đơn hàng của khách nếu có đơn (Rút gọn chữ trên mobile) */}
            {activeCustomerOrder && (
              <button
                onClick={onOpenTracker}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#F5EFE9] text-[#322821] border border-[#C5DDD2] text-[11px] sm:text-xs font-bold shadow-2xs hover:bg-[#d9ede3] transition-colors whitespace-nowrap shrink-0"
                title="Xem tiến độ pha chế ly trà của bạn"
              >
                <Eye className="w-3 h-3 text-[#D95829] animate-pulse shrink-0" />
                <span className="whitespace-nowrap"><span className="hidden sm:inline">Tiến Độ </span>#{activeCustomerOrder.orderNumber}</span>
              </button>
            )}

            {/* Nút Đăng nhập & Tích Điểm (Hiện trên tablet & desktop, trên mobile có trong drawer) */}
            <button
              onClick={onOpenMemberModal}
              className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-all shadow-2xs ${
                currentUser
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                  : 'bg-white border border-[#DDD6C8] hover:border-[#322821] text-[#322821]'
              }`}
              title={currentUser ? 'Xem thẻ thành viên và điểm tích lũy' : 'Đăng nhập tích điểm'}
            >
              <Award className="w-3.5 h-3.5 text-[#D95829] shrink-0" />
              {currentUser ? (
                <span className="whitespace-nowrap">⭐ {currentUser.points} đ</span>
              ) : (
                <span className="whitespace-nowrap">Tích Điểm</span>
              )}
            </button>

            {/* Nút Âm Thanh */}
            <button
              onClick={() => {
                onToggleSound();
                playClickSound(true);
              }}
              className="hidden md:flex w-10 h-10 rounded-full border border-[#DDD6C8] bg-white text-[#4A554E] items-center justify-center hover:bg-[#F3EDE2] transition-colors shrink-0"
              title={soundEnabled ? 'Tắt âm thanh hiệu ứng' : 'Bật âm thanh hiệu ứng'}
              aria-label="Bật tắt âm thanh"
            >
              {soundEnabled ? (
                <span className="text-sm">🔊</span>
              ) : (
                <span className="text-sm opacity-40">🔇</span>
              )}
            </button>

            {/* Nút Giỏ Hàng Luôn Luôn Hiển Thị (Không bị mất trên điện thoại) */}
            <button
              onClick={onOpenCart}
              className="h-9 sm:h-11 px-3 sm:px-5 rounded-full bg-[#322821] text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 shadow-md shadow-[#322821]/25 hover:bg-[#251C16] active:scale-95 transition-all whitespace-nowrap shrink-0"
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F4A261] shrink-0" />
              <span className="whitespace-nowrap">Giỏ</span>
              <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#D95829] text-white text-[10px] sm:text-xs font-bold flex items-center justify-center shrink-0">
                {cartCount}
              </span>
            </button>

            {/* Nút Menu Hamburger cho điện thoại */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#DDD6C8] bg-white text-[#322821] flex lg:hidden items-center justify-center hover:bg-[#F3EDE2] transition-colors shrink-0 shadow-2xs"
              title="Mở menu danh mục"
              aria-label="Mở menu"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

        </div>

        {/* Mobile Combined Sub-Bar: Giao Hàng/Tại Bàn & Liên Kết Điều Hướng Trong 1 Hàng Duy Nhất */}
        <div className="lg:hidden border-t border-[#EAE3D2] bg-[#FAF5EC] px-3 py-1.5 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
          {/* Chuyển đổi nhanh Giao tận nơi / Ngồi tại bàn */}
          <div className="inline-flex items-center p-0.5 bg-[#EAE3D2] rounded-full shrink-0">
            <button
              onClick={() => onChangeServingPreference('delivery')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all ${
                servingPreference === 'delivery' ? 'bg-[#322821] text-white shadow-xs' : 'text-[#6B6058]'
              }`}
            >
              <Bike className="w-3 h-3" />
              <span>Giao hàng</span>
            </button>
            <button
              onClick={() => onChangeServingPreference('dine-in')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all ${
                servingPreference === 'dine-in' ? 'bg-[#322821] text-white shadow-xs' : 'text-[#6B6058]'
              }`}
            >
              <UtensilsCrossed className="w-3 h-3" />
              <span>{tableNumber ? tableNumber : 'Tại bàn'}</span>
            </button>
          </div>

          <div className="w-[1px] h-4 bg-[#DDD5C5] shrink-0" />

          {/* Các mục điều hướng ngắn gọn, sang trọng */}
          <a
            href="#hero"
            className="px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap bg-white border border-[#DDD6C8] text-[#322821] shrink-0 shadow-2xs hover:bg-[#F0EAE0]"
          >
            Trang Chủ
          </a>
          <a
            href="#menu"
            className="px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap bg-white border border-[#DDD6C8] text-[#322821] shrink-0 shadow-2xs hover:bg-[#F0EAE0]"
          >
            Thực Đơn
          </a>
          <a
            href="#diy-builder"
            className="px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap bg-white border border-[#DDD6C8] text-[#322821] shrink-0 shadow-2xs hover:bg-[#F0EAE0] flex items-center gap-1"
          >
            <span>Tự Mix Vị</span>
            <span className="text-[8px] bg-[#E0633A] text-white px-1 rounded-full font-bold">Mới</span>
          </a>
          <a
            href="#story"
            className="px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap bg-white border border-[#DDD6C8] text-[#322821] shrink-0 shadow-2xs hover:bg-[#F0EAE0]"
          >
            Không Gian
          </a>
        </div>

        {/* Thanh chọn số bàn nhanh nếu khách đang chọn Ngồi Tại Bàn trên mobile */}
        {servingPreference === 'dine-in' && (
          <div className="bg-[#FAF4EB] border-t border-[#EAE3D2] px-3 py-1.5 flex items-center justify-center gap-2 text-xs">
            <span className="text-[#5A6860] font-semibold text-[11px] flex items-center gap-1">
              <UtensilsCrossed className="w-3 h-3 text-[#322821]" />
              <span>Số bàn:</span>
            </span>
            <select
              value={tableNumber}
              onChange={(e) => {
                const selected = e.target.value;
                const status = getTableStatus(selected);
                if (status !== 'available' && selected !== tableNumber) {
                  alert(`${selected} hiện đang có khách ngồi. Vui lòng chọn bàn trống khác hoặc liên hệ nhân viên quán!`);
                  return;
                }
                onChangeTableNumber(selected);
              }}
              className="bg-white border border-[#DDD6C8] rounded-lg px-2 py-0.5 text-xs font-bold text-[#322821] focus:outline-none focus:border-[#322821]"
            >
              {(allTablesList && allTablesList.length > 0
                ? allTablesList
                : Array.from({ length: 12 }, (_, i) => `Bàn ${String(i + 1).padStart(2, '0')}`)
              ).map((t) => {
                const status = getTableStatus(t);
                const isOccupied = status !== 'available';
                return (
                  <option 
                    key={t} 
                    value={t} 
                    disabled={isOccupied && t !== tableNumber}
                    className={isOccupied ? 'text-red-500 font-normal bg-red-50' : 'text-emerald-800 font-bold bg-white'}
                  >
                    {t} {isOccupied ? '(Đang ngồi 🔴)' : '(Trống 🟢)'}
                  </option>
                );
              })}
            </select>
            <span className="text-emerald-700 font-semibold text-[11px]">• Miễn phí phục vụ</span>
          </div>
        )}
      </header>

      {/* MOBILE DRAWER MENU (TRƯỢT RA TỪ BÊN PHẢI KHI BẤM NÚT MENU) */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            className="w-[82vw] max-w-sm h-full bg-[#FAF7F2] p-5 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Header drawer */}
              <div className="flex items-center justify-between pb-4 border-b border-[#EAE3D2]">
                <div className="flex items-center gap-2.5">
                  <img src="/logo-icon.png" alt="Thượng Logo" className="w-9 h-9 object-contain" />
                  <div>
                    <div className="font-display font-black text-lg text-[#322821]">THƯỢNG</div>
                    <div className="text-[10px] text-[#C88B4A] font-bold tracking-wider">TINH HOA TRÀ VIỆT</div>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-9 h-9 rounded-full bg-white border border-[#DDD6C8] flex items-center justify-center text-[#322821] shadow-2xs"
                  aria-label="Đóng menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Danh sách liên kết điều hướng */}
              <div className="py-5 space-y-2.5">
                <a
                  href="#hero"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-[#EAE3D2] text-[#322821] font-bold text-sm shadow-2xs hover:bg-[#F5EFE6] transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-base">🏠</span>
                    <span>Trang Chủ</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </a>

                <a
                  href="#menu"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-[#EAE3D2] text-[#322821] font-bold text-sm shadow-2xs hover:bg-[#F5EFE6] transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-base">📜</span>
                    <span>Thực Đơn Tuyển Chọn</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </a>

                <a
                  href="#diy-builder"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-[#EAE3D2] text-[#322821] font-bold text-sm shadow-2xs hover:bg-[#F5EFE6] transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-base">🧪</span>
                    <span>Tự Mix Vị Trà Độc Bản</span>
                    <span className="text-[10px] bg-[#E0633A] text-white px-2 py-0.5 rounded-full font-bold">Mới</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </a>

                <a
                  href="#story"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-[#EAE3D2] text-[#322821] font-bold text-sm shadow-2xs hover:bg-[#F5EFE6] transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-base">☕</span>
                    <span>Không Gian Quán Thượng</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </a>
              </div>

              {/* Tùy chọn phục vụ */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#EAE3D2] space-y-2">
                <div className="text-[11px] font-bold text-[#6B6058] uppercase tracking-wider">Hình thức nhận món:</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onChangeServingPreference('delivery');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      servingPreference === 'delivery' ? 'bg-[#322821] text-white shadow-xs' : 'bg-[#F5EFE6] text-[#506056]'
                    }`}
                  >
                    <Bike className="w-4 h-4" />
                    <span>Giao Tận Nơi</span>
                  </button>
                  <button
                    onClick={() => {
                      onChangeServingPreference('dine-in');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      servingPreference === 'dine-in' ? 'bg-[#322821] text-white shadow-xs' : 'bg-[#F5EFE6] text-[#506056]'
                    }`}
                  >
                    <UtensilsCrossed className="w-4 h-4" />
                    <span>Tại Bàn</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer drawer */}
            <div className="pt-4 border-t border-[#EAE3D2] text-xs text-[#6B6058] space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span>📍</span>
                <span>Mở cửa: 07:00 - 22:30 hàng ngày</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>📞</span>
                <span>Hotline: 0988.123.456</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Showcase Section - Tối ưu bố cục chuẩn cho điện thoại & máy tính */}
      <section 
        id="hero"
        className="relative md:min-h-[calc(100vh-140px)] flex flex-col justify-center pt-3 sm:pt-6 pb-6 sm:pb-12 px-3.5 sm:px-8 transition-colors duration-700"
        style={{
          background: `radial-gradient(ellipse at 50% 30%, ${currentTea.panel}25 0%, #FAF7F2 70%)`
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-center my-auto">
          
          {/* Cột 1 (Mobile: Hiện TRÊN - Sân khấu ly trà 3D tách nền trong suốt tự nhiên) */}
          <div className="order-1 lg:order-2 lg:col-span-7 relative h-[240px] sm:h-[320px] md:h-[440px] lg:h-[520px] flex items-center justify-center">
            
            {/* Vòng hào quang sáng ấm áp */}
            <div 
              className="absolute w-56 sm:w-80 md:w-96 h-56 sm:h-80 md:h-96 rounded-full blur-3xl opacity-35 transition-colors duration-700 pointer-events-none"
              style={{ backgroundColor: currentTea.panel }}
            />

            {/* Các ly trà xoay chuyển carousel mượt mà */}
            {heroTeas.map((item, index) => {
              const role = getRole(index);

              let transformStr = '';
              let opacityVal = 0;
              let zIndexVal = 1;
              let filterVal = '';

              if (role === 'center') {
                const scale = isMobile ? 1.0 : 1.22;
                const tiltRotateX = isMobile ? 0 : -tilt.y * 10;
                const tiltRotateY = isMobile ? 0 : tilt.x * 12;
                const tiltTranslateX = isMobile ? 0 : tilt.x * 15;
                const tiltTranslateY = isMobile ? 0 : tilt.y * 15;

                transformStr = `translate3d(calc(-50% + ${tiltTranslateX}px), calc(-50% + ${tiltTranslateY}px), 0px) scale(${scale}) rotateX(${tiltRotateX}deg) rotateY(${tiltRotateY}deg)`;
                opacityVal = 1;
                zIndexVal = 10;
                filterVal = 'drop-shadow(0 20px 25px rgba(22, 78, 61, 0.2))';
              } else if (role === 'left') {
                const offsetPx = isMobile ? -85 : -260;
                transformStr = `translate3d(calc(-50% + ${offsetPx}px), -45%, 0px) scale(${isMobile ? 0.52 : 0.68}) rotateY(12deg)`;
                opacityVal = isMobile ? 0.35 : 0.45;
                zIndexVal = 5;
                filterVal = 'blur(1px) drop-shadow(0 10px 15px rgba(0,0,0,0.08))';
              } else if (role === 'right') {
                const offsetPx = isMobile ? 85 : 260;
                transformStr = `translate3d(calc(-50% + ${offsetPx}px), -45%, 0px) scale(${isMobile ? 0.52 : 0.68}) rotateY(-12deg)`;
                opacityVal = isMobile ? 0.35 : 0.45;
                zIndexVal = 5;
                filterVal = 'blur(1px) drop-shadow(0 10px 15px rgba(0,0,0,0.08))';
              } else {
                transformStr = 'translate3d(-50%, -30%, 0px) scale(0.4)';
                opacityVal = 0;
                zIndexVal = 1;
              }

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (isAnimating) return;
                    if (role === 'left') navigate('prev');
                    else if (role === 'right') navigate('next');
                    else if (role === 'center') onSelectTea(item);
                  }}
                  className={`absolute top-1/2 left-1/2 will-change-transform cursor-pointer transition-all duration-600 ease-smooth`}
                  style={{
                    transform: transformStr,
                    opacity: opacityVal,
                    zIndex: zIndexVal,
                    filter: filterVal,
                  }}
                >
                  <div className="relative group/cup">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="max-h-[210px] sm:max-h-[300px] md:max-h-[420px] lg:max-h-[460px] w-auto object-contain select-none pointer-events-none transition-transform duration-300 group-hover/cup:scale-105"
                      draggable={false}
                    />

                    {/* Vòng bóng đổ mềm mại dưới đáy cốc */}
                    <div 
                      className="absolute -bottom-3 sm:-bottom-4 left-1/2 -translate-x-1/2 w-32 sm:w-44 h-6 sm:h-8 rounded-full blur-md opacity-35 pointer-events-none"
                      style={{ backgroundColor: item.bg }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cột 2 (Mobile: Hiện DƯỚI - Giới thiệu hương vị, Giá tiền & Nút bấm đặt món) */}
          <div className="order-2 lg:order-1 lg:col-span-5 space-y-3 sm:space-y-4 text-center lg:text-left z-20 flex flex-col items-center lg:items-start">
            
            {/* Tag đặc biệt thuần Việt */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E5DEC9] shadow-2xs text-[11px] sm:text-xs font-semibold text-[#322821]">
              <span className="w-2 h-2 rounded-full bg-[#D95829] animate-pulse" />
              <span>{currentTea.badge || 'MÓN NỔI BẬT HÔM NAY'}</span>
              <span className="text-[#A29A8C]">•</span>
              <span className="text-[#4D7C0F] font-bold">100% TRÁI CÂY TƯƠI</span>
            </div>

            {/* Tên Món Trà Tiếng Việt */}
            <h1 className="font-display font-bold text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-[#322821] leading-[1.15] tracking-tight">
              {currentTea.name}
            </h1>

            {/* Mô Tả Hương Vị Rõ Ràng */}
            <p className="text-xs sm:text-sm md:text-base text-[#4F5B53] leading-relaxed max-w-md">
              {currentTea.tagline}
            </p>

            {/* Ghi chú hương vị tự nhiên */}
            <div className="flex items-center justify-center lg:justify-start gap-1.5 sm:gap-2 flex-wrap">
              {currentTea.flavorNotes.map((note, i) => (
                <span
                  key={i}
                  className="text-[11px] sm:text-xs font-medium bg-white/80 border border-[#E2DBCA] px-2.5 py-0.5 sm:py-1 rounded-full text-[#38423B] shadow-2xs"
                >
                  🍃 {note}
                </span>
              ))}
            </div>

            {/* Giá tiền & Nút Đặt Món */}
            <div className="pt-1 sm:pt-2 flex items-center justify-center lg:justify-start gap-4 sm:gap-6 flex-wrap w-full">
              <div className="text-left">
                <div className="text-[10px] sm:text-xs text-[#7B877F] font-medium">Giá niêm yết</div>
                <div className="flex items-baseline gap-1.5 sm:gap-2">
                  <span className="font-sans font-extrabold text-xl sm:text-2xl md:text-3xl text-[#D95829]">
                    {formatVND(currentTea.price)}
                  </span>
                  {currentTea.originalPrice && (
                    <span className="text-xs sm:text-sm text-[#9CA69F] line-through font-sans">
                      {formatVND(currentTea.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  playClickSound(soundEnabled);
                  onSelectTea(currentTea);
                }}
                className="h-10 sm:h-12 px-6 sm:px-8 rounded-full bg-[#322821] hover:bg-[#211A15] text-white font-bold text-xs sm:text-sm tracking-wide flex items-center gap-2 shadow-lg shadow-[#322821]/25 active:scale-95 transition-all"
              >
                <span>CHỌN MÓN NGAY</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Chuyển ly trà bằng nút điều hướng & Chỉ số đếm (Thay thế 22 chấm thô) */}
            <div className="pt-2 sm:pt-4 flex items-center justify-center lg:justify-start gap-3 w-full">
              <button
                onClick={() => navigate('prev')}
                disabled={isAnimating}
                aria-label="Ly trước"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[#DDD6C8] bg-white hover:bg-[#F0EAE0] flex items-center justify-center text-[#2A342E] shadow-2xs transition-all active:scale-95 disabled:opacity-40"
              >
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* Thanh hiển thị tiến trình gọn gàng, chuẩn xác, không bị tràn màn hình */}
              <div className="px-3.5 py-1 rounded-full bg-white/90 border border-[#DDD6C8] text-xs font-bold text-[#322821] shadow-2xs flex items-center gap-1.5">
                <span className="text-[#D95829]">0{activeIndex + 1}</span>
                <span className="text-stone-300">/</span>
                <span className="text-stone-500">{count < 10 ? `0${count}` : count} Món</span>
              </div>

              <button
                onClick={() => navigate('next')}
                disabled={isAnimating}
                aria-label="Ly kế tiếp"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[#DDD6C8] bg-white hover:bg-[#F0EAE0] flex items-center justify-center text-[#2A342E] shadow-2xs transition-all active:scale-95 disabled:opacity-40"
              >
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

          </div>

        </div>


      </section>
    </div>
  );
};
