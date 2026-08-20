import { createClient } from "@/lib/supabase/server";

export type DestinationSummary = {
  slug: string;
  region: string;
  tagline: string;
};

export async function getDestinations(): Promise<DestinationSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("destinations")
    .select("slug, region, tagline")
    .order("sort_order");

  if (error) throw error;
  return data ?? [];
}

/**
 * Chrome (header nav, trip-type tabs) should not take a page down when the
 * database is unreachable — a paused project would otherwise 500 every route,
 * including the contact page people need when something is wrong.
 */
export async function getDestinationsSafe(): Promise<DestinationSummary[]> {
  try {
    return await getDestinations();
  } catch (error) {
    console.error("getDestinations failed, falling back to empty nav", error);
    return [];
  }
}

const FALLBACK_PACKAGE_TYPES = ["honeymoon", "family"];

export async function getPackageTypesSafe(): Promise<string[]> {
  try {
    return await getPackageTypes();
  } catch (error) {
    console.error("getPackageTypes failed, using defaults", error);
    return FALLBACK_PACKAGE_TYPES;
  }
}

export type PlacePhoto = {
  url: string;
  alt: string | null;
  photographer_name: string | null;
  photographer_url: string | null;
};

export type Availability = {
  id: string;
  starts_on: string;
  ends_on: string;
  trip_type: string | null;
  seats: number | null;
  note: string | null;
};

export type Place = {
  slug: string;
  name: string;
  blurb: string | null;
  package_types: string[];
  rating: number | null;
  review_count: number | null;
  price_from: number | null;
  region: string;
  region_slug: string;
  place_photos: PlacePhoto[];
  place_availability: Availability[];
};

const PLACE_FIELDS =
  "slug, name, blurb, package_types, rating, review_count, price_from, sort_order, place_photos(url, alt, photographer_name, photographer_url, sort_order), place_availability(id, starts_on, ends_on, trip_type, seats, note)";

type RawRegion = {
  slug: string;
  region: string;
  places: (Omit<Place, "region" | "region_slug"> & { sort_order: number })[];
  packages: { price_from: number | null; type: string }[];
};

/** Cheapest package in a region, used when a place has no price of its own. */
function regionPriceFloor(packages: { price_from: number | null }[]) {
  const prices = packages
    .map((p) => (p.price_from === null ? null : Number(p.price_from)))
    .filter((p): p is number => p !== null);
  return prices.length > 0 ? Math.min(...prices) : null;
}

function flatten(region: RawRegion, typeFilter?: string): Place[] {
  const floor = regionPriceFloor(
    typeFilter
      ? region.packages.filter((p) => p.type === typeFilter)
      : region.packages,
  );

  return region.places
    .filter((place) => !typeFilter || place.package_types.includes(typeFilter))
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((place) => ({
      ...place,
      region: region.region,
      region_slug: region.slug,
      price_from: place.price_from === null ? floor : Number(place.price_from),
      place_availability: (place.place_availability ?? [])
        .slice()
        .sort((a, b) => a.starts_on.localeCompare(b.starts_on)),
    }));
}

