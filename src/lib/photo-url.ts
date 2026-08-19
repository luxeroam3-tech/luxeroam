/**
 * Builds a src for a place photo.
 *
 * Unsplash URLs arrive with a query string already attached and support
 * on-the-fly resizing, so the sizing params are appended for them. Uploaded
 * files live in Supabase storage with no query string at all — appending
 * "&w=600" there would produce a malformed URL, so they are returned untouched
 * and left to Next's image optimizer.
 */
export function photoSrc(
  url: string,
  { w, h, q = 75 }: { w: number; h?: number; q?: number },
) {
  if (!url.includes("images.unsplash.com")) return url;

  const params = new URLSearchParams({
    w: String(w),
    q: String(q),
    fm: "jpg",
    fit: "crop",
  });
  if (h) params.set("h", String(h));

  return `${url}${url.includes("?") ? "&" : "?"}${params.toString()}`;
}
