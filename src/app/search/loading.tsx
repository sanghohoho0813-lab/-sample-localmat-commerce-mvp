import { ProductGridSkeleton, Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="container-page py-6 md:py-8">
      <Skeleton className="h-7 w-56" />
      <div className="mt-4 flex gap-3 border-b border-bark-100 pb-3">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="mt-6">
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
}
