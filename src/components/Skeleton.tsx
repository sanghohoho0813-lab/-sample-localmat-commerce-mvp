export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gradient-to-r from-bark-100 via-cream-200 to-bark-100 bg-[length:800px_100%] ${className}`}
      aria-hidden
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="space-y-2.5">
      <Skeleton className="aspect-square w-full rounded-card" />
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-5 w-1/2" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 md:gap-x-5 md:gap-y-8 xl:grid-cols-4"
      role="status"
      aria-label="상품을 불러오는 중"
    >
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
