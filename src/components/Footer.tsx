import Link from "next/link";
import { Sprout } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-16 hidden border-t border-bark-100 bg-white md:block">
      <div className="container-page grid gap-8 py-10 md:grid-cols-[1.4fr_1fr_1fr]">
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
          <p className="mt-4 text-xs text-bark-400">
            © 2026 LocalMat. 포트폴리오 데모 서비스입니다.
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
    </footer>
  );
}
