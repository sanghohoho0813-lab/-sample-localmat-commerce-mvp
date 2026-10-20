"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Box, CalendarClock, ChevronRight, Leaf, MapPin, Refrigerator, ShoppingCart, Sprout, Star, Truck } from "lucide-react";
import Badge from "@/components/Badge";
import { EtaLine } from "@/components/DeliveryEta";
import FarmImage from "@/components/FarmImage";
import ProductCard from "@/components/ProductCard";
import ProductImage from "@/components/ProductImage";
import QuantityStepper from "@/components/QuantityStepper";
import WishlistButton from "@/components/WishlistButton";
import { getCategory } from "@/lib/data/categories";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "@/lib/data/etc";
import { getFarm } from "@/lib/data/farms";
import { getProduct, products } from "@/lib/data/products";
import { getProductReviews } from "@/lib/data/reviews";
import { shippingPolicy } from "@/lib/delivery";
import { formatDate, formatPrice, formatWon, itemLabel } from "@/lib/format";
import { recommendFor } from "@/lib/recommend";
import { isAvailable, isInSeason, seasonLabel } from "@/lib/season";
import {
  maxQuantityFor,
  useBuyNowStore,
  useCartStore,
  useRecentStore,
  useReviewStore,
  useToastStore,
} from "@/lib/store";
import type { Product } from "@/lib/types";
import { useHydrated } from "@/lib/useHydrated";
import { useScrollSpy } from "@/lib/useScrollSpy";

const LOW_STOCK_THRESHOLD = 30;

const SECTIONS = [
  { id: "info", label: "상품정보" },
  { id: "producer", label: "생산자" },
  { id: "shipping", label: "배송" },
  { id: "reviews", label: "후기" },
] as const;
const SECTION_IDS = SECTIONS.map((s) => s.id);

/**
 * 신선식품 상세 — 사는 사람이 실제로 묻는 순서대로:
 * 누가 키웠나 → 얼마인가 → 언제 수확해 어떻게 포장되고 언제 오나 → 실제 양·옵션 차이 → 농가 → 배송 규칙 → 후기.
 * 아래 내용은 탭에 숨기지 않고 한 페이지에 이어 두고, 구역 바로가기로 오갑니다.
 */
