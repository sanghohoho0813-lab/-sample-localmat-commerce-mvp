import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function SectionHeader({
  title,
  subtitle,
  moreHref,
  moreLabel = "더보기",
}: {
  title: string;
  subtitle?: string;
  moreHref?: string;
  moreLabel?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between md:mb-6">
      <div>
        <h2 className="text-lg font-extrabold tracking-tight text-bark-900 md:text-2xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-bark-500">{subtitle}</p>}
      </div>
      {moreHref && (
        <Link
          href={moreHref}
          className="flex shrink-0 items-center gap-0.5 text-sm font-medium text-bark-500 transition-colors hover:text-leaf-700"
        >
          {moreLabel}
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
