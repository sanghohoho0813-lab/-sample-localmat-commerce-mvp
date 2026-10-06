import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFarm } from "@/lib/data/farms";
import { getProduct, products } from "@/lib/data/products";
import { SITE_URL } from "@/lib/site";
import ProductDetailClient from "./ProductDetailClient";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const title = `${product.name} ${product.unit}`;
  return {
    title,
    description: product.summary,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { title, description: product.summary, images: product.image ? [product.image] : undefined },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const farm = getFarm(product.farmId);

  // 검색 결과에 가격·별점이 함께 보이도록 상품 구조화 데이터(schema.org/Product)를 넣습니다.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.name} ${product.unit}`,
    description: product.summary,
    image: product.image ? `${SITE_URL}${product.image}` : undefined,
    brand: farm ? { "@type": "Brand", name: farm.name } : undefined,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "KRW",
      price: product.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/products/${product.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // JSON 안의 "<"를 이스케이프해 문자열이 스크립트 태그를 닫지 못하게 합니다.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ProductDetailClient product={product} />
    </>
  );
}
