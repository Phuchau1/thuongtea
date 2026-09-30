import React from 'react';
import { X, Printer } from 'lucide-react';
import type { PosOrder } from '../types/pos';

interface ReceiptPrintModalProps {
  order: PosOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptPrintModal: React.FC<ReceiptPrintModalProps> = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-white text-black rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] border border-[#DDD6C8]">
        {/* Top actions */}
        <div className="p-3 bg-[#FAF7F2] border-b border-[#EAE3D2] flex items-center justify-between print:hidden">
          <span className="text-xs font-bold text-[#164E3D] uppercase tracking-wide">
            Xem Trước Hóa Đơn Quầy (K80)
          </span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white text-gray-500 hover:text-black flex items-center justify-center border border-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* The Thermal Receipt Bill (80mm format) */}
        <div className="p-6 overflow-y-auto font-mono text-xs leading-relaxed text-black bg-white select-text">
          {/* Header */}
          <div className="text-center pb-4 border-b border-dashed border-gray-400 space-y-1">
            <div className="text-2xl font-bold font-sans tracking-tight">THƯỢNG</div>
            <div className="text-[11px] text-gray-600">Trà & Trà Sữa Thượng Hạng • EST 2026</div>
            <div className="text-[10px] text-gray-500">Phục Vụ Tại Quán & Giao Hàng Tận Nơi</div>
            <div className="text-[10px] text-gray-500">Hotline: 1900 8866</div>
            <div className="pt-2 text-sm font-bold tracking-wider">PHIẾU PHA CHẾ & THANH TOÁN</div>
            <div className="text-xs font-bold text-[#322821]">Số đơn: #{order.orderNumber} ({order.id})</div>
            <div className="text-[10px] text-gray-500">{order.createdAt}</div>
          </div>

          {/* Customer info */}
          <div className="py-2.5 border-b border-dashed border-gray-400 text-[11px] space-y-0.5">
            <div>Khách hàng: <span className="font-bold">{order.customer.name}</span></div>
            <div>SĐT: <span className="font-bold">{order.customer.phone}</span></div>
            <div>Loại đơn: <span className="font-bold uppercase">{order.orderType === 'dine-in' ? `Tại bàn (${order.tableNumber || 'Bàn'})` : order.orderType === 'takeaway' ? 'Mang đi' : 'Giao tận nơi'}</span></div>
            {order.orderType === 'delivery' && (
              <div className="text-[10px] text-gray-700">Đ/c: {order.customer.address}</div>
            )}
            {order.customer.note && (
              <div className="italic text-gray-600">Ghi chú: "{order.customer.note}"</div>
            )}
          </div>

          {/* Items breakdown */}
          <div className="py-3 border-b border-dashed border-gray-400 space-y-2.5">
            <div className="flex justify-between font-bold text-[11px] pb-1 border-b border-gray-200">
              <span>Món / Chi tiết</span>
              <span>SL</span>
              <span>T.Tiền</span>
            </div>

            {order.items.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between font-bold text-[11px]">
                  <span className="truncate pr-2">{item.tea.name} ({item.size})</span>
                  <span className="px-1">x{item.quantity}</span>
                  <span>{formatVND(item.totalPrice)}</span>
                </div>
                <div className="text-[10px] text-gray-600 pl-2">
                  Đường {item.sugar}% • Đá {item.ice}%
                  {item.toppings.length > 0 && ` • +${item.toppings.map(t => t.name).join(', ')}`}
                </div>
                {item.note && (
                  <div className="text-[10px] text-gray-500 italic pl-2">*{item.note}</div>
                )}
              </div>
            ))}
          </div>

          {/* Total & Payment */}
          <div className="py-2.5 border-b border-dashed border-gray-400 space-y-1 text-[11px]">
            <div className="flex justify-between text-gray-600">
              <span>Tạm tính:</span>
              <span>{formatVND(order.subtotal)}</span>
            </div>
            {order.shippingFee > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển:</span>
                <span>{formatVND(order.shippingFee)}</span>
              </div>
            )}
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Giảm giá khuyến mãi:</span>
                <span>-{formatVND(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm pt-1.5 border-t border-gray-300">
              <span>TỔNG CỘNG:</span>
              <span>{formatVND(order.total)}</span>
            </div>
            <div className="flex justify-between text-[11px] pt-1">
              <span>Thanh toán:</span>
              <span className="font-bold uppercase">
                {order.customer.paymentMethod === 'vietqr' ? 'Chuyển khoản VietQR' : 'Tiền mặt (COD)'}
                {' '}({order.paymentStatus === 'paid' ? 'Đã thu' : 'Chưa thu'})
              </span>
            </div>
          </div>

          {/* Footer note & VietQR for receipt */}
          <div className="text-center pt-3 space-y-1.5">
            <p className="text-[10px] text-gray-600 italic">
              Chúc quý khách thưởng thức ly trà ngon miệng!
            </p>
            <p className="text-[9px] text-gray-400">
              Powered by THƯỢNG POS Kitchen System • v2.6
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-3 bg-[#FAF7F2] border-t border-[#EAE3D2] flex gap-2 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 rounded-xl bg-[#322821] hover:bg-[#211A15] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>IN PHIẾU PHA CHẾ (K80)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
