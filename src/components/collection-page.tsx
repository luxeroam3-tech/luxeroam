import { Header } from "@/components/header";
import { DestinationRow } from "@/components/destination-row";
import { PlaceCard } from "@/components/place-card";
import { getAllPlacesSafe } from "@/lib/data";
import type { DestinationSummary } from "@/lib/data";

type CollectionPageProps = {
  title: string;
  subtitle: string;
  packageType: string;
  destinations: DestinationSummary[];
  packageTypes: string[];
};

/**
 * Shared layout for the honeymoon and family screens. No hero - the header and
 * search bar sit straight on top of the results, same as the landing page.
 */
export async function CollectionPage({
  title,
  subtitle,
  packageType,
  destinations,
  packageTypes,
}: CollectionPageProps) {
  const places = await getAllPlacesSafe(packageType);
  const regionsWithPlaces = destinations.filter((destination) =>
    places.some((place) => place.region_slug === destination.slug),
  );

  return (
    <main className="flex flex-1 flex-col pb-28">
      <Header packageTypes={packageTypes} />

      <section className="flex flex-col gap-5 px-6 pt-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <p className="text-sm text-muted-foreground">
          {places.length} destinations across {regionsWithPlaces.length} regions
        </p>
      </section>

      <section className="grid grid-cols-1 gap-x-4 gap-y-8 px-6 py-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {places.map((place) => (
          <PlaceCard key={`${place.region_slug}-${place.slug}`} place={place} />
        ))}
      </section>

      {regionsWithPlaces.map((destination) => (
        <DestinationRow
          key={destination.slug}
          title={destination.region}
          subtitle={destination.tagline}
          href={`/destinations/${destination.slug}`}
          places={places.filter((p) => p.region_slug === destination.slug)}
        />
      ))}
    </main>
  );
}
