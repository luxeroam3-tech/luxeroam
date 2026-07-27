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

export type PlacePhoto = {
  url: string;
  alt: string | null;
  photographer_name: string | null;
  photographer_url: string | null;
};

export type Place = {
  slug: string;
  name: string;
  blurb: string | null;
  package_types: string[];
  place_photos: PlacePhoto[];
};

export async function getPlaces(regionSlug: string): Promise<Place[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("destinations")
    .select(
      "places(slug, name, blurb, package_types, sort_order, place_photos(url, alt, photographer_name, photographer_url, sort_order))",
    )
    .eq("slug", regionSlug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return [];

  const places = (data.places ?? []) as (Place & { sort_order: number })[];
  return places.slice().sort((a, b) => a.sort_order - b.sort_order);
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
