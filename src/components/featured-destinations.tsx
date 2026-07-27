import { DestinationRow } from "@/components/destination-row";
import { getAllPlaces } from "@/lib/data";

export async function FeaturedDestinations() {
  const places = await getAllPlaces();

  return (
    <DestinationRow
      title="Featured destinations"
      subtitle="Handpicked across every region we plan"
      places={places.slice(0, 12)}
    />
  );
}
