import MiraeMark from "@/components/mirae/MiraeMark";

/**
 * 최상단 제작사 리본 — "이 화면은 미래에이아이랩 레퍼런스"임을 첫눈에 알리는 띠.
 * sticky가 아니므로 스크롤하면 헤더만 남고 자연스럽게 사라집니다.
 */
export default function MiraeRibbon() {
  return (
    <div className="bg-mirae-ink text-white">
      <div className="container-page flex h-12 items-center justify-between gap-3">
        <p className="flex min-w-0 items-center gap-2">
          <MiraeMark size={26} className="h-[26px] w-[26px] shrink-0" />
          <span className="truncate text-xs text-mirae-mist md:text-sm">
            <span className="font-extrabold text-white">미래에이아이랩</span>
            <span className="hidden sm:inline">이 제작한 커머스 레퍼런스 데모</span>
            <span className="sm:hidden"> 레퍼런스</span>
          </span>
        </p>
        <span className="shrink-0 text-[13px] font-bold tracking-[0.18em] text-mirae-cyan md:text-xs">
          MIRAE<span className="hidden sm:inline"> AI LAB</span>
        </span>
      </div>
    </div>
  );
}
