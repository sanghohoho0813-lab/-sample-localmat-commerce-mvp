"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Banknote, CreditCard, Loader2, MapPin, Smartphone, Ticket } from "lucide-react";
import PriceSummary from "@/components/PriceSummary";
import ProductImage from "@/components/ProductImage";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE, addresses, coupons, demoUser } from "@/lib/data/etc";
import { getProduct } from "@/lib/data/products";
import { expectedDeliveryDate, formatWon, makeOrderNumber } from "@/lib/format";
import { cartItemUnitPrice, useCartStore, useOrderStore, useToastStore } from "@/lib/store";
import type { Order, PaymentMethod } from "@/lib/types";

const paymentMethods: { value: PaymentMethod; label: string; icon: typeof CreditCard; note: string }[] = [
  { value: "card", label: "신용/체크카드", icon: CreditCard, note: "모든 카드 지원" },
  { value: "easy", label: "간편결제", icon: Smartphone, note: "로컬페이 · 각종 페이" },
  { value: "bank", label: "계좌이체", icon: Banknote, note: "실시간 이체" },
];

const requestOptions = [
  "문 앞에 놓아주세요",
  "경비실에 맡겨주세요",
  "배송 전 연락주세요",
  "직접 입력",
];

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);
  const addOrder = useOrderStore((s) => s.addOrder);
  const showToast = useToastStore((s) => s.show);

  const [addressId, setAddressId] = useState(addresses.find((a) => a.isDefault)!.id);
  const [requestChoice, setRequestChoice] = useState(requestOptions[0]);
  const [customRequest, setCustomRequest] = useState("");
  const [couponId, setCouponId] = useState<string>("");
  const [payment, setPayment] = useState<PaymentMethod>("card");
  const [placing, setPlacing] = useState(false);

  const visibleItems = mounted ? items : [];
  const itemsTotal = visibleItems.reduce((sum, i) => sum + cartItemUnitPrice(i) * i.quantity, 0);
  const shippingFee = itemsTotal === 0 || itemsTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

  const couponDiscount = useMemo(() => {
    const coupon = coupons.find((c) => c.id === couponId);
    if (!coupon || itemsTotal < coupon.minOrder) return 0;
    if (coupon.discountType === "percent") {
      const raw = Math.floor((itemsTotal * coupon.value) / 100);
      return coupon.maxDiscount ? Math.min(raw, coupon.maxDiscount) : raw;
    }
    return coupon.value;
  }, [couponId, itemsTotal]);

  const total = itemsTotal + shippingFee - couponDiscount;
  const delivery = expectedDeliveryDate(1);
  const address = addresses.find((a) => a.id === addressId)!;

  useEffect(() => {
    if (mounted && items.length === 0 && !placing) {
      router.replace("/cart");
    }
  }, [mounted, items.length, placing, router]);

  function placeOrder() {
    if (placing || visibleItems.length === 0) return;
    setPlacing(true);

    const now = new Date();
    const order: Order = {
      id: `o-${now.getTime()}`,
      orderNumber: makeOrderNumber(now),
      createdAt: now.toISOString(),
      status: "paid",
      items: visibleItems.map((i) => {
        const p = getProduct(i.productId)!;
        return {
          productId: p.id,
          name: p.name,
          unit: p.unit,
          optionLabel: i.optionLabel,
          quantity: i.quantity,
          price: cartItemUnitPrice(i),
        };
      }),
      itemsTotal,
      shippingFee,
      couponDiscount,
      totalAmount: total,
      paymentMethod: payment,
      recipient: address.recipient,
      phone: address.phone,
      address: `${address.address1} ${address.address2}`,
      requestNote: requestChoice === "직접 입력" ? customRequest : requestChoice,
      expectedDelivery: delivery.iso,
    };

    // Demo checkout: 실제 PG 대신 짧은 지연 후 주문 생성 → 장바구니 비우기
    setTimeout(() => {
      addOrder(order);
      clearCart();
      showToast("주문이 완료되었어요!");
      router.push(`/order-complete/${order.id}`);
    }, 900);
  }

  return (
    <div className="container-page py-6 md:py-8">
      <h1 className="mb-5 text-xl font-extrabold tracking-tight text-bark-900 md:mb-7 md:text-3xl">
        주문서
      </h1>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start lg:gap-10">
        <div className="space-y-4">
          {/* 주문자 */}
          <section className="rounded-card border border-bark-100 bg-white p-5">
            <h2 className="text-base font-extrabold text-bark-900">주문자 정보</h2>
            <p className="mt-3 text-sm text-bark-700">
              {demoUser.name} · {demoUser.phone}
            </p>
            <p className="mt-1 text-xs text-bark-400">{demoUser.email}</p>
          </section>

          {/* 배송지 */}
          <section className="rounded-card border border-bark-100 bg-white p-5">
            <h2 className="flex items-center gap-1.5 text-base font-extrabold text-bark-900">
              <MapPin className="h-4 w-4 text-leaf-600" />
              배송지
            </h2>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {addresses.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAddressId(a.id)}
                  className={`rounded-xl border p-4 text-left transition-colors duration-200 ${
                    addressId === a.id
                      ? "border-leaf-600 bg-leaf-50"
                      : "border-bark-200 bg-white hover:border-leaf-300"
                  }`}
                >
                  <p className="flex items-center gap-1.5 text-sm font-bold text-bark-800">
                    {a.label}
                    {a.isDefault && (
                      <span className="rounded-md bg-leaf-100 px-1.5 py-0.5 text-[10px] font-semibold text-leaf-700">
                        기본
                      </span>
                    )}
                  </p>
                  <p className="mt-1.5 text-[13px] leading-snug text-bark-600">
                    {a.address1} {a.address2}
                  </p>
                  <p className="mt-1 text-xs text-bark-400">
                    {a.recipient} · {a.phone}
                  </p>
                </button>
              ))}
            </div>

            <div className="mt-4">
              <label className="text-[13px] font-semibold text-bark-700" htmlFor="request">
                배송 요청사항
              </label>
              <select
                id="request"
                value={requestChoice}
                onChange={(e) => setRequestChoice(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-xl border border-bark-200 bg-white px-3.5 text-sm text-bark-700 outline-none focus:border-leaf-400"
              >
                {requestOptions.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
              {requestChoice === "직접 입력" && (
                <input
                  type="text"
                  value={customRequest}
                  onChange={(e) => setCustomRequest(e.target.value)}
                  placeholder="요청사항을 입력해주세요"
                  maxLength={50}
                  className="mt-2 h-11 w-full rounded-xl border border-bark-200 bg-white px-3.5 text-sm outline-none focus:border-leaf-400"
                />
              )}
            </div>
          </section>

          {/* 주문 상품 */}
          <section className="rounded-card border border-bark-100 bg-white p-5">
            <h2 className="text-base font-extrabold text-bark-900">
              주문 상품 <span className="text-leaf-700">{visibleItems.length}</span>
            </h2>
            <ul className="mt-3 divide-y divide-bark-100">
              {visibleItems.map((item) => {
                const product = getProduct(item.productId);
                if (!product) return null;
                return (
                  <li key={`${item.productId}-${item.optionLabel ?? ""}`} className="flex items-center gap-3 py-3">
                    <ProductImage
                      product={product}
                      className="w-14 rounded-lg border border-bark-100"
                      iconSize="text-xl"
                      sizes="56px"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-bark-800">
                        {product.name} {product.unit}
                      </p>
                      <p className="text-xs text-bark-400">
                        {item.optionLabel ? `${item.optionLabel} · ` : ""}
                        {item.quantity}개
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-bold text-bark-900">
                      {formatWon(cartItemUnitPrice(item) * item.quantity)}
                    </p>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 rounded-xl bg-leaf-50 px-3.5 py-2.5 text-xs text-leaf-800">
              오늘 주문하면 <b>{delivery.label}</b> 도착 예정이에요. 산지에서 바로 보내드립니다.
            </p>
          </section>

          {/* 쿠폰 */}
          <section className="rounded-card border border-bark-100 bg-white p-5">
            <h2 className="flex items-center gap-1.5 text-base font-extrabold text-bark-900">
              <Ticket className="h-4 w-4 text-tangerine-500" />
              쿠폰
            </h2>
            <div className="mt-3 space-y-2">
              <label
                className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-sm transition-colors ${
                  couponId === "" ? "border-leaf-600 bg-leaf-50 font-semibold" : "border-bark-200"
                }`}
              >
                <span className="text-bark-700">쿠폰 사용 안 함</span>
                <input
                  type="radio"
                  name="coupon"
                  checked={couponId === ""}
                  onChange={() => setCouponId("")}
                  className="h-4 w-4 accent-leaf-600"
                />
              </label>
              {coupons.map((c) => {
                const usable = itemsTotal >= c.minOrder;
                return (
                  <label
                    key={c.id}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition-colors ${
                      !usable
                        ? "cursor-not-allowed border-bark-100 bg-cream-50 opacity-60"
                        : couponId === c.id
                          ? "cursor-pointer border-leaf-600 bg-leaf-50"
                          : "cursor-pointer border-bark-200 hover:border-leaf-300"
                    }`}
                  >
                    <span>
                      <span className={`font-semibold ${usable ? "text-bark-800" : "text-bark-500"}`}>
                        {c.name}
                      </span>
                      <span className="mt-0.5 block text-xs text-bark-400">
                        {formatWon(c.minOrder)} 이상 주문 시 · ~{c.expiresAt.replaceAll("-", ".")}
                      </span>
                    </span>
                    <input
                      type="radio"
                      name="coupon"
                      disabled={!usable}
                      checked={couponId === c.id}
                      onChange={() => setCouponId(c.id)}
                      className="h-4 w-4 accent-leaf-600"
                    />
                  </label>
                );
              })}
            </div>
          </section>

          {/* 결제수단 */}
          <section className="rounded-card border border-bark-100 bg-white p-5">
            <h2 className="text-base font-extrabold text-bark-900">결제수단</h2>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
              {paymentMethods.map(({ value, label, icon: Icon, note }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPayment(value)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-4 transition-colors duration-200 ${
                    payment === value
                      ? "border-leaf-600 bg-leaf-50"
                      : "border-bark-200 bg-white hover:border-leaf-300"
                  }`}
                >
                  <Icon className={`h-6 w-6 ${payment === value ? "text-leaf-700" : "text-bark-400"}`} />
                  <span className="text-sm font-bold text-bark-800">{label}</span>
                  <span className="text-[11px] text-bark-400">{note}</span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-bark-400">
              데모 서비스로 실제 결제는 이루어지지 않습니다.
            </p>
          </section>
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-32">
          <div className="rounded-card border border-bark-100 bg-white p-5">
            <h2 className="mb-4 text-base font-extrabold text-bark-900">결제 금액</h2>
            <PriceSummary
              itemsTotal={itemsTotal}
              shippingFee={shippingFee}
              couponDiscount={couponDiscount}
            />
            <button
              type="button"
              onClick={placeOrder}
              disabled={placing || visibleItems.length === 0}
              className="btn-primary mt-5 hidden h-[52px] w-full text-[15px] md:flex"
            >
              {placing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  결제 진행 중...
                </>
              ) : (
                `${formatWon(total)} 결제하기`
              )}
            </button>
            <p className="mt-3 text-center text-xs text-bark-400">
              주문 내용을 확인했으며 결제에 동의합니다.
            </p>
          </div>
          <Link
            href="/cart"
            className="mt-3 hidden justify-center text-sm text-bark-400 hover:text-bark-600 md:flex"
          >
            장바구니로 돌아가기
          </Link>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div
        className="fixed inset-x-0 bottom-16 z-30 border-t border-bark-100 bg-white/95 px-4 py-2.5 backdrop-blur md:hidden"
        style={{ paddingBottom: "max(10px, env(safe-area-inset-bottom))" }}
      >
        <button
          type="button"
          onClick={placeOrder}
          disabled={placing || visibleItems.length === 0}
          className="btn-primary h-12 w-full text-[15px]"
        >
          {placing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              결제 진행 중...
            </>
          ) : (
            `${formatWon(total)} 결제하기`
          )}
        </button>
      </div>
      <div className="h-16 md:hidden" />
    </div>
  );
}
