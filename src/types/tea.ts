export interface Topping {
  id: string;
  name: string;
  price: number;
  isAvailable?: boolean; // true = còn hàng, false = tạm hết
  category?: string; // 'Trân châu' | 'Thạch & Trái cây' | 'Kem & Bọt' | 'Hạt ngũ cốc' | 'Khác'
}

export interface DiningTable {
  id: string;
  name: string;
  zone?: string; // Khu vực: Tầng 1, Tầng 2, Sân vườn, VIP...
  capacity?: number; // Số ghế: 2, 4, 6, 8...
  isActive?: boolean;
  notes?: string;
}

export interface FruitTeaItem {
  id: string;
  name: string;
  subtitle: string;
  tagline: string;
  price: number;
  originalPrice?: number;
  category: 'fruit-tea' | 'milk-tea' | 'smoothie' | 'signature';
  image: string;
  bg: string;
  panel: string;
  description: string;
  ingredients: string[];
  calories: number;
  sweetnessDefault: number; // 0, 30, 50, 70, 100
  iceDefault: number; // 0, 30, 50, 70, 100
  isBestSeller?: boolean;
  isNew?: boolean;
  isSeasonal?: boolean;
  badge?: string;
  flavorNotes: string[];
}

export interface CartItem {
  cartItemId: string;
  tea: FruitTeaItem;
  size: 'M' | 'L';
  sugar: number; // 0, 30, 50, 70, 100
  ice: number; // 0, 50, 70, 100
  toppings: Topping[];
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  note?: string;
}

export interface OrderCustomerInfo {
  servingType: 'dine-in' | 'delivery' | 'takeaway';
  tableNumber?: string; // Số bàn (Bàn 01, Bàn 02...)
  name: string;
  phone: string;
  address: string;
  paymentMethod: 'cod' | 'vietqr' | 'momo';
  deliveryTime: 'now' | 'schedule';
  note: string;
}
