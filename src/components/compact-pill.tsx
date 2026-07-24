"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Heart } from "lucide-react";
import { TRIP_TYPE_META } from "@/components/search-bar";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import type { DestinationSummary } from "@/lib/data";

type Panel = "destinations" | "type" | null;

type CompactPillProps = {
  destinations: DestinationSummary[];
  packageTypes: string[];
};

export function CompactPill({ destinations, packageTypes }: CompactPillProps) {
  const { t } = useI18n();
  const [panel, setPanel] = useState<Panel>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setPanel(null);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <div className="flex items-center rounded-full border border-border bg-white shadow-sm">
        <button
          type="button"
          onClick={() =>
            setPanel(panel === "destinations" ? null : "destinations")
          }
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-muted",
            panel === "destinations" && "bg-muted"
          )}
        >
          {t("search.destinations")}
        </button>
        <div className="h-5 w-px bg-border" />
        <button
          type="button"
          onClick={() => setPanel(panel === "type" ? null : "type")}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-muted",
            panel === "type" && "bg-muted"
          )}
        >
          {t("search.tripType")}
        </button>
        <div className="pr-1">
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/80"
          >
            <Search className="size-3.5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {panel && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-1/2 z-50 mt-3 w-[min(90vw,340px)] -translate-x-1/2 rounded-2xl bg-white p-3 text-left shadow-xl ring-1 ring-foreground/10"
          >
            {panel === "destinations" && (
              <div className="flex flex-col">
                {destinations.map((d) => (
                  <button
                    key={d.slug}
                    type="button"
                    onClick={() => setPanel(null)}
                    className="flex items-center gap-3 rounded-lg p-2.5 text-left text-sm hover:bg-muted"
                  >
                    <MapPin className="size-4 text-muted-foreground" />
                    {d.region}
                  </button>
                ))}
              </div>
            )}

            {panel === "type" && (
              <div className="grid grid-cols-2 gap-2">
                {packageTypes.map((type) => {
                  const meta = TRIP_TYPE_META[type];
                  const Icon = meta?.icon ?? Heart;
                  const label = t(`nav.${type}`) || meta?.label || type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setPanel(null)}
                      className="flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm hover:bg-muted"
                    >
                      <Icon className="size-4" />
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
