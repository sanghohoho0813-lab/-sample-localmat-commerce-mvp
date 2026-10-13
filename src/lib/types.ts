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
  /** 카테고리 바로가기에 쓰는 대표 사진 */
  cover: string;
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
  /** 옵션끼리 무엇이 다른지 — 실제 양·용도 (예: "30~44과 · 4인 가족") */
  note?: string;
}

/** 배송 온도 — 출고 요일과 포장이 달라집니다 */
export type ShippingTemp = "냉장" | "냉동" | "상온";

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
  options?: ProductOption[];
  summary: string;
  description: string[];
  storageTip: string;
  /** 출하되는 달(1~12). 빈 배열은 연중 상품(가공·건조·축산 등) */
  season: number[];
  /** 카드에 쓰는 신선도 한 마디(7자 안팎) — 예: "주문 후 수확" */
  harvest: string;
  /** 상세의 수확·생산 설명 */
  harvestDetail: string;
  packaging: string;
  temp: ShippingTemp;
  /** 실제 크기·양 — 예: "중간 크기 15~20알 · 4인 가족 1주" */
  amount: string;
  /** 최근 90일 구매 고객 중 다시 산 고객 비율(0~1) */
  repurchaseRate: number;
  /** 주문 후 출고 전에 더 필요한 준비일(도정·제조 등) */
  leadDays?: number;
  /** 품절·시즌 준비 중일 때 안내 — stock이 0일 때만 씁니다 */
  restockNote?: string;
  image?: string;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  date: string;
  content: string;
  /** 구매한 옵션 */
  option?: string;
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
  /** 산지 출고 예정일(YYYY-MM-DD) — 주문 진행 단계에 씁니다 */
  shipDate?: string;
  expectedDelivery: string;
}

export interface CartItem {
  productId: string;
  optionLabel?: string;
  quantity: number;
}
