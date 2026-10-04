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


export const INITIAL_PRODUCTS = [
  {
    "id": "tea-sen-vang",
    "name": "Trà Sen Vàng Củ Năng Kem Cheese",
    "subtitle": "GOLDEN LOTUS TEA WITH WATER CHESTNUT",
    "tagline": "Hạt sen vàng bùi ngọt, củ năng giòn sần sật và lớp kem cheese béo ngậy độc bản",
    "price": 55000,
    "originalPrice": 65000,
    "category": "signature",
    "image": "/teas/tra-sen-vang.png",
    "bg": "#D48B06",
    "panel": "#F4A261",
    "description": "Món trà huyền thoại trứ danh kết hợp từ cốt trà Ô Long hạt sen thanh khiết, những hạt sen tươi Đồng Tháp ninh mềm bùi béo, củ năng cắt hạt lựu giòn tan và phủ lớp kem sữa phô mai mặn béo ngậy khó cưỡng.",
    "ingredients": [
      "Trà Ô Long sen Tây Hồ",
      "Hạt sen Đồng Tháp tươi",
      "Củ năng ngâm giòn",
      "Kem Cheese phô mai New Zealand",
      "Đường phèn thanh dịu"
    ],
    "calories": 210,
    "sweetnessDefault": 70,
    "iceDefault": 70,
    "isBestSeller": true,
    "badge": "ĐẶC BIỆT TRỨ DANH #1",
    "flavorNotes": [
      "Hạt sen bùi béo",
      "Củ năng giòn sần sật",
      "Kem cheese ngậy béo",
      "Hậu vị sen thanh tao"
    ]
  },
  {
    "id": "tea-01",
    "name": "Trà Đào Cam Sả Hoàng Gia",
    "subtitle": "PEACH ORANGE LEMONGRASS",
    "tagline": "Vị ngọt thanh đào mọng, hương sả nồng nàn & vị cam tươi sảng khoái",
    "price": 49000,
    "originalPrice": 59000,
    "category": "signature",
    "image": "/teas/tra-dao-cam-sa.png",
    "bg": "#D95D39",
    "panel": "#F18F01",
    "description": "Chiết xuất từ hồng trà ủ lạnh 12h, hòa quyện với những lát đào ngâm giòn ngọt, cam vàng mọng nước và sả tươi đập dập thơm lừng.",
    "ingredients": [
      "Hồng trà Ceylon cao cấp",
      "Đào vàng ngâm giòn",
      "Cam tươi Valencia",
      "Sả chanh Mộc Châu",
      "Mật ong hoa rừng"
    ],
    "calories": 145,
    "sweetnessDefault": 70,
    "iceDefault": 70,
    "isBestSeller": true,
    "badge": "BEST SELLER #1",
    "flavorNotes": [
      "Đào giòn ngọt",
      "Thơm nồng sả tươi",
      "Chua nhẹ cam vàng"
    ]
  },
  {
    "id": "tea-08",
    "name": "Trà Trái Cây Tứ Quý Nhiệt Đới",
    "subtitle": "FOUR SEASONS TROPICAL TEA",
    "tagline": "Hòa quyện đa tầng vị đào, cam, dâu, chanh leo tươi trên nền cốt trà Ô Long",
    "price": 55000,
    "originalPrice": 65000,
    "category": "signature",
    "image": "/teas/tra-trai-cay-tu-quy.png",
    "bg": "#C2410C",
    "panel": "#EA580C",
    "description": "Bản hòa ca của 4 loại trái cây nhiệt đới tươi ngon nhất: đào vàng, cam Valencia, dâu tây và chanh leo trên nền trà Ô Long Tứ Quý trứ danh.",
    "ingredients": [
      "Trà Ô Long Tứ Quý",
      "Đào vàng ngâm giòn",
      "Cam Valencia",
      "Dâu tây tươi",
      "Chanh leo"
    ],
    "calories": 165,
    "sweetnessDefault": 70,
    "iceDefault": 70,
    "isBestSeller": true,
    "badge": "SIGNATURE ĐẶC BIỆT",
    "flavorNotes": [
      "Đa tầng quả tươi",
      "Trà Tứ Quý đậm đà",
      "Ngọt ngào thanh mát"
    ]
  },
  {
    "id": "tea-05",
    "name": "Trà Ổi Hồng Ruby Muối Biển",
    "subtitle": "PINK GUAVA SEA SALT TEA",
    "tagline": "Ổi hồng xá lị tươi ruột đào ngọt thanh, điểm chút muối biển hồng tinh khiết",
    "price": 52000,
    "originalPrice": 60000,
    "category": "signature",
    "image": "/teas/tra-oi-hong-ruby.png",
    "bg": "#C84B66",
    "panel": "#F28482",
    "description": "Ổi hồng xá lị tươi ruột đỏ ép lấy nước cốt nguyên chất, kết hợp lớp muối hồng Himalayan nhẹ nhàng, đem lại trải nghiệm đa tầng vị độc bản.",
    "ingredients": [
      "Trà lài ủ lạnh",
      "Ổi hồng ruột đỏ",
      "Muối hồng Himalaya",
      "Hạt chia Úc"
    ],
    "calories": 138,
    "sweetnessDefault": 70,
    "iceDefault": 70,
    "isNew": true,
    "badge": "MỚI RA MẮT",
    "flavorNotes": [
      "Ổi hồng ruột đào",
      "Muối hồng đưa vị",
      "Ngọt dịu tinh tế"
    ]
  },
  {
    "id": "tea-07",
    "name": "Trà Dâu Tằm Lạc Thần Hibiscus",
    "subtitle": "HIBISCUS MULBERRY TEA",
    "tagline": "Hoa Atiso đỏ ngâm thanh mát hòa cùng dâu tằm chín mọng đậm đà chống oxy hoá",
    "price": 52000,
    "originalPrice": 59000,
    "category": "signature",
    "image": "/teas/tra-dau-tam-lac-than.png",
    "bg": "#881337",
    "panel": "#BE123C",
    "description": "Sắc đỏ thẫm quý phái từ đài hoa Hibiscus ngâm lạnh kết hợp dâu tằm Đà Lạt ngọt bùi, giàu chất chống oxy hóa giúp làm đẹp da và thanh lọc cơ thể.",
    "ingredients": [
      "Hoa Hibiscus tự nhiên",
      "Dâu tằm chín mọng Đà Lạt",
      "Hồng trà Ceylon",
      "Bạc hà"
    ],
    "calories": 130,
    "sweetnessDefault": 70,
    "iceDefault": 70,
    "isSeasonal": true,
    "badge": "HEALTHY & BEAUTY",
    "flavorNotes": [
      "Sắc đỏ hoa Hibiscus",
      "Dâu tằm đậm đà",
      "Chua ngọt sâu lắng"
    ]
  },
  {
    "id": "tea-oolong-sen",
    "name": "Trà Ô Long Tứ Quý Hạt Sen Vàng",
    "subtitle": "FOUR SEASONS LOTUS SEED TEA",
    "tagline": "Hạt sen tươi Đồng Tháp bùi ngậy trong cốt trà Ô Long vàng sánh thanh tao",
    "price": 52000,
    "originalPrice": 59000,
    "category": "signature",
    "image": "/teas/tra-oolong-hat-sen.png",
    "bg": "#A16207",
    "panel": "#EAB308",
    "description": "Dành cho người yêu thích sự mộc mạc tinh tế: cốt trà Ô Long Tứ Quý rang nhẹ vàng sánh hòa cùng những hạt sen tươi ninh nhừ bùi béo tự nhiên.",
    "ingredients": [
      "Trà Ô Long Tứ Quý Bảo Lộc",
      "Hạt sen tươi Đồng Tháp",
      "Lá dứa nếp",
      "Đường phèn Quảng Ngãi"
    ],
    "calories": 155,
    "sweetnessDefault": 50,
    "iceDefault": 70,
    "badge": "THANH TAO TINH TẾ",
    "flavorNotes": [
      "Hạt sen mềm bùi",
      "Hương Ô Long rang nhẹ",
      "Vị ngọt thanh dịu"
    ]
  },
  {
    "id": "tea-02",
    "name": "Trà Dâu Tây Tươi Đà Lạt",
    "subtitle": "FRESH STRAWBERRY TEA",
    "tagline": "Dâu tây Đà Lạt dầm tươi mọng nước, bạc hà the mát trên nền lục trà lài",
    "price": 52000,
    "originalPrice": 62000,
    "category": "fruit-tea",
    "image": "/teas/tra-dau-tay-nhiet-doi.png",
    "bg": "#C1121F",
    "panel": "#E63946",
    "description": "Dâu tây chín mọng được hái tươi từ vườn Đà Lạt, dầm nhẹ cùng lá bạc hà the mát trên nền lục trà lài thanh thoát.",
    "ingredients": [
      "Lục trà hoa nhài Tây Bắc",
      "Dâu tây Đà Lạt tươi",
      "Bạc hà non",
      "Đường mía vàng"
    ],
    "calories": 150,
    "sweetnessDefault": 70,
    "iceDefault": 70,
    "isBestSeller": true,
    "isSeasonal": true,
    "badge": "MÙA DÂU ĐÀ LẠT",
    "flavorNotes": [
      "Dâu tây tươi ngọt",
      "Bạc hà the mát",
      "Hậu vị thanh dịu"
    ]
  },
  {
    "id": "tea-03",
    "name": "Trà Xoài Cát Chanh Leo",
    "subtitle": "GOLDEN MANGO PASSION FRUIT",
    "tagline": "Xoài cát Hoà Lộc chín vàng thơm ngọt quyện cùng tép chanh leo chua thanh",
    "price": 49000,
    "originalPrice": 55000,
    "category": "fruit-tea",
    "image": "/teas/tra-xoai-chanh-leo.png",
    "bg": "#D48B06",
    "panel": "#F4A261",
    "description": "Xoài cát Hoà Lộc chín vàng thơm ngát xắt hạt lựu, kết hợp cùng tép chanh leo chua thanh kích thích vị giác trên nền trà Ô Long thanh tao.",
    "ingredients": [
      "Trà Ô Long Tứ Quý",
      "Xoài cát Hòa Lộc",
      "Chanh leo tươi Đà Lạt",
      "Mứt xoài hữu cơ"
    ],
    "calories": 155,
    "sweetnessDefault": 50,
    "iceDefault": 70,
    "isBestSeller": true,
    "badge": "VỊ ĐẬM ĐÀ",
    "flavorNotes": [
      "Xoài cát thơm lừng",
      "Chanh leo chua thanh",
      "Tép quả giòn sần sật"
    ]
  },
  {
    "id": "tea-04",
    "name": "Trà Cam Vàng Mật Ong Rừng",
    "subtitle": "HONEY VALENCIA CITRUS TEA",
    "tagline": "Cam Valencia cắt lát mọng tép kết hợp mật ong hoa nhãn Tây Bắc thanh ngọt",
    "price": 48000,
    "originalPrice": 55000,
    "category": "fruit-tea",
    "image": "/teas/tra-cam-vang-mat-ong.png",
    "bg": "#E06D24",
    "panel": "#F59E0B",
    "description": "Nước cốt cam tươi ép nguyên chất hòa quyện cùng mật ong hoa nhãn rừng già nguyên chất và trà lài ủ lạnh, thơm thanh và dồi dào vitamin C.",
    "ingredients": [
      "Cam vàng Valencia",
      "Mật ong hoa nhãn tự nhiên",
      "Trà xanh hoa lài",
      "Lá húng non"
    ],
    "calories": 135,
    "sweetnessDefault": 70,
    "iceDefault": 70,
    "badge": "GIẢI NHIỆT",
    "flavorNotes": [
      "Mọng tép cam tươi",
      "Mật ong thơm ngọt",
      "Thanh mát bừng tỉnh"
    ]
  },
  {
    "id": "tea-06",
    "name": "Trà Chanh Dây Kim Quất Tươi",
    "subtitle": "CALAMANSI PASSION FRUIT",
    "tagline": "Tắc kim quất tươi mọng nước dầm cùng chanh dây Đà Lạt giàu vitamin C sảng khoái",
    "price": 45000,
    "originalPrice": 50000,
    "category": "fruit-tea",
    "image": "/teas/tra-chanh-day-kim-quat.png",
    "bg": "#B45309",
    "panel": "#EAB308",
    "description": "Quả tắc tươi chua dịu đập dập thơm lừng kết hợp hạt chanh leo chua thanh và cốt trà Ô Long Bảo Lộc, giải nhiệt tức thì trong ngày nóng bức.",
    "ingredients": [
      "Quả tắc kim quất tươi",
      "Chanh dây hạt vàng",
      "Trà Ô Long Bảo Lộc",
      "Mật mía hữu cơ"
    ],
    "calories": 125,
    "sweetnessDefault": 50,
    "iceDefault": 70,
    "badge": "CỰC ĐÃ KHÁT",
    "flavorNotes": [
      "Tắc non thơm lừng",
      "Chua thanh đã khát",
      "Tỉnh táo sảng khoái"
    ]
  },
  {
    "id": "tea-mang-cau",
    "name": "Trà Mãng Cầu Tươi Đắk Lắk",
    "subtitle": "FRESH SOURSOP SPECIAL TEA",
    "tagline": "Mãng cầu xiêm Đắk Lắk dầm múi tươi chua ngọt sánh quyện đậm đà cực cuốn",
    "price": 52000,
    "originalPrice": 60000,
    "category": "fruit-tea",
    "image": "/teas/tra-mang-cau-tuoi.png",
    "bg": "#854D0E",
    "panel": "#CA8A04",
    "description": "Món trà mãng cầu hot trend với những múi mãng cầu xiêm tươi roi rói được xé sợi ngâm đường cát vàng, kết hợp cốt trà lài thanh tao tạo nên vị chua ngọt bùng nổ.",
    "ingredients": [
      "Mãng cầu xiêm chín tươi",
      "Trà xanh lài Bảo Lộc",
      "Mứt mãng cầu handmade",
      "Chanh tươi"
    ],
    "calories": 165,
    "sweetnessDefault": 70,
    "iceDefault": 70,
    "isBestSeller": true,
    "badge": "HOT TRENDING",
    "flavorNotes": [
      "Mãng cầu tươi dai giòn",
      "Chua ngọt bùng nổ",
      "Trà lài ngát hương"
    ]
  },
  {
    "id": "tea-buoi-hong",
    "name": "Trà Bưởi Hồng Mật Ong Ép",
    "subtitle": "RUBY GRAPEFRUIT HONEY TEA",
    "tagline": "Tép bưởi hồng da xanh mọng nước cùng mật ong hoa nhãn ngọt lành thanh mát",
    "price": 50000,
    "originalPrice": 58000,
    "category": "fruit-tea",
    "image": "/teas/tra-buoi-hong-ep.png",
    "bg": "#BE185D",
    "panel": "#EC4899",
    "description": "Nước cốt bưởi hồng da xanh ép tươi giàu vitamin C và khoáng chất, hòa quyện mật ong hoa nhãn nguyên chất và trà Ô Long thanh mát dịu nhẹ.",
    "ingredients": [
      "Bưởi hồng da xanh Bến Tre",
      "Mật ong hoa nhãn rừng",
      "Trà Ô Long Tứ Quý",
      "Hương thảo"
    ],
    "calories": 125,
    "sweetnessDefault": 50,
    "iceDefault": 70,
    "badge": "GIÀU VITAMIN C",
    "flavorNotes": [
      "Tép bưởi hồng mọng",
      "Mật ong thơm ngọt",
      "Thanh lọc cơ thể"
    ]
  },
  {
    "id": "tea-thanh-long",
    "name": "Trà Thanh Long Đỏ Hạt Chia",
    "subtitle": "RED DRAGONFRUIT CHIA SEED TEA",
    "tagline": "Thanh long ruột đỏ Bình Thuận tươi ngọt hòa quyện hạt chia dinh dưỡng đẹp da",
    "price": 48000,
    "originalPrice": 55000,
    "category": "fruit-tea",
    "image": "/teas/tra-thanh-long-do.png",
    "bg": "#9D174D",
    "panel": "#F43F5E",
    "description": "Sắc đỏ cánh sen tự nhiên từ thanh long ruột đỏ chín mọng dầm nhẹ, điểm xuyết hạt chia hữu cơ giòn vui miệng và cốt trà lài thanh khiết.",
    "ingredients": [
      "Thanh long đỏ Bình Thuận",
      "Hạt chia Organic",
      "Trà lài ủ lạnh",
      "Mật mía"
    ],
    "calories": 130,
    "sweetnessDefault": 70,
    "iceDefault": 70,
    "badge": "ĐẸP DA DÁNG THON",
    "flavorNotes": [
      "Thanh long ngọt dịu",
      "Hạt chia vui miệng",
      "Sắc đỏ quyến rũ"
    ]
  },
  {
    "id": "tea-dua-luoi",
    "name": "Trà Dưa Lưới Hoàng Kim Nha Đam",
    "subtitle": "CANTALOUPE ALOE VERA TEA",
    "tagline": "Dưa lưới hoàng kim giòn ngọt ngát hương cùng thạch nha đam thanh mát đã khát",
    "price": 52000,
    "originalPrice": 60000,
    "category": "fruit-tea",
    "image": "/teas/tra-dua-luoi-hoang-kim.png",
    "bg": "#4D7C0F",
    "panel": "#84CC16",
    "description": "Hương thơm nồng nàn đặc trưng của dưa lưới hoàng kim tươi ép lạnh, kết hợp thạch nha đam giòn sần sật trên nền lục trà xanh mát rượi.",
    "ingredients": [
      "Dưa lưới hoàng kim",
      "Thạch nha đam hữu cơ",
      "Trà xanh Mộc Châu",
      "Lá dứa"
    ],
    "calories": 145,
    "sweetnessDefault": 70,
    "iceDefault": 70,
    "badge": "CỰC THANH MÁT",
    "flavorNotes": [
      "Dưa lưới thơm ngát",
      "Nha đam giòn sần sật",
      "Hậu vị ngọt mát"
    ]
  },
  {
    "id": "tea-nhai-vai",
    "name": "Trà Nhài Vải Thanh Mát Băng Tuyết",
    "subtitle": "JASMINE LYCHEE ICED TEA",
    "tagline": "Vải thiều Lục Ngạn mọng nước ướp cùng hương hoa nhài thanh tao đượm vị",
    "price": 49000,
    "originalPrice": 55000,
    "category": "fruit-tea",
    "image": "/teas/tra-nhai-vai-thanh-mat.png",
    "bg": "#0D766E",
    "panel": "#14B8A6",
    "description": "Lục trà hoa lài thượng hạng ủ lạnh kết hợp cùi vải thiều trắng nõn mọng nước, vị ngọt thanh mát lạnh bừng tỉnh mọi giác quan.",
    "ingredients": [
      "Lục trà hoa nhài Tây Bắc",
      "Vải thiều Lục Ngạn ngâm giòn",
      "Bạc hà tươi",
      "Mật hoa thiên nhiên"
    ],
    "calories": 140,
    "sweetnessDefault": 70,
    "iceDefault": 70,
    "isBestSeller": true,
    "badge": "BÁN CHẠY",
    "flavorNotes": [
      "Vải thiều giòn ngọt",
      "Hương nhài thanh nhã",
      "Mát lạnh sảng khoái"
    ]
  },
  {
    "id": "tea-viet-quat",
    "name": "Trà Tuyết Tuyết Việt Quất Sơn",
    "subtitle": "BLUEBERRY MINT CHILL TEA",
    "tagline": "Việt quất tươi mọng quả giàu chất chống oxy hóa hòa quyện bạc hà the mát",
    "price": 55000,
    "originalPrice": 62000,
    "category": "fruit-tea",
    "image": "/teas/tra-viet-quat-tuyet.png",
    "bg": "#4338CA",
    "panel": "#6366F1",
    "description": "Quả việt quất tươi mọng nước được dầm nhuyễn cùng syrup việt quất hữu cơ trên nền trà đen Ceylon, bổ sung vitamin và làm sáng đẹp làn da.",
    "ingredients": [
      "Việt quất tươi",
      "Hồng trà Ceylon",
      "Lá bạc hà Mộc Châu",
      "Chanh vàng"
    ],
    "calories": 148,
    "sweetnessDefault": 70,
    "iceDefault": 70,
    "badge": "HEALTHY DRINK",
    "flavorNotes": [
      "Việt quất chua ngọt",
      "Sắc tím huyền bí",
      "Bạc hà the mát"
    ]
  },
  {
    "id": "tea-sua-tran-chau",
    "name": "Trà Sữa Trân Châu Hoàng Gia",
    "subtitle": "ROYAL BOBA MILK TEA",
    "tagline": "Hồng trà Ceylon đậm đà, sữa tươi thơm ngậy cùng trân châu đen dẻo dai",
    "price": 52000,
    "originalPrice": 60000,
    "category": "milk-tea",
    "image": "/teas/tra-sua-tran-chau.png",
    "bg": "#78350F",
    "panel": "#B45309",
    "description": "Ly trà sữa chuẩn vị Đài Loan truyền thống: hồng trà Ceylon ủ đậm vị hòa cùng sữa béo thơm lừng và trân châu đen ngâm đường nâu mềm dẻo nhai cực đã.",
    "ingredients": [
      "Hồng trà Ceylon hảo hạng",
      "Sữa tươi thanh trùng Đà Lạt Milk",
      "Trân châu đen đường nâu dẻo",
      "Kem béo thực vật"
    ],
    "calories": 260,
    "sweetnessDefault": 70,
    "iceDefault": 70,
    "isBestSeller": true,
    "badge": "TRÀ SỮA QUỐC DÂN",
    "flavorNotes": [
      "Trà đậm đà thơm nồng",
      "Sữa béo ngậy ngọt ngào",
      "Trân châu dẻo dai sần sật"
    ]
  },
  {
    "id": "tea-sua-olong-nuong",
    "name": "Trà Sữa Ô Long Nướng Khói",
    "subtitle": "ROASTED SMOKY OOLONG MILK TEA",
    "tagline": "Trà Ô Long sao lửa nướng khói thơm lừng, hậu vị ngọt sâu lắng quyến rũ",
    "price": 55000,
    "originalPrice": 62000,
    "category": "milk-tea",
    "image": "/teas/tra-sua-o-long-nuong.png",
    "bg": "#581C87",
    "panel": "#7E22CE",
    "description": "Lá trà Ô Long được sao rang trên than củi tạo hương khói ấm nồng đặc biệt, kết hợp sữa béo ngậy tạo nên ly trà sữa có chiều sâu vị giác khó quên.",
    "ingredients": [
      "Trà Ô Long nướng than",
      "Sữa nguyên kem nhập khẩu",
      "Caramel cháy",
      "Đường mía vàng"
    ],
    "calories": 245,
    "sweetnessDefault": 50,
    "iceDefault": 70,
    "isBestSeller": true,
    "badge": "ĐẬM ĐÀ HƯƠNG NƯỚNG",
    "flavorNotes": [
      "Hương khói ấm nồng",
      "Hậu vị trà đậm sâu",
      "Ngậy thơm béo mịn"
    ]
  },
  {
    "id": "tea-sua-matcha",
    "name": "Trà Sữa Matcha Uji Nhật Bản",
    "subtitle": "JAPANESE UJI MATCHA LATTE",
    "tagline": "Bột Matcha Uji Kyoto trứ danh, xanh mướt ngát hương quyện sữa tươi thanh béo",
    "price": 58000,
    "originalPrice": 68000,
    "category": "milk-tea",
    "image": "/teas/tra-sua-matcha.png",
    "bg": "#15803D",
    "panel": "#22C55E",
    "description": "Bột matcha thượng hạng nhập khẩu trực tiếp từ vùng Uji (Kyoto, Nhật Bản), đánh bông mềm mịn hòa cùng dòng sữa tươi thanh mát, đắng nhẹ thanh tao.",
    "ingredients": [
      "Bột Matcha Uji Kyoto nguyên chất",
      "Sữa tươi thanh trùng Đà Lạt Milk",
      "Sữa đặc cao cấp",
      "Kem tươi"
    ],
    "calories": 230,
    "sweetnessDefault": 70,
    "iceDefault": 70,
    "badge": "CHUẨN VỊ NHẬT BẢN",
    "flavorNotes": [
      "Matcha đắng thanh",
      "Sữa tươi thơm ngậy",
      "Hương cỏ non dịu nhẹ"
    ]
  },
  {
    "id": "tea-sua-khoai-mon",
    "name": "Trà Sữa Khoai Môn Tươi Dẻo",
    "subtitle": "FRESH TARO PASTE MILK TEA",
    "tagline": "Khoai môn dầm nhuyễn bùi bùi dẻo quánh cùng cốt trà sữa tím pastel mộng mơ",
    "price": 55000,
    "originalPrice": 62000,
    "category": "milk-tea",
    "image": "/teas/tra-sua-khoai-mon.png",
    "bg": "#6B21A8",
    "panel": "#A855F7",
    "description": "Củ khoai môn tươi hấp chín tán nhuyễn dẻo quánh lót dưới đáy ly, hòa quyện với dòng trà sữa béo thơm ngọt dịu và sắc tím pastel ngọt ngào.",
    "ingredients": [
      "Khoai môn tươi hấp nhuyễn",
      "Trà xanh sữa",
      "Sữa dừa béo nhẹ",
      "Thạch khoai môn"
    ],
    "calories": 275,
    "sweetnessDefault": 50,
    "iceDefault": 70,
    "badge": "BÙI BÉO DẺO DẺO",
    "flavorNotes": [
      "Khoai môn bùi bùi",
      "Ngọt dịu béo ngậy",
      "Sắc tím pastel quyến rũ"
    ]
  },
  {
    "id": "tea-sua-thai-do",
    "name": "Trà Sữa Thái Đỏ Kem Cheese",
    "subtitle": "THAI TEA WITH CHEESE FOAM",
    "tagline": "Trà Thái đỏ thơm nồng nàn sắc cam rực rỡ phủ kem phô mai mặn béo ngậy",
    "price": 52000,
    "originalPrice": 60000,
    "category": "milk-tea",
    "image": "/teas/tra-sua-thai-do.png",
    "bg": "#C2410C",
    "panel": "#F97316",
    "description": "Trà Thái đỏ ChaTraMue chuẩn xứ Chùa Vàng với mùi thơm hoa hồi và thảo mộc đặc trưng, phủ lớp kem cheese mặn béo ngậy tạo sự bùng nổ hương vị.",
    "ingredients": [
      "Cốt trà Thái đỏ ChaTraMue",
      "Sữa đặc Carnation",
      "Kem Cheese phô mai mặn",
      "Sữa tươi"
    ],
    "calories": 265,
    "sweetnessDefault": 70,
    "iceDefault": 70,
    "badge": "VỊ ĐẬM ĐÀ THÁI LAN",
    "flavorNotes": [
      "Hương thảo mộc Thái Lan",
      "Màu cam rực rỡ",
      "Kem cheese mặn béo ngậy"
    ]
  },
  {
    "id": "tea-sua-kem-trung",
    "name": "Trà Sữa Lài Sữa Tươi Kem Trứng Cháy",
    "subtitle": "JASMINE EGG BRÛLÉE MILK TEA",
    "tagline": "Lục trà lài thanh nhã cùng lớp kem trứng vàng ươm khò lửa thơm lừng béo ngậy",
    "price": 56000,
    "originalPrice": 65000,
    "category": "milk-tea",
    "image": "/teas/tra-sua-lai-kem-trung.png",
    "bg": "#B45309",
    "panel": "#F59E0B",
    "description": "Nền lục trà hoa lài thanh thoát kết hợp sữa tươi, bên trên là lớp kem trứng custard béo ngậy được rắc đường nâu và khò lửa giòn rụm thơm nức mũi.",
    "ingredients": [
      "Lục trà hoa nhài",
      "Sữa tươi thanh trùng",
      "Sốt kem trứng gà tươi",
      "Đường nâu khò lửa"
    ],
    "calories": 280,
    "sweetnessDefault": 50,
    "iceDefault": 70,
    "isBestSeller": true,
    "badge": "BEST SELLER #2",
    "flavorNotes": [
      "Kem trứng khò giòn thơm",
      "Vị béo tan chảy",
      "Hương lài thanh khiết"
    ]
  }
];
