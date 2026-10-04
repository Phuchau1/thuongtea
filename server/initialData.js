// Dữ liệu ban đầu trích xuất toàn bộ từ cơ sở dữ liệu localhost (đơn hàng, thành viên, sản phẩm, topping, bàn, nhân viên, voucher)
// Dùng để tự động nạp thẳng vào MongoDB Atlas khi kết nối lần đầu

export const INITIAL_ORDERS = [
  {
    id: "TH-252076",
    orderNumber: 535,
    createdAt: "11:47",
    customer: {
      servingType: "dine-in",
      tableNumber: "Bàn 07",
      name: "Hậu",
      phone: "0838484885",
      address: "",
      paymentMethod: "vietqr",
      deliveryTime: "now",
      note: "Thanh toán chuyển khoản VietQR"
    },
    orderType: "dine-in",
    tableNumber: "Bàn 07",
    items: [
      {
        cartItemId: "tea-01-M-70-70--1790743629460",
        tea: {
          id: "tea-01",
          name: "Trà Đào Cam Sả Hoàng Gia",
          subtitle: "PEACH ORANGE LEMONGRASS",
          tagline: "Vị ngọt thanh đào mọng, hương sả nồng nàn & vị cam tươi sảng khoái",
          price: 49000,
          originalPrice: 59000,
          category: "signature",
          image: "/teas/tra-dao-cam-sa.png",
          bg: "#D95D39",
          panel: "#F18F01",
          description: "Chiết xuất từ hồng trà ủ lạnh 12h, hòa quyện với những lát đào ngâm giòn ngọt, cam vàng mọng nước và sả tươi đập dập thơm lừng.",
          ingredients: [
            "Hồng trà Ceylon cao cấp",
            "Đào vàng ngâm giòn",
            "Cam tươi Valencia",
            "Sả chanh Mộc Châu",
            "Mật ong hoa rừng"
          ],
          calories: 145,
          sweetnessDefault: 70,
          iceDefault: 70,
          isBestSeller: true,
          badge: "BEST SELLER #1",
          flavorNotes: [
            "Đào giòn ngọt",
            "Thơm nồng sả tươi",
            "Chua nhẹ cam vàng"
          ]
        },
        size: "M",
        sugar: 70,
        ice: 70,
        toppings: [],
        quantity: 1,
        unitPrice: 49000,
        totalPrice: 49000,
        note: ""
      }
    ],
    subtotal: 49000,
    shippingFee: 0,
    discount: 0,
    total: 49000,
    status: "completed",
    paymentStatus: "paid",
    staffNote: "Đã thanh toán VietQR",
    checked: true,
    checkedAt: "11:47",
    createdTimestamp: 1790743629460
  },
  {
    id: "QR-317353",
    orderNumber: 102,
    createdAt: "11:41",
    customer: {
      name: "Khách Bàn 01",
      phone: "",
      address: "Bàn 01 (Tại quán)",
      servingType: "dine-in",
      tableNumber: "Bàn 01",
      paymentMethod: "vietqr",
      deliveryTime: "now",
      note: ""
    },
    orderType: "dine-in",
    tableNumber: "Bàn 01",
    items: [
      {
        cartItemId: "pos-17907433161090.2865567720588498",
        tea: {
          id: "tea-mang-cau",
          name: "Trà Mãng Cầu Tươi Đắk Lắk",
          subtitle: "FRESH SOURSOP SPECIAL TEA",
          tagline: "Mãng cầu xiêm Đắk Lắk dầm múi tươi chua ngọt sánh quyện đậm đà cực cuốn",
          price: 52000,
          originalPrice: 60000,
          category: "fruit-tea",
          image: "/teas/tra-mang-cau-tuoi.png",
          bg: "#854D0E",
          panel: "#CA8A04",
          description: "Món trà mãng cầu hot trend với những múi mãng cầu xiêm tươi roi rói được xé sợi ngâm đường cát vàng, kết hợp cốt trà lài thanh tao tạo nên vị chua ngọt bùng nổ.",
          ingredients: [
            "Mãng cầu xiêm chín tươi",
            "Trà xanh lài Bảo Lộc",
            "Mứt mãng cầu handmade",
            "Chanh tươi"
          ],
          calories: 165,
          sweetnessDefault: 70,
          iceDefault: 70,
          isBestSeller: true,
          badge: "HOT TRENDING",
          flavorNotes: [
            "Mãng cầu tươi dai giòn",
            "Chua ngọt bùng nổ",
            "Trà lài ngát hương"
          ]
        },
        size: "M",
        sugar: 70,
        ice: 70,
        toppings: [],
        quantity: 1,
        unitPrice: 52000,
        totalPrice: 52000
      }
    ],
    subtotal: 52000,
    shippingFee: 0,
    discount: 0,
    total: 52000,
    status: "completed",
    paymentStatus: "paid",
    staffNote: "Thu ngân: Ngô Thành Phúc Hậu - Đã nhận chuyển khoản VietQR",
    checked: false,
    tableCleared: true,
    createdTimestamp: 1790743316109
  },
  {
    id: "POS-307931",
    orderNumber: 118,
    createdAt: "11:41",
    customer: {
      name: "Khách Bàn 01",
      phone: "",
      address: "Bàn 01 (Tại quán)",
      servingType: "dine-in",
      tableNumber: "Bàn 01",
      paymentMethod: "cod",
      deliveryTime: "now",
      note: ""
    },
    orderType: "dine-in",
    tableNumber: "Bàn 01",
    items: [
      {
        cartItemId: "pos-17907433009250.7148635422703605",
        tea: {
          id: "tea-oolong-sen",
          name: "Trà Ô Long Tứ Quý Hạt Sen Vàng",
          subtitle: "FOUR SEASONS LOTUS SEED TEA",
          tagline: "Hạt sen tươi Đồng Tháp bùi ngậy trong cốt trà Ô Long vàng sánh thanh tao",
          price: 52000,
          originalPrice: 59000,
          category: "signature",
          image: "/teas/tra-oolong-hat-sen.png",
          bg: "#A16207",
          panel: "#EAB308",
          description: "Dành cho người yêu thích sự mộc mạc tinh tế: cốt trà Ô Long Tứ Quý rang nhẹ vàng sánh hòa cùng những hạt sen tươi ninh nhừ bùi béo tự nhiên.",
          ingredients: [
            "Trà Ô Long Tứ Quý Bảo Lộc",
            "Hạt sen tươi Đồng Tháp",
            "Lá dứa nếp",
            "Đường phèn Quảng Ngãi"
          ],
          calories: 155,
          sweetnessDefault: 50,
          iceDefault: 70,
          badge: "THANH TAO TINH TẾ",
          flavorNotes: [
            "Hạt sen mềm bùi",
            "Hương Ô Long rang nhẹ",
            "Vị ngọt thanh dịu"
          ]
        },
        size: "M",
        sugar: 70,
        ice: 70,
        toppings: [],
        quantity: 1,
        unitPrice: 52000,
        totalPrice: 52000
      },
      {
        cartItemId: "pos-17907433017490.44534946004291387",
        tea: {
          id: "tea-02",
          name: "Trà Dâu Tây Tươi Đà Lạt",
          subtitle: "FRESH STRAWBERRY TEA",
          tagline: "Dâu tây Đà Lạt dầm tươi mọng nước, bạc hà the mát trên nền lục trà lài",
          price: 52000,
          originalPrice: 62000,
          category: "fruit-tea",
          image: "/teas/tra-dau-tay-nhiet-doi.png",
          bg: "#C1121F",
          panel: "#E63946",
          description: "Dâu tây chín mọng được hái tươi từ vườn Đà Lạt, dầm nhẹ cùng lá bạc hà the mát trên nền lục trà lài thanh thoát.",
          ingredients: [
            "Lục trà hoa nhài Tây Bắc",
            "Dâu tây Đà Lạt tươi",
            "Bạc hà non",
            "Đường mía vàng"
          ],
          calories: 150,
          sweetnessDefault: 70,
          iceDefault: 70,
          isBestSeller: true,
          isSeasonal: true,
          badge: "MÙA DÂU ĐÀ LẠT",
          flavorNotes: [
            "Dâu tây tươi ngọt",
            "Bạc hà the mát",
            "Hậu vị thanh dịu"
          ]
        },
        size: "M",
        sugar: 70,
        ice: 70,
        toppings: [],
        quantity: 1,
        unitPrice: 52000,
        totalPrice: 52000
      }
    ],
    subtotal: 104000,
    shippingFee: 0,
    discount: 0,
    total: 104000,
    status: "completed",
    paymentStatus: "paid",
    staffNote: "Thu ngân: Ngô Thành Phúc Hậu - Tiền mặt khách đưa 200.000đ (tiền thừa 96.000đ)",
    checked: false,
    tableCleared: true,
    createdTimestamp: 1790743301749
  }
];

