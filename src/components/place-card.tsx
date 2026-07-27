import Image from "next/image";
import { SkeletonCard } from "@/components/skeleton-card";
import type { Place } from "@/lib/data";

/**
 * A single place inside a region. Falls back to the skeleton while a place is
 * still waiting on photography, so a half-filled region still reads as one grid.
 */
export function PlaceCard({ place }: { place: Place }) {
  const photo = place.place_photos?.[0];

  if (!photo) return <SkeletonCard />;

  return (
    <article className="flex w-full flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
        <Image
          // Ask Unsplash's CDN for a square crop at roughly the rendered size,
          // so the optimizer has a small file to re-encode rather than the
          // full-resolution original.
          src={`${photo.url}&w=600&h=600&q=75&fm=jpg&fit=crop`}
          alt={photo.alt ?? place.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <div className="flex flex-col gap-0.5">
        <h3 className="text-sm font-semibold">{place.name}</h3>
        {place.blurb && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {place.blurb}
          </p>
        )}
        {photo.photographer_name && (
          <p className="text-xs text-muted-foreground/70">
            Photo:{" "}
            <a
              href={`${photo.photographer_url}?utm_source=luxe_roam&utm_medium=referral`}
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              {photo.photographer_name}
            </a>{" "}
            on{" "}
            <a
              href="https://unsplash.com/?utm_source=luxe_roam&utm_medium=referral"
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              Unsplash
            </a>
          </p>
        )}
      </div>
    </article>
  );
}
