/**
 * 미래AI랩 샘플 브릿지 CTA의 링크와 문구를 한곳에 모았습니다.
 *
 * ─ 링크를 바꾸려면: MIRAE_LINKS
 * ─ 문구를 바꾸려면: MIRAE_CTA_COPY
 *
 * 컴포넌트(MiraeAILabSampleCTA)는 이 값을 기본값으로 쓰고,
 * 페이지별로 다르게 쓰고 싶으면 같은 이름의 props로 덮어쓸 수 있습니다.
 */

export const MIRAE_LINKS = {
  /** 메인 CTA — "우리 회사도 만들어보기" */
  consultHref: "https://miraeailab.com/business-diagnosis",
  /** 서브 링크 — "다른 샘플 보기" */
  samplesHref: "https://miraeailab.com/business-services",
  /** 서브 링크 — "미래AI랩 홈페이지" */
  homeHref: "https://miraeailab.com/",
} as const;

export const MIRAE_CTA_COPY = {
  badge: "MIRAE AI LAB",
  /** 메인 헤드라인 (2줄 구성: 모바일에서 자연스럽게 끊기도록 분리) */
  headlineLead: "이 샘플이 마음에 드셨다면,",
  headlineMain: "대표님 회사도 이렇게 설계해볼 수 있습니다.",
  /** 제작사 소개 */
  introTitle: "이 샘플은 미래AI랩이 기획·제작했습니다",
  introBody:
    "미래AI랩은 평범한 회사를 기술·데이터·AI 기반의 성장형 기업으로 바꾸는 AX / MVP / 플랫폼 기획·개발을 진행합니다.",
  /** 메인 CTA 버튼 문구 — 전 샘플 공통으로 이 문구를 사용합니다. */
  consultLabel: "우리 회사도 만들어보기",
  samplesLabel: "다른 샘플 보기",
  homeLabel: "미래AI랩 홈페이지",
  /** 메인 CTA 아래 보조 안내 */
  note: "상담은 무료이며, 진단 결과만 받아보셔도 됩니다.",
} as const;

/** 섹션 하단에 작게 노출되는 역량 칩 */
export const MIRAE_CAPABILITIES = [
  "AX 컨설팅",
  "MVP 기획·개발",
  "플랫폼 구축",
  "모바일 퍼스트 UX",
] as const;
