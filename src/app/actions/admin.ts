"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";
import { recordAudit } from "@/lib/admin/audit";

const REVIEW_STATUSES = ["pending", "approved", "rejected"];
const ENQUIRY_STATUSES = ["new", "contacted", "quoted", "booked", "closed"];

export async function setReviewStatus(reviewId: string, status: string) {
  const admin = await requireAdmin();
  if (!REVIEW_STATUSES.includes(status)) {
    return { ok: false, message: "Unknown review status." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("reviews")
    .update({ status })
    .eq("id", reviewId);

  if (error) return { ok: false, message: error.message };

  await recordAudit({
    actorEmail: admin.email,
    action: `review.${status}`,
    entity: "review",
    entityId: reviewId,
  });

  // The rollup trigger recomputes the place's rating, so the public pages
  // need revalidating too.
  revalidatePath("/admin/reviews");
  revalidatePath("/admin");
  revalidatePath("/", "layout");
  return { ok: true, message: `Review ${status}.` };
}

export async function deleteReview(reviewId: string) {
  const admin = await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);

  if (error) return { ok: false, message: error.message };

  await recordAudit({
    actorEmail: admin.email,
    action: "review.deleted",
    entity: "review",
    entityId: reviewId,
  });

  revalidatePath("/admin/reviews");
  revalidatePath("/", "layout");
  return { ok: true, message: "Review deleted." };
}

export async function setEnquiryStatus(enquiryId: string, status: string) {
  const admin = await requireAdmin();
  if (!ENQUIRY_STATUSES.includes(status)) {
    return { ok: false, message: "Unknown enquiry status." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("enquiries")
    .update({ status })
    .eq("id", enquiryId);

  if (error) return { ok: false, message: error.message };

  await recordAudit({
    actorEmail: admin.email,
    action: `enquiry.${status}`,
    entity: "enquiry",
    entityId: enquiryId,
  });

  revalidatePath("/admin/enquiries");
  revalidatePath("/admin");
  return { ok: true, message: `Marked as ${status}.` };
}

export async function updatePlace(
  placeId: string,
  fields: { blurb?: string; price_from?: number | null },
) {
  const admin = await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase
    .from("places")
    .update(fields)
    .eq("id", placeId);

  if (error) return { ok: false, message: error.message };

  await recordAudit({
    actorEmail: admin.email,
    action: "place.updated",
    entity: "place",
    entityId: placeId,
    detail: fields as Record<string, unknown>,
  });

  revalidatePath("/admin/places");
  revalidatePath("/", "layout");
  return { ok: true, message: "Place updated." };
}

export async function addEnquiryNote(enquiryId: string, body: string) {
  const admin = await requireAdmin();

  const trimmed = body.trim();
  if (!trimmed) return { ok: false, message: "Write something first." };

  const supabase = await createClient();
  const { error } = await supabase.from("enquiry_notes").insert({
    enquiry_id: enquiryId,
    author_email: admin.email,
    body: trimmed.slice(0, 2000),
  });

  if (error) return { ok: false, message: error.message };

  await recordAudit({
    actorEmail: admin.email,
    action: "enquiry.note_added",
    entity: "enquiry",
    entityId: enquiryId,
  });

  revalidatePath("/admin/enquiries");
  return { ok: true, message: "Note saved." };
}

export async function deleteEnquiryNote(noteId: string, enquiryId: string) {
  const admin = await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase
    .from("enquiry_notes")
    .delete()
    .eq("id", noteId);

  if (error) return { ok: false, message: error.message };

  await recordAudit({
    actorEmail: admin.email,
    action: "enquiry.note_deleted",
    entity: "enquiry",
    entityId: enquiryId,
  });

  revalidatePath("/admin/enquiries");
  return { ok: true, message: "Note deleted." };
}
