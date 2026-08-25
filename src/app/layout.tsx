import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/Footer";
import ToastViewport from "@/components/ToastViewport";
import { FONT_LOADER_SCRIPT, VIEW_MODE_INIT_SCRIPT } from "@/lib/viewMode";

export const metadata: Metadata = {
  title: {
    default: "로컬맘 — 우리 동네, 신선한 한 끼",
    template: "%s | 로컬맘",
  },
  description:
    "지역 농가와 소비자를 직접 연결하는 신선식품 커머스. 산지직송 제철 먹거리를 오늘 주문하면 내일 신선하게 도착해요.",
};

/**
 * viewport meta는 의도적으로 선언하지 않습니다.
 * Next가 기본으로 삽입하는 태그 하나만 두고 "PC 버전으로 보기"에서 그 content만 바꿉니다.
 * `viewport` export를 쓰거나 <head>에 직접 <meta>를 적으면 태그가 둘이 되어,
 * 어느 폭이 적용될지 브라우저마다 달라집니다. (src/lib/viewMode.ts 참고)
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <meta name="theme-color" content="#FAF6EC" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        {/* 웹폰트를 렌더링 차단 없이 불러옵니다. */}
        <script dangerouslySetInnerHTML={{ __html: FONT_LOADER_SCRIPT }} />
        {/* 저장된 뷰 모드를 첫 페인트 전에 적용해 레이아웃 깜빡임을 막습니다. */}
        <script dangerouslySetInnerHTML={{ __html: VIEW_MODE_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-leaf-700 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          본문 바로가기
        </a>
        <Header />
        <main id="main" className="flex-1 pb-20 md:pb-0">
          {children}
        </main>
        <Footer />
        <MobileNav />
        <ToastViewport />
      </body>
    </html>
  );
}
