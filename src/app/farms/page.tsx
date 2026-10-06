import type { Metadata } from "next";
import FarmCard from "@/components/FarmCard";
import { farms } from "@/lib/data/farms";

export const metadata: Metadata = { title: "농가 스토리" };

export default function FarmsPage() {
  return (
    <div className="container-page py-6 md:py-10">
      <div className="mb-6 md:mb-10">
        <h1 className="text-xl font-extrabold tracking-tight text-bark-900 md:text-3xl">농가 스토리</h1>
        <p className="mt-1.5 text-[16px] text-bark-500">상품 뒤에 있는 사람과 땅의 이야기예요.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
        {farms.map((f) => (
          <FarmCard key={f.id} farm={f} />
        ))}
      </div>
    </div>
  );
}
