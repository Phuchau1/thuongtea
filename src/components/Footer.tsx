import React from 'react';
import { Phone, Mail, MapPin, ShieldCheck, Lock, ChevronRight } from 'lucide-react';

interface FooterProps {
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  return (
    <footer className="bg-[#211813] text-stone-300 text-xs border-t border-[#3A2D24]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        
        {/* ======================================================== */}
        {/* PHẦN NỘI DUNG CHÍNH (TỐI ƯU GỌN GÀNG CHO ĐIỆN THOẠI & MÁY TÍNH) */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* CỘT 1: THƯƠNG HIỆU & GIỚI THIỆU (Chiếm 4 cột trên desktop) */}
          <div className="lg:col-span-4 space-y-3.5">
            <div className="flex items-center gap-3">
              <img 
                src="/logo-icon-white.png" 
                alt="Thượng Logo" 
                className="w-10 h-10 object-contain drop-shadow-xs shrink-0" 
              />
              <div>
                <span className="font-display font-black text-xl text-white tracking-wider block">THƯỢNG</span>
                <span className="text-[10px] text-amber-200/90 tracking-widest uppercase font-semibold">Trà & Trà Sữa Thượng Hạng</span>
              </div>
            </div>
            
            <p className="text-stone-400 text-xs leading-relaxed max-w-sm">
              Thương hiệu trà trái cây tươi nguyên bản Việt Nam. Sử dụng 100% búp trà hái tay Bảo Lộc và hoa quả thu hoạch tự nhiên trong ngày.
            </p>

            {/* Mạng xã hội */}
            <div className="flex items-center gap-2.5 pt-1">
              <a 
                href="#" 
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors" 
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a 
                href="#" 
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors" 
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <span className="text-[11px] text-stone-500 ml-1">@thuongtea.vn</span>
            </div>
          </div>

          {/* CỘT 2 & 3: DANH MỤC LIÊN KẾT (TRÊN ĐIỆN THOẠI CHIA 2 CỘT GỌN GÀNG, KHÔNG KÉO DÀI) */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-4 sm:gap-6">
            
            {/* Thực Đơn Nổi Bật */}
            <div className="space-y-2.5">
              <h4 className="font-display font-bold text-white text-sm tracking-wide">
                Thực Đơn Nổi Bật
              </h4>
              <ul className="space-y-2 text-stone-400 text-xs">
                <li><a href="#menu" className="hover:text-amber-200 transition-colors block py-0.5">Trà Sen Vàng Củ Năng</a></li>
                <li><a href="#menu" className="hover:text-amber-200 transition-colors block py-0.5">Trà Đào Cam Sả</a></li>
                <li><a href="#menu" className="hover:text-amber-200 transition-colors block py-0.5">Trà Sữa Trân Châu</a></li>
                <li><a href="#menu" className="hover:text-amber-200 transition-colors block py-0.5">Trà Ổi Hồng Muối Biển</a></li>
                <li>
                  <a href="#diy-builder" className="text-amber-300 font-semibold hover:underline inline-flex items-center gap-1 pt-1">
                    <span>Tự Pha Chế</span>
                    <ChevronRight className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Chính Sách & Dịch Vụ */}
            <div className="space-y-2.5">
              <h4 className="font-display font-bold text-white text-sm tracking-wide">
                Chính Sách
              </h4>
              <ul className="space-y-2 text-stone-400 text-xs">
                <li><a href="#" className="hover:text-amber-200 transition-colors block py-0.5">Giao nhanh 30 phút</a></li>
                <li><a href="#" className="hover:text-amber-200 transition-colors block py-0.5">VSATTP số 188/2026</a></li>
                <li><a href="#" className="hover:text-amber-200 transition-colors block py-0.5">Cam kết 100% tự nhiên</a></li>
                <li><a href="#" className="hover:text-amber-200 transition-colors block py-0.5">Nhượng quyền thương hiệu</a></li>
                <li><a href="#story" className="hover:text-amber-200 transition-colors block py-0.5">Không gian quán</a></li>
              </ul>
            </div>

          </div>

          {/* CỘT 4: THÔNG TIN LIÊN HỆ & HOTLINE (ĐƯỢC BỌC TRONG CARD TINH TẾ) */}
          <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-2xs">
            <h4 className="font-display font-bold text-white text-sm tracking-wide flex items-center justify-between">
              <span>Liên Hệ Đặt Trà</span>
              <span className="text-[10px] text-emerald-400 font-normal bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                ● Đang mở cửa
              </span>
            </h4>

            {/* Box Gọi Điện Hotline Trực Tiếp */}
            <a 
              href="tel:19008866"
              className="flex items-center justify-between p-3 rounded-xl bg-[#322821] border border-amber-900/30 hover:bg-[#3d3229] transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-base leading-none">1900 8866</div>
                  <div className="text-[10px] text-stone-400 mt-1">Tổng đài hỗ trợ (07:00 - 22:30)</div>
                </div>
              </div>
              <span className="text-[11px] font-bold text-amber-300 group-hover:translate-x-0.5 transition-transform">
                Gọi ngay →
              </span>
            </a>

            {/* Email & Địa Chỉ */}
            <div className="space-y-2 pt-1 text-xs text-stone-300">
              <a href="mailto:hotro@thuongtea.vn" className="flex items-center gap-2.5 hover:text-white transition-colors">
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>hotro@thuongtea.vn</span>
              </a>

              <div className="flex items-start gap-2.5 text-stone-400">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed">
                  88 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* ======================================================== */}
        {/* DÒNG BẢN QUYỀN & LINK KÍN QUẢN TRỊ VIÊN                   */}
        {/* ======================================================== */}
        <div className="pt-6 sm:pt-8 mt-8 sm:mt-10 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-400 text-center sm:text-left">
          <div>
            © 2026 CÔNG TY TNHH THƯỢNG VIỆT NAM. Mã số: 0318899889.
          </div>
          
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ĐÃ THÔNG BÁO BỘ CÔNG THƯƠNG</span>
            </div>

            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-1.5 text-stone-500 hover:text-amber-300 transition-colors py-1 px-2.5 rounded-lg border border-white/10 hover:border-amber-300/40 text-[10px]"
                title="Dành riêng cho nhân viên quầy thu ngân và quản trị viên"
              >
                <Lock className="w-3 h-3" />
                <span>Cổng Quản Trị</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </footer>
  );
};
