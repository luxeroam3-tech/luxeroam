"use client";

import { useState, useTransition } from "react";
import { Star, Check, X, Trash2 } from "lucide-react";
import { setReviewStatus, deleteReview } from "@/app/actions/admin";
import type { AdminReview } from "@/lib/admin/data";

export function ReviewRow({ review }: { review: AdminReview }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const place = review.places;

  function run(action: () => Promise<{ ok: boolean; message: string }>) {
    startTransition(async () => {
      const result = await action();
      setMessage(result.message);
    });
  }

  // What approving this review would do to the place's average, so the effect
  // is visible before the click rather than after.
  const projected = (() => {
    if (!place || review.status === "approved") return null;
    const count = place.review_count ?? 0;
    const current = place.rating ?? 0;
    const next = (current * count + review.rating) / (count + 1);
    return { from: count > 0 ? current.toFixed(1) : "—", to: next.toFixed(1) };
  })();

  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-border p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={`size-3.5 ${n <= review.rating ? "fill-foreground" : "text-muted-foreground/40"}`}
                />
              ))}
            </span>
            <span className="text-sm font-medium">{review.author_name}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(review.created_at).toLocaleDateString()}
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            {place?.name ?? "Unknown place"}
          </span>
        </div>

        {projected && (
          <span className="rounded-full bg-muted px-3 py-1 text-xs">
            Approving moves rating {projected.from} → {projected.to}
          </span>
        )}
      </div>

      {review.body && <p className="text-sm">{review.body}</p>}

      <div className="flex flex-wrap items-center gap-2">
        {review.status !== "approved" && (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => setReviewStatus(review.id, "approved"))}
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80 disabled:opacity-50"
          >
            <Check className="size-4" />
            Approve
          </button>
        )}
        {review.status !== "rejected" && (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => setReviewStatus(review.id, "rejected"))}
            className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
          >
            <X className="size-4" />
            Reject
          </button>
        )}
        {review.status !== "pending" && (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => setReviewStatus(review.id, "pending"))}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
          >
            Back to pending
          </button>
        )}
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => deleteReview(review.id))}
          className="ml-auto flex items-center gap-2 rounded-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          <Trash2 className="size-4" />
          Delete
        </button>
      </div>

      {message && <p className="text-xs text-muted-foreground">{message}</p>}
    </li>
  );
}
