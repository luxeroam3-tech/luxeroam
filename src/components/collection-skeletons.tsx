import { SkeletonCard } from "@/components/skeleton-card";

/** Horizontal strip of filter chips, above the results grid. */
export function FilterChipRail() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {[88, 72, 104, 80, 96, 68, 92].map((w, i) => (
        <div
          key={i}
          style={{ width: w }}
          className="h-9 shrink-0 animate-pulse rounded-full bg-muted"
        />
      ))}
    </div>
  );
}

/** Sticky rail on desktop: price, duration, and other facets. */
export function FilterRail() {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-[201px] flex flex-col gap-6 rounded-2xl border border-border p-5">
        {[3, 4, 3].map((rows, group) => (
          <div key={group} className="flex flex-col gap-3">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="size-4 shrink-0 animate-pulse rounded bg-muted" />
                <div className="h-3.5 flex-1 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </aside>
  );
}

/** The results grid itself. */
export function ResultsGrid({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/** Wide editorial band to break up the grid. */
export function EditorialBand() {
  return (
    <div className="grid grid-cols-1 gap-4 rounded-2xl bg-muted p-6 sm:grid-cols-[1.2fr_1fr] sm:p-8">
      <div className="flex flex-col justify-center gap-3">
        <div className="h-3 w-20 animate-pulse rounded bg-foreground/10" />
        <div className="h-6 w-3/4 animate-pulse rounded bg-foreground/10" />
        <div className="h-3.5 w-full animate-pulse rounded bg-foreground/10" />
        <div className="h-3.5 w-5/6 animate-pulse rounded bg-foreground/10" />
        <div className="mt-2 h-9 w-32 animate-pulse rounded-full bg-foreground/10" />
      </div>
      <div className="aspect-[4/3] w-full animate-pulse rounded-xl bg-foreground/10" />
    </div>
  );
}
