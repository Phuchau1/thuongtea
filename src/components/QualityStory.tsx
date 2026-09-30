import React, { useState } from 'react';
import { Wifi, Zap, Wind, Music, Maximize2, X, Leaf } from 'lucide-react';

interface StorePhoto {
  id: string;
  image: string;
  tag: string;
  title: string;
  description: string;
}

const STORE_PHOTOS: StorePhoto[] = [
  {
    id: 'photo-1',
    image: '/store/khong-gian-chinh.jpg',
    tag: 'Sảnh Trà Chính',
    title: 'Không Gian Thưởng Trà Ấm Cúng',
    description: 'Bàn ghế gỗ sồi tự nhiên, ánh đèn vàng dịu mắt kết hợp âm nhạc êm ái tạo cảm giác thư giãn trọn vẹn.',
  },
  {
    id: 'photo-2',
    image: '/store/quay-pha-che.jpg',
    tag: 'Quầy Bar Mở',
    title: 'Quầy Pha Chế Thủ Công',
    description: 'Chiêm ngưỡng quy trình ủ lạnh 12h và công đoạn lắc trà trái cây tươi điêu luyện của barista.',
  },
  {
    id: 'photo-3',
    image: '/store/goc-ban-cong.jpg',
    tag: 'Cửa Sổ Ngập Nắng',
    title: 'Góc Ban Công & Mảng Xanh',
    description: 'Ánh sáng tự nhiên cùng cây xanh thanh lọc không khí, góc ngồi lý tưởng để ngắm phố phường.',
  },
  {
    id: 'photo-4',
    image: '/store/goc-hoc-tap.jpg',
    tag: 'Góc Tập Trung',
    title: 'Khu Vực Làm Việc & Đọc Sách',
    description: 'Yên tĩnh, trang bị ổ cắm Type-C từng bàn và Wifi 5GHz tốc độ cao không giới hạn.',
  },
  {
    id: 'photo-5',
    image: '/store/ban-hen-ho.jpg',
    tag: 'Bàn Đôi Ấm Áp',
    title: 'Không Gian Hẹn Hò & Trò Chuyện',
    description: 'Khoảng cách bàn rộng rãi, giữ được sự riêng tư thoải mái cho bạn và người đồng hành.',
  },
  {
    id: 'photo-6',
    image: '/store/goc-checkin.jpg',
    tag: 'Góc Check-In',
    title: 'Không Gian Sống Ảo Tinh Tế',
    description: 'Nội thất gỗ mộc tối giản hài hòa, góc chụp ảnh kỷ niệm ấm cúng và thanh lịch.',
  }
];

const STORE_AMENITIES = [
  {
    icon: Wifi,
    name: 'Wifi 5GHz Tốc Độ Cao',
    desc: 'Làm việc & học tập mượt mà',
  },
  {
    icon: Zap,
    name: 'Ổ Cắm Sạc Từng Bàn',
    desc: 'Hỗ trợ sạc nhanh & Type-C',
  },
  {
    icon: Wind,
    name: 'Máy Lạnh & Không Khói',
    desc: 'Không khí thanh mát trong lành',
  },
  {
    icon: Music,
    name: 'Âm Nhạc Thư Thái',
    desc: 'Giai điệu Acoustic & Lofi',
  }
];

