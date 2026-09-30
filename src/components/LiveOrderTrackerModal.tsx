import { X, CheckCircle2, Clock, ChefHat, Bike, Phone } from 'lucide-react';
import type { PosOrder } from '../types/pos';

interface LiveOrderTrackerModalProps {
  order: PosOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LiveOrderTrackerModal: React.FC<LiveOrderTrackerModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !order) return null;

  const steps = [
    { id: 'pending', title: 'Quầy Đã Nhận Đơn', desc: 'Đơn hàng đang chờ Barista xác nhận', icon: Clock },
    { id: 'preparing', title: 'Đang Pha Chế', desc: 'Barista đang dầm hoa quả tươi & ủ trà', icon: ChefHat },
    { id: 'ready', title: 'Sẵn Sàng / Đang Giao', desc: 'Ly trà đã đóng nắp & shipper đang giao', icon: Bike },
    { id: 'completed', title: 'Giao Thành Công', desc: 'Chúc bạn thưởng thức ly trà ngon miệng!', icon: CheckCircle2 },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'pending': return 0;
      case 'preparing': return 1;
      case 'ready': return 2;
      case 'completed': return 3;
      default: return 0;
    }
  };

  const currentIdx = getStepIndex(order.status);

  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl z-10 border border-[#E8E1D2] text-[#222B25] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-[#FAF7F2] border-b border-[#EAE3D2] flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F5EFE9] text-[#322821] text-[11px] font-bold border border-[#C5DDD2]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>THEO DÕI ĐƠN HÀNG THỜI GIAN THỰC</span>
            </div>
            <h3 className="font-display font-bold text-2xl text-[#322821] mt-2">
              Đơn Hàng #{order.orderNumber} ({order.id})
            </h3>
            <p className="text-xs text-[#6F7C74] mt-0.5">
              Đặt lúc: {order.createdAt} • Người nhận: <strong className="text-[#222B25]">{order.customer.name}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-[#525E56] hover:bg-[#EAE3D2] flex items-center justify-center border border-[#DDD6C8]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Status Tracker Stepper */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="relative pl-6 space-y-7 before:absolute before:left-9 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#EAE3D2]">
            {steps.map((step, idx) => {
              const isPast = idx < currentIdx;
              const isCurrent = idx === currentIdx;
              const StepIcon = step.icon;

              return (
                <div key={step.id} className="relative flex items-start gap-4">
                  {/* Icon circle */}
                  <div
                    className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                      isPast
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-[#322821] text-white ring-4 ring-[#322821]/20 animate-pulse'
                        : 'bg-[#FAF7F2] text-[#A2ADA6] border border-[#DDD6C8]'
                    }`}
                  >
                    <StepIcon className="w-3.5 h-3.5" />
                  </div>

                  {/* Text */}
                  <div className="flex-1 -mt-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${isCurrent ? 'text-[#322821]' : isPast ? 'text-[#222B25]' : 'text-[#88948D]'}`}>
                        {step.title}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-[#D95829] text-white uppercase">
                          Hiện tại
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6F7C74] mt-0.5 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chi tiết ly trà đang làm */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D2] space-y-2.5">
            <div className="text-xs font-bold text-[#322821] uppercase tracking-wider flex items-center justify-between">
              <span>Món Trong Đơn ({order.items.reduce((a, b) => a + b.quantity, 0)} ly)</span>
              <span className="text-[#D95829] font-sans text-sm">{formatVND(order.total)}</span>
            </div>

            <div className="space-y-2 pt-1 border-t border-[#EAE3D2]">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#222B25]">{item.tea.name} ({item.size})</span>
                    <span className="text-[#6F7C74] ml-2">Đường: {item.sugar}% • Đá: {item.ice}%</span>
                  </div>
                  <span className="font-semibold text-[#322821]">x{item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hotline hỗ trợ quán */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F5EFE9] border border-[#C5DDD2] text-xs">
            <div className="flex items-center gap-2 text-[#322821]">
              <Phone className="w-4 h-4 text-[#D95829]" />
              <span>Cần thay đổi thông tin? Gọi Barista: <strong>1900 8866</strong></span>
            </div>
            <a
              href="tel:19008866"
              className="px-3 py-1 rounded-full bg-[#322821] text-white font-bold text-[11px]"
            >
              Gọi Ngay
            </a>
          </div>
        </div>

        {/* Chân Modal */}
        <div className="p-4 bg-[#FAF7F2] border-t border-[#EAE3D2] text-center">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-full bg-white border border-[#DDD6C8] text-xs font-bold text-[#344139] hover:bg-[#EAE3D2] transition-colors"
          >
            ĐÓNG CỬA SỔ THEO DÕI
          </button>
        </div>
      </div>
    </div>
  );
};
