"use client";

import { useState } from "react";
import Image from "next/image";
import { photoSrc } from "@/lib/photo-url";
import Link from "next/link";
import { ImageOff, Pencil } from "lucide-react";
import { PlaceEditor } from "@/components/admin/place-editor";
import type { AdminPlace } from "@/lib/admin/data";

export function PlacesTable({
  places,
  packageTypes,
}: {
  places: AdminPlace[];
  packageTypes: string[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = places.find((place) => place.id === editingId) ?? null;

  return (
    <>
      <ul className="flex flex-col divide-y divide-border rounded-2xl border border-border">
        {places.map((place) => {
          const photo = place.place_photos[0];
          return (
            <li
              key={place.id}
              className="flex flex-wrap items-center gap-4 p-4"
            >
              <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                {photo ? (
                  <Image
                    src={photoSrc(photo.url, { w: 112, h: 112, q: 70 })}
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

              <div className="flex items-center gap-3 text-sm">
                <span className="text-xs text-muted-foreground">
                  {place.place_photos.length} photo
                  {place.place_photos.length === 1 ? "" : "s"}
                </span>
                <span className="text-muted-foreground">
                  {place.rating !== null && place.review_count
                    ? `★ ${place.rating} (${place.review_count})`
                    : "No reviews"}
                </span>
                <button
                  type="button"
                  onClick={() => setEditingId(place.id)}
                  className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                >
                  <Pencil className="size-3.5" />
                  Edit
                </button>
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

      {editing && (
        <PlaceEditor
          place={{
            id: editing.id,
            name: editing.name,
            blurb: editing.blurb,
            price_from: editing.price_from,
            photo_query: editing.photo_query,
            photos: editing.place_photos,
            availability: editing.place_availability,
          }}
          packageTypes={packageTypes}
          onClose={() => setEditingId(null)}
        />
      )}
    </>
  );
}
