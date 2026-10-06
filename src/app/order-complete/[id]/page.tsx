"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { CheckCircle2, MapPin, Truck } from "lucide-react";
import OrderProgress from "@/components/OrderProgress";
import PriceSummary from "@/components/PriceSummary";
import ProductImage from "@/components/ProductImage";
import { getProduct } from "@/lib/data/products";
import { formatDate, formatWon, itemLabel } from "@/lib/format";
import { isFreshOrder, useAllOrders } from "@/lib/store";

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
        <Link href="/orders" className="btn-outline mt-5 h-12 px-5 text-[16px]">
          주문 내역 보기
        </Link>
      </div>
    );
  }

  const fresh = isFreshOrder(order);

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
            <CheckCircle2 className="h-11 w-11 text-leaf-600" strokeWidth={1.8} />
          </span>
          <h1 className="mt-5 text-xl font-extrabold tracking-tight text-bark-900 md:text-2xl">
            주문이 완료되었어요!
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-bark-500">
            산지에서 가장 신선한 상태로 정성껏 준비해 보내드릴게요.
          </p>
          <p className="mt-4 rounded-pill bg-cream-200 px-4 py-1.5 text-[16px] font-semibold text-bark-600">
            주문번호 {order.orderNumber}
          </p>
        </div>
      )}

      <div className={`${fresh ? "mt-8" : "mt-5"} space-y-4`}>
        <section className="rounded-card border border-bark-100 bg-white p-5 pb-6">
          <OrderProgress status={order.status} />
        </section>

        <section className="rounded-card border border-bark-100 bg-white p-5">
          <h2 className="flex items-center gap-1.5 text-base font-extrabold text-bark-900">
            <Truck className="h-4 w-4 text-leaf-600" />
            배송 정보
          </h2>
          <p className="mt-3 text-[16px] font-semibold text-leaf-700">
            {deliveryLabel(order.expectedDelivery)} {order.status === "delivered" ? "도착" : "도착 예정"}
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
            <p className="mt-2 text-sm text-bark-400">요청사항 · {order.requestNote}</p>
          )}
        </section>

        <section className="rounded-card border border-bark-100 bg-white p-5">
          <h2 className="text-base font-extrabold text-bark-900">주문 상품 {order.items.length}개</h2>
          <ul className="mt-2 divide-y divide-bark-100">
            {order.items.map((item) => {
              const product = getProduct(item.productId);
              const label = itemLabel(item.name, item.unit, item.optionLabel);
              return (
                <li key={`${item.productId}-${item.optionLabel ?? ""}`} className="flex gap-3 py-3">
                  {product && (
                    <Link href={`/products/${product.slug}`} className="shrink-0">
                      <ProductImage
                        product={product}
                        className="w-14 rounded-lg border border-bark-100"
                        iconSize="text-xl"
                        sizes="56px"
                      />
                    </Link>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium leading-snug text-bark-800">{label.title}</p>
                    <div className="mt-1 flex items-baseline justify-between gap-3">
                      <p className="min-w-0 truncate text-sm text-bark-400">
                        {label.option ? `${label.option} · ` : ""}
                        {item.quantity}개
                      </p>
                      <p className="shrink-0 text-sm font-bold text-bark-900">
                        {formatWon(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="rounded-card border border-bark-100 bg-white p-5">
          <h2 className="mb-4 text-base font-extrabold text-bark-900">결제 금액</h2>
          <PriceSummary
            itemsTotal={order.itemsTotal}
            shippingFee={order.shippingFee}
            couponDiscount={order.couponDiscount}
          />
        </section>
      </div>

      <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
        <Link href="/orders" className="btn-secondary h-13 text-[18px] sm:flex-1">
          {fresh ? "주문 내역 보기" : "주문 내역으로"}
        </Link>
        <Link href="/products" className="btn-outline h-13 text-[18px] font-bold sm:flex-1">
          쇼핑 계속하기
        </Link>
      </div>
    </div>
  );
}
