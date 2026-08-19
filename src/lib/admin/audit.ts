import { createClient } from "@/lib/supabase/server";

/**
 * Records an admin action. Deliberately never throws: an audit write failing
 * should not block the change the admin actually asked for, but it should be
 * visible in the server logs.
 */
export async function recordAudit(entry: {
  actorEmail: string;
  action: string;
  entity: string;
  entityId?: string | null;
  detail?: Record<string, unknown>;
}) {
  try {
    const supabase = await createClient();
    await supabase.from("audit_log").insert({
      actor_email: entry.actorEmail,
      action: entry.action,
      entity: entry.entity,
      entity_id: entry.entityId ?? null,
      detail: entry.detail ?? null,
    });
  } catch (error) {
    console.error("audit write failed", entry.action, error);
  }
}
