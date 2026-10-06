import Link from "next/link";
import type { LucideIcon } from "lucide-react";

/**
 * 빈 화면 공통 — 장바구니·주문 내역·찜·최근 본 상품·검색·404가 같은 모양과 같은 다음 행동을 갖도록 합니다.
 * (아이콘 원 → 제목 → 한 줄 설명 → 버튼 하나)
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  as: Heading = "p",
  children,
  className = "py-16 md:py-20",
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; href: string };
  /** 화면의 주제목일 때는 h1로 */
  as?: "h1" | "h2" | "p";
  /** 버튼 대신(또는 아래에) 놓을 내용 — 예: 추천 검색어 */
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-cream-200 text-bark-300">
        <Icon className="h-9 w-9" strokeWidth={1.8} />
      </span>
      <Heading className="mt-5 text-lg font-extrabold text-bark-900">{title}</Heading>
      {description && <p className="mt-1.5 text-[16px] text-bark-500">{description}</p>}
      {action && (
        <Link href={action.href} className="btn-primary mt-6 h-12 px-6 text-[16px]">
          {action.label}
        </Link>
      )}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
