import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  MapPin,
  Share,
  Heart,
  Map,
  Compass,
  ShieldCheck,
  CalendarCheck,
} from "lucide-react";
import { Header } from "@/components/header";
import { DestinationRow } from "@/components/destination-row";
import { PlaceGallery } from "@/components/destination/place-gallery";
import { PackageSection } from "@/components/destination/package-section";
import { ReviewsSection, Stars } from "@/components/reviews";
import { AvailabilityList } from "@/components/destination/availability-list";
import { recordEvent } from "@/lib/analytics";
import {
  getDestination,
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
  const [place, region, packageTypes, siblings] = await Promise.all([
    getPlace(slug, placeSlug),
    getDestination(slug),
    getPackageTypes(),
    getPlaces(slug),
  ]);

  if (!place || !region) notFound();

  recordEvent({
    type: "place_view",
    placeSlug: place.slug,
    regionSlug: place.region_slug,
  });

  // Only the packages this place actually appears in.
  const packages = region.packages.filter((pkg) =>
    place.package_types.includes(pkg.type),
  );
  const others = siblings.filter((item) => item.slug !== place.slug);

  return (
    <main className="flex flex-1 flex-col pb-28">
      <Header packageTypes={packageTypes} />

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

        <PlaceGallery photos={place.place_photos} name={place.name} />

        <section className="flex flex-col gap-4 border-t border-border py-10">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">
              {place.name} in {place.region}
            </h2>
            <p className="text-sm text-muted-foreground">
              {place.region_tagline}
            </p>
          </div>
          {place.blurb && (
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {place.blurb}.
            </p>
          )}

          <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-3">
            <Highlight
              icon={Compass}
              title="Privately guided"
              body="Your own guide and vehicle, never a shared group departure."
            />
            <Highlight
              icon={CalendarCheck}
              title="Built around your dates"
              body="Every itinerary is re-planned around when you can travel."
            />
            <Highlight
              icon={ShieldCheck}
              title="Fees included"
              body="Park and conservation fees are covered in the trip price."
            />
          </div>
        </section>

        {/* The full itinerary detail for each trip that visits this place. */}
        {packages.map((pkg) => (
          <PackageSection key={pkg.id} pkg={pkg} />
        ))}

        <AvailabilityList
          windows={place.place_availability}
          placeName={place.name}
        />

        <section className="flex flex-col items-start gap-3 rounded-2xl bg-muted p-6">
          <h2 className="text-lg font-semibold">Interested in {place.name}?</h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Tell us your dates and we&apos;ll build an itinerary around them. A
            real person replies within one working day.
          </p>
          <Link
            href={`/contact?destination=${place.region_slug}`}
            className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
          >
            Enquire about this trip
          </Link>
        </section>

        <section className="flex flex-col gap-4 border-t border-border py-10">
          <h2 className="text-lg font-semibold">Where you&apos;ll be</h2>
          <div className="flex min-h-56 items-center justify-center rounded-2xl bg-muted">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Map className="size-4" />
              {place.name}, {place.region}
            </span>
          </div>
        </section>

        <section className="flex flex-col gap-4 border-t border-border py-10">
          <h2 className="text-lg font-semibold">Things to know</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <Note
              title="Booking"
              lines={[
                "Deposit secures your dates",
                "Balance due before departure",
                "Itineraries tailored on request",
              ]}
            />
            <Note
              title="Cancellation"
              lines={[
                "Free changes up to 60 days out",
                "Partial refund within 30 days",
                "Travel insurance recommended",
              ]}
            />
            <Note
              title="Good to know"
              lines={[
                "Guides are private, not shared",
                "Internal flights where listed",
                "Children welcome on family trips",
              ]}
            />
          </div>
        </section>

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

function Highlight({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Compass;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-5 shrink-0" />
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-sm text-muted-foreground">{body}</span>
      </div>
    </div>
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

function Note({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold">{title}</h3>
      {lines.map((line) => (
        <p key={line} className="text-sm text-muted-foreground">
          {line}
        </p>
      ))}
    </div>
  );
}
