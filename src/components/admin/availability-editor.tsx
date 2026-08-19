"use client";

import { useActionState, useState, useTransition } from "react";
import { CalendarPlus, Trash2 } from "lucide-react";
import {
  addAvailability,
  removeAvailability,
  type AvailabilityState,
} from "@/app/actions/admin-availability";
import type { Availability } from "@/lib/data";

const INITIAL: AvailabilityState = { status: "idle", message: "" };

function formatRange(from: string, to: string) {
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
  };
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  const year =
    start.getFullYear() === end.getFullYear() ? ` ${end.getFullYear()}` : "";
  return `${start.toLocaleDateString(undefined, options)} – ${end.toLocaleDateString(undefined, options)}${year}`;
}

export function AvailabilityEditor({
  placeId,
  windows,
  packageTypes,
}: {
  placeId: string;
  windows: Availability[];
  packageTypes: string[];
}) {
  const [state, formAction, adding] = useActionState(addAvailability, INITIAL);
  const [pending, startTransition] = useTransition();
  const [removed, setRemoved] = useState<string[]>([]);

  const visible = windows.filter((w) => !removed.includes(w.id));

  return (
    <section className="flex flex-col gap-4 border-t border-border pt-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold">Availability</h3>
        <p className="text-xs text-muted-foreground">
          Dates this place is bookable. A search overlapping any window will
          return it, and the windows show on the destination page.
        </p>
      </div>

      {visible.length > 0 && (
        <ul className="flex flex-col gap-2">
          {visible.map((window) => (
            <li
              key={window.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm"
            >
              <div className="flex flex-col">
                <span className="font-medium">
                  {formatRange(window.starts_on, window.ends_on)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {window.trip_type ?? "All trip types"}
                  {window.seats ? ` · ${window.seats} seats` : ""}
                  {window.note ? ` · ${window.note}` : ""}
                </span>
              </div>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const result = await removeAvailability(window.id);
                    if (result.ok) setRemoved((prev) => [...prev, window.id]);
                  })
                }
                aria-label="Remove window"
                className="rounded p-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="place_id" value={placeId} />

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5 text-xs font-medium">
            From
            <input
              name="starts_on"
              type="date"
              required
              className="rounded-lg border border-border px-3 py-2 text-sm font-normal outline-none focus:border-foreground"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-medium">
            To
            <input
              name="ends_on"
              type="date"
              required
              className="rounded-lg border border-border px-3 py-2 text-sm font-normal outline-none focus:border-foreground"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-medium">
            Trip type
            <select
              name="trip_type"
              className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm font-normal outline-none focus:border-foreground"
            >
              <option value="">All</option>
              {packageTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-medium">
            Seats (optional)
            <input
              name="seats"
              type="number"
              min={1}
              className="rounded-lg border border-border px-3 py-2 text-sm font-normal outline-none focus:border-foreground"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1.5 text-xs font-medium">
          Note (optional)
          <input
            name="note"
            placeholder="e.g. Migration season departure"
            className="rounded-lg border border-border px-3 py-2 text-sm font-normal outline-none focus:border-foreground"
          />
        </label>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={adding}
            className="flex w-fit items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
          >
            <CalendarPlus className="size-4" />
            {adding ? "Adding…" : "Add window"}
          </button>
          {state.message && (
            <span
              className={`text-xs ${state.status === "error" ? "text-red-600" : "text-muted-foreground"}`}
            >
              {state.message}
            </span>
          )}
        </div>
      </form>
    </section>
  );
}
