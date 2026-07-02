import { cn } from "@/lib/utils";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-sm bg-surface", className)}
      aria-hidden="true"
    />
  );
}

export function ContentSkeleton({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Загрузка страницы"
      className={cn(
        "mx-auto w-full max-w-[1564px] px-4 sm:px-8",
        className,
      )}
    >
      <div className="mb-6 flex flex-wrap items-center gap-2 pt-8" aria-hidden="true">
        <SkeletonBar className="h-3 w-16" />
        <SkeletonBar className="h-3 w-3" />
        <SkeletonBar className="h-3 w-24" />
      </div>

      <SkeletonBar className="mb-8 h-10 w-72 max-w-full" />

      <div className="flex max-w-3xl flex-col gap-4" aria-hidden="true">
        <SkeletonBar className="h-4 w-full" />
        <SkeletonBar className="h-4 w-full" />
        <SkeletonBar className="h-4 w-5/6" />
        <SkeletonBar className="h-4 w-4/6" />
      </div>
    </div>
  );
}
