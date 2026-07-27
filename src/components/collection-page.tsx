import { Header } from "@/components/header";
import { DestinationRow } from "@/components/destination-row";
import {
  EditorialBand,
  FilterChipRail,
  FilterRail,
  ResultsGrid,
} from "@/components/collection-skeletons";
import type { DestinationSummary } from "@/lib/data";

type CollectionPageProps = {
  title: string;
  subtitle: string;
  destinations: DestinationSummary[];
  packageTypes: string[];
};

/**
 * Shared layout for the honeymoon and family screens. No hero - the header and
 * search bar sit straight on top of the results, same as the landing page.
 */
export function CollectionPage({
  title,
  subtitle,
  destinations,
  packageTypes,
}: CollectionPageProps) {
  return (
    <main className="flex flex-1 flex-col pb-28">
      <Header destinations={destinations} packageTypes={packageTypes} />

      <section className="flex flex-col gap-5 px-6 pt-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <FilterChipRail />
      </section>

      <section className="grid grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-[260px_1fr]">
        <FilterRail />
        <div className="flex flex-col gap-10">
          <ResultsGrid count={6} />
          <EditorialBand />
          <ResultsGrid count={6} />
        </div>
      </section>

      {destinations.map((destination) => (
        <DestinationRow
          key={destination.slug}
          title={destination.region}
          subtitle={destination.tagline}
          href={`/destinations/${destination.slug}`}
        />
      ))}
    </main>
  );
}
