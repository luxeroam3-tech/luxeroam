"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Menu, Globe } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { CompactPill } from "@/components/compact-pill";

const NAV_ITEMS = [
  { label: "Tours", icon: "/icons/tours.png" },
  { label: "Experiences", icon: "/icons/experiences.png" },
  { label: "Stays", icon: "/icons/stays.png" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60);
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex flex-col border-b border-border bg-white px-6 transition-all">
      <div
        className={`flex items-center justify-between transition-all ${scrolled ? "py-3" : "py-4"}`}
      >
        <span className="flex items-center gap-2">
          <Image
            src="/logo/logo.png"
            alt="Luxe Roam"
            width={32}
            height={32}
            className="size-8 object-contain"
          />
          <span className="text-xl font-semibold tracking-tight">
            Luxe Roam
          </span>
        </span>

        {scrolled ? (
          <CompactPill />
        ) : (
          <nav className="hidden items-center gap-8 sm:flex">
            {NAV_ITEMS.map(({ label, icon }, i) => (
              <a
                key={label}
                href="#"
                className={`flex flex-col items-center gap-1 border-b-2 pb-2 pt-1 text-sm font-medium transition-colors ${
                  i === 0
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Image
                  src={icon}
                  alt=""
                  width={44}
                  height={44}
                  className="size-11 object-contain"
                />
                {label}
              </a>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-3">
          <a
            href="#"
            className="hidden text-sm font-medium hover:underline sm:inline"
          >
            List your tour
          </a>
          <button className="flex size-9 items-center justify-center rounded-full hover:bg-muted">
            <Globe className="size-4" />
          </button>
          <button className="flex size-9 items-center justify-center rounded-full border border-border hover:shadow-sm">
            <Menu className="size-4" />
          </button>
        </div>
      </div>

      {!scrolled && (
        <div className="flex justify-center pb-4">
          <SearchBar />
        </div>
      )}
    </header>
  );
}
