# 로컬맘 (LocalMat) — 로컬 식품 커머스 MVP

> **미래에이아이랩(MIRAE AI LAB)** 이 제작한 커머스 레퍼런스 데모입니다.

지역 농가와 소비자를 직접 연결하는 신선식품 커머스 반응형 웹앱입니다.
탐색 → 상품 상세 → 장바구니(또는 바로 구매) → 주문서 → 데모 결제 → 주문 완료 → 주문 내역·리뷰까지
실제 서비스처럼 끊김 없이 동작합니다. 실제 PG·로그인·배송 연동은 없습니다(데모 범위).

```bash
npm install
npm run dev          # http://localhost:3000
npm run check        # 타입 검사 + ESLint + 단위 테스트
npm run build && npm run test:e2e   # 프로덕션 빌드로 E2E(모바일·PC) + 접근성 검사
```

---

## 품질 기준 (CI에서 매 푸시마다 확인)

| 단계 | 도구 | 무엇을 막나 |
| --- | --- | --- |
| 정적 검사 | `tsc --strict`, ESLint(`next/core-web-vitals` + `next/typescript`) | 타입 오류, 훅 규칙 위반, 접근성 기본 규칙 |
| 단위 테스트 | Vitest — `src/lib/*.test.ts` (36건) | 금액·배송비·쿠폰 계산, 저장값 검증, 검색 매칭, 주문 날짜 |
| E2E | Playwright — `e2e/` (모바일 iPhone 13 · PC 1280, 프로덕션 빌드) | 구매 전 과정, 바로 구매, 재고 한도, 뒤로 가기·필터 유지, 리뷰, 404 상태 코드, 콘솔 오류 0 |
| 반응형 | `e2e/layout.spec.ts` — 320 ~ 1280px 7개 폭 × 11개 화면 | 가로 넘침·모바일 줌아웃(긴 상품명이 그리드를 밀어내는 경우 포함) |
| 접근성 | axe-core — WCAG 2.1 AA, 주요 8개 화면 | 명암비, 랜드마크, 제목 순서, 이름 없는 버튼 등 |
| 회복성 | `e2e/resilience.spec.ts` | 깨진/오래된 localStorage, 다른 탭과의 장바구니 동기화 |

워크플로: `.github/workflows/ci.yml` (lint → unit → build → typecheck → e2e, 실패 시 리포트 업로드)

---

## 구조

```
src/
├─ app/                      # Next.js 15 App Router (화면)
│  ├─ products/(list)/       # 목록 — 로딩 화면을 목록에만 두려고 route group으로 분리(아래 '결정 기록')
│  ├─ products/[slug]/       # 상세 — SSG + schema.org Product JSON-LD
│  ├─ cart · checkout · order-complete · orders · mypage · search · farms
│  ├─ error.tsx · not-found.tsx · loading.tsx
│  └─ robots.ts · sitemap.ts · manifest.ts · apple-icon.png
├─ components/               # 화면 조각 (ProductCard, EmptyState, ReviewModal, QuantityStepper …)
└─ lib/
   ├─ pricing.ts             # 금액 계산의 단일 출처 — 순수 함수
   ├─ persisted.ts           # 저장값 검증·정리 — 순수 함수
   ├─ search.ts · orders.ts  # 검색 매칭·정렬 / 주문 날짜 — 순수 함수
   ├─ store.ts               # Zustand persist 저장소 (위 모듈을 조합)
   ├─ useHydrated.ts · useTabs.ts
   └─ data/                  # 샘플 데이터 (상품 26 · 농가 8 · 리뷰 32 · 주문 5)
e2e/                         # Playwright 시나리오
supabase/schema.sql          # 실제 백엔드 전환용 스키마
```

**원칙:** 화면은 계산하지 않습니다. 금액·쿠폰·검색·저장값 판단은 `src/lib`의 순수 함수가 하고,
화면과 저장소는 그 결과만 씁니다. 그래서 핵심 규칙은 브라우저 없이 단위 테스트로 검증됩니다.

---

## 결정 기록 (왜 이렇게 만들었나)

**금액 계산을 한 곳에** — 장바구니·주문서가 각자 배송비·쿠폰을 계산하던 것을 `pricing.ts`로 모았습니다.
쿠폰 할인은 상품 금액을 넘지 않고, 조건이 깨진 쿠폰을 골라 둔 채 금액이 바뀌면 자동으로 0원 처리됩니다.

**저장값은 믿지 않는다** — localStorage는 이전 버전이 남긴 값일 수도, 사용자가 고친 값일 수도 있습니다.
모든 persist 저장소는 `version` + 통과형 `migrate` + `merge` 단계 검증을 거칩니다.
판매 종료 상품·없는 옵션·재고 초과 수량·깨진 JSON은 화면에 올라오기 전에 걸러집니다.
(`migrate`가 없으면 zustand는 버전이 다른 저장값을 통째로 버려 업데이트 직후 장바구니가 비어 버립니다.)

**탭 간 동기화** — 다른 탭에서 장바구니·찜이 바뀌면 `storage` 이벤트로 다시 읽어 헤더 배지가 어긋나지 않습니다.

**하이드레이션** — 저장값에 기대는 화면은 `useHydrated()`(`useSyncExternalStore`)로 서버 HTML과 맞춥니다.
`useState + useEffect` 방식과 달리 화면을 옮길 때마다 빈 화면이 깜빡이지 않습니다.

