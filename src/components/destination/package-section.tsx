import {
  CalendarDays,
  Check,
  Clock,
  Heart,
  Camera,
  BedDouble,
  Users,
  X,
} from "lucide-react";
import { Price } from "@/components/price";
import type { PackageDetail } from "@/lib/data";

const TYPE_ICON: Record<string, typeof Heart> = {
  honeymoon: Heart,
  family: Camera,
};

/** Splits the comma-separated inclusion/exclusion strings into list items. */
function toList(value: string | null) {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function PackageSection({ pkg }: { pkg: PackageDetail }) {
  const Icon = TYPE_ICON[pkg.type] ?? Heart;
  const inclusions = toList(pkg.inclusions);
  const exclusions = toList(pkg.exclusions);

  return (
    <section
      id={pkg.type}
      className="flex flex-col gap-8 border-t border-border py-10"
    >
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Icon className="size-3.5" />
            {pkg.type}
          </div>
          <h2 className="text-xl font-semibold tracking-tight">{pkg.title}</h2>
          {pkg.summary && (
            <p className="max-w-2xl text-sm text-muted-foreground">
              {pkg.summary}
            </p>
          )}
        </div>
        {pkg.price_from !== null && (
          <div className="text-right">
            <div className="text-xl font-semibold">
              <Price amount={Number(pkg.price_from)} />
            </div>
            <div className="text-xs text-muted-foreground">per person</div>
          </div>
        )}
      </header>

      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Fact icon={Clock} label="Duration" value={pkg.duration} />
        <Fact
          icon={CalendarDays}
          label="Travel dates"
          value={pkg.travel_dates}
        />
        <Fact icon={Users} label="Best for" value={pkg.best_for} />
        <Fact icon={BedDouble} label="Stay" value={pkg.accommodation} />
      </dl>

      {pkg.highlights && pkg.highlights.length > 0 && (
        <div className="flex flex-col gap-4 border-t border-border pt-8">
          <h3 className="text-base font-semibold">Trip highlights</h3>
          <ul className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
            {pkg.highlights.map((highlight) => (
              <li key={highlight} className="flex items-start gap-3 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-foreground" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {pkg.about && (
        <div className="flex flex-col gap-3 border-t border-border pt-8">
          <h3 className="text-base font-semibold">About this trip</h3>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {pkg.about}
          </p>
        </div>
      )}

      {(inclusions.length > 0 || exclusions.length > 0) && (
        <div className="grid grid-cols-1 gap-8 border-t border-border pt-8 sm:grid-cols-2">
          {inclusions.length > 0 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-semibold">What&apos;s included</h3>
              <ul className="flex flex-col gap-3">
                {inclusions.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {exclusions.length > 0 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-semibold">Not included</h3>
              <ul className="flex flex-col gap-3">
                {exclusions.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-muted-foreground"
                  >
                    <X className="mt-0.5 size-4 shrink-0" />
                    <span className="line-through decoration-muted-foreground/40">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {(pkg.price_notes || pkg.family_child_price) && (
        <div className="flex flex-col gap-2 rounded-2xl bg-muted p-5 text-sm">
          {pkg.price_notes && <p>{pkg.price_notes}</p>}
          {pkg.family_child_price && (
            <p className="text-muted-foreground">{pkg.family_child_price}</p>
          )}
        </div>
      )}
    </section>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string | null;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="flex flex-col">
        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </dt>
        <dd className="text-sm">{value}</dd>
      </div>
    </div>
  );
}
