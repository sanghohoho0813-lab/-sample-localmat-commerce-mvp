import Link from "next/link";
import { Sprout } from "lucide-react";
import ViewModeSwitch from "@/components/ViewModeSwitch";
import MiraeLockup from "@/components/mirae/MiraeLockup";

export default function Footer() {
  return (
    // 모바일 하단 여백: 하단 탭(64px) 또는 구매 바(73px)가 푸터 끝을 가리지 않을 만큼만 + 홈 인디케이터 영역
    <footer className="border-t border-bark-100 bg-white pb-[calc(6rem+env(safe-area-inset-bottom))] pt-12 md:pb-0 md:pt-16">
      {/* 리치 푸터 — 데스크톱 전용 */}
      <div className="container-page hidden gap-8 pb-10 md:grid md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-1">
            <span className="text-lg font-extrabold text-leaf-700">로컬맘</span>
            <Sprout className="h-4 w-4 text-leaf-500" />
          </div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-bark-500">
            지역 농가와 소비자를 직접 연결하는 신선식품 커머스.
            <br />
            좋은 농사가 좋은 식탁을 만듭니다.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-bold text-bark-800">쇼핑하기</h3>
          <ul className="mt-3 space-y-2 text-sm text-bark-500">
            <li><Link href="/products" className="hover:text-leaf-700">전체 상품</Link></li>
            <li><Link href="/products?filter=seasonal" className="hover:text-leaf-700">제철 먹거리</Link></li>
            <li><Link href="/products?category=gift" className="hover:text-leaf-700">선물세트</Link></li>
            <li><Link href="/farms" className="hover:text-leaf-700">농가 스토리</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold text-bark-800">고객 안내</h3>
          <ul className="mt-3 space-y-2 text-sm text-bark-500">
            <li><Link href="/orders" className="hover:text-leaf-700">주문 내역</Link></li>
            <li><Link href="/mypage" className="hover:text-leaf-700">마이페이지</Link></li>
            <li><span>배송 안내 · 평일 오후 2시 이전 주문 시 당일 출고</span></li>
          </ul>
        </div>
      </div>

      {/* 하단 스트립 — 모바일 포함 항상 노출 (뷰 모드 전환 진입점) */}
      <div className="border-t border-bark-100">
        <div className="container-page flex flex-col items-center gap-3 py-5 md:flex-row md:justify-between md:py-4">
          <div className="order-2 flex flex-col items-center gap-2.5 md:order-1 md:flex-row md:gap-4">
            <MiraeLockup width={180} />
            <p className="text-center text-xs text-bark-400 md:text-left">
              © 2026 미래에이아이랩 (MIRAE AI LAB)
              <span className="hidden sm:inline"> · 로컬맘은 제작 레퍼런스 데모입니다.</span>
            </p>
          </div>
          <div className="order-1 md:order-2">
            <ViewModeSwitch variant="inline" />
          </div>
        </div>
      </div>
    </footer>
  );
}
