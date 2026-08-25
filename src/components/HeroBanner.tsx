import Link from "next/link";
import { ArrowRight, Leaf, Sun, Truck } from "lucide-react";

export default function HeroBanner() {
  return (
    <section className="container-page pt-4 md:pt-6">
      <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-leaf-100 via-cream-50 to-cream-200 md:rounded-[24px]">
        {/* Decorative produce composition (placeholder for hero photography) */}
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 select-none md:block" aria-hidden>
          <div className="absolute right-16 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-leaf-200/50 blur-2xl" />
          <div className="absolute right-48 top-10 h-24 w-24 rounded-full bg-tangerine-200/40 blur-xl" />
          <span className="absolute right-40 top-1/2 -translate-y-1/2 text-[120px] opacity-70">🧺</span>
          <span className="absolute right-24 top-16 text-5xl opacity-60">🥬</span>
          <span className="absolute right-72 top-24 text-4xl opacity-50">🍅</span>
          <span className="absolute bottom-14 right-24 text-4xl opacity-50">🥕</span>
          <span className="absolute bottom-20 right-80 text-3xl opacity-40">🍓</span>
        </div>

        {/* Seasonal sticker */}
        <Link
          href="/products?filter=seasonal"
          className="absolute right-4 top-4 z-10 hidden h-24 w-24 flex-col items-center justify-center rounded-full bg-white/90 text-center shadow-soft backdrop-blur transition-transform duration-200 hover:scale-105 lg:flex"
        >
          <span className="text-[11px] font-semibold text-tangerine-500">지금이 제철!</span>
          <span className="mt-0.5 text-sm font-extrabold leading-tight text-leaf-800">
            제철 먹거리
            <br />
            모음전
          </span>
        </Link>

        <div className="relative px-5 py-10 md:px-12 md:py-16 lg:py-20">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-leaf-700 md:text-sm">
            <Leaf className="h-4 w-4" />
            우리 동네, 신선한 한 끼 — 로컬맘
          </p>
          <h1 className="mt-3 text-[26px] font-extrabold leading-[1.25] tracking-tight text-bark-900 md:text-[42px] lg:text-5xl">
            지금, 가장 신선한
            <br />
            <span className="text-leaf-700">제철 로컬 푸드</span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-bark-500 md:mt-4 md:text-base">
            우리 지역 농가의 신선한 식탁을 만나보세요.
            <br className="hidden md:block" /> 오늘 주문하면 내일 신선하게 도착해요.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-bark-500 md:text-sm">
            <span className="flex items-center gap-1"><Truck className="h-4 w-4 text-leaf-600" /> 산지직송</span>
            <span className="flex items-center gap-1"><Sun className="h-4 w-4 text-leaf-600" /> 당일수확</span>
            <span className="flex items-center gap-1"><Leaf className="h-4 w-4 text-leaf-600" /> 친환경</span>
          </div>

          <Link
            href="/products?filter=seasonal"
            className="btn-primary mt-7 h-12 px-6 text-[15px] shadow-soft md:mt-8"
          >
            제철 상품 보러가기
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
