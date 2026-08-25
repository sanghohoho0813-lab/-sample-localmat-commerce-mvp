import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <span className="text-5xl">🥕</span>
      <h1 className="mt-5 text-xl font-extrabold text-bark-900">페이지를 찾을 수 없어요</h1>
      <p className="mt-2 text-sm text-bark-500">
        주소가 바뀌었거나 없는 페이지예요. 신선한 상품들을 둘러보시는 건 어때요?
      </p>
      <Link href="/" className="btn-primary mt-6 h-12 px-6 text-[18px]">
        홈으로 가기
      </Link>
    </div>
  );
}
