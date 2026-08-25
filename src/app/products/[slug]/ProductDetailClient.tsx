"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Clock, MapPin, ShoppingCart, Sprout, Truck } from "lucide-react";
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
import { expectedDeliveryDate, formatDate, formatPrice, formatWon } from "@/lib/format";
import { useCartStore, useRecentStore, useToastStore } from "@/lib/store";
import type { Product } from "@/lib/types";

const tabs = [
  { id: "intro", label: "상품 소개" },
  { id: "farm", label: "생산자 스토리" },
  { id: "info", label: "상품정보" },
  { id: "shipping", label: "배송/교환" },
  { id: "reviews", label: "리뷰" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function ProductDetailClient({ product }: { product: Product }) {
  const router = useRouter();
  const farm = getFarm(product.farmId);
  const category = getCategory(product.categoryId);
  const productReviews = getProductReviews(product.id);
  const related = products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4);

  const [optionLabel, setOptionLabel] = useState(product.options?.[0]?.label);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState<TabId>("intro");

  const addItem = useCartStore((s) => s.addItem);
  const showToast = useToastStore((s) => s.show);
  const pushRecent = useRecentStore((s) => s.push);

  useEffect(() => {
    pushRecent(product.id);
  }, [product.id, pushRecent]);

  const unitPrice = useMemo(() => {
    const extra = product.options?.find((o) => o.label === optionLabel)?.extraPrice ?? 0;
    return product.price + extra;
  }, [product, optionLabel]);

  const total = unitPrice * quantity;
  const delivery = expectedDeliveryDate(1);

  function addToCart() {
    addItem(product.id, quantity, optionLabel);
    showToast("장바구니에 담았어요.", { label: "보러가기", href: "/cart" });
  }

  function buyNow() {
    addItem(product.id, quantity, optionLabel);
    router.push("/cart");
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

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
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
            onClick={() => setTab("reviews")}
            className="mt-3 inline-flex"
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
          <div className="mt-5 space-y-2.5 rounded-card bg-leaf-50 p-4 text-sm">
            <p className="flex items-center gap-2 text-bark-700">
              <Truck className="h-4 w-4 shrink-0 text-leaf-600" />
              <span>
                오늘 주문하면 <b className="text-leaf-700">{delivery.label} 도착 예정</b>
              </span>
            </p>
            <p className="flex items-center gap-2 text-bark-600">
              <Clock className="h-4 w-4 shrink-0 text-leaf-600" />
              {product.shippingNote}
            </p>
            <p className="flex items-center gap-2 text-bark-600">
              <Sprout className="h-4 w-4 shrink-0 text-leaf-600" />
              남은 수량 <b className="text-bark-800">{product.stock}개</b> · 산지에서 바로 보내드립니다
            </p>
          </div>

          {/* Options */}
          {product.options && (
            <div className="mt-5">
              <p className="mb-2 text-sm font-bold text-bark-800">옵션 선택</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {product.options.map((o) => (
                  <button
                    key={o.label}
                    type="button"
                    onClick={() => setOptionLabel(o.label)}
                    className={`flex h-13 items-center justify-between rounded-xl border px-4 text-sm transition-colors duration-200 ${
                      optionLabel === o.label
                        ? "border-leaf-600 bg-leaf-50 font-bold text-leaf-800"
                        : "border-bark-200 bg-white text-bark-600 hover:border-leaf-300"
                    }`}
                  >
                    <span>{o.label}</span>
                    {o.extraPrice > 0 && <span className="text-xs">+{formatWon(o.extraPrice)}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + total */}
          <div className="mt-5 flex items-center justify-between rounded-card border border-bark-100 bg-white p-4">
            <QuantityStepper value={quantity} onChange={setQuantity} />
            <div className="text-right">
              <p className="text-xs text-bark-400">총 상품금액</p>
              <p className="text-xl font-extrabold text-bark-900">{formatWon(total)}</p>
            </div>
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

      {/* Tabs */}
      <div className="mt-12 md:mt-16">
        <div className="sticky top-[104px] z-10 -mx-4 flex overflow-x-auto border-b border-bark-100 bg-cream-100/95 px-4 backdrop-blur scrollbar-none sm:-mx-6 sm:px-6 md:top-[112px] lg:mx-0 lg:px-0">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition-colors duration-200 ${
                tab === t.id
                  ? "border-leaf-700 text-leaf-800"
                  : "border-transparent text-bark-400 hover:text-bark-600"
              }`}
            >
              {t.label}
              {t.id === "reviews" && (
                <span className="ml-1 text-xs text-tangerine-500">{productReviews.length}</span>
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
                className="btn-outline mt-6 h-11 px-5 text-sm"
              >
                농가 상세 보러가기
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
                <p className="mt-1">4만원 이상 주문 시 무료배송, 미만 시 배송비 3,000원이 부과됩니다.</p>
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
              <div className="mb-6 flex items-center gap-4 rounded-card bg-white p-5 border border-bark-100">
                <p className="text-3xl font-extrabold text-bark-900">{product.rating.toFixed(1)}</p>
                <div>
                  <RatingStars rating={product.rating} size="md" />
                  <p className="mt-1 text-xs text-bark-400">리뷰 {product.reviewCount.toLocaleString()}개</p>
                </div>
              </div>
              {productReviews.length === 0 ? (
                <p className="py-8 text-center text-sm text-bark-400">
                  아직 등록된 리뷰가 없어요. 첫 번째 리뷰의 주인공이 되어주세요!
                </p>
              ) : (
                <ul className="divide-y divide-bark-100">
                  {productReviews.map((r) => (
                    <li key={r.id} className="py-5">
                      <div className="flex items-center gap-2 text-xs text-bark-400">
                        <RatingStars rating={r.rating} />
                        <span className="font-medium text-bark-600">{r.author}</span>
                        <span>{formatDate(r.date)}</span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-bark-700">{r.content}</p>
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
      <div
        className="fixed inset-x-0 bottom-16 z-30 border-t border-bark-100 bg-white/95 px-4 py-2.5 backdrop-blur md:hidden"
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
      {/* Spacer so content isn't hidden behind mobile CTA */}
      <div className="h-16 md:hidden" />
    </div>
  );
}
