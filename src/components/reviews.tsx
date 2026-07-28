"use client";

import { useActionState, useState } from "react";
import { Star } from "lucide-react";
import { submitReview, type ReviewFormState } from "@/app/actions/reviews";
import type { Review } from "@/lib/data";

const INITIAL: ReviewFormState = { status: "idle", message: "" };

export function Stars({
  value,
  className = "size-4",
}: {
  value: number;
  className?: string;
}) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${className} ${n <= value ? "fill-foreground" : "text-muted-foreground/40"}`}
        />
      ))}
    </span>
  );
}

export function ReviewsSection({
  placeId,
  placeName,
  rating,
  reviewCount,
  reviews,
  path,
}: {
  placeId: string;
  placeName: string;
  rating: number | null;
  reviewCount: number | null;
  reviews: Review[];
  path: string;
}) {
  const [state, formAction, pending] = useActionState(submitReview, INITIAL);
  const [selected, setSelected] = useState(0);

  return (
    <section className="flex flex-col gap-6 border-t border-border py-10">
      <div className="flex flex-wrap items-baseline gap-3">
        <h2 className="text-xl font-semibold tracking-tight">Reviews</h2>
        {rating !== null && reviewCount ? (
          <span className="flex items-center gap-2 text-sm">
            <Stars value={Math.round(rating)} className="size-3.5" />
            <span className="font-medium">{rating.toFixed(1)}</span>
            <span className="text-muted-foreground">
              ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
            </span>
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">
            No reviews yet — be the first to rate {placeName}.
          </span>
        )}
      </div>

      {reviews.length > 0 && (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {reviews.map((review) => (
            <li key={review.id} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Stars value={review.rating} className="size-3.5" />
                <span className="text-sm font-medium">
                  {review.author_name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              {review.body && (
                <p className="text-sm text-muted-foreground">{review.body}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      <form
        action={formAction}
        className="flex max-w-xl flex-col gap-4 rounded-2xl border border-border p-5"
      >
        <input type="hidden" name="place_id" value={placeId} />
        <input type="hidden" name="path" value={path} />
        <input type="hidden" name="rating" value={selected} />

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Your rating</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setSelected(n)}
                aria-label={`${n} star${n === 1 ? "" : "s"}`}
                aria-pressed={selected === n}
                className="rounded p-1 hover:bg-muted"
              >
                <Star
                  className={`size-5 ${n <= selected ? "fill-foreground" : "text-muted-foreground/40"}`}
                />
              </button>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Your name
          <input
            name="author_name"
            required
            maxLength={80}
            className="rounded-lg border border-border px-3 py-2 text-sm font-normal outline-none focus:border-foreground"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Your review
          <textarea
            name="body"
            rows={3}
            maxLength={1000}
            className="resize-y rounded-lg border border-border px-3 py-2 text-sm font-normal outline-none focus:border-foreground"
          />
        </label>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="w-fit rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80 disabled:opacity-50"
          >
            {pending ? "Submitting…" : "Submit review"}
          </button>
          {state.message && (
            <p
              className={`text-sm ${state.status === "error" ? "text-red-600" : "text-muted-foreground"}`}
            >
              {state.message}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}
