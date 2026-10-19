"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export default function SearchBar({
  placeholder = "상품, 농가, 지역 검색",
  initialQuery = "",
  autoFocus = false,
  onCream = false,
}: {
  placeholder?: string;
  initialQuery?: string;
  autoFocus?: boolean;
  /** 크림 바탕 위에 놓일 때는 흰 면 + 옅은 테두리 (흰 헤더 위에서는 채운 면) */
  onCream?: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    // 상용 앱처럼 테두리 없는 채운 면 + 왼쪽 돋보기. 돋보기가 곧 검색(제출) 버튼입니다.
    <form onSubmit={submit} role="search" className="relative w-full">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        enterKeyHint="search"
        className={`h-12 w-full rounded-xl border pl-12 pr-4 text-[16px] text-bark-800 placeholder:text-bark-400 outline-none transition-colors duration-200 focus:border-leaf-400 focus:bg-white focus:ring-2 focus:ring-leaf-100 ${
          onCream ? "border-bark-200 bg-white" : "border-transparent bg-cream-100 hover:bg-cream-200/70"
        }`}
      />
      <button
        type="submit"
        aria-label="검색"
        className="absolute left-1 top-1 flex h-10 w-10 items-center justify-center rounded-lg text-bark-600 transition-colors duration-200 hover:text-leaf-700"
      >
        <Search className="h-5 w-5" strokeWidth={2.2} />
      </button>
    </form>
  );
}
