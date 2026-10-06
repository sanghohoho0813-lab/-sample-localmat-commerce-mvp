"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CartItem, Order, Review } from "@/lib/types";
import { demoUser, seedOrders } from "@/lib/data/etc";
import { withLiveDates } from "@/lib/orders";
import {
  cartKey,
  maxQuantityFor,
  sanitizeCartItems,
  sanitizeOrders,
  sanitizeProductIds,
  sanitizeReviews,
} from "@/lib/persisted";

export { maxQuantityFor };

/**
 * 저장 형식 버전 — 형식을 바꾸면 올리고 migrate를 추가합니다.
 * 읽어 온 값은 항상 merge 단계에서 검증한 뒤에만 상태로 올립니다(src/lib/persisted.ts).
 */
const STORAGE_VERSION = 1;

/**
 * 버전이 다른(이전 앱이 남긴) 저장값도 버리지 않고 그대로 넘깁니다 — 검증·정리는 각 store의 merge가 합니다.
 * migrate가 없으면 zustand는 버전이 다른 저장값을 통째로 버려서, 업데이트 직후 장바구니가 비어 버립니다.
 */
const keepPersisted = (persisted: unknown) => persisted as never;

// ── Cart ────────────────────────────────────────────────

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
    {
      name: "localmat-cart",
      version: STORAGE_VERSION,
      migrate: keepPersisted,
      merge: (persisted, current) => ({
        ...current,
        items: sanitizeCartItems((persisted as Partial<CartState> | undefined)?.items),
      }),
    }
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
    {
      name: "localmat-buynow",
      version: STORAGE_VERSION,
      migrate: keepPersisted,
      storage: createJSONStorage(() => sessionStorage),
      merge: (persisted, current) => ({
        ...current,
        item: sanitizeCartItems([(persisted as Partial<BuyNowState> | undefined)?.item])[0] ?? null,
      }),
    }
  )
);

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
    {
      name: "localmat-wishlist",
      version: STORAGE_VERSION,
      migrate: keepPersisted,
      merge: (persisted, current) => ({
        ...current,
        ids: sanitizeProductIds((persisted as Partial<WishlistState> | undefined)?.ids),
      }),
    }
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
    {
      name: "localmat-orders",
      version: STORAGE_VERSION,
      migrate: keepPersisted,
      merge: (persisted, current) => ({
        ...current,
        orders: sanitizeOrders((persisted as Partial<OrderState> | undefined)?.orders),
      }),
    }
  )
);

export function useAllOrders(): Order[] {
  const created = useOrderStore((s) => s.orders);
  return [...created, ...seedOrders.map((order) => withLiveDates(order))];
}

export { isFreshOrder } from "@/lib/orders";

// ── Recently viewed ─────────────────────────────────────

const RECENT_LIMIT = 12;

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
          ids: [productId, ...state.ids.filter((id) => id !== productId)].slice(0, RECENT_LIMIT),
        })),
    }),
    {
      name: "localmat-recent",
      version: STORAGE_VERSION,
      migrate: keepPersisted,
      merge: (persisted, current) => ({
        ...current,
        ids: sanitizeProductIds((persisted as Partial<RecentState> | undefined)?.ids, RECENT_LIMIT),
      }),
    }
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
    {
      name: "localmat-reviews",
      version: STORAGE_VERSION,
      migrate: keepPersisted,
      merge: (persisted, current) => ({
        ...current,
        reviews: sanitizeReviews<MyReview>((persisted as Partial<ReviewState> | undefined)?.reviews),
      }),
    }
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

// ── 탭 간 동기화 ────────────────────────────────────────
// 다른 탭에서 장바구니·찜·주문이 바뀌면(storage 이벤트) 이 탭도 저장값을 다시 읽어
// 헤더 배지와 목록이 서로 어긋나지 않게 합니다.
if (typeof window !== "undefined") {
  const synced = [useCartStore, useWishlistStore, useOrderStore, useRecentStore, useReviewStore];
  window.addEventListener("storage", (event) => {
    for (const store of synced) {
      if (event.key === store.persist.getOptions().name) void store.persist.rehydrate();
    }
  });
}