**바로 구매는 장바구니와 분리** — 상세의 '바로 구매'는 그 상품만 담긴 주문서(`/checkout?mode=now`, 탭 단위 sessionStorage)로 갑니다.
장바구니에 담아 둔 다른 상품은 건드리지 않고, 결제 후에는 주문서를 히스토리에서 대체해 뒤로 가기로 이중 주문할 수 없습니다.

**정확한 404** — 목록의 `loading.tsx`가 상세까지 감싸면 Next가 로딩 화면과 함께 200 헤더를 먼저 보내,
없는 상품 주소가 200으로 응답됩니다. 목록을 `(list)` route group으로 옮겨 상세는 정확히 404를 돌려줍니다.

**명암비는 토큰에서** — 주황 CTA와 회색 보조 글자가 WCAG AA(4.5:1)에 못 미쳐, 개별 요소가 아니라
색 토큰 자체(`tangerine-600`, `bark-400/500`)를 기준에 맞췄습니다. 500 이하 주황은 아이콘·게이지 같은 '그림'에만 씁니다.

**HTML 규칙** — 상품 카드는 링크 안에 버튼을 넣지 않고(무효한 HTML, 포커스가 꼬임) 상품명 링크를 카드 전체로 늘리는
stretched-link 방식입니다. 탭 UI는 WAI-ARIA 탭 패턴(←/→·Home/End, roving tabindex)을 따릅니다.

**공용 뒤로·앞으로 버튼** — `public/mirae-history-nav.js`는 여러 데모가 함께 쓰는 외부 스크립트라 수정하지 않습니다.
최대 z-index로 떠 있어서, 모달·필터 시트는 네이티브 `<dialog>.showModal()`(브라우저 최상위 레이어)로 띄워 가려지지 않게 했습니다.

---

## 주요 화면

| 경로 | 화면 |
| --- | --- |
| `/` | 홈 — 검색, 카테고리, 오늘의 장보기(인기/제철/신상품 탭), 첫 구매 쿠폰, 농가 스토리 |
| `/products` | 목록 — 모바일 카테고리 칩, 가격/지역 필터(시트), 6종 정렬. 조건은 주소에 남아 뒤로 와도 유지 |
| `/products/[slug]` | 상세 — 옵션·수량(재고 한도), 도착 예정일, 소개/농가/정보/배송/리뷰 탭, 하단 구매 바 |
| `/cart` | 장바구니 — 수량, 삭제 되돌리기, 무료배송 진행 바, 함께 담으면 좋은 상품 |
| `/checkout` | 주문서 — 배송지 변경, 요청사항(직접 입력 검증), 최대 할인 쿠폰 자동 적용, 결제수단 |
| `/order-complete/[id]` | 주문 완료(방금 결제) / 주문 상세(지난 주문) |
| `/orders` | 주문 내역 — 진행 단계, 리뷰 쓰기(별점·10자 이상 검증) |
| `/search` | 검색 — 띄어 쓴 여러 단어·붙여 쓴 단어 모두 매칭, 이름 일치 우선 정렬 |
| `/mypage` | 찜(되돌리기) · 최근 본 상품 · 쿠폰 · 배송지 |
| `/farms`, `/farms/[slug]` | 농가 스토리 — 판매 상품 바로가기 |

---

## 제작사 표기

레퍼런스임을 한눈에 알 수 있도록 최상단 리본, 모든 화면 하단의 브릿지 CTA(`src/components/mirae/MiraeAILabSampleCTA.tsx`,
링크·문구는 `src/lib/mirae.ts`), 푸터에 제작사를 노출합니다. 데모 사용자는 `미래에이아이랩 김팀장`입니다.

브랜드 로고 교체: `node scripts/prepare-brand.mjs <원본로고파일>` (배경 투명화 + 심볼 추출)

## PC / 모바일 뷰 전환

| 접속 기기 | 버튼 | 동작 |
| --- | --- | --- |
| PC | **스마트폰에서 보기** | 현재 페이지를 기기 목업 iframe(375/390/430px)으로 띄워 실제 브레이크포인트로 확인 |
| 스마트폰 | **PC 버전으로 보기** | `viewport` meta 폭을 1280px로 바꿔 데스크톱 레이아웃으로 렌더링 |

`viewport` meta는 Next 기본 태그 하나만 조작합니다(중복되면 브라우저마다 적용 폭이 달라짐). 선택은 localStorage에 저장되고 첫 페인트 전에 적용됩니다.

## 이미지

상품 26종 · 농가 8곳의 사진은 `public/images/{products,farms}/{slug}.webp`이며, 파일만 바꾸면 교체됩니다.
`node scripts/optimize-images.mjs <원본디렉터리>`로 WebP 변환(현재 34장 79.2MB → 4.2MB).
이미지가 없으면 카테고리별 플레이스홀더로 대체되고, 비율을 강제해 레이아웃이 흔들리지 않습니다.

## 데모 규칙

- 무료배송 40,000원 이상, 미만 배송비 3,000원 · 쿠폰 3종(첫 구매 10% 최대 5,000원 / 3만원↑ 3,000원 / 5만원↑ 5,000원)
- 결제는 0.9초 지연 후 주문 생성(localStorage) — 실제 결제 없음

## 배포

Vercel에 연결하면 추가 설정 없이 배포됩니다. 공유 미리보기·사이트맵의 절대 주소는
`NEXT_PUBLIC_SITE_URL`(없으면 Vercel 프로덕션 주소)로 정해집니다.
