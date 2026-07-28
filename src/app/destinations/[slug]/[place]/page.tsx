import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MapPin, Share, Heart } from "lucide-react";
import { Header } from "@/components/header";
import { DestinationRow } from "@/components/destination-row";
import { ReviewsSection, Stars } from "@/components/reviews";
import { Price } from "@/components/price";
import {
  getDestination,
  getDestinations,
  getPackageTypes,
  getPlace,
  getPlaces,
} from "@/lib/data";

type PageProps = { params: Promise<{ slug: string; place: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, place: placeSlug } = await params;
  const place = await getPlace(slug, placeSlug);
  if (!place) return {};

  return {
    title: `${place.name}, ${place.region}`,
    description: place.blurb ?? undefined,
  };
}

export default async function PlacePage({ params }: PageProps) {
  const { slug, place: placeSlug } = await params;
  const [place, region, destinations, packageTypes, siblings] =
    await Promise.all([
      getPlace(slug, placeSlug),
      getDestination(slug),
      getDestinations(),
      getPackageTypes(),
      getPlaces(slug),
    ]);

  if (!place || !region) notFound();

  const photo = place.place_photos?.[0];
  const trips = region.packages.filter((pkg) =>
    place.package_types.includes(pkg.type),
  );
  const others = siblings.filter((item) => item.slug !== place.slug);

  return (
    <main className="flex flex-1 flex-col pb-28">
      <Header destinations={destinations} packageTypes={packageTypes} />

      <div className="mx-auto flex w-full max-w-5xl flex-col px-6 pt-8">
        <nav className="flex items-center gap-1 pb-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <ChevronRight className="size-3.5" />
          <Link href={`/destinations/${slug}`} className="hover:underline">
            {place.region}
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground">{place.name}</span>
        </nav>

        <div className="flex flex-wrap items-start justify-between gap-4 pb-5">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {place.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                {place.region}
              </span>
              {place.rating !== null && place.review_count ? (
                <span className="flex items-center gap-1.5 text-foreground">
                  <Stars
                    value={Math.round(place.rating)}
                    className="size-3.5"
                  />
                  {place.rating.toFixed(1)} ({place.review_count})
                </span>
              ) : (
                <span>New — no reviews yet</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <IconButton icon={Share} label="Share" />
            <IconButton icon={Heart} label="Save" />
          </div>
        </div>

        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-muted">
          {photo ? (
            <Image
              src={`${photo.url}&w=1600&h=900&q=80&fm=jpg&fit=crop`}
              alt={photo.alt ?? place.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
              Photography coming soon
            </div>
          )}
          {photo?.photographer_name && (
            <span className="absolute bottom-2 right-3 text-xs text-white/75 [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">
              Photo:{" "}
              <a
                href={`${photo.photographer_url}?utm_source=luxe_roam&utm_medium=referral`}
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                {photo.photographer_name}
              </a>{" "}
              on{" "}
              <a
                href="https://unsplash.com/?utm_source=luxe_roam&utm_medium=referral"
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                Unsplash
              </a>
            </span>
          )}
        </div>

        {place.blurb && (
          <section className="flex flex-col gap-3 border-t border-border py-10">
            <h2 className="text-base font-semibold">About {place.name}</h2>
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {place.blurb}. Part of our {place.region} collection —{" "}
              {place.region_tagline.toLowerCase()}.
            </p>
          </section>
        )}

        {trips.length > 0 && (
          <section className="flex flex-col gap-4 border-t border-border py-10">
            <h2 className="text-base font-semibold">
              Trips that include {place.name}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {trips.map((trip) => (
                <Link
                  key={trip.id}
                  href={`/${trip.type}`}
                  className="flex flex-col gap-2 rounded-2xl border border-border p-5 hover:bg-muted"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {trip.type}
                  </span>
                  <span className="font-semibold">{trip.title}</span>
                  {trip.duration && (
                    <span className="text-sm text-muted-foreground">
                      {trip.duration}
                    </span>
                  )}
                  {trip.price_from !== null && (
                    <span className="text-sm">
                      <span className="text-muted-foreground">From</span>{" "}
                      <span className="font-semibold">
                        <Price amount={Number(trip.price_from)} />
                      </span>{" "}
                      <span className="text-muted-foreground">per person</span>
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        <ReviewsSection
          placeId={place.id}
          placeName={place.name}
          rating={place.rating}
          reviewCount={place.review_count}
          reviews={place.reviews}
          path={`/destinations/${slug}/${placeSlug}`}
        />
      </div>

      <DestinationRow
        title={`More in ${place.region}`}
        href={`/destinations/${slug}`}
        places={others}
      />
    </main>
  );
}

function IconButton({
  icon: Icon,
  label,
}: {
  icon: typeof Share;
  label: string;
}) {
  return (
    <button
      type="button"
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium underline-offset-4 hover:bg-muted hover:underline"
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}
