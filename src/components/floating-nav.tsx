"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Heart, Camera } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

const LINKS = [
  { href: "/", icon: Home, key: "nav.home", fallback: "Home" },
  {
    href: "/honeymoon",
    icon: Heart,
    key: "nav.honeymoon",
    fallback: "Honeymoon",
  },
  { href: "/family", icon: Camera, key: "nav.family", fallback: "Family" },
];

export function FloatingNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-6">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/40 bg-white/70 p-1.5 shadow-lg shadow-black/10 backdrop-blur-xl backdrop-saturate-150">
        {LINKS.map(({ href, icon: Icon, key, fallback }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-foreground text-background"
                  : "text-foreground/70 hover:bg-white/60 hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {t(key) || fallback}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
