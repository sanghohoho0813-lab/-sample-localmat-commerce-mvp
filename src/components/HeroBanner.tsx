import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf, Sun, Truck } from "lucide-react";

/**
 * 메인 Hero — 실제 산지 사진 위 에디토리얼 커머스 배너.
 * 사진 구도가 "인물 우측 / 여백 좌측"이라 카피는 좌측에 배치합니다.
 * - 데스크톱: 밝은 크림 스크림 + 진한 텍스트 (넓은 여백의 에디토리얼 톤)
 * - 모바일: 딥그린 스크림 + 흰 텍스트 (좁은 화면에서 대비를 확보한 프로모션 카드 톤)
 * 배경 사진 교체: public/images/farms/pyeongchang-highland.webp
 */
const HERO_IMAGE = "/images/farms/pyeongchang-highland.webp";

export default function HeroBanner() {
  return (
    <section className="container-page pt-4 md:pt-6">
      <div className="relative overflow-hidden rounded-[20px] bg-leaf-900 md:rounded-[24px] md:bg-cream-200">
        <Image
          src={HERO_IMAGE}
          alt="해 질 무렵 평창 고랭지 밭에서 갓 수확한 채소를 든 농부"
          fill
          priority
          sizes="(max-width: 767px) 100vw, (max-width: 1279px) 100vw, 1216px"
          className="object-cover object-[68%_center] md:object-[72%_center]"
        />

        {/* 카피 가독성 스크림 — 모바일은 하단 딥그린, 데스크톱은 좌측 크림 */}
        <div className="absolute inset-0 bg-gradient-to-t from-leaf-950/95 from-20% via-leaf-900/70 to-leaf-900/20 md:bg-gradient-to-r md:from-cream-50 md:from-0% md:via-cream-50/88 md:via-45% md:to-transparent" />

        {/* 제철 스티커 */}
        <Link
          href="/products?filter=seasonal"
          className="absolute right-5 top-5 z-10 hidden h-24 w-24 flex-col items-center justify-center rounded-full bg-white/95 text-center shadow-lift backdrop-blur transition-transform duration-200 hover:scale-105 focus-ring lg:flex"
        >
          <span className="text-[11px] font-semibold text-tangerine-500">지금이 제철!</span>
          <span className="mt-0.5 text-sm font-extrabold leading-tight text-leaf-800">
            제철 먹거리
            <br />
            모음전
          </span>
        </Link>

        <div className="relative flex min-h-[420px] flex-col justify-end px-5 pb-7 pt-24 md:block md:min-h-0 md:max-w-[58%] md:px-12 md:py-16 md:pt-16 lg:py-24">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-leaf-200 md:text-sm md:text-leaf-700">
            <Leaf className="h-4 w-4" />
            우리 동네, 신선한 한 끼 — 로컬맘
          </p>
          <h1 className="mt-2.5 text-[28px] font-extrabold leading-[1.25] tracking-tight text-white md:mt-3 md:text-[42px] md:text-bark-900 lg:text-5xl">
            지금, 가장 신선한
            <br />
            <span className="text-leaf-200 md:text-leaf-700">제철 로컬 푸드</span>
          </h1>
          <p className="mt-2.5 text-sm leading-relaxed text-leaf-100/90 md:mt-4 md:text-base md:text-bark-600">
            우리 지역 농가의 신선한 식탁을 만나보세요.
            <br className="hidden md:block" /> 오늘 주문하면 내일 신선하게 도착해요.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-leaf-100/85 md:mt-5 md:text-sm md:text-bark-600">
            <span className="flex items-center gap-1"><Truck className="h-4 w-4 text-leaf-300 md:text-leaf-600" /> 산지직송</span>
            <span className="flex items-center gap-1"><Sun className="h-4 w-4 text-leaf-300 md:text-leaf-600" /> 당일수확</span>
            <span className="flex items-center gap-1"><Leaf className="h-4 w-4 text-leaf-300 md:text-leaf-600" /> 친환경</span>
          </div>

          <div className="mt-6 flex items-center gap-2.5 md:mt-8">
            <Link
              href="/products?filter=seasonal"
              className="btn-primary h-12 flex-1 whitespace-nowrap px-4 text-[15px] shadow-soft md:flex-none md:px-6"
            >
              제철 상품 보러가기
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
            <Link
              href="/farms"
              className="inline-flex h-12 shrink-0 items-center justify-center whitespace-nowrap rounded-xl border border-white/35 bg-white/10 px-4 text-[15px] font-semibold text-white backdrop-blur transition-colors duration-200 hover:bg-white/20 md:border-bark-200 md:bg-white md:px-5 md:text-bark-700 md:hover:border-leaf-400 md:hover:text-leaf-700"
            >
              농가 이야기
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
