import Image from "next/image";
import { Grid3x3 } from "lucide-react";

/**
 * Airbnb-style 1-large + 4-small mosaic. Only three photos exist so far, so any
 * remaining tiles render as skeletons rather than repeating the same shot.
 */
const PHOTOS = [
  "/destinations/amboseli.jpg",
  "/destinations/santorini.jpg",
  "/destinations/mauritius.jpg",
];

export function Gallery({ alt }: { alt: string }) {
  const tiles = Array.from({ length: 5 }, (_, i) => PHOTOS[i] ?? null);
  const [hero, ...rest] = tiles;

  return (
    <div className="relative">
      <div className="grid gap-2 overflow-hidden rounded-2xl sm:grid-cols-2 sm:gap-2">
        <Tile src={hero} alt={alt} priority className="sm:aspect-auto" />
        <div className="hidden grid-cols-2 gap-2 sm:grid">
          {rest.map((src, i) => (
            <Tile key={i} src={src} alt="" />
          ))}
        </div>
      </div>

      <button
        type="button"
        className="absolute bottom-4 right-4 hidden items-center gap-2 rounded-lg border border-foreground/20 bg-white px-3 py-2 text-sm font-medium shadow-sm hover:bg-muted sm:flex"
      >
        <Grid3x3 className="size-4" />
        Show all photos
      </button>
    </div>
  );
}

function Tile({
  src,
  alt,
  priority = false,
  className = "",
}: {
  src: string | null;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        className={`aspect-[4/3] w-full animate-pulse bg-muted ${className}`}
      />
    );
  }

  return (
    <div
      className={`relative aspect-[4/3] w-full overflow-hidden ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 640px) 100vw, 50vw"
        className="object-cover"
      />
    </div>
  );
}
