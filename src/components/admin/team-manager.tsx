"use client";

import { useActionState, useState, useTransition } from "react";
import { UserPlus, Trash2 } from "lucide-react";
import {
  grantAdmin,
  revokeAdmin,
  type TeamState,
} from "@/app/actions/admin-team";

const INITIAL: TeamState = { status: "idle", message: "" };

export function TeamManager({
  admins,
  currentEmail,
}: {
  admins: { email: string; created_at: string }[];
  currentEmail: string;
}) {
  const [state, formAction, adding] = useActionState(grantAdmin, INITIAL);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [removed, setRemoved] = useState<string[]>([]);

  const visible = admins.filter((a) => !removed.includes(a.email));

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Admins ({visible.length})</h2>

      <ul className="flex flex-col divide-y divide-border rounded-2xl border border-border">
        {visible.map((entry) => (
          <li
            key={entry.email}
            className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
          >
            <div className="flex flex-col">
              <span className="font-medium">
                {entry.email}
                {entry.email === currentEmail && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    (you)
                  </span>
                )}
              </span>
              <span className="text-xs text-muted-foreground">
                Added {new Date(entry.created_at).toLocaleDateString()}
              </span>
            </div>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await revokeAdmin(entry.email);
                  if (result.ok) setRemoved((prev) => [...prev, entry.email]);
                  else setError(result.message);
                })
              }
              className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="size-3.5" />
              Remove
            </button>
          </li>
        ))}
      </ul>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <form action={formAction} className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <input
            name="email"
            type="email"
            required
            placeholder="teammate@example.com"
            className="min-w-64 flex-1 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-foreground"
          />
          <button
            type="submit"
            disabled={adding}
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80 disabled:opacity-50"
          >
            <UserPlus className="size-4" />
            {adding ? "Adding…" : "Add admin"}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          The person needs a Supabase account first — passwords are set there,
          never here.
        </p>
        {state.message && (
          <p
            className={`text-sm ${state.status === "error" ? "text-red-600" : "text-muted-foreground"}`}
          >
            {state.message}
          </p>
        )}
      </form>
    </section>
  );
}
