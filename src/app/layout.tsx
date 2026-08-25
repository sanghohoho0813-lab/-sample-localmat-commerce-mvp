import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/Footer";
import ToastViewport from "@/components/ToastViewport";

export const metadata: Metadata = {
  title: {
    default: "로컬맘 — 우리 동네, 신선한 한 끼",
    template: "%s | 로컬맘",
  },
  description:
    "지역 농가와 소비자를 직접 연결하는 신선식품 커머스. 산지직송 제철 먹거리를 오늘 주문하면 내일 신선하게 도착해요.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FAF6EC",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
        <Footer />
        <MobileNav />
        <ToastViewport />
      </body>
    </html>
  );
}
