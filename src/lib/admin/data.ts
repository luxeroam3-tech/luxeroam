import { createClient } from "@/lib/supabase/server";

export type AdminReview = {
  id: string;
  author_name: string;
  rating: number;
  body: string | null;
  status: string;
  created_at: string;
  places: {
    name: string;
    slug: string;
    rating: number | null;
    review_count: number | null;
  } | null;
};

export type AdminEnquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  destination_slug: string | null;
  trip_type: string | null;
  travel_dates: string | null;
  party_size: number | null;
  message: string;
  status: string;
  created_at: string;
};

export type AdminPlace = {
  id: string;
  slug: string;
  name: string;
  blurb: string | null;
  rating: number | null;
  review_count: number | null;
  price_from: number | null;
  destinations: { region: string; slug: string } | null;
  place_photos: { id: string }[];
};

export async function getReviews(status?: string): Promise<AdminReview[]> {
  const supabase = await createClient();
  let query = supabase
    .from("reviews")
    .select(
      "id, author_name, rating, body, status, created_at, places(name, slug, rating, review_count)",
    )
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as AdminReview[];
}

export async function getEnquiries(status?: string): Promise<AdminEnquiry[]> {
  const supabase = await createClient();
  let query = supabase
    .from("enquiries")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as AdminEnquiry[];
}

export async function getPlacesForAdmin(): Promise<AdminPlace[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("places")
    .select(
      "id, slug, name, blurb, rating, review_count, price_from, destinations(region, slug), place_photos(id)",
    )
    .order("sort_order");

  if (error) throw error;
  return (data ?? []) as unknown as AdminPlace[];
}

export type AdminStats = {
  regions: number;
  places: number;
  photos: number;
  placesWithoutPhoto: number;
  placesWithoutBlurb: number;
  pendingReviews: number;
  approvedReviews: number;
  newEnquiries: number;
  totalEnquiries: number;
};

export async function getStats(): Promise<AdminStats> {
  const supabase = await createClient();

  // head:true returns only the count, so no rows cross the wire.
  const rows = (table: string) =>
    supabase.from(table).select("*", { count: "exact", head: true });

  const [
    regions,
    places,
    photos,
    pendingReviews,
    approvedReviews,
    newEnquiries,
    totalEnquiries,
    placesWithoutBlurb,
    coverage,
  ] = await Promise.all([
    rows("destinations"),
    rows("places"),
    rows("place_photos"),
    rows("reviews").eq("status", "pending"),
    rows("reviews").eq("status", "approved"),
    rows("enquiries").eq("status", "new"),
    rows("enquiries"),
    rows("places").is("blurb", null),
    // Photo coverage needs the join, so it is derived rather than counted.
    supabase.from("places").select("id, place_photos(id)"),
  ]);

  const placesWithoutPhoto = (
    (coverage.data ?? []) as { place_photos: unknown[] }[]
  ).filter((place) => place.place_photos.length === 0).length;

  return {
    regions: regions.count ?? 0,
    places: places.count ?? 0,
    photos: photos.count ?? 0,
    placesWithoutPhoto,
    placesWithoutBlurb: placesWithoutBlurb.count ?? 0,
    pendingReviews: pendingReviews.count ?? 0,
    approvedReviews: approvedReviews.count ?? 0,
    newEnquiries: newEnquiries.count ?? 0,
    totalEnquiries: totalEnquiries.count ?? 0,
  };
}
