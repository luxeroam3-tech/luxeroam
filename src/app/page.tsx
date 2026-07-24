import { Header } from "@/components/header";
import { FeaturedDestinations } from "@/components/featured-destinations";
import { BentoGrid } from "@/components/bento-grid";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <Header />
      <FeaturedDestinations />
      <BentoGrid />
    </main>
  );
}
