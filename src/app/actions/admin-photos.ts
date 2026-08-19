"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";
import { recordAudit } from "@/lib/admin/audit";

export type UnsplashResult = {
  id: string;
  url: string;
  thumb: string;
  alt: string;
  photographerName: string;
  photographerUrl: string;
  downloadLocation: string;
};

export type UnsplashSearchState = {
  status: "idle" | "ok" | "error";
  message: string;
  results: UnsplashResult[];
  remaining: string | null;
};

/**
 * Searches Unsplash from the server so the access key never reaches the
 * browser. The remaining-quota header is surfaced because the demo tier only
 * allows 50 requests an hour and silent exhaustion is confusing.
 */
export async function searchUnsplash(
  _prev: UnsplashSearchState,
  formData: FormData,
): Promise<UnsplashSearchState> {
  await requireAdmin();

  const query = String(formData.get("query") ?? "").trim();
  if (!query) {
    return { status: "idle", message: "", results: [], remaining: null };
  }

  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) {
    return {
      status: "error",
      message: "UNSPLASH_ACCESS_KEY is not set on this environment.",
      results: [],
      remaining: null,
    };
  }

  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=12&orientation=landscape&content_filter=high`,
    {
      headers: { Authorization: `Client-ID ${key}`, "Accept-Version": "v1" },
      cache: "no-store",
    },
  );

  const remaining = res.headers.get("x-ratelimit-remaining");

  if (res.status === 403) {
    return {
      status: "error",
      message: "Unsplash hourly quota reached. Try again later.",
      results: [],
      remaining,
    };
  }
  if (!res.ok) {
    return {
      status: "error",
      message: `Unsplash returned ${res.status}.`,
      results: [],
      remaining,
    };
  }

  const data = await res.json();
  const results: UnsplashResult[] = (data.results ?? []).map(
    (photo: {
      id: string;
      urls: { raw: string; thumb: string };
      alt_description: string | null;
      user: { name: string; links: { html: string } };
      links: { download_location: string };
    }) => ({
      id: photo.id,
      url: photo.urls.raw,
      thumb: photo.urls.thumb,
      alt: photo.alt_description ?? query,
      photographerName: photo.user.name,
      photographerUrl: photo.user.links.html,
      downloadLocation: photo.links.download_location,
    }),
  );

  return {
    status: "ok",
    message: results.length === 0 ? `Nothing found for "${query}".` : "",
    results,
    remaining,
  };
}

export async function attachPhoto(placeId: string, photo: UnsplashResult) {
  await requireAdmin();

  const key = process.env.UNSPLASH_ACCESS_KEY;
  // Unsplash's API guidelines require pinging download_location whenever a
  // photo is actually used, not just previewed.
  if (key && photo.downloadLocation) {
    try {
      await fetch(photo.downloadLocation, {
        headers: { Authorization: `Client-ID ${key}` },
        cache: "no-store",
      });
    } catch {
      // The credit still records correctly if this ping fails; don't block.
    }
  }

  const supabase = await createClient();
  const { error } = await supabase.from("place_photos").insert({
    place_id: placeId,
    url: photo.url,
    alt: photo.alt,
    photographer_name: photo.photographerName,
    photographer_url: photo.photographerUrl,
    source: "unsplash",
    source_id: photo.id,
    sort_order: 0,
  });

  if (error) return { ok: false, message: error.message };

  revalidatePath("/admin/places");
  revalidatePath("/", "layout");
  return { ok: true, message: "Photo added." };
}

export async function removePhoto(photoId: string) {
  await requireAdmin();

  const supabase = await createClient();

  // Uploaded photos own a file in storage; deleting only the row would leave
  // it orphaned and still counting against the project's storage quota.
  const { data: existing } = await supabase
    .from("place_photos")
    .select("source, source_id")
    .eq("id", photoId)
    .maybeSingle();

  const { error } = await supabase
    .from("place_photos")
    .delete()
    .eq("id", photoId);

  if (error) return { ok: false, message: error.message };

  if (existing?.source === "upload" && existing.source_id) {
    await supabase.storage.from("place-photos").remove([existing.source_id]);
  }

  revalidatePath("/admin/places");
  revalidatePath("/", "layout");
  return { ok: true, message: "Photo removed." };
}

/**
 * The card and gallery both read the lowest sort_order first, so promoting a
 * photo is a matter of pushing everything else down.
 */
export async function makePrimaryPhoto(placeId: string, photoId: string) {
  await requireAdmin();

  const supabase = await createClient();
  const { data: photos, error: readError } = await supabase
    .from("place_photos")
    .select("id")
    .eq("place_id", placeId);

  if (readError) return { ok: false, message: readError.message };

  for (const [index, photo] of (photos ?? []).entries()) {
    await supabase
      .from("place_photos")
      .update({ sort_order: photo.id === photoId ? 0 : index + 1 })
      .eq("id", photo.id);
  }

  revalidatePath("/admin/places");
  revalidatePath("/", "layout");
  return { ok: true, message: "Primary photo updated." };
}

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export type UploadState = { status: "idle" | "ok" | "error"; message: string };

/**
 * Uploads a photo from the admin's device into Supabase storage and records it
 * against the place. Validated here as well as in the bucket config, so a bad
 * file gets a readable message rather than a storage error.
 */
export async function uploadPlacePhoto(
  _prev: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const admin = await requireAdmin();

  const placeId = String(formData.get("place_id") ?? "");
  const file = formData.get("file");
  const alt = String(formData.get("alt") ?? "").trim();
  const credit = String(formData.get("credit") ?? "").trim();

  if (!placeId) return { status: "error", message: "Missing place." };
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Choose an image first." };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      status: "error",
      message: "Use a JPEG, PNG, WebP or AVIF image.",
    };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      status: "error",
      message: `That file is ${(file.size / 1024 / 1024).toFixed(1)}MB. The limit is 10MB.`,
    };
  }

  const supabase = await createClient();
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${placeId}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("place-photos")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return {
      status: "error",
      message: `Upload failed: ${uploadError.message}`,
    };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("place-photos").getPublicUrl(path);

  const { error } = await supabase.from("place_photos").insert({
    place_id: placeId,
    url: publicUrl,
    alt: alt || null,
    photographer_name: credit || null,
    photographer_url: null,
    source: "upload",
    source_id: path,
    sort_order: 0,
  });

  if (error) {
    // Don't leave an orphaned file behind if the row fails to insert.
    await supabase.storage.from("place-photos").remove([path]);
    return { status: "error", message: error.message };
  }

  await recordAudit({
    actorEmail: admin.email,
    action: "photo.uploaded",
    entity: "place",
    entityId: placeId,
    detail: { path, size: file.size },
  });

  revalidatePath("/admin/places");
  revalidatePath("/", "layout");
  return { status: "ok", message: "Photo uploaded." };
}
