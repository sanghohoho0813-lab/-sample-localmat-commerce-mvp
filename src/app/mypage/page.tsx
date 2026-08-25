import type { Metadata } from "next";
import MyPageClient from "./MyPageClient";

export const metadata: Metadata = { title: "마이페이지" };

export default async function MyPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  return <MyPageClient key={tab ?? "overview"} initialTab={tab ?? "overview"} />;
}
