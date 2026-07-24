import { Header } from "@/components/header";
import { DestinationRow } from "@/components/destination-row";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <Header />
      <DestinationRow title="Popular in Maasai Mara" />
      <DestinationRow title="Available next month in Diani Beach" />
      <DestinationRow title="Trending near Amboseli" />
    </main>
  );
}
