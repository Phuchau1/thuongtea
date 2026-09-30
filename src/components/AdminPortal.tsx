import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, ChefHat, Printer, Search, 
  BarChart3, LayoutGrid, PackageCheck, 
  LogOut, ExternalLink, Check, Plus, Minus, Trash2, 
  CreditCard, Banknote, QrCode, Edit3, Eye, EyeOff,
  UserCheck, Users, ShieldAlert, ShieldCheck,
  TrendingUp, RefreshCw, X, RotateCcw,
  UserPlus, CheckCircle2, FileText,
  Volume2, VolumeX, Bell,
  ArrowRight, Coffee, Columns3, CheckCheck
} from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import type { PosOrder } from '../types/pos';
import type { CartItem, FruitTeaItem } from '../types/tea';
import type { StaffMember, StaffRole } from '../types/staff';
import type { MemberUser } from '../types/user';
import { STAFF_PERMISSIONS } from '../types/staff';
import { ReceiptPrintModal } from './ReceiptPrintModal';
import { TableQrModal } from './TableQrModal';
import { ProductFormModal } from './ProductFormModal';
import { StaffFormModal } from './StaffFormModal';
import { ToppingFormModal } from './ToppingFormModal';
import { TableFormModal } from './TableFormModal';
import type { DiningTable, Topping } from '../types/tea';
import { playClickSound, playSuccessSound, playNewOrderAlertSound, playPosCashierBell, stopPosRingtone } from '../utils/audio';

