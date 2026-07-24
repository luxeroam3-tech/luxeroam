import { ArrowRight } from "lucide-react";
import { SkeletonCard } from "@/components/skeleton-card";

export function DestinationRow({
  title,
  count = 5,
}: {
  title: string;
  count?: number;
}) {
  return (
    <section className="flex flex-col gap-4 py-8">
      <div className="flex items-center gap-2 px-6">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <ArrowRight className="size-4 text-muted-foreground" />
      </div>
      <div className="grid grid-cols-2 gap-4 px-6 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </section>
  );
}
