"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Menu, Globe } from "lucide-react";
import { SearchBar, TRIP_TYPE_META } from "@/components/search-bar";
import { CompactPill } from "@/components/compact-pill";
import { LanguageCurrencyPicker } from "@/components/language-currency-picker";
import { useI18n } from "@/lib/i18n/context";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { DestinationSummary } from "@/lib/data";

const NAV_ICONS: Record<string, string> = {
  honeymoon: "/icons/honeymoon.png",
  family: "/icons/family.png",
};

type HeaderProps = {
  destinations: DestinationSummary[];
  packageTypes: string[];
};

export function Header({ destinations, packageTypes }: HeaderProps) {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const scrolledRef = useRef(scrolled);
  scrolledRef.current = scrolled;

  useEffect(() => {
    let ticking = false;

    function update() {
      const y = window.scrollY;
      // hysteresis: collapse past 80px, only re-expand once back under 40px
      if (!scrolledRef.current && y > 80) setScrolled(true);
      else if (scrolledRef.current && y < 40) setScrolled(false);
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const menuLinks = [
    { label: t("menu.about"), href: "#" },
    { label: t("menu.contact"), href: "#" },
  ];

  return (
    <header className="sticky top-0 z-40 flex flex-col border-b border-border bg-white px-6">
      <div className="flex min-h-20 items-center justify-between py-3">
        <Image
          src="/logo/logo.png"
          alt="Luxe Roam"
          width={72}
          height={72}
          className="size-16 object-contain"
        />

        <div className="relative">
          <div
            className={`transition-opacity duration-200 ${scrolled ? "pointer-events-none absolute inset-0 opacity-0" : "opacity-100"}`}
          >
            <nav className="hidden items-center gap-8 sm:flex">
              {packageTypes.map((type, i) => {
                const label = t(`nav.${type}`) || TRIP_TYPE_META[type]?.label || type;
                const icon = NAV_ICONS[type] ?? "/icons/honeymoon.png";
                return (
                  <a
                    key={type}
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
                );
              })}
            </nav>
          </div>
          <div
            className={`transition-opacity duration-200 ${scrolled ? "opacity-100" : "pointer-events-none absolute inset-0 opacity-0"}`}
          >
            <CompactPill destinations={destinations} packageTypes={packageTypes} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setPickerOpen(true)}
            className="flex size-9 items-center justify-center rounded-full hover:bg-muted"
          >
            <Globe className="size-4" />
          </button>
          <button
            onClick={() => setMenuOpen(true)}
            className="flex size-9 items-center justify-center rounded-full border border-border hover:shadow-sm"
          >
            <Menu className="size-4" />
          </button>
        </div>
      </div>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: scrolled ? "0fr" : "1fr" }}
      >
        <div className="flex justify-center overflow-hidden">
          <div className="w-full pb-4">
            <SearchBar destinations={destinations} packageTypes={packageTypes} />
          </div>
        </div>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="right" className="w-72">
          <SheetHeader>
            <SheetTitle>{t("menu.menu")}</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col px-4">
            {menuLinks.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-2 py-3 text-sm font-medium hover:bg-muted"
              >
                {label}
              </a>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <LanguageCurrencyPicker open={pickerOpen} onOpenChange={setPickerOpen} />
    </header>
  );
}
