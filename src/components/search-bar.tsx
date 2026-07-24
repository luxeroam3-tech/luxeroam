"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Compass,
  Waves,
  Heart,
  Users,
  Mountain,
  Tent,
  Binoculars,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type Panel = "where" | "when" | "type" | null;

export const DESTINATIONS = [
  "Maasai Mara",
  "Diani Beach",
  "Amboseli",
  "Nairobi",
  "Watamu",
  "Lake Naivasha",
  "Nakuru",
  "Laikipia",
];

export const TRIP_TYPES = [
  { label: "Safari", icon: Binoculars },
  { label: "Beach", icon: Waves },
  { label: "Honeymoon", icon: Heart },
  { label: "Family", icon: Users },
  { label: "Adventure", icon: Compass },
  { label: "Mountain trek", icon: Mountain },
  { label: "Glamping", icon: Tent },
  { label: "City tour", icon: Building2 },
];

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function buildMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(startDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

export function SearchBar() {
  const [panel, setPanel] = useState<Panel>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [tripType, setTripType] = useState<string | null>(null);
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());

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

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const grid = buildMonthGrid(viewYear, viewMonth);
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" }
  );

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function WherePanel() {
    return (
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => {
            setDestination("Nearby");
            setPanel(null);
          }}
          className="flex items-center gap-3 rounded-lg p-3 text-left hover:bg-muted"
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-muted">
            <MapPin className="size-4" />
          </span>
          <span>
            <div className="text-sm font-medium">Nearby</div>
            <div className="text-xs text-muted-foreground">
              Find what&apos;s around you
            </div>
          </span>
        </button>
        <div className="mt-1 px-3 text-xs font-medium text-muted-foreground">
          Popular destinations
        </div>
        {DESTINATIONS.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => {
              setDestination(d);
              setPanel(null);
            }}
            className="rounded-lg p-3 text-left text-sm hover:bg-muted"
          >
            {d}
          </button>
        ))}
      </div>
    );
  }

  function WhenPanel() {
    return (
      <div>
        <div className="mb-3 flex gap-2">
          {[
            { label: "Today", d: today },
            { label: "Tomorrow", d: tomorrow },
          ].map(({ label, d }) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                setDate(d);
                setPanel(null);
              }}
              className="flex-1 rounded-xl border border-border p-3 text-left hover:bg-muted"
            >
              <div className="text-sm font-medium">{label}</div>
              <div className="text-xs text-muted-foreground">
                {formatDate(d)}
              </div>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between px-1 pb-2">
          <button
            type="button"
            onClick={prevMonth}
            className="rounded-full p-1 hover:bg-muted"
          >
            <ChevronLeft className="size-4" />
          </button>
          <div className="text-sm font-semibold">{monthLabel}</div>
          <button
            type="button"
            onClick={nextMonth}
            className="rounded-full p-1 hover:bg-muted"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 px-1 text-center text-xs text-muted-foreground">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 px-1 pt-1">
          {grid.map((day, i) => {
            if (day === null) return <div key={i} />;
            const cellDate = new Date(viewYear, viewMonth, day);
            const isPast = cellDate < new Date(today.toDateString());
            const isSelected =
              date && date.toDateString() === cellDate.toDateString();
            return (
              <button
                key={i}
                type="button"
                disabled={isPast}
                onClick={() => {
                  setDate(cellDate);
                  setPanel(null);
                }}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-full text-sm hover:bg-muted disabled:text-muted-foreground/40 disabled:hover:bg-transparent",
                  isSelected && "bg-primary text-primary-foreground"
                )}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  function TypePanel() {
    return (
      <div className="grid grid-cols-2 gap-2">
        {TRIP_TYPES.map(({ label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            onClick={() => {
              setTripType(label);
              setPanel(null);
            }}
            className={cn(
              "flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm hover:bg-muted",
              tripType === label && "border-foreground bg-muted"
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Desktop / tablet segmented bar */}
      <div
        ref={rootRef}
        className="relative hidden w-full max-w-3xl sm:block"
      >
        <div className="flex items-center rounded-full border border-border bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setPanel(panel === "where" ? null : "where")}
            className={cn(
              "flex-1 rounded-full px-6 py-3 text-left transition-colors hover:bg-muted",
              panel === "where" && "bg-muted ring-1 ring-foreground/10"
            )}
          >
            <div className="text-xs font-semibold text-foreground">
              Where
            </div>
            <div className="truncate text-sm text-muted-foreground">
              {destination || "Search destinations"}
            </div>
          </button>

          <div className="h-8 w-px bg-border" />

          <button
            type="button"
            onClick={() => setPanel(panel === "when" ? null : "when")}
            className={cn(
              "flex-1 rounded-full px-6 py-3 text-left transition-colors hover:bg-muted",
              panel === "when" && "bg-muted ring-1 ring-foreground/10"
            )}
          >
            <div className="text-xs font-semibold text-foreground">When</div>
            <div className="truncate text-sm text-muted-foreground">
              {date ? formatDate(date) : "Add dates"}
            </div>
          </button>

          <div className="h-8 w-px bg-border" />

          <button
            type="button"
            onClick={() => setPanel(panel === "type" ? null : "type")}
            className={cn(
              "flex-1 rounded-full px-6 py-3 text-left transition-colors hover:bg-muted",
              panel === "type" && "bg-muted ring-1 ring-foreground/10"
            )}
          >
            <div className="text-xs font-semibold text-foreground">
              Trip type
            </div>
            <div className="truncate text-sm text-muted-foreground">
              {tripType || "Any"}
            </div>
          </button>

          <div className="pr-2">
            <button
              type="button"
              className="flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
            >
              <Search className="size-4" />
              Search
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
              className="absolute top-full left-1/2 z-50 mt-3 w-[min(90vw,480px)] -translate-x-1/2 rounded-2xl bg-white p-4 text-left shadow-xl ring-1 ring-foreground/10"
            >
              {panel === "where" && <WherePanel />}
              {panel === "when" && <WhenPanel />}
              {panel === "type" && <TypePanel />}
            </motion.div>
          )}
        </AnimatePresence>

        {(destination || date || tripType) && (
          <div className="mt-2 flex flex-wrap gap-2 px-2">
            {destination && (
              <Chip onClear={() => setDestination("")}>{destination}</Chip>
            )}
            {date && (
              <Chip onClear={() => setDate(null)}>{formatDate(date)}</Chip>
            )}
            {tripType && (
              <Chip onClear={() => setTripType(null)}>{tripType}</Chip>
            )}
          </div>
        )}
      </div>

      {/* Mobile: single tappable pill opening a bottom sheet */}
      <div className="w-full sm:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex w-full items-center gap-3 rounded-full border border-border bg-white px-4 py-3 text-left shadow-sm"
        >
          <Search className="size-4 shrink-0 text-foreground" />
          <span className="flex-1 truncate text-sm font-medium">
            {destination || "Where to?"}
          </span>
          {(date || tripType) && (
            <span className="truncate text-xs text-muted-foreground">
              {[date ? formatDate(date) : null, tripType]
                .filter(Boolean)
                .join(" · ")}
            </span>
          )}
        </button>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
            <SheetHeader>
              <SheetTitle>Search</SheetTitle>
            </SheetHeader>
            <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 pb-4">
              <MobileAccordion
                label="Where"
                value={destination || "Search destinations"}
                open={panel === "where"}
                onToggle={() =>
                  setPanel(panel === "where" ? null : "where")
                }
              >
                <WherePanel />
              </MobileAccordion>

              <MobileAccordion
                label="When"
                value={date ? formatDate(date) : "Add dates"}
                open={panel === "when"}
                onToggle={() => setPanel(panel === "when" ? null : "when")}
              >
                <WhenPanel />
              </MobileAccordion>

              <MobileAccordion
                label="Trip type"
                value={tripType || "Any"}
                open={panel === "type"}
                onToggle={() => setPanel(panel === "type" ? null : "type")}
              >
                <TypePanel />
              </MobileAccordion>
            </div>
            <div className="border-t border-border p-4">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
              >
                <Search className="size-4" />
                Search
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

function MobileAccordion({
  label,
  value,
  open,
  onToggle,
  children,
}: {
  label: string;
  value: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span>
          <div className="text-xs font-semibold text-foreground">
            {label}
          </div>
          <div className="text-sm text-muted-foreground">{value}</div>
        </span>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && <div className="border-t border-border p-3">{children}</div>}
    </div>
  );
}

function Chip({
  children,
  onClear,
}: {
  children: React.ReactNode;
  onClear: () => void;
}) {
  return (
    <span className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs text-foreground">
      {children}
      <button type="button" onClick={onClear} className="hover:opacity-70">
        <X className="size-3" />
      </button>
    </span>
  );
}
