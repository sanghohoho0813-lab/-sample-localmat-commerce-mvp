"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, Clock, MapPin, ShoppingCart, Star, Truck } from "lucide-react";
import Badge from "@/components/Badge";
import ProductCard from "@/components/ProductCard";
import ProductImage from "@/components/ProductImage";
import QuantityStepper from "@/components/QuantityStepper";
import RatingStars from "@/components/RatingStars";
import WishlistButton from "@/components/WishlistButton";
import { getFarm } from "@/lib/data/farms";
import { getCategory } from "@/lib/data/categories";
import { products } from "@/lib/data/products";
import { getProductReviews } from "@/lib/data/reviews";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "@/lib/data/etc";
import { expectedDeliveryDate, formatDate, formatPrice, formatWon } from "@/lib/format";
import {
  maxQuantityFor,
  useBuyNowStore,
  useCartStore,
  useRecentStore,
  useReviewStore,
  useToastStore,
} from "@/lib/store";
import type { Product } from "@/lib/types";

// 짧은 두 글자 라벨 — 좁은 폰에서도 다섯 탭이 가로 스크롤 없이 한 줄에 들어갑니다.
const tabs = [
  { id: "intro", label: "소개" },
  { id: "farm", label: "농가" },
  { id: "info", label: "정보" },
  { id: "shipping", label: "배송" },
  { id: "reviews", label: "리뷰" },
] as const;

const LOW_STOCK_THRESHOLD = 30;

type TabId = (typeof tabs)[number]["id"];

