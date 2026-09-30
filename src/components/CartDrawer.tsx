import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, CheckCircle2, 
  QrCode, Banknote, Tag, Eye, UtensilsCrossed, Bike, Award, Clock,
  User, Phone, Check, Copy
} from 'lucide-react';
import type { CartItem, OrderCustomerInfo } from '../types/tea';
import type { PosOrder } from '../types/pos';
import { useOrders } from '../context/OrderContext';
import { playSuccessSound, playClickSound } from '../utils/audio';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQuantity: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onOpenTracker: () => void;
  initialServingType?: 'dine-in' | 'delivery';
  initialTableNumber?: string;
  initialStep?: 'cart' | 'checkout';
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOpenTracker,
  initialServingType = 'delivery',
  initialTableNumber = 'Bàn 01',
  initialStep = 'cart',
}) => {
  const { addOrder, currentUser, loginMember, addPointsToMember, members, deductPointsFromMember, getTableStatus, allTablesList } = useOrders();
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>(initialStep);
  const [servingType, setServingType] = useState<'dine-in' | 'delivery'>(initialServingType);
  const [tableNumber, setTableNumber] = useState<string>(initialTableNumber);
  const [lastEarnedPoints, setLastEarnedPoints] = useState<number>(0);
  const [currentMemberPoints, setCurrentMemberPoints] = useState<number>(0);
  const [placedItems, setPlacedItems] = useState<CartItem[]>([]);
  const [placedPaymentMethod, setPlacedPaymentMethod] = useState<'vietqr' | 'cod'>('vietqr');
  const [placedGrandTotal, setPlacedGrandTotal] = useState<number>(0);
  const [isTransferConfirmed, setIsTransferConfirmed] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopyText = (text: string, field: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (e) {
      console.debug('Copy error', e);
    }
  };

  const allTables: string[] = allTablesList && allTablesList.length > 0
    ? allTablesList
    : Array.from({ length: 12 }, (_, i) => `Bàn ${String(i + 1).padStart(2, '0')}`);
  const firstAvailableTable = useMemo(() => allTables.find((t: string) => getTableStatus(t) === 'available'), [allTables, getTableStatus]);
  const isCurrentTableOccupied = servingType === 'dine-in' && getTableStatus(tableNumber) !== 'available';

  useEffect(() => {
    if (isOpen) {
      setServingType(initialServingType);
      // Nếu bàn ban đầu đã có khách ngồi và có bàn trống khác, ưu tiên gợi ý bàn trống
      if (initialServingType === 'dine-in' && getTableStatus(initialTableNumber) !== 'available' && firstAvailableTable) {
        setTableNumber(initialTableNumber);
      } else {
        setTableNumber(initialTableNumber);
      }
      if (initialStep) {
        setStep(initialStep);
      }

      // Khôi phục thông tin khách hàng đã lưu từ localStorage
      try {
        const saved = localStorage.getItem('tra_customer_info');
        if (saved) {
          const parsed = JSON.parse(saved);
          setCustomer((prev) => ({
            ...prev,
            name: prev.name || parsed.name || '',
            phone: prev.phone || parsed.phone || '',
          }));
        }
      } catch (e) {}

      if (currentUser) {
        setCustomer((prev) => ({
          ...prev,
          name: prev.name || currentUser.name,
          phone: prev.phone || currentUser.phone,
        }));
      }
    }
  }, [isOpen, initialServingType, initialTableNumber, initialStep, currentUser]);

  const [promoCode, setPromoCode] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [promoApplied, setPromoApplied] = useState<string | null>(null);
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState<boolean>(false);

  const [customer, setCustomer] = useState<OrderCustomerInfo>({
    servingType: 'dine-in',
    tableNumber: 'Bàn 01',
    name: '',
    phone: '',
    address: '',
    paymentMethod: 'vietqr',
    deliveryTime: 'now',
    note: '',
  });

  const [createdOrderCode, setCreatedOrderCode] = useState<string>('');

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  
  // Khi ngồi tại bàn: Không bao giờ tính phí ship (0đ)
  // Khi giao đi: 20.000đ (miễn phí nếu > 99k hoặc áp mã FREESHIP)
  const shippingFee = servingType === 'dine-in' 
    ? 0 
    : (subtotal > 99000 || promoApplied === 'FREESHIP' ? 0 : 20000);

  const pointsDiscountAmount = (useLoyaltyPoints && currentUser && currentUser.points >= 50) ? 20000 : 0;
  const grandTotal = Math.max(0, subtotal + shippingFee - discount - pointsDiscountAmount);

  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  const cleanPhone = customer.phone.replace(/\s+/g, '');
  const matchedMember = members.find((m) => m.phone.replace(/\s+/g, '') === cleanPhone) || (currentUser?.phone.replace(/\s+/g, '') === cleanPhone ? currentUser : null);
  const pointsToEarn = Math.floor(grandTotal / 10000);

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === 'FRESH20') {
      setDiscount(20000);
      setPromoApplied('FRESH20 (Giảm 20.000đ)');
    } else if (code === 'FREESHIP') {
      setDiscount(0);
      setPromoApplied('FREESHIP (Miễn phí vận chuyển)');
    } else {
      alert('Mã không hợp lệ! Hãy thử: FRESH20 hoặc FREESHIP');
    }
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    const finalName = customer.name.trim();
    const cleanPhone = customer.phone.replace(/\s+/g, '');

    // BẮT BUỘC: Điền Tên và Số Điện Thoại để Tích Điểm Thành Viên
    if (!finalName) {
      alert('Vui lòng nhập Họ và tên của bạn để tích điểm và nhận đơn!');
      return;
    }
    if (!cleanPhone || cleanPhone.length < 9) {
      alert('Vui lòng nhập Số điện thoại hợp lệ (từ 10 số) để hệ thống lưu và tích điểm thành viên cho bạn!');
      return;
    }

    if (servingType === 'dine-in') {
      if (!tableNumber) {
        alert('Vui lòng chọn hoặc nhập số bàn của bạn tại quán!');
        return;
      }
      const status = getTableStatus(tableNumber);
      if (status !== 'available') {
        alert(`${tableNumber} đã được đặt đơn rồi và đang có khách ngồi! Không được đặt đơn cho bàn này nữa. Vui lòng chọn một Bàn Trống 🟢 khác hoặc nhờ nhân viên quầy hỗ trợ.`);
        return;
      }
    } else {
      if (!customer.address.trim()) {
        alert('Vui lòng nhập Địa chỉ nhận hàng để nhân viên giao trà tận nơi!');
        return;
      }
    }

    const orderId = 'TH-' + Math.floor(100000 + Math.random() * 900000);
    const orderNum = Math.floor(100 + Math.random() * 899);
    setCreatedOrderCode(orderId);

    // Lưu snapshot các món vừa đặt, tổng tiền và phương thức thanh toán
    setPlacedItems([...cartItems]);
    setPlacedGrandTotal(grandTotal);
    setPlacedPaymentMethod(customer.paymentMethod as 'vietqr' | 'cod');
    setIsTransferConfirmed(false);

    // Lưu thông tin khách hàng vào localStorage để ghi nhớ vĩnh viễn
    try {
      localStorage.setItem('tra_customer_info', JSON.stringify({
        name: finalName,
        phone: cleanPhone,
        tableNumber: servingType === 'dine-in' ? tableNumber : undefined
      }));
    } catch (err) {}

    // 1. Tự động ghi nhận thành viên theo SĐT và Tên
    const member = loginMember(cleanPhone, finalName);

    // 2. Tính và cộng điểm tích lũy: 10.000đ = 1 điểm
    const earnedPoints = Math.floor(grandTotal / 10000);
    setLastEarnedPoints(earnedPoints);
    if (earnedPoints > 0) {
      addPointsToMember(cleanPhone, earnedPoints, grandTotal);
    }

    // 3. Khấu trừ điểm nếu dùng ưu đãi 50 điểm
    if (useLoyaltyPoints && member && member.points >= 50) {
      deductPointsFromMember(cleanPhone, 50);
    }

    // 4. Cập nhật tổng điểm để hiển thị trên màn hình thành công
    const newTotalPoints = (member.points || 0) + earnedPoints - (useLoyaltyPoints ? 50 : 0);
    setCurrentMemberPoints(Math.max(0, newTotalPoints));

    // Create POS counter order
    const isPayLater = customer.paymentMethod === 'cod';
    const newPosOrder: PosOrder = {
      id: orderId,
      orderNumber: orderNum,
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      customer: { 
        ...customer, 
        name: finalName,
        phone: cleanPhone,
        servingType, 
        tableNumber: servingType === 'dine-in' ? tableNumber : undefined,
        note: customer.note || (isPayLater 
          ? (servingType === 'dine-in' 
              ? `Gọi món tại ${tableNumber} - Thanh toán sau tại quầy` 
              : 'Giao hàng - Thu tiền mặt khi nhận') 
          : 'Thanh toán chuyển khoản VietQR'),
      },
      orderType: servingType,
      tableNumber: servingType === 'dine-in' ? tableNumber : undefined,
      items: [...cartItems],
      subtotal,
      shippingFee,
      discount: discount + pointsDiscountAmount,
      total: grandTotal,
      status: 'pending',
      paymentStatus: customer.paymentMethod === 'vietqr' ? 'paid' : 'unpaid',
      staffNote: isPayLater 
        ? (servingType === 'dine-in' ? `Chưa thanh toán (${tableNumber})` : 'Thu tiền mặt khi giao hàng') 
        : 'Đã thanh toán VietQR',
    };

    // Push into POS system
    addOrder(newPosOrder);
    onClearCart(); // XÓA SẠCH SẢN PHẨM VỪA ĐẶT KHỎI GIỎ HÀNG NGAY LẬP TỨC!
    playSuccessSound(true);
    setStep('success');
  };

  const handleOrderMore = () => {
    onClearCart();
    setStep('cart');
    onClose();
  };

  const handleFinish = () => {
    onClearCart();
    setStep('cart');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] overflow-hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF7F2] border-l border-[#EAE3D2] text-[#222B25] shadow-2xl flex flex-col">
          
          {/* Header Giỏ Hàng */}
          <div className="p-4 sm:p-5 border-b border-[#EAE3D2] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#F5EFE9] text-[#322821] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display font-bold text-base sm:text-lg text-[#322821] leading-tight">
                  {step === 'cart' && `Giỏ Hàng (${cartItems.reduce((a, b) => a + b.quantity, 0)} món)`}
                  {step === 'checkout' && (servingType === 'dine-in' ? `Xác Nhận Đặt Món (${tableNumber})` : 'Xác Nhận Đặt Trà Giao Đi')}
                  {step === 'success' && (servingType === 'dine-in' ? `Đặt Món Thành Công (${tableNumber})` : 'Đặt Hàng Thành Công')}
                </h2>
                {servingType === 'dine-in' && step !== 'success' && (
                  <p className="text-[11px] text-[#7A6D63] font-medium flex items-center gap-1.5 mt-0.5">
                    <span>🪑 Gọi món tại bàn:</span>
                    <strong className="text-[#D95829] font-bold">{tableNumber}</strong>
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F5EFE6] hover:bg-[#EAE3D2] flex items-center justify-center text-[#55635B]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Thanh Tiến Trình Từng Bước (Step Indicator) */}
          <div className="bg-[#FAF7F2] border-b border-[#EAE3D2] px-4 py-2 flex items-center justify-between text-[11px] font-bold">
            <button
              type="button"
              onClick={() => step !== 'success' && setStep('cart')}
              className={`flex items-center gap-1.5 transition-colors ${
                step === 'cart' ? 'text-[#322821] font-extrabold' : 'text-[#8C7E74]'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === 'cart' ? 'bg-[#322821] text-white shadow-2xs' : 'bg-white border border-[#DDD6C8] text-[#55635B]'
              }`}>
                1
              </span>
              <span>1. Giỏ Hàng</span>
            </button>
            <span className="text-[#C5BAAF]">➔</span>
            <div className={`flex items-center gap-1.5 ${
              step === 'checkout' ? 'text-[#322821] font-extrabold' : 'text-[#8C7E74]'
            }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === 'checkout' ? 'bg-[#322821] text-white shadow-2xs' : 'bg-white border border-[#DDD6C8] text-[#55635B]'
              }`}>
                2
              </span>
              <span>2. Thông Tin & Bàn</span>
            </div>
            <span className="text-[#C5BAAF]">➔</span>
            <div className={`flex items-center gap-1.5 ${
              step === 'success' ? 'text-emerald-700 font-extrabold' : 'text-[#8C7E74]'
            }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === 'success' ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-white border border-[#DDD6C8] text-[#55635B]'
              }`}>
                3
              </span>
              <span>3. Hoàn Tất</span>
            </div>
          </div>

          {/* BƯỚC 1: DANH SÁCH MÓN ĐÃ CHỌN */}
          {step === 'cart' && (
            <>
              {cartItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#7C8780]">
                  <div className="w-20 h-20 rounded-full bg-white border border-[#EAE3D2] flex items-center justify-center text-4xl mb-4 shadow-sm">
                    🍵
                  </div>
                  <p className="text-base font-bold text-[#322821]">Giỏ hàng của bạn đang trống</p>
                  <p className="text-xs text-[#707D75] mt-1.5 max-w-xs leading-relaxed">
                    Hãy ghé thăm thực đơn và chọn cho mình ly trà trái cây tươi mát lạnh nhé!
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-6 px-6 py-3 rounded-full bg-[#322821] text-white text-xs font-bold hover:bg-[#211A15] shadow-md shadow-[#322821]/20 transition-all"
                  >
                    Xem Thực Đơn Ngay
                  </button>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.cartItemId}
                      className="p-4 rounded-2xl bg-white border border-[#E8E1D2] flex gap-3 relative shadow-2xs"
                    >
                      {/* Ảnh ly trà */}
                      <div className="w-16 h-20 rounded-xl bg-[#FAF7F2] p-1 flex items-center justify-center shrink-0">
                        <img
                          src={item.tea.image}
                          alt={item.tea.name}
                          className="max-h-full w-auto object-contain filter drop-shadow-sm"
                        />
                      </div>

                      {/* Thông tin ly trà */}
                      <div className="flex-1 pr-6">
                        <h4 className="font-bold text-sm text-[#322821] leading-snug">{item.tea.name}</h4>
                        <div className="text-[11px] text-[#637068] mt-1 space-y-0.5">
                          <div>Size: <span className="font-bold text-[#222B25]">{item.size}</span> • Đường: {item.sugar}% • Đá: {item.ice}%</div>
                          {item.toppings.length > 0 && (
                            <div className="text-[#D95829] font-medium">
                              + {item.toppings.map((t) => t.name).join(', ')}
                            </div>
                          )}
                          {item.note && (
                            <div className="italic text-[#87938B]">"{item.note}"</div>
                          )}
                        </div>

                        {/* Giá tiền và Bộ đếm số lượng */}
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#F0EAE0]">
                          <span className="font-bold text-sm text-[#D95829] font-sans">
                            {formatVND(item.totalPrice)}
                          </span>

                          <div className="flex items-center gap-1.5 bg-[#FAF7F2] rounded-lg p-0.5 border border-[#DDD6C8]">
                            <button
                              onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}
                              className="w-6 h-6 rounded bg-white hover:bg-[#EAE3D2] flex items-center justify-center text-[#222B25]"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold font-sans">{item.quantity}</span>
                            <button
                              onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
                              className="w-6 h-6 rounded bg-white hover:bg-[#EAE3D2] flex items-center justify-center text-[#222B25]"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Nút xóa */}
                      <button
                        onClick={() => onRemoveItem(item.cartItemId)}
                        className="absolute top-3.5 right-3.5 text-[#9AA59E] hover:text-red-600 p-1 transition-colors"
                        title="Xoá món này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* Mã Giảm Giá */}
                  <div className="p-4 rounded-2xl bg-white border border-[#E8E1D2]">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Mã ưu đãi (VD: FRESH20)"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="flex-1 bg-[#FAF7F2] border border-[#DDD6C8] rounded-xl px-3.5 py-2 text-xs uppercase text-[#222B25] placeholder-[#9AA59E] focus:outline-none focus:border-[#322821]"
                      />
                      <button
                        onClick={handleApplyPromo}
                        className="px-4 py-2 rounded-xl bg-[#322821] hover:bg-[#211A15] text-xs font-bold text-white shadow-sm transition-all"
                      >
                        Áp Dụng
                      </button>
                    </div>
                    {promoApplied && (
                      <p className="text-[11px] text-emerald-700 font-semibold mt-2 flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-emerald-600" /> Đã áp dụng: {promoApplied}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Tạm Tính & Nút Tiếp Tục */}
              {cartItems.length > 0 && (
                <div className="p-5 border-t border-[#EAE3D2] bg-white space-y-3">
                  <div className="space-y-1.5 text-xs text-[#5D6B63]">
                    <div className="flex justify-between">
                      <span>Tạm tính ({cartItems.reduce((a, b) => a + b.quantity, 0)} ly)</span>
                      <span className="font-bold text-[#222B25]">{formatVND(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-[#D95829] font-bold">
                        <span>Ưu đãi giảm giá</span>
                        <span>-{formatVND(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-bold text-[#222B25] pt-2 border-t border-[#F0EAE0]">
                      <span>Tổng tiền hàng</span>
                      <span className="text-[#D95829] font-sans text-lg">{formatVND(Math.max(0, subtotal - discount))}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      playClickSound(true);
                      setStep('checkout');
                    }}
                    className="w-full py-3.5 px-6 rounded-full bg-[#322821] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#211A15] active:scale-95 transition-all shadow-md shadow-[#322821]/25"
                  >
                    <span>TIẾP TỤC ĐẶT HÀNG</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* BƯỚC 2: CHỌN HÌNH THỨC: NGỒI TẠI BÀN (SỐ BÀN) HOẶC GIAO ĐI */}
          {step === 'checkout' && (
            <form onSubmit={handlePlaceOrder} className="flex-1 flex flex-col overflow-hidden bg-white">
              <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
                {/* BANNER QUY TRÌNH / CẢNH BÁO BÀN */}
                {servingType === 'dine-in' && (
                  isCurrentTableOccupied ? (
                    <div className="p-3.5 bg-red-50 border-2 border-red-300 rounded-2xl shadow-xs space-y-2 animate-fade-in">
                      <div className="flex items-start gap-2.5">
                        <span className="text-2xl">⛔</span>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-black text-red-900 uppercase flex items-center gap-1.5 flex-wrap">
                            <span>BÀN ĐÃ ĐẶT ĐƠN RỒI:</span>
                            <span className="px-2 py-0.5 rounded-full bg-red-200 text-red-950 font-black border border-red-300">
                              {tableNumber}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold border border-red-200">
                              🔒 ĐANG BỊ KHÓA
                            </span>
                          </div>
                          <p className="text-[11px] text-red-800 mt-1 leading-snug">
                            Bàn <strong>{tableNumber}</strong> đã được đặt đơn rồi và đang có khách ngồi. Hệ thống <strong>không cho phép đặt thêm</strong> trên web để tránh nhầm lẫn. Vui lòng chọn một <strong>Bàn Trống 🟢</strong> khác!
                          </p>
                        </div>
                      </div>
                      {firstAvailableTable && (
                        <div className="pt-2 border-t border-red-200 flex justify-between items-center">
                          <span className="text-[11px] text-red-900 font-medium">Bàn còn trống:</span>
                          <button
                            type="button"
                            onClick={() => {
                              setTableNumber(firstAvailableTable);
                              playClickSound(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span>👉 Chuyển sang {firstAvailableTable} (Trống 🟢)</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50/70 border border-amber-300 rounded-2xl shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🪑</span>
                          <div>
                            <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5 flex-wrap">
                              <span>Quy trình gọi món tại bàn:</span>
                              <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-extrabold text-[11px] border border-amber-300">
                                {tableNumber}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                                🟢 Bàn Trống Sẵn Sàng
                              </span>
                            </div>
                            <p className="text-[10px] text-amber-800 mt-0.5">
                              Quét mã QR bàn ➔ Chọn trà ➔ Gửi quầy Barista pha chế
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-amber-200/70 text-[10px] text-center font-bold">
                        <div className="p-1.5 rounded-lg bg-white/80 border border-amber-200 text-amber-900">
                          <span className="block text-[11px]">1. Quét QR</span>
                          <span className="text-[9px] font-normal text-amber-700">Đã chọn {tableNumber}</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-amber-200/80 border border-amber-300 text-amber-950">
                          <span className="block text-[11px]">2. Điền SĐT</span>
                          <span className="text-[9px] font-normal text-amber-800">Tích điểm VIP</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-white/80 border border-amber-200 text-amber-900">
                          <span className="block text-[11px]">3. Gửi Bếp</span>
                          <span className="text-[9px] font-normal text-amber-700">Phục vụ tại bàn</span>
                        </div>
                      </div>
                    </div>
                  )
                )}

                {/* 2 HÌNH THỨC PHỤC VỤ CHÍNH */}
                <div>
                  <label className="block text-[#322821] font-bold text-xs uppercase tracking-wider mb-2">
                    Hình thức phục vụ:
                  </label>
                  
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Nút 1: Ngồi Tại Bàn */}
                    <button
                      type="button"
                      onClick={() => {
                        setServingType('dine-in');
                        playClickSound(true);
                      }}
                      className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all ${
                        servingType === 'dine-in'
                          ? 'border-[#322821] bg-[#F5EFE9] text-[#322821] font-bold ring-2 ring-[#322821]/30 shadow-xs'
                          : 'border-[#EAE3D2] bg-[#FAF7F2] text-[#55635B] hover:bg-[#F3EDE2]'
                      }`}
                    >
                      <UtensilsCrossed className="w-5 h-5 text-[#322821]" />
                      <div className="text-xs">Ngồi Tại Bàn</div>
                      <div className="text-[10px] text-[#718076] font-normal">Miễn phí ship (0đ)</div>
                    </button>

                    {/* Nút 2: Giao Đi Tận Nơi */}
                    <button
                      type="button"
                      onClick={() => {
                        setServingType('delivery');
                        playClickSound(true);
                      }}
                      className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all ${
                        servingType === 'delivery'
                          ? 'border-[#322821] bg-[#F5EFE9] text-[#322821] font-bold ring-2 ring-[#322821]/30 shadow-xs'
                          : 'border-[#EAE3D2] bg-[#FAF7F2] text-[#55635B] hover:bg-[#F3EDE2]'
                      }`}
                    >
                      <Bike className="w-5 h-5 text-[#D95829]" />
                      <div className="text-xs">Giao Đi Tận Nơi</div>
                      <div className="text-[10px] text-[#718076] font-normal">Freeship từ 99K</div>
                    </button>
                  </div>
                </div>

                {/* TRƯỜNG HỢP 1: NGỒI TẠI BÀN (CHỌN SỐ BÀN) */}
                {servingType === 'dine-in' && (
                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D2] space-y-3.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#322821]">
                      <span className="w-2 h-2 rounded-full bg-[#322821]" />
                      <span>Thông tin bàn phục vụ tại quán</span>
                    </div>

                    <div>
                      <label className="block text-[#4B574F] font-bold mb-1.5">
                        Chọn hoặc nhập số bàn của bạn *
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-2">
                        {allTables.map((b) => {
                          const status = getTableStatus(b);
                          const isOccupied = status !== 'available';
                          const isSelected = tableNumber === b;
                          return (
                            <button
                              key={b}
                              type="button"
                              disabled={isOccupied}
                              onClick={() => {
                                if (isOccupied) return;
                                setTableNumber(b);
                                playClickSound(true);
                              }}
                              className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center ${
                                isOccupied
                                  ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed opacity-50 shadow-none'
                                  : isSelected
                                  ? 'bg-[#322821] text-white border-[#322821] shadow-xs cursor-pointer'
                                  : 'bg-white text-[#434F47] border-[#DDD6C8] hover:bg-[#F0EAE1] cursor-pointer'
                              }`}
                              title={isOccupied ? `${b} đã có khách đặt đơn rồi (đang bị khóa)` : `${b} đang trống`}
                            >
                              <span>{b}</span>
                              <span className="text-[9px] font-bold">
                                {isOccupied 
                                  ? '🔒 Đã có khách' 
                                  : 'Trống 🟢'}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Thông báo nếu bàn đang chọn có khách ngồi */}
                      {isCurrentTableOccupied && (
                        <div className="mb-2 p-2.5 rounded-xl bg-red-100 border border-red-300 text-[11px] text-red-950 flex items-center gap-2 font-bold animate-fade-in">
                          <span className="text-base">⛔</span>
                          <div>
                            <strong>{tableNumber}</strong> đã được đặt đơn rồi và đang có khách! Bạn <strong>không được đặt bàn này nữa</strong>. Vui lòng bấm chọn một Bàn Trống 🟢 phía trên.
                          </div>
                        </div>
                      )}

                      {/* Hoặc nhập số bàn khác */}
                      <input
                        type="text"
                        placeholder="Hoặc gõ số bàn khác (VD: Bàn 12, Tầng 2...)"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        className="w-full bg-white border border-[#DDD6C8] rounded-xl px-3.5 py-2 text-[#222B25] focus:outline-none focus:border-[#322821] font-bold"
                      />
                    </div>
                  </div>
                )}

                {/* TRƯỜNG HỢP 2: GIAO ĐI TẬN NƠI (NHẬP ĐỊA CHỈ NHẬN HÀNG) */}
                {servingType === 'delivery' && (
                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D2] space-y-2">
                    <label className="block text-[#4B574F] font-bold text-xs mb-1">
                      Địa chỉ giao hàng tận nơi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Số nhà, tên đường, Phường, Quận..."
                      value={customer.address}
                      onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                      className="w-full bg-white border border-[#DDD6C8] rounded-xl px-3.5 py-2.5 text-xs text-[#222B25] focus:outline-none focus:border-[#322821]"
                    />
                  </div>
                )}

                {/* KHỐI THÔNG TIN KHÁCH HÀNG & TÍCH ĐIỂM (BẮT BUỘC ĐỂ TÍCH ĐIỂM) */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FFFDF9] to-[#FAF5EB] border border-[#E8DFC8] space-y-3.5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-[#EAE3D2] pb-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#322821]">
                      <Award className="w-4 h-4 text-[#D95829]" />
                      <span className="uppercase tracking-wide">Thông Tin & Tích Điểm Thành Viên</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      10.000đ = 1 điểm
                    </span>
                  </div>

                  {/* Họ và tên */}
                  <div>
                    <label className="block text-[#4B574F] font-bold mb-1 text-[11px]">
                      Họ và tên của quý khách <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="VD: Nguyễn Văn A / Chị Ngọc..."
                        value={customer.name}
                        onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                        className="w-full bg-white border border-[#DDD6C8] rounded-xl px-3.5 py-2.5 text-xs text-[#222B25] focus:outline-none focus:border-[#322821] font-semibold pl-9 shadow-inner"
                      />
                      <User className="w-4 h-4 text-[#8C7E74] absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* Số điện thoại */}
                  <div>
                    <label className="block text-[#4B574F] font-bold mb-1 text-[11px]">
                      Số điện thoại tích điểm & nhận đơn <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        placeholder="VD: 0901 234 567"
                        value={customer.phone}
                        onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                        className="w-full bg-white border border-[#DDD6C8] rounded-xl px-3.5 py-2.5 text-xs text-[#222B25] focus:outline-none focus:border-[#322821] font-bold pl-9 tracking-wider shadow-inner"
                      />
                      <Phone className="w-4 h-4 text-[#8C7E74] absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>

                    {/* Huy hiệu nhận diện thành viên theo SĐT thời gian thực */}
                    {cleanPhone.length >= 9 && (
                      <div className="mt-2 text-[11px] transition-all">
                        {matchedMember ? (
                          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                            <div className="flex items-center justify-between font-bold">
                              <span>⭐ Thành viên: {matchedMember.name} ({matchedMember.tier})</span>
                              <span className="text-[#D95829] font-extrabold">{matchedMember.points} điểm</span>
                            </div>
                            {matchedMember.points >= 50 && (
                              <label className="flex items-center justify-between pt-1.5 border-t border-emerald-200/60 cursor-pointer">
                                <span className="text-emerald-800">Đổi 50 điểm giảm ngay 20.000đ:</span>
                                <input
                                  type="checkbox"
                                  checked={useLoyaltyPoints}
                                  onChange={(e) => setUseLoyaltyPoints(e.target.checked)}
                                  className="w-4 h-4 accent-[#322821] rounded"
                                />
                              </label>
                            )}
                          </div>
                        ) : (
                          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-1.5">
                            <span>🎁 Số mới: Tự động tạo thẻ & tặng ngay <strong>+20 điểm</strong> chào mừng!</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Dự kiến điểm cộng từ đơn này */}
                    <div className="mt-2 flex items-center justify-between text-[11px] text-[#7A6E65] pt-1">
                      <span>Điểm tích lũy dự kiến từ đơn này:</span>
                      <span className="font-extrabold text-[#D95829] text-xs">+{pointsToEarn} điểm</span>
                    </div>
                  </div>
                </div>

                {/* CHỌN CÁC BƯỚC / PHƯƠNG THỨC THANH TOÁN */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[#322821] font-bold text-xs uppercase tracking-wider">
                      Chọn phương thức thanh toán:
                    </label>
                    <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                      An Toàn & Tiện Lợi
                    </span>
                  </div>

                  <div className="space-y-2">
                    {/* Bước / Tùy chọn 1: VietQR Chuyển Khoản Ngân Hàng */}
                    <div
                      onClick={() => {
                        setCustomer({ ...customer, paymentMethod: 'vietqr' });
                        playClickSound(true);
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        customer.paymentMethod === 'vietqr'
                          ? 'border-[#322821] bg-[#F5EFE9] ring-2 ring-[#322821]/30 shadow-xs'
                          : 'border-[#EAE3D2] bg-[#FAF7F2] hover:bg-[#F2EDE2]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          customer.paymentMethod === 'vietqr' ? 'bg-[#322821] text-white' : 'bg-white text-[#322821] border border-[#DDD6C8]'
                        }`}>
                          <QrCode className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-[#322821]">Chuyển Khoản / Quét Mã VietQR</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              Khuyên dùng
                            </span>
                          </div>
                          <p className="text-[11px] text-[#69786F] mt-0.5 leading-snug">
                            Mở ứng dụng ngân hàng hoặc Momo quét mã QR chuyển khoản nhanh chóng không cần nhập STK.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bước / Tùy chọn 2: Thanh toán trực tiếp */}
                    <div
                      onClick={() => {
                        setCustomer({ ...customer, paymentMethod: 'cod' });
                        playClickSound(true);
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        customer.paymentMethod === 'cod'
                          ? 'border-[#322821] bg-[#F5EFE9] ring-2 ring-[#322821]/30 shadow-xs'
                          : 'border-[#EAE3D2] bg-[#FAF7F2] hover:bg-[#F2EDE2]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          customer.paymentMethod === 'cod' ? 'bg-[#322821] text-white' : 'bg-white text-[#322821] border border-[#DDD6C8]'
                        }`}>
                          {servingType === 'dine-in' ? <Clock className="w-5 h-5" /> : <Banknote className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-[#322821]">
                              {servingType === 'dine-in' ? 'Gọi Món Trước • Thanh Toán Sau Tại Quầy' : 'Tiền Mặt Khi Nhận Hàng (COD)'}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#69786F] mt-0.5 leading-snug">
                            {servingType === 'dine-in'
                              ? 'Dùng trà xong quý khách chỉ cần ra quầy thu ngân thanh toán tiền mặt hoặc thẻ.'
                              : 'Nhận ly trà mát lạnh tận tay rồi thanh toán tiền mặt trực tiếp cho shipper.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ghi chú */}
                <div>
                  <label className="block text-[#4B574F] font-bold mb-1">Ghi chú cho quầy (Tùy chọn)</label>
                  <input
                    type="text"
                    placeholder="VD: Không lấy ống hút nhựa, mang ra nhanh..."
                    value={customer.note}
                    onChange={(e) => setCustomer({ ...customer, note: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#DDD6C8] rounded-xl px-3.5 py-2.5 text-xs text-[#222B25] focus:outline-none focus:border-[#322821]"
                  />
                </div>
              </div>

              {/* Chân trang thanh toán */}
              <div className="p-5 border-t border-[#EAE3D2] bg-[#FAF7F2] space-y-3">
                <div className="space-y-1 text-xs text-[#5D6B63]">
                  <div className="flex justify-between">
                    <span>Hình thức:</span>
                    <strong className="text-[#322821]">
                      {servingType === 'dine-in' ? `Ngồi tại quán (${tableNumber})` : 'Giao đi tận nơi'}
                    </strong>
                  </div>
                  {servingType === 'delivery' && (
                    <div className="flex justify-between">
                      <span>Phí giao hàng:</span>
                      <span className={shippingFee === 0 ? 'text-emerald-700 font-bold' : ''}>
                        {shippingFee === 0 ? 'MIỄN PHÍ' : formatVND(shippingFee)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold pt-1 border-t border-[#EAE3D2]">
                    <span>Tổng tiền thanh toán:</span>
                    <span className="text-[#D95829] font-sans text-lg">{formatVND(grandTotal)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep('cart')}
                    className="w-1/3 py-3 rounded-full border border-[#DDD6C8] text-[#47544C] font-bold text-xs hover:bg-white"
                  >
                    QUAY LẠI
                  </button>
                  <button
                    type="submit"
                    disabled={isCurrentTableOccupied || cartItems.length === 0}
                    className={`flex-1 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all ${
                      isCurrentTableOccupied
                        ? 'bg-red-100 text-red-900 border-2 border-red-300 cursor-not-allowed shadow-none'
                        : 'bg-[#322821] hover:bg-[#211A15] text-white shadow-[#322821]/25 active:scale-[0.98] cursor-pointer'
                    }`}
                  >
                    {isCurrentTableOccupied ? (
                      <span>⛔ BÀN ĐÃ CÓ KHÁCH - KHÔNG ĐƯỢC ĐẶT</span>
                    ) : (
                      <>
                        <span>HOÀN TẤT ĐẶT TRÀ</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* BƯỚC 3: ĐẶT HÀNG THÀNH CÔNG TẠI BÀN & THEO DÕI ĐƠN */}
          {step === 'success' && (
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col justify-between bg-white text-left">
              <div className="space-y-4">
                {/* Banner Thông Báo Thành Công */}
                <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-50 to-amber-50/70 border border-emerald-200 text-center shadow-xs">
                  <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-2.5 shadow-md shadow-emerald-600/25">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-black text-[11px] uppercase tracking-wider mb-1.5 border border-emerald-300">
                    {servingType === 'dine-in' ? '🎉 ĐẶT MÓN THÀNH CÔNG TẠI BÀN' : '🎉 ĐẶT HÀNG THÀNH CÔNG'}
                  </span>
                  <h3 className="font-display font-black text-xl sm:text-2xl text-[#322821]">
                    {servingType === 'dine-in' ? tableNumber : 'GIAO TẬN NƠI'}
                  </h3>
                  <p className="text-xs text-[#55635B] mt-1 max-w-xs mx-auto leading-relaxed">
                    {servingType === 'dine-in' ? (
                      <>
                        Xin chào <strong>{customer.name}</strong>! Đơn gọi món tại <strong>{tableNumber}</strong> đã được chuyển thẳng tới Quầy Barista (KDS) để pha chế ngay. Mã đơn: <span className="font-mono text-[#D95829] font-bold">#{createdOrderCode}</span>.
                      </>
                    ) : (
                      <>
                        Xin chào <strong>{customer.name}</strong>! Đơn giao hàng đã được gửi tới Barista. Mã đơn: <span className="font-mono text-[#D95829] font-bold">#{createdOrderCode}</span>.
                      </>
                    )}
                  </p>
                </div>

                {/* QUY TRÌNH TIẾN ĐỘ THỜI GIAN THỰC (LIVE TIMELINE TRACKER) */}
                <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D2] space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-[#322821]">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#D95829]" />
                      <span>Tiến độ phục vụ {servingType === 'dine-in' ? `tại ${tableNumber}` : 'đơn hàng'}:</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                      Đang chuẩn bị
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                    <div className="p-2 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold">
                      <div className="text-xs mb-0.5">✔</div>
                      <div>Đã nhận đơn</div>
                    </div>
                    <div className="p-2 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 font-bold animate-pulse">
                      <div className="text-xs mb-0.5">☕</div>
                      <div>Đang pha chế</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white text-stone-500 border border-stone-200">
                      <div className="text-xs mb-0.5">{servingType === 'dine-in' ? '🪑' : '🛵'}</div>
                      <div>{servingType === 'dine-in' ? `Phục vụ ${tableNumber}` : 'Giao tận nơi'}</div>
                    </div>
                  </div>

                  {servingType === 'dine-in' && (
                    <p className="text-[11px] text-[#69786F] italic text-center pt-1 border-t border-[#EAE3D2]">
                      💡 Quý khách cứ yên tâm ngồi tại <strong>{tableNumber}</strong>, nhân viên sẽ mang trà phục vụ tận bàn!
                    </p>
                  )}
                </div>

                {/* HỘP TÍCH ĐIỂM THÀNH VIÊN VIP LƯU VĨNH VIỄN */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#322821] to-[#1E1712] text-white shadow-md space-y-2">
                  <div className="flex items-center justify-between text-xs text-amber-200">
                    <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-[#F4A261]" />
                      <span>ĐÃ TÍCH ĐIỂM THÀNH VIÊN VIP</span>
                    </span>
                    <span className="font-extrabold text-[#F4A261] text-sm">+{lastEarnedPoints} ĐIỂM</span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <div>
                      <div className="font-bold text-white">{customer.name}</div>
                      <div className="text-stone-300 font-mono text-[11px]">{customer.phone}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-stone-400">Tổng điểm hiện có:</div>
                      <div className="font-black text-[#F4A261] text-base font-sans">{currentMemberPoints} điểm</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10 text-[10px] text-stone-300 flex items-center justify-between">
                    <span>⚡ Thông tin đã lưu tự động</span>
                    <span className="text-amber-300">Lần sau quét QR tự nhận diện</span>
                  </div>
                </div>

                {/* CHI TIẾT THANH TOÁN: VIETQR HOẶC THANH TOÁN TẠI QUẦY */}
                {placedPaymentMethod === 'vietqr' ? (
                  <div className="p-4 rounded-3xl bg-white border-2 border-amber-500/50 text-[#222B25] shadow-md text-center space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider">
                      <QrCode className="w-4 h-4 text-[#D95829]" />
                      <span>Quét Mã VietQR Chuyển Khoản</span>
                    </div>

                    {/* Khung mã QR VietQR chuẩn ngân hàng */}
                    <div className="relative w-48 h-48 mx-auto p-2 bg-white rounded-2xl border-2 border-dashed border-amber-400 shadow-sm flex items-center justify-center">
                      <img
                        src={`https://img.vietqr.io/image/MB-0794999406-compact2.png?amount=${placedGrandTotal || grandTotal}&addInfo=${encodeURIComponent(createdOrderCode)}&accountName=NGUYEN%20TAN%20PHUC%20HAU`}
                        alt="VietQR code"
                        className="w-full h-full object-contain rounded-xl"
                        onError={(e) => {
                          e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=2|99|0794999406|THUONG%20TEA||0|0|${placedGrandTotal || grandTotal}|${createdOrderCode}|transfer_myqr`;
                        }}
                      />
                    </div>
                    <p className="text-[11px] text-stone-500 italic">
                      Mở app Ngân hàng hoặc MoMo quét mã để tự động điền STK & Nội dung
                    </p>

                    {/* BẢNG CHI TIẾT THÔNG TIN CHUYỂN KHOẢN VÀ NÚT SAO CHÉP */}
                    <div className="bg-[#FAF7F2] border border-[#EAE3D2] rounded-2xl p-3 text-left space-y-2 text-xs">
                      {/* Ngân hàng */}
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500">Ngân hàng:</span>
                        <span className="font-bold text-[#322821]">MB Bank (Ngân Hàng Quân Đội)</span>
                      </div>

                      {/* Số tài khoản */}
                      <div className="flex items-center justify-between border-t border-[#EAE3D2]/70 pt-2">
                        <span className="text-stone-500">Số tài khoản:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-sm text-[#D95829]">0794999406</span>
                          <button
                            type="button"
                            onClick={() => handleCopyText('0794999406', 'stk')}
                            className="px-2 py-0.5 rounded-md bg-white border border-[#DDD6C8] hover:bg-stone-100 text-[10px] font-semibold text-stone-700 flex items-center gap-1 transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedField === 'stk' ? 'Đã chép!' : 'Sao chép'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Chủ tài khoản */}
                      <div className="flex items-center justify-between border-t border-[#EAE3D2]/70 pt-2">
                        <span className="text-stone-500">Chủ tài khoản:</span>
                        <span className="font-bold text-[#322821] uppercase">NGUYỄN TẤN PHÚC HẬU</span>
                      </div>

                      {/* Số tiền */}
                      <div className="flex items-center justify-between border-t border-[#EAE3D2]/70 pt-2">
                        <span className="text-stone-500">Số tiền:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-sans font-black text-sm text-[#D95829]">{formatVND(placedGrandTotal || grandTotal)}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(String(placedGrandTotal || grandTotal), 'amount')}
                            className="px-2 py-0.5 rounded-md bg-white border border-[#DDD6C8] hover:bg-stone-100 text-[10px] font-semibold text-stone-700 flex items-center gap-1 transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedField === 'amount' ? 'Đã chép!' : 'Sao chép'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Nội dung chuyển khoản */}
                      <div className="flex items-center justify-between border-t border-[#EAE3D2]/70 pt-2 bg-amber-50/80 -mx-3 -mb-3 p-2.5 rounded-b-2xl border-amber-200">
                        <div>
                          <span className="block text-[10px] text-amber-800 font-medium">Nội dung chuyển khoản (bắt buộc):</span>
                          <span className="font-mono font-black text-sm text-red-600">{createdOrderCode}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyText(createdOrderCode, 'memo')}
                          className="px-2.5 py-1 rounded-lg bg-[#322821] hover:bg-black text-[11px] font-bold text-white flex items-center gap-1 shadow-xs transition-colors"
                        >
                          <Copy className="w-3 h-3 text-amber-300" />
                          <span>{copiedField === 'memo' ? 'Đã chép!' : 'Sao chép'}</span>
                        </button>
                      </div>
                    </div>

                    {!isTransferConfirmed ? (
                      <button
                        type="button"
                        onClick={() => {
                          setIsTransferConfirmed(true);
                          playSuccessSound(true);
                        }}
                        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        <span>Tôi Đã Chuyển Khoản Xong</span>
                      </button>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>Đã ghi nhận thông tin chuyển khoản VietQR!</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-amber-900">
                      <Banknote className="w-4 h-4 text-amber-700" />
                      <span>Thanh Toán Sau Tại Quầy Thu Ngân</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      {servingType === 'dine-in'
                        ? `Quý khách dùng trà xong, trước khi ra về chỉ cần ghé Quầy Thu Ngân báo ${tableNumber} để thanh toán tiền mặt hoặc quẹt thẻ.`
                        : 'Quý khách vui lòng chuẩn bị đúng số tiền mặt để thanh toán trực tiếp cho shipper khi nhận trà.'
                      }
                    </p>
                    <div className="pt-1.5 border-t border-amber-200/80 flex justify-between font-bold">
                      <span>Cần thanh toán:</span>
                      <span className="font-sans text-[#D95829] text-sm">{formatVND(placedGrandTotal || grandTotal)}</span>
                    </div>
                  </div>
                )}

                {/* TÓM TẮT MÓN VỪA ĐẶT */}
                {placedItems.length > 0 && (
                  <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D2] text-xs">
                    <div className="font-bold text-[#322821] mb-2 flex justify-between items-center">
                      <span>Món đã đặt ({placedItems.length} món):</span>
                      <span className="text-[#D95829] font-sans font-bold">{formatVND(placedGrandTotal || grandTotal)}</span>
                    </div>
                    <div className="divide-y divide-[#EAE3D2] max-h-32 overflow-y-auto pr-1">
                      {placedItems.map((item) => (
                        <div key={item.cartItemId} className="py-1.5 flex items-center justify-between text-[11px]">
                          <div className="truncate mr-2">
                            <span className="font-bold text-[#322821]">{item.tea.name}</span>
                            <span className="text-[#7A6D63] ml-1">(Size {item.size} x{item.quantity})</span>
                          </div>
                          <span className="font-sans font-bold text-[#D95829] shrink-0">
                            {formatVND(item.totalPrice)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* NÚT HÀNH ĐỘNG DƯỚI CÙNG */}
              <div className="space-y-2 mt-4 pt-3 border-t border-[#EAE3D2]">
                {onOpenTracker && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenTracker();
                    }}
                    className="w-full py-3 px-4 rounded-2xl bg-[#322821] hover:bg-[#211A15] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
                  >
                    <Eye className="w-4 h-4 text-[#F4A261]" />
                    <span>THEO DÕI TIẾN ĐỘ PHA CHẾ TẠI QUẦY →</span>
                  </button>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleOrderMore}
                    className="flex-1 py-2.5 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#DDD6C8] text-[#322821] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#D95829]" />
                    <span>{servingType === 'dine-in' ? `Gọi thêm món cho ${tableNumber}` : 'Đặt thêm món khác'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleFinish}
                    className="py-2.5 px-4 rounded-xl border border-[#DDD6C8] text-[#69786F] hover:text-[#322821] font-bold text-xs transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
