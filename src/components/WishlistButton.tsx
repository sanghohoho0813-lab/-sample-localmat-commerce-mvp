"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useToastStore, useWishlistStore } from "@/lib/store";

export default function WishlistButton({
  productId,
  className = "",
  size = "sm",
}: {
  productId: string;
  className?: string;
  size?: "sm" | "lg";
}) {
  // Avoid hydration mismatch: persisted store reads only after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const liked = useWishlistStore((s) => s.ids.includes(productId));
  const toggle = useWishlistStore((s) => s.toggle);
  const showToast = useToastStore((s) => s.show);
  const isLiked = mounted && liked;

  const dims = size === "sm" ? "h-9 w-9" : "h-12 w-12";
  const iconDims = size === "sm" ? "h-[18px] w-[18px]" : "h-6 w-6";

  return (
    <button
      type="button"
      aria-label={isLiked ? "찜 해제" : "찜하기"}
      aria-pressed={isLiked}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
        showToast(
          isLiked ? "찜 목록에서 뺐어요." : "찜 목록에 담았어요.",
          isLiked ? undefined : { label: "보러가기", href: "/mypage?tab=wishlist" }
        );
      }}
      className={`flex ${dims} items-center justify-center rounded-full bg-white/90 shadow-soft backdrop-blur transition-transform duration-200 hover:scale-110 active:scale-95 tap-highlight-none ${className}`}
    >
      <Heart
        className={`${iconDims} transition-colors duration-200 ${
          isLiked ? "fill-tangerine-500 text-tangerine-500 animate-pop" : "text-bark-400"
        }`}
      />
    </button>
  );
}
