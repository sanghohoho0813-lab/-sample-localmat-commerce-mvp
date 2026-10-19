import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Clock, MapPin, ShieldCheck, Ticket, Truck, Wallet } from "lucide-react";
import FarmOfWeek from "@/components/home/FarmOfWeek";
import RecentlyViewed from "@/components/home/RecentlyViewed";
import RepurchaseList from "@/components/home/RepurchaseList";
import SeasonalShowcase from "@/components/home/SeasonalShowcase";
import HeroBanner from "@/components/HeroBanner";
import SearchBar from "@/components/SearchBar";
import { categories } from "@/lib/data/categories";
import { addresses, FREE_SHIPPING_THRESHOLD } from "@/lib/data/etc";
import { farms } from "@/lib/data/farms";
import { products } from "@/lib/data/products";
import { formatPrice } from "@/lib/format";
import { kstNow } from "@/lib/kst";
import { currentMonth, isAvailable, isInSeason } from "@/lib/season";

// 한 시간마다 다시 그려 '이번 달 제철'·'이번 주 농가'가 날짜에 맞게 바뀝니다(한국 시간 기준).
export const revalidate = 3600;

/** 쇼핑 전에 궁금한 것만 — 배송·비용·품질 (2열 모바일에서도 한두 줄에 끝나도록 짧게) */
const promises = [
  { icon: Truck, title: "농가에서 바로 출발" },
  { icon: Clock, title: "오후 2시 전 주문 당일 출고" },
  { icon: Wallet, title: `${formatPrice(FREE_SHIPPING_THRESHOLD / 10000)}만원 이상 무료배송` },
  { icon: ShieldCheck, title: "인증 농가 상품만" },
];

/** 연중 몇 번째 주인지 — '이번 주 농가'를 매주 돌아가며 소개합니다. */
function weekOfYear(): number {
  const { date } = kstNow();
  const start = Date.UTC(date.y, 0, 1);
  return Math.floor((Date.UTC(date.y, date.m - 1, date.d) - start) / (7 * 24 * 3600 * 1000));
}

export default function HomePage() {
  const month = currentMonth();
  const homeAddress = addresses.find((a) => a.isDefault) ?? addresses[0];
  const bySales = (a: { salesCount: number }, b: { salesCount: number }) => b.salesCount - a.salesCount;

  const seasonal = products.filter((p) => isAvailable(p) && isInSeason(p, month)).sort(bySales).slice(0, 6);
  const shippingFarms = new Set(seasonal.map((p) => p.farmId)).size;
  const repurchase = products
    .filter((p) => isAvailable(p) && p.reviewCount >= 100)
    .sort((a, b) => b.repurchaseRate - a.repurchaseRate)
    .slice(0, 5);

  // 이번 주 농가 — 지금 살 수 있는 상품이 두 개 이상인 농가 중에서 매주 돌아가며
  const featurable = farms.filter((f) => products.filter((p) => p.farmId === f.id && isAvailable(p)).length >= 2);
  const farm = featurable[weekOfYear() % featurable.length];
  const farmItems = products
    .filter((p) => p.farmId === farm.id && isAvailable(p))
    .sort((a, b) => Number(isInSeason(b, month)) - Number(isInSeason(a, month)) || bySales(a, b))
    .slice(0, 3);

  return (
    <div className="space-y-12 md:space-y-16">
      {/* 모바일 첫 화면 머리 — 흰 헤더와 이어지는 한 덩어리: 어디로 받는지(배송지) + 무엇을 찾는지(검색).
          헤더에 붙여 두면 스크롤 내내 화면 위를 차지하므로, 홈 맨 위에만 두고 함께 스크롤되게 합니다. */}
      <div className="border-b border-bark-100 bg-white pb-4 md:hidden">
        <div className="container-page">
          <Link
            href="/mypage?tab=addresses"
            aria-label={`배송지 ${homeAddress.label}, ${homeAddress.address1} — 배송지 관리`}
            className="-mx-1 flex h-10 items-center gap-1.5 rounded-lg px-1 text-[16px] tap-highlight-none focus-ring"
          >
            <MapPin className="h-[18px] w-[18px] shrink-0 text-leaf-700" aria-hidden />
            <span className="shrink-0 font-bold text-bark-900">{homeAddress.label}</span>
            <span className="min-w-0 truncate text-bark-500">{homeAddress.address1}</span>
            <ChevronRight className="h-4 w-4 shrink-0 text-bark-400" aria-hidden />
          </Link>
          <div className="mt-1.5">
            <SearchBar />
          </div>
        </div>
      </div>
      <div className="!mt-0">
        <HeroBanner month={month} farmCount={shippingFarms} />
      </div>

      {/* 카테고리 바로가기 (모바일 — PC는 상단 카테고리 바). 그림 아이콘 대신 실제 상품 사진 */}
      <nav className="container-page !mt-6 md:hidden" aria-label="카테고리">
        <ul className="grid grid-cols-4 gap-x-2 gap-y-4">
          {categories.map((c) => (
            <li key={c.id}>
              <Link href={`/products?category=${c.slug}`} className="flex flex-col items-center gap-1.5 tap-highlight-none">
                <span className="relative h-16 w-16 overflow-hidden rounded-2xl bg-cream-200 transition-transform duration-200 active:scale-95">
                  <Image src={c.cover} alt="" fill sizes="64px" className="object-cover" />
                </span>
                <span className="text-xs font-semibold text-bark-700">{c.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <RecentlyViewed />

      <SeasonalShowcase month={month} items={seasonal} />

      {/* 믿고 사는 상품 + 이번 주 농가 — PC는 나란히, 모바일은 차례로 */}
      <div className="container-page grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8">
        <RepurchaseList items={repurchase} />
        <FarmOfWeek farm={farm} items={farmItems} />
      </div>

      {/* 첫 구매 혜택 */}
      <section className="container-page">
        <Link
          href="/mypage?tab=coupons"
          className="flex items-center gap-4 rounded-2xl bg-leaf-900 px-5 py-4 text-white transition-colors duration-200 hover:bg-leaf-800 md:px-7 md:py-5"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-tangerine-200">
            <Ticket className="h-5 w-5" />
          </span>
          <p className="min-w-0 flex-1 leading-snug">
            <span className="block text-[16px] font-bold md:text-lg">첫 구매 10% 할인</span>
            <span className="block text-sm text-white/75">2만원 이상 주문 시 자동 적용</span>
          </p>
          <ChevronRight className="h-5 w-5 shrink-0 text-white/70" />
        </Link>
      </section>

      {/* 로컬맘 약속 */}
      <section className="border-t border-bark-100 bg-white py-8 md:py-10" aria-label="로컬맘 약속">
        <ul className="container-page grid grid-cols-2 gap-x-4 gap-y-5 md:grid-cols-4">
          {promises.map(({ icon: Icon, title }) => (
            <li key={title} className="flex items-center gap-2.5 sm:gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-leaf-50 text-leaf-700 sm:h-11 sm:w-11">
                <Icon className="h-5 w-5" strokeWidth={1.9} />
              </span>
              <span className="text-sm font-semibold leading-snug text-bark-700">{title}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
