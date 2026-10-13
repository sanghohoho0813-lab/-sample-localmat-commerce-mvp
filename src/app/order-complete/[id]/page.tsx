"use client";

import Link from "next/link";
import { use } from "react";
import { CheckCircle2, MapPin, PackageSearch, RotateCcw } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import FarmGroupHeader from "@/components/FarmGroupHeader";
import OrderTimeline from "@/components/OrderTimeline";
import PriceSummary from "@/components/PriceSummary";
import ProductImage from "@/components/ProductImage";
import { getProduct } from "@/lib/data/products";
import { groupByFarm } from "@/lib/catalog";
import { formatDate, formatWon, itemLabel } from "@/lib/format";
import { parseIsoDate, shortDay } from "@/lib/kst";
import { isFreshOrder, useAllOrders } from "@/lib/store";
import type { Product } from "@/lib/types";
import { useHydrated } from "@/lib/useHydrated";
import { useReorder } from "@/lib/useReorder";

/**
 * 주문 완료(방금 결제) / 주문 상세(지난 주문) — 같은 화면, 머리만 다릅니다.
 * 진행 단계 → 받는 분 → 농가별 상품(농가 다시 보기) → 결제 금액 → 다음 행동(주문 내역·다시 담기·쇼핑 계속).
 */
export default function OrderCompletePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const hydrated = useHydrated();
  const orders = useAllOrders();
  const reorder = useReorder();
  const order = orders.find((o) => o.id === id);

  if (!hydrated) return <div className="container-page py-24" aria-busy="true" />;

  if (!order) {
    return (
      <div className="container-page">
        <EmptyState
          as="h1"
          icon={PackageSearch}
          title="주문 정보를 찾을 수 없어요"
          description="주소가 바뀌었거나 이 기기에서 한 주문이 아니에요."
          action={{ label: "주문 내역 보기", href: "/orders" }}
          className="py-20 md:py-24"
        />
      </div>
    );
  }

  const fresh = isFreshOrder(order);
  const delivered = order.status === "delivered";
  const arrival = `${shortDay(parseIsoDate(order.expectedDelivery))} ${delivered ? "도착" : "도착 예정"}`;

  return (
    <div className="container-page max-w-2xl py-6 md:py-12">
      {/* 주문 내역에서 다시 열어 본 주문은 축하 화면 대신 담백한 주문 상세로 보여 줍니다. */}
      {!fresh ? (
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-bark-900 md:text-3xl">주문 상세</h1>
          <p className="mt-1.5 text-[16px] text-bark-500">
            {formatDate(order.createdAt)} 주문 · {order.orderNumber}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center pt-4 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-leaf-100 animate-check-pop">
            <CheckCircle2 className="h-11 w-11 text-leaf-700" strokeWidth={1.8} />
          </span>
          <h1 className="mt-5 text-xl font-extrabold tracking-tight text-bark-900 md:text-2xl">주문이 완료되었어요</h1>
          <p className="mt-2 text-[16px] leading-relaxed text-bark-600">
            <b className="text-leaf-800">{arrival}</b>이에요. 농가에서 수확·포장해 바로 보내 드릴게요.
          </p>
          <p className="mt-4 rounded-full bg-cream-200 px-4 py-1.5 text-sm font-semibold text-bark-600">
            주문번호 {order.orderNumber}
          </p>
        </div>
      )}

      <div className={`${fresh ? "mt-8" : "mt-5"} space-y-4`}>
        <section className="rounded-2xl bg-white p-4 sm:p-5" aria-labelledby="progress-title">
          <h2 id="progress-title" className="mb-4 text-base font-extrabold text-bark-900">
            주문 진행
          </h2>
          <OrderTimeline order={order} />
        </section>

        <section className="rounded-2xl bg-white p-4 sm:p-5" aria-labelledby="receiver-title">
          <h2 id="receiver-title" className="text-base font-extrabold text-bark-900">
            받는 분
          </h2>
          <p className="mt-2.5 flex items-start gap-1.5 text-[15px] text-bark-700">
            <MapPin className="mt-1 h-4 w-4 shrink-0 text-bark-400" />
            <span>
              {order.recipient} · <span className="whitespace-nowrap">{order.phone}</span>
              <br />
              {order.address}
            </span>
          </p>
          {order.requestNote && <p className="mt-2 text-sm text-bark-500">요청사항 · {order.requestNote}</p>}
        </section>

        <section className="rounded-2xl bg-white p-4 sm:p-5" aria-labelledby="items-title">
          <h2 id="items-title" className="text-base font-extrabold text-bark-900">
            주문 상품 {order.items.length}개
          </h2>
          <div className="mt-3 space-y-4">
            {groupByFarm(order.items).map((group) => {
              const groupProducts = group.items.map((i) => getProduct(i.productId)).filter((p): p is Product => !!p);
              return (
                <div key={group.farmId} className="rounded-xl border border-bark-100 px-3 pt-3 sm:px-4">
                  <FarmGroupHeader farmId={group.farmId} products={groupProducts} arrival={arrival} />
                  <ul className="divide-y divide-bark-100">
                    {group.items.map((item) => {
                      const product = getProduct(item.productId);
                      const label = itemLabel(item.name, item.unit, item.optionLabel);
                      return (
                        <li key={`${item.productId}-${item.optionLabel ?? ""}`} className="flex gap-3 py-3">
                          {product && (
                            <Link href={`/products/${product.slug}`} className="shrink-0">
                              <ProductImage product={product} className="w-14 rounded-lg" iconSize="text-xl" sizes="56px" />
                            </Link>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-sm font-medium leading-snug text-bark-800">{label.title}</p>
                            {label.option && <p className="mt-0.5 truncate text-sm text-bark-500">{label.option}</p>}
                            <div className="mt-1 flex items-baseline justify-between gap-3">
                              <p className="shrink-0 text-sm text-bark-500">{item.quantity}개</p>
                              <p className="shrink-0 text-sm font-bold text-bark-900">{formatWon(item.price * item.quantity)}</p>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 sm:p-5" aria-labelledby="pay-title">
          <h2 id="pay-title" className="mb-4 text-base font-extrabold text-bark-900">
            결제 금액
          </h2>
          <PriceSummary itemsTotal={order.itemsTotal} shippingFee={order.shippingFee} couponDiscount={order.couponDiscount} />
        </section>
      </div>

      <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
        {fresh ? (
          <>
            <Link href="/orders" className="btn-secondary h-13 text-[18px] sm:flex-1">
              주문 내역 보기
            </Link>
            <Link href="/products" className="btn-outline h-13 text-[18px] font-bold sm:flex-1">
              쇼핑 계속하기
            </Link>
          </>
        ) : (
          <>
            <button type="button" onClick={() => reorder(order.items)} className="btn-secondary h-13 text-[18px] sm:flex-1">
              <RotateCcw className="h-5 w-5" />
              같은 상품 다시 담기
            </button>
            <Link href="/orders" className="btn-outline h-13 text-[18px] font-bold sm:flex-1">
              주문 내역으로
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
