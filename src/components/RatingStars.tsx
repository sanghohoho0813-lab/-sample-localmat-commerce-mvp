import { Star } from "lucide-react";

export default function RatingStars({
  rating,
  reviewCount,
  size = "sm",
}: {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md";
}) {
  const starClass = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const textClass = size === "sm" ? "text-xs" : "text-sm";
  return (
    <span className={`inline-flex items-center gap-1 ${textClass} text-bark-500`}>
      <Star className={`${starClass} fill-tangerine-400 text-tangerine-400`} />
      <span className="font-semibold text-bark-700">{rating.toFixed(1)}</span>
      {reviewCount !== undefined && <span>({reviewCount.toLocaleString()})</span>}
    </span>
  );
}
