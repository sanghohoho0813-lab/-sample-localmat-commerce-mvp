export type CategorySlug =
  | "vegetable"
  | "fruit"
  | "meat"
  | "seafood"
  | "processed"
  | "grain"
  | "snack"
  | "gift";

export interface Category {
  id: string;
  slug: CategorySlug;
  name: string;
  emoji: string;
}

export interface Farm {
  id: string;
  slug: string;
  name: string;
  region: string;
  owner: string;
  items: string[];
  quote: string;
  intro: string;
  method: string;
  story: string[];
  since: number;
  certifications: string[];
  image?: string;
}

export type ProductBadge =
  | "제철"
  | "산지직송"
  | "무농약"
  | "유기농"
  | "동물복지"
  | "무항생제"
  | "1등급"
  | "당일수확"
  | "NEW"
  | "베스트";

export interface ProductOption {
  label: string;
  extraPrice: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  unit: string;
  categoryId: string;
  farmId: string;
  region: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  badges: ProductBadge[];
  stock: number;
  salesCount: number;
  createdRank: number; // lower = newer
  isSeasonal: boolean;
  options?: ProductOption[];
  summary: string;
  description: string[];
  storageTip: string;
  shippingNote: string;
  image?: string;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  date: string;
  content: string;
}

export interface Coupon {
  id: string;
  name: string;
  description: string;
  discountType: "percent" | "amount";
  value: number;
  minOrder: number;
  maxDiscount?: number;
  expiresAt: string;
}

export interface Address {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  zip: string;
  address1: string;
  address2: string;
  isDefault: boolean;
}

export type OrderStatus =
  | "pending"
  | "paid"
  | "preparing"
  | "shipping"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "card" | "easy" | "bank";

export interface OrderItem {
  productId: string;
  name: string;
  unit: string;
  optionLabel?: string;
  quantity: number;
  price: number; // unit price incl. option
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  items: OrderItem[];
  itemsTotal: number;
  shippingFee: number;
  couponDiscount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  recipient: string;
  phone: string;
  address: string;
  requestNote?: string;
  expectedDelivery: string;
}

export interface CartItem {
  productId: string;
  optionLabel?: string;
  quantity: number;
}
