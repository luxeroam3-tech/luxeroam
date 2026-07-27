import { SkeletonCard } from "@/components/skeleton-card";

type DestinationRowProps = {
  title: string;
  subtitle?: string;
  count?: number;
};

export function DestinationRow({
  title,
  subtitle,
  count = 6,
}: DestinationRowProps) {
  return (
    <section className="flex flex-col gap-4 py-8">
      <div className="flex flex-col gap-0.5 px-6">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <div className="flex gap-4 overflow-x-auto px-6 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="w-48 shrink-0 sm:w-56">
            <SkeletonCard />
          </div>
        ))}
      </div>
    </section>
  );
}
