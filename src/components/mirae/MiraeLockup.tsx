import Image from "next/image";

/**
 * 미래에이아이랩 전체 로고 락업 (심볼 + 국문/영문 워드마크).
 * 원본 비율 828×250. 글자가 짙은 남색이라 밝은 배경에서만 사용하고,
 * 어두운 배경에서는 `onDark`로 흰 카드 위에 올려 브랜드 색을 그대로 유지합니다.
 */
export default function MiraeLockup({
  width = 200,
  onDark = false,
  className = "",
}: {
  width?: number;
  onDark?: boolean;
  className?: string;
}) {
  const img = (
    <Image
      src="/brand/logo.png"
      alt="미래에이아이랩 MIRAE AI LAB"
      width={width}
      height={Math.round((width * 250) / 828)}
      style={{ width, height: "auto" }}
      className={onDark ? "" : className}
    />
  );

  if (!onDark) return img;

  return (
    <span className={`inline-flex rounded-2xl bg-white px-5 py-4 shadow-lift ${className}`}>
      {img}
    </span>
  );
}
