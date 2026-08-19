import Link from "next/link";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { getPlacesForAdmin } from "@/lib/admin/data";
import { createClient } from "@/lib/supabase/server";

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
  const places = await getPlacesForAdmin();

  // Photo URLs are fetched separately so the listing query stays small.
  const supabase = await createClient();
  const { data: photos } = await supabase
    .from("place_photos")
    .select("place_id, url")
    .order("sort_order");
  const photoByPlace = new Map<string, string>();
  for (const photo of photos ?? []) {
    if (!photoByPlace.has(photo.place_id))
      photoByPlace.set(photo.place_id, photo.url);
  }

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
        <ul className="flex flex-col divide-y divide-border rounded-2xl border border-border">
          {filtered.map((place) => {
            const photo = photoByPlace.get(place.id);
            return (
              <li
                key={place.id}
                className="flex flex-wrap items-center gap-4 p-4"
              >
                <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {photo ? (
                    <Image
                      src={`${photo}&w=112&h=112&q=70&fm=jpg&fit=crop`}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center">
                      <ImageOff className="size-4 text-muted-foreground" />
                    </span>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-sm font-medium">
                    {place.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {place.destinations?.region ?? "—"}
                    {place.blurb ? ` · ${place.blurb}` : " · no description"}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">
                    {place.rating !== null && place.review_count
                      ? `★ ${place.rating} (${place.review_count})`
                      : "No reviews"}
                  </span>
                  {place.destinations && (
                    <Link
                      href={`/destinations/${place.destinations.slug}/${place.slug}`}
                      className="rounded-full border border-border px-3 py-1.5 text-xs hover:bg-muted"
                    >
                      View
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