export const INITIAL_MEMBERS = [
  {
    id: "0838484885",
    phone: "0838484885",
    name: "Hậu",
    points: 4,
    tier: "Đồng",
    totalSpent: 49000,
    registeredAt: "04/10/2026"
  },
  {
    id: "0908123456",
    phone: "0908123456",
    name: "Nguyễn Thùy Linh",
    points: 450,
    tier: "Vàng",
    totalSpent: 4500000,
    registeredAt: "10/01/2026"
  },
  {
    id: "0933888999",
    phone: "0933888999",
    name: "Trần Minh Quân",
    points: 180,
    tier: "Bạc",
    totalSpent: 1800000,
    registeredAt: "15/02/2026"
  },
  {
    id: "0977654321",
    phone: "0977654321",
    name: "Lê Hoàng Yến",
    points: 320,
    tier: "Kim Cương",
    totalSpent: 3200000,
    registeredAt: "05/11/2025"
  }
];

export const INITIAL_STAFF = [
  {
    id: 'NV-ADMIN-01',
    code: '1234',
    name: 'Ngô Thành Phúc Hậu',
    role: 'admin',
    roleTitle: 'Chủ Quán / Quản Lý Cấp Cao',
    phone: '0794999406',
    avatar: '👨‍💼',
    hourlyWage: 55000,
    isActive: true,
    createdAt: '01/01/2026',
  },
  {
    id: 'NV-CASHIER-01',
    code: '1001',
    name: 'Trần Thu Trang',
    role: 'cashier',
    roleTitle: 'Thu Ngân Đứng Quầy (Ca Sáng)',
    phone: '0938112233',
    avatar: '👩‍💼',
    hourlyWage: 28000,
    isActive: true,
    createdAt: '15/02/2026',
  },
  {
    id: 'NV-CASHIER-02',
    code: '1002',
    name: 'Lê Tuấn Kiệt',
    role: 'cashier',
    roleTitle: 'Thu Ngân Đứng Quầy (Ca Chiều)',
    phone: '0977223344',
    avatar: '🧑‍💼',
    hourlyWage: 28000,
    isActive: true,
    createdAt: '01/03/2026',
  },
  {
    id: 'NV-BARISTA-01',
    code: '2001',
    name: 'Phạm Gia Huy',
    role: 'barista',
    roleTitle: 'Trưởng Ca Pha Chế',
    phone: '0912445566',
    avatar: '👨‍🍳',
    hourlyWage: 32000,
    isActive: true,
    createdAt: '10/01/2026',
  },
];

