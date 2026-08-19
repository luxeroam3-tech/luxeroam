import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Map } from "lucide-react";
import { Header } from "@/components/header";
import { DestinationRow } from "@/components/destination-row";
import { PlaceCard } from "@/components/place-card";
import { recordEvent } from "@/lib/analytics";
import {
  getAllPlaces,
  getDestination,
  getDestinations,
  getPackageTypes,
  getPlaces,
} from "@/lib/data";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const region = await getDestination(slug);
  if (!region) return {};

  return { title: region.region, description: region.tagline };
}

export default async function RegionPage({ params }: PageProps) {
  const { slug } = await params;
  const [region, destinations, packageTypes, places, allPlaces] =
    await Promise.all([
      getDestination(slug),
      getDestinations(),
      getPackageTypes(),
      getPlaces(slug),
      getAllPlaces(),
    ]);

  if (!region) notFound();

  recordEvent({ type: "region_view", regionSlug: region.slug });

  const others = destinations.filter((item) => item.slug !== region.slug);

  return (
    <main className="flex flex-1 flex-col pb-28">
      <Header packageTypes={packageTypes} />

      <section className="flex flex-col gap-5 px-6 pt-8">
        <nav className="flex items-center gap-1 text-sm text-muted-foreground">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground">{region.region}</span>
        </nav>

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {region.region}
          </h1>
          <p className="text-sm text-muted-foreground">{region.tagline}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {packageTypes.map((type) => (
            <Link
              key={type}
              href={`/${type}`}
              className="rounded-full border border-border px-4 py-2 text-sm font-medium capitalize hover:bg-muted"
            >
              {type}
            </Link>
          ))}
        </div>
      </section>

      {/* Every destination inside this region. */}
      <section className="flex flex-col gap-6 px-6 py-8">
        <p className="text-sm text-muted-foreground">
          {places.length} destinations in {region.region}
        </p>
        <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {places.map((place) => (
            <PlaceCard key={place.slug} place={place} />
          ))}
        </div>
      </section>

      <section className="px-6 pb-8">
        <div className="relative flex min-h-56 items-center justify-center overflow-hidden rounded-2xl bg-muted">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Map className="size-4" />
            Map of {region.region}
          </div>
        </div>
      </section>

      {others.map((item) => (
        <DestinationRow
          key={item.slug}
          title={item.region}
          subtitle={item.tagline}
          href={`/destinations/${item.slug}`}
          places={allPlaces.filter((p) => p.region_slug === item.slug)}
        />
      ))}
    </main>
  );
}
