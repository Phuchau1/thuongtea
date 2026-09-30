import { useState, useEffect } from 'react';
import { 
  Clock, ChefHat, CheckCircle2, Printer, Search, ArrowLeft, Coffee
} from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { FRUIT_TEAS } from '../data/teas';
import type { PosOrder, OrderStatus } from '../types/pos';
import { ReceiptPrintModal } from './ReceiptPrintModal';

interface PosKitchenDisplayProps {
  onBackToStore: () => void;
  onLogout: () => void;
}

export const PosKitchenDisplay: React.FC<PosKitchenDisplayProps> = ({ onBackToStore, onLogout }) => {
  const { 
    orders, 
    updateOrderStatus, 
    updatePaymentStatus, 
    stockStatus, 
    toggleStock, 
    markPosOrdersAsRead 
  } = useOrders();

  const [activeTab, setActiveTab] = useState<'kanban' | 'stock'>('kanban');
  const [filterType, setFilterType] = useState<'all' | 'delivery' | 'dine-in' | 'takeaway'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [printingOrder, setPrintingOrder] = useState<PosOrder | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    markPosOrdersAsRead();
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(interval);
  }, [markPosOrdersAsRead]);

  const filteredOrders = orders.filter((o) => {
    const matchesType = filterType === 'all' || o.orderType === filterType;
    const matchesSearch =
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.phone.includes(searchQuery);
    return matchesType && matchesSearch;
  });

  const pendingOrders = filteredOrders.filter((o) => o.status === 'pending');
  const preparingOrders = filteredOrders.filter((o) => o.status === 'preparing');
  const readyOrders = filteredOrders.filter((o) => o.status === 'ready' || o.status === 'completed');

  // Thống kê ca làm việc
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const totalCups = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.items.reduce((s, it) => s + it.quantity, 0), 0);

  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  return (
    <div className="min-h-screen bg-[#F0EAE1] text-[#222B25] flex flex-col font-sans">
      
      {/* POS Top Bar */}
      <header className="bg-[#164E3D] text-white px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 shadow-md sticky top-0 z-40">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onBackToStore}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">VỀ TRANG BÁN HÀNG</span>
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-400/30 text-xs font-bold transition-colors"
            title="Đăng xuất khỏi quầy thu ngân"
          >
            <span>🔒</span>
            <span className="hidden sm:inline">KHÓA QUẦY</span>
          </button>

          <div className="h-6 w-px bg-white/20 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white text-[#322821] flex items-center justify-center font-bold">
              🍵
            </div>
            <div>
              <div className="font-display font-bold text-sm sm:text-base leading-none">
                HỆ THỐNG POS // QUẦY THU NGÂN & BARISTA
              </div>
              <div className="text-[10px] text-white/60 font-mono mt-0.5">
                CỬA HÀNG THƯỢNG • CA SÁNG - CHIỀU
              </div>
            </div>
          </div>
        </div>

        {/* Live Clock & Shift Stats */}
        <div className="flex items-center gap-4 sm:gap-6 text-xs">
          <div className="hidden lg:flex items-center gap-4 bg-black/20 px-3.5 py-1.5 rounded-xl border border-white/10 font-mono">
            <div>
              <span className="text-white/60">Doanh thu: </span>
              <strong className="text-[#F4A261]">{formatVND(totalRevenue)}</strong>
            </div>
            <span>•</span>
            <div>
              <span className="text-white/60">Đã bán: </span>
              <strong>{totalCups} ly</strong>
            </div>
          </div>

          <div className="font-mono text-xs sm:text-sm font-bold bg-white/10 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-yellow-300" />
            <span>{currentTime || '08:00:00'}</span>
          </div>
        </div>
      </header>

      {/* POS Sub Navigation & Quick Filters */}
      <div className="bg-white border-b border-[#E0D8C8] px-4 sm:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Tab switch: Màn hình đơn hàng vs Quản lý món */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('kanban')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'kanban'
                ? 'bg-[#164E3D] text-white shadow-sm'
                : 'bg-[#FAF7F2] border border-[#DDD6C8] text-[#55635B] hover:bg-[#F0EAE1]'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>ĐƠN PHA CHẾ QUẦY ({orders.filter(o => o.status !== 'completed').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('stock')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'stock'
                ? 'bg-[#164E3D] text-white shadow-sm'
                : 'bg-[#FAF7F2] border border-[#DDD6C8] text-[#55635B] hover:bg-[#F0EAE1]'
            }`}
          >
            <Coffee className="w-4 h-4" />
            <span>QUẢN LÝ BẬT/TẮT MÓN</span>
          </button>
        </div>

        {/* Filter channel & Search */}
        {activeTab === 'kanban' && (
          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
            <div className="flex items-center gap-1 bg-[#FAF7F2] p-1 rounded-xl border border-[#DDD6C8] text-xs font-semibold">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'delivery', label: 'Giao tận nơi' },
                { id: 'dine-in', label: 'Tại quán' },
                { id: 'takeaway', label: 'Mang đi' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setFilterType(c.id as typeof filterType)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    filterType === c.id ? 'bg-[#164E3D] text-white font-bold' : 'text-[#5A6860] hover:bg-white'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C9890]" />
              <input
                type="text"
                placeholder="Tìm mã đơn, tên, SĐT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#FAF7F2] border border-[#DDD6C8] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#222B25] focus:outline-none focus:border-[#164E3D] w-48 sm:w-56"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 overflow-x-auto">
        {activeTab === 'kanban' ? (
          /* Kanban 3 Columns Board */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto items-start">
            
            {/* CỘT 1: CHỜ PHA CHẾ (PENDING) */}
            <div className="bg-[#FAF7F2] rounded-3xl border border-[#E0D8C8] p-4 flex flex-col max-h-[82vh] shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E0D8C8]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
                  <h3 className="font-display font-bold text-base text-[#D95829]">
                    CHỜ PHA CHẾ
                  </h3>
                </div>
                <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center">
                  {pendingOrders.length}
                </span>
              </div>

              <div className="overflow-y-auto space-y-3.5 flex-1 pr-1">
                {pendingOrders.length === 0 ? (
                  <div className="py-12 text-center text-[#8D9A92] text-xs">
                    Không có đơn nào đang chờ pha chế
                  </div>
                ) : (
                  pendingOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onUpdateStatus={updateOrderStatus}
                      onUpdatePayment={updatePaymentStatus}
                      onPrint={(o) => setPrintingOrder(o)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* CỘT 2: ĐANG PHA CHẾ (PREPARING) */}
            <div className="bg-[#FAF7F2] rounded-3xl border border-[#E0D8C8] p-4 flex flex-col max-h-[82vh] shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E0D8C8]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                  <h3 className="font-display font-bold text-base text-[#164E3D]">
                    ĐANG PHA CHẾ
                  </h3>
                </div>
                <span className="w-6 h-6 rounded-full bg-[#164E3D] text-white font-bold text-xs flex items-center justify-center">
                  {preparingOrders.length}
                </span>
              </div>

              <div className="overflow-y-auto space-y-3.5 flex-1 pr-1">
                {preparingOrders.length === 0 ? (
                  <div className="py-12 text-center text-[#8D9A92] text-xs">
                    Quầy trống, chưa có đơn đang ủ trà
                  </div>
                ) : (
                  preparingOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onUpdateStatus={updateOrderStatus}
                      onUpdatePayment={updatePaymentStatus}
                      onPrint={(o) => setPrintingOrder(o)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* CỘT 3: HOÀN THÀNH / CHỜ LẤY (READY) */}
            <div className="bg-[#FAF7F2] rounded-3xl border border-[#E0D8C8] p-4 flex flex-col max-h-[82vh] shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E0D8C8]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <h3 className="font-display font-bold text-base text-emerald-800">
                    ĐÃ XONG / CHỜ GIAO
                  </h3>
                </div>
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  {readyOrders.length}
                </span>
              </div>

              <div className="overflow-y-auto space-y-3.5 flex-1 pr-1">
                {readyOrders.length === 0 ? (
                  <div className="py-12 text-center text-[#8D9A92] text-xs">
                    Chưa có đơn đã hoàn tất
                  </div>
                ) : (
                  readyOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onUpdateStatus={updateOrderStatus}
                      onUpdatePayment={updatePaymentStatus}
                      onPrint={(o) => setPrintingOrder(o)}
                    />
                  ))
                )}
              </div>
            </div>

          </div>
        ) : (
          /* Quản Lý Bật Tắt Tình Trạng Món (Stock Manager) */
          <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-[#E0D8C8] p-6 sm:p-8 shadow-sm">
            <div className="pb-4 mb-6 border-b border-[#F0EAE1] flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-2xl text-[#164E3D]">
                  Cài Đặt Tình Trạng Món Tại Quầy
                </h3>
                <p className="text-xs text-[#6F7D74] mt-1">
                  Khi quán hết nguyên liệu (trái cây, trà...), hãy bấm tắt món để khách không thể đặt trên website.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FRUIT_TEAS.map((tea) => {
                const isAvailable = stockStatus[tea.id] !== false;
                return (
                  <div
                    key={tea.id}
                    className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                      isAvailable
                        ? 'border-[#E0D8C8] bg-[#FAF7F2]'
                        : 'border-red-200 bg-red-50/50 opacity-75'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-14 bg-white rounded-xl p-1 flex items-center justify-center shrink-0 border border-[#E5DEC9]">
                        <img src={tea.image} alt={tea.name} className="max-h-full w-auto object-contain" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#164E3D]">{tea.name}</div>
                        <div className="text-xs font-semibold text-[#D95829]">{formatVND(tea.price)}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleStock(tea.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                        isAvailable
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-red-500 hover:bg-red-600 text-white'
                      }`}
                    >
                      {isAvailable ? 'ĐANG BÁN' : 'TẠM HẾT MÓN'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Modal In Hóa Đơn K80 */}
      <ReceiptPrintModal
        order={printingOrder}
        isOpen={!!printingOrder}
        onClose={() => setPrintingOrder(null)}
      />
    </div>
  );
};

