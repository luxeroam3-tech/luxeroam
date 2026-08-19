/**
 * Enquiry validation. Kept out of the "use server" action file because a
 * server-action module may only export async functions.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type EnquiryValues = {
  name: string;
  email: string;
  message: string;
  partySize: string;
};

export function validateEnquiry(values: EnquiryValues) {
  const fieldErrors: Record<string, string> = {};

  if (!values.name.trim()) fieldErrors.name = "Tell us your name.";
  else if (values.name.trim().length > 120)
    fieldErrors.name = "That name is too long.";

  if (!values.email.trim()) fieldErrors.email = "We need an email to reply to.";
  else if (!EMAIL_PATTERN.test(values.email.trim()))
    fieldErrors.email = "That email doesn't look right.";

  if (!values.message.trim()) fieldErrors.message = "Tell us about your trip.";
  else if (values.message.trim().length > 2000)
    fieldErrors.message = "Please keep it under 2000 characters.";

  if (values.partySize) {
    const size = Number(values.partySize);
    if (!Number.isInteger(size) || size < 1 || size > 50)
      fieldErrors.party_size = "Party size should be between 1 and 50.";
  }

  return fieldErrors;
}
