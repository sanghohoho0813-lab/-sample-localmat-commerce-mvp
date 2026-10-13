"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Banknote, Check, ChevronDown, CreditCard, Loader2, Smartphone } from "lucide-react";
import { EtaLine } from "@/components/DeliveryEta";
import FarmGroupHeader from "@/components/FarmGroupHeader";
import PriceSummary from "@/components/PriceSummary";
import ProductImage from "@/components/ProductImage";
import { addresses, demoUser } from "@/lib/data/etc";
import { getProduct } from "@/lib/data/products";
import { groupByFarm } from "@/lib/catalog";
import { planForProducts } from "@/lib/delivery";
import { formatWon, itemLabel, makeOrderNumber } from "@/lib/format";
import { isoDate } from "@/lib/kst";
import { orderableItems } from "@/lib/persisted";
import { couponOptions, summarize, unitPrice } from "@/lib/pricing";
import { useBuyNowStore, useCartStore, useOrderStore } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";
import type { CartItem, Order, PaymentMethod, Product } from "@/lib/types";

// 라벨을 네 글자로 맞춰 좁은 폰에서도 세 칸이 한 줄에 들어갑니다.
const paymentMethods: { value: PaymentMethod; label: string; icon: typeof CreditCard }[] = [
  { value: "card", label: "카드결제", icon: CreditCard },
  { value: "easy", label: "간편결제", icon: Smartphone },
  { value: "bank", label: "계좌이체", icon: Banknote },
];

const CUSTOM_REQUEST = "직접 입력";
const REQUEST_MAX = 50;
const requestOptions = ["문 앞에 놓아주세요", "경비실에 맡겨주세요", "배송 전 연락주세요", CUSTOM_REQUEST];

/** useSearchParams를 쓰는 화면은 정적 생성 시 Suspense 경계가 필요합니다. */
export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <Checkout />
    </Suspense>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="container-page py-6 md:py-8" aria-busy="true">
      <h1 className="mb-5 text-xl font-extrabold tracking-tight text-bark-900 md:mb-7 md:text-3xl">주문서</h1>
      <div className="h-64 animate-pulse rounded-card bg-white/70" />
    </div>
  );
}

