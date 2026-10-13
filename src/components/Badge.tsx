import type { ProductBadge } from "@/lib/types";

/**
 * 사진 위 작은 표식 — 색을 줄여 사진이 주인공이 되게 합니다.
 * 인증·특징은 흰 바탕, '베스트'만 짙게, 'NEW'만 포인트 색.
 */
const styles: Partial<Record<ProductBadge, string>> = {
  베스트: "bg-bark-900/90 text-white",
  NEW: "bg-white/95 text-tangerine-700",
};

export default function Badge({ label }: { label: ProductBadge }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[14px] font-semibold leading-4 shadow-sm backdrop-blur-sm ${
        styles[label] ?? "bg-white/95 text-bark-800"
      }`}
    >
      {label}
    </span>
  );
}
