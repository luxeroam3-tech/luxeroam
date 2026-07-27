"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Menu, Globe } from "lucide-react";
import { SearchBar, TRIP_TYPE_META } from "@/components/search-bar";
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
    let lastY = window.scrollY;

    function update() {
      const y = window.scrollY;
      const delta = y - lastY;

      // Direction-driven: collapse when scrolling down past the header, expand
      // as soon as the user scrolls back up. The 6px deadzone keeps trackpad
      // and momentum jitter from flipping the state.
      if (Math.abs(delta) > 6) {
        if (delta > 0 && y > 80 && !scrolledRef.current) {
          setScrolled(true);
        } else if (delta < 0 && scrolledRef.current) {
          setScrolled(false);
        }
        lastY = y;
      }

      // Always expanded at the very top, regardless of direction.
      if (y <= 80 && scrolledRef.current) setScrolled(false);

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
    // The spacer always reserves the expanded height while the header itself is
    // taken out of the flow. A sticky header still occupies its slot, so
    // collapsing it shifted every following section up under the current scroll
    // position, which changed scrollY, which fed straight back into the
    // direction check above - the jitter was that feedback loop, not the
    // animation.
    <div className="h-[143px] sm:h-[185px]">
      <header className="fixed inset-x-0 top-0 z-40 flex flex-col border-b border-border bg-white px-6">
        {/* Scrolling down collapses everything except the search bar. The row
            track is set inline rather than with grid-rows-[0fr]/[1fr]: those
            arbitrary utilities were silently absent from the generated CSS, so
            the class flipped but the row never actually collapsed. */}
        <div
          className="grid min-h-0"
          style={{ gridTemplateRows: scrolled ? "0fr" : "1fr" }}
        >
          <div
            className={`overflow-hidden transition-opacity duration-200 ${
              scrolled ? "opacity-0" : "opacity-100"
            }`}
          >
            <div className="grid min-h-20 grid-cols-[1fr_auto_1fr] items-center gap-4 py-3">
              <Image
                src="/logo/logo.png"
                alt="Luxe Roam"
                width={1137}
                height={352}
                priority
                className="h-8 w-auto justify-self-start object-contain sm:h-11"
              />

              <div className="justify-self-center">
                <nav className="hidden items-center gap-8 sm:flex">
                  {packageTypes.map((type, i) => {
                    const label =
                      t(`nav.${type}`) || TRIP_TYPE_META[type]?.label || type;
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

              <div className="flex items-center gap-3 justify-self-end">
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
          </div>
        </div>

        {/* Always present - this is the one thing that survives the collapse. */}
        <div className="flex justify-center pb-4">
          <SearchBar destinations={destinations} packageTypes={packageTypes} />
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

        <LanguageCurrencyPicker
          open={pickerOpen}
          onOpenChange={setPickerOpen}
        />
      </header>
    </div>
  );
}
