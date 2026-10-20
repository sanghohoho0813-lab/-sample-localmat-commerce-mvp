"use client";

import { useRouter } from "next/navigation";
import { useId, useMemo, useState } from "react";
import { MapPin, Search } from "lucide-react";
import ProductImage from "@/components/ProductImage";
import { formatPrice } from "@/lib/format";
import type { Suggestion } from "@/lib/search";
import { useSearchHistoryStore } from "@/lib/store";

type SearchEngine = typeof import("@/lib/search");

/** 입력한 글자가 이름에 그대로 있으면 그 부분만 진하게 */
function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  const at = q ? text.indexOf(q) : -1;
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <mark className="bg-transparent font-bold text-leaf-800">{text.slice(at, at + q.length)}</mark>
      {text.slice(at + q.length)}
    </>
  );
}

/**
 * 검색창 + 자동완성.
 * 입력하는 동안 이름이 맞는 상품·농가를 바로 보여 주고(↑↓로 고르고 Enter로 이동), Enter만 누르면 전체 검색 결과로 갑니다.
 * WAI-ARIA combobox 패턴 — 스크린리더에도 '추천 몇 개 중 몇 번째'가 그대로 전해집니다.
 */
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
  const listId = useId();
  const [query, setQuery] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [engine, setEngine] = useState<SearchEngine | null>(null);
  const remember = useSearchHistoryStore((s) => s.add);

  // 자동완성에 쓰는 상품·농가 데이터는 검색창을 처음 쓸 때 불러와 모든 화면의 첫 로딩을 가볍게 둡니다.
  function loadEngine() {
    if (!engine) void import("@/lib/search").then((mod) => setEngine(mod));
  }

  const suggestions = useMemo(
    () => (engine && query.trim() ? engine.suggest(query, { limit: 6 }) : []),
    [engine, query]
  );
  const expanded = open && suggestions.length > 0;

  function pick(s: Suggestion) {
    remember(query.trim());
    setOpen(false);
    setActive(-1);
    router.push(s.href);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (expanded && active >= 0 && suggestions[active]) {
      pick(suggestions[active]);
      return;
    }
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
      return;
    }
    if (!expanded) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    }
  }

  const optionId = (i: number) => `${listId}-opt-${i}`;

  return (
    // 상용 앱처럼 테두리 없는 채운 면 + 왼쪽 돋보기. 돋보기가 곧 검색(제출) 버튼입니다.
    <form onSubmit={submit} role="search" className="relative w-full">
      <input
        type="search"
        role="combobox"
        aria-label="검색어"
        aria-expanded={expanded}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={expanded && active >= 0 ? optionId(active) : undefined}
        autoComplete="off"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => {
          loadEngine();
          setOpen(true);
        }}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
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

      <ul
        id={listId}
        role="listbox"
        aria-label="추천 검색"
        hidden={!expanded}
        className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-bark-100 bg-white py-1.5 shadow-lift animate-fade-up"
      >
        {suggestions.map((s, i) => (
          <li
            key={s.href}
            id={optionId(i)}
            role="option"
            aria-selected={i === active}
            // 누르는 순간 입력창의 blur로 목록이 먼저 닫히지 않게
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => pick(s)}
            onMouseEnter={() => setActive(i)}
            className={`flex cursor-pointer items-center gap-3 px-3.5 py-2 transition-colors duration-100 ${
              i === active ? "bg-cream-100" : ""
            }`}
          >
            {s.kind === "product" ? (
              <>
                <ProductImage product={s.product} className="w-10 shrink-0 rounded-lg" iconSize="text-base" sizes="40px" />
                <span className="min-w-0 flex-1 leading-snug">
                  <span className="block truncate text-[15px] text-bark-900">
                    <Highlight text={s.product.name} query={query} />{" "}
                    <span className="text-bark-500">{s.product.unit}</span>
                  </span>
                  <span className="block truncate text-sm text-bark-500">
                    {s.product.stock > 0 ? `${formatPrice(s.product.price)}원` : s.product.restockNote}
                  </span>
                </span>
              </>
            ) : (
              <>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-leaf-50 text-leaf-700">
                  <MapPin className="h-[18px] w-[18px]" aria-hidden />
                </span>
                <span className="min-w-0 flex-1 leading-snug">
                  <span className="block truncate text-[15px] text-bark-900">
                    <Highlight text={s.farm.name} query={query} />
                  </span>
                  <span className="block truncate text-sm text-bark-500">농가 · {s.farm.region}</span>
                </span>
              </>
            )}
          </li>
        ))}
      </ul>
    </form>
  );
}
