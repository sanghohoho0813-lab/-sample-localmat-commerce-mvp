"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductImage from "@/components/ProductImage";
import QuickAddButton from "@/components/QuickAddButton";
import { getProduct } from "@/lib/data/products";
import { formatPrice } from "@/lib/format";
import { kstNow, shortDay } from "@/lib/kst";
import { buyAgainItems } from "@/lib/orders";
import { isAvailable } from "@/lib/season";
import { useAllOrders } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";

/** 다시 온 단골의 출발점 — 지난번에 산 상품을 한 번에 다시 담습니다(지금 살 수 있는 것만). */
export default function BuyAgain() {
  const hydrated = useHydrated();
  const orders = useAllOrders();
  if (!hydrated) return null;
  const items = buyAgainItems(orders, 10)
    .map((e) => ({ ...e, product: getProduct(e.productId) }))
    .filter((e) => e.product && isAvailable(e.product))
    .slice(0, 8);
  if (items.length === 0) return null;

  return (
    <section className="container-page" aria-labelledby="buy-again-title">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-leaf-700">또 필요하실 때</p>
          <h2 id="buy-again-title" className="mt-0.5 text-xl font-bold tracking-tight text-bark-900 md:text-2xl">
            지난번에 산 상품
          </h2>
        </div>
        <Link
          href="/orders"
          className="flex shrink-0 items-center gap-1 text-sm font-semibold text-bark-600 transition-colors hover:text-leaf-700"
        >
          주문 내역
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <ul className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-none sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0 lg:grid-cols-8">
        {items.map(({ product, orderedAt }) => (
          <li key={product!.id} className="relative w-[7.5rem] shrink-0 md:w-auto">
            <div className="relative">
              <ProductImage product={product!} className="w-full rounded-xl" iconSize="text-2xl" sizes="(max-width: 767px) 120px, 160px" />
              <QuickAddButton product={product!} className="absolute bottom-1.5 right-1.5 z-10 shadow-soft" />
            </div>
            <Link
              href={`/products/${product!.slug}`}
              className="mt-2 block truncate text-sm font-medium text-bark-800 after:absolute after:inset-0 after:content-[''] hover:text-leaf-800 focus-ring"
            >
              {product!.name}
            </Link>
            <p className="text-sm font-bold text-bark-900">{formatPrice(product!.price)}원</p>
            <p className="text-xs text-bark-500">{shortDay(kstNow(new Date(orderedAt)).date)} 구매</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
