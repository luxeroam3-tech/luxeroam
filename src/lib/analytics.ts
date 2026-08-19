import { after } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Event =
  | { type: "place_view"; placeSlug: string; regionSlug: string }
  | { type: "region_view"; regionSlug: string }
  | { type: "search"; query?: string; tripType?: string; resultCount: number };

/**
 * A plain client rather than the cookie-backed SSR one: Next forbids calling
 * cookies() inside after(), and analytics has no session to carry anyway —
 * record_event is granted to anon and validates its own input.
 */
function analyticsClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

/**
 * Records a usage event without delaying the page. after() runs the callback
 * once the response has been sent, and failures are swallowed: analytics must
 * never be the reason a visitor sees an error.
 */
export function recordEvent(event: Event) {
  after(async () => {
    try {
      await analyticsClient().rpc("record_event", {
        p_event_type: event.type,
        p_place_slug: event.type === "place_view" ? event.placeSlug : null,
        p_region_slug:
          event.type === "place_view" || event.type === "region_view"
            ? event.regionSlug
            : null,
        p_query: event.type === "search" ? (event.query ?? null) : null,
        p_trip_type: event.type === "search" ? (event.tripType ?? null) : null,
        p_result_count: event.type === "search" ? event.resultCount : null,
      });
    } catch (error) {
      console.error("analytics write failed", error);
    }
  });
}
