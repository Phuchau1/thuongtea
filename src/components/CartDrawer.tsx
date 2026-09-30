import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, CheckCircle2, 
  QrCode, Banknote, Tag, Eye, UtensilsCrossed, Bike, Award, Clock,
  User, Phone, Check, Copy, MapPin, Sparkles, AlertCircle
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

interface FormErrors {
  name?: string;
  phone?: string;
  address?: string;
  tableNumber?: string;
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
  const { 
    addOrder, 
    currentUser, 
    loginMember, 
    addPointsToMember, 
    members, 
    deductPointsFromMember, 
    getTableStatus, 
    allTablesList,
    validateCoupon
  } = useOrders();

  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>(initialStep);
  const [servingType, setServingType] = useState<'dine-in' | 'delivery'>(initialServingType);
  const [tableNumber, setTableNumber] = useState<string>(initialTableNumber);
  const [lastEarnedPoints, setLastEarnedPoints] = useState<number>(0);
  const [currentMemberPoints, setCurrentMemberPoints] = useState<number>(0);
  const [placedItems, setPlacedItems] = useState<CartItem[]>([]);
  const [placedPaymentMethod, setPlacedPaymentMethod] = useState<'vietqr' | 'cod'>('vietqr');
  const [placedGrandTotal, setPlacedGrandTotal] = useState<number>(0);
  const [placedServingType, setPlacedServingType] = useState<'dine-in' | 'delivery'>('dine-in');
  const [placedTableNumber, setPlacedTableNumber] = useState<string>('');
  const [placedAddress, setPlacedAddress] = useState<string>('');
  const [isTransferConfirmed, setIsTransferConfirmed] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [promoCode, setPromoCode] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [promoApplied, setPromoApplied] = useState<string | null>(null);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
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

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [createdOrderCode, setCreatedOrderCode] = useState<string>('');
  const prevIsOpenRef = useRef(false);

  const allTables: string[] = allTablesList && allTablesList.length > 0
    ? allTablesList
    : Array.from({ length: 12 }, (_, i) => `Bàn ${String(i + 1).padStart(2, '0')}`);

  const handleCopyText = (text: string, field: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (e) {
      console.debug('Copy error', e);
    }
  };

