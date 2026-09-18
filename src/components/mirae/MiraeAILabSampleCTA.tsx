import { ArrowRight, ArrowUpRight } from "lucide-react";
import MiraeMark from "@/components/mirae/MiraeMark";
import {
  MIRAE_CAPABILITIES,
  MIRAE_CTA_COPY,
  MIRAE_LINKS,
} from "@/lib/mirae";

/**
 * 샘플 페이지 공통 브릿지 CTA.
 *
 * 샘플을 다 본 사용자를 ① 제작사 인지 → ② 상담 전환 → ③ 다른 샘플/홈페이지로 잇습니다.
 * 루트 레이아웃에서 Footer 바로 위에 한 번 렌더링하므로 모든 샘플 페이지 하단에 동일하게 나옵니다.
 *
 * - 링크/문구 수정: src/lib/mirae.ts (props로도 덮어쓸 수 있습니다)
 * - 로고는 상단 리본·푸터에 이미 있으므로 여기서는 배지의 작은 심볼만 씁니다.
 * - 메인 CTA에만 6초 주기의 아주 약한 light sweep을 넣고, motion-reduce에서는 숨깁니다.
 */
export default function MiraeAILabSampleCTA({
  consultHref = MIRAE_LINKS.consultHref,
  samplesHref = MIRAE_LINKS.samplesHref,
  homeHref = MIRAE_LINKS.homeHref,
}: {
  consultHref?: string;
  samplesHref?: string;
  homeHref?: string;
}) {
  return (
    <section
      aria-labelledby="mirae-cta-heading"
      className="border-t border-white/5 bg-mirae-ink"
    >
      {/* 브랜드 컬러의 아주 옅은 후광 — 광고 배너가 아니라 섹션 강조 정도로만 */}
      <div className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-64 w-[48rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-mirae-cyan/10 blur-3xl"
        />

        <div className="container-page relative py-14 md:py-20">
          {/* 헤드라인이 2줄로 떨어지도록 바깥 폭은 넓게 두고,
              본문은 안쪽에서 다시 좁혀 가독 폭을 유지합니다. */}
          <div className="mx-auto max-w-4xl text-center">
            {/* 배지 */}
            <p className="inline-flex items-center gap-2 rounded-pill border border-white/15 bg-white/[0.06] py-1.5 pl-1.5 pr-4 backdrop-blur">
              <MiraeMark size={24} className="h-6 w-6 shrink-0" />
              <span className="text-xs font-bold tracking-[0.16em] text-mirae-cyan">
                {MIRAE_CTA_COPY.badge}
              </span>
            </p>

            {/* 메인 헤드라인 */}
            <h2
              id="mirae-cta-heading"
              className="mt-6 text-2xl font-extrabold leading-snug tracking-tight text-white md:text-4xl [text-wrap:balance]"
            >
              {MIRAE_CTA_COPY.headlineLead}
              <br />
              {MIRAE_CTA_COPY.headlineMain}
            </h2>

            {/* 제작사 소개 */}
            <p className="mt-6 font-bold text-mirae-cyan md:text-lg">
              {MIRAE_CTA_COPY.introTitle}
            </p>
            <p className="mx-auto mt-2 max-w-2xl leading-relaxed text-mirae-mist">
              {MIRAE_CTA_COPY.introBody}
            </p>

            {/* 메인 CTA */}
            <div className="mt-9">
              <a
                href={consultHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-mirae-cyan to-mirae-sky px-8 text-lg font-extrabold text-mirae-ink shadow-[0_8px_28px_-10px_rgba(25,198,244,0.65)] outline-none transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_-10px_rgba(25,198,244,0.8)] focus-visible:ring-2 focus-visible:ring-mirae-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-mirae-ink sm:w-auto"
              >
                {/* 은은한 light sweep — 6초에 한 번 짧게 지나갑니다 */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/45 to-transparent animate-light-sweep motion-reduce:hidden"
                />
                <span className="relative">{MIRAE_CTA_COPY.consultLabel}</span>
                <ArrowRight className="relative h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
                <span className="sr-only">(새 창으로 열림)</span>
              </a>
              <p className="mt-3 text-sm text-mirae-mist/70">{MIRAE_CTA_COPY.note}</p>
            </div>

            {/* 서브 액션 — 메인 CTA보다 덜 튀게 */}
            <div className="mt-7 flex flex-col items-stretch justify-center gap-2.5 sm:flex-row sm:items-center">
              <a
                href={samplesHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-1.5 rounded-xl border border-white/20 px-5 text-[16px] font-semibold text-white outline-none transition-colors duration-200 hover:border-white/40 hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-mirae-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-mirae-ink"
              >
                {MIRAE_CTA_COPY.samplesLabel}
                <ArrowUpRight className="h-4 w-4 shrink-0" />
                <span className="sr-only">(새 창으로 열림)</span>
              </a>
              <a
                href={homeHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-1.5 rounded-xl px-5 text-[16px] font-medium text-mirae-mist outline-none transition-colors duration-200 hover:text-white focus-visible:ring-2 focus-visible:ring-mirae-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-mirae-ink"
              >
                {MIRAE_CTA_COPY.homeLabel}
                <ArrowUpRight className="h-4 w-4 shrink-0" />
                <span className="sr-only">(새 창으로 열림)</span>
              </a>
            </div>

            {/* 역량 칩 */}
            <ul className="mt-10 flex flex-wrap items-center justify-center gap-2">
              {MIRAE_CAPABILITIES.map((item) => (
                <li
                  key={item}
                  className="rounded-pill border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-mirae-mist"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
