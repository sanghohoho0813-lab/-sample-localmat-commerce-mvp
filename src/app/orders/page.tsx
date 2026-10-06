"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, ChevronRight, PackageSearch } from "lucide-react";
import OrderProgress from "@/components/OrderProgress";
import ProductImage from "@/components/ProductImage";
import ReviewModal from "@/components/ReviewModal";
import { getProduct } from "@/lib/data/products";
import { formatDate, formatWon } from "@/lib/format";
import { reviewKey, useAllOrders, useReviewStore, useToastStore } from "@/lib/store";
import type { OrderStatus, Product } from "@/lib/types";

const statusLabels: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: "주문접수", className: "bg-cream-200 text-bark-600" },
  paid: { label: "주문접수", className: "bg-cream-200 text-bark-600" },
  preparing: { label: "상품준비", className: "bg-leaf-100 text-leaf-700" },
  shipping: { label: "배송중", className: "bg-tangerine-100 text-tangerine-600" },
  delivered: { label: "배송완료", className: "bg-leaf-600 text-white" },
  cancelled: { label: "주문취소", className: "bg-bark-100 text-bark-500" },
};

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

function arrivalLabel(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return `${d.getMonth() + 1}/${d.getDate()}(${DAY_NAMES[d.getDay()]})`;
}

export default function OrdersPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const orders = useAllOrders();
  const reviews = useReviewStore((s) => s.reviews);
  const addReview = useReviewStore((s) => s.add);
  const showToast = useToastStore((s) => s.show);
  const [reviewTarget, setReviewTarget] = useState<{ orderId: string; product: Product } | null>(null);

  const reviewed = new Set(reviews.map((r) => reviewKey(r.orderId, r.productId)));
  const closeReview = useCallback(() => setReviewTarget(null), []);

  return (
    <div className="container-page max-w-3xl py-6 md:py-8">
      <h1 className="mb-5 text-xl font-extrabold tracking-tight text-bark-900 md:mb-7 md:text-3xl">
        주문 내역
      </h1>

      {!mounted ? null : orders.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <PackageSearch className="h-12 w-12 text-bark-300" />
          <p className="mt-4 font-semibold text-bark-700">아직 주문 내역이 없어요</p>
          <Link href="/products" className="btn-primary mt-5 h-12 px-6 text-[16px]">
            쇼핑하러 가기
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = statusLabels[order.status];
            const inProgress = order.status !== "delivered" && order.status !== "cancelled";
            return (
              <section key={order.id} className="overflow-hidden rounded-card border border-bark-100 bg-white">
                <header className="flex items-center justify-between gap-2 border-b border-bark-100 bg-cream-50 py-1.5 pl-5 pr-2">
                  <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-0.5">
                    <span className={`rounded-md px-2 py-0.5 text-sm font-bold ${status.className}`}>
                      {status.label}
                    </span>
                    <span className="text-[16px] text-bark-500">{formatDate(order.createdAt)}</span>
                  </div>
                  <Link
                    href={`/order-complete/${order.id}`}
                    className="flex h-11 shrink-0 items-center rounded-lg px-2 text-sm font-medium text-bark-500 hover:text-leaf-700"
                  >
                    상세보기
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </header>

                {/* 진행 중인 주문만 단계 표시 — 끝난 주문은 상태 배지로 충분합니다. */}
                {inProgress && (
                  <div className="border-b border-bark-100 px-5 pb-5 pt-4">
                    <p className="mb-4 text-[16px] font-bold text-leaf-700">
                      {arrivalLabel(order.expectedDelivery)} 도착 예정
                    </p>
                    <OrderProgress status={order.status} />
                  </div>
                )}

                <ul className="divide-y divide-bark-100 px-5">
                  {order.items.map((item) => {
                    const product = getProduct(item.productId);
                    const done = reviewed.has(reviewKey(order.id, item.productId));
                    return (
                      <li key={`${item.productId}-${item.optionLabel ?? ""}`} className="flex items-center gap-3.5 py-4">
                        {product ? (
                          <Link href={`/products/${product.slug}`} className="shrink-0">
                            <ProductImage
                              product={product}
                              className="w-16 rounded-xl border border-bark-100"
                              iconSize="text-2xl"
                              sizes="64px"
                            />
                          </Link>
                        ) : null}
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-semibold leading-snug text-bark-800">
                            {item.name} {item.unit}
                          </p>
                          <p className="mt-0.5 text-sm text-bark-400">
                            {item.quantity}개 · {formatWon(item.price * item.quantity)}
                          </p>
                        </div>
                        {order.status === "delivered" &&
                          product &&
                          (done ? (
                            <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-leaf-700">
                              <CheckCircle2 className="h-4 w-4" />
                              작성 완료
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setReviewTarget({ orderId: order.id, product })}
                              className="btn-outline h-11 shrink-0 px-3.5 text-sm font-semibold"
                            >
                              리뷰쓰기
                            </button>
                          ))}
                      </li>
                    );
                  })}
                </ul>

                <footer className="flex items-center justify-between border-t border-bark-100 px-5 py-3.5 text-[16px]">
                  <span className="text-bark-500">결제 금액</span>
                  <span className="font-extrabold text-bark-900">{formatWon(order.totalAmount)}</span>
                </footer>
              </section>
            );
          })}
        </div>
      )}

      {reviewTarget && (
        <ReviewModal
          product={reviewTarget.product}
          onClose={closeReview}
          onSubmit={({ rating, content }) => {
            addReview({ orderId: reviewTarget.orderId, productId: reviewTarget.product.id, rating, content });
            setReviewTarget(null);
            showToast("리뷰를 등록했어요.", {
              label: "확인하기",
              href: `/products/${reviewTarget.product.slug}#reviews`,
            });
          }}
        />
      )}
    </div>
  );
}
