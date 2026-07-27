import { DestinationRow } from "@/components/destination-row";
import type { DestinationSummary } from "@/lib/data";

type RegionRowsProps = {
  destinations: DestinationSummary[];
};

export function RegionRows({ destinations }: RegionRowsProps) {
  return (
    <>
      {destinations.map((destination) => (
        <DestinationRow
          key={destination.slug}
          title={destination.region}
          subtitle={destination.tagline}
          href={`/destinations/${destination.slug}`}
        />
      ))}
    </>
  );
}