export const INITIAL_TABLES = Array.from({ length: 12 }, (_, i) => {
  const num = String(i + 1).padStart(2, '0');
  const isFloor2 = i >= 6;
  return {
    id: `tbl-${num}`,
    name: `Bàn ${num}`,
    zone: isFloor2 ? 'Tầng 2 (Ban công)' : 'Tầng 1 (Trong nhà)',
    capacity: i === 11 ? 8 : i % 2 === 0 ? 4 : 2,
    isActive: true,
    notes: isFloor2 ? 'View thoáng ban công lộng gió' : 'Không gian ấm cúng trong nhà',
  };
});

export const INITIAL_TOPPINGS = [
  { id: 't1', name: 'Trân châu trắng 3Q giòn', price: 10000, isAvailable: true, category: 'Trân châu' },
  { id: 't2', name: 'Thạch đào miếng tươi', price: 12000, isAvailable: true, category: 'Thạch & Trái cây' },
  { id: 't3', name: 'Thạch nha đam hữu cơ', price: 8000, isAvailable: true, category: 'Thạch & Trái cây' },
  { id: 't4', name: 'Kem Cheese phô mai mặn', price: 15000, isAvailable: true, category: 'Kem & Bọt' },
  { id: 't5', name: 'Hạt chia Organic', price: 8000, isAvailable: true, category: 'Hạt ngũ cốc' },
  { id: 't6', name: 'Hạt sen Đồng Tháp tươi', price: 15000, isAvailable: true, category: 'Hạt ngũ cốc' },
  { id: 't7', name: 'Củ năng ngâm giòn sần sật', price: 12000, isAvailable: true, category: 'Thạch & Trái cây' },
  { id: 't8', name: 'Trân châu đen đường nâu dẻo', price: 10000, isAvailable: true, category: 'Trân châu' },
  { id: 't9', name: 'Kem trứng nướng khò lửa', price: 15000, isAvailable: true, category: 'Kem & Bọt' },
  { id: 't10', name: 'Sương sáo hoa nhài', price: 10000, isAvailable: true, category: 'Thạch & Trái cây' },
];

export const INITIAL_COUPONS = [
  {
    id: 'cp-welcome',
    code: 'THUONGTEA10',
    title: 'Giảm 10% Cho Khách Hàng Mới',
    description: 'Giảm 10% tối đa 30.000đ cho đơn hàng từ 50.000đ',
    type: 'percentage',
    value: 10,
    maxDiscount: 30000,
    minOrderTotal: 50000,
    isActive: true,
    usageLimit: 500,
    usedCount: 42,
    expiryDate: '31/12/2026',
  },
  {
    id: 'cp-freeship',
    code: 'FREESHIP20',
    title: 'Miễn Phí Giao Hàng',
    description: 'Giảm trực tiếp 20.000đ phí giao hàng cho đơn từ 100.000đ',
    type: 'fixed',
    value: 20000,
    minOrderTotal: 100000,
    isActive: true,
    usageLimit: 200,
    usedCount: 88,
    expiryDate: '31/12/2026',
  },
];
