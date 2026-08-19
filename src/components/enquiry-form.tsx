"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { submitEnquiry, type EnquiryFormState } from "@/app/actions/enquiries";

const INITIAL: EnquiryFormState = { status: "idle", message: "" };

type EnquiryFormProps = {
  packageTypes: string[];
  destinationSlug?: string;
};

export function EnquiryForm({
  packageTypes,
  destinationSlug,
}: EnquiryFormProps) {
  const [state, formAction, pending] = useActionState(submitEnquiry, INITIAL);

  if (state.status === "ok") {
    return (
      <div className="flex flex-col items-start gap-3 rounded-2xl border border-border p-6">
        <CheckCircle2 className="size-8" />
        <h2 className="text-lg font-semibold">Enquiry sent</h2>
        <p className="text-sm text-muted-foreground">{state.message}</p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-2xl border border-border p-6"
    >
      {destinationSlug && (
        <input type="hidden" name="destination_slug" value={destinationSlug} />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Your name"
          name="name"
          required
          error={state.fieldErrors?.name}
        />
        <Field
          label="Email"
          name="email"
          type="email"
          required
          error={state.fieldErrors?.email}
        />
        <Field label="Phone (optional)" name="phone" type="tel" />
        <Field
          label="Party size (optional)"
          name="party_size"
          type="number"
          min={1}
          max={50}
          error={state.fieldErrors?.party_size}
        />
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Trip type
          <select
            name="trip_type"
            className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm font-normal outline-none focus:border-foreground"
          >
            <option value="">Not sure yet</option>
            {packageTypes.map((type) => (
              <option key={type} value={type} className="capitalize">
                {type}
              </option>
            ))}
          </select>
        </label>
        <Field label="Travel dates (optional)" name="travel_dates" />
      </div>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Tell us about your trip
        <textarea
          name="message"
          rows={5}
          required
          maxLength={2000}
          placeholder="Where you'd like to go, roughly when, and anything that matters to you."
          className="resize-y rounded-lg border border-border px-3 py-2 text-sm font-normal outline-none focus:border-foreground"
        />
        {state.fieldErrors?.message && (
          <span className="text-xs text-red-600">
            {state.fieldErrors.message}
          </span>
        )}
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/80 disabled:opacity-50"
        >
          {pending ? "Sending…" : "Send enquiry"}
        </button>
        {state.status === "error" && (
          <p className="text-sm text-red-600">{state.message}</p>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  error,
  min,
  max,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  error?: string;
  min?: number;
  max?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        min={min}
        max={max}
        className="rounded-lg border border-border px-3 py-2 text-sm font-normal outline-none focus:border-foreground"
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}
