import { Header } from "@/components/header";
import { FeaturedDestinations } from "@/components/featured-destinations";
import { BentoGrid } from "@/components/bento-grid";
import { RegionRows } from "@/components/region-rows";
import { getDestinations, getPackageTypes } from "@/lib/data";

export default async function Home() {
  const [destinations, packageTypes] = await Promise.all([
    getDestinations(),
    getPackageTypes(),
  ]);

  return (
    <main className="flex flex-1 flex-col">
      <Header destinations={destinations} packageTypes={packageTypes} />
      <FeaturedDestinations />
      <BentoGrid />
      <RegionRows destinations={destinations} />
    </main>
  );
}
