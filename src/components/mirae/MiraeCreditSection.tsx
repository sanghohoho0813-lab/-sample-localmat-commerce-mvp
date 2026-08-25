import { Boxes, Smartphone, Sparkles, Zap } from "lucide-react";
import MiraeLockup from "@/components/mirae/MiraeLockup";

const capabilities = [
  { icon: Zap, title: "빠른 MVP 구축", desc: "기획부터 배포까지 1~2주" },
  { icon: Smartphone, title: "모바일 퍼스트 UX", desc: "PC·모바일 각각 최적화" },
  { icon: Boxes, title: "실제 동작하는 데모", desc: "탐색부터 주문까지 전 구간" },
];

/**
 * 홈 하단 제작사 크레딧 섹션.
 * 커머스 톤을 해치지 않도록 브랜드 다크 컬러 밴드로 명확히 구분합니다.
 */
export default function MiraeCreditSection() {
  return (
    <section className="bg-mirae-ink py-12 md:py-16">
      <div className="container-page">
        <div className="grid items-center gap-8 md:grid-cols-[1.1fr_1fr] md:gap-12">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-mirae-cyan">
              <Sparkles className="h-4 w-4" />
              PORTFOLIO REFERENCE
            </p>
            <h2 className="mt-3 text-2xl font-extrabold leading-snug text-white md:text-3xl">
              이 서비스는
              <br className="md:hidden" />{" "}
              <span className="text-mirae-cyan">미래에이아이랩</span>이 만들었습니다
            </h2>
            <p className="mt-4 max-w-xl leading-relaxed text-mirae-mist">
              &lsquo;로컬맘&rsquo;은 지역 농가와 소비자를 잇는 신선식품 커머스를 주제로 제작한
              레퍼런스 데모입니다. 화면 설계부터 반응형 UI, 구매 플로우, 데이터 구조까지 실제
              서비스와 동일한 기준으로 구현했습니다.
            </p>

            {/* 로고 글자가 짙은 남색이라 다크 밴드 위에서는 흰 카드에 올려 브랜드 색을 지킵니다. */}
            <MiraeLockup width={240} onDark className="mt-8" />
          </div>

          <ul className="grid gap-3">
            {capabilities.map(({ icon: Icon, title, desc }) => (
              <li
                key={title}
                className="flex items-center gap-4 rounded-card border border-white/10 bg-white/[0.06] px-5 py-4 backdrop-blur"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-mirae-cyan/15 text-mirae-cyan">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block font-bold text-white">{title}</span>
                  <span className="block text-sm text-mirae-mist">{desc}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
