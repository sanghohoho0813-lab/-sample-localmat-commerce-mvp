# 로컬맘 (LocalMat) — 로컬 식품 커머스 MVP

지역 농가와 소비자를 직접 연결하는 신선식품 커머스 반응형 웹앱입니다.
포트폴리오·정부지원사업 IR 시연을 목표로, 탐색 → 상품 상세 → 장바구니 → 주문 → 주문 완료까지
실제 커머스처럼 끊김 없이 동작합니다.

## 기술 스택

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS** — 직접 설계한 디자인 토큰 (Deep/Fresh Green, Warm Ivory, Orange accent)
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
| `/cart` | 장바구니 — 수량 변경, 삭제, 무료배송 Progress Bar, Sticky 주문 CTA |
| `/checkout` | 주문서 — 배송지/요청사항/쿠폰/결제수단 선택, 데모 결제 |
| `/order-complete/[id]` | 주문 완료 — 주문번호, 배송정보, 결제금액 |
| `/orders` | 주문 내역 — 상태 배지, 배송조회/리뷰쓰기 |
| `/search` | 검색 — 상품/농가 탭 결과 |
| `/mypage` | 마이페이지 — 찜, 쿠폰, 배송지, 최근 본 상품 |

## 데모 주문 흐름

실제 PG 연동 없이 데모 결제로 동작합니다:
결제하기 → 주문 생성(localStorage) → 장바구니 비우기 → 주문 완료 → 주문 내역 반영.

- 무료배송 기준 40,000원, 미만 시 배송비 3,000원
- 데모 사용자(김로컬)가 자동 설정되며 배송지 2곳, 쿠폰 3종 제공

## 상품 이미지 교체 방법

이미지는 현재 카테고리별 소프트 그라디언트 플레이스홀더로 표시됩니다.
아래 경로에 실제 이미지 파일을 넣으면 **코드 수정 없이 자동으로** 표시됩니다.

```
public/images/products/{slug}.jpg   # 예: public/images/products/nonsan-ttalgi.jpg
public/images/farms/{slug}.jpg      # 예: public/images/farms/haenam-nokdu.jpg
```

각 상품/농가의 `image` 필드(`src/lib/data/*.ts`)가 해당 경로를 이미 참조하고 있으며,
`ProductImage` 컴포넌트가 aspect ratio를 강제하므로 어떤 비율의 원본을 넣어도 레이아웃이 유지됩니다.

## 데이터 구조

- 샘플 데이터: `src/lib/data/` — 상품 26개, 농가 8곳, 카테고리 8개, 리뷰 32개, 주문기록 5건, 배송지 2곳, 쿠폰 3종
- 클라이언트 상태: `src/lib/store.ts` (Zustand persist)
- Supabase 전환용 스키마: `supabase/schema.sql` (users, products, categories, farms, cart_items, orders, order_items, reviews, favorites, addresses)

## 배포

Vercel에 저장소를 연결하면 추가 설정 없이 배포됩니다 (환경 변수 불필요).
