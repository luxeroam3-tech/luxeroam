import Link from "next/link";
import { Eye, SearchX, Search, TrendingUp } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Analytics" };

const RANGES = [
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
];

type PageProps = { searchParams: Promise<{ days?: string }> };

type EventRow = {
  event_type: string;
  place_slug: string | null;
  region_slug: string | null;
  query: string | null;
  result_count: number | null;
};

function tally(values: (string | null)[]) {
  const counts = new Map<string, number>();
  for (const value of values) {
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

export default async function AdminAnalyticsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { days = "30" } = await searchParams;
  const window = RANGES.some((r) => r.value === days) ? days : "30";

  const since = new Date();
  since.setDate(since.getDate() - Number(window));

  const supabase = await createClient();
  const { data } = await supabase
    .from("analytics_events")
    .select("event_type, place_slug, region_slug, query, result_count")
    .gte("created_at", since.toISOString())
    .limit(5000);

  const events = (data ?? []) as EventRow[];
  const searches = events.filter((e) => e.event_type === "search");

  const topPlaces = tally(
    events
      .filter((e) => e.event_type === "place_view")
      .map((e) => e.place_slug),
  ).slice(0, 10);

  const topRegions = tally(
    events
      .filter((e) => e.event_type === "region_view")
      .map((e) => e.region_slug),
  ).slice(0, 10);

  const topSearches = tally(searches.map((e) => e.query)).slice(0, 10);

  // The most actionable list here: terms people searched that returned
  // nothing, which is demand the catalog does not cover yet.
  const emptySearches = tally(
    searches.filter((e) => (e.result_count ?? 0) === 0).map((e) => e.query),
  ).slice(0, 10);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            What visitors are looking at and searching for. No personal data is
            recorded.
          </p>
        </div>
        <div className="flex gap-2">
          {RANGES.map((range) => (
            <Link
              key={range.value}
              href={`/admin/analytics?days=${range.value}`}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                window === range.value
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:bg-muted"
              }`}
            >
              {range.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          icon={Eye}
          label="Place views"
          value={events.filter((e) => e.event_type === "place_view").length}
        />
        <Stat
          icon={TrendingUp}
          label="Region views"
          value={events.filter((e) => e.event_type === "region_view").length}
        />
        <Stat icon={Search} label="Searches" value={searches.length} />
        <Stat
          icon={SearchX}
          label="No results"
          value={searches.filter((e) => (e.result_count ?? 0) === 0).length}
        />
      </div>

      {events.length === 0 ? (
        <p className="rounded-2xl border border-border p-6 text-sm text-muted-foreground">
          No activity recorded in this window yet. Views and searches on the
          public site will appear here.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Chart title="Most viewed places" rows={topPlaces} />
          <Chart title="Most viewed regions" rows={topRegions} />
          <Chart title="Top searches" rows={topSearches} />
          <Chart
            title="Searches with no results"
            rows={emptySearches}
            hint="Demand the catalog doesn't cover yet."
            emphasis
          />
        </div>
      )}
    </main>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Eye;
  label: string;
  value: number;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-border p-5">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </span>
      <span className="text-2xl font-semibold">{value}</span>
    </div>
  );
}

function Chart({
  title,
  rows,
  hint,
  emphasis = false,
}: {
  title: string;
  rows: [string, number][];
  hint?: string;
  emphasis?: boolean;
}) {
  const max = rows[0]?.[1] ?? 1;

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border p-5">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-sm font-semibold">{title}</h2>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map(([label, count]) => (
            <li key={label} className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate">{label}</span>
                <span className="shrink-0 text-muted-foreground">{count}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${emphasis ? "bg-red-500" : "bg-foreground"}`}
                  style={{ width: `${Math.max(4, (count / max) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
