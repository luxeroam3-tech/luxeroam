import { requireAdmin } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { TeamManager } from "@/components/admin/team-manager";

export const metadata = { title: "Team" };

export default async function AdminTeamPage() {
  const admin = await requireAdmin();
  const supabase = await createClient();

  const [{ data: admins }, { data: audit }] = await Promise.all([
    supabase
      .from("admin_users")
      .select("email, created_at")
      .order("created_at"),
    supabase
      .from("audit_log")
      .select("id, actor_email, action, entity, detail, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
        <p className="text-sm text-muted-foreground">
          Who can sign in to the dashboard, and what has been changed.
        </p>
      </div>

      <TeamManager admins={admins ?? []} currentEmail={admin.email} />

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Recent activity</h2>
        {(audit ?? []).length === 0 ? (
          <p className="rounded-2xl border border-border p-6 text-sm text-muted-foreground">
            Nothing recorded yet. Admin actions from here on will be listed.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-2xl border border-border">
            {(audit ?? []).map((entry) => (
              <li
                key={entry.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{entry.action}</span>
                  <span className="text-xs text-muted-foreground">
                    {entry.actor_email ?? "unknown"} · {entry.entity}
                    {entry.detail
                      ? ` · ${JSON.stringify(entry.detail).slice(0, 80)}`
                      : ""}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(entry.created_at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
