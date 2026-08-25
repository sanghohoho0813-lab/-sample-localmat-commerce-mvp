import Image from "next/image";

/**
 * 미래에이아이랩 심볼 마크(M, 정사각).
 * 전체 락업은 글자가 짙은 남색이라 어두운 배경에서 묻힙니다.
 * 좁거나 어두운 영역(리본 등)에서는 이 심볼 + HTML 텍스트 조합을 사용합니다.
 * 에셋 생성: scripts/prepare-brand.mjs
 */
export default function MiraeMark({
  size = 28,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/brand/mark.png"
      alt=""
      aria-hidden
      width={size}
      height={size}
      className={className}
    />
  );
}
