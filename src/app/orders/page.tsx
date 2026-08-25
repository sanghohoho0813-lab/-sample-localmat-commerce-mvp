"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, PackageSearch } from "lucide-react";
import ProductImage from "@/components/ProductImage";
import { getProduct } from "@/lib/data/products";
import { formatDate, formatWon } from "@/lib/format";
import { useAllOrders, useToastStore } from "@/lib/store";
import type { OrderStatus } from "@/lib/types";

const statusLabels: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: "주문접수", className: "bg-cream-200 text-bark-600" },
  paid: { label: "주문접수", className: "bg-cream-200 text-bark-600" },
  preparing: { label: "상품준비", className: "bg-leaf-100 text-leaf-700" },
  shipping: { label: "배송중", className: "bg-tangerine-100 text-tangerine-600" },
  delivered: { label: "배송완료", className: "bg-leaf-600 text-white" },
  cancelled: { label: "주문취소", className: "bg-bark-100 text-bark-500" },
};

export default function OrdersPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const orders = useAllOrders();
  const showToast = useToastStore((s) => s.show);

  return (
    <div className="container-page max-w-3xl py-6 md:py-8">
      <h1 className="mb-5 text-xl font-extrabold tracking-tight text-bark-900 md:mb-7 md:text-3xl">
        주문 내역
      </h1>

      {!mounted ? null : orders.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <PackageSearch className="h-12 w-12 text-bark-300" />
          <p className="mt-4 font-semibold text-bark-700">아직 주문 내역이 없어요</p>
          <Link href="/products" className="btn-primary mt-5 h-11 px-5 text-sm">
            쇼핑하러 가기
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = statusLabels[order.status];
            return (
              <section key={order.id} className="overflow-hidden rounded-card border border-bark-100 bg-white">
                <header className="flex items-center justify-between gap-2 border-b border-bark-100 bg-cream-50 px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${status.className}`}>
                      {status.label}
                    </span>
                    <span className="text-[13px] text-bark-500">{formatDate(order.createdAt)} 주문</span>
                  </div>
                  <Link
                    href={`/order-complete/${order.id}`}
                    className="flex items-center text-xs font-medium text-bark-400 hover:text-leaf-700"
                  >
                    상세보기
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </header>

                <ul className="divide-y divide-bark-100 px-5">
                  {order.items.map((item) => {
                    const product = getProduct(item.productId);
                    return (
                      <li key={`${item.productId}-${item.optionLabel ?? ""}`} className="flex items-center gap-3.5 py-4">
                        {product ? (
                          <Link href={`/products/${product.slug}`} className="shrink-0">
                            <ProductImage
                              product={product}
                              className="w-16 rounded-xl border border-bark-100"
                              iconSize="text-2xl"
                            />
                          </Link>
                        ) : null}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-bark-800">
                            {item.name} {item.unit}
                          </p>
                          <p className="mt-0.5 text-xs text-bark-400">
                            {item.optionLabel ? `${item.optionLabel} · ` : ""}
                            {item.quantity}개 · {formatWon(item.price * item.quantity)}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col gap-1.5">
                          {(order.status === "shipping" || order.status === "preparing") && (
                            <button
                              type="button"
                              onClick={() => showToast("산지에서 출발해 이동 중이에요! (데모)")}
                              className="btn-outline h-9 px-3 text-xs"
                            >
                              배송조회
                            </button>
                          )}
                          {order.status === "delivered" && product && (
                            <Link
                              href={`/products/${product.slug}`}
                              className="btn-outline h-9 px-3 text-xs"
                            >
                              리뷰쓰기
                            </Link>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <footer className="flex items-center justify-between border-t border-bark-100 px-5 py-3.5 text-sm">
                  <span className="text-bark-500">
                    총 {order.items.reduce((s, i) => s + i.quantity, 0)}개 상품
                  </span>
                  <span className="font-extrabold text-bark-900">{formatWon(order.totalAmount)}</span>
                </footer>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
