import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin, Share, Heart } from "lucide-react";
import { Header } from "@/components/header";
import { Gallery } from "@/components/destination/gallery";
import { PackageSection } from "@/components/destination/package-section";
import { DestinationRow } from "@/components/destination-row";
import { getDestination, getDestinations, getPackageTypes } from "@/lib/data";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const destination = await getDestination(slug);
  if (!destination) return {};

  return {
    title: destination.region,
    description: destination.tagline,
  };
}

export default async function DestinationPage({ params }: PageProps) {
  const { slug } = await params;
  const [destination, destinations, packageTypes] = await Promise.all([
    getDestination(slug),
    getDestinations(),
    getPackageTypes(),
  ]);

  if (!destination) notFound();

  const others = destinations.filter((item) => item.slug !== destination.slug);

  return (
    <main className="flex flex-1 flex-col pb-28">
      <Header destinations={destinations} packageTypes={packageTypes} />

      <div className="mx-auto flex w-full max-w-5xl flex-col px-6 pt-8">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-5">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {destination.region}
            </h1>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-3.5" />
              {destination.tagline}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <IconButton icon={Share} label="Share" />
            <IconButton icon={Heart} label="Save" />
          </div>
        </div>

        <Gallery alt={destination.region} />

        {destination.packages.map((pkg) => (
          <PackageSection key={pkg.id} pkg={pkg} />
        ))}

        <section className="flex flex-col gap-4 border-t border-border py-10">
          <h2 className="text-base font-semibold">Things to know</h2>
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
                "Park and conservation fees included",
                "Internal flights where listed",
                "Guides are private, not shared",
              ]}
            />
          </div>
        </section>
      </div>

      {others.map((item) => (
        <DestinationRow
          key={item.slug}
          title={item.region}
          subtitle={item.tagline}
          href={`/destinations/${item.slug}`}
        />
      ))}
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
