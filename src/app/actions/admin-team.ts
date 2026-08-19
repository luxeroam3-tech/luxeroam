"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";
import { recordAudit } from "@/lib/admin/audit";

export type TeamState = { status: "idle" | "ok" | "error"; message: string };

const MESSAGES: Record<string, string> = {
  no_such_user:
    "No account with that email. Create the user in Supabase first, then add them here.",
  forbidden: "You don't have permission to do that.",
  last_admin:
    "That's the only admin left. Add another before removing this one.",
};

export async function grantAdmin(
  _prev: TeamState,
  formData: FormData,
): Promise<TeamState> {
  const admin = await requireAdmin();
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { status: "error", message: "Enter an email address." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("grant_admin", { p_email: email });

  if (error) return { status: "error", message: error.message };
  if (data !== "ok") {
    return {
      status: "error",
      message: MESSAGES[data] ?? "Could not add that admin.",
    };
  }

  await recordAudit({
    actorEmail: admin.email,
    action: "admin.granted",
    entity: "admin_user",
    detail: { email },
  });

  revalidatePath("/admin/team");
  return {
    status: "ok",
    message: `${email} can now sign in to the dashboard.`,
  };
}

export async function revokeAdmin(email: string) {
  const admin = await requireAdmin();

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("revoke_admin", {
    p_email: email,
  });

  if (error) return { ok: false, message: error.message };
  if (data !== "ok") {
    return {
      ok: false,
      message: MESSAGES[data] ?? "Could not remove that admin.",
    };
  }

  await recordAudit({
    actorEmail: admin.email,
    action: "admin.revoked",
    entity: "admin_user",
    detail: { email },
  });

  revalidatePath("/admin/team");
  return { ok: true, message: `${email} no longer has admin access.` };
}