// Sub-component: Order Card inside Kanban
interface OrderCardProps {
  order: PosOrder;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onUpdatePayment: (orderId: string, payment: 'paid' | 'unpaid') => void;
  onPrint: (order: PosOrder) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onUpdateStatus, onUpdatePayment, onPrint }) => {
  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5DEC9] p-4 shadow-sm hover:shadow-md transition-all space-y-3">
      {/* Top Header Card */}
      <div className="flex items-center justify-between pb-2 border-b border-[#F0EAE1]">
        <div className="flex items-center gap-2">
          <span className="font-mono text-base font-extrabold text-[#164E3D]">
            #{order.orderNumber}
          </span>
          <span className="text-[10px] font-mono text-[#8B968F] bg-[#FAF7F2] px-1.5 py-0.5 rounded border border-[#E5DEC9]">
            {order.id}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
            order.orderType === 'dine-in'
              ? 'bg-purple-100 text-purple-800'
              : order.orderType === 'takeaway'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-amber-100 text-amber-800'
          }`}>
            {order.orderType === 'dine-in' ? `Tại Bàn (${order.tableNumber || 'Bàn'})` : order.orderType === 'takeaway' ? 'Mang Đi' : 'Giao Tận Nơi'}
          </span>
          <span className="text-[11px] font-mono text-[#8A958E]">{order.createdAt}</span>
        </div>
      </div>

      {/* Customer Info */}
      <div className="text-xs space-y-0.5">
        <div className="font-bold text-[#222B25] flex items-center justify-between">
          <span>{order.customer.name}</span>
          <span className="text-[#6C7871] font-mono">{order.customer.phone}</span>
        </div>
        {order.orderType === 'delivery' && (
          <div className="text-[11px] text-[#6C7871] truncate">Đ/c: {order.customer.address}</div>
        )}
        {order.customer.note && (
          <div className="text-[11px] text-amber-700 italic bg-amber-50/70 p-1.5 rounded-lg border border-amber-200/60">
            ⚠️ "{order.customer.note}"
          </div>
        )}
      </div>

      {/* Items list with recipe instructions for Barista */}
      <div className="space-y-2 pt-2 border-t border-[#F0EAE1]">
        {order.items.map((item, idx) => (
          <div key={idx} className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#ECE5D8] text-xs">
            <div className="flex justify-between font-bold text-[#164E3D]">
              <span>{item.tea.name} ({item.size})</span>
              <span className="bg-[#164E3D] text-white px-2 py-0.2 rounded-full font-mono">x{item.quantity}</span>
            </div>
            
            {/* Barista Recipe Spec */}
            <div className="text-[11px] text-[#55635B] mt-1 space-y-0.5">
              <div>Đường: <strong>{item.sugar}%</strong> • Đá: <strong>{item.ice}%</strong></div>
              {item.toppings.length > 0 && (
                <div className="text-[#D95829] font-medium">
                  Topping: {item.toppings.map(t => t.name).join(', ')}
                </div>
              )}
              {item.note && (
                <div className="text-gray-500 italic">*{item.note}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Payment & Total */}
      <div className="pt-2 flex items-center justify-between text-xs">
        <div>
          <div className="text-[10px] text-[#86928B]">Tổng đơn ({order.items.reduce((s, it) => s + it.quantity, 0)} ly):</div>
          <div className="font-sans font-bold text-sm text-[#D95829]">
            {formatVND(order.total)}
          </div>
        </div>

        <button
          onClick={() => onUpdatePayment(order.id, order.paymentStatus === 'paid' ? 'unpaid' : 'paid')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
            order.paymentStatus === 'paid'
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}
        >
          {order.paymentStatus === 'paid' ? 'ĐÃ THANH TOÁN' : 'CHƯA THU TIỀN'}
        </button>
      </div>

      {/* Action Buttons for Barista workflow */}
      <div className="pt-2 border-t border-[#F0EAE1] flex items-center gap-2">
        {order.status === 'pending' && (
          <button
            onClick={() => onUpdateStatus(order.id, 'preparing')}
            className="flex-1 py-2 px-3 rounded-xl bg-[#164E3D] hover:bg-[#0E362A] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <ChefHat className="w-3.5 h-3.5 text-[#F4A261]" />
            <span>NHẬN PHA CHẾ</span>
          </button>
        )}

        {order.status === 'preparing' && (
          <button
            onClick={() => onUpdateStatus(order.id, 'ready')}
            className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>PHA XONG</span>
          </button>
        )}

        {order.status === 'ready' && (
          <button
            onClick={() => onUpdateStatus(order.id, 'completed')}
            className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>HOÀN THÀNH</span>
          </button>
        )}

        {/* Print button */}
        <button
          onClick={() => onPrint(order)}
          className="p-2 rounded-xl border border-[#DDD6C8] bg-[#FAF7F2] hover:bg-[#EAE3D2] text-[#3E4A43] transition-colors"
          title="In phiếu K80"
        >
          <Printer className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
