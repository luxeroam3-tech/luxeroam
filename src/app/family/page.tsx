import type { Metadata } from "next";
import { CollectionPage } from "@/components/collection-page";
import { getDestinationsSafe, getPackageTypesSafe } from "@/lib/data";

export const metadata: Metadata = {
  title: "Family trips",
  description:
    "Family travel across Kenya, East Africa, Europe, the USA, Asia, and Australia, planned around the whole group.",
};

export default async function FamilyPage() {
  const [destinations, packageTypes] = await Promise.all([
    getDestinationsSafe(),
    getPackageTypesSafe(),
  ]);

  return (
    <CollectionPage
      title="Family trips"
      subtitle="Room for everyone, paced so nobody burns out by day three."
      packageType="family"
      destinations={destinations}
      packageTypes={packageTypes}
    />
  );
}
