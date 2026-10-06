"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { ChevronLeft, LayoutGrid, Search, ShoppingCart, User } from "lucide-react";
import Logo from "@/components/Logo";
import SearchBar from "@/components/SearchBar";
import ViewModeSwitch from "@/components/ViewModeSwitch";
import { categories } from "@/lib/data/categories";
import { isPurchaseFocusRoute } from "@/components/MobileNav";
import { useCartCount } from "@/lib/store";

function CartButton() {
  const count = useCartCount();
  return (
    <Link
      href="/cart"
      aria-label={count > 0 ? `장바구니, 상품 ${count}개` : "장바구니"}
      className="relative flex h-11 w-11 items-center justify-center rounded-full text-bark-700 transition-colors duration-200 hover:bg-cream-100 focus-ring tap-highlight-none md:h-10 md:w-10"
    >
      <ShoppingCart className="h-[22px] w-[22px]" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-pill bg-tangerine-500 px-1 text-[13px] font-bold text-white animate-pop">
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
        {/* min-w-0: flex 자식이라 이게 없으면 스크롤 영역이 내용 폭만큼 늘어나 문서가 가로로 넘칩니다. */}
        <div className="flex min-w-0 items-center gap-0.5 overflow-x-auto scrollbar-none">
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

/** PC 헤더 검색창 — 검색 결과 화면에서는 지금 검색어를 그대로 보여 줘 바로 고쳐 검색할 수 있게 합니다. */
function HeaderSearch() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const q = pathname === "/search" ? (searchParams.get("q") ?? "") : "";
  return <SearchBar key={q} initialQuery={q} />;
}

/** 모바일 상단 줄의 검색 아이콘 — 홈에서도 아래로 내려가면 검색창이 사라지므로 늘 둡니다(검색 화면 제외). */
function MobileSearchButton() {
  const pathname = usePathname();
  if (pathname === "/search") return null;
  return (
    <Link
      href="/search"
      aria-label="검색"
      className="flex h-11 w-11 items-center justify-center rounded-full text-bark-700 transition-colors duration-200 hover:bg-cream-100 focus-ring md:hidden"
    >
      <Search className="h-[22px] w-[22px]" />
    </Link>
  );
}

/** 이 탭에서 앱 안 이동이 있었는지 — 없으면(링크로 바로 들어온 경우) 뒤로 가기가 사이트 밖으로 나가므로 대신 보낼 곳을 씁니다. */
let inAppNavigations = -1;

function useTrackInAppNavigation() {
  const pathname = usePathname();
  useEffect(() => {
    inAppNavigations += 1;
  }, [pathname]);
}

function fallbackFor(pathname: string): string {
  // 상품 데이터 전체를 모든 화면 번들에 싣지 않도록 카테고리까지는 찾지 않습니다.
  if (pathname.startsWith("/products/")) return "/products";
  if (pathname === "/checkout") return "/cart";
  return "/";
}

/**
 * 모바일 뒤로 가기 — 하단 탭을 숨기는 구매 화면(상세·장바구니·주문서)에서
 * 이전 화면으로 돌아갈 길이 확실히 보이도록 로고 왼쪽에 둡니다.
 */
function MobileBackButton() {
  const pathname = usePathname();
  const router = useRouter();
  useTrackInAppNavigation();
  if (!isPurchaseFocusRoute(pathname)) return null;
  return (
    <button
      type="button"
      aria-label="뒤로 가기"
      onClick={() => (inAppNavigations > 0 ? router.back() : router.push(fallbackFor(pathname)))}
      className="-ml-2.5 -mr-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-bark-800 transition-colors hover:bg-cream-100 focus-ring md:hidden"
    >
      <ChevronLeft className="h-6 w-6" />
    </button>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-bark-100 bg-white/95 shadow-header backdrop-blur">
      {/* Top row */}
      <div className="container-page flex h-14 items-center gap-3 md:h-16 md:gap-6">
        <Suspense fallback={null}>
          <MobileBackButton />
        </Suspense>
        <Logo withTagline />

        <div className="hidden flex-1 justify-center md:flex">
          <div className="w-full max-w-[440px]">
            <Suspense fallback={<div className="h-13" />}>
              <HeaderSearch />
            </Suspense>
          </div>
        </div>

        <nav className="ml-auto hidden items-center gap-5 text-sm font-medium text-bark-600 lg:flex">
          <Link href="/farms" className="transition-colors hover:text-leaf-700 focus-ring">
            농가 스토리
          </Link>
          <Link href="/products?filter=seasonal" className="transition-colors hover:text-leaf-700 focus-ring">
            제철 기획전
          </Link>
          <Link href="/orders" className="transition-colors hover:text-leaf-700 focus-ring">
            주문 내역
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <Suspense fallback={null}>
            <MobileSearchButton />
          </Suspense>
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

      <Suspense fallback={<div className="hidden h-12 border-t border-bark-100 md:block" />}>
        <CategoryNav />
      </Suspense>
    </header>
  );
}
