import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, ChevronRight, MapPin, Sprout } from "lucide-react";
import FarmImage from "@/components/FarmImage";
import ProductCard from "@/components/ProductCard";
import { farms, getFarm } from "@/lib/data/farms";
import { products } from "@/lib/data/products";

export function generateStaticParams() {
  return farms.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const farm = getFarm(slug);
  return { title: farm ? farm.name : "농가" };
}

export default async function FarmDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const farm = getFarm(slug);
  if (!farm) notFound();

  const farmProducts = products.filter((p) => p.farmId === farm.id);

  return (
    <div className="pb-8">
      {/* Hero */}
      <div className="relative overflow-hidden text-white">
        <FarmImage farm={farm} priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-leaf-900/95 via-leaf-900/70 to-leaf-900/45 md:bg-gradient-to-r md:from-leaf-900/95 md:via-leaf-900/70 md:to-leaf-900/20" />
        <div className="container-page relative py-10 md:max-w-[1280px] md:py-20">
          <nav className="mb-5 flex items-center gap-1 text-xs text-leaf-200" aria-label="breadcrumb">
            <Link href="/" className="hover:text-white">홈</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/farms" className="hover:text-white">농가 스토리</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-leaf-50">{farm.name}</span>
          </nav>
          <p className="text-xl font-bold leading-snug md:text-3xl [text-wrap:balance]">
            “{farm.quote}”
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-leaf-100">
            <span className="font-bold text-white">{farm.name}</span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {farm.region}
            </span>
            <span>{farm.owner} 대표</span>
            <span>{farm.since}년부터</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {farm.certifications.map((c) => (
              <span
                key={c}
                className="flex items-center gap-1 rounded-pill bg-white/15 px-2.5 py-1 text-xs font-medium text-white"
              >
                <BadgeCheck className="h-3.5 w-3.5" />
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="container-page py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-14">
          {/* Story */}
          <div>
            <h2 className="text-lg font-extrabold text-bark-900 md:text-xl">농가 이야기</h2>
            <p className="mt-3 leading-relaxed text-bark-700">{farm.intro}</p>
            <div className="mt-4 space-y-4">
              {farm.story.map((para, i) => (
                <p key={i} className="leading-relaxed text-bark-700">{para}</p>
              ))}
            </div>
          </div>

          {/* Facts */}
          <div className="space-y-4">
            <div className="rounded-card border border-bark-100 bg-white p-5">
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-bark-900">
                <Sprout className="h-4 w-4 text-leaf-600" />
                재배 방식
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-bark-600">{farm.method}</p>
            </div>
            <div className="rounded-card border border-bark-100 bg-white p-5">
              <h3 className="text-sm font-bold text-bark-900">생산 품목</h3>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {farm.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-pill bg-leaf-50 px-3 py-1 text-[13px] font-medium text-leaf-700"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Products */}
        <section className="mt-12 md:mt-16">
          <h2 className="mb-5 text-lg font-extrabold text-bark-900 md:text-2xl">
            {farm.name}의 판매 상품
          </h2>
          {farmProducts.length === 0 ? (
            <p className="rounded-card border border-dashed border-bark-200 bg-white py-14 text-center text-sm text-bark-400">
              준비 중인 상품이 곧 올라올 예정이에요.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-4 md:gap-x-5">
              {farmProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
