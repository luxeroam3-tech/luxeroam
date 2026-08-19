import { CalendarDays, Users } from "lucide-react";
import type { Availability } from "@/lib/data";

/**
 * Day-first so a same-month range reads "19–30 Aug 2026" rather than the
 * "19 – Aug 30, 2026" a plain locale format produces, where the month appears
 * only on the end date.
 */
function formatRange(from: string, to: string) {
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  const month = (d: Date) =>
    d.toLocaleDateString(undefined, { month: "short" });
  const sameMonth =
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear();

  if (sameMonth) {
    return `${start.getDate()}–${end.getDate()} ${month(end)} ${end.getFullYear()}`;
  }

  const sameYear = start.getFullYear() === end.getFullYear();
  const startPart = `${start.getDate()} ${month(start)}${sameYear ? "" : ` ${start.getFullYear()}`}`;
  return `${startPart} – ${end.getDate()} ${month(end)} ${end.getFullYear()}`;
}

/** Upcoming windows only; past departures are noise on a public page. */
export function AvailabilityList({
  windows,
  placeName,
}: {
  windows: Availability[];
  placeName: string;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = windows.filter((window) => window.ends_on >= today);

  return (
    <section className="flex flex-col gap-4 border-t border-border py-10">
      <h2 className="text-lg font-semibold">When you can go</h2>

      {upcoming.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No dates published for {placeName} yet — tell us when you&apos;d like
          to travel and we&apos;ll plan around you.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {upcoming.map((window) => (
            <li
              key={window.id}
              className="flex items-start gap-3 rounded-2xl border border-border p-4"
            >
              <CalendarDays className="mt-0.5 size-4 shrink-0" />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">
                  {formatRange(window.starts_on, window.ends_on)}
                </span>
                <span className="text-xs capitalize text-muted-foreground">
                  {window.trip_type ?? "Honeymoon & family"}
                </span>
                {window.note && (
                  <span className="text-xs text-muted-foreground">
                    {window.note}
                  </span>
                )}
                {window.seats !== null && (
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="size-3" />
                    {window.seats} seats
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