function Checkout() {
  const router = useRouter();
  const hydrated = useHydrated();
  /** 상품 상세의 '바로 구매'로 들어온 주문서 — 장바구니가 아니라 그 상품 하나만 주문합니다. */
  const buyNowMode = useSearchParams().get("mode") === "now";

  const cartItems = useCartStore((s) => s.items);
  const removeFromCart = useCartStore((s) => s.removeItem);
  const buyNowItem = useBuyNowStore((s) => s.item);
  const clearBuyNow = useBuyNowStore((s) => s.set);
  const addOrder = useOrderStore((s) => s.addOrder);
  // 품절·시즌 준비 중인 상품은 장바구니에 남겨 두고 주문에서는 뺍니다.
  const items = useMemo(
    () => orderableItems(buyNowMode ? (buyNowItem ? [buyNowItem] : []) : cartItems),
    [buyNowMode, buyNowItem, cartItems]
  );
  const [itemsOpen, setItemsOpen] = useState(false);

  const [addressId, setAddressId] = useState(addresses.find((a) => a.isDefault)!.id);
  const [addressOpen, setAddressOpen] = useState(false);
  const [requestChoice, setRequestChoice] = useState(requestOptions[0]);
  const [customRequest, setCustomRequest] = useState("");
  const [requestError, setRequestError] = useState(false);
  const customRequestRef = useRef<HTMLInputElement>(null);
  /** null = 아직 고르지 않음 → 가장 많이 깎아 주는 쿠폰을 자동으로 적용 */
  const [pickedCouponId, setPickedCouponId] = useState<string | null>(null);
  const [payment, setPayment] = useState<PaymentMethod>("card");
  const [placing, setPlacing] = useState(false);
  /** 결제 버튼을 누른 순간의 주문 상품 — 장바구니를 비운 뒤 화면이 0원으로 바뀌지 않게 고정합니다. */
  const [placedItems, setPlacedItems] = useState<CartItem[] | null>(null);

  const visibleItems = placedItems ?? (hydrated ? items : []);
  const baseTotal = summarize(visibleItems).itemsTotal;
  const {
    usable: usableCoupons,
    unusableCount,
    nextGap: nextCouponGap,
  } = useMemo(() => couponOptions(baseTotal), [baseTotal]);

  const couponId = pickedCouponId ?? usableCoupons[0]?.coupon.id ?? "";
  const { itemsTotal, shippingFee, couponDiscount, total } = summarize(visibleItems, couponId || null);
  const orderProducts = visibleItems.map((i) => getProduct(i.productId)).filter((p): p is Product => !!p);
  const address = addresses.find((a) => a.id === addressId)!;
  const isCustomRequest = requestChoice === CUSTOM_REQUEST;

  // 주문할 상품이 없으면(새 탭에서 주문서 주소만 연 경우 등) 장바구니로 보냅니다.
  useEffect(() => {
    if (hydrated && items.length === 0 && !placing) {
      router.replace("/cart");
    }
  }, [hydrated, items.length, placing, router]);

  function placeOrder() {
    if (placing || visibleItems.length === 0) return;

    // '직접 입력'을 골라 놓고 비워 두면 배송 기사님께 빈 요청이 전달됩니다.
    if (isCustomRequest && customRequest.trim() === "") {
      setRequestError(true);
      customRequestRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      customRequestRef.current?.focus({ preventScroll: true });
      return;
    }

    setPlacing(true);
    setPlacedItems(visibleItems);

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
          price: unitPrice(i),
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
      requestNote: isCustomRequest ? customRequest.trim() : requestChoice,
      // 실제 출고 규칙(오후 2시 마감·냉장은 금요일 출고 없음·준비일)으로 계산한 일정 — 가장 늦은 농가 기준
      ...(() => {
        const plan = planForProducts(orderProducts, now)!;
        return { shipDate: isoDate(plan.shipDate), expectedDelivery: isoDate(plan.arriveDate) };
      })(),
    };

    // Demo checkout: 실제 PG 대신 짧은 지연 후 주문 생성 → 장바구니 비우기
    setTimeout(() => {
      addOrder(order);
      // 바로 구매는 장바구니에 담아 둔 다른 상품을 그대로 둡니다.
      if (buyNowMode) clearBuyNow(null);
      else order.items.forEach((i) => removeFromCart(i.productId, i.optionLabel));
      router.replace(`/order-complete/${order.id}`);
    }, 900);
  }

  const payLabel = placing ? (
    <>
      <Loader2 className="h-5 w-5 animate-spin" />
      결제 진행 중...
    </>
  ) : (
    `${formatWon(total)} 결제하기`
  );

  // 저장된 장바구니를 읽기 전(또는 비어 있어 장바구니로 보내는 중)에는 0원 주문서가 번쩍이지 않게 자리만 잡습니다.
  if (!hydrated || visibleItems.length === 0) return <CheckoutSkeleton />;

  return (
    <div className="container-page py-6 md:py-8">
      <h1 className="mb-5 text-xl font-extrabold tracking-tight text-bark-900 md:mb-7 md:text-3xl">
        주문서
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start lg:gap-10">
        <div className="space-y-4">
          {/* 배송지 */}
          <section className="rounded-2xl bg-white p-4 sm:p-5">
            <StepTitle n={1}>배송 정보</StepTitle>
            {/* 기본은 선택된 배송지 한 곳만 — 바꿀 때만 목록을 펼칩니다. */}
            {!addressOpen ? (
              <div className="mt-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-[16px] font-bold text-bark-800">
                    {address.label}
                    {address.isDefault && (
                      <span className="rounded-md bg-leaf-100 px-1.5 py-0.5 text-[13px] font-semibold text-leaf-700">
                        기본
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-[16px] leading-snug text-bark-700">
                    {address.address1} {address.address2}
                  </p>
                  <p className="mt-1 text-sm text-bark-400">
                    {address.recipient} · <span className="whitespace-nowrap">{address.phone}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAddressOpen(true)}
                  aria-expanded={false}
                  className="btn-outline h-10 shrink-0 px-3.5 text-sm font-semibold"
                >
                  변경
                </button>
              </div>
            ) : (
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2" role="radiogroup" aria-label="배송지 선택">
                {addresses.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    role="radio"
                    aria-checked={addressId === a.id}
                    onClick={() => {
                      setAddressId(a.id);
                      setAddressOpen(false);
                    }}
                    className={`relative rounded-xl border p-4 text-left transition-colors duration-200 ${
                      addressId === a.id
                        ? "border-leaf-600 bg-leaf-50 ring-1 ring-leaf-600"
                        : "border-bark-200 bg-white hover:border-leaf-300"
                    }`}
                  >
                    <p className="flex items-center gap-1.5 pr-7 text-[16px] font-bold text-bark-800">
                      {a.label}
                      {a.isDefault && (
                        <span className="rounded-md bg-leaf-100 px-1.5 py-0.5 text-[13px] font-semibold text-leaf-700">
                          기본
                        </span>
                      )}
                    </p>
                    {addressId === a.id && (
                      <Check className="absolute right-4 top-4 h-5 w-5 text-leaf-600" aria-hidden />
                    )}
                    <p className="mt-1.5 text-[16px] leading-snug text-bark-600">
                      {a.address1} {a.address2}
                    </p>
                    <p className="mt-1 text-sm text-bark-400">
                      {a.recipient} · <span className="whitespace-nowrap">{a.phone}</span>
                    </p>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4">
              <label className="text-[16px] font-semibold text-bark-700" htmlFor="request">
                배송 요청사항
              </label>
              <select
                id="request"
                value={requestChoice}
                onChange={(e) => {
                  setRequestChoice(e.target.value);
                  setRequestError(false);
                }}
                className="mt-1.5 h-13 w-full rounded-xl border border-bark-200 bg-white px-3.5 text-[16px] text-bark-700 outline-none focus:border-leaf-400"
              >
                {requestOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              {isCustomRequest && (
                <div className="mt-2">
                  <div className="relative">
                    <input
                      ref={customRequestRef}
                      type="text"
                      value={customRequest}
                      onChange={(e) => {
                        setCustomRequest(e.target.value);
                        if (e.target.value.trim()) setRequestError(false);
                      }}
                      placeholder="예) 공동현관 비밀번호 1234#"
                      maxLength={REQUEST_MAX}
                      aria-label="배송 요청사항 직접 입력"
                      aria-invalid={requestError}
                      aria-describedby={requestError ? "request-error" : undefined}
                      className={`h-13 w-full rounded-xl border bg-white pl-3.5 pr-16 text-[16px] outline-none ${
                        requestError ? "border-red-400 focus:border-red-500" : "border-bark-200 focus:border-leaf-400"
                      }`}
                    />
                    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm tabular-nums text-bark-400">
                      {customRequest.length}/{REQUEST_MAX}
                    </span>
                  </div>
                  {requestError && (
                    <p id="request-error" role="alert" className="mt-1.5 text-sm font-medium text-red-600">
                      요청사항을 입력해 주세요.
                    </p>
                  )}
                </div>
              )}
            </div>

            <p className="mt-4 border-t border-bark-100 pt-3.5 text-sm text-bark-500">
              주문자 <span className="ml-1 font-medium text-bark-700">{demoUser.name}</span> ·{" "}
              <span className="whitespace-nowrap">{demoUser.phone}</span>
            </p>
          </section>

          {/* 주문 상품 — 농가별 묶음. 상품이 많으면 접어 두고 요약만 */}
          <section className="rounded-2xl bg-white p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <StepTitle n={2}>
                주문 상품 <span className="text-leaf-700">{visibleItems.length}</span>
              </StepTitle>
              {visibleItems.length > 3 && (
                <button
                  type="button"
                  aria-expanded={itemsOpen}
                  onClick={() => setItemsOpen((v) => !v)}
                  className="flex h-10 shrink-0 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-bark-600 hover:bg-cream-100"
                >
                  {itemsOpen ? "접기" : "모두 보기"}
                  <ChevronDown className={`h-4 w-4 transition-transform ${itemsOpen ? "rotate-180" : ""}`} />
                </button>
              )}
            </div>
            <p className="mt-1.5 text-sm text-bark-600">
              <EtaLine products={orderProducts} />
            </p>
            {visibleItems.length > 3 && !itemsOpen ? (
              <p className="mt-3 truncate rounded-xl bg-cream-100 px-4 py-3 text-[15px] text-bark-700">
                {itemLabel(orderProducts[0]?.name ?? "", orderProducts[0]?.unit ?? "", visibleItems[0]?.optionLabel).title} 외{" "}
                {visibleItems.length - 1}개 · 농가 {groupByFarm(visibleItems).length}곳
              </p>
            ) : (
              <div className="mt-3 space-y-4">
                {groupByFarm(visibleItems).map((group) => {
                  const groupProducts = group.items
                    .map((i) => getProduct(i.productId))
                    .filter((p): p is Product => !!p);
                  return (
                    <div key={group.farmId} className="rounded-xl border border-bark-100 px-3 pt-3 sm:px-4">
                      <FarmGroupHeader farmId={group.farmId} products={groupProducts} />
                      <ul className="divide-y divide-bark-100">
                        {group.items.map((item) => {
                          const product = getProduct(item.productId);
                          if (!product) return null;
                          const label = itemLabel(product.name, product.unit, item.optionLabel);
                          return (
                            <li key={`${item.productId}-${item.optionLabel ?? ""}`} className="flex gap-3 py-3">
                              <ProductImage
                                product={product}
                                className="w-14 shrink-0 rounded-lg"
                                iconSize="text-xl"
                                sizes="56px"
                              />
                              {/* 이름은 두 줄까지 온전히, 옵션은 따로 한 줄, 수량과 금액은 맨 아래 한 줄에 */}
                              <div className="min-w-0 flex-1">
                                <p className="line-clamp-2 text-sm font-medium leading-snug text-bark-800">{label.title}</p>
                                {label.option && <p className="mt-0.5 truncate text-sm text-bark-500">{label.option}</p>}
                                <div className="mt-1 flex items-baseline justify-between gap-3">
                                  <p className="shrink-0 text-sm text-bark-500">{item.quantity}개</p>
                                  <p className="shrink-0 text-sm font-bold text-bark-900">
                                    {formatWon(unitPrice(item) * item.quantity)}
                                  </p>
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
            )}
          </section>

          {/* 쿠폰 — 쓸 수 있는 쿠폰만, 할인 금액이 큰 순서로 */}
          <section className="rounded-2xl bg-white p-4 sm:p-5">
            <StepTitle n={3}>할인</StepTitle>
            {usableCoupons.length === 0 ? (
              // 쓸 수 있는 쿠폰이 없으면 고를 것도 없으니, 얼마를 더 담으면 쓸 수 있는지만 알려 줍니다.
              <p className="mt-2.5 text-[16px] text-bark-600">
                지금 쓸 수 있는 쿠폰이 없어요.
                {nextCouponGap !== null && (
                  <>
                    {" "}
                    <b className="font-bold text-tangerine-600">{formatWon(nextCouponGap)}</b> 더 담으면 쿠폰을 쓸 수
                    있어요.
                  </>
                )}
              </p>
            ) : (
              <>
                <div className="mt-3 space-y-2" role="radiogroup" aria-label="쿠폰 선택">
                  {usableCoupons.map(({ coupon, discount }) => (
                    <label
                      key={coupon.id}
                      className={`flex min-h-13 cursor-pointer items-center gap-3 rounded-xl border px-4 py-2.5 transition-colors ${
                        couponId === coupon.id
                          ? "border-leaf-600 bg-leaf-50 ring-1 ring-leaf-600"
                          : "border-bark-200 hover:border-leaf-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="coupon"
                        checked={couponId === coupon.id}
                        onChange={() => setPickedCouponId(coupon.id)}
                        className="h-5 w-5 shrink-0 accent-leaf-600"
                      />
                      <span className="min-w-0 flex-1 text-[16px] font-semibold text-bark-800">{coupon.name}</span>
                      <span className="shrink-0 text-[16px] font-bold text-tangerine-600">-{formatWon(discount)}</span>
                    </label>
                  ))}
                  <label
                    className={`flex min-h-13 cursor-pointer items-center gap-3 rounded-xl border px-4 py-2.5 transition-colors ${
                      couponId === "" ? "border-leaf-600 bg-leaf-50 ring-1 ring-leaf-600" : "border-bark-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="coupon"
                      checked={couponId === ""}
                      onChange={() => setPickedCouponId("")}
                      className="h-5 w-5 shrink-0 accent-leaf-600"
                    />
                    <span className="text-[16px] text-bark-700">쿠폰 사용 안 함</span>
                  </label>
                </div>
                {unusableCount > 0 && (
                  <p className="mt-2.5 text-sm text-bark-400">주문 금액 조건이 맞지 않는 쿠폰 {unusableCount}장은 숨겼어요.</p>
                )}
              </>
            )}
          </section>

          {/* 결제수단 */}
          <section className="rounded-2xl bg-white p-4 sm:p-5">
            <StepTitle n={4}>결제 수단</StepTitle>
            <div className="mt-3 grid grid-cols-3 gap-2" role="radiogroup" aria-label="결제수단">
              {paymentMethods.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={payment === value}
                  onClick={() => setPayment(value)}
                  className={`flex h-20 flex-col items-center justify-center gap-1.5 rounded-xl border transition-colors duration-200 ${
                    payment === value
                      ? "border-leaf-600 bg-leaf-50 ring-1 ring-leaf-600"
                      : "border-bark-200 bg-white hover:border-leaf-300"
                  }`}
                >
                  <Icon className={`h-6 w-6 ${payment === value ? "text-leaf-700" : "text-bark-400"}`} />
                  <span className="whitespace-nowrap text-sm font-bold text-bark-800">{label}</span>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-32">
          <div className="rounded-2xl bg-white p-4 sm:p-5">
            <h2 className="mb-4 text-base font-extrabold text-bark-900">결제 금액</h2>
            <PriceSummary itemsTotal={itemsTotal} shippingFee={shippingFee} couponDiscount={couponDiscount} />
            <button
              type="button"
              onClick={placeOrder}
              disabled={placing || visibleItems.length === 0}
              className="btn-primary mt-5 hidden h-14 w-full text-[18px] md:flex"
            >
              {payLabel}
            </button>
            <p className="mt-3 text-center text-sm text-bark-400">
              데모 서비스라 실제로 결제되지 않아요.
            </p>
          </div>
          {buyNowMode ? (
            <button
              type="button"
              onClick={() => router.back()}
              className="mt-3 hidden h-11 w-full items-center justify-center text-sm text-bark-400 hover:text-bark-600 md:flex"
            >
              상품으로 돌아가기
            </button>
          ) : (
            <Link
              href="/cart"
              className="mt-3 hidden h-11 items-center justify-center text-sm text-bark-400 hover:text-bark-600 md:flex"
            >
              장바구니로 돌아가기
            </Link>
          )}
        </div>
      </div>

      {/* Mobile sticky CTA — 이 화면에서는 하단 탭을 숨깁니다(MobileNav). */}
      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-bark-100 bg-white/95 px-4 pt-2.5 backdrop-blur md:hidden"
        style={{ paddingBottom: "max(10px, env(safe-area-inset-bottom))" }}
      >
        <button
          type="button"
          onClick={placeOrder}
          disabled={placing || visibleItems.length === 0}
          className="btn-primary h-13 w-full text-[18px]"
        >
          {payLabel}
        </button>
      </div>
    </div>
  );
}

/** 주문서 단계 제목 — 번호로 순서를 보여 줘 정보가 많아도 어디까지 왔는지 알 수 있게 */
function StepTitle({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-base font-extrabold text-bark-900">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-leaf-700 text-[13px] font-bold text-white" aria-hidden>
        {n}
      </span>
      {children}
    </h2>
  );
}
