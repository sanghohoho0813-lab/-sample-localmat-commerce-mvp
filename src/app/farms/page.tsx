import type { Metadata } from "next";
import FarmCard from "@/components/FarmCard";
import { farms } from "@/lib/data/farms";

export const metadata: Metadata = { title: "농가 스토리" };

export default function FarmsPage() {
  return (
    <div className="container-page py-6 md:py-10">
      <div className="mb-6 md:mb-10">
        <p className="text-sm font-semibold text-leaf-700">농가 스토리</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-bark-900 md:text-3xl">
          우리 동네 농부의
          <br className="md:hidden" /> 이야기를 만나보세요
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-bark-500 md:text-base">
          로컬맘은 전국 각지의 정직한 생산자와 소비자를 직접 연결합니다. 상품 뒤에 있는 사람과
          땅의 이야기를 소개합니다.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
        {farms.map((f) => (
          <FarmCard key={f.id} farm={f} />
        ))}
      </div>
    </div>
  );
}
