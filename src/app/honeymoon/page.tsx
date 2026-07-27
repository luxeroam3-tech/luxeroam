import type { Metadata } from "next";
import { CollectionPage } from "@/components/collection-page";
import { getDestinations, getPackageTypes } from "@/lib/data";

export const metadata: Metadata = {
  title: "Honeymoons",
  description:
    "Curated honeymoon travel across Kenya, East Africa, Europe, the USA, Asia, and Australia.",
};

export default async function HoneymoonPage() {
  const [destinations, packageTypes] = await Promise.all([
    getDestinations(),
    getPackageTypes(),
  ]);

  return (
    <CollectionPage
      title="Honeymoons"
      subtitle="Slow mornings, private guides, and rooms worth staying in."
      destinations={destinations}
      packageTypes={packageTypes}
    />
  );
}