interface AdminPortalProps {
  onBackToStore: () => void;
  onLogout: () => void;
  onSimulateScanTable?: (tableId: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ 
  onBackToStore, 
  onLogout,
  onSimulateScanTable = () => {}
}) => {
  const { 
    orders, 
    addOrder,
    updateOrderStatus, 
    stockStatus, 
    toggleStock, 
    markPosOrdersAsRead,
    members,
    deductPointsFromMember,
    loginMember,
    addPointsToMember,
    // Sản phẩm CRUD
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    resetProductsToDefault,
    // Topping & Phụ Liệu CRUD
    toppings,
    addTopping,
    updateTopping,
    deleteTopping,
    toggleToppingAvailability,
    resetToppingsToDefault,
    // Quản lý Bàn CRUD
    tables,
    allTablesList,
    addTable,
    updateTable,
    deleteTable,
    resetTablesToDefault,
    // Nhân viên & Phân quyền
    staffMembers,
    currentStaff,
    loginStaff,
    addStaffMember,
    updateStaffMember,
    deleteStaffMember,
    // Chấm công
    attendanceRecords,
    clockIn,
    clockOut,
    // Quản lý Bàn
    getTableStatus,
    getTableOrder,
    clearTable,
    updateOrder,
    markOrderAsChecked,
    clearDuplicateOrders
  } = useOrders();

  // Xác định vai trò nhân viên hiện tại
  const userRole: StaffRole = currentStaff?.role || 'admin';

  // Điều hướng Tab chính
  const [activeTab, setActiveTab] = useState<'cashier' | 'tables' | 'kds' | 'menu' | 'revenue' | 'staff' | 'attendance'>(() => {
    if (userRole === 'barista') return 'kds';
    return 'cashier';
  });

  const [filterType, setFilterType] = useState<'all' | 'delivery' | 'dine-in'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [printingOrder, setPrintingOrder] = useState<PosOrder | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Modals thêm/sửa sản phẩm & nhân viên
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<FruitTeaItem | null>(null);

  const [isStaffModalOpen, setIsStaffModalOpen] = useState<boolean>(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  // Modals thêm/sửa topping & quản lý bàn
  const [isToppingModalOpen, setIsToppingModalOpen] = useState<boolean>(false);
  const [editingTopping, setEditingTopping] = useState<Topping | null>(null);

  const [isTableModalOpen, setIsTableModalOpen] = useState<boolean>(false);
  const [editingTable, setEditingTable] = useState<DiningTable | null>(null);

  // Switcher đổi nhân viên nhanh
  const [isStaffSwitcherOpen, setIsStaffSwitcherOpen] = useState<boolean>(false);
  const [showStaffPins, setShowStaffPins] = useState<{ [staffId: string]: boolean }>({});

  // ==========================================
  // STATE CHO MÀN HÌNH BÁN HÀNG THU NGÂN (POS CASHIER)
  // ==========================================
  const [posCategory, setPosCategory] = useState<string>('all');
  const [posSearch, setPosSearch] = useState<string>('');
  const [posCart, setPosCart] = useState<CartItem[]>([]);
  const [posServingType, setPosServingType] = useState<'dine-in' | 'takeaway'>('dine-in');
  const [posTableNumber, setPosTableNumber] = useState<string>('Bàn 01');
  const [posCustomerSearch, setPosCustomerSearch] = useState<string>('');
  const [selectedMember, setSelectedMember] = useState<MemberUser | null>(null);
  const [posPhone, setPosPhone] = useState<string>('');
  const [posCustomerName, setPosCustomerName] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [posNote, setPosNote] = useState<string>('');
  const [posUsePointsDiscount, setPosUsePointsDiscount] = useState<boolean>(false);
  const [loadedTableOrderId, setLoadedTableOrderId] = useState<string | null>(null);
  
  // Phương thức thanh toán quầy: Tiền mặt, VietQR, Thẻ, Ghi nợ
  const [posPaymentMethod, setPosPaymentMethod] = useState<'cash' | 'vietqr' | 'card' | 'debt'>('cash');
  const [posDebtNote, setPosDebtNote] = useState<string>('');
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState<boolean>(false);

  // Modal Thu Tiền Mặt Tại Quầy
  const [showCashModal, setShowCashModal] = useState<boolean>(false);
  const [cashTendered, setCashTendered] = useState<number>(0);
  
  // Modal Quét VietQR Tại Quầy
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

  // Lọc doanh thu thời gian
  const [revenueTimeFilter, setRevenueTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Chấm công nhanh ở tab attendance
  const [clockInPin, setClockInPin] = useState<string>(currentStaff?.code || '');
  const [attendanceMessage, setAttendanceMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Thống kê bàn
  const occupiedUnpaidCount = allTablesList.filter(t => getTableStatus(t) === 'occupied_unpaid').length;
  const occupiedPaidCount = allTablesList.filter(t => getTableStatus(t) === 'occupied_paid').length;
  const totalOccupiedCount = occupiedUnpaidCount + occupiedPaidCount;

  // Cài đặt âm thanh chuông báo POS
  const [posSoundEnabled, setPosSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('tra_pos_sound');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [newOrderToast, setNewOrderToast] = useState<PosOrder | null>(null);
  const [checkOrderModal, setCheckOrderModal] = useState<PosOrder | null>(null);
  const [showCheckOrderDrawer, setShowCheckOrderDrawer] = useState<boolean>(false);
  const [checkDrawerTab, setCheckDrawerTab] = useState<'all' | 'pending' | 'preparing' | 'ready' | 'completed'>('all');
  const [checkDrawerViewMode, setCheckDrawerViewMode] = useState<'grid' | 'kanban'>('grid');
  const [checkDrawerSearch, setCheckDrawerSearch] = useState<string>('');
  const [checkDrawerTypeFilter, setCheckDrawerTypeFilter] = useState<'all' | 'dine-in' | 'delivery'>('all');
  const [checkDrawerPaymentFilter, setCheckDrawerPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const prevOrdersCountRef = React.useRef<number>(orders.length);
  const lastAlertedOrderIdRef = React.useRef<string | null>(null);

  // Phân loại danh sách đơn hàng theo 4 bước quy trình vận hành quán
  const uncheckedOrders = useMemo(() => orders.filter(o => !o.checked && o.status === 'pending'), [orders]);
  const preparingOrders = useMemo(() => orders.filter(o => o.status === 'preparing'), [orders]);
  const readyOrders = useMemo(() => orders.filter(o => o.status === 'ready'), [orders]);
  const completedOrders = useMemo(() => orders.filter(o => o.status === 'completed'), [orders]);

  // Thông tin đơn hàng đang nạp tại quầy POS
  const loadedOrder = useMemo(() => {
    if (!loadedTableOrderId) return null;
    return orders.find((o) => o.id === loadedTableOrderId) || null;
  }, [loadedTableOrderId, orders]);

  // Kiểm tra đơn nạp vào quầy POS đã thanh toán hay chưa (VietQR hoặc đã trả trước)
  const isLoadedOrderPaid = useMemo(() => {
    if (!loadedOrder) return false;
    return loadedOrder.paymentStatus === 'paid' || loadedOrder.customer.paymentMethod === 'vietqr';
  }, [loadedOrder]);

  // Lắng nghe đơn hàng mới để phát chuông 5s & tự động mở popup Nhận Đơn (chỉ phát 1 lần duy nhất cho đơn CHƯA check)
  useEffect(() => {
    // Chỉ kích hoạt cho đơn mới nhất chưa check và ở trạng thái pending
    const newestUnchecked = orders.find(o => !o.checked && o.status === 'pending');
    if (newestUnchecked && newestUnchecked.id !== lastAlertedOrderIdRef.current) {
      lastAlertedOrderIdRef.current = newestUnchecked.id;
      setNewOrderToast(newestUnchecked);
      setCheckOrderModal(newestUnchecked);
      playNewOrderAlertSound(
        {
          tableNumber: newestUnchecked.tableNumber,
          orderType: newestUnchecked.orderType,
          orderNumber: newestUnchecked.orderNumber,
          total: newestUnchecked.total,
          paymentStatus: newestUnchecked.paymentStatus,
          paymentMethod: newestUnchecked.customer.paymentMethod,
        },
        posSoundEnabled
      );
    }
    prevOrdersCountRef.current = orders.length;
  }, [orders, posSoundEnabled]);

  const handleToggleSound = () => {
    const next = !posSoundEnabled;
    setPosSoundEnabled(next);
    try {
      localStorage.setItem('tra_pos_sound', String(next));
    } catch {}
    if (next) {
      playPosCashierBell(true);
    }
  };

  const handleTestSound = () => {
    playNewOrderAlertSound(
      { 
        tableNumber: 'Bàn 09', 
        total: 104000, 
        orderType: 'dine-in', 
        orderNumber: 105,
        paymentStatus: 'paid',
        paymentMethod: 'vietqr'
      }, 
      true
    );
  };

  useEffect(() => {
    markPosOrdersAsRead();
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(interval);
  }, [markPosOrdersAsRead]);

  // Kiểm tra quyền truy cập tab
  const isTabAllowed = (tab: typeof activeTab) => {
    if (userRole === 'admin') return true;
    if (userRole === 'cashier') return ['cashier', 'tables', 'attendance'].includes(tab);
    if (userRole === 'barista') return ['kds', 'attendance'].includes(tab);
    return false;
  };

  // Tra cứu thành viên linh hoạt theo CẢ TÊN (Hậu, Lan, Quân...) HOẶC SỐ ĐIỆN THOẠI (0838...)
  const matchingMembers = useMemo(() => {
    const q = posCustomerSearch.trim().toLowerCase();
    if (!q) return [];
    const cleanDigits = q.replace(/\D/g, '');
    return members.filter((m) => {
      const matchName = m.name.toLowerCase().includes(q);
      const matchPhone = cleanDigits.length >= 2 && m.phone.replace(/\D/g, '').includes(cleanDigits);
      return matchName || matchPhone;
    });
  }, [members, posCustomerSearch]);

  const foundMember: MemberUser | null = useMemo(() => {
    if (selectedMember) return selectedMember;
    const q = posCustomerSearch.trim().toLowerCase();
    const cleanDigits = q.replace(/\D/g, '');
    const phoneQ = posPhone.trim().replace(/\D/g, '');

    if (phoneQ.length >= 9) {
      const byPhone = members.find(m => m.phone.replace(/\D/g, '') === phoneQ);
      if (byPhone) return byPhone;
    }

    if (q) {
      const exactName = members.find(m => m.name.toLowerCase() === q);
      if (exactName) return exactName;
      if (cleanDigits.length >= 9) {
        const exactPhone = members.find(m => m.phone.replace(/\D/g, '') === cleanDigits);
        if (exactPhone) return exactPhone;
      }
      if (matchingMembers.length === 1 && (matchingMembers[0].name.toLowerCase() === q || matchingMembers[0].phone.replace(/\D/g, '') === cleanDigits)) {
        return matchingMembers[0];
      }
    }
    return null;
  }, [selectedMember, posCustomerSearch, posPhone, members, matchingMembers]);

  const handleSelectMember = (m: MemberUser) => {
    playClickSound(true);
    setSelectedMember(m);
    setPosCustomerSearch(m.name);
    setPosPhone(m.phone);
    setPosCustomerName(m.name);
    setIsSearchFocused(false);
  };

  const handleClearMember = () => {
    setSelectedMember(null);
    setPosCustomerSearch('');
    setPosPhone('');
    setPosCustomerName('');
    setPosUsePointsDiscount(false);
  };

  // Tính toán giỏ hàng POS
  const posSubtotal = posCart.reduce((sum, item) => sum + item.totalPrice, 0);
  const posPointsDiscount = (posUsePointsDiscount && foundMember && foundMember.points >= 50) ? 20000 : 0;
  const posGrandTotal = Math.max(0, posSubtotal - posPointsDiscount);

  // Thêm món vào đơn POS
  const handleAddToCartPos = (tea: FruitTeaItem) => {
    playClickSound(true);
    setPosCart((prev) => {
      const existingIdx = prev.findIndex(it => it.tea.id === tea.id && it.size === 'M');
      if (existingIdx >= 0) {
        const updated = [...prev];
        const qty = updated[existingIdx].quantity + 1;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: qty,
          totalPrice: qty * updated[existingIdx].unitPrice
        };
        return updated;
      }

      const newItem: CartItem = {
        cartItemId: 'pos-' + Date.now() + Math.random(),
        tea,
        size: 'M',
        sugar: 70,
        ice: 70,
        toppings: [],
        quantity: 1,
        unitPrice: tea.price,
        totalPrice: tea.price,
      };
      return [...prev, newItem];
    });
  };

  const handleUpdatePosQuantity = (cartItemId: string, delta: number) => {
    setPosCart((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              totalPrice: newQty * item.unitPrice,
            };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const handleTogglePosSize = (cartItemId: string) => {
    playClickSound(true);
    setPosCart((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          const newSize = item.size === 'M' ? 'L' : 'M';
          const sizeExtra = newSize === 'L' ? 6000 : 0;
          const toppingTotal = item.toppings.reduce((sum, t) => sum + t.price, 0);
          const newUnitPrice = item.tea.price + sizeExtra + toppingTotal;
          return {
            ...item,
            size: newSize,
            unitPrice: newUnitPrice,
            totalPrice: newUnitPrice * item.quantity,
          };
        }
        return item;
      })
    );
  };

  // Xóa một món khỏi hóa đơn POS
  const handleRemovePosItem = (cartItemId: string) => {
    playClickSound(true);
    setPosCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  // Thao tác bàn phím số cảm ứng POS
  const handleNumpadInput = (char: string) => {
    playClickSound(true);
    if (char === 'C') {
      setCashTendered(0);
      return;
    }
    if (char === 'DEL') {
      const s = String(cashTendered);
      if (s.length <= 1) {
        setCashTendered(0);
      } else {
        setCashTendered(parseInt(s.slice(0, -1), 10) || 0);
      }
      return;
    }
    if (char === '000') {
      if (cashTendered === 0) return;
      const next = cashTendered * 1000;
      if (next <= 100000000) setCashTendered(next);
      return;
    }
    if (char === '00') {
      if (cashTendered === 0) return;
      const next = cashTendered * 100;
      if (next <= 100000000) setCashTendered(next);
      return;
    }
    const currentStr = cashTendered === 0 ? '' : String(cashTendered);
    const nextVal = parseInt(currentStr + char, 10);
    if (!isNaN(nextVal) && nextVal <= 100000000) {
      setCashTendered(nextVal);
    }
  };

  // Thêm nhanh mệnh giá tiền mặt
  const handleAddDenomination = (amt: number) => {
    playClickSound(true);
    setCashTendered((prev) => prev + amt);
  };

  // Nạp đơn của bàn đang ngồi chưa thanh toán vào quầy POS để thu tiền
  const handleLoadTableOrderToPos = (order: PosOrder) => {
    stopPosRingtone();
    playClickSound(true);
    setLoadedTableOrderId(order.id);
    setPosCart(order.items);
    setPosServingType(order.orderType === 'delivery' ? 'takeaway' : 'dine-in');
    setPosTableNumber(order.tableNumber || 'Bàn 01');
    const orderPhone = (order.customer.phone || '').trim();
    const orderName = (order.customer.name || '').trim();
    setPosPhone(orderPhone);
    setPosCustomerName(orderName);
    setPosNote(order.customer.note || '');

    // Đồng bộ phương thức thanh toán
    if (order.paymentStatus === 'paid' || order.customer.paymentMethod === 'vietqr') {
      setPosPaymentMethod('vietqr');
    } else {
      setPosPaymentMethod('cash');
      if (order.total > 0) {
        setCashTendered(order.total);
      }
    }

    // Tự động tìm & gắn thành viên nếu đơn bàn có tên hoặc SĐT
    const cleanOPhone = orderPhone.replace(/\D/g, '');
    const matched = members.find(m => {
      const matchPhone = cleanOPhone.length >= 9 && m.phone.replace(/\D/g, '') === cleanOPhone;
      const matchName = orderName && m.name.toLowerCase() === orderName.toLowerCase();
      return matchPhone || matchName;
    });

    if (matched) {
      setSelectedMember(matched);
      setPosCustomerSearch(matched.name);
    } else {
      setSelectedMember(null);
      setPosCustomerSearch(orderName || orderPhone);
    }

    setActiveTab('cashier');
  };

  // Xử lý hoàn tất thanh toán quầy (Tiền mặt, VietQR, Thẻ, Ghi nợ)
  const handleCompletePosPayment = (method: 'cash' | 'vietqr' | 'card' | 'debt') => {
    if (posCart.length === 0) return;

    if (method === 'cash') {
      if (cashTendered < posGrandTotal) {
        alert(`Số tiền khách đưa (${new Intl.NumberFormat('vi-VN').format(cashTendered)}đ) chưa đủ tổng tiền đơn (${new Intl.NumberFormat('vi-VN').format(posGrandTotal)}đ)!`);
        return;
      }
    }

    const activeMemberToSync = foundMember || selectedMember;
    const finalPhone = activeMemberToSync?.phone || posPhone.trim();
    const finalName = activeMemberToSync?.name || posCustomerName.trim();

    if (method === 'debt' && !finalPhone && !finalName) {
      alert('Vui lòng nhập số điện thoại hoặc họ tên khách hàng để ghi sổ nợ!');
      return;
    }

    // Tích điểm & đồng bộ khách hàng thành viên vĩnh viễn
    if (finalPhone && finalPhone.replace(/\D/g, '').length >= 9) {
      loginMember(finalPhone, finalName || undefined);
      const earnedPoints = Math.floor(posGrandTotal / 10000);
      if (earnedPoints > 0) {
        addPointsToMember(finalPhone, earnedPoints, posGrandTotal);
      }
    }

    if (posUsePointsDiscount && activeMemberToSync && activeMemberToSync.points >= 50) {
      deductPointsFromMember(activeMemberToSync.phone, 50);
    }

    const paymentMethodMap: Record<string, 'cod' | 'vietqr' | 'momo'> = {
      cash: 'cod',
      vietqr: 'vietqr',
      card: 'momo',
      debt: 'cod'
    };

    const methodNoteMap: Record<string, string> = {
      cash: `Tiền mặt khách đưa ${new Intl.NumberFormat('vi-VN').format(cashTendered || posGrandTotal)}đ (tiền thừa ${new Intl.NumberFormat('vi-VN').format(Math.max(0, (cashTendered || posGrandTotal) - posGrandTotal))}đ)`,
      vietqr: 'Đã nhận chuyển khoản VietQR',
      card: 'Đã quẹt thẻ thanh toán POS',
      debt: `GHI NỢ: ${posDebtNote || 'Khách quen ghi sổ nợ'}`
    };

    const staffNoteText = `Thu ngân: ${currentStaff?.name || 'Quầy'} - ${methodNoteMap[method]}`;

    if (loadedTableOrderId) {
      const existing = orders.find((o) => o.id === loadedTableOrderId);
      if (existing) {
        const isPaid = method !== 'debt';
        updateOrder(loadedTableOrderId, {
          items: posCart,
          subtotal: posSubtotal,
          discount: posPointsDiscount,
          total: posGrandTotal,
          paymentStatus: isPaid ? 'paid' : 'unpaid',
          staffNote: staffNoteText,
        });

        // Cập nhật tất cả các đợt gọi thêm khác của bàn này sang đã thanh toán
        orders.filter(o => o.tableNumber === posTableNumber && o.id !== loadedTableOrderId && !o.tableCleared).forEach(o => {
          updateOrder(o.id, { paymentStatus: isPaid ? 'paid' : 'unpaid' });
        });

        const updatedOrd: PosOrder = {
          ...existing,
          items: posCart,
          subtotal: posSubtotal,
          discount: posPointsDiscount,
          total: posGrandTotal,
          paymentStatus: isPaid ? 'paid' : 'unpaid',
          staffNote: staffNoteText,
        };
        setPrintingOrder(updatedOrd);
        playSuccessSound(true);
        setShowCashModal(false);
        setShowQrModal(false);
        setLoadedTableOrderId(null);
        setPosCart([]);
        setPosCustomerSearch('');
        setSelectedMember(null);
        setPosPhone('');
        setPosCustomerName('');
        setPosNote('');
        setPosDebtNote('');
        setPosUsePointsDiscount(false);
        setCashTendered(0);
        return;
      }
    }

    const orderIdPrefix = method === 'vietqr' ? 'QR-' : method === 'card' ? 'CARD-' : method === 'debt' ? 'NO-' : 'POS-';
    const newOrder: PosOrder = {
      id: orderIdPrefix + Date.now().toString().slice(-6),
      orderNumber: orders.length + 101,
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      customer: {
        name: finalName || (posServingType === 'dine-in' ? `Khách ${posTableNumber}` : 'Khách mua tại quầy'),
        phone: finalPhone,
        address: posServingType === 'dine-in' ? `${posTableNumber} (Tại quán)` : 'Mang về tại quầy',
        servingType: posServingType,
        tableNumber: posServingType === 'dine-in' ? posTableNumber : undefined,
        paymentMethod: paymentMethodMap[method],
        deliveryTime: 'now',
        note: posNote.trim(),
      },
      orderType: posServingType,
      tableNumber: posServingType === 'dine-in' ? posTableNumber : undefined,
      items: posCart,
      subtotal: posSubtotal,
      shippingFee: 0,
      discount: posPointsDiscount,
      total: posGrandTotal,
      status: 'preparing',
      paymentStatus: method === 'debt' ? 'unpaid' : 'paid',
      staffNote: staffNoteText,
    };

    addOrder(newOrder);
    playSuccessSound(true);
    setShowCashModal(false);
    setShowQrModal(false);
    setPrintingOrder(newOrder);
    // Reset đơn quầy
    setPosCart([]);
    setPosCustomerSearch('');
    setSelectedMember(null);
    setPosPhone('');
    setPosCustomerName('');
    setPosNote('');
    setPosDebtNote('');
    setPosUsePointsDiscount(false);
    setCashTendered(0);
    setLoadedTableOrderId(null);
  };

  // Wrapper gọi tiền mặt & VietQR từ modal (tương thích)
  const handleCompleteCashPayment = () => handleCompletePosPayment('cash');
  const handleCompleteVietQrPayment = () => handleCompletePosPayment('vietqr');

  // Lưu đơn tại bàn thanh toán sau
  const handleSaveUnpaidOrderPos = () => {
    if (posCart.length === 0) return;

    if (loadedTableOrderId) {
      updateOrder(loadedTableOrderId, {
        items: posCart,
        subtotal: posSubtotal,
        total: posSubtotal,
        staffNote: `Đơn bàn ${posTableNumber} đã cập nhật tại quầy`,
      });
      playSuccessSound(true);
      alert(`Đã cập nhật đơn cho ${posTableNumber}! Món đã được chuyển xuống bếp pha chế.`);
      setLoadedTableOrderId(null);
      setPosCart([]);
      setPosCustomerSearch('');
      setSelectedMember(null);
      setPosPhone('');
      setPosCustomerName('');
      return;
    }

    const finalPhone = selectedMember?.phone || posPhone.trim();
    const finalName = selectedMember?.name || posCustomerName.trim() || `Khách ${posTableNumber}`;

    const newOrder: PosOrder = {
      id: 'TAB-' + Date.now().toString().slice(-6),
      orderNumber: orders.length + 101,
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      customer: {
        name: finalName,
        phone: finalPhone,
        address: `${posTableNumber} (Tại quán)`,
        servingType: 'dine-in',
        tableNumber: posTableNumber,
        paymentMethod: 'cod',
        deliveryTime: 'now',
        note: posNote.trim(),
      },
      orderType: 'dine-in',
      tableNumber: posTableNumber,
      items: posCart,
      subtotal: posSubtotal,
      shippingFee: 0,
      discount: 0,
      total: posSubtotal,
      status: 'pending',
      paymentStatus: 'unpaid',
      staffNote: `Đơn gọi tại bàn - Thanh toán sau khi về`,
    };

    addOrder(newOrder);
    playSuccessSound(true);
    alert(`Đã lưu đơn cho ${posTableNumber}! Món đã được chuyển xuống bếp pha chế.`);
    setPosCart([]);
    setPosCustomerSearch('');
    setSelectedMember(null);
    setPosPhone('');
    setPosCustomerName('');
  };

  // Lọc đơn hàng KDS
  const filteredOrders = orders.filter((o) => {
    const matchesType =
      filterType === 'all' ||
      (filterType === 'delivery' && o.orderType === 'delivery') ||
      (filterType === 'dine-in' && (o.orderType === 'dine-in' || o.orderType === 'takeaway'));

    const matchesSearch =
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.tableNumber && o.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesType && matchesSearch;
  });

  // ==========================================
  // DỮ LIỆU BÁO CÁO DOANH THU & TÀI CHÍNH
  // ==========================================
  const revenueStats = useMemo(() => {
    const paidOrders = orders.filter((o) => o.paymentStatus === 'paid');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrdersCount = paidOrders.length;
    const aov = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;
    
    // Chưa thanh toán
    const unpaidOrders = orders.filter((o) => o.paymentStatus === 'unpaid');
    const unpaidRevenue = unpaidOrders.reduce((sum, o) => sum + o.total, 0);

    // Tiền mặt vs VietQR
    const cashTotal = paidOrders
      .filter((o) => o.customer.paymentMethod === 'cod')
      .reduce((sum, o) => sum + o.total, 0);
    const qrTotal = paidOrders
      .filter((o) => o.customer.paymentMethod === 'vietqr' || o.customer.paymentMethod === 'momo')
      .reduce((sum, o) => sum + o.total, 0);

    // Tại bàn vs Giao đi
    const dineInTotal = paidOrders
      .filter((o) => o.orderType === 'dine-in')
      .reduce((sum, o) => sum + o.total, 0);
    const deliveryTotal = paidOrders
      .filter((o) => o.orderType === 'delivery' || o.orderType === 'takeaway')
      .reduce((sum, o) => sum + o.total, 0);

    // Top món bán chạy
    const itemMap: { [name: string]: { name: string; qty: number; revenue: number; image: string } } = {};
    paidOrders.forEach((o) => {
      o.items.forEach((it) => {
        if (!itemMap[it.tea.name]) {
          itemMap[it.tea.name] = {
            name: it.tea.name,
            qty: 0,
            revenue: 0,
            image: it.tea.image,
          };
        }
        itemMap[it.tea.name].qty += it.quantity;
        itemMap[it.tea.name].revenue += it.totalPrice;
      });
    });

    const topItems = Object.values(itemMap).sort((a, b) => b.qty - a.qty);

    return {
      totalRevenue,
      totalOrdersCount,
      aov,
      unpaidRevenue,
      unpaidCount: unpaidOrders.length,
      cashTotal,
      qrTotal,
      dineInTotal,
      deliveryTotal,
      topItems,
    };
  }, [orders]);

  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#222B25] flex flex-col font-sans">
      {/* HEADER QUẢN TRỊ TRUNG TÂM */}
      <header className="sticky top-0 z-40 bg-[#322821] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Tên Hệ Thống */}
          <div className="flex items-center gap-3">
            <img 
              src="/logo-icon-white.png" 
              alt="Thượng POS Logo" 
              className="w-10 h-10 object-contain p-1 rounded-2xl bg-white/10 shadow-inner" 
            />
            <div>
              <div className="font-display font-bold text-lg leading-tight flex items-center gap-2">
                <span>THƯỢNG POS</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/40">
                  EST 2026
                </span>
              </div>
              <div className="text-[11px] text-[#D8CDC4] font-mono">
                {currentTime} • Kết nối Quầy & Bếp Realtime
              </div>
            </div>
          </div>

          {/* Nhân Viên Đang Đăng Nhập & Chấm Công */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Thẻ nhân viên hiện tại */}
            <div 
              onClick={() => setIsStaffSwitcherOpen(true)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1.5 rounded-2xl cursor-pointer transition-colors"
              title="Bấm để đổi ca / đổi nhân viên"
            >
              <span className="text-xl">{currentStaff?.avatar || '👨‍💼'}</span>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                  <span>{currentStaff?.name || 'Quản Lý'}</span>
                  <span className="font-mono text-[10px] text-yellow-300">[{currentStaff?.code || '1234'}]</span>
                </div>
                <div className="text-[10px] text-emerald-200">
                  {currentStaff?.roleTitle || 'Quản Lý Cấp Cao'}
                </div>
              </div>
            </div>

            {/* Nút Bật/Tắt & Thử Chuông POS */}
            <div className="flex items-center gap-1 bg-white/10 p-0.5 rounded-xl border border-white/15">
              <button
                type="button"
                onClick={handleToggleSound}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  posSoundEnabled
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
                title={posSoundEnabled ? 'Chuông POS đang BẬT. Bấm để tắt' : 'Chuông POS đang TẮT. Bấm để bật'}
              >
                {posSoundEnabled ? <Volume2 className="w-3.5 h-3.5 text-white" /> : <VolumeX className="w-3.5 h-3.5 text-stone-400" />}
                <span className="hidden lg:inline">{posSoundEnabled ? 'Chuông POS' : 'Tắt chuông'}</span>
              </button>

              <button
                type="button"
                onClick={handleTestSound}
                className="px-2 py-1.5 rounded-lg text-[11px] font-bold text-amber-200 hover:text-white hover:bg-white/15 transition-colors flex items-center gap-1"
                title="Bấm để thử chuông máy POS ngay"
              >
                <Bell className="w-3 h-3 text-amber-300 animate-pulse" />
                <span className="hidden xl:inline">Thử chuông</span>
              </button>
            </div>

            {/* Nút Nhận & Check Đơn Nhanh */}
            <button
              type="button"
              onClick={() => {
                stopPosRingtone();
                playClickSound(true);
                const target = uncheckedOrders[0] || orders.find(o => o.status === 'pending') || orders[0];
                if (target) {
                  setCheckOrderModal(target);
                } else {
                  setShowCheckOrderDrawer(true);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
              title="Nhận đơn và check kiểm tra đơn hàng mới"
            >
              <Bell className="w-3.5 h-3.5 animate-bounce" />
              <span>Check Đơn</span>
              {uncheckedOrders.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-600 text-white font-black text-[10px] flex items-center justify-center border border-white">
                  {uncheckedOrders.length}
                </span>
              )}
            </button>

            {/* Nút Xem & In Mã QR Bàn */}
            {userRole === 'admin' && (
              <button
                onClick={() => setIsQrModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors border border-white/15"
                title="Tạo và in tem mica mã QR cho 12 bàn"
              >
                <QrCode className="w-3.5 h-3.5 text-yellow-300" />
                <span className="hidden md:inline">Mã QR Bàn</span>
              </button>
            )}

            {/* Về Web Khách */}
            <button
              onClick={onBackToStore}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors border border-white/15"
              title="Mở giao diện khách hàng"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden sm:inline">Trang Khách</span>
            </button>

            {/* Đăng xuất khỏi Admin */}
            <button
              onClick={onLogout}
              className="w-9 h-9 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-200 flex items-center justify-center transition-colors border border-red-400/30"
              title="Đăng xuất khỏi quầy"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* TOAST POPUP THÔNG BÁO ĐƠN HÀNG MỚI */}
      {newOrderToast && (
        <div className="fixed top-20 right-4 z-50 max-w-sm w-[calc(100vw-2rem)] bg-[#261E18] text-white p-4 rounded-3xl shadow-2xl border-2 border-amber-400 flex items-start gap-3 animate-bounce sm:animate-none">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <Bell className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="font-extrabold text-[11px] text-amber-300 uppercase tracking-wider flex items-center gap-1">
                <span>🔔 CÓ ĐƠN HÀNG MỚI!</span>
              </span>
              <button 
                type="button" 
                onClick={() => {
                  stopPosRingtone();
                  setNewOrderToast(null);
                }} 
                className="text-stone-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-sm font-bold text-white mt-0.5 truncate">
              {newOrderToast.customer.servingType === 'dine-in' ? newOrderToast.tableNumber : 'Giao hàng tận nơi'} • #{newOrderToast.orderNumber}
            </div>
            <div className="text-xs text-stone-300 mt-0.5">
              Khách: <strong className="text-amber-200">{newOrderToast.customer.name}</strong> • {newOrderToast.items.length} món • <span className="font-sans font-bold text-[#F4A261]">{formatVND(newOrderToast.total)}</span>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  stopPosRingtone();
                  setCheckOrderModal(newOrderToast);
                  setNewOrderToast(null);
                }}
                className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs text-center transition-colors flex items-center justify-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Check & In Bill</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  stopPosRingtone();
                  handleLoadTableOrderToPos(newOrderToast);
                  setNewOrderToast(null);
                }}
                className="py-1.5 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs text-center transition-colors"
              >
                Nạp POS
              </button>
              <button
                type="button"
                onClick={() => {
                  stopPosRingtone();
                  setActiveTab('kds');
                  setNewOrderToast(null);
                }}
                className="py-1.5 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors"
              >
                Bếp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* THANH ĐIỀU HƯỚNG CÁC TAB CHỨC NĂNG */}
      <div className="bg-white border-b border-[#EAE3D2] px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* TAB 1: THU NGÂN POS */}
          {isTabAllowed('cashier') && (
            <button
              onClick={() => {
                setActiveTab('cashier');
                playClickSound(true);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'cashier'
                  ? 'bg-[#322821] text-white shadow-md'
                  : 'text-[#5A6860] hover:bg-[#F3EFE6]'
              }`}
            >
              <CreditCard className="w-4 h-4 text-[#F4A261]" />
              <span>Thu Ngân POS</span>
            </button>
          )}

          {/* TAB CHECK ĐƠN NHANH */}
          <button
            type="button"
            onClick={() => {
              stopPosRingtone();
              playClickSound(true);
              setShowCheckOrderDrawer(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs transition-all whitespace-nowrap active:scale-95"
          >
            <Bell className="w-4 h-4 text-amber-600 animate-bounce" />
            <span>Check Đơn</span>
            {uncheckedOrders.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center">
                {uncheckedOrders.length}
              </span>
            )}
          </button>

          {/* TAB 2: SƠ ĐỒ BÀN */}
          {isTabAllowed('tables') && (
            <button
              onClick={() => {
                setActiveTab('tables');
                playClickSound(true);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'tables'
                  ? 'bg-[#322821] text-white shadow-md'
                  : 'text-[#5A6860] hover:bg-[#F3EFE6]'
              }`}
            >
              <LayoutGrid className="w-4 h-4 text-emerald-600" />
              <span>Sơ Đồ Bàn</span>
              {totalOccupiedCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold">
                  {totalOccupiedCount} có khách
                </span>
              )}
            </button>
          )}

          {/* TAB 3: BẾP PHA CHẾ (KDS) */}
          {isTabAllowed('kds') && (
            <button
              onClick={() => {
                setActiveTab('kds');
                playClickSound(true);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'kds'
                  ? 'bg-[#322821] text-white shadow-md'
                  : 'text-[#5A6860] hover:bg-[#F3EFE6]'
              }`}
            >
              <ChefHat className="w-4 h-4 text-amber-500" />
              <span>Bếp Pha Chế (KDS)</span>
            </button>
          )}

          {/* TAB 4: QUẢN LÝ SẢN PHẨM (THÊM / SỬA / XÓA) */}
          {isTabAllowed('menu') && (
            <button
              onClick={() => {
                setActiveTab('menu');
                playClickSound(true);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'menu'
                  ? 'bg-[#322821] text-white shadow-md'
                  : 'text-[#5A6860] hover:bg-[#F3EFE6]'
              }`}
            >
              <PackageCheck className="w-4 h-4 text-blue-600" />
              <span>Quản Lý Sản Phẩm</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 font-bold">
                {products.length}
              </span>
            </button>
          )}

          {/* TAB 5: QUẢN LÝ DOANH THU & TÀI CHÍNH */}
          {isTabAllowed('revenue') && (
            <button
              onClick={() => {
                setActiveTab('revenue');
                playClickSound(true);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'revenue'
                  ? 'bg-[#322821] text-white shadow-md'
                  : 'text-[#5A6860] hover:bg-[#F3EFE6]'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Doanh Thu & Báo Cáo</span>
            </button>
          )}

          {/* TAB 6: NHÂN VIÊN & PHÂN QUYỀN */}
          {isTabAllowed('staff') && (
            <button
              onClick={() => {
                setActiveTab('staff');
                playClickSound(true);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'staff'
                  ? 'bg-[#322821] text-white shadow-md'
                  : 'text-[#5A6860] hover:bg-[#F3EFE6]'
              }`}
            >
              <Users className="w-4 h-4 text-purple-600" />
              <span>Nhân Viên & Phân Quyền</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-800 font-bold">
                {staffMembers.length}
              </span>
            </button>
          )}

          {/* TAB 7: CHẤM CÔNG ĐỨNG QUẦY */}
          <button
            onClick={() => {
              setActiveTab('attendance');
              playClickSound(true);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'attendance'
                ? 'bg-[#322821] text-white shadow-md'
                : 'text-[#5A6860] hover:bg-[#F3EFE6]'
            }`}
          >
            <Clock className="w-4 h-4 text-orange-500" />
            <span>Chấm Công Ca</span>
          </button>
        </div>

        {/* Thông báo quyền hạn nếu bị giới hạn */}
        {userRole !== 'admin' && (
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-[#7A8780] bg-[#FAF7F2] px-3 py-1 rounded-xl border border-[#EAE3D2]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#322821]" />
            <span>Đang ở chế độ nhân viên: <strong className="text-[#322821]">{currentStaff?.roleTitle}</strong></span>
          </div>
        )}
      </div>

      {/* NỘI DUNG CHÍNH CÁC TAB */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        
        {/* ======================================================== */}
        {/* TAB 1: BÁN HÀNG THU NGÂN (POS CASHIER)                   */}
        {/* ======================================================== */}
        {activeTab === 'cashier' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* CỘT TRÁI: THỰC ĐƠN CHỌN MÓN NHANH (7 CỘT) */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-5 border border-[#DDD5C5] shadow-xs flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#88968E]" />
                  <input
                    type="text"
                    placeholder="Tìm tên món, loại quả..."
                    value={posSearch}
                    onChange={(e) => setPosSearch(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#DDD6C8] rounded-xl pl-9 pr-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#322821]"
                  />
                </div>

                {/* Danh mục nhanh */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {['all', 'signature', 'fruit-tea', 'milk-tea'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setPosCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                        posCategory === cat ? 'bg-[#322821] text-white' : 'bg-[#FAF7F2] text-[#55635B] hover:bg-[#EAE3D2]'
                      }`}
                    >
                      {cat === 'all' ? 'Tất cả món' : cat === 'signature' ? 'Signature' : cat === 'milk-tea' ? 'Trà Sữa' : 'Trái cây'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lưới sản phẩm để bấm chọn nhanh */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[calc(100vh-270px)] overflow-y-auto pr-1">
                {products.filter(t => 
                  (posCategory === 'all' || t.category === posCategory) &&
                  (t.name.toLowerCase().includes(posSearch.toLowerCase()) || t.tagline.toLowerCase().includes(posSearch.toLowerCase()))
                ).map((tea) => (
                  <button
                    key={tea.id}
                    onClick={() => handleAddToCartPos(tea)}
                    className="p-3 rounded-2xl bg-[#FAF7F2] hover:bg-emerald-50/70 border border-[#EAE3D2] hover:border-[#322821] transition-all text-left flex flex-col justify-between group active:scale-95 shadow-2xs"
                  >
                    <div className="h-24 flex items-center justify-center mb-1 relative">
                      <img
                        src={tea.image}
                        alt={tea.name}
                        className="max-h-full w-auto object-contain group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-[#322821] line-clamp-1 leading-snug">
                        {tea.name}
                      </div>
                      <div className="font-sans font-bold text-xs text-[#D95829] mt-0.5">
                        {formatVND(tea.price)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* CỘT PHẢI: MÁY POS BÁN HÀNG & THU NGÂN CHUẨN RETAIL */}
            <div className="lg:col-span-6 xl:col-span-5 bg-white rounded-3xl p-4 sm:p-5 border border-[#DDD5C5] shadow-md flex flex-col justify-between min-h-[620px]">
              <div>
                {/* 1. TÌM KIẾM KHÁCH HÀNG (THEO TÊN HOẶC SĐT) & TÍCH ĐIỂM VĨNH VIỄN */}
                <div className="mb-3 relative">
                  <div className="flex gap-1.5 items-center">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C9890]" />
                      <input
                        type="text"
                        placeholder="Tìm Tên khách (VD: Hậu, Lan) hoặc Số ĐT..."
                        value={posCustomerSearch}
                        onFocus={() => setIsSearchFocused(true)}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPosCustomerSearch(val);
                          setSelectedMember(null);
                          if (/^[0-9\s+]+$/.test(val)) {
                            setPosPhone(val);
                          } else {
                            setPosCustomerName(val);
                          }
                        }}
                        className="w-full bg-[#FAF7F2] border border-[#DDD6C8] rounded-xl pl-8 pr-7 py-2 text-xs font-medium text-[#222B25] placeholder:text-[#9AA69E] focus:outline-none focus:border-[#322821] focus:bg-white transition-colors"
                      />
                      {posCustomerSearch && (
                        <button
                          type="button"
                          onClick={handleClearMember}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsNewCustomerOpen(!isNewCustomerOpen)}
                      className="px-2.5 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#EAE3D2] border border-[#DDD6C8] text-xs font-bold text-[#322821] flex items-center gap-1 shrink-0 transition-colors"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-[#322821]" />
                      <span>{isNewCustomerOpen ? 'Thu gọn' : '+ Khách mới'}</span>
                    </button>
                  </div>

                  {/* Dropdown danh sách gợi ý thành viên khi đang gõ */}
                  {isSearchFocused && matchingMembers.length > 0 && !selectedMember && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#DDD5C5] rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-[#F0EAE0]">
                      <div className="p-2 bg-[#FAF7F2] text-[10px] font-bold text-[#6B7770] flex items-center justify-between">
                        <span>🔍 Khớp {matchingMembers.length} khách thành viên:</span>
                        <button 
                          type="button" 
                          onClick={() => setIsSearchFocused(false)} 
                          className="text-gray-400 hover:text-gray-700 text-[10px] font-bold"
                        >
                          Đóng ✕
                        </button>
                      </div>
                      {matchingMembers.slice(0, 6).map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => handleSelectMember(m)}
                          className="w-full text-left px-3 py-2.5 hover:bg-amber-50/80 transition-colors flex items-center justify-between gap-2 group cursor-pointer"
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-[#322821] group-hover:text-[#D95829] flex items-center gap-1.5">
                              <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate">{m.name}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold shrink-0">
                                {m.tier}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#6B7770] font-mono mt-0.5">
                              {m.phone}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-xs font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full border border-amber-200">
                              ⭐ {m.points}đ
                            </div>
                            <div className="text-[9px] text-emerald-700 font-bold mt-0.5">Chọn khách này ➔</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Thông tin thẻ thành viên hoặc tạo khách mới */}
                  {(foundMember || isNewCustomerOpen || (posPhone.trim().length >= 9 && !foundMember)) && (
                    <div className="mt-2 p-2.5 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-300 rounded-xl text-xs flex flex-col gap-1.5 shadow-2xs">
                      {foundMember ? (
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 shadow-2xs">
                              <UserCheck className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-[#322821] flex items-center gap-1.5 truncate">
                                <span className="truncate">{foundMember.name}</span>
                                <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 text-[10px] font-bold shrink-0">
                                  {foundMember.tier}
                                </span>
                                <span className="text-[11px] font-mono text-gray-500 font-normal">
                                  ({foundMember.phone})
                                </span>
                              </div>
                              <div className="text-[11px] text-amber-900 mt-0.5 truncate">
                                Điểm hiện có: <strong className="text-[#D95829]">{foundMember.points}đ</strong> • Tích thêm +{Math.floor(posGrandTotal / 10000)}đ
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {foundMember.points >= 50 && (
                              <label className="flex items-center gap-1.5 cursor-pointer bg-white px-2 py-1 rounded-lg border border-amber-300 font-bold text-amber-900 text-[11px] shadow-2xs shrink-0">
                                <input
                                  type="checkbox"
                                  checked={posUsePointsDiscount}
                                  onChange={(e) => setPosUsePointsDiscount(e.target.checked)}
                                  className="w-3.5 h-3.5 rounded text-[#322821]"
                                />
                                <span>Đổi 50đ (-20k)</span>
                              </label>
                            )}
                            <button
                              type="button"
                              onClick={handleClearMember}
                              title="Bỏ chọn thành viên"
                              className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-white transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1.5">
                          <div className="text-[11px] font-bold text-amber-950 flex items-center justify-between">
                            <span>⚡ Tạo nhanh khách mới & Tích điểm vĩnh viễn:</span>
                            <span className="text-[10px] text-amber-800">Tự lưu VIP</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Tên khách hàng mới..."
                              value={posCustomerName}
                              onChange={(e) => setPosCustomerName(e.target.value)}
                              className="bg-white border border-amber-300 rounded-lg px-2.5 py-1 text-xs text-[#222B25] focus:outline-none focus:border-[#322821]"
                            />
                            <input
                              type="tel"
                              placeholder="Số điện thoại..."
                              value={posPhone}
                              onChange={(e) => setPosPhone(e.target.value)}
                              className="bg-white border border-amber-300 rounded-lg px-2.5 py-1 text-xs text-[#222B25] focus:outline-none focus:border-[#322821]"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. HEADER HÓA ĐƠN & BÀN PHỤC VỤ */}
                <div className="pb-2.5 border-b border-[#F0EAE0]">
                  {/* Bàn chờ tính tiền quick bar nếu có */}
                  {occupiedUnpaidCount > 0 && !loadedTableOrderId && (
                    <div className="mb-2 p-2 bg-amber-50 border border-amber-300 rounded-xl">
                      <div className="text-[10px] font-bold text-amber-900 mb-1 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                          <span>{occupiedUnpaidCount} bàn đang chờ tính tiền:</span>
                        </span>
                        <span className="text-[9px] text-amber-700">Bấm nạp nhanh</span>
                      </div>
                      <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none">
                        {allTablesList.filter(t => getTableStatus(t) === 'occupied_unpaid').map(t => {
                          const ord = getTableOrder(t);
                          return (
                            <button
                              key={t}
                              type="button"
                              onClick={() => ord && handleLoadTableOrderToPos(ord)}
                              className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500 hover:bg-amber-600 text-white whitespace-nowrap shadow-2xs"
                            >
                              {t} ({ord ? formatVND(ord.total) : ''})
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {loadedTableOrderId && (
                    <div className="mb-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 flex items-center justify-between">
                      <span>📌 Đang nạp đơn từ <strong>{posTableNumber}</strong></span>
                      <button
                        type="button"
                        onClick={() => {
                          setLoadedTableOrderId(null);
                          setPosCart([]);
                        }}
                        className="text-blue-700 hover:underline font-bold"
                      >
                        Hủy nạp
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-display font-bold text-xs text-[#322821] uppercase flex items-center gap-1.5">
                      <span>Hóa Đơn Thu Ngân</span>
                      <span className="text-[10px] font-mono text-[#D95829]">({posCart.length} món)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setPosCart([]);
                        setLoadedTableOrderId(null);
                        setCashTendered(0);
                      }}
                      disabled={posCart.length === 0}
                      className="text-[11px] text-red-500 hover:text-red-700 disabled:opacity-30 font-bold flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Hủy giỏ</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex p-0.5 bg-[#FAF7F2] rounded-xl border border-[#DDD6C8] text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setPosServingType('dine-in')}
                        className={`flex-1 py-1 rounded-lg transition-all ${
                          posServingType === 'dine-in' ? 'bg-[#322821] text-white shadow-2xs' : 'text-[#627068]'
                        }`}
                      >
                        🪑 Tại Bàn
                      </button>
                      <button
                        type="button"
                        onClick={() => setPosServingType('takeaway')}
                        className={`flex-1 py-1 rounded-lg transition-all ${
                          posServingType === 'takeaway' ? 'bg-[#322821] text-white shadow-2xs' : 'text-[#627068]'
                        }`}
                      >
                        🥡 Mang Về
                      </button>
                    </div>

                    {posServingType === 'dine-in' && (
                      <select
                        value={posTableNumber}
                        onChange={(e) => setPosTableNumber(e.target.value)}
                        className="bg-[#FAF7F2] border border-[#DDD6C8] rounded-xl px-2 py-1 text-xs font-bold text-[#322821] focus:outline-none"
                      >
                        {allTablesList.map((tbl) => {
                          const status = getTableStatus(tbl);
                          return (
                            <option key={tbl} value={tbl}>
                              {tbl} {status === 'occupied_unpaid' ? '(Chờ TT 🟠)' : status === 'occupied_paid' ? '(Có khách 🔵)' : '(Trống 🟢)'}
                            </option>
                          );
                        })}
                      </select>
                    )}
                  </div>
                </div>

                {/* 3. DANH SÁCH MÓN ĐANG CHỌN */}
                <div className="max-h-40 sm:max-h-48 overflow-y-auto divide-y divide-[#F0EAE0] py-1">
                  {posCart.length === 0 ? (
                    <div className="py-8 text-center text-[#8C9890] text-xs">
                      Chưa có món. Bấm vào thức uống bên trái để thêm vào đơn.
                    </div>
                  ) : (
                    posCart.map((item) => (
                      <div key={item.cartItemId} className="py-2 flex items-center justify-between gap-2 text-xs">
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-[#322821] truncate">{item.tea.name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <button
                              type="button"
                              onClick={() => handleTogglePosSize(item.cartItemId)}
                              className="px-1.5 py-0.2 rounded bg-[#FAF7F2] border border-[#DDD6C8] font-bold text-[10px] text-[#45524A] hover:bg-[#EAE3D2]"
                            >
                              Size {item.size} {item.size === 'L' ? '(+6k)' : ''}
                            </button>
                            <span className="font-sans font-bold text-[#D95829]">
                              {formatVND(item.totalPrice)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <div className="flex items-center bg-[#FAF7F2] border border-[#DDD6C8] rounded-lg p-0.5">
                            <button
                              type="button"
                              onClick={() => handleUpdatePosQuantity(item.cartItemId, -1)}
                              className="w-5 h-5 rounded bg-white text-[#45524A] flex items-center justify-center font-bold hover:bg-[#F0EAE0]"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="w-5 text-center font-bold font-mono text-xs">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdatePosQuantity(item.cartItemId, 1)}
                              className="w-5 h-5 rounded bg-[#322821] text-white flex items-center justify-center font-bold hover:bg-[#211A15]"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemovePosItem(item.cartItemId)}
                            className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Xóa món"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 4. PHẦN BÀN PHÍM POS & THANH TOÁN */}
              <div className="pt-2 border-t border-[#F0EAE0]">
                {isLoadedOrderPaid ? (
                  <div className="space-y-3 p-3.5 bg-gradient-to-b from-emerald-50 to-emerald-100/60 rounded-2xl border-2 border-emerald-400 shadow-xs">
                    <div className="flex items-center gap-2.5 text-emerald-950">
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-extrabold text-xs uppercase tracking-wide text-emerald-900 flex items-center gap-1.5 flex-wrap">
                          <span>KHÁCH ĐÃ CHUYỂN KHOẢN VIETQR</span>
                          <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                            ĐÃ THANH TOÁN
                          </span>
                        </div>
                        <div className="text-[11px] text-emerald-800">
                          Đơn {posTableNumber} đã thanh toán đủ trực tuyến. Thu ngân chỉ cần bấm <strong>RA BILL</strong> giao khách!
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-white/95 rounded-xl border border-emerald-200 flex justify-between items-center text-xs">
                      <div>
                        <span className="text-[#69776E] block text-[10px]">Số tiền đã nhận:</span>
                        <span className="text-base font-sans font-black text-emerald-700">{formatVND(posGrandTotal)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-stone-500 block">Hình thức:</span>
                        <span className="font-bold text-emerald-800 text-xs">Chuyển khoản VietQR</span>
                      </div>
                    </div>

                    {/* NÚT CHÍNH: RA BILL IN HÓA ĐƠN NGAY */}
                    <button
                      type="button"
                      onClick={() => {
                        stopPosRingtone();
                        playSuccessSound(true);
                        if (loadedOrder) {
                          setPrintingOrder(loadedOrder);
                        }
                      }}
                      className="w-full py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm uppercase shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>🖨️ RA BILL IN HÓA ĐƠN NGAY</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          stopPosRingtone();
                          playClickSound(true);
                          setPosCart([]);
                          setLoadedTableOrderId(null);
                          setPosCustomerSearch('');
                          setSelectedMember(null);
                          setPosPhone('');
                          setPosCustomerName('');
                          setPosNote('');
                        }}
                        className="py-2.5 px-2 rounded-xl bg-white hover:bg-stone-50 border border-[#DDD6C8] text-[#322821] text-xs font-bold transition-colors flex items-center justify-center gap-1"
                      >
                        <span>Xong & Về Quầy Mới</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          stopPosRingtone();
                          if (confirm(`Xác nhận khách tại ${posTableNumber} đã rời quán và trả bàn về trạng thái BÀN TRỐNG?`)) {
                            clearTable(posTableNumber);
                            playSuccessSound(true);
                            setPosCart([]);
                            setLoadedTableOrderId(null);
                            setPosCustomerSearch('');
                            setSelectedMember(null);
                            setPosPhone('');
                            setPosCustomerName('');
                            setPosNote('');
                          }
                        }}
                        className="py-2.5 px-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold transition-colors flex items-center justify-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Dọn Trả Bàn Trống</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* 4 Tabs Phương thức thanh toán */}
                    <div className="grid grid-cols-4 gap-1 p-1 bg-[#FAF7F2] rounded-2xl border border-[#DDD6C8] mb-2 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => {
                          setPosPaymentMethod('cash');
                          if (cashTendered === 0 && posGrandTotal > 0) setCashTendered(posGrandTotal);
                        }}
                        className={`py-1.5 px-0.5 rounded-xl transition-all flex items-center justify-center gap-1 ${
                          posPaymentMethod === 'cash' ? 'bg-[#322821] text-white shadow-2xs' : 'text-[#55635B] hover:bg-[#EAE3D2]'
                        }`}
                      >
                        <Banknote className="w-3.5 h-3.5" />
                        <span>Tiền mặt</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPosPaymentMethod('vietqr')}
                        className={`py-1.5 px-0.5 rounded-xl transition-all flex items-center justify-center gap-1 ${
                          posPaymentMethod === 'vietqr' ? 'bg-[#322821] text-white shadow-2xs' : 'text-[#55635B] hover:bg-[#EAE3D2]'
                        }`}
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>VietQR</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPosPaymentMethod('card')}
                        className={`py-1.5 px-0.5 rounded-xl transition-all flex items-center justify-center gap-1 ${
                          posPaymentMethod === 'card' ? 'bg-[#322821] text-white shadow-2xs' : 'text-[#55635B] hover:bg-[#EAE3D2]'
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Thẻ</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPosPaymentMethod('debt')}
                        className={`py-1.5 px-0.5 rounded-xl transition-all flex items-center justify-center gap-1 ${
                          posPaymentMethod === 'debt' ? 'bg-[#322821] text-white shadow-2xs' : 'text-[#55635B] hover:bg-[#EAE3D2]'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Ghi nợ</span>
                      </button>
                    </div>

                    {/* NỘI DUNG TỪNG PHƯƠNG THỨC */}
                    {posPaymentMethod === 'cash' && (
                      <div>
                        {/* 3 Ô THÔNG SỐ: CẦN THU | KHÁCH ĐƯA | TIỀN THỪA */}
                        <div className="grid grid-cols-3 gap-1.5 mb-2">
                          <div className="p-1.5 rounded-xl bg-red-50 border border-red-200 text-center">
                            <div className="text-[10px] font-bold text-red-700 uppercase">Cần Thu</div>
                            <div className="font-sans font-extrabold text-xs sm:text-sm text-red-600 truncate">
                              {formatVND(posGrandTotal)}
                            </div>
                          </div>
                          <div className="p-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                            <div className="text-[10px] font-bold text-emerald-800 uppercase">Khách Đưa</div>
                            <div className="font-sans font-extrabold text-xs sm:text-sm text-emerald-700 truncate">
                              {formatVND(cashTendered)}
                            </div>
                          </div>
                          <div className={`p-1.5 rounded-xl text-center border ${
                            cashTendered >= posGrandTotal
                              ? 'bg-blue-50 border-blue-200 text-blue-900'
                              : 'bg-amber-50 border-amber-200 text-amber-900'
                          }`}>
                            <div className="text-[10px] font-bold uppercase">
                              {cashTendered >= posGrandTotal ? 'Tiền Thừa' : 'Còn Thiếu'}
                            </div>
                            <div className={`font-sans font-extrabold text-xs sm:text-sm truncate ${
                              cashTendered >= posGrandTotal ? 'text-blue-700' : 'text-amber-700'
                            }`}>
                              {cashTendered >= posGrandTotal 
                                ? formatVND(cashTendered - posGrandTotal)
                                : `-${formatVND(posGrandTotal - cashTendered)}`
                              }
                            </div>
                          </div>
                        </div>

                        {/* Phím mệnh giá tiền nhanh */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                          {[500000, 200000, 100000, 50000, 20000, 10000].map((amt) => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => handleAddDenomination(amt)}
                              className="py-1 rounded-lg bg-[#FAF7F2] hover:bg-[#EAE3D2] border border-[#DDD6C8] font-mono font-bold text-[10px] text-[#322821] transition-colors"
                            >
                              +{amt >= 1000 ? `${amt / 1000}k` : amt}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              playClickSound(true);
                              setCashTendered(posGrandTotal);
                            }}
                            className="py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 font-bold text-[9px] text-emerald-900 transition-colors"
                            title="Khách đưa đúng tiền"
                          >
                            Đúng tiền
                          </button>
                        </div>

                        {/* Bàn phím số Numpad cảm ứng */}
                        <div className="grid grid-cols-4 gap-1 mb-2">
                          {/* Row 1 */}
                          <button
                            type="button"
                            onClick={() => handleNumpadInput('1')}
                            className="h-8 rounded-lg bg-[#FAF7F2] hover:bg-[#EAE3D2] border border-[#DDD6C8] font-bold text-xs text-[#322821] active:scale-95"
                          >
                            1
                          </button>
                          <button
                            type="button"
                            onClick={() => handleNumpadInput('2')}
                            className="h-8 rounded-lg bg-[#FAF7F2] hover:bg-[#EAE3D2] border border-[#DDD6C8] font-bold text-xs text-[#322821] active:scale-95"
                          >
                            2
                          </button>
                          <button
                            type="button"
                            onClick={() => handleNumpadInput('3')}
                            className="h-8 rounded-lg bg-[#FAF7F2] hover:bg-[#EAE3D2] border border-[#DDD6C8] font-bold text-xs text-[#322821] active:scale-95"
                          >
                            3
                          </button>
                          <button
                            type="button"
                            onClick={() => handleNumpadInput('C')}
                            className="h-8 rounded-lg bg-red-100 hover:bg-red-200 border border-red-300 font-bold text-xs text-red-800 active:scale-95"
                            title="Xóa về 0"
                          >
                            C
                          </button>

                          {/* Row 2 */}
                          <button
                            type="button"
                            onClick={() => handleNumpadInput('4')}
                            className="h-8 rounded-lg bg-[#FAF7F2] hover:bg-[#EAE3D2] border border-[#DDD6C8] font-bold text-xs text-[#322821] active:scale-95"
                          >
                            4
                          </button>
                          <button
                            type="button"
                            onClick={() => handleNumpadInput('5')}
                            className="h-8 rounded-lg bg-[#FAF7F2] hover:bg-[#EAE3D2] border border-[#DDD6C8] font-bold text-xs text-[#322821] active:scale-95"
                          >
                            5
                          </button>
                          <button
                            type="button"
                            onClick={() => handleNumpadInput('6')}
                            className="h-8 rounded-lg bg-[#FAF7F2] hover:bg-[#EAE3D2] border border-[#DDD6C8] font-bold text-xs text-[#322821] active:scale-95"
                          >
                            6
                          </button>
                          <button
                            type="button"
                            onClick={() => handleNumpadInput('DEL')}
                            className="h-8 rounded-lg bg-amber-100 hover:bg-amber-200 border border-amber-300 font-bold text-xs text-amber-800 active:scale-95"
                            title="Xóa ký tự cuối"
                          >
                            ⌫
                          </button>

                          {/* Row 3 */}
                          <button
                            type="button"
                            onClick={() => handleNumpadInput('7')}
                            className="h-8 rounded-lg bg-[#FAF7F2] hover:bg-[#EAE3D2] border border-[#DDD6C8] font-bold text-xs text-[#322821] active:scale-95"
                          >
                            7
                          </button>
                          <button
                            type="button"
                            onClick={() => handleNumpadInput('8')}
                            className="h-8 rounded-lg bg-[#FAF7F2] hover:bg-[#EAE3D2] border border-[#DDD6C8] font-bold text-xs text-[#322821] active:scale-95"
                          >
                            8
                          </button>
                          <button
                            type="button"
                            onClick={() => handleNumpadInput('9')}
                            className="h-8 rounded-lg bg-[#FAF7F2] hover:bg-[#EAE3D2] border border-[#DDD6C8] font-bold text-xs text-[#322821] active:scale-95"
                          >
                            9
                          </button>
                          <button
                            type="button"
                            onClick={() => handleNumpadInput('000')}
                            className="h-8 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 font-bold text-xs text-blue-800 active:scale-95"
                          >
                            .000
                          </button>

                          {/* Row 4 */}
                          <button
                            type="button"
                            onClick={() => handleNumpadInput('0')}
                            className="h-8 rounded-lg bg-[#FAF7F2] hover:bg-[#EAE3D2] border border-[#DDD6C8] font-bold text-xs text-[#322821] active:scale-95 col-span-2"
                          >
                            0
                          </button>
                          <button
                            type="button"
                            onClick={() => handleNumpadInput('00')}
                            className="h-8 rounded-lg bg-[#FAF7F2] hover:bg-[#EAE3D2] border border-[#DDD6C8] font-bold text-xs text-[#322821] active:scale-95 col-span-2"
                          >
                            00
                          </button>
                        </div>

                        {/* Nút Hoàn Tất Thu Tiền Mặt */}
                        <button
                          type="button"
                          onClick={() => handleCompletePosPayment('cash')}
                          disabled={posCart.length === 0}
                          className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-bold text-xs uppercase shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-[0.99]"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Hoàn Tất Thu Tiền Mặt ({formatVND(posGrandTotal)})</span>
                        </button>
                      </div>
                    )}

                    {posPaymentMethod === 'vietqr' && (
                      <div className="space-y-2">
                        <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#DDD6C8] flex flex-col items-center">
                          <div className="text-xs font-bold text-[#322821] mb-1">
                            Quét Mã VietQR Chuyển Khoản
                          </div>
                          <div className="w-32 h-32 bg-white p-1.5 rounded-xl border border-[#DDD6C8] shadow-2xs my-1 flex items-center justify-center">
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=2|99|0908886688|THUONG%20TEA||0|0|${posGrandTotal}|Thanh%20toan%20don%20hang|transfer_myqr`}
                              alt="Mã VietQR"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="font-sans font-bold text-sm text-[#D95829]">
                            {formatVND(posGrandTotal)}
                          </div>
                          <div className="text-[10px] text-[#69776E] mt-0.5">
                            MB Bank • 0908886688 • THƯỢNG TEA
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCompletePosPayment('vietqr')}
                          disabled={posCart.length === 0}
                          className="w-full py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:opacity-40 text-white font-bold text-xs uppercase shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-[0.99]"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Xác Nhận Đã Nhận Tiền VietQR ({formatVND(posGrandTotal)})</span>
                        </button>
                      </div>
                    )}

                    {posPaymentMethod === 'card' && (
                      <div className="space-y-2">
                        <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#DDD6C8] text-center">
                          <CreditCard className="w-8 h-8 text-[#322821] mx-auto mb-1 opacity-80" />
                          <div className="text-xs font-bold text-[#322821]">
                            Thanh Toán Quẹt Thẻ / Chạm Thẻ
                          </div>
                          <div className="text-[10px] text-[#69776E] mt-0.5">
                            Chạm hoặc cà thẻ Visa, Master, ATM nội địa qua máy POS ngân hàng
                          </div>
                          <div className="font-sans font-bold text-base text-[#D95829] mt-2">
                            {formatVND(posGrandTotal)}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCompletePosPayment('card')}
                          disabled={posCart.length === 0}
                          className="w-full py-2.5 rounded-xl bg-[#322821] hover:bg-[#211A15] disabled:opacity-40 text-white font-bold text-xs uppercase shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-[0.99]"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Hoàn Tất Quẹt Thẻ ({formatVND(posGrandTotal)})</span>
                        </button>
                      </div>
                    )}

                    {posPaymentMethod === 'debt' && (
                      <div className="space-y-2">
                        <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#DDD6C8]">
                          <div className="text-xs font-bold text-[#322821] mb-1 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-amber-700" />
                            <span>Ghi Vào Sổ Công Nợ Khách Hàng</span>
                          </div>
                          <p className="text-[10px] text-[#69776E] mb-2">
                            Vui lòng nhập SĐT hoặc Họ Tên khách hàng ở ô phía trên để theo dõi sổ nợ.
                          </p>
                          <input
                            type="text"
                            placeholder="Ghi chú nợ (hạn trả, người bảo lãnh...)"
                            value={posDebtNote}
                            onChange={(e) => setPosDebtNote(e.target.value)}
                            className="w-full bg-white border border-[#DDD6C8] rounded-xl px-2.5 py-1.5 text-xs text-[#222B25] focus:outline-none"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCompletePosPayment('debt')}
                          disabled={posCart.length === 0}
                          className="w-full py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 disabled:opacity-40 text-white font-bold text-xs uppercase shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-[0.99]"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Lưu Vào Sổ Ghi Nợ ({formatVND(posGrandTotal)})</span>
                        </button>
                      </div>
                    )}

                    {/* Nút lưu đơn tại bàn trả sau */}
                    {posServingType === 'dine-in' && (
                      <button
                        type="button"
                        onClick={handleSaveUnpaidOrderPos}
                        disabled={posCart.length === 0}
                        className="w-full mt-2 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#EAE3D2] border border-[#DDD6C8] text-[#322821] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span>Lưu Đơn Tại {posTableNumber} (Khách Uống Xong Trả Sau)</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: SƠ ĐỒ BÀN (TABLES MAP)                            */}
        {/* ======================================================== */}
        {activeTab === 'tables' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-display font-bold text-xl text-[#322821]">
                  Sơ Đồ Bàn Trà Tại Quán ({tables.length} Bàn)
                </h3>
                <p className="text-xs text-[#6B7870]">
                  Thêm, sửa, xóa bàn, theo dõi bàn đang có khách ngồi, bàn chờ tính tiền và dọn trả bàn trống
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Khôi phục danh sách về 12 bàn ban đầu của quán THƯỢNG?')) {
                      resetTablesToDefault();
                      playSuccessSound(true);
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-white border border-[#DDD6C8] hover:bg-[#FAF7F2] text-[#45524A] text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Mặc định</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingTable(null);
                    setIsTableModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm Bàn Mới</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsQrModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#322821] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <QrCode className="w-3.5 h-3.5 text-yellow-300" />
                  <span>In Tem Mã QR ({tables.length} Bàn)</span>
                </button>
              </div>
            </div>

            {/* Thanh thống kê trạng thái các bàn */}
            <div className="bg-white p-3.5 rounded-2xl border border-[#DDD5C5] mb-4 flex items-center justify-between flex-wrap gap-3 text-xs shadow-xs">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <span>Bàn Trống ({Math.max(0, tables.length - totalOccupiedCount)})</span>
                </span>
                <span className="flex items-center gap-1.5 font-bold text-amber-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>Chờ Tính Tiền ({occupiedUnpaidCount})</span>
                </span>
                <span className="flex items-center gap-1.5 font-bold text-blue-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>Đang Ngồi Uống ({occupiedPaidCount})</span>
                </span>
              </div>

              <div className="text-[11px] text-[#69776E]">
                💡 Bàn đang có khách sẽ <strong>tự động bị khóa</strong> trên trang web khách hàng cho đến khi bấm <strong>"Trả Bàn Trống"</strong>.
              </div>
            </div>

            {/* Lưới các bàn */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
              {tables.map((tableItem) => {
                const tbl = tableItem.name;
                const status = getTableStatus(tbl);
                const currentOrder = getTableOrder(tbl);
                const isTableActive = tableItem.isActive !== false;

                return (
                  <div
                    key={tableItem.id}
                    className={`p-3.5 rounded-3xl border transition-all flex flex-col justify-between min-h-[195px] shadow-2xs ${
                      !isTableActive
                        ? 'bg-gray-100/90 border-gray-300 opacity-75'
                        : status === 'occupied_unpaid'
                        ? 'bg-amber-50/95 border-amber-400 ring-2 ring-amber-400/50 shadow-sm'
                        : status === 'occupied_paid'
                        ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-300/40 shadow-sm'
                        : 'bg-white border-[#EAE3D2] hover:border-[#322821]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-display font-bold text-base text-[#322821] truncate">{tbl}</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingTable(tableItem);
                              setIsTableModalOpen(true);
                            }}
                            className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-amber-700 transition-colors"
                            title="Sửa thông tin bàn"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Bạn có chắc chắn muốn xóa "${tableItem.name}" khỏi sơ đồ quán?`)) {
                                const res = deleteTable(tableItem.id);
                                if (!res.success) {
                                  alert(res.message || 'Không thể xóa bàn!');
                                } else {
                                  playSuccessSound(true);
                                }
                              }
                            }}
                            className="p-1 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors"
                            title="Xóa bàn"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Vị trí & Số ghế */}
                      <div className="text-[10px] text-[#69776E] mb-2 font-medium truncate">
                        {tableItem.zone || 'Tầng 1'} • {tableItem.capacity || 4} chỗ
                      </div>

                      <div className="text-[11px] mb-2 font-bold">
                        {!isTableActive ? (
                          <span className="text-gray-700 bg-gray-200 px-2 py-0.5 rounded-full inline-block border border-gray-300">
                            🔒 Tạm Khóa
                          </span>
                        ) : status === 'occupied_unpaid' ? (
                          <span className="text-amber-900 bg-amber-200/90 px-2 py-0.5 rounded-full inline-block border border-amber-300">
                            🟠 Chờ Tính Tiền
                          </span>
                        ) : status === 'occupied_paid' ? (
                          <span className="text-blue-900 bg-blue-200/90 px-2 py-0.5 rounded-full inline-block border border-blue-300">
                            🔵 Đang Ngồi (Đã Trả)
                          </span>
                        ) : (
                          <span className="text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-block border border-emerald-200">
                            🟢 Bàn Trống
                          </span>
                        )}
                      </div>

                      {currentOrder && (
                        <div className="text-[11px] text-[#55635B] space-y-0.5 font-medium bg-white/70 p-2 rounded-xl border border-black/5">
                          <div>Đơn #{currentOrder.orderNumber} ({currentOrder.items.length} món)</div>
                          <div className="font-sans font-bold text-[#D95829]">{formatVND(currentOrder.total)}</div>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-black/5 mt-2 flex flex-col gap-1.5">
                      {status === 'occupied_unpaid' && currentOrder && (
                        <button
                          onClick={() => handleLoadTableOrderToPos(currentOrder)}
                          className="w-full py-1.5 rounded-xl bg-[#D95829] hover:bg-[#B7451E] text-white font-bold text-[11px] uppercase shadow-2xs flex items-center justify-center gap-1"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>Thu Tiền POS</span>
                        </button>
                      )}

                      {status !== 'available' && (
                        <button
                          onClick={() => {
                            if (confirm(`Xác nhận khách tại ${tbl} đã rời đi và trả bàn về trạng thái BÀN TRỐNG?`)) {
                              clearTable(tbl);
                              playSuccessSound(true);
                            }
                          }}
                          className={`w-full py-1.5 rounded-xl font-bold text-[10px] uppercase shadow-2xs flex items-center justify-center gap-1 transition-colors ${
                            status === 'occupied_paid'
                              ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                              : 'bg-white hover:bg-slate-100 text-[#45524A] border border-[#DDD6C8]'
                          }`}
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Trả Bàn Trống (Dọn Bàn)</span>
                        </button>
                      )}

                      {status === 'available' && isTableActive && (
                        <button
                          onClick={() => onSimulateScanTable(tbl)}
                          className="w-full py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#EAE3D2] text-[#322821] font-bold text-[10px] border border-[#DDD6C8] transition-colors"
                        >
                          Mô Phỏng Quét QR
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: BẾP PHA CHẾ (KDS)                                 */}
        {/* ======================================================== */}
        {activeTab === 'kds' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-display font-bold text-xl text-[#322821]">Màn Hình Bếp Pha Chế (KDS)</h3>
                <p className="text-xs text-[#6B7870]">Nhận đơn tự động từ quầy thu ngân và khách quét QR bàn</p>
              </div>

              {/* Bộ lọc đơn & Tìm kiếm */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white p-1 rounded-xl border border-[#DDD6C8] text-xs font-semibold">
                  <button
                    onClick={() => setFilterType('all')}
                    className={`px-3 py-1 rounded-lg transition-colors ${filterType === 'all' ? 'bg-[#322821] text-white' : 'text-[#627068]'}`}
                  >
                    Tất cả ({orders.length})
                  </button>
                  <button
                    onClick={() => setFilterType('dine-in')}
                    className={`px-3 py-1 rounded-lg transition-colors ${filterType === 'dine-in' ? 'bg-[#322821] text-white' : 'text-[#627068]'}`}
                  >
                    🪑 Tại Bàn ({orders.filter(o => o.orderType === 'dine-in').length})
                  </button>
                  <button
                    onClick={() => setFilterType('delivery')}
                    className={`px-3 py-1 rounded-lg transition-colors ${filterType === 'delivery' ? 'bg-[#322821] text-white' : 'text-[#627068]'}`}
                  >
                    🛵 Giao Đi ({orders.filter(o => o.orderType === 'delivery').length})
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#88968E]" />
                  <input
                    type="text"
                    placeholder="Tìm mã đơn, bàn..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white border border-[#DDD6C8] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#222B25] placeholder-[#909D95] focus:outline-none focus:border-[#322821] w-36 sm:w-44"
                  />
                </div>
              </div>
            </div>

            {/* Lưới đơn hàng KDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrders.length === 0 ? (
                <div className="col-span-full py-16 text-center text-[#8C9890] text-sm bg-white rounded-3xl border border-[#EAE3D2]">
                  Chưa có đơn hàng nào trong danh sách.
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className={`rounded-3xl border p-4 bg-white shadow-xs flex flex-col justify-between ${
                      order.status === 'completed'
                        ? 'opacity-70 border-slate-200'
                        : order.status === 'preparing'
                        ? 'border-blue-300 ring-2 ring-blue-300/30'
                        : 'border-yellow-300 ring-2 ring-yellow-400/30'
                    }`}
                  >
                    <div>
                      {/* Header đơn */}
                      <div className="flex items-center justify-between pb-2 border-b border-[#F0EAE0] mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-[#322821]">#{order.orderNumber}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            order.orderType === 'dine-in' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {order.orderType === 'dine-in' ? (order.tableNumber || 'Tại Bàn') : 'Giao Hàng'}
                          </span>
                        </div>
                        <span className="text-xs text-[#7A8780] font-mono">{order.createdAt}</span>
                      </div>

                      {/* Khách hàng & Ghi chú */}
                      <div className="text-xs text-[#4F5D55] mb-2">
                        <strong>{order.customer.name}</strong> • {order.customer.phone || 'Không có SĐT'}
                        {order.customer.note && (
                          <div className="text-[11px] text-amber-800 italic mt-0.5 bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                            📝 {order.customer.note}
                          </div>
                        )}
                      </div>

                      {/* Danh sách món cần làm */}
                      <div className="space-y-1.5 divide-y divide-[#F5EFE6]">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="pt-1.5 flex items-start justify-between gap-2 text-xs">
                            <div>
                              <div className="font-bold text-[#322821]">
                                {it.quantity}x {it.tea.name} (Size {it.size})
                              </div>
                              <div className="text-[11px] text-[#7A8780]">
                                Đường: {it.sugar}% • Đá: {it.ice}%
                                {it.toppings.length > 0 && ` • Topping: ${it.toppings.map(t => t.name).join(', ')}`}
                              </div>
                            </div>
                            <span className="font-sans font-bold text-[#D95829]">{formatVND(it.totalPrice)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Nút đổi trạng thái đơn */}
                    <div className="pt-3 border-t border-[#F0EAE0] mt-3 flex items-center justify-between gap-2">
                      <div className="text-xs font-bold">
                        {order.paymentStatus === 'paid' ? (
                          <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">ĐÃ THANH TOÁN</span>
                        ) : (
                          <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full text-[10px]">CHƯA TÍNH TIỀN</span>
                        )}
                      </div>

                      <div className="flex gap-1.5">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'preparing')}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                          >
                            Đang Làm
                          </button>
                        )}
                        {order.status === 'preparing' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'ready')}
                            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
                          >
                            Món Đã Xong
                          </button>
                        )}
                        {order.status === 'ready' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'completed')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Hoàn Tất</span>
                          </button>
                        )}
                        <button
                          onClick={() => setPrintingOrder(order)}
                          className="p-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#EAE3D2] text-[#45524A] border border-[#DDD6C8]"
                          title="In lại bill"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: QUẢN LÝ SẢN PHẨM (THÊM / SỬA / XÓA MENU & KHO)    */}
        {/* ======================================================== */}
        {activeTab === 'menu' && (
          <div>
            {/* Header Quản Lý Món */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="font-display font-bold text-xl text-[#322821]">
                  Quản Lý Sản Phẩm Menu & Trạng Thái Kho
                </h3>
                <p className="text-xs text-[#6B7870]">
                  Thêm món mới, sửa giá/ảnh/mô tả, xóa món hoặc bật/tắt hết hàng tức thì
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (confirm('Khôi phục danh sách menu về mặc định ban đầu?')) {
                      resetProductsToDefault();
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-white border border-[#DDD6C8] hover:bg-[#F3EDE2] text-xs font-bold text-[#55635B] flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Khôi Phục Menu Gốc</span>
                </button>

                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setIsProductModalOpen(true);
                    playClickSound(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#322821] hover:bg-[#211A15] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all"
                >
                  <Plus className="w-4 h-4 text-emerald-300" />
                  <span>Thêm Sản Phẩm Mới</span>
                </button>
              </div>
            </div>

            {/* Bảng Danh Sách Sản Phẩm */}
            <div className="bg-white rounded-3xl border border-[#DDD5C5] overflow-hidden shadow-xs mb-8">
              <div className="p-4 bg-[#FAF7F2] border-b border-[#DDD5C5] font-bold text-xs uppercase tracking-wider text-[#6A7870] grid grid-cols-12 gap-3">
                <div className="col-span-5 sm:col-span-4">Tên Món & Danh Mục</div>
                <div className="col-span-3 sm:col-span-2">Giá Bán</div>
                <div className="col-span-4 sm:col-span-3">Trạng Thái Kho</div>
                <div className="hidden sm:block sm:col-span-3 text-right">Thao Tác Quản Lý</div>
              </div>

              <div className="divide-y divide-[#F0EAE0]">
                {products.map((tea) => {
                  const isAvailable = stockStatus[tea.id] !== false;

                  return (
                    <div
                      key={tea.id}
                      className="p-4 flex flex-col sm:grid sm:grid-cols-12 gap-3 sm:items-center hover:bg-[#FDFBF7] transition-colors"
                    >
                      {/* Cột 1: Ảnh & Tên */}
                      <div className="col-span-5 sm:col-span-4 flex items-center gap-3">
                        <img
                          src={tea.image}
                          alt={tea.name}
                          className="w-12 h-12 object-contain bg-[#FAF7F2] rounded-xl border border-[#EAE3D2] p-1"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-xs sm:text-sm text-[#322821] truncate">
                            {tea.name}
                          </div>
                          <div className="text-[11px] text-[#7A8780] flex items-center gap-1.5">
                            <span className="capitalize">{tea.category}</span>
                            {tea.isBestSeller && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-red-100 text-red-800">
                                HOT
                              </span>
                            )}
                            {tea.isNew && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                                MỚI
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Cột 2: Giá */}
                      <div className="col-span-3 sm:col-span-2">
                        <div className="font-sans font-bold text-sm text-[#D95829]">
                          {formatVND(tea.price)}
                        </div>
                        {tea.originalPrice && (
                          <div className="font-sans text-[11px] text-slate-400 line-through">
                            {formatVND(tea.originalPrice)}
                          </div>
                        )}
                      </div>

                      {/* Cột 3: Trạng thái kho */}
                      <div className="col-span-4 sm:col-span-3">
                        <button
                          onClick={() => toggleStock(tea.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                            isAvailable
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-red-100 text-red-800 border border-red-300'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-600' : 'bg-red-600'}`} />
                          <span>{isAvailable ? 'CÒN HÀNG (BẬT)' : 'HẾT HÀNG (TẮT)'}</span>
                        </button>
                      </div>

                      {/* Cột 4: Nút Sửa & Xóa */}
                      <div className="col-span-12 sm:col-span-3 flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingProduct(tea);
                            setIsProductModalOpen(true);
                            playClickSound(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#EAE3D2] border border-[#DDD6C8] text-xs font-bold text-[#322821] flex items-center gap-1 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Sửa</span>
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Bạn có chắc chắn muốn xóa "${tea.name}" khỏi thực đơn?`)) {
                              deleteProduct(tea.id);
                              playClickSound(true);
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-bold text-red-600 flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Topping list */}
            <div className="bg-white rounded-3xl border border-[#DDD5C5] p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-display font-bold text-lg text-[#322821]">
                    Danh Sách Topping & Phụ Liệu ({toppings.length} loại)
                  </h3>
                  <p className="text-xs text-[#6B7870]">
                    Thêm, sửa, xóa, bật tắt trạng thái các loại topping và phụ liệu kèm giá phụ thu
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Khôi phục danh sách topping về 10 loại nguyên bản của quán?')) {
                        resetToppingsToDefault();
                        playSuccessSound(true);
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-white border border-[#DDD6C8] hover:bg-[#FAF7F2] text-[#45524A] text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Mặc định</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTopping(null);
                      setIsToppingModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm Topping Mới</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {toppings.map((top) => {
                  const isAvailable = top.isAvailable !== false;
                  return (
                    <div
                      key={top.id}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 ${
                        isAvailable
                          ? 'bg-[#FAF7F2] border-[#EAE3D2] hover:border-[#322821]'
                          : 'bg-gray-100/80 border-gray-300 opacity-75'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold text-sm ${isAvailable ? 'text-[#322821]' : 'text-gray-500 line-through'}`}>
                              {top.name}
                            </span>
                          </div>
                          {top.category && (
                            <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-white border border-[#EAE3D2] text-[10px] font-semibold text-[#55635B]">
                              {top.category}
                            </span>
                          )}
                        </div>
                        <strong className="font-sans text-sm text-[#D95829] shrink-0">
                          +{formatVND(top.price)}
                        </strong>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#EAE3D2]/70 text-xs">
                        <button
                          type="button"
                          onClick={() => toggleToppingAvailability(top.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors ${
                            isAvailable
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                          title={isAvailable ? 'Bấm để báo Tạm hết hàng' : 'Bấm để Mở lại phục vụ'}
                        >
                          {isAvailable ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          <span>{isAvailable ? 'Đang Phục Vụ' : 'Tạm Hết'}</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingTopping(top);
                              setIsToppingModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-white border border-[#DDD6C8] hover:bg-amber-50 hover:border-amber-400 text-gray-700 hover:text-amber-700 transition-colors"
                            title="Chỉnh sửa topping"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Bạn có chắc chắn muốn xóa topping "${top.name}"?`)) {
                                deleteTopping(top.id);
                                playClickSound(true);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors"
                            title="Xóa topping"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: QUẢN LÝ DOANH THU & BÁO CÁO TÀI CHÍNH             */}
        {/* ======================================================== */}
        {activeTab === 'revenue' && (
          <div>
            {/* Header Báo Cáo */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="font-display font-bold text-2xl text-[#322821]">
                  Báo Cáo Doanh Thu & Hiệu Quả Bán Hàng
                </h3>
                <p className="text-xs text-[#6B7870]">
                  Thống kê doanh thu thực thu, tiền mặt, VietQR và xếp hạng món bán chạy
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center bg-white p-1 rounded-xl border border-[#DDD6C8] text-xs font-semibold">
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'today', label: 'Hôm nay' },
                    { id: 'week', label: '7 ngày qua' },
                    { id: 'month', label: 'Tháng này' },
                  ].map((tf) => (
                    <button
                      key={tf.id}
                      onClick={() => setRevenueTimeFilter(tf.id as any)}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        revenueTimeFilter === tf.id ? 'bg-[#322821] text-white' : 'text-[#627068] hover:text-[#322821]'
                      }`}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-white border border-[#DDD6C8] hover:bg-[#F3EDE2] text-xs font-bold text-[#322821] flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In Báo Cáo Doanh Thu</span>
                </button>
              </div>
            </div>

            {/* 4 THẺ CHỈ SỐ KPI CHÍNH */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-5 rounded-3xl border border-[#DDD5C5] shadow-xs">
                <div className="text-xs font-bold text-[#69776E] mb-1 flex items-center justify-between">
                  <span>TỔNG DOANH THU ĐÃ THU</span>
                  <span className="p-1 rounded-lg bg-emerald-100 text-emerald-800">💰</span>
                </div>
                <div className="font-sans font-extrabold text-2xl text-[#322821]">
                  {formatVND(revenueStats.totalRevenue)}
                </div>
                <div className="text-[11px] text-emerald-700 mt-1 font-medium">
                  Từ {revenueStats.totalOrdersCount} đơn hoàn thành
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#DDD5C5] shadow-xs">
                <div className="text-xs font-bold text-[#69776E] mb-1 flex items-center justify-between">
                  <span>GIÁ TRỊ ĐƠN TRUNG BÌNH (AOV)</span>
                  <span className="p-1 rounded-lg bg-blue-100 text-blue-800">📈</span>
                </div>
                <div className="font-sans font-extrabold text-2xl text-blue-800">
                  {formatVND(revenueStats.aov)}
                </div>
                <div className="text-[11px] text-blue-600 mt-1 font-medium">
                  Mức chi tiêu trung bình / khách
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#DDD5C5] shadow-xs">
                <div className="text-xs font-bold text-[#69776E] mb-1 flex items-center justify-between">
                  <span>TIỀN MẶT VS CHUYỂN KHOẢN QR</span>
                  <span className="p-1 rounded-lg bg-purple-100 text-purple-800">💳</span>
                </div>
                <div className="text-xs space-y-1 font-mono font-bold mt-2">
                  <div className="flex justify-between text-emerald-800">
                    <span>💵 Tiền mặt:</span>
                    <span>{formatVND(revenueStats.cashTotal)}</span>
                  </div>
                  <div className="flex justify-between text-blue-800">
                    <span>📱 VietQR:</span>
                    <span>{formatVND(revenueStats.qrTotal)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#DDD5C5] shadow-xs">
                <div className="text-xs font-bold text-[#69776E] mb-1 flex items-center justify-between">
                  <span>ĐƠN CHỜ THANH TOÁN (TẠI BÀN)</span>
                  <span className="p-1 rounded-lg bg-amber-100 text-amber-800">⏳</span>
                </div>
                <div className="font-sans font-extrabold text-2xl text-amber-800">
                  {formatVND(revenueStats.unpaidRevenue)}
                </div>
                <div className="text-[11px] text-amber-700 mt-1 font-medium">
                  {revenueStats.unpaidCount} bàn đang ngồi chưa tính tiền
                </div>
              </div>
            </div>

            {/* CƠ CẤU BÁN HÀNG & TOP MÓN BÁN CHẠY */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-8">
              
              {/* TOP MÓN BÁN CHẠY NHẤT (7 CỘT) */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#DDD5C5] shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-display font-bold text-base text-[#322821] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#D95829]" />
                    <span>Top Sản Phẩm Bán Chạy Nhất</span>
                  </h4>
                  <span className="text-xs text-[#7A8780]">Xếp theo số ly</span>
                </div>

                <div className="space-y-3">
                  {revenueStats.topItems.slice(0, 6).map((item, idx) => {
                    const maxQty = revenueStats.topItems[0]?.qty || 1;
                    const percent = Math.round((item.qty / maxQty) * 100);

                    return (
                      <div key={item.name} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                              idx === 0 ? 'bg-yellow-400 text-yellow-950' : idx === 1 ? 'bg-slate-300 text-slate-800' : 'bg-[#FAF7F2] text-[#69776E]'
                            }`}>
                              {idx + 1}
                            </span>
                            <span className="font-bold text-[#322821]">{item.name}</span>
                          </div>
                          <div className="font-sans font-bold text-[#D95829]">
                            {item.qty} ly • {formatVND(item.revenue)}
                          </div>
                        </div>

                        {/* Thanh tỷ trọng */}
                        <div className="w-full bg-[#FAF7F2] h-2 rounded-full overflow-hidden border border-[#EAE3D2]">
                          <div
                            className="bg-[#322821] h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CƠ CẤU PHỤC VỤ (5 CỘT) */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#DDD5C5] shadow-xs flex flex-col justify-between">
                <div>
                  <h4 className="font-display font-bold text-base text-[#322821] mb-4">
                    Cơ Cấu Hình Thức Phục Vụ
                  </h4>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D2] flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🪑</span>
                        <div>
                          <div className="font-bold text-[#322821]">Ngồi Tại Bàn (Dine-in)</div>
                          <div className="text-[10px] text-[#7A8780]">Khách uống tại 12 bàn</div>
                        </div>
                      </div>
                      <strong className="font-sans text-sm text-[#322821]">
                        {formatVND(revenueStats.dineInTotal)}
                      </strong>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D2] flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🛵</span>
                        <div>
                          <div className="font-bold text-[#322821]">Giao Đi & Mang Về (Takeaway)</div>
                          <div className="text-[10px] text-[#7A8780]">Khách mang đi hoặc ship</div>
                        </div>
                      </div>
                      <strong className="font-sans text-sm text-[#322821]">
                        {formatVND(revenueStats.deliveryTotal)}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                  💡 <strong>Gợi ý kinh doanh:</strong> Khách ngồi tại bàn chiếm tỷ trọng lớn, nên tích cực đặt tem QR mica để khách tự gọi thêm topping và tích điểm thành viên.
                </div>
              </div>
            </div>

            {/* BẢNG LỊCH SỬ GIAO DỊCH HOÁ ĐƠN CHI TIẾT */}
            <div className="bg-white rounded-3xl border border-[#DDD5C5] overflow-hidden shadow-xs">
              <div className="p-4 bg-[#FAF7F2] border-b border-[#DDD5C5] font-bold text-xs uppercase tracking-wider text-[#6A7870] flex items-center justify-between">
                <span>Nhật Ký Hóa Đơn & Giao Dịch Gần Đây ({orders.length} đơn)</span>
                <span className="text-[11px] font-normal normal-case text-[#7A8780]">Cập nhật realtime</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2]/60 text-[#718077] border-b border-[#F0EAE0]">
                    <tr>
                      <th className="p-3 font-semibold">Mã Đơn</th>
                      <th className="p-3 font-semibold">Thời Gian</th>
                      <th className="p-3 font-semibold">Khách Hàng / Bàn</th>
                      <th className="p-3 font-semibold">Món Đã Gọi</th>
                      <th className="p-3 font-semibold">Thanh Toán</th>
                      <th className="p-3 font-semibold">Tổng Tiền</th>
                      <th className="p-3 font-semibold text-right">In Bill</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EAE0]">
                    {orders.slice(0, 15).map((o) => (
                      <tr key={o.id} className="hover:bg-[#FDFBF7]">
                        <td className="p-3 font-mono font-bold text-[#322821]">#{o.orderNumber}</td>
                        <td className="p-3 text-[#6A7870] font-mono">{o.createdAt}</td>
                        <td className="p-3">
                          <div className="font-bold text-[#322821]">{o.customer.name}</div>
                          <div className="text-[11px] text-[#7A8780]">{o.tableNumber || (o.orderType === 'delivery' ? 'Giao tận nơi' : 'Mang về')}</div>
                        </td>
                        <td className="p-3 max-w-xs truncate text-[#44524A]">
                          {o.items.map(it => `${it.quantity}x ${it.tea.name}`).join(', ')}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            o.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {o.paymentStatus === 'paid' ? 'Đã thu tiền' : 'Chưa thanh toán'}
                          </span>
                        </td>
                        <td className="p-3 font-sans font-bold text-[#D95829]">{formatVND(o.total)}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setPrintingOrder(o)}
                            className="p-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#EAE3D2] text-[#322821] border border-[#DDD6C8]"
                            title="In lại hóa đơn K80"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: NHÂN VIÊN & PHÂN QUYỀN (STAFF & PERMISSIONS)      */}
        {/* ======================================================== */}
        {activeTab === 'staff' && (
          <div>
            {/* Header Quản Lý Nhân Viên */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="font-display font-bold text-2xl text-[#322821]">
                  Quản Lý Nhân Sự, Phân Vai Cấp & Cấp Mã Code
                </h3>
                <p className="text-xs text-[#6B7870]">
                  Thiết lập tài khoản riêng cho từng nhân viên và định rõ quyền hạn truy cập hệ thống
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingStaff(null);
                    setIsStaffModalOpen(true);
                    playClickSound(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#322821] hover:bg-[#211A15] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all"
                >
                  <Plus className="w-4 h-4 text-emerald-300" />
                  <span>Tạo Tài Khoản Nhân Viên</span>
                </button>
              </div>
            </div>

            {/* BẢNG PHÂN VAI CẤP ("CHI VAI CẤP AI CÓ THỂ VÀO PHẦN NÀO") */}
            <div className="bg-white rounded-3xl border border-[#DDD5C5] overflow-hidden shadow-xs mb-8">
              <div className="p-4 bg-[#FAF7F2] border-b border-[#DDD5C5]">
                <div className="font-display font-bold text-base text-[#322821] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#322821]" />
                  <span>Bảng Phân Quyền Vai Trò ("Chi Vai Cấp Ai Có Thể Vào Phần Nào")</span>
                </div>
                <p className="text-[11px] text-[#69776E] mt-0.5">
                  Quy định bảo mật hệ thống: Nhân viên đăng nhập bằng mã PIN chỉ được truy cập các màn hình theo đúng vai trò
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2]/60 text-[#55635B] border-b border-[#F0EAE0]">
                    <tr>
                      <th className="p-3.5 font-bold">Chức Năng / Màn Hình</th>
                      <th className="p-3.5 font-bold text-center bg-emerald-50 text-[#322821]">
                        Chủ Quán / Admin
                      </th>
                      <th className="p-3.5 font-bold text-center bg-blue-50 text-blue-900">
                        Thu Ngân Quầy (Cashier)
                      </th>
                      <th className="p-3.5 font-bold text-center bg-amber-50 text-amber-900">
                        Pha Chế / Bếp (Barista)
                      </th>
                      <th className="p-3.5 font-bold">Mô Tả Quyền Hạn</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EAE0]">
                    {STAFF_PERMISSIONS.map((perm) => (
                      <tr key={perm.id} className="hover:bg-[#FDFBF7]">
                        <td className="p-3.5 font-bold text-[#322821]">{perm.name}</td>
                        <td className="p-3.5 text-center bg-emerald-50/50">
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">
                            <Check className="w-3 h-3" /> Toàn Quyền
                          </span>
                        </td>
                        <td className="p-3.5 text-center bg-blue-50/50">
                          {perm.allowedRoles.includes('cashier') ? (
                            <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full text-[10px]">
                              <Check className="w-3 h-3" /> Được Phép
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full text-[10px]">
                              <X className="w-3 h-3" /> Bị Khóa
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-center bg-amber-50/50">
                          {perm.allowedRoles.includes('barista') ? (
                            <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full text-[10px]">
                              <Check className="w-3 h-3" /> Được Phép
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full text-[10px]">
                              <X className="w-3 h-3" /> Bị Khóa
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-[#5C6B61]">{perm.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* DANH SÁCH TÀI KHOẢN NHÂN VIÊN VÀ MÃ PIN */}
            <div className="bg-white rounded-3xl border border-[#DDD5C5] overflow-hidden shadow-xs mb-8">
              <div className="p-4 bg-[#FAF7F2] border-b border-[#DDD5C5] font-bold text-xs uppercase tracking-wider text-[#6A7870] flex items-center justify-between">
                <span>Danh Sách Nhân Viên & Mã Số Code ({staffMembers.length} nhân sự)</span>
                <span className="text-[11px] font-normal normal-case text-[#7A8780]">Bấm mắt để xem mã PIN bảo mật</span>
              </div>

              <div className="divide-y divide-[#F0EAE0]">
                {staffMembers.map((staff) => {
                  const isPinVisible = Boolean(showStaffPins[staff.id]);
                  const activeShift = attendanceRecords.find(r => r.staffId === staff.id && r.status === 'in-shift');

                  return (
                    <div key={staff.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FDFBF7] transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{staff.avatar}</span>
                        <div>
                          <div className="font-bold text-sm text-[#322821] flex items-center gap-2">
                            <span>{staff.name}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                              staff.role === 'admin' 
                                ? 'bg-purple-100 text-purple-800' 
                                : staff.role === 'cashier' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {staff.roleTitle}
                            </span>
                            {activeShift && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 animate-pulse">
                                🟢 Đang Trong Ca
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[#7A8780] flex items-center gap-3 mt-0.5">
                            <span>Mã NV: <strong>{staff.id}</strong></span>
                            <span>SĐT: <strong>{staff.phone || 'Chưa cập nhật'}</strong></span>
                            <span>Lương: <strong>{new Intl.NumberFormat('vi-VN').format(staff.hourlyWage)}đ/h</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        {/* Mã PIN Code */}
                        <div className="bg-[#FAF7F2] border border-[#DDD6C8] px-3 py-1.5 rounded-xl flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-[#627068]">Mã PIN:</span>
                          <span className="font-mono font-bold text-xs text-[#D95829] tracking-widest">
                            {isPinVisible ? staff.code : '••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowStaffPins(prev => ({ ...prev, [staff.id]: !prev[staff.id] }))}
                            className="text-[#7A8780] hover:text-[#322821]"
                          >
                            {isPinVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* Nút sửa */}
                        <button
                          onClick={() => {
                            setEditingStaff(staff);
                            setIsStaffModalOpen(true);
                            playClickSound(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#EAE3D2] border border-[#DDD6C8] text-xs font-bold text-[#322821] flex items-center gap-1 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Sửa</span>
                        </button>

                        {/* Nút xóa (chỉ xóa nếu không phải admin) */}
                        {staff.role !== 'admin' && (
                          <button
                            onClick={() => {
                              if (confirm(`Xóa tài khoản nhân viên "${staff.name}"?`)) {
                                deleteStaffMember(staff.id);
                                playClickSound(true);
                              }
                            }}
                            className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                            title="Xóa nhân viên"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* NHẬT KÝ CHẤM CÔNG TOÀN QUÁN */}
            <div className="bg-white rounded-3xl border border-[#DDD5C5] overflow-hidden shadow-xs">
              <div className="p-4 bg-[#FAF7F2] border-b border-[#DDD5C5] font-bold text-xs uppercase tracking-wider text-[#6A7870] flex items-center justify-between">
                <span>Nhật Ký Chấm Công & Giờ Làm ({attendanceRecords.length} phiên ca)</span>
                <span className="text-[11px] normal-case text-[#7A8780]">Ghi nhận tự động khi nhân viên bấm Vào/Ra ca</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2]/60 text-[#718077] border-b border-[#F0EAE0]">
                    <tr>
                      <th className="p-3 font-semibold">Nhân Viên</th>
                      <th className="p-3 font-semibold">Vai Trò</th>
                      <th className="p-3 font-semibold">Ngày Làm</th>
                      <th className="p-3 font-semibold">Giờ Vào Ca</th>
                      <th className="p-3 font-semibold">Giờ Ra Ca</th>
                      <th className="p-3 font-semibold">Trạng Thái</th>
                      <th className="p-3 font-semibold">Số Đơn Quầy</th>
                      <th className="p-3 font-semibold">Ghi Chú</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EAE0]">
                    {attendanceRecords.map((rec) => (
                      <tr key={rec.id} className="hover:bg-[#FDFBF7]">
                        <td className="p-3 font-bold text-[#322821]">
                          {rec.staffName} <span className="font-mono text-[10px] text-[#D95829]">[{rec.staffCode}]</span>
                        </td>
                        <td className="p-3 text-[#6A7870]">{rec.roleTitle}</td>
                        <td className="p-3 font-mono">{rec.date}</td>
                        <td className="p-3 font-mono text-emerald-700 font-bold">{rec.checkInTime}</td>
                        <td className="p-3 font-mono text-orange-700 font-bold">{rec.checkOutTime || '—'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            rec.status === 'in-shift' ? 'bg-emerald-100 text-emerald-800 animate-pulse' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {rec.status === 'in-shift' ? 'Đang Trong Ca' : 'Đã Hoàn Thành'}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-[#322821]">{rec.ordersHandled || 0} đơn</td>
                        <td className="p-3 text-[#627068] italic">{rec.note || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 7: CHẤM CÔNG ĐỨNG QUẦY (ATTENDANCE CLOCK)            */}
        {/* ======================================================== */}
        {activeTab === 'attendance' && (
          <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-[#DDD5C5] shadow-md text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#F5EFE9] text-[#322821] flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Clock className="w-7 h-7 text-[#322821]" />
            </div>

            <h3 className="font-display font-bold text-2xl text-[#322821]">
              Chấm Công Đứng Quầy Bằng Mã Code
            </h3>
            <p className="text-xs text-[#6F7D74] mt-1 mb-5">
              Ghi nhận thời gian vào ca và kết thúc ca làm việc của bạn
            </p>

            {/* Nhập mã nhân viên */}
            <div className="max-w-xs mx-auto mb-5">
              <label className="block text-xs font-bold text-[#35423A] mb-1.5 text-left">
                Nhập Mã Số Nhân Viên (4 Chữ Số):
              </label>
              <input
                type="text"
                maxLength={6}
                value={clockInPin}
                onChange={(e) => {
                  setClockInPin(e.target.value);
                  setAttendanceMessage(null);
                }}
                placeholder="VD: 1001"
                className="w-full bg-[#FAF7F2] border border-[#DDD6C8] rounded-2xl px-4 py-2.5 text-center font-mono font-extrabold text-2xl text-[#D95829] tracking-widest focus:outline-none focus:border-[#322821]"
              />

              {/* Thông báo kết quả */}
              {attendanceMessage && (
                <div className={`mt-3 p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
                  attendanceMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {attendanceMessage.type === 'success' ? <Check className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                  <span>{attendanceMessage.text}</span>
                </div>
              )}
            </div>

            {/* 2 Nút Bấm Lớn: VÀO CA & RA CA */}
            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mb-6">
              <button
                onClick={() => {
                  if (!clockInPin.trim()) return;
                  const res = clockIn(clockInPin);
                  if (res.success) {
                    playSuccessSound(true);
                    setAttendanceMessage({ type: 'success', text: res.message });
                  } else {
                    setAttendanceMessage({ type: 'error', text: res.message });
                  }
                }}
                className="py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <UserCheck className="w-4 h-4" />
                <span>VÀO CA (IN)</span>
              </button>

              <button
                onClick={() => {
                  if (!clockInPin.trim()) return;
                  const res = clockOut(clockInPin);
                  if (res.success) {
                    playSuccessSound(true);
                    setAttendanceMessage({ type: 'success', text: res.message });
                  } else {
                    setAttendanceMessage({ type: 'error', text: res.message });
                  }
                }}
                className="py-3.5 rounded-2xl bg-[#D95829] hover:bg-[#B7451E] text-white font-bold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Clock className="w-4 h-4" />
                <span>RA CA (OUT)</span>
              </button>
            </div>

            {/* Danh sách gợi ý mã nhân viên */}
            <div className="pt-4 border-t border-[#F0EAE0] text-left">
              <div className="text-[11px] font-bold text-[#627068] mb-2">
                Chọn Nhanh Tài Khoản Nhân Viên:
              </div>
              <div className="grid grid-cols-2 gap-2">
                {staffMembers.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setClockInPin(s.code);
                      setAttendanceMessage(null);
                      playClickSound(true);
                    }}
                    className={`p-2 rounded-xl text-left border transition-all ${
                      clockInPin === s.code ? 'border-[#322821] bg-[#F5EFE9]' : 'border-[#EAE3D2] bg-[#FAF7F2]'
                    }`}
                  >
                    <div className="font-bold text-xs text-[#322821]">{s.name}</div>
                    <div className="text-[10px] text-[#7A8780] flex justify-between">
                      <span>{s.roleTitle}</span>
                      <strong className="font-mono text-[#D95829]">[{s.code}]</strong>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* POPUP THU TIỀN MẶT QUẦY */}
      {showCashModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="fixed inset-0" onClick={() => setShowCashModal(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl z-10 border border-[#DDD5C5]">
            <h3 className="font-display font-bold text-lg text-[#322821] mb-3">
              Thu Tiền Mặt Tại Quầy
            </h3>

            <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#DDD6C8] mb-4 text-xs">
              <div className="flex justify-between mb-1">
                <span>Tổng tiền cần thu:</span>
                <strong className="text-sm font-sans text-[#D95829]">{formatVND(posGrandTotal)}</strong>
              </div>
              <div className="flex justify-between text-[#55635B]">
                <span>Phục vụ:</span>
                <span>{posServingType === 'dine-in' ? posTableNumber : 'Mang về'}</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-[#35423A] mb-1">
                Tiền khách đưa:
              </label>
              <input
                type="number"
                step="1000"
                value={cashTendered}
                onChange={(e) => setCashTendered(Number(e.target.value))}
                className="w-full bg-[#FAF7F2] border border-[#DDD6C8] rounded-xl px-3.5 py-2 text-base font-bold font-sans text-[#322821] focus:outline-none focus:border-[#322821]"
              />

              {/* Nút tiền chẵn nhanh */}
              <div className="flex items-center gap-1.5 mt-2">
                {[50000, 100000, 200000, 500000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCashTendered(amt)}
                    className="flex-1 py-1 rounded-lg bg-[#FAF7F2] border border-[#DDD6C8] text-[11px] font-bold text-[#45524A] hover:bg-[#EAE3D2]"
                  >
                    {amt / 1000}k
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs mb-5 flex justify-between items-center">
              <span className="font-bold text-emerald-900">Tiền thừa trả khách:</span>
              <strong className="text-base font-sans text-emerald-700">
                {formatVND(Math.max(0, cashTendered - posGrandTotal))}
              </strong>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowCashModal(false)}
                className="w-1/3 py-2.5 rounded-xl border border-[#DDD6C8] text-xs font-bold text-[#55635B]"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleCompleteCashPayment}
                className="flex-1 py-2.5 rounded-xl bg-[#322821] hover:bg-[#211A15] text-white font-bold text-xs uppercase shadow-md flex items-center justify-center gap-1"
              >
                <Check className="w-4 h-4" />
                <span>Xác Nhận & In Bill</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP QUÉT VIETQR QUẦY */}
      {showQrModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="fixed inset-0" onClick={() => setShowQrModal(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl z-10 border border-[#DDD5C5] text-center">
            <h3 className="font-display font-bold text-lg text-[#322821]">
              Quét Mã VietQR Chuyển Khoản
            </h3>
            <p className="text-xs text-[#6F7D74] mt-0.5">
              Khách dùng App Ngân hàng hoặc MoMo quét mã
            </p>

            <div className="w-48 h-48 mx-auto my-4 bg-white p-2 rounded-2xl border border-[#DDD6C8] shadow-sm flex items-center justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=2|99|0908886688|THUONG%20TEA||0|0|${posGrandTotal}|Thanh%20toan%20don%20hang|transfer_myqr`}
                alt="Mã VietQR"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="font-sans font-extrabold text-xl text-[#D95829] mb-4">
              {formatVND(posGrandTotal)}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="w-1/3 py-2.5 rounded-xl border border-[#DDD6C8] text-xs font-bold text-[#55635B]"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleCompleteVietQrPayment}
                className="flex-1 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs uppercase shadow-md flex items-center justify-center gap-1"
              >
                <Check className="w-4 h-4" />
                <span>Đã Nhận Tiền ➔ In Bill</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL IN HÓA ĐƠN NHIỆT K80 */}
      <ReceiptPrintModal
        order={printingOrder}
        isOpen={printingOrder !== null}
        onClose={() => setPrintingOrder(null)}
      />

      {/* MODAL QUẢN LÝ MÃ QR BÀN */}
      <TableQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        onSimulateScan={(tableId) => {
          setIsQrModalOpen(false);
          onSimulateScanTable(tableId);
        }}
      />

      {/* MODAL THÊM / SỬA SẢN PHẨM MENU */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        initialProduct={editingProduct}
        onSave={(savedProduct) => {
          if (editingProduct) {
            updateProduct(savedProduct.id, savedProduct);
          } else {
            addProduct(savedProduct);
          }
        }}
      />

      {/* MODAL TẠO / SỬA TÀI KHOẢN NHÂN VIÊN */}
      <StaffFormModal
        isOpen={isStaffModalOpen}
        onClose={() => {
          setIsStaffModalOpen(false);
          setEditingStaff(null);
        }}
        initialStaff={editingStaff}
        onSave={(savedStaff) => {
          if (editingStaff) {
            updateStaffMember(savedStaff.id, savedStaff);
          } else {
            addStaffMember(savedStaff);
          }
        }}
      />

      {/* MODAL THÊM / SỬA TOPPING & PHỤ LIỆU */}
      <ToppingFormModal
        isOpen={isToppingModalOpen}
        onClose={() => {
          setIsToppingModalOpen(false);
          setEditingTopping(null);
        }}
        initialTopping={editingTopping}
        onSave={(savedTopping) => {
          if (editingTopping) {
            updateTopping(savedTopping.id, savedTopping);
          } else {
            addTopping(savedTopping);
          }
        }}
      />

      {/* MODAL THÊM / SỬA BÀN ĂN & SƠ ĐỒ BÀN */}
      <TableFormModal
        isOpen={isTableModalOpen}
        onClose={() => {
          setIsTableModalOpen(false);
          setEditingTable(null);
        }}
        initialTable={editingTable}
        existingTables={tables}
        onSave={(savedTable) => {
          if (editingTable) {
            updateTable(savedTable.id, savedTable);
          } else {
            addTable(savedTable);
          }
        }}
      />

      {/* MODAL CHUYỂN ĐỔI NHÂN VIÊN TRỰC QUẦY */}
      {isStaffSwitcherOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="fixed inset-0" onClick={() => setIsStaffSwitcherOpen(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl z-10 border border-[#DDD5C5]">
            <h3 className="font-display font-bold text-lg text-[#322821] mb-2 text-center">
              Chuyển Đổi Nhân Viên Trực Quầy
            </h3>
            <p className="text-xs text-[#7A8780] text-center mb-4">
              Chọn tài khoản nhân viên để chuyển ca làm việc
            </p>

            <div className="space-y-2 mb-4">
              {staffMembers.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    loginStaff(s.code);
                    setIsStaffSwitcherOpen(false);
                    playSuccessSound(true);
                  }}
                  className={`w-full p-2.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                    currentStaff?.id === s.id ? 'border-[#322821] bg-[#F5EFE9]' : 'border-[#EAE3D2] bg-[#FAF7F2] hover:bg-[#F3EDE2]'
                  }`}
                >
                  <span className="text-2xl">{s.avatar}</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-[#322821]">{s.name}</div>
                    <div className="text-[10px] text-[#7A8780] flex justify-between">
                      <span>{s.roleTitle}</span>
                      <span className="font-mono font-bold text-[#D95829]">[{s.code}]</span>
                    </div>
                  </div>
                  {currentStaff?.id === s.id && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsStaffSwitcherOpen(false)}
              className="w-full py-2 rounded-xl border border-[#DDD6C8] text-xs font-bold text-[#627068]"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* MODAL CHECK ĐƠN & NHẬN ĐƠN CHI TIẾT */}
      {checkOrderModal && (
        <div className="fixed inset-0 z-[260] flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm animate-fade-in">
          <div 
            className="fixed inset-0" 
            onClick={() => {
              stopPosRingtone();
              setCheckOrderModal(null);
            }} 
          />
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 shadow-2xl z-10 border border-[#DDD5C5] max-h-[92vh] flex flex-col">
            
            {/* Tiêu đề Modal */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#F0EAE0]">
              <div className="flex items-center gap-2.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
                  <Bell className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-extrabold text-base sm:text-lg text-[#322821]">
                      CHECK ĐƠN #{checkOrderModal.orderNumber}
                    </h3>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      checkOrderModal.paymentStatus === 'paid' || checkOrderModal.customer.paymentMethod === 'vietqr'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}>
                      {checkOrderModal.paymentStatus === 'paid' || checkOrderModal.customer.paymentMethod === 'vietqr'
                        ? '✅ ĐÃ CHUYỂN KHOẢN (VIETQR)'
                        : '🟠 CHƯA THANH TOÁN (TRẢ SAU)'}
                    </span>
                    {checkOrderModal.checked ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        ✔ ĐÃ CHECK
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white animate-pulse">
                        🔔 CHỜ CHECK
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#69776E] flex items-center gap-2 mt-0.5 font-medium">
                    <span className="font-bold text-[#322821]">
                      {checkOrderModal.tableNumber || (checkOrderModal.orderType === 'dine-in' ? 'Tại Quán' : 'Mang Về / Giao Hàng')}
                    </span>
                    <span>•</span>
                    <span>{checkOrderModal.createdAt}</span>
                    <span>•</span>
                    <span className="font-mono text-[11px] text-stone-500">[{checkOrderModal.id}]</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  stopPosRingtone();
                  setCheckOrderModal(null);
                }}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                title="Đóng cửa sổ"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thông tin khách hàng & Ghi chú */}
            <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#DDD6C8] my-3 text-xs space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[#69776E]">Khách hàng:</span>
                <strong className="text-[#322821] text-sm">{checkOrderModal.customer.name}</strong>
              </div>
              {checkOrderModal.customer.phone && (
                <div className="flex justify-between items-center">
                  <span className="text-[#69776E]">Số điện thoại:</span>
                  <span className="font-mono font-bold text-[#322821]">{checkOrderModal.customer.phone}</span>
                </div>
              )}
              {checkOrderModal.customer.note && (
                <div className="pt-1.5 border-t border-black/5 flex items-start gap-1 text-amber-900 bg-amber-50/70 p-2 rounded-xl mt-1">
                  <span className="font-bold shrink-0">Ghi chú khách:</span>
                  <span className="italic">{checkOrderModal.customer.note}</span>
                </div>
              )}
            </div>

            {/* Danh sách món gọi */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 mb-3 max-h-[35vh]">
              <div className="text-[11px] font-bold text-[#69776E] uppercase tracking-wider flex justify-between">
                <span>Danh Sách Món ({checkOrderModal.items.reduce((s, i) => s + i.quantity, 0)} ly)</span>
                <span>Thành tiền</span>
              </div>
              {checkOrderModal.items.map((it, idx) => (
                <div key={idx} className="p-2.5 rounded-2xl bg-white border border-[#EAE3D2] flex items-center justify-between gap-3 text-xs shadow-2xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-7 h-7 rounded-xl bg-[#322821] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                      {it.quantity}x
                    </span>
                    <div className="min-w-0">
                      <div className="font-bold text-[#222B25] truncate">
                        {it.tea.name}
                        <span className="ml-1 text-[11px] text-amber-800 font-semibold">({it.size})</span>
                      </div>
                      <div className="text-[11px] text-[#69776E]">
                        {it.ice} đá • {it.sugar} đường
                        {it.toppings && it.toppings.length > 0 && ` • +${it.toppings.map(t => t.name).join(', ')}`}
                      </div>
                    </div>
                  </div>
                  <div className="font-sans font-bold text-[#D95829] shrink-0 text-right">
                    {formatVND(it.totalPrice)}
                  </div>
                </div>
              ))}
            </div>

            {/* Tổng số tiền */}
            <div className="pt-3 border-t border-[#F0EAE0] flex justify-between items-center mb-4 bg-stone-50/80 p-3 rounded-2xl">
              <div>
                <span className="text-[11px] text-[#69776E] block font-medium">Tổng tiền thanh toán:</span>
                <span className="text-xl font-sans font-black text-[#D95829]">
                  {formatVND(checkOrderModal.total)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-stone-500 block">Hình thức thanh toán:</span>
                <span className="text-xs font-bold text-[#322821] flex items-center gap-1 justify-end">
                  {checkOrderModal.paymentStatus === 'paid' || checkOrderModal.customer.paymentMethod === 'vietqr' ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      <span className="text-emerald-800">Chuyển khoản VietQR</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                      <span className="text-amber-800">Tiền mặt trả sau</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Các nút hành động Check Đơn */}
            <div className="space-y-2">
              {checkOrderModal.paymentStatus === 'paid' || checkOrderModal.customer.paymentMethod === 'vietqr' ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* NÚT CHÍNH: IN BILL & NHẬN ĐƠN */}
                    <button
                      type="button"
                      onClick={() => {
                        stopPosRingtone();
                        markOrderAsChecked(checkOrderModal.id);
                        setPrintingOrder(checkOrderModal);
                        setCheckOrderModal(null);
                        playSuccessSound(true);
                      }}
                      className="py-3 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs uppercase shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>🖨️ In Bill & Nhận Đơn</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        stopPosRingtone();
                        markOrderAsChecked(checkOrderModal.id);
                        setCheckOrderModal(null);
                        playSuccessSound(true);
                      }}
                      className="py-3 px-3 rounded-xl bg-[#322821] hover:bg-[#211A15] text-white font-bold text-xs uppercase shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Nhận Đơn (Chuyển Bếp)</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      stopPosRingtone();
                      markOrderAsChecked(checkOrderModal.id);
                      handleLoadTableOrderToPos(checkOrderModal);
                      setCheckOrderModal(null);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#FAF7F2] hover:bg-[#EAE3D2] border border-[#DDD6C8] text-[#322821] font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Nạp Vào Quầy POS Quản Lý</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      stopPosRingtone();
                      markOrderAsChecked(checkOrderModal.id);
                      setCheckOrderModal(null);
                      playSuccessSound(true);
                    }}
                    className="py-3 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Nhận Đơn (Chuyển Bếp)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      stopPosRingtone();
                      markOrderAsChecked(checkOrderModal.id);
                      handleLoadTableOrderToPos(checkOrderModal);
                      setCheckOrderModal(null);
                    }}
                    className="py-3 px-3 rounded-xl bg-[#322821] hover:bg-[#211A15] text-white font-bold text-xs uppercase shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-amber-300" />
                    <span>Nạp Vào Quầy POS Thu Tiền</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* MODAL / TRUNG TÂM ĐIỀU PHỐI & CHECK ĐƠN HÀNG TOÀN HỆ THỐNG (QUY TRÌNH 4 BƯỚC F&B) */}
      {showCheckOrderDrawer && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-md animate-fade-in">
          <div 
            className="fixed inset-0" 
            onClick={() => setShowCheckOrderDrawer(false)} 
          />
          <div className="relative w-full max-w-7xl h-[94vh] max-h-[96vh] bg-[#FAF7F2] rounded-3xl p-4 sm:p-6 shadow-2xl z-10 border border-[#DDD5C5] flex flex-col overflow-hidden">
            {/* HEADER MODAL */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE3D2] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
                  <PackageCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-extrabold text-xl sm:text-2xl text-[#322821]">
                      Trung Tâm Điều Phối & Check Đơn Hàng
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#322821] text-amber-200 text-xs font-bold">
                      {orders.length} đơn hệ thống
                    </span>
                    {uncheckedOrders.length > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full bg-red-500 text-white text-xs font-extrabold animate-pulse">
                        🔔 {uncheckedOrders.length} đơn mới cần duyệt
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#69776E] mt-0.5">
                    Quy trình 4 bước chuẩn F&B: 🔔 Chờ Duyệt ➔ 👨‍🍳 Bếp Pha Chế ➔ 🍹 Sẵn Sàng Phục Vụ ➔ ✅ Hoàn Tất
                  </p>
                </div>
              </div>

              {/* ACTION TOOLBAR TRÊN HEADER */}
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                {uncheckedOrders.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      stopPosRingtone();
                      playSuccessSound(true);
                      uncheckedOrders.forEach(o => markOrderAsChecked(o.id));
                    }}
                    className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer transition-all"
                    title="Xác nhận duyệt toàn bộ đơn hàng đang chờ duyệt"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span>Duyệt Nhanh Tất Cả ({uncheckedOrders.length})</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    playClickSound(true);
                    clearDuplicateOrders();
                  }}
                  className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                  title="Dọn dẹp các đơn hàng trùng lặp số đơn hoặc trùng dữ liệu"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
                  <span>Dọn Đơn Trùng</span>
                </button>

                {/* VIEW MODE SWITCHER */}
                <div className="flex items-center bg-stone-200/80 p-0.5 rounded-xl border border-stone-300">
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound(true);
                      setCheckDrawerViewMode('grid');
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                      checkDrawerViewMode === 'grid'
                        ? 'bg-white text-[#322821] shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                    title="Chế độ Lưới Thẻ To Chi Tiết"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Lưới Thẻ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound(true);
                      setCheckDrawerViewMode('kanban');
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                      checkDrawerViewMode === 'kanban'
                        ? 'bg-white text-[#322821] shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                    title="Chế độ Bảng Quy Trình Kanban 4 Cột"
                  >
                    <Columns3 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Kanban 4 Cột</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCheckOrderDrawer(false)}
                  className="p-2 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-stone-200/60 transition-all cursor-pointer"
                  title="Đóng cửa sổ"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* QUY TRÌNH PIPELINE 4 BƯỚC VẬN HÀNH */}
            <div className="py-2.5 border-b border-[#EAE3D2] shrink-0">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {/* BƯỚC 1: CHỜ DUYỆT */}
                <button
                  type="button"
                  onClick={() => {
                    playClickSound(true);
                    setCheckDrawerTab('pending');
                  }}
                  className={`p-2.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                    checkDrawerTab === 'pending'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-300'
                      : 'bg-white/90 text-stone-700 border-stone-200 hover:border-amber-400 hover:bg-amber-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
                      <Bell className="w-3.5 h-3.5" />
                      Bước 1: Chờ Duyệt
                    </span>
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                      checkDrawerTab === 'pending'
                        ? 'bg-white text-amber-600'
                        : uncheckedOrders.length > 0
                        ? 'bg-amber-500 text-white animate-pulse'
                        : 'bg-stone-100 text-stone-600'
                    }`}>
                      {uncheckedOrders.length}
                    </span>
                  </div>
                  <div className={`text-[10px] mt-1 ${checkDrawerTab === 'pending' ? 'text-amber-100' : 'text-stone-500'}`}>
                    Đơn mới từ bàn / online
                  </div>
                </button>

                {/* BƯỚC 2: BẾP ĐANG PHA CHẾ */}
                <button
                  type="button"
                  onClick={() => {
                    playClickSound(true);
                    setCheckDrawerTab('preparing');
                  }}
                  className={`p-2.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                    checkDrawerTab === 'preparing'
                      ? 'bg-blue-600 text-white border-blue-700 shadow-md ring-2 ring-blue-300'
                      : 'bg-white/90 text-stone-700 border-stone-200 hover:border-blue-400 hover:bg-blue-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
                      <ChefHat className="w-3.5 h-3.5" />
                      Bước 2: Bếp Pha Chế
                    </span>
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                      checkDrawerTab === 'preparing'
                        ? 'bg-white text-blue-600'
                        : preparingOrders.length > 0
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-stone-100 text-stone-600'
                    }`}>
                      {preparingOrders.length}
                    </span>
                  </div>
                  <div className={`text-[10px] mt-1 ${checkDrawerTab === 'preparing' ? 'text-blue-100' : 'text-stone-500'}`}>
                    Barista đang làm món
                  </div>
                </button>

                {/* BƯỚC 3: SẴN SÀNG PHỤC VỤ */}
                <button
                  type="button"
                  onClick={() => {
                    playClickSound(true);
                    setCheckDrawerTab('ready');
                  }}
                  className={`p-2.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                    checkDrawerTab === 'ready'
                      ? 'bg-purple-600 text-white border-purple-700 shadow-md ring-2 ring-purple-300'
                      : 'bg-white/90 text-stone-700 border-stone-200 hover:border-purple-400 hover:bg-purple-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
                      <Coffee className="w-3.5 h-3.5" />
                      Bước 3: Sẵn Sàng
                    </span>
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                      checkDrawerTab === 'ready'
                        ? 'bg-white text-purple-600'
                        : readyOrders.length > 0
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-stone-100 text-stone-600'
                    }`}>
                      {readyOrders.length}
                    </span>
                  </div>
                  <div className={`text-[10px] mt-1 ${checkDrawerTab === 'ready' ? 'text-purple-100' : 'text-stone-500'}`}>
                    Chờ bưng bàn / giao shipper
                  </div>
                </button>

                {/* BƯỚC 4: HOÀN TẤT */}
                <button
                  type="button"
                  onClick={() => {
                    playClickSound(true);
                    setCheckDrawerTab('completed');
                  }}
                  className={`p-2.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                    checkDrawerTab === 'completed'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300'
                      : 'bg-white/90 text-stone-700 border-stone-200 hover:border-emerald-400 hover:bg-emerald-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Bước 4: Hoàn Tất
                    </span>
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                      checkDrawerTab === 'completed'
                        ? 'bg-white text-emerald-600'
                        : completedOrders.length > 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-100 text-stone-600'
                    }`}>
                      {completedOrders.length}
                    </span>
                  </div>
                  <div className={`text-[10px] mt-1 ${checkDrawerTab === 'completed' ? 'text-emerald-100' : 'text-stone-500'}`}>
                    Đã thanh toán & phục vụ
                  </div>
                </button>

                {/* TẤT CẢ ĐƠN HÀNG */}
                <button
                  type="button"
                  onClick={() => {
                    playClickSound(true);
                    setCheckDrawerTab('all');
                  }}
                  className={`p-2.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between col-span-2 sm:col-span-1 ${
                    checkDrawerTab === 'all'
                      ? 'bg-[#322821] text-white border-stone-900 shadow-md ring-2 ring-amber-300'
                      : 'bg-white/90 text-stone-700 border-stone-200 hover:border-stone-400 hover:bg-stone-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider">
                      Tất Cả Đơn
                    </span>
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                      checkDrawerTab === 'all'
                        ? 'bg-amber-400 text-stone-900'
                        : 'bg-stone-200 text-stone-700'
                    }`}>
                      {orders.length}
                    </span>
                  </div>
                  <div className={`text-[10px] mt-1 ${checkDrawerTab === 'all' ? 'text-stone-300' : 'text-stone-500'}`}>
                    Toàn bộ đơn trong ca
                  </div>
                </button>
              </div>
            </div>

            {/* BỘ LỌC TÌM KIẾM & TIÊU CHÍ ĐƠN HÀNG */}
            <div className="py-2.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 shrink-0 border-b border-[#EAE3D2]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={checkDrawerSearch}
                  onChange={(e) => setCheckDrawerSearch(e.target.value)}
                  placeholder="Tìm theo số đơn (#042), số bàn, tên khách, số điện thoại, tên món..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-white border border-[#DDD5C5] text-xs text-[#322821] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
                {checkDrawerSearch && (
                  <button
                    type="button"
                    onClick={() => setCheckDrawerSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                {/* LỌC HÌNH THỨC PHỤC VỤ */}
                <div className="flex items-center bg-white p-1 rounded-xl border border-[#DDD5C5] shrink-0 text-xs">
                  <span className="text-[11px] font-bold text-stone-400 px-1.5">Hình thức:</span>
                  <button
                    type="button"
                    onClick={() => setCheckDrawerTypeFilter('all')}
                    className={`px-2 py-1 rounded-lg font-bold transition-all ${
                      checkDrawerTypeFilter === 'all'
                        ? 'bg-amber-100 text-amber-900'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    Tất cả
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckDrawerTypeFilter('dine-in')}
                    className={`px-2 py-1 rounded-lg font-bold transition-all ${
                      checkDrawerTypeFilter === 'dine-in'
                        ? 'bg-amber-100 text-amber-900'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    🪑 Tại Quán
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckDrawerTypeFilter('delivery')}
                    className={`px-2 py-1 rounded-lg font-bold transition-all ${
                      checkDrawerTypeFilter === 'delivery'
                        ? 'bg-amber-100 text-amber-900'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    🛵 Giao Hàng
                  </button>
                </div>

                {/* LỌC THANH TOÁN */}
                <div className="flex items-center bg-white p-1 rounded-xl border border-[#DDD5C5] shrink-0 text-xs">
                  <span className="text-[11px] font-bold text-stone-400 px-1.5">Thanh toán:</span>
                  <button
                    type="button"
                    onClick={() => setCheckDrawerPaymentFilter('all')}
                    className={`px-2 py-1 rounded-lg font-bold transition-all ${
                      checkDrawerPaymentFilter === 'all'
                        ? 'bg-amber-100 text-amber-900'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    Tất cả
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckDrawerPaymentFilter('paid')}
                    className={`px-2 py-1 rounded-lg font-bold transition-all ${
                      checkDrawerPaymentFilter === 'paid'
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    ✅ Đã TT
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckDrawerPaymentFilter('unpaid')}
                    className={`px-2 py-1 rounded-lg font-bold transition-all ${
                      checkDrawerPaymentFilter === 'unpaid'
                        ? 'bg-amber-100 text-amber-900'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    🟠 Chưa TT
                  </button>
                </div>
              </div>
            </div>

            {/* KHU VỰC HIỂN THỊ DANH SÁCH ĐƠN HÀNG (LƯỚI CHI TIẾT HOẶC KANBAN 4 CỘT) */}
            <div className="flex-1 overflow-y-auto py-3 pr-1">
              {(() => {
                // Áp dụng bộ lọc tìm kiếm và tiêu chí
                const filterFn = (o: PosOrder) => {
                  // Lọc theo loại phục vụ
                  if (checkDrawerTypeFilter === 'dine-in' && o.orderType !== 'dine-in') return false;
                  if (checkDrawerTypeFilter === 'delivery' && o.orderType !== 'delivery') return false;

                  // Lọc theo thanh toán
                  const isOrderPaid = o.paymentStatus === 'paid' || o.customer.paymentMethod === 'vietqr';
                  if (checkDrawerPaymentFilter === 'paid' && !isOrderPaid) return false;
                  if (checkDrawerPaymentFilter === 'unpaid' && isOrderPaid) return false;

                  // Tìm kiếm từ khóa
                  if (checkDrawerSearch.trim()) {
                    const q = checkDrawerSearch.toLowerCase().trim();
                    const matchNum = String(o.orderNumber).includes(q);
                    const matchTable = o.tableNumber && o.tableNumber.toLowerCase().includes(q);
                    const matchCustomer = o.customer.name && o.customer.name.toLowerCase().includes(q);
                    const matchPhone = o.customer.phone && o.customer.phone.includes(q);
                    const matchItems = o.items.some(it => it.tea.name.toLowerCase().includes(q));
                    if (!matchNum && !matchTable && !matchCustomer && !matchPhone && !matchItems) {
                      return false;
                    }
                  }
                  return true;
                };

                // CHẾ ĐỘ 1: KANBAN BOARD 4 CỘT THEO QUY TRÌNH
                if (checkDrawerViewMode === 'kanban') {
                  const col1 = uncheckedOrders.filter(filterFn);
                  const col2 = preparingOrders.filter(filterFn);
                  const col3 = readyOrders.filter(filterFn);
                  const col4 = completedOrders.filter(filterFn);

                  const renderKanbanCard = (o: PosOrder, step: 1 | 2 | 3 | 4) => {
                    const isPaid = o.paymentStatus === 'paid' || o.customer.paymentMethod === 'vietqr';
                    const isUnchecked = !o.checked && o.status === 'pending';

                    return (
                      <div
                        key={o.id}
                        className={`p-3.5 rounded-2xl border transition-all shadow-2xs hover:shadow-md bg-white ${
                          step === 1
                            ? 'border-amber-300 ring-1 ring-amber-300/60'
                            : step === 2
                            ? 'border-blue-200'
                            : step === 3
                            ? 'border-purple-200'
                            : 'border-emerald-200 bg-emerald-50/20'
                        }`}
                      >
                        {/* Header thẻ kanban */}
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-sm text-[#322821]">
                              #{o.orderNumber}
                            </span>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-800 border border-stone-200">
                              {o.tableNumber || (o.orderType === 'dine-in' ? 'Tại Quán' : 'Giao Hàng')}
                            </span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}>
                            {isPaid ? '✅ Đã TT' : '🟠 Chưa TT'}
                          </span>
                        </div>

                        {/* Thông tin khách hàng & thời gian */}
                        <div className="flex items-center justify-between text-[11px] text-stone-500 mb-2">
                          <span className="truncate max-w-[130px]">
                            {o.customer.name} {o.customer.phone && `(${o.customer.phone})`}
                          </span>
                          <span className="flex items-center gap-0.5 text-[10px]">
                            <Clock className="w-3 h-3 text-stone-400" />
                            {o.createdAt}
                          </span>
                        </div>

                        {/* Danh sách món tóm tắt */}
                        <div className="bg-[#FAF7F2] rounded-xl p-2 mb-2 space-y-1 text-xs border border-[#F0EAE0]">
                          {o.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between items-start gap-1">
                              <span className="text-stone-800 font-semibold line-clamp-1">
                                {it.tea.name} ({it.size})
                              </span>
                              <span className="font-bold text-amber-800 shrink-0">
                                x{it.quantity}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Tổng tiền */}
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="text-[11px] text-stone-500">Tổng thanh toán:</span>
                          <span className="font-sans font-extrabold text-sm text-[#D95829]">
                            {formatVND(o.total)}
                          </span>
                        </div>

                        {/* Nút hành động nhanh theo quy trình Kanban */}
                        <div className="space-y-1.5 pt-1.5 border-t border-stone-100">
                          {step === 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                stopPosRingtone();
                                markOrderAsChecked(o.id);
                                playSuccessSound(true);
                              }}
                              className="w-full py-1.5 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer"
                            >
                              <span>Duyệt & Bếp Pha</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {step === 2 && (
                            <button
                              type="button"
                              onClick={() => {
                                updateOrderStatus(o.id, 'ready');
                                playSuccessSound(true);
                              }}
                              className="w-full py-1.5 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer"
                            >
                              <Coffee className="w-3.5 h-3.5" />
                              <span>Pha Xong ➔ Sẵn Sàng</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {step === 3 && (
                            <button
                              type="button"
                              onClick={() => {
                                updateOrderStatus(o.id, 'completed');
                                playSuccessSound(true);
                              }}
                              className="w-full py-1.5 px-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Đã Phục Vụ ➔ Hoàn Tất</span>
                            </button>
                          )}

                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                stopPosRingtone();
                                setCheckOrderModal(o);
                              }}
                              className="flex-1 py-1 px-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-[11px] flex items-center justify-center gap-1"
                            >
                              <Eye className="w-3 h-3 text-stone-500" />
                              <span>Chi tiết</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                stopPosRingtone();
                                setPrintingOrder(o);
                                playSuccessSound(true);
                              }}
                              className="py-1 px-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-[11px] flex items-center justify-center"
                              title="In bill đơn hàng"
                            >
                              <Printer className="w-3 h-3 text-stone-500" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                stopPosRingtone();
                                if (isUnchecked) {
                                  markOrderAsChecked(o.id);
                                }
                                handleLoadTableOrderToPos(o);
                                setShowCheckOrderDrawer(false);
                              }}
                              className="flex-1 py-1 px-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-[11px] flex items-center justify-center gap-1"
                            >
                              <CreditCard className="w-3 h-3 text-amber-600" />
                              <span>Nạp POS</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  };

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 h-full">
                      {/* CỘT 1: CHỜ DUYỆT */}
                      <div className="bg-[#F5EFE6]/80 rounded-2xl p-3 border border-[#E8DEC8] flex flex-col h-full overflow-hidden">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E0D4BE] shrink-0">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                            <h4 className="font-extrabold text-xs text-amber-900 uppercase">
                              1. Chờ Duyệt ({col1.length})
                            </h4>
                          </div>
                          {col1.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                stopPosRingtone();
                                playSuccessSound(true);
                                col1.forEach(o => markOrderAsChecked(o.id));
                              }}
                              className="text-[10px] font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer"
                            >
                              Duyệt hết
                            </button>
                          )}
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                          {col1.length === 0 ? (
                            <div className="text-center py-8 text-stone-400 text-xs italic">
                              Không có đơn nào chờ duyệt
                            </div>
                          ) : (
                            col1.map(o => renderKanbanCard(o, 1))
                          )}
                        </div>
                      </div>

                      {/* CỘT 2: BẾP PHA CHẾ */}
                      <div className="bg-blue-50/50 rounded-2xl p-3 border border-blue-100 flex flex-col h-full overflow-hidden">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-blue-200 shrink-0">
                          <div className="flex items-center gap-1.5">
                            <ChefHat className="w-4 h-4 text-blue-600" />
                            <h4 className="font-extrabold text-xs text-blue-900 uppercase">
                              2. Bếp Pha Chế ({col2.length})
                            </h4>
                          </div>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                          {col2.length === 0 ? (
                            <div className="text-center py-8 text-stone-400 text-xs italic">
                              Bếp chưa có đơn pha chế
                            </div>
                          ) : (
                            col2.map(o => renderKanbanCard(o, 2))
                          )}
                        </div>
                      </div>

                      {/* CỘT 3: SẴN SÀNG PHỤC VỤ */}
                      <div className="bg-purple-50/50 rounded-2xl p-3 border border-purple-100 flex flex-col h-full overflow-hidden">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-purple-200 shrink-0">
                          <div className="flex items-center gap-1.5">
                            <Coffee className="w-4 h-4 text-purple-600" />
                            <h4 className="font-extrabold text-xs text-purple-900 uppercase">
                              3. Sẵn Sàng ({col3.length})
                            </h4>
                          </div>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                          {col3.length === 0 ? (
                            <div className="text-center py-8 text-stone-400 text-xs italic">
                              Chưa có đơn chờ bưng / giao
                            </div>
                          ) : (
                            col3.map(o => renderKanbanCard(o, 3))
                          )}
                        </div>
                      </div>

                      {/* CỘT 4: HOÀN TẤT */}
                      <div className="bg-emerald-50/50 rounded-2xl p-3 border border-emerald-100 flex flex-col h-full overflow-hidden">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-200 shrink-0">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <h4 className="font-extrabold text-xs text-emerald-900 uppercase">
                              4. Hoàn Tất ({col4.length})
                            </h4>
                          </div>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                          {col4.length === 0 ? (
                            <div className="text-center py-8 text-stone-400 text-xs italic">
                              Chưa có đơn hoàn tất trong ca
                            </div>
                          ) : (
                            col4.map(o => renderKanbanCard(o, 4))
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }

                // CHẾ ĐỘ 2: LƯỚI THẺ CHI TIẾT (GRID VIEW)
                const baseList = checkDrawerTab === 'pending'
                  ? uncheckedOrders
                  : checkDrawerTab === 'preparing'
                  ? preparingOrders
                  : checkDrawerTab === 'ready'
                  ? readyOrders
                  : checkDrawerTab === 'completed'
                  ? completedOrders
                  : orders;

                const displayList = baseList.filter(filterFn);

                if (displayList.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
                        <PackageCheck className="w-8 h-8" />
                      </div>
                      <p className="font-bold text-stone-700 text-sm">
                        {checkDrawerTab === 'pending'
                          ? 'Tuyệt vời! Hiện không có đơn hàng nào chờ duyệt.'
                          : checkDrawerTab === 'preparing'
                          ? 'Không có đơn nào đang pha chế.'
                          : checkDrawerTab === 'ready'
                          ? 'Không có đơn nào đang chờ phục vụ.'
                          : checkDrawerTab === 'completed'
                          ? 'Chưa có đơn hàng nào hoàn tất.'
                          : 'Không tìm thấy đơn hàng phù hợp với điều kiện lọc.'}
                      </p>
                      <p className="text-stone-400 text-xs mt-1">
                        Thử điều chỉnh từ khóa tìm kiếm hoặc chuyển đổi bộ lọc bên trên.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {displayList.map((o) => {
                      const isPaid = o.paymentStatus === 'paid' || o.customer.paymentMethod === 'vietqr';
                      const isUnchecked = !o.checked && o.status === 'pending';
                      const isPreparing = o.status === 'preparing';
                      const isReady = o.status === 'ready';

                      return (
                        <div 
                          key={o.id} 
                          className={`p-4 sm:p-5 rounded-3xl border transition-all flex flex-col justify-between shadow-2xs hover:shadow-md ${
                            isUnchecked
                              ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/50'
                              : isPreparing
                              ? 'bg-blue-50/40 border-blue-200'
                              : isReady
                              ? 'bg-purple-50/40 border-purple-200'
                              : isPaid
                              ? 'bg-emerald-50/30 border-emerald-200'
                              : 'bg-white border-[#EAE3D2]'
                          }`}
                        >
                          <div>
                            {/* Dòng 1: Số đơn, bàn/hình thức, trạng thái đơn, thanh toán, thời gian */}
                            <div className="flex items-center justify-between gap-2 flex-wrap mb-2.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-extrabold text-base text-[#322821]">
                                  #{o.orderNumber}
                                </span>
                                <span className="font-bold text-xs px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800 border border-stone-300">
                                  {o.tableNumber ? `🪑 ${o.tableNumber}` : (o.orderType === 'dine-in' ? '🪑 Tại Quán' : '🛵 Giao Hàng')}
                                </span>

                                {/* Trạng thái quy trình */}
                                {isUnchecked ? (
                                  <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-500 text-white animate-pulse flex items-center gap-1 shadow-2xs">
                                    <Bell className="w-3 h-3" />
                                    BƯỚC 1: CHỜ DUYỆT
                                  </span>
                                ) : isPreparing ? (
                                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-300 flex items-center gap-1">
                                    <ChefHat className="w-3 h-3" />
                                    BƯỚC 2: BẾP ĐANG PHA
                                  </span>
                                ) : isReady ? (
                                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-300 flex items-center gap-1">
                                    <Coffee className="w-3 h-3" />
                                    BƯỚC 3: SẴN SÀNG
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    BƯỚC 4: HOÀN TẤT
                                  </span>
                                )}

                                {/* Trạng thái thanh toán */}
                                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                  isPaid
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                                }`}>
                                  {isPaid ? '✅ Đã VietQR' : '🟠 Chưa thanh toán'}
                                </span>
                              </div>

                              <span className="text-xs text-[#69776E] flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-stone-400" />
                                {o.createdAt}
                              </span>
                            </div>

                            {/* Dòng 2: Thông tin khách hàng */}
                            <div className="bg-white/80 p-2.5 rounded-xl border border-stone-200/80 mb-3 text-xs flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <span className="text-stone-500">Khách hàng: </span>
                                <strong className="text-[#322821]">{o.customer.name || 'Khách vãng lai'}</strong>
                                {o.customer.phone && (
                                  <span className="text-stone-600 ml-1.5 font-medium">({o.customer.phone})</span>
                                )}
                              </div>
                              {o.customer.address && (
                                <div className="text-stone-500 text-[11px] truncate max-w-xs">
                                  📍 {o.customer.address}
                                </div>
                              )}
                            </div>

                            {/* Dòng 3: Chi tiết danh sách món & Topping */}
                            <div className="space-y-2 mb-3 bg-[#FAF7F2] p-3 rounded-2xl border border-[#EDE5D6]">
                              <div className="text-[11px] font-bold uppercase text-stone-500 tracking-wider">
                                Món nước & Tùy chọn ({o.items.reduce((s, it) => s + it.quantity, 0)} ly)
                              </div>
                              <div className="space-y-2">
                                {o.items.map((it, idx) => (
                                  <div key={idx} className="flex justify-between items-start gap-2 text-xs pb-1.5 border-b border-stone-200/60 last:border-0 last:pb-0">
                                    <div className="flex-1">
                                      <div className="font-bold text-[#322821] flex items-center gap-1.5">
                                        <span>{it.tea.name}</span>
                                        <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 text-[10px] font-extrabold uppercase">
                                          Size {it.size}
                                        </span>
                                      </div>

                                      {/* Tùy chỉnh đường đá */}
                                      <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                                        <span>Đường: {it.sugar}%</span>
                                        <span>•</span>
                                        <span>Đá: {it.ice}%</span>
                                      </div>

                                      {/* Toppings đi kèm */}
                                      {it.toppings && it.toppings.length > 0 && (
                                        <div className="text-[11px] text-amber-800 mt-0.5">
                                          + {it.toppings.map(t => `${t.name} (${formatVND(t.price)})`).join(', ')}
                                        </div>
                                      )}

                                      {/* Ghi chú riêng của món */}
                                      {it.note && (
                                        <div className="text-[11px] text-red-600 italic mt-0.5">
                                          * Ghi chú: {it.note}
                                        </div>
                                      )}
                                    </div>

                                    <div className="text-right shrink-0">
                                      <span className="font-extrabold text-[#322821]">
                                        x{it.quantity}
                                      </span>
                                      <div className="font-sans font-bold text-xs text-stone-700">
                                        {formatVND(it.totalPrice)}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Ghi chú toàn đơn nếu có */}
                            {o.customer.note && (
                              <div className="mb-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                                <strong>📝 Lời nhắn của khách:</strong> {o.customer.note}
                              </div>
                            )}
                          </div>

                          {/* Dòng 4: Tổng tiền & Nút tác vụ theo từng bước quy trình */}
                          <div className="pt-3 border-t border-[#EAE3D2] flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
                            <div>
                              <span className="text-[11px] text-stone-500 block">Tổng tiền thanh toán:</span>
                              <span className="font-sans font-extrabold text-xl text-[#D95829]">
                                {formatVND(o.total)}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 flex-wrap">
                              {/* HÀNH ĐỘNG CHO BƯỚC 1: CHỜ DUYỆT */}
                              {isUnchecked && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      stopPosRingtone();
                                      markOrderAsChecked(o.id);
                                      setPrintingOrder(o);
                                      playSuccessSound(true);
                                    }}
                                    className="py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-2xs cursor-pointer active:scale-95"
                                  >
                                    <Printer className="w-3.5 h-3.5" />
                                    <span>🖨️ In & Duyệt</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      stopPosRingtone();
                                      markOrderAsChecked(o.id);
                                      playSuccessSound(true);
                                    }}
                                    className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-2xs cursor-pointer active:scale-95"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>✔ Duyệt Đơn</span>
                                  </button>
                                </>
                              )}

                              {/* HÀNH ĐỘNG CHO BƯỚC 2: BẾP ĐANG PHA CHẾ */}
                              {isPreparing && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateOrderStatus(o.id, 'ready');
                                    playSuccessSound(true);
                                  }}
                                  className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                                >
                                  <Coffee className="w-3.5 h-3.5" />
                                  <span>Pha Xong ➔ Sẵn Sàng</span>
                                </button>
                              )}

                              {/* HÀNH ĐỘNG CHO BƯỚC 3: SẴN SÀNG PHỤC VỤ */}
                              {isReady && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateOrderStatus(o.id, 'completed');
                                    playSuccessSound(true);
                                  }}
                                  className="py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Đã Phục Vụ ➔ Hoàn Tất</span>
                                </button>
                              )}

                              {/* IN BILL */}
                              <button
                                type="button"
                                onClick={() => {
                                  stopPosRingtone();
                                  setPrintingOrder(o);
                                  playSuccessSound(true);
                                }}
                                className="py-2 px-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                                title="In phiếu chế biến / bill thanh toán"
                              >
                                <Printer className="w-3.5 h-3.5 text-stone-600" />
                                <span>In Bill</span>
                              </button>

                              {/* XEM CHI TIẾT */}
                              <button
                                type="button"
                                onClick={() => {
                                  stopPosRingtone();
                                  setCheckOrderModal(o);
                                }}
                                className="py-2 px-2.5 rounded-xl bg-white hover:bg-stone-100 border border-[#DDD6C8] text-[#322821] font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Chi Tiết</span>
                              </button>

                              {/* NẠP POS THU TIỀN */}
                              <button
                                type="button"
                                onClick={() => {
                                  stopPosRingtone();
                                  if (isUnchecked) {
                                    markOrderAsChecked(o.id);
                                  }
                                  handleLoadTableOrderToPos(o);
                                  setShowCheckOrderDrawer(false);
                                }}
                                className="py-2 px-3 rounded-xl bg-[#322821] hover:bg-[#211A15] text-white font-bold text-xs flex items-center justify-center gap-1 shadow-2xs cursor-pointer active:scale-95"
                              >
                                <CreditCard className="w-3.5 h-3.5 text-amber-300" />
                                <span>Nạp POS</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* FOOTER MODAL - THỐNG KÊ TỔNG HỢP & NÚT THOÁT */}
            <div className="pt-3 border-t border-[#EAE3D2] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 text-xs text-stone-600 flex-wrap">
                <span>
                  Tổng số đơn: <strong className="text-[#322821]">{orders.length}</strong>
                </span>
                <span>•</span>
                <span className="text-amber-800 font-semibold">
                  Chờ duyệt: <strong>{uncheckedOrders.length}</strong>
                </span>
                <span>•</span>
                <span className="text-blue-800 font-semibold">
                  Đang pha: <strong>{preparingOrders.length}</strong>
                </span>
                <span>•</span>
                <span className="text-purple-800 font-semibold">
                  Sẵn sàng: <strong>{readyOrders.length}</strong>
                </span>
                <span>•</span>
                <span className="text-emerald-800 font-semibold">
                  Hoàn tất: <strong>{completedOrders.length}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-stone-100 border border-[#DDD6C8] text-xs font-bold text-[#322821] flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5 text-stone-600" />
                  <span>In Báo Cáo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowCheckOrderDrawer(false)}
                  className="px-6 py-2 rounded-xl bg-[#322821] hover:bg-[#211A15] text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Đóng Cửa Sổ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
