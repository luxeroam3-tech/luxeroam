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
