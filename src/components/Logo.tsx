import Link from "next/link";
import { Sprout } from "lucide-react";

export default function Logo({ withTagline = false }: { withTagline?: boolean }) {
  return (
    <Link href="/" className="group flex flex-col tap-highlight-none">
      <span className="flex items-center gap-1">
        <span className="text-xl font-extrabold tracking-tight text-leaf-700 md:text-2xl">
          로컬맘
        </span>
        <Sprout className="h-5 w-5 text-leaf-500 transition-transform duration-300 group-hover:rotate-12" />
      </span>
      {withTagline && (
        <span className="mt-0.5 hidden text-[11px] font-medium text-bark-400 lg:block">
          우리 동네, 신선한 한 끼
        </span>
      )}
    </Link>
  );
}
