export function SkeletonCard() {
  return (
    <div className="flex w-full shrink-0 flex-col gap-3">
      <div className="aspect-square w-full animate-pulse rounded-xl bg-muted" />
      <div className="flex flex-col gap-1.5">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3.5 w-1/2 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
