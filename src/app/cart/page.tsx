"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ShoppingCart, Trash2, Truck } from "lucide-react";
import FreeShippingBar from "@/components/FreeShippingBar";
import PriceSummary from "@/components/PriceSummary";
import ProductCard from "@/components/ProductCard";
import ProductImage from "@/components/ProductImage";
import QuantityStepper from "@/components/QuantityStepper";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE, addresses } from "@/lib/data/etc";
import { getProduct, products } from "@/lib/data/products";
import { expectedDeliveryDate, formatWon } from "@/lib/format";
import { cartItemUnitPrice, useCartStore, useToastStore } from "@/lib/store";

export default function CartPage() {
  // persist rehydration guard (SSR renders empty cart)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const showToast = useToastStore((s) => s.show);

  const visibleItems = mounted ? items : [];
  const itemsTotal = visibleItems.reduce(
    (sum, i) => sum + cartItemUnitPrice(i) * i.quantity,
    0
  );
  const shippingFee = itemsTotal === 0 || itemsTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = itemsTotal + shippingFee;
  const delivery = expectedDeliveryDate(1);
  const defaultAddress = addresses.find((a) => a.isDefault)!;

  // 함께 담으면 좋은 상품: 담긴 상품과 같은 산지를 우선하고, 모자라면 인기순으로 채웁니다.
  const recommended = useMemo(() => {
    const inCart = new Set(visibleItems.map((i) => i.productId));
    const farmIds = new Set(
      visibleItems.map((i) => getProduct(i.productId)?.farmId).filter(Boolean)
    );
    const pool = products.filter((p) => !inCart.has(p.id));
    const sameFarm = pool.filter((p) => farmIds.has(p.farmId));
    const rest = [...pool]
      .filter((p) => !farmIds.has(p.farmId))
      .sort((a, b) => b.salesCount - a.salesCount);
    return [...sameFarm, ...rest].slice(0, 4);
  }, [visibleItems]);

  if (mounted && visibleItems.length === 0) {
    return (
      <div className="container-page flex flex-col items-center py-24 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-cream-200 text-bark-300">
          <ShoppingCart className="h-9 w-9" />
        </span>
        <h1 className="mt-5 text-lg font-extrabold text-bark-900">장바구니가 비어 있어요</h1>
        <p className="mt-2 text-sm text-bark-500">오늘 가장 신선한 제철 먹거리를 만나보세요.</p>
        <Link href="/products?filter=seasonal" className="btn-primary mt-6 h-12 px-6 text-[18px]">
          제철 상품 보러가기
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-6 md:py-8">
      <h1 className="mb-5 text-xl font-extrabold tracking-tight text-bark-900 md:mb-7 md:text-3xl">
        장바구니
      </h1>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start lg:gap-10">
        {/* Items */}
        <div className="space-y-4">
          <FreeShippingBar itemsTotal={itemsTotal} />

          <ul className="divide-y divide-bark-100 rounded-card border border-bark-100 bg-white px-4 md:px-5">
            {visibleItems.map((item) => {
              const product = getProduct(item.productId);
              if (!product) return null;
              const unitPrice = cartItemUnitPrice(item);
              return (
                <li key={`${item.productId}-${item.optionLabel ?? ""}`} className="flex gap-3.5 py-4 md:gap-4 md:py-5">
                  <Link href={`/products/${product.slug}`} className="shrink-0">
                    <ProductImage
                      product={product}
                      className="w-20 rounded-xl border border-bark-100 md:w-24"
                      iconSize="text-2xl"
                      sizes="96px"
                    />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          href={`/products/${product.slug}`}
                          className="line-clamp-2 text-sm font-semibold text-bark-800 hover:text-leaf-700"
                        >
                          {product.name} {product.unit}
                        </Link>
                        {item.optionLabel && (
                          <p className="mt-0.5 text-xs text-bark-400">옵션: {item.optionLabel}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        aria-label="삭제"
                        onClick={() => {
                          removeItem(item.productId, item.optionLabel);
                          showToast("상품을 장바구니에서 뺐어요.");
                        }}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-bark-300 transition-colors hover:bg-cream-100 hover:text-bark-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-end justify-between pt-3">
                      <QuantityStepper
                        size="sm"
                        value={item.quantity}
                        onChange={(q) => updateQuantity(item.productId, item.optionLabel, q)}
                      />
                      <p className="text-base font-extrabold text-bark-900">
                        {formatWon(unitPrice * item.quantity)}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2.5 rounded-card bg-leaf-50 px-4 py-3.5 text-[16px] text-bark-600">
            <Truck className="h-4 w-4 shrink-0 text-leaf-600" />
            <span>
              <b className="text-leaf-700">{defaultAddress.address1}</b>으로{" "}
              오늘 주문하면 <b className="text-leaf-700">{delivery.label}</b> 도착 예정 · 산지직송·무료배송
            </span>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-32">
          <div className="rounded-card border border-bark-100 bg-white p-5">
            <h2 className="mb-4 text-base font-extrabold text-bark-900">결제 예정 금액</h2>
            <PriceSummary itemsTotal={itemsTotal} shippingFee={shippingFee} />
            <Link
              href="/checkout"
              className="btn-primary mt-5 hidden h-14 w-full text-[18px] md:flex"
            >
              {formatWon(total)} 주문하기
            </Link>
          </div>
        </div>
      </div>

      {/* 함께 담으면 좋은 상품 — 무료배송 기준을 채우도록 유도합니다. */}
      {recommended.length > 0 && (
        <section className="mt-12 border-t border-bark-100 pt-8 md:mt-16">
          <h2 className="mb-1 text-lg font-extrabold text-bark-900 md:text-2xl">
            함께 담으면 좋은 상품
          </h2>
          <p className="mb-5 text-sm text-bark-500">
            {shippingFee > 0
              ? `${formatWon(FREE_SHIPPING_THRESHOLD - itemsTotal)}만 더 담으면 무료배송이에요.`
              : "같은 산지에서 함께 보내드릴 수 있어요."}
          </p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-4 md:gap-x-5">
            {recommended.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile sticky CTA */}
      <div
        className="fixed inset-x-0 bottom-16 z-30 border-t border-bark-100 bg-white/95 px-4 py-2.5 backdrop-blur md:hidden"
        style={{ paddingBottom: "max(10px, env(safe-area-inset-bottom))" }}
      >
        <Link href="/checkout" className="btn-primary h-13 w-full text-[18px]">
          {formatWon(total)} 주문하기
        </Link>
      </div>
      <div className="h-16 md:hidden" />
    </div>
  );
}
