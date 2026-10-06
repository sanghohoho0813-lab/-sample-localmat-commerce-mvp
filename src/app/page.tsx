import Link from "next/link";
import { ChevronRight, Clock, ShieldCheck, Ticket, Truck, Wallet } from "lucide-react";
import HeroBanner from "@/components/HeroBanner";
import HomeProductTabs from "@/components/HomeProductTabs";
import FarmCard from "@/components/FarmCard";
import SectionHeader from "@/components/SectionHeader";
import { categories } from "@/lib/data/categories";
import { farms } from "@/lib/data/farms";
import { formatPrice } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/data/etc";

/** 쇼핑 전에 궁금한 것만 — 배송·비용·품질 */
const promises = [
  { icon: Truck, title: "산지에서 바로 발송" },
  { icon: Clock, title: "오후 2시 전 주문, 당일 출고" },
  { icon: Wallet, title: `${formatPrice(FREE_SHIPPING_THRESHOLD)}원 이상 무료배송` },
  { icon: ShieldCheck, title: "인증 농가 상품만" },
];

export default function HomePage() {
  return (
    <div className="space-y-10 md:space-y-16">
      <HeroBanner />

      {/* 카테고리 바로가기 (모바일 — PC는 상단 카테고리 바) */}
      <section className="container-page !mt-6 md:hidden" aria-label="카테고리">
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

      <HomeProductTabs />

      {/* 첫 구매 쿠폰 */}
      <section className="container-page">
        <Link
          href="/mypage?tab=coupons"
          className="flex items-center gap-4 rounded-card bg-tangerine-50 px-5 py-4 ring-1 ring-tangerine-200 transition-colors duration-200 hover:bg-tangerine-100 md:px-7 md:py-5"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-tangerine-500 shadow-soft">
            <Ticket className="h-5 w-5" />
          </span>
          <p className="min-w-0 flex-1 text-[16px] font-bold leading-snug text-bark-800 md:text-lg">
            첫 구매 <span className="text-tangerine-600">10% 할인</span> 쿠폰이 준비돼 있어요
          </p>
          <ChevronRight className="h-5 w-5 shrink-0 text-tangerine-500" />
        </Link>
      </section>

      {/* 농가 스토리 — 모바일은 옆으로 넘겨 보기 */}
      <section className="container-page">
        <SectionHeader title="농가 스토리" moreHref="/farms" moreLabel="전체보기" />
        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 scrollbar-none sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 md:pb-0">
          {farms.slice(0, 3).map((f) => (
            <div key={f.id} className="w-[85%] shrink-0 snap-start sm:w-[60%] md:w-auto">
              <FarmCard farm={f} />
            </div>
          ))}
        </div>
      </section>

      {/* 로컬맘 약속 */}
      <section className="border-t border-bark-100 bg-white py-8 md:py-10" aria-label="로컬맘 약속">
        <ul className="container-page grid grid-cols-2 gap-x-4 gap-y-5 md:grid-cols-4">
          {promises.map(({ icon: Icon, title }) => (
            <li key={title} className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-leaf-50 text-leaf-600">
                <Icon className="h-5 w-5" strokeWidth={1.9} />
              </span>
              <span className="text-sm font-semibold leading-snug text-bark-700">{title}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