export async function getPlaces(regionSlug: string): Promise<Place[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("destinations")
    .select(`slug, region, packages(price_from, type), places(${PLACE_FIELDS})`)
    .eq("slug", regionSlug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return [];
  return flatten(data as unknown as RawRegion);
}

/**
 * Places across every region, optionally narrowed to one package type.
 * Places with photography come first so the rows lead with real imagery.
 */
export async function getAllPlaces(typeFilter?: string): Promise<Place[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("destinations")
    .select(`slug, region, packages(price_from, type), places(${PLACE_FIELDS})`)
    .order("sort_order");

  if (error) throw error;

  const places = ((data ?? []) as unknown as RawRegion[]).flatMap((region) =>
    flatten(region, typeFilter),
  );

  return places.sort(
    (a, b) =>
      (b.place_photos.length > 0 ? 1 : 0) - (a.place_photos.length > 0 ? 1 : 0),
  );
}

export type SearchParams = {
  where?: string;
  type?: string;
  from?: string;
  to?: string;
};

/**
 * Date matching.
 *
 * A place with published windows must overlap the requested range. A place with
 * NO published windows is still a match: this is a bespoke operator that plans
 * around the traveller's dates, so an empty schedule means "on request", not
 * "unavailable". Treating it as unavailable hid 70 of 71 places from every
 * date search.
 *
 * Overlap, not containment: 19-30 Aug answers a search for the 22nd-25th and
 * one for the 15th-20th alike.
 */
export function isAvailableBetween(
  place: Place,
  from?: string,
  to?: string,
  tripType?: string,
): boolean {
  if (!from && !to) return true;

  // Windows restricted to another trip type don't count towards this search.
  const windows = (place.place_availability ?? []).filter(
    (window) => !tripType || !window.trip_type || window.trip_type === tripType,
  );
  if (windows.length === 0) return true;

  const start = from || to!;
  const end = to || from!;

  return windows.some(
    (window) => window.starts_on <= end && window.ends_on >= start,
  );
}

/** True when a place has published windows relevant to this trip type. */
export function hasPublishedDates(place: Place, tripType?: string) {
  return (place.place_availability ?? []).some(
    (window) => !tripType || !window.trip_type || window.trip_type === tripType,
  );
}

export async function searchPlaces({
  where,
  type,
  from,
  to,
}: SearchParams): Promise<Place[]> {
  const all = await getAllPlaces(type);
  const term = where?.trim().toLowerCase();

  return all.filter((place) => {
    if (!isAvailableBetween(place, from, to, type)) return false;
    if (!term) return true;
    return [place.name, place.blurb ?? "", place.region]
      .join(" ")
      .toLowerCase()
      .includes(term);
  });
}

export type Suggestion = {
  kind: "region" | "place";
  label: string;
  sublabel: string;
  href: string;
  value: string;
};

/** Typeahead options for the search bar's "Where" field. */
export async function getSuggestions(query: string): Promise<Suggestion[]> {
  const [regions, places] = await Promise.all([
    getDestinations(),
    getAllPlaces(),
  ]);
  const term = query.trim().toLowerCase();

  const regionHits: Suggestion[] = regions
    .filter((r) => !term || r.region.toLowerCase().includes(term))
    .map((r) => ({
      kind: "region" as const,
      label: r.region,
      sublabel: r.tagline,
      href: `/destinations/${r.slug}`,
      value: r.region,
    }));

  const placeHits: Suggestion[] = places
    .filter(
      (p) =>
        !term ||
        p.name.toLowerCase().includes(term) ||
        (p.blurb ?? "").toLowerCase().includes(term),
    )
    .map((p) => ({
      kind: "place" as const,
      label: p.name,
      sublabel: p.region,
      href: `/destinations/${p.region_slug}/${p.slug}`,
      value: p.name,
    }));

  return [...regionHits, ...placeHits].slice(0, 12);
}

export type Review = {
  id: string;
  author_name: string;
  rating: number;
  body: string | null;
  created_at: string;
};

export type PlaceDetail = Place & {
  id: string;
  region_tagline: string;
  reviews: Review[];
};

export async function getPlace(
  regionSlug: string,
  placeSlug: string,
): Promise<PlaceDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("destinations")
    .select(
      `slug, region, tagline, packages(price_from, type),
       places(id, ${PLACE_FIELDS}, reviews(id, author_name, rating, body, created_at, status))`,
    )
    .eq("slug", regionSlug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  type RegionWithReviews = {
    slug: string;
    region: string;
    tagline: string;
    packages: { price_from: number | null; type: string }[];
    places: (Omit<Place, "region" | "region_slug"> & {
      id: string;
      sort_order: number;
      reviews: Review[];
    })[];
  };

  const region = data as unknown as RegionWithReviews;

  const match = region.places.find((place) => place.slug === placeSlug);
  if (!match) return null;

  const [flattened] = flatten({
    slug: region.slug,
    region: region.region,
    packages: region.packages,
    places: [match],
  });

  const reviews: Review[] = (match.reviews ?? [])
    .slice()
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  return {
    ...flattened,
    id: match.id,
    region_tagline: region.tagline,
    reviews,
  };
}

/** Listing data that should degrade to an empty grid rather than a crash. */
export async function getAllPlacesSafe(typeFilter?: string): Promise<Place[]> {
  try {
    return await getAllPlaces(typeFilter);
  } catch (error) {
    console.error("getAllPlaces failed, rendering empty listing", error);
    return [];
  }
}

export type PackageDetail = {
  id: string;
  type: string;
  title: string;
  price_from: number | null;
  summary: string | null;
  about: string | null;
  highlights: string[] | null;
  duration: string | null;
  travel_dates: string | null;
  best_for: string | null;
  accommodation: string | null;
  inclusions: string | null;
  exclusions: string | null;
  price_notes: string | null;
  family_child_price: string | null;
};

export type DestinationDetail = DestinationSummary & {
  packages: PackageDetail[];
};

const PACKAGE_ORDER = ["honeymoon", "family"];

export async function getDestination(
  slug: string,
): Promise<DestinationDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("destinations")
    .select(
      "slug, region, tagline, packages(id, type, title, price_from, summary, about, highlights, duration, travel_dates, best_for, accommodation, inclusions, exclusions, price_notes, family_child_price)",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const packages = ((data.packages ?? []) as PackageDetail[])
    .slice()
    .sort(
      (a, b) => PACKAGE_ORDER.indexOf(a.type) - PACKAGE_ORDER.indexOf(b.type),
    );

  return { ...data, packages };
}

export async function getPackageTypes(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("packages").select("type");

  if (error) throw error;
  const order = ["honeymoon", "family"];
  const types = Array.from(
    new Set((data ?? []).map((row) => row.type)),
  ) as string[];
  return types.sort((a, b) => order.indexOf(a) - order.indexOf(b));
}
