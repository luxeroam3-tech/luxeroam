/**
 * Backfills stock photography for places that have none yet.
 *
 * Unsplash's demo tier allows 50 requests/hour and each place costs two (one
 * search, one download trigger that their API guidelines require whenever a
 * photo is used), so this runs in resumable batches: it skips places that
 * already have a photo and stops cleanly when the quota is hit.
 *
 * Writes SQL to scripts/out/place-photos.sql rather than inserting directly,
 * because the anon key is read-only under RLS.
 *
 *   node scripts/fetch-unsplash.mjs [--limit 20]
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  const env = {};
  const raw = readFileSync(join(root, ".env.local"), "utf8");
  for (const line of raw.split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match) env[match[1]] = match[2].trim();
  }
  return env;
}

const env = loadEnv();
const UNSPLASH_KEY = env.UNSPLASH_ACCESS_KEY;
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!UNSPLASH_KEY) throw new Error("UNSPLASH_ACCESS_KEY missing from .env.local");

const limitArg = process.argv.indexOf("--limit");
const LIMIT = limitArg > -1 ? Number(process.argv[limitArg + 1]) : 20;

const sqlEscape = (value) =>
  value === null || value === undefined ? "null" : `'${String(value).replace(/'/g, "''")}'`;

async function supabase(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  return res.json();
}

async function unsplash(url) {
  const res = await fetch(url, {
    headers: {
      Authorization: `Client-ID ${UNSPLASH_KEY}`,
      "Accept-Version": "v1",
    },
  });
  if (res.status === 403) {
    const remaining = res.headers.get("x-ratelimit-remaining");
    throw Object.assign(new Error(`rate limited (remaining: ${remaining})`), {
      rateLimited: true,
    });
  }
  if (!res.ok) throw new Error(`Unsplash ${res.status}: ${await res.text()}`);
  return res.json();
}

const places = await supabase(
  "places?select=id,slug,name,photo_query,place_photos(id)&order=sort_order",
);
const pending = places.filter((place) => place.place_photos.length === 0);

console.log(`${places.length} places, ${pending.length} without photos`);

const statements = [];
let used = 0;

for (const place of pending.slice(0, LIMIT)) {
  const query = place.photo_query || place.name;
  try {
    const search = await unsplash(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape&content_filter=high`,
    );
    const photo = search.results?.[0];
    if (!photo) {
      console.log(`  no result: ${place.name}`);
      continue;
    }

    // Required by the Unsplash API guidelines whenever a photo is used.
    await unsplash(photo.links.download_location);
    used += 2;

    statements.push(
      `insert into place_photos (place_id, url, alt, photographer_name, photographer_url, source, source_id, sort_order) values (${sqlEscape(place.id)}, ${sqlEscape(photo.urls.raw)}, ${sqlEscape(photo.alt_description || place.name)}, ${sqlEscape(photo.user.name)}, ${sqlEscape(photo.user.links.html)}, 'unsplash', ${sqlEscape(photo.id)}, 0) on conflict (place_id, source, source_id) do nothing;`,
    );
    console.log(`  ${place.name} -> ${photo.user.name}`);
  } catch (error) {
    if (error.rateLimited) {
      console.log(`\nStopped: ${error.message}. Re-run later to continue.`);
      break;
    }
    throw error;
  }
}

mkdirSync(join(root, "scripts/out"), { recursive: true });
writeFileSync(join(root, "scripts/out/place-photos.sql"), statements.join("\n") + "\n");
console.log(`\n${statements.length} photos, ~${used} API requests used`);
console.log("Wrote scripts/out/place-photos.sql");
