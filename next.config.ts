import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Place photos are hotlinked from Unsplash's CDN, which their API
    // guidelines prefer over rehosting.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // Photos uploaded from a device live in Supabase storage.
      { protocol: "https", hostname: "bnjwaohsiuubhzskgtqp.supabase.co" },
    ],
  },
};

export default nextConfig;
