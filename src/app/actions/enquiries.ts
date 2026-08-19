"use server";

import { createClient } from "@/lib/supabase/server";
import { validateEnquiry } from "@/lib/validate-enquiry";

export type EnquiryFormState = {
  status: "idle" | "ok" | "error";
  message: string;
  /** Field-level errors keyed by input name, for inline display. */
  fieldErrors?: Record<string, string>;
};

export async function submitEnquiry(
  _prev: EnquiryFormState,
  formData: FormData,
): Promise<EnquiryFormState> {
  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    message: String(formData.get("message") ?? ""),
    partySize: String(formData.get("party_size") ?? ""),
    tripType: String(formData.get("trip_type") ?? ""),
    travelDates: String(formData.get("travel_dates") ?? ""),
    destinationSlug: String(formData.get("destination_slug") ?? ""),
  };

  const fieldErrors = validateEnquiry(values);
  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("enquiries").insert({
    name: values.name.trim(),
    email: values.email.trim(),
    phone: values.phone.trim() || null,
    message: values.message.trim(),
    party_size: values.partySize ? Number(values.partySize) : null,
    trip_type: values.tripType || null,
    travel_dates: values.travelDates.trim() || null,
    destination_slug: values.destinationSlug.trim() || null,
  });

  if (error) {
    return {
      status: "error",
      message:
        "We couldn't send that just now. Please email us directly and we'll pick it up.",
    };
  }

  return {
    status: "ok",
    message:
      "Thanks — we've got your enquiry and will reply within one working day.",
  };
}
