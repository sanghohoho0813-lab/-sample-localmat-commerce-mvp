"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export default function SearchBar({
  placeholder = "상품, 농가, 지역을 검색해보세요",
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
        className="h-11 w-full rounded-pill border border-leaf-200 bg-white pl-4 pr-12 text-sm text-bark-800 placeholder:text-bark-400 outline-none transition-shadow duration-200 focus:border-leaf-400 focus:ring-2 focus:ring-leaf-100"
      />
      <button
        type="submit"
        aria-label="검색"
        className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-pill bg-leaf-600 text-white transition-colors duration-200 hover:bg-leaf-700"
      >
        <Search className="h-4 w-4" />
      </button>
    </form>
  );
}