export const QualityStory: React.FC = () => {
  const [activePhoto, setActivePhoto] = useState<StorePhoto | null>(null);

  return (
    <section id="story" className="py-12 sm:py-20 px-3.5 sm:px-6 lg:px-8 bg-[#F4EFE6] text-[#222B25] border-t border-[#EAE3D2]">
      <div className="max-w-7xl mx-auto">
        
        {/* Tiêu đề & Giới thiệu không gian */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-14">
          <div className="flex justify-center mb-3 sm:mb-4">
            <img src="/logo.png" alt="Thượng EST 2026" className="h-14 sm:h-20 w-auto object-contain drop-shadow-xs" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#DDD6C8] shadow-2xs text-[11px] sm:text-xs font-semibold text-[#8B5E3C]">
            <Leaf className="w-3 h-3 text-[#C88B4A]" />
            <span className="tracking-wider uppercase">TINH HOA TRÀ VIỆT • KHÔNG GIAN THỰC TẾ</span>
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-4xl lg:text-5xl text-[#322821] tracking-tight mt-2.5">
            Không Gian Quán "Thượng"
          </h2>
          <p className="text-xs sm:text-sm text-[#5C6760] mt-2 max-w-lg mx-auto leading-relaxed">
            Thiết kế mộc mạc tinh tế với gam màu Nâu Đen ấm áp, ngập tràn ánh sáng tự nhiên và hương trà thơm thanh nhẹ.
          </p>
        </div>

        {/* ======================================================== */}
        {/* 1. DẠNG LƯỚI CHO ĐIỆN THOẠI (MOBILE GRID - GỌN GÀNG, ĐẸP MẮT) */}
        {/* ======================================================== */}
        <div className="block sm:hidden">
          <div className="grid grid-cols-2 gap-2.5">
            {/* Ảnh 1: Sảnh Trà Lớn (Chiếm 2 cột làm tiêu điểm trên cùng) */}
            <div
              onClick={() => setActivePhoto(STORE_PHOTOS[0])}
              className="col-span-2 relative rounded-2xl overflow-hidden bg-[#EAE3D2] border border-[#DDD6C8] shadow-xs active:scale-[0.99] transition-transform cursor-pointer"
            >
              <div className="relative aspect-[16/10] w-full">
                <img
                  src={STORE_PHOTOS[0].image}
                  alt={STORE_PHOTOS[0].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
                
                <div className="absolute top-2.5 left-2.5 z-10">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-xs text-amber-200 border border-white/20">
                    ⭐ {STORE_PHOTOS[0].tag}
                  </span>
                </div>

                <div className="absolute top-2.5 right-2.5 z-10">
                  <div className="w-6 h-6 rounded-full bg-black/50 backdrop-blur-xs flex items-center justify-center text-white/90">
                    <Maximize2 className="w-3 h-3" />
                  </div>
                </div>

                <div className="absolute bottom-0 inset-x-0 p-3.5 text-white z-10">
                  <h3 className="font-display font-bold text-sm text-white">
                    {STORE_PHOTOS[0].title}
                  </h3>
                  <p className="text-[11px] text-stone-300 line-clamp-1 mt-0.5">
                    {STORE_PHOTOS[0].description}
                  </p>
                </div>
              </div>
            </div>

            {/* Ảnh 2 & 3: Quầy Bar Mở & Cửa Sổ Ngập Nắng (2 cột cân đối) */}
            {[STORE_PHOTOS[1], STORE_PHOTOS[2]].map((item) => (
              <div
                key={item.id}
                onClick={() => setActivePhoto(item)}
                className="col-span-1 relative rounded-xl overflow-hidden bg-[#EAE3D2] border border-[#DDD6C8] shadow-xs active:scale-[0.98] transition-transform cursor-pointer"
              >
                <div className="relative aspect-[4/3] w-full">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  
                  <div className="absolute top-1.5 left-1.5 z-10">
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-black/60 text-amber-200 border border-white/10">
                      {item.tag}
                    </span>
                  </div>

                  <div className="absolute bottom-0 inset-x-0 p-2.5 text-white z-10">
                    <h4 className="font-bold text-[11px] text-white line-clamp-1">
                      {item.title}
                    </h4>
                  </div>
                </div>
              </div>
            ))}

            {/* Ảnh 4 & 5: Góc Làm Việc & Bàn Đôi Hẹn Hò (2 cột cân đối) */}
            {[STORE_PHOTOS[3], STORE_PHOTOS[4]].map((item) => (
              <div
                key={item.id}
                onClick={() => setActivePhoto(item)}
                className="col-span-1 relative rounded-xl overflow-hidden bg-[#EAE3D2] border border-[#DDD6C8] shadow-xs active:scale-[0.98] transition-transform cursor-pointer"
              >
                <div className="relative aspect-[4/3] w-full">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  
                  <div className="absolute top-1.5 left-1.5 z-10">
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-black/60 text-amber-200 border border-white/10">
                      {item.tag}
                    </span>
                  </div>

                  <div className="absolute bottom-0 inset-x-0 p-2.5 text-white z-10">
                    <h4 className="font-bold text-[11px] text-white line-clamp-1">
                      {item.title}
                    </h4>
                  </div>
                </div>
              </div>
            ))}

            {/* Ảnh 6: Góc Check-In Tinh Tế (Chiếm 2 cột, kết thúc lưới hài hòa) */}
            <div
              onClick={() => setActivePhoto(STORE_PHOTOS[5])}
              className="col-span-2 relative rounded-2xl overflow-hidden bg-[#EAE3D2] border border-[#DDD6C8] shadow-xs active:scale-[0.99] transition-transform cursor-pointer"
            >
              <div className="relative aspect-[18/9] w-full">
                <img
                  src={STORE_PHOTOS[5].image}
                  alt={STORE_PHOTOS[5].title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
                
                <div className="absolute top-2.5 left-2.5 z-10">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-xs text-amber-200 border border-white/20">
                    📸 {STORE_PHOTOS[5].tag}
                  </span>
                </div>

                <div className="absolute top-2.5 right-2.5 z-10">
                  <div className="w-6 h-6 rounded-full bg-black/50 backdrop-blur-xs flex items-center justify-center text-white/90">
                    <Maximize2 className="w-3 h-3" />
                  </div>
                </div>

                <div className="absolute bottom-0 inset-x-0 p-3.5 text-white z-10">
                  <h3 className="font-display font-bold text-sm text-white">
                    {STORE_PHOTOS[5].title}
                  </h3>
                  <p className="text-[11px] text-stone-300 line-clamp-1 mt-0.5">
                    {STORE_PHOTOS[5].description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. GIAO DIỆN BENTO GRID CHO MÁY TÍNH & TABLET              */}
        {/* Khắc phục triệt để lỗi đè chữ desktop, chuẩn tỉ lệ 100%    */}
        {/* ======================================================== */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 sm:auto-rows-[200px] lg:auto-rows-[230px]">
          {/* Ảnh 1: Sảnh Trà Lớn (Chiếm 2 cột trên tablet, 2 cột x 2 hàng trên desktop) */}
          <div
            onClick={() => setActivePhoto(STORE_PHOTOS[0])}
            className="sm:col-span-2 lg:col-span-2 lg:row-span-2 group relative rounded-2xl lg:rounded-3xl overflow-hidden cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300 border border-[#E5DEC9] bg-[#EAE3D2]"
          >
            <img
              src={STORE_PHOTOS[0].image}
              alt={STORE_PHOTOS[0].title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1F1713]/90 via-[#1F1713]/30 to-transparent transition-opacity duration-300 pointer-events-none" />
            
            <div className="absolute top-4 left-4 z-10">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-black/50 backdrop-blur-md text-amber-200 border border-white/20 shadow-xs">
                {STORE_PHOTOS[0].tag}
              </span>
            </div>

            <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-xs flex items-center justify-center text-[#322821] shadow-md">
                <Maximize2 className="w-4 h-4" />
              </div>
            </div>

            <div className="absolute bottom-0 inset-x-0 p-5 lg:p-6 z-10 text-white">
              <h3 className="font-display font-bold text-lg lg:text-2xl text-white group-hover:text-amber-200 transition-colors">
                {STORE_PHOTOS[0].title}
              </h3>
              <p className="text-xs lg:text-sm text-stone-200 mt-1 max-w-md line-clamp-2 leading-relaxed">
                {STORE_PHOTOS[0].description}
              </p>
            </div>
          </div>

          {/* Các ảnh còn lại (1, 2, 3, 4, 5) - đồng bộ trong cùng 1 grid */}
          {[STORE_PHOTOS[1], STORE_PHOTOS[2], STORE_PHOTOS[3], STORE_PHOTOS[4], STORE_PHOTOS[5]].map((item, idx) => (
            <div
              key={item.id}
              onClick={() => setActivePhoto(item)}
              className={`group relative rounded-2xl lg:rounded-3xl overflow-hidden cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300 border border-[#E5DEC9] bg-[#EAE3D2] ${
                idx === 4 ? 'sm:col-span-2 lg:col-span-1' : 'col-span-1'
              }`}
            >
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1F1713]/90 via-[#1F1713]/25 to-transparent transition-opacity duration-300 pointer-events-none" />
              
              <div className="absolute top-3.5 left-3.5 z-10">
                <span className="px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-black/50 backdrop-blur-md text-amber-200 border border-white/20 shadow-xs">
                  {item.tag}
                </span>
              </div>

              <div className="absolute top-3.5 right-3.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-xs flex items-center justify-center text-[#322821] shadow-md">
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="absolute bottom-0 inset-x-0 p-4 z-10 text-white">
                <h3 className="font-display font-bold text-sm lg:text-base text-white group-hover:text-amber-200 transition-colors line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-xs text-stone-200 mt-0.5 line-clamp-1 leading-snug">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Thanh Tiện Ích Trải Nghiệm Khách Hàng (Tối ưu cho cả điện thoại và máy tính) */}
        <div className="mt-6 sm:mt-10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          {STORE_AMENITIES.map((amenity, idx) => {
            const Icon = amenity.icon;
            return (
              <div
                key={idx}
                className="flex items-center sm:items-start gap-2.5 sm:gap-3 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-[#E8E1D2] shadow-2xs hover:shadow-xs transition-shadow"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#FAF4EB] text-[#322821] flex items-center justify-center shrink-0 border border-[#EFE8DC]">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#8B5E3C]" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-[11px] sm:text-sm text-[#322821] line-clamp-1">
                    {amenity.name}
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-[#6B7870] mt-0.5 leading-tight line-clamp-1">
                    {amenity.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Lightbox Modal Xem Ảnh Chi Tiết Toàn Màn Hình */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setActivePhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-[#2A211B] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-stone-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút đóng to rõ, dễ chạm bằng ngón tay trên mobile */}
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/70 text-white hover:bg-black/90 flex items-center justify-center transition-colors shadow-md"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Ảnh lớn */}
            <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full bg-black">
              <img
                src={activePhoto.image}
                alt={activePhoto.title}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Chi tiết ảnh */}
            <div className="p-4 sm:p-6 bg-[#231A15] text-white">
              <div className="inline-block px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-800/40 mb-1.5 sm:mb-2">
                {activePhoto.tag}
              </div>
              <h3 className="font-display font-bold text-lg sm:text-2xl text-white">
                {activePhoto.title}
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 mt-1 sm:mt-2 leading-relaxed">
                {activePhoto.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
