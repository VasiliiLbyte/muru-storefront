import { cn } from "@/lib/utils";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-sm bg-surface", className)}
      aria-hidden="true"
    />
  );
}

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      <div className="aspect-[4/5] animate-pulse bg-surface" />
      <SkeletonBar className="h-4 w-3/4" />
      <SkeletonBar className="h-4 w-1/3" />
    </div>
  );
}

export function CatalogSkeleton({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Загрузка каталога"
      className={cn(
        "mx-auto w-full max-w-[1564px] px-4 sm:px-8",
        className,
      )}
    >
      <div className="mb-6 flex flex-wrap items-center gap-2 pt-8" aria-hidden="true">
        <SkeletonBar className="h-3 w-16" />
        <SkeletonBar className="h-3 w-3" />
        <SkeletonBar className="h-3 w-24" />
        <SkeletonBar className="h-3 w-3" />
        <SkeletonBar className="h-3 w-32" />
      </div>

      <SkeletonBar className="mb-8 h-10 w-64 max-w-full" />

      <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
