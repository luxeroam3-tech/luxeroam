import { SkeletonCard } from "@/components/skeleton-card";

export function FeaturedDestinations() {
  return (
    <section className="flex flex-col gap-4 py-8">
      <div className="px-6">
        <h2 className="text-xl font-semibold tracking-tight">
          Featured destinations
        </h2>
      </div>
      <div className="flex gap-4 overflow-x-auto px-6 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-48 shrink-0 sm:w-56">
            <SkeletonCard />
          </div>
        ))}
      </div>
    </section>
  );
}
