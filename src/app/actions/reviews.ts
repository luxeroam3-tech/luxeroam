"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getRequestIdentity } from "@/lib/request-identity";

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

  const { ipHash, userAgent } = await getRequestIdentity();
  const supabase = await createClient();

  // The rate limit and the insert happen inside one SECURITY DEFINER function
  // so the cap cannot be bypassed by racing two submissions, and review counts
  // are never exposed to the client.
  const { data, error } = await supabase.rpc("submit_review", {
    p_place_id: placeId,
    p_author_name: authorName,
    p_rating: rating,
    p_body: body || null,
    p_ip_hash: ipHash,
    p_user_agent: userAgent,
  });

  if (error) {
    return {
      status: "error",
      message: "Could not save that review. Try again.",
    };
  }

  if (data === "rate_limited") {
    return {
      status: "error",
      message:
        "That's a few reviews in a short time. Please try again in an hour.",
    };
  }
  if (data !== "ok") {
    return { status: "error", message: "That review couldn't be accepted." };
  }

  revalidatePath(path);
  return {
    status: "ok",
    message: "Thanks — your review will appear once it has been checked.",
  };
}
