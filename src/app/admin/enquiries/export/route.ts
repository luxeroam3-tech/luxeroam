import { createClient } from "@/lib/supabase/server";
import { recordAudit } from "@/lib/admin/audit";

const COLUMNS = [
  "created_at",
  "status",
  "name",
  "email",
  "phone",
  "party_size",
  "trip_type",
  "travel_dates",
  "destination_slug",
  "message",
] as const;

/**
 * Escapes a value for CSV. The leading apostrophe on formula characters stops
 * spreadsheet software executing a field like "=cmd|..." on open, which is a
 * real injection route when the data came from a public form.
 */
function toCsvCell(value: unknown) {
  if (value === null || value === undefined) return "";
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET() {
  const supabase = await createClient();

  // This route hands out customer contact details, so it verifies membership
  // itself rather than relying on middleware alone.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id, email")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!admin) return new Response("Forbidden", { status: 403 });

  const { data, error } = await supabase
    .from("enquiries")
    .select(COLUMNS.join(", "))
    .order("created_at", { ascending: false });

  if (error) return new Response(error.message, { status: 500 });

  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  const csv = [
    COLUMNS.join(","),
    ...rows.map((row) => COLUMNS.map((key) => toCsvCell(row[key])).join(",")),
  ].join("\n");

  await recordAudit({
    actorEmail: admin.email,
    action: "enquiries.exported",
    entity: "enquiry",
    detail: { rows: rows.length },
  });

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="luxeroam-enquiries-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
