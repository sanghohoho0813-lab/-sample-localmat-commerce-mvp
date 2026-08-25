"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ChevronRight,
  Clock,
  Heart,
  MapPin,
  Package,
  Star,
  Ticket,
  User,
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { addresses, coupons, demoUser } from "@/lib/data/etc";
import { getProduct } from "@/lib/data/products";
import { formatWon } from "@/lib/format";
import { useAllOrders, useRecentStore, useWishlistStore } from "@/lib/store";

const tabs = [
  { id: "overview", label: "홈" },
  { id: "wishlist", label: "찜" },
  { id: "coupons", label: "쿠폰" },
  { id: "addresses", label: "배송지" },
  { id: "recent", label: "최근 본 상품" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function MyPageClient({ initialTab }: { initialTab: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const validTab = tabs.find((t) => t.id === initialTab)?.id ?? "overview";
  const [tab, setTab] = useState<TabId>(validTab);

  const wishlistIds = useWishlistStore((s) => s.ids);
  const recentIds = useRecentStore((s) => s.ids);
  const orders = useAllOrders();

  const wishlistProducts = mounted
    ? wishlistIds.map((id) => getProduct(id)).filter((p) => p !== undefined)
    : [];
  const recentProducts = mounted
    ? recentIds.map((id) => getProduct(id)).filter((p) => p !== undefined)
    : [];

  const myReviewCount = 3; // 데모 사용자 작성 리뷰 수

  return (
    <div className="container-page max-w-4xl py-6 md:py-8">
      {/* Profile */}
      <div className="flex items-center gap-4 rounded-card bg-gradient-to-br from-leaf-700 to-leaf-600 p-6 text-white">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/20">
          <User className="h-7 w-7" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-extrabold">{demoUser.name}님, 반가워요 🌿</p>
          <p className="mt-0.5 truncate text-[13px] text-leaf-100">{demoUser.email}</p>
        </div>
        <Link
          href="/orders"
          className="hidden shrink-0 items-center gap-1 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-white/25 sm:flex"
        >
          주문 내역
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Quick stats */}
      <div className="mt-4 grid grid-cols-4 gap-2 md:gap-3">
        {[
          { label: "주문", value: mounted ? orders.length : 0, href: "/orders", icon: Package },
          { label: "찜", value: mounted ? wishlistIds.length : 0, onClick: () => setTab("wishlist"), icon: Heart },
          { label: "쿠폰", value: coupons.length, onClick: () => setTab("coupons"), icon: Ticket },
          { label: "리뷰", value: myReviewCount, href: "/orders", icon: Star },
        ].map(({ label, value, href, onClick, icon: Icon }) => {
          const inner = (
            <>
              <Icon className="h-5 w-5 text-leaf-600" />
              <span className="text-lg font-extrabold text-bark-900">{value}</span>
              <span className="text-xs text-bark-400">{label}</span>
            </>
          );
          const cls =
            "flex flex-col items-center gap-1 rounded-card border border-bark-100 bg-white py-4 transition-colors duration-200 hover:border-leaf-300 tap-highlight-none";
          return href ? (
            <Link key={label} href={href} className={cls}>{inner}</Link>
          ) : (
            <button key={label} type="button" onClick={onClick} className={cls}>{inner}</button>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-bark-100 scrollbar-none">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors duration-200 ${
              tab === t.id
                ? "border-leaf-700 text-leaf-800"
                : "border-transparent text-bark-400 hover:text-bark-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="py-6">
        {tab === "overview" && (
          <div className="space-y-4">
            <section className="rounded-card border border-bark-100 bg-white">
              {[
                { href: "/orders", label: "주문 내역", icon: Package },
                { href: "/mypage?tab=wishlist", label: "찜한 상품", icon: Heart, onClick: () => setTab("wishlist") },
                { href: "/mypage?tab=coupons", label: "쿠폰함", icon: Ticket, onClick: () => setTab("coupons") },
                { href: "/mypage?tab=addresses", label: "배송지 관리", icon: MapPin, onClick: () => setTab("addresses") },
                { href: "/mypage?tab=recent", label: "최근 본 상품", icon: Clock, onClick: () => setTab("recent") },
              ].map(({ href, label, icon: Icon, onClick }, i, arr) => {
                const rowClass = `flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-cream-50 ${
                  i < arr.length - 1 ? "border-b border-bark-100" : ""
                }`;
                const inner = (
                  <>
                    <Icon className="h-5 w-5 text-leaf-600" />
                    <span className="flex-1 text-sm font-medium text-bark-800">{label}</span>
                    <ChevronRight className="h-4 w-4 text-bark-300" />
                  </>
                );
                return onClick ? (
                  <button key={label} type="button" onClick={onClick} className={rowClass}>
                    {inner}
                  </button>
                ) : (
                  <Link key={label} href={href} className={rowClass}>
                    {inner}
                  </Link>
                );
              })}
            </section>
            <p className="text-center text-xs text-bark-400">
              로컬맘 데모 계정으로 둘러보고 계세요 · {demoUser.joinedAt.replaceAll("-", ".")} 가입
            </p>
          </div>
        )}

        {tab === "wishlist" &&
          (wishlistProducts.length === 0 ? (
            <EmptyTab
              icon={<Heart className="h-10 w-10 text-bark-300" />}
              title="찜한 상품이 아직 없어요"
              desc="마음에 드는 상품의 하트를 눌러 보관해보세요."
            />
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">
              {wishlistProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ))}

        {tab === "coupons" && (
          <div className="grid gap-3 sm:grid-cols-2">
            {coupons.map((c) => (
              <div
                key={c.id}
                className="relative overflow-hidden rounded-card border border-dashed border-tangerine-300 bg-tangerine-50 p-5"
              >
                <p className="text-xl font-extrabold text-tangerine-600">
                  {c.discountType === "percent" ? `${c.value}%` : formatWon(c.value)}
                </p>
                <p className="mt-1 text-sm font-bold text-bark-800">{c.name}</p>
                <p className="mt-0.5 text-xs text-bark-500">{c.description}</p>
                <p className="mt-2.5 text-[11px] text-bark-400">
                  {formatWon(c.minOrder)} 이상 주문 시 · ~{c.expiresAt.replaceAll("-", ".")}
                </p>
                <Ticket className="absolute -right-2 -top-2 h-14 w-14 rotate-12 text-tangerine-200" />
              </div>
            ))}
          </div>
        )}

        {tab === "addresses" && (
          <div className="grid gap-3 sm:grid-cols-2">
            {addresses.map((a) => (
              <div key={a.id} className="rounded-card border border-bark-100 bg-white p-5">
                <p className="flex items-center gap-1.5 text-sm font-bold text-bark-800">
                  <MapPin className="h-4 w-4 text-leaf-600" />
                  {a.label}
                  {a.isDefault && (
                    <span className="rounded-md bg-leaf-100 px-1.5 py-0.5 text-[10px] font-semibold text-leaf-700">
                      기본 배송지
                    </span>
                  )}
                </p>
                <p className="mt-2 text-sm leading-snug text-bark-600">
                  ({a.zip}) {a.address1} {a.address2}
                </p>
                <p className="mt-1.5 text-xs text-bark-400">
                  {a.recipient} · {a.phone}
                </p>
              </div>
            ))}
          </div>
        )}

        {tab === "recent" &&
          (recentProducts.length === 0 ? (
            <EmptyTab
              icon={<Clock className="h-10 w-10 text-bark-300" />}
              title="최근 본 상품이 없어요"
              desc="상품을 둘러보면 여기에 차곡차곡 담아둘게요."
            />
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">
              {recentProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ))}
      </div>

    </div>
  );
}

function EmptyTab({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      {icon}
      <p className="mt-4 font-semibold text-bark-700">{title}</p>
      <p className="mt-1.5 text-sm text-bark-400">{desc}</p>
      <Link href="/products" className="btn-primary mt-6 h-11 px-5 text-sm">
        상품 둘러보기
      </Link>
    </div>
  );
}
