import type { MetadataRoute } from "next";
import { getAllPlaces, getDestinations } from "@/lib/data";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://luxeroam.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, priority: 1 },
    { url: `${SITE_URL}/honeymoon`, lastModified: now, priority: 0.9 },
    { url: `${SITE_URL}/family`, lastModified: now, priority: 0.9 },
    // /search is intentionally absent: robots.txt disallows it, and listing a
    // disallowed URL in the sitemap is a contradictory crawl signal.
    { url: `${SITE_URL}/about`, lastModified: now, priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: now, priority: 0.7 },
  ];

  // A paused or unreachable database must not fail the whole sitemap; serving
  // the static routes is better than serving a 500 to a crawler.
  try {
    const [regions, places] = await Promise.all([
      getDestinations(),
      getAllPlaces(),
    ]);

    return [
      ...staticRoutes,
      ...regions.map((region) => ({
        url: `${SITE_URL}/destinations/${region.slug}`,
        lastModified: now,
        priority: 0.8,
      })),
      ...places.map((place) => ({
        url: `${SITE_URL}/destinations/${place.region_slug}/${place.slug}`,
        lastModified: now,
        priority: 0.7,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
