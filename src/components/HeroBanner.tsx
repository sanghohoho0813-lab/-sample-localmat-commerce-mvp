import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";
import { EtaLine } from "@/components/DeliveryEta";

/**
 * 메인 Hero — 실제 산지 사진 위 에디토리얼 커머스 배너.
 * 사진 구도가 "인물 우측 / 여백 좌측"이라 카피는 좌측에 배치합니다.
 * - 데스크톱: 밝은 크림 스크림 + 진한 텍스트 (넓은 여백의 에디토리얼 톤)
 * - 모바일: 딥그린 스크림 + 흰 텍스트 (좁은 화면에서 대비를 확보한 프로모션 카드 톤)
 * 배경 사진 교체: public/images/farms/pyeongchang-highland.webp
 */
const HERO_IMAGE = "/images/farms/pyeongchang-highland.webp";

export default function HeroBanner({ month, farmCount }: { month: number; farmCount: number }) {
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

        <div className="relative flex min-h-[320px] flex-col justify-end px-5 pb-6 pt-16 md:block md:min-h-0 md:max-w-[58%] md:px-12 md:py-16 md:pt-16 lg:py-24">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-leaf-200 md:text-sm md:text-leaf-700">
            <Leaf className="h-4 w-4" />
            {month}월, 산지 {farmCount}곳에서 출하 중
          </p>
          <h1 className="mt-2.5 text-[34px] font-extrabold leading-[1.25] tracking-tight text-white md:mt-3 md:text-[50px] md:text-bark-900 lg:text-5xl">
            지금, 가장 신선한
            <br />
            <span className="text-leaf-200 md:text-leaf-700">제철 로컬 푸드</span>
          </h1>
          <p className="mt-2.5 text-sm leading-relaxed text-leaf-100/90 md:mt-4 md:text-base md:text-bark-600">
            <span className="hidden md:inline">농가가 직접 수확·포장해 보내는 제철 먹거리.<br /></span>
            {/* 실제 출고 마감(오후 2시)·주말 기준으로 계산한 도착일 — 시각을 알기 전엔 자리만 잡아 둡니다 */}
            <EtaLine products={[{ temp: "상온" }]} tone="onDark" />
          </p>

          {/* 모바일은 핵심 버튼 하나만 — 농가 이야기는 하단 '스토리' 탭에 있습니다. */}
          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:items-center md:mt-8">
            <Link
              href="/products?filter=seasonal"
              className="btn-primary h-13 w-full whitespace-nowrap px-5 text-[18px] shadow-soft sm:w-auto md:px-6"
            >
              {month}월 제철 장보기
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
            <Link
              href="/farms"
              className="hidden h-13 w-full items-center justify-center whitespace-nowrap rounded-xl border border-white/35 bg-white/10 px-5 text-[18px] font-semibold text-white backdrop-blur transition-colors duration-200 hover:bg-white/20 sm:inline-flex sm:w-auto md:border-bark-200 md:bg-white md:text-bark-700 md:hover:border-leaf-400 md:hover:text-leaf-700"
            >
              농가 이야기
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
