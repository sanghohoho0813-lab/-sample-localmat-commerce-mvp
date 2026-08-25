"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Order } from "@/lib/types";
import { getProduct } from "@/lib/data/products";
import { seedOrders } from "@/lib/data/etc";

// ── Cart ────────────────────────────────────────────────

function cartKey(productId: string, optionLabel?: string) {
  return `${productId}__${optionLabel ?? ""}`;
}

interface CartState {
  items: CartItem[];
  addItem: (productId: string, quantity: number, optionLabel?: string) => void;
  updateQuantity: (productId: string, optionLabel: string | undefined, quantity: number) => void;
  removeItem: (productId: string, optionLabel?: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (productId, quantity, optionLabel) =>
        set((state) => {
          const key = cartKey(productId, optionLabel);
          const existing = state.items.find((i) => cartKey(i.productId, i.optionLabel) === key);
          if (existing) {
            return {
              items: state.items.map((i) =>
                cartKey(i.productId, i.optionLabel) === key
                  ? { ...i, quantity: Math.min(i.quantity + quantity, 99) }
                  : i
              ),
            };
          }
          return { items: [...state.items, { productId, optionLabel, quantity }] };
        }),
      updateQuantity: (productId, optionLabel, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            cartKey(i.productId, i.optionLabel) === cartKey(productId, optionLabel)
              ? { ...i, quantity: Math.max(1, Math.min(quantity, 99)) }
              : i
          ),
        })),
      removeItem: (productId, optionLabel) =>
        set((state) => ({
          items: state.items.filter(
            (i) => cartKey(i.productId, i.optionLabel) !== cartKey(productId, optionLabel)
          ),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "localmat-cart" }
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

export function useAllOrders(): Order[] {
  const created = useOrderStore((s) => s.orders);
  return [...created, ...seedOrders];
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

// ── Toast ───────────────────────────────────────────────

export interface Toast {
  id: number;
  message: string;
  actionLabel?: string;
  actionHref?: string;
}

interface ToastState {
  toasts: Toast[];
  show: (message: string, action?: { label: string; href: string }) => void;
  dismiss: (id: number) => void;
}

let toastSeq = 0;

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  show: (message, action) => {
    const id = ++toastSeq;
    set((state) => ({
      toasts: [...state.toasts.slice(-2), { id, message, actionLabel: action?.label, actionHref: action?.href }],
    }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 2600);
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
