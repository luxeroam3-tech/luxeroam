import { DestinationRow } from "@/components/destination-row";
import { getAllPlacesSafe } from "@/lib/data";
import type { DestinationSummary } from "@/lib/data";

type RegionRowsProps = {
  destinations: DestinationSummary[];
};

export async function RegionRows({ destinations }: RegionRowsProps) {
  const places = await getAllPlacesSafe();

  return (
    <>
      {destinations.map((destination) => (
        <DestinationRow
          key={destination.slug}
          title={destination.region}
          subtitle={destination.tagline}
          href={`/destinations/${destination.slug}`}
          places={places.filter((p) => p.region_slug === destination.slug)}
        />
      ))}
    </>
  );
}
