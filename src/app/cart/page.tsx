"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ShoppingCart, Ticket, Trash2 } from "lucide-react";
import { EtaLine } from "@/components/DeliveryEta";
import EmptyState from "@/components/EmptyState";
import FarmGroupHeader from "@/components/FarmGroupHeader";
import FreeShippingBar from "@/components/FreeShippingBar";
import ProductCard from "@/components/ProductCard";
import ProductImage from "@/components/ProductImage";
import QuantityStepper from "@/components/QuantityStepper";
import { getFarm } from "@/lib/data/farms";
import { getProduct } from "@/lib/data/products";
import { groupByFarm } from "@/lib/catalog";
import { formatWon, itemLabel } from "@/lib/format";
import { orderableItems } from "@/lib/persisted";
import { couponOptions, freeShippingGap, summarize, unitPrice as unitPriceOf } from "@/lib/pricing";
import { cartSuggestions } from "@/lib/recommend";
import { maxQuantityFor, useCartStore, useToastStore } from "@/lib/store";
import type { CartItem, Product } from "@/lib/types";
import { useHydrated } from "@/lib/useHydrated";

const LOW_STOCK_THRESHOLD = 30;

export default function CartPage() {
  const hydrated = useHydrated();

  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const restoreItem = useCartStore((s) => s.restoreItem);
  const changeOption = useCartStore((s) => s.changeOption);
  const showToast = useToastStore((s) => s.show);

  const visibleItems = useMemo(() => (hydrated ? items : []), [hydrated, items]);
  // 품절된 상품은 장바구니에 남겨 '품절'로 보여 주되, 금액·주문에서는 뺍니다.
  const orderable = useMemo(() => orderableItems(visibleItems), [visibleItems]);
  const soldOutCount = visibleItems.length - orderable.length;
  const { itemsTotal, shippingFee } = summarize(orderable);
  // 주문서에서 자동으로 적용될 쿠폰을 미리 보여 줘, 장바구니 금액과 결제 금액이 달라 보이지 않게 합니다.
  const coupon = couponOptions(itemsTotal);
  const bestCoupon = coupon.usable[0];
  const expected = summarize(orderable, bestCoupon?.coupon.id ?? null);
  const groups = groupByFarm(visibleItems);
  const orderableProducts = orderable.map((i) => getProduct(i.productId)).filter((p): p is Product => !!p);

  const suggestions = useMemo(() => cartSuggestions(orderable, itemsTotal), [orderable, itemsTotal]);

  function remove(item: CartItem) {
    const index = items.indexOf(item);
    removeItem(item.productId, item.optionLabel);
    showToast("장바구니에서 뺐어요.", { label: "되돌리기", onClick: () => restoreItem(item, index) });
  }

  // 저장된 장바구니를 읽기 전에는 '0원 주문하기' 같은 빈 화면이 번쩍이지 않게 자리만 잡아 둡니다.
  if (!hydrated) {
    return (
      <div className="container-page py-6 md:py-8" aria-busy="true">
        <h1 className="mb-5 text-xl font-extrabold tracking-tight text-bark-900 md:mb-7 md:text-3xl">장바구니</h1>
        <div className="h-48 animate-pulse rounded-2xl bg-white/70" />
      </div>
    );
  }

  if (visibleItems.length === 0) {
    return (
      <div className="container-page">
        <EmptyState
          as="h1"
          icon={ShoppingCart}
          title="장바구니가 비어 있어요"
          description="지금 출하 중인 제철 먹거리부터 둘러보세요."
          action={{ label: "제철 상품 보러가기", href: "/products?filter=seasonal" }}
          className="py-20 md:py-24"
        />
      </div>
    );
  }

  const checkoutLabel = orderable.length > 0 ? `${formatWon(expected.total)} 주문하기` : "주문할 수 있는 상품이 없어요";

  return (
    <div className="container-page py-6 md:py-8">
      <h1 className="mb-5 text-xl font-extrabold tracking-tight text-bark-900 md:mb-7 md:text-3xl">
        장바구니 <span className="text-bark-400">{visibleItems.length}</span>
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start lg:gap-10">
        <div className="space-y-4">
          {orderable.length > 0 && <FreeShippingBar itemsTotal={itemsTotal} />}

          {soldOutCount > 0 && (
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-bark-900 px-4 py-3 text-white" role="status">
              <p className="text-sm">
                <b>품절·시즌 준비 중인 상품 {soldOutCount}개</b>는 주문에서 빠져요.
              </p>
              <button
                type="button"
                onClick={() => visibleItems.filter((i) => !orderable.includes(i)).forEach((i) => removeItem(i.productId, i.optionLabel))}
                className="h-9 shrink-0 rounded-lg bg-white/15 px-3 text-sm font-semibold hover:bg-white/25"
              >
                모두 삭제
              </button>
            </div>
          )}

          {/* 농가별 묶음 — 같은 농가 상품은 한 상자로 함께 출발합니다 */}
          {groups.map((group) => {
            const groupProducts = group.items.map((i) => getProduct(i.productId)).filter((p): p is Product => !!p);
            return (
              <section
                key={group.farmId}
                className="rounded-2xl bg-white px-4 pt-4 md:px-5"
                aria-label={`${getFarm(group.farmId)?.name ?? "농가"}에서 보내는 상품`}
              >
                <FarmGroupHeader farmId={group.farmId} products={groupProducts} />
                <ul className="divide-y divide-bark-100">
                  {group.items.map((item) => {
                    const product = getProduct(item.productId);
                    if (!product) return null;
                    const soldOut = product.stock === 0;
                    const label = itemLabel(product.name, product.unit, item.optionLabel);
                    const max = maxQuantityFor(item.productId);
                    return (
                      <li key={`${item.productId}-${item.optionLabel ?? ""}`} className="flex gap-3.5 py-4 md:gap-4">
                        <Link href={`/products/${product.slug}`} className="shrink-0">
                          <ProductImage
                            product={product}
                            className={`w-14 rounded-xl min-[360px]:w-16 sm:w-20 md:w-24 ${soldOut ? "opacity-50" : ""}`}
                            iconSize="text-2xl"
                            sizes="96px"
                          />
                        </Link>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={`/products/${product.slug}`}
                              className={`line-clamp-2 min-w-0 text-[15px] font-semibold leading-snug hover:text-leaf-700 ${soldOut ? "text-bark-500" : "text-bark-900"}`}
                            >
                              {label.title}
                            </Link>
                            {/* 실수로 지워도 바로 되돌릴 수 있게 — 확인 창 대신 되돌리기 */}
                            <button
                              type="button"
                              aria-label={`${product.name} 삭제`}
                              onClick={() => remove(item)}
                              className="-mr-2 -mt-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-bark-400 transition-colors hover:bg-cream-100 hover:text-bark-600 focus-ring"
                            >
                              <Trash2 className="h-[18px] w-[18px]" />
                            </button>
                          </div>
                          {/* 옵션 바꾸기 — 장바구니에서 바로. 삭제 버튼 아래까지 너비를 다 써서 좁은 화면에서도 옵션명이 잘리지 않게 */}
                          {product.options && !soldOut ? (
                            <label className="mt-1.5 block">
                              <span className="sr-only">{product.name} 옵션</span>
                              <select
                                value={item.optionLabel}
                                onChange={(e) => {
                                  changeOption(product.id, item.optionLabel, e.target.value);
                                  showToast(`옵션을 '${e.target.value}'(으)로 바꿨어요.`);
                                }}
                                className="h-9 w-full truncate rounded-lg border border-bark-200 bg-white pl-2.5 pr-7 text-[15px] text-bark-800 outline-none focus:border-leaf-500 sm:w-auto sm:max-w-full"
                              >
                                {product.options.map((o) => (
                                  <option key={o.label} value={o.label}>
                                    {o.label}
                                    {o.extraPrice > 0 ? ` +${formatWon(o.extraPrice)}` : ""}
                                  </option>
                                ))}
                              </select>
                            </label>
                          ) : (
                            label.option && <p className="mt-0.5 text-sm text-bark-500">{item.optionLabel}</p>
                          )}

                          {soldOut ? (
                            <p className="mt-auto pt-3 text-sm font-semibold text-bark-600">
                              다음 수확 준비 중 · {product.restockNote}
                            </p>
                          ) : (
                            <>
                              {/* 아주 좁은 화면에서 큰 금액은 수량 아래 줄로 내려가도록 줄바꿈을 허용합니다. */}
                              <div className="mt-auto flex flex-wrap items-end justify-between gap-x-3 gap-y-2 pt-3">
                                <QuantityStepper
                                  size="sm"
                                  value={item.quantity}
                                  max={max}
                                  onChange={(q) => updateQuantity(item.productId, item.optionLabel, q)}
                                />
                                <p className="ml-auto text-base font-extrabold text-bark-900">
                                  {formatWon(unitPriceOf(item) * item.quantity)}
                                </p>
                              </div>
                              {item.quantity >= max && product.stock <= LOW_STOCK_THRESHOLD && (
                                <p className="mt-1.5 text-sm text-tangerine-700">이번 수확분이 {product.stock}개라 더 담을 수 없어요.</p>
                              )}
                            </>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}

          {groups.length > 1 && (
            <p className="px-1 text-sm text-bark-500">
              농가 {groups.length}곳에서 각각 출발해요. 배송비는 농가 수와 관계없이 한 번만 받아요.
            </p>
          )}
        </div>

        {/* 주문 요약 */}
        <aside className="lg:sticky lg:top-32" aria-label="주문 요약">
          <div className="rounded-2xl bg-white p-5">
            <h2 className="text-base font-extrabold text-bark-900">주문 요약</h2>
            <dl className="mt-4 space-y-2.5 text-[15px]">
              <div className="flex justify-between text-bark-600">
                <dt>상품금액</dt>
                <dd className="font-medium text-bark-900">{formatWon(itemsTotal)}</dd>
              </div>
              <div className="flex justify-between text-bark-600">
                <dt>배송비</dt>
                <dd className="font-medium text-bark-900">{shippingFee === 0 ? "무료" : formatWon(shippingFee)}</dd>
              </div>
              <div className="flex items-start justify-between gap-3 text-bark-600">
                <dt className="flex items-center gap-1">
                  <Ticket className="h-4 w-4 text-tangerine-600" aria-hidden />
                  쿠폰
                </dt>
                <dd className="text-right">
                  {bestCoupon ? (
                    <>
                      <span className="font-semibold text-tangerine-700">-{formatWon(bestCoupon.discount)}</span>
                      <span className="block text-xs text-bark-500">{bestCoupon.coupon.name} · 주문서에서 자동 적용</span>
                    </>
                  ) : coupon.nextGap !== null && itemsTotal > 0 ? (
                    <span className="text-sm text-bark-500">{formatWon(coupon.nextGap)} 더 담으면 쿠폰 사용 가능</span>
                  ) : (
                    <span className="text-sm text-bark-500">없음</span>
                  )}
                </dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-bark-100 pt-3">
                <dt className="font-bold text-bark-900">예상 결제 금액</dt>
                <dd className="text-xl font-extrabold text-tangerine-700">{formatWon(expected.total)}</dd>
              </div>
            </dl>
            {orderableProducts.length > 0 && (
              <p className="mt-3 text-sm text-bark-600">
                <EtaLine products={orderableProducts} />
              </p>
            )}
            {orderable.length > 0 ? (
              <Link href="/checkout" className="btn-primary mt-5 hidden h-14 w-full text-[18px] md:flex">
                {checkoutLabel}
              </Link>
            ) : (
              <p className="mt-5 hidden h-14 items-center justify-center rounded-xl bg-bark-100 font-semibold text-bark-500 md:flex">
                {checkoutLabel}
              </p>
            )}
          </div>
        </aside>
      </div>

      {/* 함께 담으면 좋은 상품 — 추천마다 근거(무료배송 완성·짝·같은 농가)를 붙입니다 */}
      {suggestions.length > 0 && (
        <section className="mt-12 border-t border-bark-100 pt-8 md:mt-16" aria-labelledby="cart-suggest-title">
          <h2 id="cart-suggest-title" className="mb-1 text-lg font-extrabold text-bark-900 md:text-2xl">
            함께 담으면 좋은 상품
          </h2>
          <p className="mb-5 text-sm text-bark-500">
            {shippingFee > 0
              ? `${formatWon(freeShippingGap(itemsTotal))}만 더 담으면 무료배송이에요.`
              : "담은 상품과 잘 어울리는 상품이에요."}
          </p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-4 md:gap-x-5">
            {suggestions.map((r) => (
              <ProductCard key={r.product.id} product={r.product} reason={r.reason} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile sticky CTA */}
      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-bark-100 bg-white/95 px-4 pt-2.5 backdrop-blur md:hidden"
        style={{ paddingBottom: "max(10px, env(safe-area-inset-bottom))" }}
      >
        {orderable.length > 0 ? (
          <Link href="/checkout" className="btn-primary h-13 w-full text-[18px]">
            {checkoutLabel}
          </Link>
        ) : (
          <p className="flex h-13 w-full items-center justify-center rounded-xl bg-bark-100 font-semibold text-bark-500">
            {checkoutLabel}
          </p>
        )}
      </div>
    </div>
  );
}
