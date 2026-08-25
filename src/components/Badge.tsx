import type { ProductBadge } from "@/lib/types";

const styles: Record<ProductBadge, string> = {
  제철: "bg-tangerine-500 text-white",
  산지직송: "bg-leaf-600 text-white",
  당일수확: "bg-leaf-100 text-leaf-700",
  무농약: "bg-leaf-100 text-leaf-700",
  유기농: "bg-leaf-100 text-leaf-700",
  동물복지: "bg-cream-200 text-bark-600",
  무항생제: "bg-cream-200 text-bark-600",
  "1등급": "bg-cream-200 text-bark-600",
  NEW: "bg-tangerine-100 text-tangerine-600",
  베스트: "bg-bark-800 text-white",
};

export default function Badge({ label }: { label: ProductBadge }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-semibold leading-4 ${styles[label]}`}
    >
      {label}
    </span>
  );
}
