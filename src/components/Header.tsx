"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LayoutGrid, ShoppingCart, User } from "lucide-react";
import Logo from "@/components/Logo";
import SearchBar from "@/components/SearchBar";
import ViewModeSwitch from "@/components/ViewModeSwitch";
import { categories } from "@/lib/data/categories";
import { useCartCount } from "@/lib/store";

function CartButton() {
  const count = useCartCount();
  return (
    <Link
      href="/cart"
      aria-label={count > 0 ? `장바구니, 상품 ${count}개` : "장바구니"}
      className="relative flex h-10 w-10 items-center justify-center rounded-full text-bark-700 transition-colors duration-200 hover:bg-cream-100 focus-ring tap-highlight-none"
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

/** 카테고리 바 — 현재 보고 있는 카테고리를 강조합니다. */
function CategoryNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeSlug = pathname === "/products" ? searchParams.get("category") : null;
  const seasonal = pathname === "/products" && searchParams.get("filter") === "seasonal";
  const allActive = pathname === "/products" && !activeSlug && !seasonal;

  return (
    <div className="hidden border-t border-bark-100 md:block">
      <div className="container-page flex h-12 items-center gap-1">
        <Link
          href="/products"
          className={`mr-3 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold transition-colors focus-ring ${
            allActive ? "bg-leaf-50 text-leaf-800" : "text-bark-800 hover:bg-cream-100"
          }`}
        >
          <LayoutGrid className="h-4 w-4 text-leaf-600" />
          카테고리 전체보기
        </Link>
        <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-none">
          {categories.map((c) => {
            const active = activeSlug === c.slug;
            return (
              <Link
                key={c.id}
                href={`/products?category=${c.slug}`}
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors duration-200 focus-ring ${
                  active
                    ? "bg-leaf-50 font-bold text-leaf-800"
                    : "font-medium text-bark-600 hover:bg-cream-100 hover:text-leaf-700"
                }`}
              >
                <span aria-hidden>{c.emoji}</span>
                {c.name}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
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
            <Suspense fallback={<div className="h-11" />}>
              <SearchBar />
            </Suspense>
          </div>
        </div>

        <nav className="ml-auto hidden items-center gap-5 text-sm font-medium text-bark-600 lg:flex">
          <Link href="/farms" className="transition-colors hover:text-leaf-700 focus-ring">
            스토리
          </Link>
          <Link href="/products?filter=seasonal" className="transition-colors hover:text-leaf-700 focus-ring">
            이벤트
          </Link>
          <Link href="/mypage" className="transition-colors hover:text-leaf-700 focus-ring">
            고객센터
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <Suspense fallback={null}>
            <ViewModeSwitch variant="header" />
          </Suspense>
          <Link
            href="/mypage"
            aria-label="마이페이지"
            className="hidden h-10 w-10 items-center justify-center rounded-full text-bark-700 transition-colors duration-200 hover:bg-cream-100 focus-ring md:flex"
          >
            <User className="h-[22px] w-[22px]" />
          </Link>
          <CartButton />
        </div>
      </div>

      {/* Mobile search row */}
      <div className="container-page pb-3 md:hidden">
        <Suspense fallback={<div className="h-11" />}>
          <SearchBar />
        </Suspense>
      </div>

      <Suspense fallback={<div className="hidden h-12 border-t border-bark-100 md:block" />}>
        <CategoryNav />
      </Suspense>
    </header>
  );
}
