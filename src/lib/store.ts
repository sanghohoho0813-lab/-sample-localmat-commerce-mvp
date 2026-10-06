"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CartItem, Order, Review } from "@/lib/types";
import { getProduct } from "@/lib/data/products";
import { demoUser, seedOrders } from "@/lib/data/etc";

// ── Cart ────────────────────────────────────────────────

const HARD_MAX = 99;

function cartKey(productId: string, optionLabel?: string) {
  return `${productId}__${optionLabel ?? ""}`;
}

/** 한 상품을 장바구니에 담을 수 있는 최대 수량 — 재고를 넘지 않습니다. */
export function maxQuantityFor(productId: string): number {
  const stock = getProduct(productId)?.stock ?? HARD_MAX;
  return Math.max(1, Math.min(stock, HARD_MAX));
}

export interface AddResult {
  /** 담긴 뒤 장바구니에 있는 이 상품(옵션)의 수량 */
  quantity: number;
  /** 재고 한도 때문에 요청한 만큼 다 담지 못했는지 */
  capped: boolean;
}

interface CartState {
  items: CartItem[];
  addItem: (productId: string, quantity: number, optionLabel?: string) => AddResult;
  updateQuantity: (productId: string, optionLabel: string | undefined, quantity: number) => void;
  removeItem: (productId: string, optionLabel?: string) => void;
  /** 삭제 되돌리기 — 원래 자리에 다시 넣습니다. */
  restoreItem: (item: CartItem, index: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (productId, quantity, optionLabel) => {
        const max = maxQuantityFor(productId);
        const key = cartKey(productId, optionLabel);
        const current = get().items.find((i) => cartKey(i.productId, i.optionLabel) === key);
        const wanted = (current?.quantity ?? 0) + quantity;
        const next = Math.min(wanted, max);
        set((state) => ({
          items: current
            ? state.items.map((i) =>
                cartKey(i.productId, i.optionLabel) === key ? { ...i, quantity: next } : i
              )
            : [...state.items, { productId, optionLabel, quantity: next }],
        }));
        return { quantity: next, capped: wanted > max };
      },
      updateQuantity: (productId, optionLabel, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            cartKey(i.productId, i.optionLabel) === cartKey(productId, optionLabel)
              ? { ...i, quantity: Math.max(1, Math.min(quantity, maxQuantityFor(productId))) }
              : i
          ),
        })),
      removeItem: (productId, optionLabel) =>
        set((state) => ({
          items: state.items.filter(
            (i) => cartKey(i.productId, i.optionLabel) !== cartKey(productId, optionLabel)
          ),
        })),
      restoreItem: (item, index) =>
        set((state) => {
          if (state.items.some((i) => cartKey(i.productId, i.optionLabel) === cartKey(item.productId, item.optionLabel))) {
            return state;
          }
          const items = [...state.items];
          items.splice(Math.min(index, items.length), 0, item);
          return { items };
        }),
      clear: () => set({ items: [] }),
    }),
    { name: "localmat-cart" }
  )
);

// ── Buy now (바로 구매) ─────────────────────────────────
// 장바구니를 거치지 않고 이 상품만 주문합니다. 장바구니에 담아 둔 다른 상품은 건드리지 않습니다.
// 새로고침해도 주문서가 유지되도록 탭 단위(sessionStorage)로만 저장합니다.

interface BuyNowState {
  item: CartItem | null;
  set: (item: CartItem | null) => void;
}

export const useBuyNowStore = create<BuyNowState>()(
  persist(
    (set) => ({
      item: null,
      set: (item) => set({ item }),
    }),
    { name: "localmat-buynow", storage: createJSONStorage(() => sessionStorage) }
  )
);

export function cartItemUnitPrice(item: CartItem): number {
  const product = getProduct(item.productId);
  if (!product) return 0;
  const extra = product.options?.find((o) => o.label === item.optionLabel)?.extraPrice ?? 0;
  return product.price + extra;
}

export function useCartCount(): number {
  return useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
}

// ── Wishlist ────────────────────────────────────────────

interface WishlistState {
  ids: string[];
  toggle: (productId: string) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (productId) =>
        set((state) => ({
          ids: state.ids.includes(productId)
            ? state.ids.filter((id) => id !== productId)
            : [productId, ...state.ids],
        })),
    }),
    { name: "localmat-wishlist" }
  )
);

// ── Orders ──────────────────────────────────────────────

