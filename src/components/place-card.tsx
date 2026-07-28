import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Price } from "@/components/price";
import type { Place } from "@/lib/data";

/**
 * Deterministic hue per place so the fallback art is stable across renders
 * rather than flickering between reloads.
 */
function hueFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++)
    hash = (hash * 31 + seed.charCodeAt(i)) % 360;
  return hash;
}

/** Stands in for photography that hasn't been sourced yet. */
function PhotoFallback({ name }: { name: string }) {
  const hue = hueFor(name);
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <svg
      viewBox="0 0 400 400"
      role="img"
      aria-label={name}
      className="size-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`g-${hue}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={`hsl(${hue} 45% 82%)`} />
          <stop offset="100%" stopColor={`hsl(${(hue + 40) % 360} 40% 66%)`} />
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill={`url(#g-${hue})`} />
      <path
        d="M0 300 L110 210 L190 275 L280 190 L400 290 L400 400 L0 400 Z"
        fill="rgba(255,255,255,0.28)"
      />
      <circle cx="312" cy="96" r="38" fill="rgba(255,255,255,0.45)" />
      <text
        x="50%"
        y="52%"
        textAnchor="middle"
        fontSize="96"
        fontWeight="600"
        fill="rgba(255,255,255,0.85)"
        fontFamily="system-ui, sans-serif"
      >
        {initials}
      </text>
    </svg>
  );
}

export function PlaceCard({ place }: { place: Place }) {
  const photo = place.place_photos?.[0];
  const href = `/destinations/${place.region_slug}/${place.slug}`;

  return (
    <Link href={href} className="group flex w-full flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
        {photo ? (
          <Image
            src={`${photo.url}&w=600&h=600&q=75&fm=jpg&fit=crop`}
            alt={photo.alt ?? place.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <PhotoFallback name={place.name} />
        )}

        {photo?.photographer_name && (
          <span className="absolute bottom-1.5 right-2 text-[10px] leading-none text-white/70 [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">
            {photo.photographer_name}/Unsplash
          </span>
        )}
      </div>

      <div className="flex flex-col gap-0.5">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="truncate text-sm font-semibold">{place.name}</h3>
          {place.rating !== null && (
            <span className="flex shrink-0 items-center gap-1 text-sm">
              <Star className="size-3.5 fill-foreground" />
              {place.rating}
              {place.review_count !== null && (
                <span className="text-muted-foreground">
                  ({place.review_count})
                </span>
              )}
            </span>
          )}
        </div>

        <p className="text-sm text-muted-foreground">{place.region}</p>

        {place.blurb && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {place.blurb}
          </p>
        )}

        {place.price_from !== null && (
          <p className="pt-0.5 text-sm">
            <span className="text-muted-foreground">From</span>{" "}
            <span className="font-semibold">
              <Price amount={place.price_from} />
            </span>{" "}
            <span className="text-muted-foreground">per person</span>
          </p>
        )}
      </div>
    </Link>
  );
}
