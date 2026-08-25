import Link from "next/link";
import { HandHeart, Leaf, Package, ShieldCheck, Smartphone, Sun, Ticket, Truck } from "lucide-react";
import HeroBanner from "@/components/HeroBanner";
import ProductCard from "@/components/ProductCard";
import FarmCard from "@/components/FarmCard";
import SectionHeader from "@/components/SectionHeader";
import { categories } from "@/lib/data/categories";
import { farms } from "@/lib/data/farms";
import { products } from "@/lib/data/products";

const trustItems = [
  { icon: Truck, title: "산지직송", desc: "신선한 먹거리를 빠르게" },
  { icon: Sun, title: "제철 먹거리", desc: "제철에 가장 맛있는 상품" },
  { icon: HandHeart, title: "농가와의 상생", desc: "정직한 가격, 따뜻한 연결" },
  { icon: ShieldCheck, title: "안심 먹거리", desc: "친환경·무농약 인증 상품" },
  { icon: Smartphone, title: "간편한 쇼핑", desc: "쉽고 빠른 모바일 주문" },
];

export default function HomePage() {
  const recommended = [...products].sort((a, b) => b.salesCount - a.salesCount).slice(0, 8);
  const seasonal = products.filter((p) => p.isSeasonal);

  return (
    <div className="space-y-12 pb-8 md:space-y-16">
      <HeroBanner />

      {/* Category quick access (mobile) */}
      <section className="container-page !mt-6 md:hidden">
        <div className="grid grid-cols-4 gap-y-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/products?category=${c.slug}`}
              className="flex flex-col items-center gap-1.5 tap-highlight-none"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-soft transition-transform duration-200 active:scale-95">
                {c.emoji}
              </span>
              <span className="text-xs font-medium text-bark-600">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 오늘의 추천 상품 */}
      <section className="container-page">
        <SectionHeader
          title="오늘의 추천 상품"
          subtitle="오늘 가장 사랑받는 신선 먹거리를 골랐어요"
          moreHref="/products"
        />
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 md:gap-x-5 md:gap-y-8 lg:grid-cols-4">
          {recommended.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* 지금 뜨는 제철 상품 */}
      <section className="bg-leaf-50 py-10 md:py-14">
        <div className="container-page">
          <SectionHeader
            title="지금 뜨는 제철 상품"
            subtitle="제철에 먹어야 가장 맛있으니까요"
            moreHref="/products?filter=seasonal"
          />
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 lg:grid-cols-5">
            {seasonal.slice(0, 5).map((p) => (
              <div key={p.id} className="w-[160px] shrink-0 md:w-auto">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 배송/정기배송 안내 */}
      <section className="container-page grid gap-4 md:grid-cols-2 md:gap-5">
        <div className="flex items-center justify-between gap-4 rounded-card bg-leaf-100 p-6 md:p-7">
          <div>
            <p className="text-sm font-semibold text-leaf-700">산지에서 우리집까지</p>
            <p className="mt-1 text-lg font-extrabold text-leaf-900 md:text-xl">
              신선함을 빠르게 배송해드려요
            </p>
            <p className="mt-2 text-xs text-leaf-700/80 md:text-sm">
              평일 오후 2시 이전 주문 시 당일 발송!
            </p>
          </div>
          <Truck className="h-14 w-14 shrink-0 text-leaf-600 md:h-16 md:w-16" strokeWidth={1.4} />
        </div>
        <div className="flex items-center justify-between gap-4 rounded-card bg-tangerine-100 p-6 md:p-7">
          <div>
            <p className="text-sm font-semibold text-tangerine-600">로컬맘 제철 장보기</p>
            <p className="mt-1 text-lg font-extrabold text-tangerine-900 md:text-xl">
              제철 먹거리를 매주 만나보세요
            </p>
            <p className="mt-2 text-xs text-tangerine-700/80 md:text-sm">
              4만원 이상 주문 시 무료배송
            </p>
          </div>
          <Package className="h-14 w-14 shrink-0 text-tangerine-500 md:h-16 md:w-16" strokeWidth={1.4} />
        </div>
      </section>

      {/* 쿠폰 배너 */}
      <section className="container-page">
        <Link
          href="/mypage?tab=coupons"
          className="flex items-center justify-between gap-4 rounded-card border border-dashed border-tangerine-300 bg-tangerine-50 px-6 py-5 transition-colors duration-200 hover:bg-tangerine-100"
        >
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-tangerine-500 shadow-soft">
              <Ticket className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-bold text-bark-800 md:text-base">
                로컬맘 첫 구매 혜택 — 신규 회원 10% 할인 쿠폰
              </p>
              <p className="mt-0.5 text-xs text-bark-500">쿠폰함에서 바로 확인하세요</p>
            </div>
          </div>
          <span className="shrink-0 text-2xl font-extrabold text-tangerine-500 md:text-3xl">10%</span>
        </Link>
      </section>

      {/* 농가 스토리 */}
      <section className="container-page">
        <SectionHeader
          title="농가 스토리"
          subtitle="우리 동네 농부의 이야기를 만나보세요"
          moreHref="/farms"
        />
        <div className="grid gap-4 md:grid-cols-3 md:gap-5">
          {farms.slice(0, 3).map((f) => (
            <FarmCard key={f.id} farm={f} />
          ))}
        </div>
      </section>

      {/* 신뢰 섹션 */}
      <section className="border-t border-bark-100 bg-white py-10 md:py-14">
        <div className="container-page grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-5">
          {trustItems.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center gap-2 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-leaf-50 text-leaf-600">
                <Icon className="h-6 w-6" strokeWidth={1.8} />
              </span>
              <p className="text-sm font-bold text-bark-800">{title}</p>
              <p className="text-xs leading-relaxed text-bark-400">{desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 flex items-center justify-center gap-1.5 text-sm font-medium text-leaf-700">
          <Leaf className="h-4 w-4" />
          좋은 농사가 좋은 식탁을 만듭니다
        </p>
      </section>
    </div>
  );
}
