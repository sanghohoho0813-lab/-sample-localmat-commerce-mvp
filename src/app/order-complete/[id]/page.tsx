"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { CheckCircle2, MapPin, Truck } from "lucide-react";
import PriceSummary from "@/components/PriceSummary";
import ProductImage from "@/components/ProductImage";
import { getProduct } from "@/lib/data/products";
import { formatWon } from "@/lib/format";
import { useAllOrders } from "@/lib/store";

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

function deliveryLabel(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${DAY_NAMES[d.getDay()]})`;
}

export default function OrderCompletePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const orders = useAllOrders();
  const order = orders.find((o) => o.id === id);

  if (!mounted) return <div className="container-page py-24" />;

  if (!order) {
    return (
      <div className="container-page flex flex-col items-center py-24 text-center">
        <p className="font-semibold text-bark-700">주문 정보를 찾을 수 없어요.</p>
        <Link href="/orders" className="btn-outline mt-5 h-11 px-5 text-sm">
          주문 내역 보기
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page max-w-2xl py-10 md:py-16">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-leaf-100 animate-check-pop">
          <CheckCircle2 className="h-11 w-11 text-leaf-600" strokeWidth={1.8} />
        </span>
        <h1 className="mt-5 text-xl font-extrabold tracking-tight text-bark-900 md:text-2xl">
          주문이 완료되었어요!
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-bark-500">
          산지에서 가장 신선한 상태로 정성껏 준비해 보내드릴게요.
        </p>
        <p className="mt-4 rounded-pill bg-cream-200 px-4 py-1.5 text-[13px] font-semibold text-bark-600">
          주문번호 {order.orderNumber}
        </p>
      </div>

      <div className="mt-8 space-y-4">
        <section className="rounded-card border border-bark-100 bg-white p-5">
          <h2 className="flex items-center gap-1.5 text-sm font-extrabold text-bark-900">
            <Truck className="h-4 w-4 text-leaf-600" />
            배송 정보
          </h2>
          <p className="mt-3 text-sm font-semibold text-leaf-700">
            {deliveryLabel(order.expectedDelivery)} 도착 예정
          </p>
          <p className="mt-2 flex items-start gap-1.5 text-sm text-bark-600">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-bark-300" />
            <span>
              {order.recipient} · {order.phone}
              <br />
              {order.address}
            </span>
          </p>
          {order.requestNote && (
            <p className="mt-2 text-xs text-bark-400">요청사항 · {order.requestNote}</p>
          )}
        </section>

        <section className="rounded-card border border-bark-100 bg-white p-5">
          <h2 className="text-sm font-extrabold text-bark-900">주문 상품 {order.items.length}개</h2>
          <ul className="mt-2 divide-y divide-bark-100">
            {order.items.map((item) => {
              const product = getProduct(item.productId);
              return (
                <li key={`${item.productId}-${item.optionLabel ?? ""}`} className="flex items-center gap-3 py-3">
                  {product && (
                    <ProductImage
                      product={product}
                      className="w-14 rounded-lg border border-bark-100"
                      iconSize="text-xl"
                      sizes="56px"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-bark-800">
                      {item.name} {item.unit}
                    </p>
                    <p className="text-xs text-bark-400">
                      {item.optionLabel ? `${item.optionLabel} · ` : ""}
                      {item.quantity}개
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-bold text-bark-900">
                    {formatWon(item.price * item.quantity)}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="rounded-card border border-bark-100 bg-white p-5">
          <h2 className="mb-4 text-sm font-extrabold text-bark-900">결제 금액</h2>
          <PriceSummary
            itemsTotal={order.itemsTotal}
            shippingFee={order.shippingFee}
            couponDiscount={order.couponDiscount}
          />
        </section>
      </div>

      <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
        <Link href="/orders" className="btn-secondary h-12 flex-1 text-[15px]">
          주문 내역 보기
        </Link>
        <Link href="/products" className="btn-outline h-12 flex-1 text-[15px] font-bold">
          쇼핑 계속하기
        </Link>
      </div>
    </div>
  );
}
