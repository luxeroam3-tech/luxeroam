"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";
import { FloatingNav } from "@/components/floating-nav";

/**
 * The marketing footer and floating nav belong to the public site only; the
 * admin dashboard has its own chrome and should not carry either.
 */
export function SiteChrome() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <Footer />
      <FloatingNav />
    </>
  );
}
