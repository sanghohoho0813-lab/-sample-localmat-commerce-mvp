# 로컬맘 (LocalMat) — 로컬 식품 커머스 MVP

> **미래에이아이랩(MIRAE AI LAB)** 이 제작한 커머스 레퍼런스 데모입니다.

지역 농가와 소비자를 직접 연결하는 신선식품 커머스 반응형 웹앱입니다.
포트폴리오·정부지원사업 IR 시연을 목표로, 탐색 → 상품 상세 → 장바구니 → 주문 → 주문 완료까지
실제 커머스처럼 끊김 없이 동작합니다.

## 제작사 표기

레퍼런스임을 한눈에 알 수 있도록 세 곳에 제작사를 노출합니다.

- **최상단 리본** — 모든 페이지 상단에 "미래에이아이랩이 제작한 커머스 레퍼런스 데모"
- **홈 하단 크레딧 밴드** — 브랜드 다크 컬러 섹션 + 로고 락업 + 제작 역량 3가지
- **푸터** — 로고 락업 + 저작권 표기

데모 사용자도 `미래에이아이랩 김팀장`으로 설정되어 마이페이지·주문서·주문내역에 반영됩니다.

브랜드 에셋은 `public/brand/`에 있습니다 (`logo.png` 전체 락업, `mark.png` 심볼).
원본 로고를 교체하려면:

```bash
node scripts/prepare-brand.mjs <원본로고파일>
```

배경을 자동으로 투명 처리하고 심볼만 잘라낸 정사각 이미지를 함께 생성합니다.

## 기술 스택

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS** — 직접 설계한 디자인 토큰 (Deep/Fresh Green, Warm Ivory, Orange accent)
  - 본문 가독성을 위해 기본 `fontSize` 스케일을 **일괄 1.2배**로 재정의했습니다
    (`text-sm` 14→16.8px, `text-base` 16→19.2px). `tailwind.config.ts` 참고
- **Zustand** (persist) — 장바구니 / 찜 / 주문 / 최근 본 상품 상태 (localStorage 유지)
- **Lucide Icons**
- **Supabase** — `supabase/schema.sql`에 전체 스키마 제공 (MVP 데모는 로컬 샘플 데이터로 동작)

## 실행

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # 프로덕션 빌드 (Vercel 배포 가능)
npm run typecheck  # TypeScript 검사
```

## 주요 화면

| 경로 | 화면 |
| --- | --- |
| `/` | 메인 홈 — Hero, 추천 상품, 제철 상품, 농가 스토리, 신뢰 섹션 |
| `/products` | 상품 목록 — 카테고리/가격/지역 필터, 6종 정렬, 모바일 필터 Drawer |
| `/products/[slug]` | 상품 상세 — 옵션/수량, 예상 배송일, 탭(소개/생산자/정보/배송/리뷰), Sticky 구매 CTA |
| `/farms`, `/farms/[slug]` | 농가 스토리 목록 / 상세 (생산자·재배방식·판매상품) |
| `/cart` | 장바구니 — 수량 변경, 삭제, 무료배송 Progress Bar, 함께 담으면 좋은 상품, Sticky 주문 CTA |
| `/checkout` | 주문서 — 배송지/요청사항/쿠폰/결제수단 선택, 데모 결제 |
| `/order-complete/[id]` | 주문 완료 — 주문번호, 배송정보, 결제금액 |
| `/orders` | 주문 내역 — 배송 진행 스테퍼, 상태 배지, 배송조회/리뷰쓰기 |
| `/search` | 검색 — 상품/농가 탭 결과 |
| `/mypage` | 마이페이지 — 찜, 쿠폰, 배송지, 최근 본 상품 |

## 데모 주문 흐름

실제 PG 연동 없이 데모 결제로 동작합니다:
결제하기 → 주문 생성(localStorage) → 장바구니 비우기 → 주문 완료 → 주문 내역 반영.

- 무료배송 기준 40,000원, 미만 시 배송비 3,000원
- 데모 사용자(미래에이아이랩 김팀장)가 자동 설정되며 배송지 2곳, 쿠폰 3종 제공

## PC / 모바일 뷰 전환

같은 브랜드를 기기별로 최적화된 두 가지 UX로 설계했고, 서로 바꿔 볼 수 있습니다.

| 접속 기기 | 버튼 | 동작 |
| --- | --- | --- |
| PC | **스마트폰에서 보기** (헤더·푸터) | 현재 페이지를 기기 목업 iframe으로 띄웁니다. iframe 폭을 실제 기기 CSS 폭(375/390/430)으로 고정하므로 Tailwind 브레이크포인트가 실제 스마트폰과 동일하게 동작합니다. |
| 스마트폰 | **PC 버전으로 보기** (푸터) | `viewport` meta 폭을 1280px로 바꿔 브라우저가 데스크톱 레이아웃을 그대로 렌더링합니다. 다시 누르면 모바일로 복귀합니다. |

- 선택한 모드는 `localStorage`에 저장되고, `<head>` 인라인 스크립트가 첫 페인트 전에 적용해 새로고침 시 깜빡임이 없습니다.
- 실제 기기 판별은 `screen` 크기와 `pointer: coarse`를 함께 보므로, viewport를 바꿔도 버튼이 뒤바뀌지 않습니다.
- `viewport` meta는 Next가 기본 삽입하는 태그 **하나만** 두고 조작합니다. (`viewport` export나 직접 작성한 `<meta>`를 함께 두면 태그가 중복돼 어느 폭이 적용될지 브라우저마다 달라집니다.)

## 상품 이미지 교체 방법

상품 26종 · 농가 8곳의 실제 사진이 적용되어 있습니다. 교체하려면 아래 경로의 파일만 바꾸면 됩니다.

```
public/images/products/{slug}.webp   # 예: public/images/products/nonsan-ttalgi.webp
public/images/farms/{slug}.webp      # 예: public/images/farms/haenam-nokdu.webp
```

`slug`는 `src/lib/data/products.ts` · `farms.ts`의 값과 같습니다.
`ProductImage` / `FarmImage` 컴포넌트가 aspect ratio(상품 1:1, 농가 16:9)를 강제하므로
어떤 비율의 원본을 넣어도 레이아웃이 흔들리지 않고, 파일이 없으면 자동으로
카테고리별 그라디언트 플레이스홀더로 대체됩니다.

원본 사진(PNG/JPG)을 배포용 WebP로 일괄 변환하려면:

```bash
node scripts/optimize-images.mjs <원본디렉터리>
# <원본디렉터리>/products/{slug}.png, <원본디렉터리>/farms/{slug}.png 구조
```

상품은 1000×1000, 농가는 1600×900으로 크롭 후 WebP(q80)로 저장합니다.
현재 적용된 34장은 이 스크립트로 79.2MB → 4.2MB (94.7% 절감) 처리했습니다.

## 데이터 구조

- 샘플 데이터: `src/lib/data/` — 상품 26개, 농가 8곳, 카테고리 8개, 리뷰 32개, 주문기록 5건, 배송지 2곳, 쿠폰 3종
- 클라이언트 상태: `src/lib/store.ts` (Zustand persist)
- Supabase 전환용 스키마: `supabase/schema.sql` (users, products, categories, farms, cart_items, orders, order_items, reviews, favorites, addresses)

## 배포

Vercel에 저장소를 연결하면 추가 설정 없이 배포됩니다 (환경 변수 불필요).
