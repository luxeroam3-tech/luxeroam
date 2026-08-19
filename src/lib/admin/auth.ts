import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AdminUser = { id: string; email: string };

/**
 * Every admin page and action calls this. Middleware already blocks anonymous
 * requests, but membership of admin_users is checked here too: being signed in
 * is not the same as being an admin, and the database policies are the real
 * boundary rather than the redirect.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin) redirect("/admin/login?error=not-admin");

  return { id: user.id, email: user.email ?? "" };
}
