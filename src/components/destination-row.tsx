import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SkeletonCard } from "@/components/skeleton-card";

type DestinationRowProps = {
  title: string;
  subtitle?: string;
  count?: number;
  href?: string;
};

export function DestinationRow({
  title,
  subtitle,
  count = 6,
  href,
}: DestinationRowProps) {
  const heading = (
    <h2 className="flex items-center gap-1 text-xl font-semibold tracking-tight">
      {title}
      {href && <ChevronRight className="size-5" />}
    </h2>
  );

  return (
    <section className="flex flex-col gap-4 py-8">
      <div className="flex flex-col gap-0.5 px-6">
        {href ? (
          <Link href={href} className="w-fit hover:underline">
            {heading}
          </Link>
        ) : (
          heading
        )}
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
