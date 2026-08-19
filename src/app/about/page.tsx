import type { Metadata } from "next";
import Link from "next/link";
import { Compass, ShieldCheck, Users, Globe2 } from "lucide-react";
import { Header } from "@/components/header";
import { getDestinationsSafe, getPackageTypesSafe } from "@/lib/data";

export const metadata: Metadata = {
  title: "About",
  description:
    "Luxe Roam is a Kenya-based travel company planning private honeymoons and family journeys across six regions.",
};

export default async function AboutPage() {
  const [destinations, packageTypes] = await Promise.all([
    getDestinationsSafe(),
    getPackageTypesSafe(),
  ]);

  return (
    <main className="flex flex-1 flex-col pb-16">
      <Header packageTypes={packageTypes} />

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 pt-10">
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Who we are</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Luxe Roam is a Kenya-based travel company. We plan private
            honeymoons and family journeys — starting on our own doorstep in the
            Maasai Mara and Amboseli, and extending across East Africa, the
            wider continent, Europe, the USA, Asia and Australia.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Every itinerary is built from scratch around your dates, your pace
            and the people travelling with you. Nothing here is a packaged
            departure you join.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 border-t border-border pt-8 sm:grid-cols-2">
          <Value
            icon={Compass}
            title="Privately guided"
            body="Your own guide and vehicle throughout, never a shared group."
          />
          <Value
            icon={Users}
            title="Built for the group"
            body="Family trips are paced for children; honeymoons are paced for two."
          />
          <Value
            icon={ShieldCheck}
            title="Fees included"
            body="Park and conservation fees are covered in the price we quote."
          />
          <Value
            icon={Globe2}
            title="Six regions"
            body={`${destinations.length} regions planned in-house, from Kenya to Australia.`}
          />
        </div>

        <div className="flex flex-col items-start gap-4 border-t border-border pt-8">
          <h2 className="text-lg font-semibold">Start a conversation</h2>
          <p className="text-sm text-muted-foreground">
            Tell us where you&apos;d like to go. We reply within one working
            day.
          </p>
          <Link
            href="/contact"
            className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
          >
            Get in touch
          </Link>
        </div>
      </div>
    </main>
  );
}

function Value({
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
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}
