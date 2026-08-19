import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { Header } from "@/components/header";
import { PlaceCard } from "@/components/place-card";
import { DestinationRow } from "@/components/destination-row";
import {
  getAllPlacesSafe,
  getDestinationsSafe,
  getPackageTypesSafe,
  searchPlaces,
} from "@/lib/data";

export const metadata: Metadata = { title: "Search" };

type PageProps = {
  searchParams: Promise<{ where?: string; type?: string; when?: string }>;
};

export default async function SearchPage({ searchParams }: PageProps) {
  const { where, type, when } = await searchParams;

  const [results, destinations, packageTypes, allPlaces] = await Promise.all([
    searchPlaces({ where, type }),
    getDestinationsSafe(),
    getPackageTypesSafe(),
    getAllPlacesSafe(),
  ]);

  const criteria = [where, type, when].filter(Boolean);

  return (
    <main className="flex flex-1 flex-col pb-28">
      <Header packageTypes={packageTypes} />

      <section className="flex flex-col gap-5 px-6 pt-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {where ? `Destinations matching “${where}”` : "All destinations"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {results.length}{" "}
            {results.length === 1 ? "destination" : "destinations"}
            {criteria.length > 0 && ` · ${criteria.join(" · ")}`}
          </p>
        </div>

        {(where || type) && (
          <div className="flex flex-wrap gap-2">
            <FilterPill href="/search" active={!where && !type}>
              All
            </FilterPill>
            {packageTypes.map((packageType) => (
              <FilterPill
                key={packageType}
                href={`/search?${new URLSearchParams({
                  ...(where ? { where } : {}),
                  type: packageType,
                }).toString()}`}
                active={type === packageType}
              >
                <span className="capitalize">{packageType}</span>
              </FilterPill>
            ))}
          </div>
        )}
      </section>

      {results.length > 0 ? (
        <section className="grid grid-cols-1 gap-x-4 gap-y-8 px-6 py-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((place) => (
            <PlaceCard
              key={`${place.region_slug}-${place.slug}`}
              place={place}
            />
          ))}
        </section>
      ) : (
        <section className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <SearchX className="size-8 text-muted-foreground" />
          <h2 className="text-lg font-semibold">No destinations match that</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Try a region like Kenya or Europe, a place like Amboseli, or browse
            everything below.
          </p>
          <Link
            href="/search"
            className="mt-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80"
          >
            Show all destinations
          </Link>
        </section>
      )}

      {results.length === 0 &&
        destinations
          .slice(0, 3)
          .map((destination) => (
            <DestinationRow
              key={destination.slug}
              title={destination.region}
              subtitle={destination.tagline}
              href={`/destinations/${destination.slug}`}
              places={allPlaces.filter(
                (p) => p.region_slug === destination.slug,
              )}
            />
          ))}
    </main>
  );
}

function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border hover:bg-muted"
      }`}
    >
      {children}
    </Link>
  );
}
