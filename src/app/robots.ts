import type { MetadataRoute } from "next";
import { SITE_URL } from "./sitemap";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Search result pages are infinite permutations of query params; keeping
      // them out of the index avoids crawl budget being spent on duplicates.
      disallow: ["/search", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
