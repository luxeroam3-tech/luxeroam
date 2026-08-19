import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { getPlacesForAdmin } from "@/lib/admin/data";
import { getPackageTypes } from "@/lib/data";
import { PlacesTable } from "@/components/admin/places-table";

export const metadata = { title: "Places" };

const FILTERS = [
  { value: "", label: "All" },
  { value: "no-photo", label: "Missing photo" },
  { value: "no-blurb", label: "Missing description" },
  { value: "rated", label: "Has reviews" },
];

type PageProps = { searchParams: Promise<{ filter?: string }> };

export default async function AdminPlacesPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { filter = "" } = await searchParams;
  const [places, packageTypes] = await Promise.all([
    getPlacesForAdmin(),
    getPackageTypes(),
  ]);

  const filtered = places.filter((place) => {
    if (filter === "no-photo") return place.place_photos.length === 0;
    if (filter === "no-blurb") return !place.blurb;
    if (filter === "rated") return (place.review_count ?? 0) > 0;
    return true;
  });

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Places</h1>
        <p className="text-sm text-muted-foreground">
          {filtered.length} of {places.length} places
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((option) => (
          <Link
            key={option.label}
            href={
              option.value
                ? `/admin/places?filter=${option.value}`
                : "/admin/places"
            }
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              filter === option.value
                ? "border-foreground bg-foreground text-background"
                : "border-border hover:bg-muted"
            }`}
          >
            {option.label}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-border p-6 text-sm text-muted-foreground">
          Nothing matches that filter — which is usually good news.
        </p>
      ) : (
        <PlacesTable places={filtered} packageTypes={packageTypes} />
      )}
    </main>
  );
}