interface OrderState {
  orders: Order[];
  addOrder: (order: Order) => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      orders: [],
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
    }),
    { name: "localmat-orders" }
  )
);

/**
 * 진행 중인 샘플 주문은 날짜를 오늘 기준(어제 주문 · 내일 도착)으로 맞춥니다.
 * 고정 날짜로 두면 몇 주 전 주문이 아직 '배송중'으로 보여 고장 난 것처럼 보입니다.
 * (이 훅을 쓰는 화면은 모두 마운트 후에만 그리므로 서버/클라이언트 날짜 차이가 없습니다.)
 */
function withLiveDates(order: Order): Order {
  if (order.status === "delivered" || order.status === "cancelled") return order;
  const created = new Date(order.createdAt);
  const now = new Date();
  created.setFullYear(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const arrive = new Date(now);
  arrive.setDate(now.getDate() + 1);
  const ymd = (d: Date) =>
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return {
    ...order,
    createdAt: created.toISOString(),
    orderNumber: `LM${ymd(created)}-${order.orderNumber.split("-").pop()}`,
    expectedDelivery: `${arrive.getFullYear()}-${ymd(arrive).slice(4, 6)}-${ymd(arrive).slice(6)}`,
  };
}

export function useAllOrders(): Order[] {
  const created = useOrderStore((s) => s.orders);
  return [...created, ...seedOrders.map(withLiveDates)];
}

/** 방금 결제한 주문인지 — 주문 완료 화면의 축하 문구는 이때만 보여 줍니다. */
export function isFreshOrder(order: Order): boolean {
  return !order.id.startsWith("seed-") && Date.now() - new Date(order.createdAt).getTime() < 30 * 60 * 1000;
}

// ── Recently viewed ─────────────────────────────────────

interface RecentState {
  ids: string[];
  push: (productId: string) => void;
}

export const useRecentStore = create<RecentState>()(
  persist(
    (set) => ({
      ids: [],
      push: (productId) =>
        set((state) => ({
          ids: [productId, ...state.ids.filter((id) => id !== productId)].slice(0, 12),
        })),
    }),
    { name: "localmat-recent" }
  )
);

// ── Reviews (내가 쓴 리뷰) ──────────────────────────────

export interface MyReview extends Review {
  orderId: string;
}

interface ReviewState {
  reviews: MyReview[];
  add: (input: { orderId: string; productId: string; rating: number; content: string }) => void;
}

/** 리뷰 작성자 표기 — 샘플 리뷰와 같은 형식(김*장)으로 가립니다. */
function maskName(name: string) {
  const short = name.trim().split(/\s+/).pop() ?? name;
  return short.length <= 1 ? short : `${short[0]}*${short.slice(-1)}`;
}

export const useReviewStore = create<ReviewState>()(
  persist(
    (set) => ({
      reviews: [],
      add: ({ orderId, productId, rating, content }) =>
        set((state) => ({
          reviews: [
            {
              id: `my-${Date.now()}`,
              orderId,
              productId,
              rating,
              content,
              author: maskName(demoUser.shortName),
              date: new Date().toISOString().slice(0, 10),
            },
            ...state.reviews,
          ],
        })),
    }),
    { name: "localmat-reviews" }
  )
);

export function reviewKey(orderId: string, productId: string) {
  return `${orderId}__${productId}`;
}

// ── Toast ───────────────────────────────────────────────

export interface ToastAction {
  label: string;
  /** 링크 이동 */
  href?: string;
  /** 즉시 실행 (예: 되돌리기) */
  onClick?: () => void;
}

export interface Toast {
  id: number;
  message: string;
  action?: ToastAction;
}

interface ToastState {
  toasts: Toast[];
  show: (message: string, action?: ToastAction) => void;
  dismiss: (id: number) => void;
}

let toastSeq = 0;
let toastTimer: ReturnType<typeof setTimeout> | undefined;

/**
 * 토스트는 한 번에 하나만 보여 줍니다(새 알림이 이전 알림을 대체).
 * 되돌리기처럼 누를 일이 있는 알림은 조금 더 오래 둡니다.
 */
export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  show: (message, action) => {
    const id = ++toastSeq;
    if (toastTimer) clearTimeout(toastTimer);
    set({ toasts: [{ id, message, action }] });
    toastTimer = setTimeout(
      () => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
      action?.onClick ? 4500 : 2800
    );
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
