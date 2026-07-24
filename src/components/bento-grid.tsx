import Image from "next/image";

export function BentoGrid() {
  return (
    <section className="px-6 py-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <BentoCell
          image="/destinations/amboseli.jpg"
          eyebrow="Destination"
          title="Amboseli"
          description="Watch elephants roam beneath Kilimanjaro's snowcap."
          className="sm:col-span-2 lg:col-span-2"
        />
        <BentoCell
          image="/destinations/santorini.jpg"
          eyebrow="Beyond Kenya"
          title="Santorini"
          description="Whitewashed cliffs over the Aegean, curated for Luxe Roam travelers."
        />
        <BentoCell
          image="/destinations/mauritius.jpg"
          eyebrow="Stay"
          title="Mauritius"
          description="Private thatched villas set around still lagoon pools."
        />
        <BentoCell
          eyebrow="Luxe Roam"
          title="Who we are"
          description="Kenya-based, building tours and stays for travelers who expect more."
          className="flex flex-col items-start justify-center bg-muted text-foreground"
          isText
        />
      </div>
    </section>
  );
}

function BentoCell({
  image,
  eyebrow,
  title,
  description,
  className = "",
  isText = false,
}: {
  image?: string;
  eyebrow: string;
  title: string;
  description: string;
  className?: string;
  isText?: boolean;
}) {
  if (isText) {
    return (
      <div className={`rounded-2xl p-6 ${className}`}>
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {eyebrow}
        </div>
        <div className="mt-1 text-lg font-semibold">{title}</div>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
    );
  }

  return (
    <div
      className={`relative flex min-h-64 flex-col justify-end overflow-hidden rounded-2xl p-6 ${className}`}
    >
      <Image src={image!} alt={title} fill className="object-cover" />
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 text-white">
        <div className="text-xs font-semibold uppercase tracking-wide text-white/80">
          {eyebrow}
        </div>
        <div className="mt-1 text-lg font-semibold">{title}</div>
        <p className="mt-2 text-sm text-white/80">{description}</p>
      </div>
    </div>
  );
}
