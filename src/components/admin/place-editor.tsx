"use client";

import { useActionState, useState, useTransition } from "react";
import Image from "next/image";
import { photoSrc } from "@/lib/photo-url";
import { Search, Star, Trash2, X, Upload } from "lucide-react";
import { updatePlace } from "@/app/actions/admin";
import { AvailabilityEditor } from "@/components/admin/availability-editor";
import type { Availability } from "@/lib/data";
import {
  searchUnsplash,
  attachPhoto,
  removePhoto,
  makePrimaryPhoto,
  uploadPlacePhoto,
  type UnsplashSearchState,
  type UnsplashResult,
  type UploadState,
} from "@/app/actions/admin-photos";

const INITIAL_SEARCH: UnsplashSearchState = {
  status: "idle",
  message: "",
  results: [],
  remaining: null,
};

const INITIAL_UPLOAD: UploadState = { status: "idle", message: "" };

export type EditablePlace = {
  id: string;
  name: string;
  blurb: string | null;
  price_from: number | null;
  photo_query: string | null;
  photos: { id: string; url: string; photographer_name: string | null }[];
  availability: Availability[];
};

export function PlaceEditor({
  place,
  packageTypes,
  onClose,
}: {
  place: EditablePlace;
  packageTypes: string[];
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [search, searchAction, searching] = useActionState(
    searchUnsplash,
    INITIAL_SEARCH,
  );
  const [upload, uploadAction, uploading] = useActionState(
    uploadPlacePhoto,
    INITIAL_UPLOAD,
  );

  function run(action: () => Promise<{ ok: boolean; message: string }>) {
    startTransition(async () => {
      const result = await action();
      setMessage(result.message);
    });
  }

  function saveDetails(formData: FormData) {
    const price = String(formData.get("price_from") ?? "").trim();
    run(() =>
      updatePlace(place.id, {
        blurb: String(formData.get("blurb") ?? "").trim(),
        price_from: price ? Number(price) : null,
      }),
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <div className="flex h-full w-full max-w-xl flex-col overflow-y-auto bg-white">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold">{place.name}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-9 items-center justify-center rounded-full hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex flex-col gap-8 px-6 py-6">
          <form action={saveDetails} className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold">Details</h3>

            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Description
              <textarea
                name="blurb"
                rows={3}
                defaultValue={place.blurb ?? ""}
                className="resize-y rounded-lg border border-border px-3 py-2 text-sm font-normal outline-none focus:border-foreground"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Price from (USD, per person)
              <input
                name="price_from"
                type="number"
                min={0}
                step={50}
                defaultValue={place.price_from ?? ""}
                placeholder="Leave blank to use the region price"
                className="rounded-lg border border-border px-3 py-2 text-sm font-normal outline-none focus:border-foreground"
              />
              <span className="text-xs font-normal text-muted-foreground">
                Overrides the cheapest package price for the region.
              </span>
            </label>

            <button
              type="submit"
              disabled={pending}
              className="w-fit rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80 disabled:opacity-50"
            >
              {pending ? "Saving…" : "Save details"}
            </button>
          </form>

          <section className="flex flex-col gap-4 border-t border-border pt-6">
            <h3 className="text-sm font-semibold">
              Photos ({place.photos.length})
            </h3>

            {place.photos.length > 0 && (
              <ul className="grid grid-cols-3 gap-3">
                {place.photos.map((photo, index) => (
                  <li key={photo.id} className="flex flex-col gap-1">
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={photoSrc(photo.url, { w: 200, h: 200, q: 70 })}
                        alt=""
                        fill
                        sizes="120px"
                        className="object-cover"
                      />
                      {index === 0 && (
                        <span className="absolute left-1 top-1 rounded bg-foreground px-1.5 py-0.5 text-[10px] text-background">
                          Primary
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      {index !== 0 && (
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() =>
                            run(() => makePrimaryPhoto(place.id, photo.id))
                          }
                          className="rounded p-1 hover:bg-muted disabled:opacity-50"
                          aria-label="Make primary"
                        >
                          <Star className="size-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => run(() => removePhoto(photo.id))}
                        className="ml-auto rounded p-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
                        aria-label="Remove photo"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <form
              action={uploadAction}
              className="flex flex-col gap-2 rounded-lg border border-dashed border-border p-3"
            >
              <input type="hidden" name="place_id" value={place.id} />
              <span className="text-xs font-medium">
                Upload from this device
              </span>
              <input
                type="file"
                name="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                required
                className="text-xs file:mr-3 file:rounded-full file:border file:border-border file:bg-transparent file:px-3 file:py-1.5 file:text-xs file:font-medium"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  name="alt"
                  placeholder="Alt text (accessibility)"
                  className="rounded-lg border border-border px-3 py-2 text-xs outline-none focus:border-foreground"
                />
                <input
                  name="credit"
                  placeholder="Credit (optional)"
                  className="rounded-lg border border-border px-3 py-2 text-xs outline-none focus:border-foreground"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex w-fit items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
                >
                  <Upload className="size-4" />
                  {uploading ? "Uploading…" : "Upload"}
                </button>
                <span className="text-xs text-muted-foreground">
                  JPEG, PNG, WebP or AVIF · up to 10MB
                </span>
              </div>
              {upload.message && (
                <span
                  className={`text-xs ${upload.status === "error" ? "text-red-600" : "text-muted-foreground"}`}
                >
                  {upload.message}
                </span>
              )}
            </form>

            <form action={searchAction} className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  name="query"
                  defaultValue={place.photo_query ?? place.name}
                  placeholder="Search Unsplash"
                  className="flex-1 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-foreground"
                />
                <button
                  type="submit"
                  disabled={searching}
                  className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
                >
                  <Search className="size-4" />
                  {searching ? "Searching…" : "Search"}
                </button>
              </div>
              {search.remaining !== null && (
                <span className="text-xs text-muted-foreground">
                  {search.remaining} Unsplash requests left this hour
                </span>
              )}
              {search.message && (
                <span
                  className={`text-xs ${search.status === "error" ? "text-red-600" : "text-muted-foreground"}`}
                >
                  {search.message}
                </span>
              )}
            </form>

            {search.results.length > 0 && (
              <ul className="grid grid-cols-3 gap-3">
                {search.results.map((result: UnsplashResult) => (
                  <li key={result.id}>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => run(() => attachPhoto(place.id, result))}
                      className="group flex w-full flex-col gap-1 text-left disabled:opacity-50"
                    >
                      <span className="relative block aspect-square overflow-hidden rounded-lg bg-muted">
                        <Image
                          src={result.thumb}
                          alt={result.alt}
                          fill
                          sizes="120px"
                          unoptimized
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      </span>
                      <span className="truncate text-[10px] text-muted-foreground">
                        {result.photographerName}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <AvailabilityEditor
            placeId={place.id}
            windows={place.availability}
            packageTypes={packageTypes}
          />

          {message && (
            <p className="text-sm text-muted-foreground">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
