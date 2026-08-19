"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";

export type AvailabilityState = {
  status: "idle" | "ok" | "error";
  message: string;
};

export async function addAvailability(
  _prev: AvailabilityState,
  formData: FormData,
): Promise<AvailabilityState> {
  await requireAdmin();

  const placeId = String(formData.get("place_id") ?? "");
  const startsOn = String(formData.get("starts_on") ?? "");
  const endsOn = String(formData.get("ends_on") ?? "");
  const tripType = String(formData.get("trip_type") ?? "");
  const seats = String(formData.get("seats") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();

  if (!placeId || !startsOn || !endsOn) {
    return { status: "error", message: "Pick a start and end date." };
  }
  if (endsOn < startsOn) {
    return {
      status: "error",
      message: "The end date is before the start date.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("place_availability").insert({
    place_id: placeId,
    starts_on: startsOn,
    ends_on: endsOn,
    trip_type: tripType || null,
    seats: seats ? Number(seats) : null,
    note: note || null,
  });

  if (error) return { status: "error", message: error.message };

  revalidatePath("/admin/places");
  revalidatePath("/", "layout");
  return { status: "ok", message: "Availability added." };
}

export async function removeAvailability(id: string) {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase
    .from("place_availability")
    .delete()
    .eq("id", id);

  if (error) return { ok: false, message: error.message };

  revalidatePath("/admin/places");
  revalidatePath("/", "layout");
  return { ok: true, message: "Availability removed." };
}
