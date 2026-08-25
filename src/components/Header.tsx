"use client";

import Link from "next/link";
import { LayoutGrid, ShoppingCart, User } from "lucide-react";
import Logo from "@/components/Logo";
import SearchBar from "@/components/SearchBar";
import { categories } from "@/lib/data/categories";
import { useCartCount } from "@/lib/store";

function CartButton() {
  const count = useCartCount();
  return (
    <Link
      href="/cart"
      aria-label="장바구니"
      className="relative flex h-10 w-10 items-center justify-center rounded-full text-bark-700 transition-colors duration-200 hover:bg-cream-100 tap-highlight-none"
    >
      <ShoppingCart className="h-[22px] w-[22px]" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-pill bg-tangerine-500 px-1 text-[11px] font-bold text-white animate-pop">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-bark-100 bg-white/95 shadow-header backdrop-blur">
      {/* Top row */}
      <div className="container-page flex h-14 items-center gap-3 md:h-16 md:gap-6">
        <Logo withTagline />

        <div className="hidden flex-1 justify-center md:flex">
          <div className="w-full max-w-[440px]">
            <SearchBar />
          </div>
        </div>

        <nav className="ml-auto hidden items-center gap-5 text-sm font-medium text-bark-600 lg:flex">
          <Link href="/farms" className="transition-colors hover:text-leaf-700">
            스토리
          </Link>
          <Link href="/products?filter=seasonal" className="transition-colors hover:text-leaf-700">
            이벤트
          </Link>
          <Link href="/mypage" className="transition-colors hover:text-leaf-700">
            고객센터
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <Link
            href="/mypage"
            aria-label="마이페이지"
            className="hidden h-10 w-10 items-center justify-center rounded-full text-bark-700 transition-colors duration-200 hover:bg-cream-100 md:flex"
          >
            <User className="h-[22px] w-[22px]" />
          </Link>
          <CartButton />
        </div>
      </div>

      {/* Mobile search row */}
      <div className="container-page pb-3 md:hidden">
        <SearchBar />
      </div>

      {/* Category navigation (desktop) */}
      <div className="hidden border-t border-bark-100 md:block">
        <div className="container-page flex h-12 items-center gap-1">
          <Link
            href="/products"
            className="mr-3 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-bark-800 transition-colors hover:bg-cream-100"
          >
            <LayoutGrid className="h-4 w-4 text-leaf-600" />
            카테고리 전체보기
          </Link>
          <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-none">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/products?category=${c.slug}`}
                className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-bark-600 transition-colors duration-200 hover:bg-cream-100 hover:text-leaf-700"
              >
                <span aria-hidden>{c.emoji}</span>
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
