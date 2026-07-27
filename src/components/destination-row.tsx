import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PlaceCard } from "@/components/place-card";
import type { Place } from "@/lib/data";

type DestinationRowProps = {
  title: string;
  subtitle?: string;
  href?: string;
  places: Place[];
};

export function DestinationRow({
  title,
  subtitle,
  href,
  places,
}: DestinationRowProps) {
  if (places.length === 0) return null;

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
        {places.map((place) => (
          <div
            key={`${place.region_slug}-${place.slug}`}
            className="w-48 shrink-0 sm:w-56"
          >
            <PlaceCard place={place} />
          </div>
        ))}
      </div>
    </section>
  );
}
