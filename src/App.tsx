import { useState, useEffect } from 'react';
import { FruitTeaHero } from './components/FruitTeaHero';
import { MenuSection } from './components/MenuSection';
import { DiyTeaBuilder } from './components/DiyTeaBuilder';
import { QualityStory } from './components/QualityStory';
import { Footer } from './components/Footer';
import { TeaCustomizerModal } from './components/TeaCustomizerModal';
import { CartDrawer } from './components/CartDrawer';
import { AdminPortal } from './components/AdminPortal';
import { LiveOrderTrackerModal } from './components/LiveOrderTrackerModal';
import { StaffLoginModal } from './components/StaffLoginModal';
import { MemberLoginModal } from './components/MemberLoginModal';
import { OrderProvider, useOrders } from './context/OrderContext';
import type { FruitTeaItem, CartItem } from './types/tea';

function MainAppContent() {
  const { activeCustomerOrder, currentUser, loginMember } = useOrders();
  
  // Tách biệt rõ ràng 2 trang: 'user' (Khách hàng) và 'admin' (Quản trị & Bếp POS)
  const [pageMode, setPageMode] = useState<'user' | 'admin'>(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#admin') {
      return 'admin';
    }
    return 'user';
  });

  const [isStaffAuthenticated, setIsStaffAuthenticated] = useState<boolean>(false);
  const [isStaffLoginOpen, setIsStaffLoginOpen] = useState<boolean>(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState<boolean>(false);

  // Lựa chọn phương thức phục vụ của khách hàng: Giao tận nơi hoặc Ngồi tại bàn
  const [servingPreference, setServingPreference] = useState<'delivery' | 'dine-in'>('delivery');
  const [tableNumber, setTableNumber] = useState<string>('Bàn 01');

  const [selectedTeaForCustomize, setSelectedTeaForCustomize] = useState<FruitTeaItem | null>(null);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState<boolean>(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Tự động nhận diện bàn nếu khách quét mã QR (?table=Bàn 05) và tự động đăng nhập khách hàng tích điểm
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const scannedTable = searchParams.get('table');
      const urlPhone = searchParams.get('phone');
      const urlName = searchParams.get('name');

      if (scannedTable) {
        setServingPreference('dine-in');
        setTableNumber(scannedTable);
      }

      // Tự động đăng nhập thành viên qua QR hoặc lịch sử đặt trước đó
      if (urlPhone) {
        loginMember(urlPhone, urlName || undefined);
      } else if (!currentUser) {
        try {
          const saved = localStorage.getItem('tra_customer_info');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.phone) {
              loginMember(parsed.phone, parsed.name || undefined);
            }
          }
        } catch (e) {}
      }
    }
  }, [loginMember, currentUser]);

  // Lắng nghe thay đổi Hash URL (ví dụ khách hoặc nhân viên nhập #admin trên thanh địa chỉ)
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setPageMode('admin');
      } else {
        setPageMode('user');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Mở cổng Quản trị (Admin)
  const handleOpenAdmin = () => {
    if (isStaffAuthenticated) {
      window.location.hash = '#admin';
      setPageMode('admin');
    } else {
      setIsStaffLoginOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsStaffAuthenticated(true);
    setIsStaffLoginOpen(false);
    window.location.hash = '#admin';
    setPageMode('admin');
  };

  const handleBackToStore = () => {
    window.location.hash = '';
    setPageMode('user');
  };

  const handleLogoutAdmin = () => {
    setIsStaffAuthenticated(false);
    window.location.hash = '';
    setPageMode('user');
  };

  const [cartInitialStep, setCartInitialStep] = useState<'cart' | 'checkout'>('cart');

  const handleOpenCart = (step: 'cart' | 'checkout' = 'cart') => {
    setCartInitialStep(step);
    setIsCartOpen(true);
  };

  // Mở modal tùy chỉnh món
  const handleOpenCustomize = (tea: FruitTeaItem) => {
    setSelectedTeaForCustomize(tea);
    setIsCustomizeOpen(true);
  };

  // Thêm vào giỏ hàng
  const handleAddToCart = (newItem: CartItem) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (item) =>
          item.tea.id === newItem.tea.id &&
          item.size === newItem.size &&
          item.sugar === newItem.sugar &&
          item.ice === newItem.ice &&
          JSON.stringify(item.toppings.map(t => t.id).sort()) ===
            JSON.stringify(newItem.toppings.map(t => t.id).sort())
      );

      if (existingIdx >= 0) {
        const updated = [...prev];
        const updatedQuantity = updated[existingIdx].quantity + newItem.quantity;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updatedQuantity,
          totalPrice: updatedQuantity * updated[existingIdx].unitPrice,
        };
        return updated;
      }

      return [...prev, newItem];
    });
  };

  // Đặt ngay: thêm món vào giỏ và chuyển thẳng sang bước thanh toán
  const handleBuyNow = (newItem: CartItem) => {
    handleAddToCart(newItem);
    setIsCustomizeOpen(false);
    setCartInitialStep('checkout');
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(cartItemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          return {
            ...item,
            quantity: newQuantity,
            totalPrice: newQuantity * item.unitPrice,
          };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // ==========================================
  // TRƯỜNG HỢP 1: TRANG ADMIN (QUẢN TRỊ & BẾP POS)
  // ==========================================
  if (pageMode === 'admin') {
    // Nếu chưa đăng nhập mã PIN mà truy cập trực tiếp #admin: Hiển thị form đăng nhập
    if (!isStaffAuthenticated) {
      return (
        <div className="min-h-screen bg-[#124032] flex items-center justify-center p-4">
          <StaffLoginModal
            isOpen={true}
            onClose={() => {
              window.location.hash = '';
              setPageMode('user');
            }}
            onLoginSuccess={() => {
              setIsStaffAuthenticated(true);
            }}
          />
        </div>
      );
    }

    return (
      <AdminPortal
        onBackToStore={handleBackToStore}
        onLogout={handleLogoutAdmin}
        onSimulateScanTable={(tableId) => {
          setServingPreference('dine-in');
          setTableNumber(tableId);
          setPageMode('user');
          window.location.hash = '';
        }}
      />
    );
  }

  // ==========================================
  // TRƯỜNG HỢP 2: TRANG USER (KHÁCH HÀNG MUA TRÀ)
  // ==========================================
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#222B25]">
      {/* 1. Hero Section Trà Trái Cây & Bộ chọn Giao hàng / Tại bàn */}
      <FruitTeaHero
        onSelectTea={handleOpenCustomize}
        cartCount={totalCartCount}
        onOpenCart={() => handleOpenCart('cart')}
        servingPreference={servingPreference}
        onChangeServingPreference={setServingPreference}
        tableNumber={tableNumber}
        onChangeTableNumber={setTableNumber}
        onOpenTracker={() => setIsTrackerOpen(true)}
        onOpenMemberModal={() => setIsMemberModalOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
      />

      {/* 2. Thực đơn tuyển chọn với bộ lọc & tìm kiếm chuẩn xác */}
      <MenuSection onSelectTea={handleOpenCustomize} />

      {/* 3. Quầy tự pha chế vị trà độc bản */}
      <DiyTeaBuilder onAddCustomTea={handleAddToCart} />

      {/* 4. Câu chuyện nguồn gốc trà & Tinh hoa Thượng */}
      <QualityStory />

      {/* 5. Chân trang thương hiệu & Link kín vào Cổng Quản Trị */}
      <Footer onOpenAdmin={handleOpenAdmin} />

      {/* Modal Xác Thực Nhân Viên Quầy (Khi bấm mở Admin từ footer) */}
      <StaffLoginModal
        isOpen={isStaffLoginOpen}
        onClose={() => setIsStaffLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Modal Tùy chỉnh Đường / Đá / Topping */}
      <TeaCustomizerModal
        tea={selectedTeaForCustomize}
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      {/* Drawer Giỏ Hàng & Đặt Đơn Quét Mã VietQR */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onOpenTracker={() => setIsTrackerOpen(true)}
        initialServingType={servingPreference}
        initialTableNumber={tableNumber}
        initialStep={cartInitialStep}
      />

      {/* Modal Theo Dõi Tiến Độ Pha Chế Thời Gian Thực Cho Khách */}
      <LiveOrderTrackerModal
        order={activeCustomerOrder}
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
      />

      {/* Modal Đăng Nhập & Tích Điểm Thành Viên */}
      <MemberLoginModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
      />
    </div>
  );
}

export function App() {
  return (
    <OrderProvider>
      <MainAppContent />
    </OrderProvider>
  );
}

export default App;
