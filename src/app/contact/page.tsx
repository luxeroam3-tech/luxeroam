import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Header } from "@/components/header";
import { EnquiryForm } from "@/components/enquiry-form";
import { CONTACT } from "@/components/footer";
import { getDestinationsSafe, getPackageTypesSafe } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Tell us where you'd like to go and we'll plan a private itinerary around your dates.",
};

type PageProps = {
  searchParams: Promise<{ destination?: string }>;
};

export default async function ContactPage({ searchParams }: PageProps) {
  const [{ destination }, destinations, packageTypes] = await Promise.all([
    searchParams,
    getDestinationsSafe(),
    getPackageTypesSafe(),
  ]);

  return (
    <main className="flex flex-1 flex-col pb-16">
      <Header packageTypes={packageTypes} />

      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-10 px-6 pt-10 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Plan your trip
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Tell us roughly where and when, and we&apos;ll come back with an
              itinerary built around you. No obligation, no automated quotes — a
              real person reads every enquiry.
            </p>
          </div>

          <EnquiryForm
            packageTypes={packageTypes}
            destinationSlug={
              destinations.some((d) => d.slug === destination)
                ? destination
                : undefined
            }
          />
        </div>

        <aside className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 rounded-2xl bg-muted p-6">
            <h2 className="text-base font-semibold">Reach us directly</h2>
            <a
              href={`mailto:${CONTACT.email}`}
              className="flex items-start gap-3 text-sm hover:underline"
            >
              <Mail className="mt-0.5 size-4 shrink-0" />
              {CONTACT.email}
            </a>
            <a
              href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}
              className="flex items-start gap-3 text-sm hover:underline"
            >
              <Phone className="mt-0.5 size-4 shrink-0" />
              {CONTACT.phone}
            </a>
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              {CONTACT.location}
            </div>
            <div className="flex items-start gap-3 text-sm text-muted-foreground">
              <Clock className="mt-0.5 size-4 shrink-0" />
              Mon–Fri, 9am–6pm EAT
            </div>
          </div>

          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <h2 className="text-base font-semibold text-foreground">
              What happens next
            </h2>
            <p>1. We read your enquiry and reply within one working day.</p>
            <p>2. We shape a draft itinerary and share indicative pricing.</p>
            <p>3. You refine it with us until the trip is right.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