export default function ProductDetailClient({ product, month }: { product: Product; month: number }) {
  const router = useRouter();
  const farm = getFarm(product.farmId);
  const category = getCategory(product.categoryId);
  const maxQuantity = maxQuantityFor(product.id);
  const soldOut = !isAvailable(product);
  const inSeason = isInSeason(product, month);

  const recommendations = useMemo(() => recommendFor(product, month), [product, month]);
  const farmProducts = useMemo(
    () => products.filter((p) => p.farmId === product.farmId && p.id !== product.id && isAvailable(p)).slice(0, 3),
    [product]
  );

  const [optionLabel, setOptionLabel] = useState(product.options?.[0]?.label);
  const [quantity, setQuantity] = useState(1);

  const addItem = useCartStore((s) => s.addItem);
  const setBuyNow = useBuyNowStore((s) => s.set);
  const showToast = useToastStore((s) => s.show);
  const pushRecent = useRecentStore((s) => s.push);
  const recentIds = useRecentStore((s) => s.ids);
  const myReviews = useReviewStore((s) => s.reviews);
  const hydrated = useHydrated();
  const activeSection = useScrollSpy(SECTION_IDS);

  // 위쪽 구매 영역이 화면 밖으로 나가면 PC 오른쪽 고정 구매 상자를 띄웁니다.
  const purchaseRef = useRef<HTMLDivElement>(null);
  const [showStickyBuy, setShowStickyBuy] = useState(false);
  useEffect(() => {
    const el = purchaseRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setShowStickyBuy(!entry.isIntersecting), {
      // 고정 헤더(113px) 아래로 완전히 사라졌을 때
      rootMargin: "-120px 0px 0px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    pushRecent(product.id);
  }, [product.id, pushRecent]);

  // 내가 주문 내역에서 쓴 리뷰를 맨 위에 함께 보여 줍니다(저장값이라 하이드레이션 후에만).
  const myProductReviews = useMemo(
    () => (hydrated ? myReviews.filter((r) => r.productId === product.id) : []),
    [hydrated, myReviews, product.id]
  );
  const productReviews = useMemo(
    () => [...myProductReviews, ...getProductReviews(product.id)],
    [myProductReviews, product.id]
  );
  // 리뷰 수는 상품의 전체 리뷰 수(별점만 남긴 것 포함, + 방금 쓴 내 리뷰) — 목록은 그중 글이 있는 것만 보여 줍니다.
  const reviewTotal = product.reviewCount + myProductReviews.length;

  // 최근 본 상품 — 지금 보는 상품은 빼고
  const recent = hydrated
    ? recentIds
        .filter((id) => id !== product.id)
        .map((id) => getProduct(id))
        .filter((p): p is Product => !!p)
        .slice(0, 4)
    : [];

  const selectedOption = product.options?.find((o) => o.label === optionLabel);
  const unitPrice = product.price + (selectedOption?.extraPrice ?? 0);
  const total = unitPrice * quantity;
  const rate = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  function addToCart() {
    const result = addItem(product.id, quantity, optionLabel);
    showToast(
      result.capped
        ? `재고가 ${maxQuantity}개라 장바구니에 ${result.quantity}개까지만 담았어요.`
        : "장바구니에 담았어요.",
      { label: "보러가기", href: "/cart" },
      {
        thumb: product.image,
        detail: [
          itemLabel(product.name, product.unit, optionLabel).title,
          itemLabel(product.name, product.unit, optionLabel).option,
          `${quantity}개`,
        ]
          .filter(Boolean)
          .join(" · "),
        tone: result.capped ? "info" : "success",
      }
    );
  }

  /** 바로 구매 — 장바구니를 거치지 않고 이 상품만 담긴 주문서로 바로 갑니다. */
  function buyNow() {
    setBuyNow({ productId: product.id, optionLabel, quantity: Math.min(quantity, maxQuantity) });
    router.push("/checkout?mode=now");
  }

  const facts = [
    { icon: Sprout, label: "수확", value: product.harvestDetail },
    { icon: Box, label: "포장", value: `${product.packaging} · ${product.temp} 배송` },
    { icon: Truck, label: "도착", value: soldOut ? null : "eta" },
    { icon: Refrigerator, label: "보관", value: product.storageTip },
  ] as const;

  return (
    <div className="container-page pb-5 md:py-8">
      {/* Breadcrumb — 모바일은 헤더의 뒤로 가기로 충분해 사진을 바로 위에 붙입니다. */}
      <nav className="mb-4 hidden items-center gap-1 text-xs text-bark-500 md:flex" aria-label="breadcrumb">
        <Link href="/" className="hover:text-leaf-700">
          홈
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/products?category=${category?.slug}`} className="hover:text-leaf-700">
          {category?.name}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="truncate text-bark-600">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-7 lg:grid-cols-2 lg:gap-12">
        {/* 사진 — 모바일은 화면 끝까지 꽉 채워(상용 커머스 앱처럼) 상품이 첫 화면을 이끌게 합니다. */}
        <div className="relative -mx-4 sm:-mx-6 md:mx-0 lg:sticky lg:top-32 lg:self-start">
          <div className={`overflow-hidden bg-cream-200 md:rounded-3xl ${soldOut ? "opacity-70" : ""}`}>
            <ProductImage
              product={product}
              priority
              sizes="(max-width: 1023px) 100vw, 600px"
              className="w-full"
              iconSize="text-7xl"
            />
          </div>
          {product.badges.length > 0 && (
            <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap gap-1.5">
              {product.badges
                .filter((b) => b !== "산지직송")
                .slice(0, 3)
                .map((b) => (
                  <Badge key={b} label={b} />
                ))}
            </div>
          )}
        </div>

        {/* 구매 정보 — 모바일은 사진 위로 살짝 올라오는 시트 */}
        <div
          ref={purchaseRef}
          className="relative -mx-4 -mt-12 rounded-t-[28px] bg-cream-100 px-4 pt-6 sm:-mx-6 sm:px-6 md:mx-0 md:mt-0 md:rounded-none md:bg-transparent md:px-0 md:pt-0"
        >
          {/* 생산자 — 누가 키웠는지가 가장 먼저 */}
          {farm && (
            <a href="#producer" className="group inline-flex items-center gap-2.5 rounded-full focus-ring">
              <span className="relative h-9 w-9 overflow-hidden rounded-full bg-cream-200">
                <FarmImage farm={farm} sizes="36px" />
              </span>
              <span className="text-sm leading-tight">
                <span className="block font-semibold text-bark-900 group-hover:text-leaf-700">{farm.name}</span>
                <span className="block text-bark-500">
                  {farm.region} · {farm.owner} 농부
                </span>
              </span>
            </a>
          )}

          <div className="mt-3 flex items-start justify-between gap-3">
            <h1 className="text-[22px] font-bold leading-snug tracking-tight text-bark-900 [word-break:keep-all] md:text-[28px]">
              {product.name} <span className="font-semibold text-bark-500">{product.unit}</span>
            </h1>
            <WishlistButton productId={product.id} size="lg" className="border border-bark-100" />
          </div>
          <p className="mt-1.5 text-[16px] leading-relaxed text-bark-600">{product.summary}</p>

          <a href="#reviews" className="mt-2.5 inline-flex items-center gap-1.5 rounded-md text-sm focus-ring">
            <Star className="h-4 w-4 fill-tangerine-400 text-tangerine-400" aria-hidden />
            <span className="font-bold text-bark-900">{product.rating.toFixed(1)}</span>
            <span className="text-bark-500 underline-offset-2 hover:underline">후기 {reviewTotal.toLocaleString()}개</span>
          </a>

          {/* 가격 */}
          <p className="mt-4 flex flex-wrap items-baseline gap-x-2">
            {rate !== null && !soldOut && (
              <span className="text-2xl font-bold text-tangerine-600">
                {rate}%<span className="sr-only"> 할인</span>
              </span>
            )}
            <span className={`text-[30px] font-bold tracking-tight tabular-nums ${soldOut ? "text-bark-400" : "text-bark-900"}`}>
              {formatPrice(product.price)}
              <span className="text-xl">원</span>
            </span>
            {product.originalPrice && !soldOut && (
              <del className="text-[16px] text-bark-400">
                <span className="sr-only">정가 </span>
                {formatWon(product.originalPrice)}
              </del>
            )}
          </p>

          {soldOut && (
            <div className="mt-4 flex gap-3 rounded-2xl bg-white px-4 py-3.5" role="status">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-leaf-50 text-leaf-700">
                <Leaf className="h-[18px] w-[18px]" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block font-bold text-bark-900">다음 수확을 준비하고 있어요</span>
                <span className="mt-0.5 block text-sm text-bark-600">
                  {product.restockNote} · 제철({seasonLabel(product.season)})에만 보내드려요.
                </span>
              </span>
            </div>
          )}

          {/* 신선 정보 — 박스 대신 줄로 나눠 가볍게 */}
          <dl className="mt-5 divide-y divide-bark-100 border-y border-bark-100">
            {facts.map(({ icon: Icon, label, value }) =>
              value === null ? null : (
                <div key={label} className="flex gap-3 py-3">
                  <dt className="flex w-16 shrink-0 items-center gap-1.5 self-start text-sm font-semibold text-bark-500">
                    <Icon className="h-4 w-4 text-leaf-700" aria-hidden />
                    {label}
                  </dt>
                  <dd className="min-w-0 flex-1 text-[15px] leading-relaxed text-bark-800">
                    {value === "eta" ? <EtaLine products={[product]} /> : value}
                  </dd>
                </div>
              )
            )}
          </dl>

          {/* 옵션 — 무엇이 다른지(양·용도)를 함께 */}
          {product.options && !soldOut && (
            <fieldset className="mt-5">
              <legend className="mb-2 text-sm font-bold text-bark-800">옵션 선택</legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {product.options.map((o) => {
                  const selected = optionLabel === o.label;
                  return (
                    <button
                      key={o.label}
                      type="button"
                      onClick={() => setOptionLabel(o.label)}
                      aria-pressed={selected}
                      className={`flex min-h-[3.75rem] items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-left transition-colors duration-200 ${
                        selected ? "border-leaf-700 bg-leaf-50 ring-1 ring-leaf-700" : "border-bark-200 bg-white hover:border-leaf-400"
                      }`}
                    >
                      <span className="min-w-0">
                        <span className={`block text-[16px] ${selected ? "font-bold text-leaf-900" : "font-semibold text-bark-800"}`}>
                          {o.label}
                        </span>
                        {o.note && <span className="block text-sm text-bark-500">{o.note}</span>}
                      </span>
                      <span className="shrink-0 text-sm font-semibold text-bark-600">
                        {o.extraPrice > 0 ? `+${formatWon(o.extraPrice)}` : "기본"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          {!soldOut && (
            <>
              <div className="mt-5 flex items-center justify-between gap-3">
                <QuantityStepper value={quantity} onChange={setQuantity} max={maxQuantity} />
                <div className="min-w-0 text-right">
                  <p className="text-sm text-bark-500">총 상품금액</p>
                  <p className="text-2xl font-bold tracking-tight text-bark-900">{formatWon(total)}</p>
                </div>
              </div>
              {quantity >= maxQuantity ? (
                <p className="mt-2 text-sm font-medium text-tangerine-700" role="status">
                  한 번에 최대 {maxQuantity}개까지 주문할 수 있어요.
                </p>
              ) : (
                product.stock <= LOW_STOCK_THRESHOLD && (
                  <p className="mt-2 text-sm font-medium text-tangerine-700">이번 수확분 {product.stock}개 남았어요</p>
                )
              )}

              {/* PC 구매 버튼 */}
              <div className="mt-5 hidden gap-3 md:flex">
                <button type="button" onClick={addToCart} className="btn-outline h-14 flex-1 text-[18px] font-bold">
                  <ShoppingCart className="h-[18px] w-[18px]" />
                  장바구니
                </button>
                <button type="button" onClick={buyNow} className="btn-primary h-14 flex-1 text-[18px]">
                  바로 구매
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 상세 본문 + (PC) 오른쪽 고정 구매 상자 — 긴 설명을 읽다가도 옵션·수량을 바꾸고 바로 담을 수 있게 */}
      <div className="mt-12 md:mt-16 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12">
        <div className="min-w-0">
          {/* 구역 바로가기 — 헤더 바로 아래에 붙습니다(모바일 56px, PC 헤더+카테고리 바 113px). */}
          <nav
            aria-label="상품 상세 구역"
            className="sticky top-14 z-10 -mx-4 grid grid-cols-4 border-b border-bark-100 bg-cream-100/95 px-4 backdrop-blur sm:-mx-6 sm:px-6 md:top-[113px] lg:mx-0 lg:flex lg:px-0"
          >
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                aria-current={activeSection === s.id ? "true" : undefined}
                className={`flex h-13 min-w-0 items-center justify-center whitespace-nowrap border-b-2 text-[16px] font-semibold transition-colors duration-200 lg:px-6 ${
                  activeSection === s.id ? "border-leaf-700 text-leaf-800" : "border-transparent text-bark-500 hover:text-bark-700"
                }`}
              >
                {s.label}
                {s.id === "reviews" && <span className="ml-1 text-tangerine-700">{reviewTotal.toLocaleString()}</span>}
              </a>
            ))}
          </nav>

          <div className="divide-y divide-bark-100">
            {/* 상품정보 */}
            <section id="info" aria-labelledby="info-title" className="scroll-mt-28 py-9 md:scroll-mt-44 md:py-12">
              <h2 id="info-title" className="text-lg font-bold text-bark-900 md:text-xl">
                상품정보
              </h2>
              <div className="mt-4 space-y-4">
                {product.description.map((para, i) => (
                  <p key={i} className="text-[16px] leading-[1.8] text-bark-700">
                    {para}
                  </p>
                ))}
              </div>

              <dl className="mt-7 grid grid-cols-1 gap-x-8 gap-y-4 rounded-2xl bg-white p-5 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-semibold text-bark-500">실제 크기와 양</dt>
                  <dd className="mt-0.5 text-[16px] font-semibold text-bark-900">
                    {product.unit} · {product.amount}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-bark-500">출하 시기</dt>
                  <dd className="mt-0.5 text-[16px] font-semibold text-bark-900">
                    {seasonLabel(product.season)}
                    {inSeason && <span className="ml-2 text-sm font-bold text-leaf-700">지금 제철</span>}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-bark-500">원산지</dt>
                  <dd className="mt-0.5 text-[16px] font-semibold text-bark-900">국내산 ({product.region})</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-bark-500">배송 온도</dt>
                  <dd className="mt-0.5 text-[16px] font-semibold text-bark-900">{product.temp}</dd>
                </div>
              </dl>

              {product.options && (
                <div className="mt-6">
                  <h3 className="text-[16px] font-bold text-bark-900">옵션별 차이</h3>
                  <ul className="mt-2 divide-y divide-bark-100 rounded-2xl bg-white px-5">
                    {product.options.map((o) => (
                      <li key={o.label} className="flex items-center justify-between gap-4 py-3 text-[15px]">
                        <span className="min-w-0">
                          <span className="block font-semibold text-bark-800">{o.label}</span>
                          {o.note && <span className="block text-sm text-bark-500">{o.note}</span>}
                        </span>
                        <span className="shrink-0 font-semibold text-bark-800">{formatWon(product.price + o.extraPrice)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-6">
                <h3 className="text-[16px] font-bold text-bark-900">이렇게 보내드려요</h3>
                <ol className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
                  {[
                    { step: "수확·준비", text: product.harvest },
                    { step: "포장", text: product.packaging },
                    {
                      step: "출고·도착",
                      text: product.leadDays ? "준비가 끝나면 출고 · 다음 날 도착" : "오후 2시 전 주문 당일 출고 · 다음 날 도착",
                    },
                  ].map((s, i) => (
                    <li key={s.step} className="flex gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-leaf-700 text-sm font-bold text-white">
                        {i + 1}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-bark-900">{s.step}</span>
                        <span className="mt-0.5 block text-[15px] leading-snug text-bark-700 [word-break:keep-all]">{s.text}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </section>

            {/* 생산자 — 이야기와 상품을 이어서 */}
            {farm && (
              <section id="producer" aria-labelledby="producer-title" className="scroll-mt-28 py-9 md:scroll-mt-44 md:py-12">
                <h2 id="producer-title" className="text-lg font-bold text-bark-900 md:text-xl">
                  생산자
                </h2>
                <div className="mt-4 overflow-hidden rounded-2xl bg-white sm:flex">
                  <div className="relative aspect-[16/10] sm:aspect-auto sm:w-2/5">
                    <FarmImage farm={farm} sizes="(max-width: 639px) 100vw, 320px" />
                  </div>
                  <div className="p-5 sm:flex-1">
                    <p className="text-lg font-bold leading-snug text-leaf-900 [word-break:keep-all]">“{farm.quote}”</p>
                    <p className="mt-1.5 flex items-center gap-1 text-sm text-bark-500">
                      <MapPin className="h-3.5 w-3.5" />
                      {farm.name} · {farm.owner} 농부 · {farm.since}년부터
                    </p>
                    <p className="mt-3 text-[15px] leading-relaxed text-bark-700">{farm.intro}</p>
                    <p className="mt-3 text-sm text-bark-600">
                      <span className="font-semibold text-bark-800">재배 방식</span> · {farm.method}
                    </p>
                    {farm.certifications.length > 0 && (
                      <p className="mt-1 text-sm text-bark-600">
                        <span className="font-semibold text-bark-800">인증</span> · {farm.certifications.join(", ")}
                      </p>
                    )}
                    <Link
                      href={`/farms/${farm.slug}`}
                      className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-leaf-700 hover:underline"
                    >
                      농가 이야기 더 보기
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
                {farmProducts.length > 0 && (
                  <div className="mt-5">
                    <h3 className="text-[16px] font-bold text-bark-900">이 농가에서 함께 보내는 상품</h3>
                    <p className="mt-0.5 text-sm text-bark-500">같은 농가 상품은 한 상자로 함께 출발해요.</p>
                    <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3">
                      {farmProducts.map((p) => (
                        <li key={p.id}>
                          <ProductCard product={p} showFarm={false} />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {/* 배송 */}
            <section id="shipping" aria-labelledby="shipping-title" className="scroll-mt-28 py-9 md:scroll-mt-44 md:py-12">
              <h2 id="shipping-title" className="text-lg font-bold text-bark-900 md:text-xl">
                배송 · 교환
              </h2>
              <ul className="mt-4 space-y-2.5 text-[15px] leading-relaxed text-bark-700">
                {shippingPolicy(product).map((line) => (
                  <li key={line} className="flex gap-2.5">
                    <CalendarClock className="mt-1 h-4 w-4 shrink-0 text-leaf-700" aria-hidden />
                    {line}
                  </li>
                ))}
                <li className="flex gap-2.5">
                  <Truck className="mt-1 h-4 w-4 shrink-0 text-leaf-700" aria-hidden />
                  배송비 {formatPrice(SHIPPING_FEE)}원 · {formatPrice(FREE_SHIPPING_THRESHOLD)}원 이상 주문하면 무료예요. 여러 농가 상품을 함께 사도 배송비는 한 번만 받아요.
                </li>
              </ul>
              <p className="mt-5 rounded-2xl bg-white p-4 text-[15px] leading-relaxed text-bark-700">
                <b className="text-bark-900">교환·환불</b> · 신선식품이라 단순 변심 교환은 어려워요. 받은 상품이 상했거나 파손됐다면 받은 날로부터
                24시간 안에 사진과 함께 알려 주세요. 확인 후 다시 보내 드리거나 환불해 드려요.
              </p>
            </section>

            {/* 후기 */}
            <section id="reviews" aria-labelledby="reviews-title" className="scroll-mt-28 py-9 md:scroll-mt-44 md:py-12">
              <div className="flex items-end justify-between gap-3">
                <h2 id="reviews-title" className="text-lg font-bold text-bark-900 md:text-xl">
                  후기 <span className="text-bark-500">{reviewTotal.toLocaleString()}</span>
                </h2>
                <p className="flex items-center gap-1 text-[16px]">
                  <Star className="h-5 w-5 fill-tangerine-400 text-tangerine-400" aria-hidden />
                  <b className="text-xl font-bold text-bark-900">{product.rating.toFixed(1)}</b>
                  <span className="text-bark-500">/ 5</span>
                </p>
              </div>
              {productReviews.length === 0 ? (
                <p className="py-8 text-center text-[16px] text-bark-500">아직 글로 남긴 후기가 없어요.</p>
              ) : (
                <ul className="mt-2 divide-y divide-bark-100">
                  {productReviews.map((r) => (
                    <li key={r.id} className="py-5">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-bark-500">
                        <span className="flex" role="img" aria-label={`별점 ${r.rating}점`}>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star
                              key={n}
                              className={`h-3.5 w-3.5 ${n <= r.rating ? "fill-tangerine-400 text-tangerine-400" : "text-bark-200"}`}
                              aria-hidden
                            />
                          ))}
                        </span>
                        <span className="font-semibold text-bark-700">{r.author}</span>
                        <span>{formatDate(r.date)}</span>
                        {r.id.startsWith("my-") && (
                          <span className="rounded-md bg-leaf-50 px-1.5 py-0.5 font-semibold text-leaf-700">내 리뷰</span>
                        )}
                      </div>
                      {r.option && <p className="mt-1 text-sm text-bark-500">옵션 · {r.option}</p>}
                      <p className="mt-2 text-[16px] leading-relaxed text-bark-800">{r.content}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>

        {/* PC 고정 구매 상자 — 위쪽 구매 영역이 화면에서 사라졌을 때만 나타납니다(같은 버튼이 두 번 보이지 않게). */}
        <aside className="hidden lg:block" aria-label="구매 요약">
          <div
            className={`sticky top-[129px] rounded-2xl bg-white p-5 shadow-soft transition-[opacity,transform,visibility] duration-300 ${
              showStickyBuy ? "visible translate-y-0 opacity-100" : "invisible translate-y-2 opacity-0"
            }`}
          >
            <div className="flex items-center gap-3">
              <ProductImage product={product} className="w-14 shrink-0 rounded-lg" iconSize="text-xl" sizes="56px" />
              <div className="min-w-0">
                {farm && <p className="truncate text-xs text-bark-500">{farm.name}</p>}
                <p className="line-clamp-2 text-[15px] font-semibold leading-snug text-bark-900">
                  {product.name} <span className="font-normal text-bark-500">{product.unit}</span>
                </p>
              </div>
            </div>
            {soldOut ? (
              <p className="mt-4 rounded-xl bg-cream-100 px-4 py-3 text-center text-[15px] font-semibold text-bark-600">
                {product.restockNote}
              </p>
            ) : (
              <>
                {product.options && (
                  <label className="mt-4 block">
                    <span className="text-sm font-semibold text-bark-600">옵션</span>
                    <select
                      value={optionLabel}
                      onChange={(e) => setOptionLabel(e.target.value)}
                      className="mt-1 h-11 w-full rounded-lg border border-bark-200 bg-white px-3 text-[15px] text-bark-800 outline-none focus:border-leaf-500"
                    >
                      {product.options.map((o) => (
                        <option key={o.label} value={o.label}>
                          {o.label}
                          {o.extraPrice > 0 ? ` +${formatWon(o.extraPrice)}` : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <div className="mt-4 flex items-center justify-between gap-3">
                  <QuantityStepper value={quantity} onChange={setQuantity} max={maxQuantity} size="sm" announce={false} />
                  <p className="text-xl font-bold tracking-tight text-bark-900 tabular-nums">{formatWon(total)}</p>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-bark-600">
                  <EtaLine products={[product]} />
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button type="button" onClick={addToCart} className="btn-outline h-12 text-[16px] font-semibold">
                    <ShoppingCart className="h-[18px] w-[18px]" />
                    담기
                  </button>
                  <button type="button" onClick={buyNow} className="btn-primary h-12 text-[16px]">
                    바로 구매
                  </button>
                </div>
              </>
            )}
          </div>
        </aside>
      </div>

      {/* 함께 사면 좋은 상품 — 추천마다 근거를 붙입니다 */}
      {recommendations.length > 0 && (
        <section className="mt-4 border-t border-bark-100 pt-10" aria-labelledby="recommend-title">
          <h2 id="recommend-title" className="mb-5 text-lg font-bold text-bark-900 md:text-2xl">
            {soldOut ? "지금 받아 볼 수 있는 상품" : "함께 사면 좋은 상품"}
          </h2>
          <div className="grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-4 md:gap-x-5">
            {recommendations.map((r) => (
              <ProductCard key={r.product.id} product={r.product} reason={r.reason} />
            ))}
          </div>
        </section>
      )}

      {recent.length > 0 && (
        <section className="mt-12" aria-labelledby="recent-detail-title">
          <h2 id="recent-detail-title" className="mb-4 text-base font-bold text-bark-900 md:text-lg">
            최근 본 상품
          </h2>
          <div className="grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-4 md:gap-x-5">
            {recent.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* 모바일 구매 바 — 이 화면에서는 하단 탭을 숨기고 구매 바가 바닥을 씁니다(MobileNav의 isPurchaseFocusRoute). */}
      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-bark-100 bg-white/95 px-4 pt-2.5 backdrop-blur md:hidden"
        style={{ paddingBottom: "max(10px, env(safe-area-inset-bottom))" }}
      >
        {soldOut ? (
          <div className="flex items-center gap-2.5">
            <WishlistButton productId={product.id} size="lg" className="border border-bark-200" />
            <p className="flex h-13 min-w-0 flex-1 items-center justify-center rounded-xl bg-bark-100 px-3 text-[16px] font-bold text-bark-600">
              {product.restockNote}
            </p>
          </div>
        ) : (
          // 글자를 키운 뒤에도 좁은 화면에서 잘리지 않도록 장바구니는 아이콘 버튼으로 둡니다.
          <div className="flex items-center gap-2.5">
            <button type="button" onClick={addToCart} aria-label="장바구니에 담기" className="btn-outline h-13 w-13 shrink-0 px-0">
              <ShoppingCart className="h-[22px] w-[22px]" />
            </button>
            <button type="button" onClick={buyNow} className="btn-primary h-13 min-w-0 flex-1 text-[18px]">
              {formatWon(total)} 바로 구매
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
