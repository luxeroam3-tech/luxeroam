import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false },
};

type PageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const { next, error } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">
            Luxe Roam admin
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in with your admin account.
          </p>
        </div>

        {error === "not-admin" && (
          <p className="rounded-lg bg-muted p-3 text-sm">
            That account is signed in but isn&apos;t an admin. Ask an existing
            admin to add you.
          </p>
        )}

        <LoginForm next={next} />
      </div>
    </main>
  );
}
