import Image from "next/image";
import { photoSrc } from "@/lib/photo-url";
import { Grid3x3 } from "lucide-react";
import type { PlacePhoto } from "@/lib/data";

/**
 * Airbnb-style 1-large + 4-small mosaic, built only from this place's own
 * photos. Empty tiles render as generated art rather than borrowing another
 * place's photograph, which previously put Santorini on the Kenya page.
 */
export function PlaceGallery({
  photos,
  name,
}: {
  photos: PlacePhoto[];
  name: string;
}) {
  const hero = photos[0];
  const rest = Array.from({ length: 4 }, (_, i) => photos[i + 1] ?? null);
  const credit = hero?.photographer_name ? hero : null;

  return (
    <div className="relative">
      <div className="grid gap-2 overflow-hidden rounded-2xl sm:grid-cols-2">
        <Tile photo={hero} name={name} priority seed={name} />
        <div className="hidden grid-cols-2 gap-2 sm:grid">
          {rest.map((photo, i) => (
            <Tile key={i} photo={photo} name={name} seed={`${name}-${i}`} />
          ))}
        </div>
      </div>

      {photos.length > 1 && (
        <button
          type="button"
          className="absolute bottom-4 right-4 hidden items-center gap-2 rounded-lg border border-foreground/20 bg-white px-3 py-2 text-sm font-medium shadow-sm hover:bg-muted sm:flex"
        >
          <Grid3x3 className="size-4" />
          Show all {photos.length} photos
        </button>
      )}

      {credit && (
        <p className="pt-2 text-xs text-muted-foreground">
          Photo:{" "}
          <a
            href={`${credit.photographer_url}?utm_source=luxe_roam&utm_medium=referral`}
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
          >
            {credit.photographer_name}
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
  );
}

function hueFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++)
    hash = (hash * 31 + seed.charCodeAt(i)) % 360;
  return hash;
}

function Tile({
  photo,
  name,
  seed,
  priority = false,
}: {
  photo: PlacePhoto | null;
  name: string;
  seed: string;
  priority?: boolean;
}) {
  if (!photo) {
    const hue = hueFor(seed);
    return (
      <div
        className="aspect-[4/3] w-full"
        style={{
          background: `linear-gradient(135deg, hsl(${hue} 40% 88%), hsl(${(hue + 40) % 360} 35% 76%))`,
        }}
      />
    );
  }

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden">
      <Image
        src={photoSrc(photo.url, { w: 1200, h: 900, q: 80 })}
        alt={photo.alt ?? name}
        fill
        priority={priority}
        sizes="(max-width: 640px) 100vw, 50vw"
        className="object-cover"
      />
    </div>
  );
}
