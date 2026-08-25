import { ProductGridSkeleton, Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="container-page py-6 md:py-8">
      <div className="mb-5 md:mb-7">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>
      <div className="flex gap-8">
        <aside className="hidden w-56 shrink-0 lg:block">
          <Skeleton className="h-[420px] w-full rounded-card" />
        </aside>
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    </div>
  );
}
