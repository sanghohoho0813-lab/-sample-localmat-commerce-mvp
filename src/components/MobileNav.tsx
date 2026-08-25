"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, BookOpen, ShoppingCart, User } from "lucide-react";
import { useCartCount } from "@/lib/store";

const items = [
  { href: "/", label: "홈", icon: Home, match: (p: string) => p === "/" },
  { href: "/products", label: "카테고리", icon: LayoutGrid, match: (p: string) => p.startsWith("/products") },
  { href: "/farms", label: "스토리", icon: BookOpen, match: (p: string) => p.startsWith("/farms") },
  { href: "/cart", label: "장바구니", icon: ShoppingCart, match: (p: string) => p.startsWith("/cart") },
  { href: "/mypage", label: "마이", icon: User, match: (p: string) => p.startsWith("/mypage") || p.startsWith("/orders") },
];

export default function MobileNav() {
  const pathname = usePathname();
  const cartCount = useCartCount();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-bark-100 bg-white/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="모바일 내비게이션"
    >
      <div className="grid h-16 grid-cols-5">
        {items.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex min-w-0 flex-col items-center justify-center gap-1 tap-highlight-none transition-colors duration-200 ${
                active ? "text-leaf-700" : "text-bark-400"
              }`}
            >
              <span className="relative">
                <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.4 : 2} />
                {href === "/cart" && cartCount > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-pill bg-tangerine-500 px-1 text-[12px] font-bold text-white">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </span>
              <span
                className={`w-full truncate px-0.5 text-center text-[12px] ${
                  active ? "font-bold" : "font-medium"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
