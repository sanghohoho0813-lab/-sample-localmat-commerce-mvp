import type { Metadata } from "next";
import SearchClient from "./SearchClient";

export const metadata: Metadata = { title: "검색" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  return <SearchClient key={query} query={query} />;
}
