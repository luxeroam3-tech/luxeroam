import { DestinationRow } from "@/components/destination-row";
import { getAllPlacesSafe } from "@/lib/data";

export async function FeaturedDestinations() {
  const places = await getAllPlacesSafe();

  return (
    <DestinationRow
      title="Featured destinations"
      subtitle="Handpicked across every region we plan"
      places={places.slice(0, 12)}
    />
  );
}