  useEffect(() => {
    // Chỉ kích hoạt khởi tạo lại khi Drawer chuyển từ ĐÓNG sang MỞ
    if (isOpen && !prevIsOpenRef.current) {
      setServingType(initialServingType);
      setTableNumber(initialTableNumber);
      setStep(initialStep || 'cart');
      setFormErrors({});

      // Khôi phục thông tin khách hàng đã lưu từ localStorage
      try {
        const saved = localStorage.getItem('tra_customer_info');
        if (saved) {
          const parsed = JSON.parse(saved);
          setCustomer((prev) => ({
            ...prev,
            name: prev.name || parsed.name || '',
            phone: prev.phone || parsed.phone || '',
            address: prev.address || parsed.address || '',
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

    if (!isOpen) {
      setStep(initialStep || 'cart');
    }

    prevIsOpenRef.current = isOpen;
  }, [isOpen, initialServingType, initialTableNumber, initialStep]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  
  // Khi ngồi tại bàn: Không bao giờ tính phí ship (0đ)
  // Khi giao đi: 20.000đ (miễn phí nếu > 99k hoặc áp mã FREESHIP)
  const shippingFee = servingType === 'dine-in' 
    ? 0 
    : (subtotal >= 99000 || promoApplied?.includes('FREESHIP') ? 0 : 20000);

  const pointsDiscountAmount = (useLoyaltyPoints && currentUser && currentUser.points >= 50) ? 20000 : 0;
  const grandTotal = Math.max(0, subtotal + shippingFee - discount - pointsDiscountAmount);

  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  const cleanPhone = customer.phone.replace(/\s+/g, '');
  const matchedMember = members.find((m) => m.phone.replace(/\s+/g, '') === cleanPhone) || 
    (currentUser?.phone.replace(/\s+/g, '') === cleanPhone ? currentUser : null);
  const pointsToEarn = Math.floor(grandTotal / 10000);

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) {
      setPromoMessage('Vui lòng nhập mã giảm giá.');
      return;
    }
    const result = validateCoupon(code, subtotal);
    if (result.valid && result.coupon) {
      setDiscount(result.discount);
      setPromoApplied(`${result.coupon.code} (${result.coupon.type === 'percent' ? `Giảm ${result.coupon.value}%` : `Giảm ${formatVND(result.discount)}`})`);
      setPromoMessage(result.message);
    } else {
      setDiscount(0);
      setPromoApplied(null);
      setPromoMessage(result.message);
    }
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    const finalName = customer.name.trim();
    const cleanPhone = customer.phone.replace(/\s+/g, '');

    // Kiểm tra tính hợp lệ của biểu mẫu (Inline form validation)
    const errors: FormErrors = {};

    if (!finalName) {
      errors.name = 'Vui lòng nhập Họ và tên của quý khách';
    }

    if (!cleanPhone || cleanPhone.length < 9) {
      errors.phone = 'Vui lòng nhập Số điện thoại hợp lệ (từ 10 số)';
    }

    if (servingType === 'dine-in') {
      if (!tableNumber || !tableNumber.trim()) {
        errors.tableNumber = 'Vui lòng chọn hoặc nhập số bàn của bạn tại quán';
      }
    } else {
      if (!customer.address || !customer.address.trim()) {
        errors.address = 'Vui lòng nhập Địa chỉ giao hàng để nhân viên giao trà tận nơi';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    const orderId = 'TH-' + Math.floor(100000 + Math.random() * 900000);
    const orderNum = Math.floor(100 + Math.random() * 899);
    setCreatedOrderCode(orderId);

    // Lưu snapshot đơn hàng vừa đặt để hiển thị trên màn hình thành công
    setPlacedItems([...cartItems]);
    setPlacedGrandTotal(grandTotal);
    setPlacedPaymentMethod(customer.paymentMethod as 'vietqr' | 'cod');
    setPlacedServingType(servingType);
    setPlacedTableNumber(tableNumber);
    setPlacedAddress(customer.address.trim());
    setIsTransferConfirmed(false);

    // Lưu thông tin khách hàng vào localStorage để lần sau không cần nhập lại
    try {
      localStorage.setItem('tra_customer_info', JSON.stringify({
        name: finalName,
        phone: cleanPhone,
        address: customer.address.trim(),
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

    // Tạo đơn hàng chuẩn POS quầy Barista
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

    // Chuyển sang Bước 3: Đặt thành công & Hướng dẫn thanh toán ngay lập tức
    setStep('success');

    // Đẩy đơn vào hệ thống quản lý đơn POS
    addOrder(newPosOrder);

    // XÓA SẠCH GIỎ HÀNG SAU KHI ĐẶT THÀNH CÔNG (Món đã gửi quầy thành công)
    onClearCart();
    playSuccessSound(true);
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
      {/* Nền làm mờ */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-[#FAF7F2] border-l border-[#EAE3D2] text-[#222B25] shadow-2xl flex flex-col">
          
          {/* Header Giỏ Hàng */}
          <div className="p-4 sm:p-5 border-b border-[#EAE3D2] flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#F5EFE9] text-[#322821] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display font-bold text-base sm:text-lg text-[#322821] leading-tight">
                  {step === 'cart' && `Giỏ Hàng (${cartItems.reduce((a, b) => a + b.quantity, 0)} món)`}
                  {step === 'checkout' && (servingType === 'dine-in' ? `Đặt Món (${tableNumber})` : 'Đặt Trà Giao Tận Nơi')}
                  {step === 'success' && 'Đặt Hàng Thành Công'}
                </h2>
                {servingType === 'dine-in' && step !== 'success' && (
                  <p className="text-[11px] text-[#7A6D63] font-medium flex items-center gap-1.5 mt-0.5">
                    <span>🪑 Phục vụ tại:</span>
                    <strong className="text-[#D95829] font-bold">{tableNumber}</strong>
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F5EFE6] hover:bg-[#EAE3D2] flex items-center justify-center text-[#55635B] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Thanh Tiến Trình Từng Bước (Step Indicator) */}
          <div className="bg-[#FAF7F2] border-b border-[#EAE3D2] px-4 py-2.5 flex items-center justify-between text-[11px] font-bold shrink-0">
            <button
              type="button"
              onClick={() => step !== 'success' && setStep('cart')}
              className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                step === 'cart' ? 'text-[#322821] font-extrabold' : 'text-[#8C7E74]'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === 'cart' ? 'bg-[#322821] text-white shadow-xs' : 'bg-white border border-[#DDD6C8] text-[#55635B]'
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
                step === 'checkout' ? 'bg-[#322821] text-white shadow-xs' : 'bg-white border border-[#DDD6C8] text-[#55635B]'
              }`}>
                2
              </span>
              <span>2. Thông Tin & Đặt Món</span>
            </div>
            <span className="text-[#C5BAAF]">➔</span>
            <div className={`flex items-center gap-1.5 ${
              step === 'success' ? 'text-emerald-700 font-extrabold' : 'text-[#8C7E74]'
            }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === 'success' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white border border-[#DDD6C8] text-[#55635B]'
              }`}>
                3
              </span>
              <span>3. Hoàn Tất</span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* BƯỚC 1: XEM LẠI GIỎ HÀNG */}
          {/* ======================================================== */}
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
                    className="mt-6 px-6 py-3 rounded-full bg-[#322821] text-white text-xs font-bold hover:bg-[#211A15] shadow-md shadow-[#322821]/20 transition-all cursor-pointer"
                  >
                    Xem Thực Đơn Ngay
                  </button>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
                  {cartItems.map((item) => (
                    <div
                      key={item.cartItemId}
                      className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E8E1D2] flex gap-3 relative shadow-2xs"
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
                              className="w-6 h-6 rounded bg-white hover:bg-[#EAE3D2] flex items-center justify-center text-[#222B25] cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold font-sans">{item.quantity}</span>
                            <button
                              onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
                              className="w-6 h-6 rounded bg-white hover:bg-[#EAE3D2] flex items-center justify-center text-[#222B25] cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Nút xóa */}
                      <button
                        onClick={() => onRemoveItem(item.cartItemId)}
                        className="absolute top-3 right-3 text-[#9AA59E] hover:text-red-600 p-1 transition-colors cursor-pointer"
                        title="Xoá món này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* Mã Giảm Giá */}
                  <div className="p-3.5 rounded-2xl bg-white border border-[#E8E1D2] space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Mã ưu đãi: FRESH20 hoặc FREESHIP"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value);
                          setPromoMessage(null);
                        }}
                        className="flex-1 bg-[#FAF7F2] border border-[#DDD6C8] rounded-xl px-3.5 py-2 text-xs uppercase text-[#222B25] placeholder-[#9AA59E] focus:outline-none focus:border-[#322821]"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        className="px-4 py-2 rounded-xl bg-[#322821] hover:bg-[#211A15] text-xs font-bold text-white shadow-sm transition-all cursor-pointer shrink-0"
                      >
                        Áp Dụng
                      </button>
                    </div>
                    {promoMessage && (
                      <p className={`text-[11px] font-semibold flex items-center gap-1 ${
                        promoApplied ? 'text-emerald-700' : 'text-amber-800'
                      }`}>
                        <Tag className="w-3.5 h-3.5" /> {promoMessage}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Tạm Tính & Nút Tiếp Tục */}
              {cartItems.length > 0 && (
                <div className="p-4 sm:p-5 border-t border-[#EAE3D2] bg-white space-y-3 shrink-0">
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
                    className="w-full py-3.5 px-6 rounded-full bg-[#322821] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#211A15] active:scale-95 transition-all shadow-md shadow-[#322821]/25 cursor-pointer"
                  >
                    <span>TIẾP TỤC ĐẶT HÀNG</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* ======================================================== */}
          {/* BƯỚC 2: THÔNG TIN NHẬN TRÀ & PHƯƠNG THỨC THANH TOÁN */}
          {/* ======================================================== */}
          {step === 'checkout' && (
            <form onSubmit={handlePlaceOrder} className="flex-1 flex flex-col overflow-hidden bg-white">
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
                
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
                        setFormErrors((prev) => ({ ...prev, address: undefined }));
                      }}
                      className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer ${
                        servingType === 'dine-in'
                          ? 'border-[#322821] bg-[#F5EFE9] text-[#322821] font-bold ring-2 ring-[#322821]/30 shadow-xs'
                          : 'border-[#EAE3D2] bg-[#FAF7F2] text-[#55635B] hover:bg-[#F3EDE2]'
                      }`}
                    >
                      <UtensilsCrossed className="w-5 h-5 text-[#322821]" />
                      <div className="text-xs font-bold">Ngồi Tại Bàn</div>
                      <div className="text-[10px] text-[#718076] font-normal">Miễn phí ship (0đ)</div>
                    </button>

                    {/* Nút 2: Giao Đi Tận Nơi */}
                    <button
                      type="button"
                      onClick={() => {
                        setServingType('delivery');
                        playClickSound(true);
                        setFormErrors((prev) => ({ ...prev, tableNumber: undefined }));
                      }}
                      className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer ${
                        servingType === 'delivery'
                          ? 'border-[#322821] bg-[#F5EFE9] text-[#322821] font-bold ring-2 ring-[#322821]/30 shadow-xs'
                          : 'border-[#EAE3D2] bg-[#FAF7F2] text-[#55635B] hover:bg-[#F3EDE2]'
                      }`}
                    >
                      <Bike className="w-5 h-5 text-[#D95829]" />
                      <div className="text-xs font-bold">Giao Đi Tận Nơi</div>
                      <div className="text-[10px] text-[#718076] font-normal">Freeship từ 99K</div>
                    </button>
                  </div>
                </div>

                {/* HÌNH THỨC 1: TẠI QUÁN (CHỌN BÀN) */}
                {servingType === 'dine-in' && (
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D2] space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-[#322821]">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#322821]" />
                        <span>Chọn số bàn tại quán</span>
                      </div>
                      <span className="text-[10px] font-semibold text-[#D95829]">
                        Đang chọn: {tableNumber}
                      </span>
                    </div>

                    {/* Lưới chọn bàn */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {allTables.map((b) => {
                        const status = getTableStatus(b);
                        const isOccupied = status !== 'available';
                        const isSelected = tableNumber === b;
                        return (
                          <button
                            key={b}
                            type="button"
                            onClick={() => {
                              setTableNumber(b);
                              playClickSound(true);
                              setFormErrors((prev) => ({ ...prev, tableNumber: undefined }));
                            }}
                            className={`py-2 px-1.5 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center cursor-pointer ${
                              isSelected
                                ? 'bg-[#322821] text-white border-[#322821] shadow-xs'
                                : isOccupied
                                ? 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                                : 'bg-white text-[#434F47] border-[#DDD6C8] hover:bg-[#F0EAE1]'
                            }`}
                            title={isOccupied ? `${b} đang có khách (bấm vào để gọi thêm món)` : `${b} đang trống`}
                          >
                            <span>{b}</span>
                            <span className={`text-[9px] font-normal ${
                              isSelected ? 'text-amber-200' : isOccupied ? 'text-amber-700 font-semibold' : 'text-emerald-700'
                            }`}>
                              {isOccupied ? 'Đang phục vụ' : 'Trống 🟢'}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Hoặc gõ số bàn tùy chỉnh */}
                    <div>
                      <input
                        type="text"
                        placeholder="Hoặc gõ số bàn khác (VD: Bàn 12, Tầng 2, Sân vườn...)"
                        value={tableNumber}
                        onChange={(e) => {
                          setTableNumber(e.target.value);
                          setFormErrors((prev) => ({ ...prev, tableNumber: undefined }));
                        }}
                        className={`w-full bg-white border rounded-xl px-3.5 py-2 text-[#222B25] focus:outline-none font-bold text-xs ${
                          formErrors.tableNumber ? 'border-red-500 ring-2 ring-red-200' : 'border-[#DDD6C8] focus:border-[#322821]'
                        }`}
                      />
                      {formErrors.tableNumber && (
                        <p className="text-[11px] text-red-600 mt-1 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {formErrors.tableNumber}
                        </p>
                      )}
                    </div>

                    <p className="text-[10px] text-[#7A6D63] italic">
                      💡 Barista sẽ pha chế và nhân viên mang ly trà phục vụ tận bàn cho quý khách!
                    </p>
                  </div>
                )}

                {/* HÌNH THỨC 2: GIAO ĐI TẬN NƠI (NHẬP ĐỊA CHỈ) */}
                {servingType === 'delivery' && (
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D2] space-y-2">
                    <label className="block text-[#4B574F] font-bold text-xs">
                      Địa chỉ nhận hàng <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Số nhà, tên đường, Phường, Xã, Huyện..."
                        value={customer.address}
                        onChange={(e) => {
                          setCustomer({ ...customer, address: e.target.value });
                          setFormErrors((prev) => ({ ...prev, address: undefined }));
                        }}
                        className={`w-full bg-white border rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#222B25] focus:outline-none ${
                          formErrors.address ? 'border-red-500 ring-2 ring-red-200' : 'border-[#DDD6C8] focus:border-[#322821]'
                        }`}
                      />
                      <MapPin className="w-4 h-4 text-[#8C7E74] absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                    {formErrors.address && (
                      <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {formErrors.address}
                      </p>
                    )}
                    <p className="text-[10px] text-[#7A6D63]">
                      🛵 Miễn phí giao hàng cho đơn từ 99.000đ. Đơn dưới 99k phí ship 20.000đ.
                    </p>
                  </div>
                )}

                {/* KHỐI THÔNG TIN KHÁCH HÀNG & TÍCH ĐIỂM VIP */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-[#FFFDF9] to-[#FAF5EB] border border-[#E8DFC8] space-y-3.5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-[#EAE3D2] pb-2">
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
                        placeholder="VD: Anh Phúc Hậu / Chị Thảo..."
                        value={customer.name}
                        onChange={(e) => {
                          setCustomer({ ...customer, name: e.target.value });
                          setFormErrors((prev) => ({ ...prev, name: undefined }));
                        }}
                        className={`w-full bg-white border rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#222B25] focus:outline-none font-semibold ${
                          formErrors.name ? 'border-red-500 ring-2 ring-red-200' : 'border-[#DDD6C8] focus:border-[#322821]'
                        }`}
                      />
                      <User className="w-4 h-4 text-[#8C7E74] absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                    {formErrors.name && (
                      <p className="text-[11px] text-red-600 mt-1 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {formErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Số điện thoại */}
                  <div>
                    <label className="block text-[#4B574F] font-bold mb-1 text-[11px]">
                      Số điện thoại nhận đơn & tích điểm <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        placeholder="VD: 0794 999 406"
                        value={customer.phone}
                        onChange={(e) => {
                          setCustomer({ ...customer, phone: e.target.value });
                          setFormErrors((prev) => ({ ...prev, phone: undefined }));
                        }}
                        className={`w-full bg-white border rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#222B25] focus:outline-none font-bold tracking-wider ${
                          formErrors.phone ? 'border-red-500 ring-2 ring-red-200' : 'border-[#DDD6C8] focus:border-[#322821]'
                        }`}
                      />
                      <Phone className="w-4 h-4 text-[#8C7E74] absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                    {formErrors.phone && (
                      <p className="text-[11px] text-red-600 mt-1 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {formErrors.phone}
                      </p>
                    )}

                    {/* Huy hiệu nhận diện thành viên theo SĐT thời gian thực */}
                    {cleanPhone.length >= 9 && (
                      <div className="mt-2 text-[11px] transition-all">
                        {matchedMember ? (
                          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                            <div className="flex items-center justify-between font-bold">
                              <span>⭐ Khách hàng: {matchedMember.name} ({matchedMember.tier})</span>
                              <span className="text-[#D95829] font-extrabold">{matchedMember.points} điểm</span>
                            </div>
                            {matchedMember.points >= 50 && (
                              <label className="flex items-center justify-between pt-1.5 border-t border-emerald-200/60 cursor-pointer">
                                <span className="text-emerald-800">Đổi 50 điểm giảm ngay 20.000đ:</span>
                                <input
                                  type="checkbox"
                                  checked={useLoyaltyPoints}
                                  onChange={(e) => setUseLoyaltyPoints(e.target.checked)}
                                  className="w-4 h-4 accent-[#322821] rounded cursor-pointer"
                                />
                              </label>
                            )}
                          </div>
                        ) : (
                          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Số mới: Tự động tạo tài khoản & tặng ngay <strong>+20 điểm</strong> chào mừng!</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Dự kiến điểm cộng từ đơn này */}
                    <div className="mt-2 flex items-center justify-between text-[11px] text-[#7A6E65] pt-1">
                      <span>Điểm tích lũy nhận được từ đơn này:</span>
                      <span className="font-extrabold text-[#D95829] text-xs">+{pointsToEarn} điểm</span>
                    </div>
                  </div>
                </div>

                {/* CHỌN PHƯƠNG THỨC THANH TOÁN */}
                <div>
                  <label className="block text-[#322821] font-bold text-xs uppercase tracking-wider mb-2">
                    Phương thức thanh toán:
                  </label>

                  <div className="space-y-2">
                    {/* Tùy chọn 1: VietQR Chuyển Khoản Ngân Hàng */}
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
                            <span className="font-bold text-xs text-[#322821]">Chuyển Khoản Quét Mã VietQR</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              Khuyên dùng
                            </span>
                          </div>
                          <p className="text-[11px] text-[#69786F] mt-0.5 leading-snug">
                            Mở app ngân hàng hoặc MoMo quét mã QR, tự động điền STK ACB và nội dung chuyển khoản.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Tùy chọn 2: Tiền mặt */}
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
                              ? 'Dùng trà xong quý khách chỉ cần ghé Quầy Thu Ngân báo số bàn để thanh toán.'
                              : 'Nhận ly trà mát lạnh tận tay rồi thanh toán tiền mặt trực tiếp cho shipper.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Giải thích rõ ràng khi Ngồi Tại Bàn + Thanh toán VietQR */}
                  {servingType === 'dine-in' && customer.paymentMethod === 'vietqr' && (
                    <div className="mt-2.5 p-3 rounded-xl bg-amber-50 border border-amber-300 text-[11px] text-amber-950 space-y-1 animate-fade-in">
                      <div className="font-bold flex items-center gap-1.5 text-amber-900">
                        <QrCode className="w-3.5 h-3.5 text-[#D95829]" />
                        <span>Quy trình chuyển khoản tại bàn ({tableNumber}):</span>
                      </div>
                      <p className="text-amber-900 leading-relaxed">
                        Sau khi bấm <strong>"Xác nhận đặt đơn"</strong>, màn hình sẽ hiển thị ngay <strong>Mã QR VietQR</strong> kèm STK ACB <strong>37051817</strong>. Bạn chỉ cần mở App ngân hàng quét mã ngay tại bàn, không cần ra quầy thu ngân. Barista nhận được thông báo đã thanh toán và mang trà ra tận bàn!
                      </p>
                    </div>
                  )}
                </div>

                {/* Ghi chú đơn hàng */}
                <div>
                  <label className="block text-[#4B574F] font-bold mb-1">Ghi chú cho quầy pha chế (Tùy chọn)</label>
                  <input
                    type="text"
                    placeholder="VD: Không lấy ống hút nhựa, mang ra ly có đá riêng..."
                    value={customer.note}
                    onChange={(e) => setCustomer({ ...customer, note: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#DDD6C8] rounded-xl px-3.5 py-2.5 text-xs text-[#222B25] focus:outline-none focus:border-[#322821]"
                  />
                </div>
              </div>

              {/* Chân trang thanh toán & Nút Đặt đơn */}
              <div className="p-4 sm:p-5 border-t border-[#EAE3D2] bg-[#FAF7F2] space-y-3 shrink-0">
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
                  {pointsDiscountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Ưu đãi đổi 50 điểm:</span>
                      <span>-{formatVND(pointsDiscountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold pt-1.5 border-t border-[#EAE3D2]">
                    <span>Tổng tiền thanh toán:</span>
                    <span className="text-[#D95829] font-sans text-lg">{formatVND(grandTotal)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep('cart')}
                    className="w-1/3 py-3 rounded-full border border-[#DDD6C8] text-[#47544C] font-bold text-xs hover:bg-white cursor-pointer transition-colors"
                  >
                    QUAY LẠI
                  </button>
                  <button
                    type="submit"
                    disabled={cartItems.length === 0}
                    className="flex-1 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-[#322821] hover:bg-[#211A15] text-white shadow-md shadow-[#322821]/25 active:scale-[0.98] cursor-pointer transition-all"
                  >
                    <span>XÁC NHẬN ĐẶT ĐƠN ({formatVND(grandTotal)})</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* BƯỚC 3: ĐẶT HÀNG THÀNH CÔNG & HƯỚNG DẪN THANH TOÁN */}
          {/* ======================================================== */}
          {step === 'success' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col justify-between bg-white text-left">
              <div className="space-y-4">
                
                {/* Banner Thông Báo Thành Công */}
                <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-50 to-amber-50/70 border border-emerald-200 text-center shadow-xs">
                  <div className="w-13 h-13 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-2 shadow-md shadow-emerald-600/25">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <span className="inline-block px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-black text-[11px] uppercase tracking-wider mb-1 border border-emerald-300">
                    {placedServingType === 'dine-in' ? '🎉 ĐẶT MÓN THÀNH CÔNG TẠI BÀN' : '🎉 ĐẶT HÀNG THÀNH CÔNG'}
                  </span>
                  <h3 className="font-display font-black text-xl text-[#322821]">
                    {placedServingType === 'dine-in' ? placedTableNumber : 'GIAO TẬN NƠI'}
                  </h3>
                  <p className="text-xs text-[#55635B] mt-1 max-w-xs mx-auto leading-relaxed">
                    {placedServingType === 'dine-in' ? (
                      <>
                        Xin chào <strong>{customer.name}</strong>! Đơn của bạn tại <strong>{placedTableNumber}</strong> đã được chuyển thẳng tới Quầy Barista để pha chế ngay. Mã đơn: <span className="font-mono text-[#D95829] font-bold">#{createdOrderCode}</span>.
                      </>
                    ) : (
                      <>
                        Xin chào <strong>{customer.name}</strong>! Đơn giao đến <strong>{placedAddress}</strong> đã được chuyển tới Barista. Mã đơn: <span className="font-mono text-[#D95829] font-bold">#{createdOrderCode}</span>.
                      </>
                    )}
                  </p>
                </div>

                {/* TIẾN ĐỘ THỜI GIAN THỰC */}
                <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D2] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#322821]">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#D95829]" />
                      <span>Tiến độ phục vụ {placedServingType === 'dine-in' ? `tại ${placedTableNumber}` : 'đơn hàng'}:</span>
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
                      <div className="text-xs mb-0.5">{placedServingType === 'dine-in' ? '🪑' : '🛵'}</div>
                      <div>{placedServingType === 'dine-in' ? `Phục vụ ${placedTableNumber}` : 'Giao tận nơi'}</div>
                    </div>
                  </div>
                </div>

                {/* THẺ TÍCH ĐIỂM THÀNH VIÊN */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#322821] to-[#1E1712] text-white shadow-md space-y-2">
                  <div className="flex items-center justify-between text-xs text-amber-200">
                    <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-[#F4A261]" />
                      <span>ĐÃ TÍCH ĐIỂM THÀNH VIÊN VIP</span>
                    </span>
                    <span className="font-extrabold text-[#F4A261] text-sm">+{lastEarnedPoints} ĐIỂM</span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <div>
                      <div className="font-bold text-white">{customer.name}</div>
                      <div className="text-stone-300 font-mono text-[11px]">{customer.phone}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-stone-400">Tổng điểm hiện có:</div>
                      <div className="font-black text-[#F4A261] text-base font-sans">{currentMemberPoints} điểm</div>
                    </div>
                  </div>
                </div>

                {/* CHI TIẾT THANH TOÁN: VIETQR HOẶC TIỀN MẶT */}
                {placedPaymentMethod === 'vietqr' ? (
                  <div className="p-4 rounded-3xl bg-white border-2 border-amber-500/50 text-[#222B25] shadow-md text-center space-y-3.5">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-950 text-xs font-bold uppercase tracking-wider">
                      <QrCode className="w-4 h-4 text-[#D95829]" />
                      <span>{placedServingType === 'dine-in' ? `Quét Mã Chuyển Khoản Tại ${placedTableNumber}` : 'Quét Mã VietQR Chuyển Khoản'}</span>
                    </div>

                    {/* Hướng dẫn 3 bước rõ ràng khi ngồi tại bàn */}
                    {placedServingType === 'dine-in' && (
                      <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-left text-[11px] text-amber-950 space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-amber-900">
                          <span>🪑 Hướng dẫn thanh toán tại bàn:</span>
                        </div>
                        <ul className="list-disc pl-4 space-y-0.5 text-amber-900/90 text-[10.5px]">
                          <li>Mở App Ngân hàng hoặc MoMo quét mã QR bên dưới.</li>
                          <li>Nội dung chuyển khoản <strong>{createdOrderCode}</strong> và số tiền đã được tự động điền sẵn.</li>
                          <li>Chuyển xong bấm <strong>"Tôi Đã Chuyển Khoản Xong"</strong>, trà sẽ được mang ra tận bàn!</li>
                        </ul>
                      </div>
                    )}

                    {/* Khung mã QR VietQR chuẩn ngân hàng ACB */}
                    <div className="relative w-52 h-52 mx-auto p-2.5 bg-white rounded-2xl border-2 border-dashed border-amber-400 shadow-sm flex items-center justify-center">
                      <img
                        src={`https://img.vietqr.io/image/ACB-37051817-compact2.png?amount=${placedGrandTotal || grandTotal}&addInfo=${encodeURIComponent(createdOrderCode)}&accountName=NGO%20THANH%20PHUC%20HAU`}
                        alt="VietQR code ACB"
                        className="w-full h-full object-contain rounded-xl"
                        onError={(e) => {
                          e.currentTarget.src = '/acb-vietqr.png';
                        }}
                      />
                    </div>
                    <p className="text-[11px] text-stone-600 italic">
                      Mở app Ngân hàng / MoMo quét mã để tự động điền STK ACB & Nội dung đơn
                    </p>

                    {/* BẢNG CHI TIẾT THÔNG TIN CHUYỂN KHOẢN VÀ NÚT SAO CHÉP */}
                    <div className="bg-[#FAF7F2] border border-[#EAE3D2] rounded-2xl p-3 text-left space-y-2 text-xs">
                      {/* Ngân hàng */}
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500">Ngân hàng:</span>
                        <span className="font-bold text-[#322821]">ACB (Ngân Hàng Á Châu)</span>
                      </div>

                      {/* Số tài khoản */}
                      <div className="flex items-center justify-between border-t border-[#EAE3D2]/70 pt-2">
                        <span className="text-stone-500">Số tài khoản:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-sm text-[#D95829]">37051817</span>
                          <button
                            type="button"
                            onClick={() => handleCopyText('37051817', 'stk')}
                            className="px-2 py-0.5 rounded-md bg-white border border-[#DDD6C8] hover:bg-stone-100 text-[10px] font-semibold text-stone-700 flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedField === 'stk' ? 'Đã chép!' : 'Sao chép'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Chủ tài khoản */}
                      <div className="flex items-center justify-between border-t border-[#EAE3D2]/70 pt-2">
                        <span className="text-stone-500">Chủ tài khoản:</span>
                        <span className="font-bold text-[#322821] uppercase">NGÔ THÀNH PHÚC HẬU</span>
                      </div>

                      {/* Số tiền */}
                      <div className="flex items-center justify-between border-t border-[#EAE3D2]/70 pt-2">
                        <span className="text-stone-500">Số tiền:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-sans font-black text-sm text-[#D95829]">{formatVND(placedGrandTotal || grandTotal)}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(String(placedGrandTotal || grandTotal), 'amount')}
                            className="px-2 py-0.5 rounded-md bg-white border border-[#DDD6C8] hover:bg-stone-100 text-[10px] font-semibold text-stone-700 flex items-center gap-1 transition-colors cursor-pointer"
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
                          className="px-2.5 py-1 rounded-lg bg-[#322821] hover:bg-black text-[11px] font-bold text-white flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
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
                        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Tôi Đã Chuyển Khoản Xong</span>
                      </button>
                    ) : (
                      <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-950 border-2 border-emerald-400 text-xs font-bold flex flex-col items-center justify-center gap-1.5 shadow-xs animate-fade-in">
                        <div className="flex items-center gap-1.5 text-emerald-800 text-sm">
                          <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                          <span>Đã xác nhận chuyển khoản thành công!</span>
                        </div>
                        <p className="text-[11px] font-medium text-emerald-900 text-center leading-relaxed">
                          {placedServingType === 'dine-in' 
                            ? `Quý khách cứ yên tâm ngồi tại ${placedTableNumber}, Barista đã nhận được đơn thanh toán và nhân viên sẽ mang trà phục vụ tận bàn ngay!`
                            : 'Quầy Barista đã nhận được thanh toán và đang chuẩn bị ly trà để giao nhanh đến quý khách!'}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-1.5">
                    <div className="font-bold flex items-center gap-1.5 text-amber-900">
                      <Banknote className="w-4 h-4 text-amber-700" />
                      <span>Thanh Toán Sau Tại Quầy Thu Ngân</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      {placedServingType === 'dine-in'
                        ? `Quý khách dùng trà xong chỉ cần ghé Quầy Thu Ngân báo ${placedTableNumber} để thanh toán tiền mặt hoặc quẹt thẻ.`
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
                      <span>Món đã gửi quầy ({placedItems.length} món):</span>
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
              <div className="space-y-2 mt-4 pt-3 border-t border-[#EAE3D2] shrink-0">
                {onOpenTracker && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenTracker();
                    }}
                    className="w-full py-3 px-4 rounded-2xl bg-[#322821] hover:bg-[#211A15] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-[#F4A261]" />
                    <span>THEO DÕI TIẾN ĐỘ PHA CHẾ TẠI QUẦY →</span>
                  </button>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleOrderMore}
                    className="flex-1 py-2.5 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#DDD6C8] text-[#322821] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#D95829]" />
                    <span>{placedServingType === 'dine-in' ? `Gọi thêm món cho ${placedTableNumber}` : 'Đặt thêm món khác'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleFinish}
                    className="py-2.5 px-4 rounded-xl border border-[#DDD6C8] text-[#69786F] hover:text-[#322821] font-bold text-xs transition-colors cursor-pointer"
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
