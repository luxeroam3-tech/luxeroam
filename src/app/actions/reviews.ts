"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ReviewFormState = {
  status: "idle" | "ok" | "error";
  message: string;
};

export async function submitReview(
  _prev: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const placeId = String(formData.get("place_id") ?? "");
  const authorName = String(formData.get("author_name") ?? "").trim();
  const rating = Number(formData.get("rating"));
  const body = String(formData.get("body") ?? "").trim();
  const path = String(formData.get("path") ?? "/");

  if (!placeId || !authorName) {
    return { status: "error", message: "Add your name before submitting." };
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { status: "error", message: "Pick a rating between 1 and 5 stars." };
  }

  const supabase = await createClient();
  // status is left at its 'pending' default: the RLS policy only permits
  // inserts in that state, so a submission cannot move the public average
  // until it has been approved.
  const { error } = await supabase.from("reviews").insert({
    place_id: placeId,
    author_name: authorName,
    rating,
    body: body || null,
  });

  if (error) {
    return {
      status: "error",
      message: "Could not save that review. Try again.",
    };
  }

  revalidatePath(path);
  return {
    status: "ok",
    message: "Thanks — your review will appear once it has been checked.",
  };
}
