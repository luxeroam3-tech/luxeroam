import Link from "next/link";
import { Header } from "@/components/header";
import { FeaturedDestinations } from "@/components/featured-destinations";
import { BentoGrid } from "@/components/bento-grid";
import { RegionRows } from "@/components/region-rows";
import { getDestinationsSafe, getPackageTypesSafe } from "@/lib/data";

export default async function Home() {
  const [destinations, packageTypes] = await Promise.all([
    getDestinationsSafe(),
    getPackageTypesSafe(),
  ]);

  return (
    <main className="flex flex-1 flex-col pb-28">
      <Header packageTypes={packageTypes} />
      {destinations.length === 0 ? (
        <UnavailableNotice />
      ) : (
        <>
          <FeaturedDestinations />
          <BentoGrid />
          <RegionRows destinations={destinations} />
        </>
      )}
    </main>
  );
}

/**
 * Shown when the catalog can't be loaded. Keeps the contact route reachable so
 * an outage never leaves a visitor without a way to get in touch.
 */
function UnavailableNotice() {
  return (
    <section className="flex flex-col items-center gap-3 px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">
        Our destinations are briefly unavailable
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        We&apos;re having trouble loading the catalog right now. Please try
        again shortly — or get in touch and we&apos;ll plan with you directly.
      </p>
      <Link
        href="/contact"
        className="mt-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
      >
        Contact us
      </Link>
    </section>
  );
}