export default function ProductDetailClient({ product }: { product: Product }) {
  const router = useRouter();
  const farm = getFarm(product.farmId);
  const category = getCategory(product.categoryId);
  const maxQuantity = maxQuantityFor(product.id);
  // 같은 카테고리가 4개가 안 되면 인기 상품으로 채워 진열 줄이 비지 않게 합니다.
  const related = useMemo(() => {
    const same = products.filter((p) => p.categoryId === product.categoryId && p.id !== product.id);
    const others = products
      .filter((p) => p.categoryId !== product.categoryId)
      .sort((a, b) => b.salesCount - a.salesCount);
    return [...same, ...others].slice(0, 4);
  }, [product]);

  const [optionLabel, setOptionLabel] = useState(product.options?.[0]?.label);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState<TabId>("intro");
  const [mounted, setMounted] = useState(false);
  const tabsAnchor = useRef<HTMLDivElement>(null);

  const addItem = useCartStore((s) => s.addItem);
  const setBuyNow = useBuyNowStore((s) => s.set);
  const showToast = useToastStore((s) => s.show);
  const pushRecent = useRecentStore((s) => s.push);
  const myReviews = useReviewStore((s) => s.reviews);

  useEffect(() => {
    setMounted(true);
    pushRecent(product.id);
  }, [product.id, pushRecent]);

  // 리뷰 등록 후 '확인하기'(…#reviews)로 들어오면 리뷰 탭을 바로 엽니다.
  useEffect(() => {
    if (window.location.hash === "#reviews") {
      setTab("reviews");
      requestAnimationFrame(() => tabsAnchor.current?.scrollIntoView({ block: "start" }));
    }
  }, []);

  // 내가 주문 내역에서 쓴 리뷰를 맨 위에 함께 보여 줍니다(저장값이라 마운트 후에만).
  const myProductReviews = useMemo(
    () => (mounted ? myReviews.filter((r) => r.productId === product.id) : []),
    [mounted, myReviews, product.id]
  );
  const productReviews = useMemo(
    () => [...myProductReviews, ...getProductReviews(product.id)],
    [myProductReviews, product.id]
  );
  // 탭·요약의 리뷰 수는 상품의 전체 리뷰 수(+ 방금 쓴 내 리뷰) — 목록은 그중 글이 있는 것만 보여 줍니다.
  const reviewTotal = product.reviewCount + myProductReviews.length;

  const unitPrice = useMemo(() => {
    const extra = product.options?.find((o) => o.label === optionLabel)?.extraPrice ?? 0;
    return product.price + extra;
  }, [product, optionLabel]);

  const total = unitPrice * quantity;
  const delivery = expectedDeliveryDate(1);

  function addToCart() {
    const result = addItem(product.id, quantity, optionLabel);
    showToast(
      result.capped
        ? `재고가 ${maxQuantity}개라 장바구니에 ${result.quantity}개까지만 담았어요.`
        : "장바구니에 담았어요.",
      { label: "보러가기", href: "/cart" }
    );
  }

  /** 바로 구매 — 장바구니를 거치지 않고 이 상품만 담긴 주문서로 바로 갑니다. */
  function buyNow() {
    setBuyNow({ productId: product.id, optionLabel, quantity: Math.min(quantity, maxQuantity) });
    router.push("/checkout?mode=now");
  }

  /** 탭을 바꾸거나 별점을 누르면 탭 영역 맨 위로 — 아래로 내려가 있어도 새 내용의 처음부터 읽습니다. */
  function openTab(id: TabId, scroll = false) {
    setTab(id);
    const anchor = tabsAnchor.current;
    if (anchor && (scroll || anchor.getBoundingClientRect().top < 0)) {
      anchor.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <div className="container-page py-5 md:py-8">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1 text-xs text-bark-400" aria-label="breadcrumb">
        <Link href="/" className="hover:text-leaf-700">홈</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/products?category=${category?.slug}`} className="hover:text-leaf-700">
          {category?.name}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="truncate text-bark-600">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Image */}
        <div className="group relative lg:sticky lg:top-32 lg:self-start">
          <div className="overflow-hidden rounded-[20px] border border-bark-100 bg-white">
            <div className="transition-transform duration-500 ease-out group-hover:scale-[1.04]">
              <ProductImage
                product={product}
                priority
                sizes="(max-width: 1023px) 100vw, 600px"
                className="w-full rounded-[20px]"
                iconSize="text-7xl"
              />
            </div>
          </div>
          {product.badges.length > 0 && (
            <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap gap-1.5">
              {product.badges.map((b) => (
                <Badge key={b} label={b} />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <Link
            href={`/farms/${farm?.slug}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-leaf-700 hover:underline"
          >
            <MapPin className="h-3.5 w-3.5" />
            {product.region} · {farm?.name}
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>

          <div className="mt-2 flex items-start justify-between gap-3">
            <h1 className="text-xl font-extrabold leading-snug text-bark-900 md:text-2xl">
              {product.name} <span className="font-bold text-bark-500">{product.unit}</span>
            </h1>
            <WishlistButton productId={product.id} size="lg" className="border border-bark-100" />
          </div>

          <p className="mt-2 text-sm leading-relaxed text-bark-500">{product.summary}</p>

          <button
            type="button"
            onClick={() => openTab("reviews", true)}
            aria-label={`리뷰 ${product.reviewCount}개 보기`}
            className="mt-3 inline-flex rounded-md focus-ring"
          >
            <RatingStars rating={product.rating} reviewCount={product.reviewCount} size="md" />
          </button>

          {/* Price */}
          <div className="mt-5 border-t border-bark-100 pt-5">
            {product.originalPrice && (
              <p className="text-sm text-bark-300 line-through">{formatWon(product.originalPrice)}</p>
            )}
            <p className="flex items-baseline gap-2">
              {product.originalPrice && (
                <span className="text-2xl font-extrabold text-tangerine-500">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                </span>
              )}
              <span className="text-[34px] font-extrabold text-bark-900">
                {formatPrice(product.price)}
                <span className="text-xl">원</span>
              </span>
            </p>
          </div>

          {/* Delivery box */}
          <div className="mt-5 space-y-2 rounded-card bg-leaf-50 p-4 text-sm">
            <p className="flex items-start gap-2 text-bark-700">
              <Truck className="mt-0.5 h-4 w-4 shrink-0 text-leaf-600" />
              <span>
                오늘 주문하면 <b className="text-leaf-700">{delivery.label} 도착 예정</b>
              </span>
            </p>
            <p className="flex items-start gap-2 text-bark-600">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-leaf-600" />
              <span>{product.shippingNote}</span>
            </p>
          </div>

          {/* Options */}
          {product.options && (
            <div className="mt-5">
              <p className="mb-2 text-sm font-bold text-bark-800">옵션 선택</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {product.options.map((o) => (
                  <button
                    key={o.label}
                    type="button"
                    onClick={() => setOptionLabel(o.label)}
                    aria-pressed={optionLabel === o.label}
                    className={`flex h-13 items-center justify-between gap-2 rounded-xl border px-4 text-[16px] transition-colors duration-200 ${
                      optionLabel === o.label
                        ? "border-leaf-600 bg-leaf-50 font-bold text-leaf-800"
                        : "border-bark-200 bg-white text-bark-600 hover:border-leaf-300"
                    }`}
                  >
                    <span>{o.label}</span>
                    {o.extraPrice > 0 && <span className="shrink-0 text-sm">+{formatWon(o.extraPrice)}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + total */}
          <div className="mt-5 rounded-card border border-bark-100 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <QuantityStepper value={quantity} onChange={setQuantity} max={maxQuantity} />
              <div className="min-w-0 text-right">
                <p className="text-xs text-bark-400">총 상품금액</p>
                <p className="text-xl font-extrabold text-bark-900">{formatWon(total)}</p>
              </div>
            </div>
            {quantity >= maxQuantity ? (
              <p className="mt-2.5 text-sm font-medium text-tangerine-600" role="status">
                한 번에 최대 {maxQuantity}개까지 주문할 수 있어요.
              </p>
            ) : (
              product.stock <= LOW_STOCK_THRESHOLD && (
                <p className="mt-2.5 text-sm font-medium text-tangerine-600">{product.stock}개 남았어요</p>
              )
            )}
          </div>

          {/* Desktop CTA */}
          <div className="mt-5 hidden gap-3 md:flex">
            <button type="button" onClick={addToCart} className="btn-outline h-14 flex-1 text-[18px] font-bold">
              <ShoppingCart className="h-[18px] w-[18px]" />
              장바구니
            </button>
            <button type="button" onClick={buyNow} className="btn-primary h-14 flex-1 text-[18px]">
              바로 구매
            </button>
          </div>
        </div>
      </div>

      {/* Tabs — 헤더 바로 아래에 붙습니다(모바일 56px, PC 헤더+카테고리 바 113px). */}
      <div ref={tabsAnchor} id="reviews" className="mt-12 scroll-mt-14 md:mt-16 md:scroll-mt-[113px]">
        <div
          role="tablist"
          aria-label="상품 상세"
          className="sticky top-14 z-10 -mx-4 grid grid-cols-5 border-b border-bark-100 bg-cream-100/95 px-4 backdrop-blur sm:-mx-6 sm:px-6 md:top-[113px] lg:mx-0 lg:flex lg:px-0"
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => openTab(t.id)}
              className={`h-13 min-w-0 whitespace-nowrap border-b-2 text-[16px] font-semibold transition-colors duration-200 lg:px-6 ${
                tab === t.id
                  ? "border-leaf-700 text-leaf-800"
                  : "border-transparent text-bark-400 hover:text-bark-600"
              }`}
            >
              {t.label}
              {t.id === "reviews" && (
                <span className="ml-1 text-tangerine-500">{reviewTotal.toLocaleString()}</span>
              )}
            </button>
          ))}
        </div>

        <div className="py-8 md:py-10">
          {tab === "intro" && (
            <div className="max-w-2xl space-y-5">
              {product.description.map((para, i) => (
                <p key={i} className="leading-relaxed text-bark-700">{para}</p>
              ))}
              <div className="rounded-card bg-cream-200/70 p-4 text-sm text-bark-600">
                <b className="text-bark-800">보관 방법</b> · {product.storageTip}
              </div>
            </div>
          )}

          {tab === "farm" && farm && (
            <div className="max-w-2xl">
              <p className="text-lg font-bold text-leaf-800">“{farm.quote}”</p>
              <p className="mt-1 text-sm text-bark-500">
                {farm.region} · {farm.owner} 농부 · {farm.since}년부터
              </p>
              <div className="mt-4 space-y-4">
                {farm.story.map((para, i) => (
                  <p key={i} className="leading-relaxed text-bark-700">{para}</p>
                ))}
              </div>
              <Link
                href={`/farms/${farm.slug}`}
                className="btn-outline mt-6 h-12 px-5 text-[16px]"
              >
                농가 이야기 더 보기
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {tab === "info" && (
            <dl className="max-w-2xl divide-y divide-bark-100 rounded-card border border-bark-100 bg-white text-sm">
              {[
                ["상품명", `${product.name} ${product.unit}`],
                ["원산지", product.region],
                ["생산자", `${farm?.name} (${farm?.owner})`],
                ["인증", farm?.certifications.join(", ") ?? "-"],
                ["보관 방법", product.storageTip],
                ["재고", `${product.stock}개`],
              ].map(([k, v]) => (
                <div key={k} className="flex">
                  <dt className="w-28 shrink-0 bg-cream-50 px-4 py-3 font-semibold text-bark-500">{k}</dt>
                  <dd className="flex-1 px-4 py-3 text-bark-700">{v}</dd>
                </div>
              ))}
            </dl>
          )}

          {tab === "shipping" && (
            <div className="max-w-2xl space-y-4 text-sm leading-relaxed text-bark-700">
              <div className="rounded-card border border-bark-100 bg-white p-5">
                <h3 className="font-bold text-bark-900">배송 안내</h3>
                <p className="mt-2">{product.shippingNote}</p>
                <p className="mt-1">
                  {formatPrice(FREE_SHIPPING_THRESHOLD)}원 이상 주문 시 무료배송, 미만 시 배송비{" "}
                  {formatPrice(SHIPPING_FEE)}원이 붙습니다.
                </p>
              </div>
              <div className="rounded-card border border-bark-100 bg-white p-5">
                <h3 className="font-bold text-bark-900">교환/반품 안내</h3>
                <p className="mt-2">
                  신선식품 특성상 단순 변심에 의한 교환·반품은 어렵습니다. 상품 하자나 배송 중 파손은
                  수령 후 24시간 이내 사진과 함께 문의해 주시면 빠르게 처리해드립니다.
                </p>
              </div>
            </div>
          )}

          {tab === "reviews" && (
            <div className="max-w-2xl">
              <div className="mb-6 flex items-center gap-4 rounded-card border border-bark-100 bg-white p-5">
                <p className="text-3xl font-extrabold text-bark-900">{product.rating.toFixed(1)}</p>
                <div>
                  <p className="flex gap-0.5" aria-label={`5점 만점에 ${product.rating.toFixed(1)}점`}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={`h-5 w-5 ${
                          n <= Math.round(product.rating) ? "fill-tangerine-400 text-tangerine-400" : "text-bark-200"
                        }`}
                      />
                    ))}
                  </p>
                  <p className="mt-1 text-sm text-bark-500">리뷰 {reviewTotal.toLocaleString()}개</p>
                </div>
              </div>
              {productReviews.length === 0 ? (
                <p className="py-8 text-center text-[16px] text-bark-400">아직 글로 남긴 후기가 없어요.</p>
              ) : (
                <ul className="divide-y divide-bark-100">
                  {productReviews.map((r) => (
                    <li key={r.id} className="py-5">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-bark-400">
                        <RatingStars rating={r.rating} />
                        <span className="font-medium text-bark-600">{r.author}</span>
                        <span>{formatDate(r.date)}</span>
                        {r.id.startsWith("my-") && (
                          <span className="rounded-md bg-leaf-50 px-1.5 py-0.5 font-semibold text-leaf-700">내 리뷰</span>
                        )}
                      </div>
                      <p className="mt-2 text-[16px] leading-relaxed text-bark-700">{r.content}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-6 border-t border-bark-100 pt-10">
          <h2 className="mb-5 text-lg font-extrabold text-bark-900 md:text-2xl">함께 보면 좋은 상품</h2>
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-4 md:gap-x-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile sticky CTA */}
      {/* 이 화면에서는 하단 탭을 숨기고 구매 바가 바닥을 씁니다(MobileNav의 isPurchaseFocusRoute). */}
      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-bark-100 bg-white/95 px-4 pt-2.5 backdrop-blur md:hidden"
        style={{ paddingBottom: "max(10px, env(safe-area-inset-bottom))" }}
      >
        {/* 글자를 키운 뒤에도 좁은 화면에서 잘리지 않도록 장바구니는 아이콘 버튼으로 둡니다. */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={addToCart}
            aria-label="장바구니에 담기"
            className="btn-outline h-13 w-13 shrink-0 px-0"
          >
            <ShoppingCart className="h-[22px] w-[22px]" />
          </button>
          <button
            type="button"
            onClick={buyNow}
            className="btn-primary h-13 min-w-0 flex-1 text-[18px]"
          >
            {formatWon(total)} 바로 구매
          </button>
        </div>
      </div>
    </div>
  );
}
