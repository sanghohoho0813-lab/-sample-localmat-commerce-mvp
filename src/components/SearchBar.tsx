"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export default function SearchBar({
  placeholder = "상품, 농가, 지역 검색",
  initialQuery = "",
  autoFocus = false,
}: {
  placeholder?: string;
  initialQuery?: string;
  autoFocus?: boolean;
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
    <form onSubmit={submit} role="search" className="relative w-full">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        enterKeyHint="search"
        className="h-13 w-full rounded-pill border border-leaf-200 bg-white pl-5 pr-14 text-base text-bark-800 placeholder:text-bark-400 outline-none transition-shadow duration-200 focus:border-leaf-400 focus:ring-2 focus:ring-leaf-100"
      />
      <button
        type="submit"
        aria-label="검색"
        className="absolute right-1.5 top-1.5 flex h-10 w-10 items-center justify-center rounded-pill bg-leaf-600 text-white transition-colors duration-200 hover:bg-leaf-700"
      >
        <Search className="h-[18px] w-[18px]" />
      </button>
    </form>
  );
}
