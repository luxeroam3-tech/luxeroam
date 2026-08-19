"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Star,
  Inbox,
  MapPin,
  Users,
  BarChart3,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const LINKS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/enquiries", label: "Enquiries", icon: Inbox },
  { href: "/admin/places", label: "Places", icon: MapPin },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/team", label: "Team", icon: Users },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  // The login screen is inside /admin but has no chrome of its own.
  if (pathname === "/admin/login") return null;

  async function signOut() {
    await createClient().auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <header className="border-b border-border px-6 py-3">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1">
          <Link href="/admin" className="pr-3 text-sm font-semibold">
            Luxe Roam admin
          </Link>
          {LINKS.map(({ href, label, icon: Icon, exact }) => {
            const active = exact
              ? pathname === href
              : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-full border border-border px-3 py-2 text-sm hover:bg-muted"
          >
            View site
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="flex items-center gap-2 rounded-full px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
