"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    });

    if (signInError) {
      // Deliberately generic: distinguishing "no such user" from "wrong
      // password" tells an attacker which emails exist.
      setError("Those details didn't work. Check them and try again.");
      setPending(false);
      return;
    }

    router.replace(next && next.startsWith("/admin") ? next : "/admin");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          className="rounded-lg border border-border px-3 py-2 text-sm font-normal outline-none focus:border-foreground"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Password
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-lg border border-border px-3 py-2 text-sm font-normal outline-none focus:border-foreground"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80 disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
