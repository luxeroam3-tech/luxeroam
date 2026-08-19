"use client";

import { useState, useTransition } from "react";
import { Mail, Phone, Users, CalendarDays, MapPin } from "lucide-react";
import { setEnquiryStatus } from "@/app/actions/admin";
import type { AdminEnquiry } from "@/lib/admin/data";

const NEXT_STATUS = ["new", "contacted", "quoted", "booked", "closed"];

export function EnquiryRow({ enquiry }: { enquiry: AdminEnquiry }) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState(enquiry.status);

  function move(next: string) {
    startTransition(async () => {
      const result = await setEnquiryStatus(enquiry.id, next);
      if (result.ok) setStatus(next);
    });
  }

  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-border p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="font-medium">{enquiry.name}</span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <a
              href={`mailto:${enquiry.email}`}
              className="flex items-center gap-1.5 hover:text-foreground hover:underline"
            >
              <Mail className="size-3.5" />
              {enquiry.email}
            </a>
            {enquiry.phone && (
              <a
                href={`tel:${enquiry.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-1.5 hover:text-foreground hover:underline"
              >
                <Phone className="size-3.5" />
                {enquiry.phone}
              </a>
            )}
            {enquiry.party_size && (
              <span className="flex items-center gap-1.5">
                <Users className="size-3.5" />
                {enquiry.party_size}
              </span>
            )}
            {enquiry.travel_dates && (
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-3.5" />
                {enquiry.travel_dates}
              </span>
            )}
            {enquiry.destination_slug && (
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                {enquiry.destination_slug}
              </span>
            )}
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(enquiry.created_at).toLocaleString()}
        </span>
      </div>

      <p className="whitespace-pre-wrap text-sm">{enquiry.message}</p>

      <div className="flex flex-wrap items-center gap-2">
        {NEXT_STATUS.map((option) => (
          <button
            key={option}
            type="button"
            disabled={pending || status === option}
            onClick={() => move(option)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors disabled:opacity-100 ${
              status === option
                ? "border-foreground bg-foreground text-background"
                : "border-border hover:bg-muted disabled:opacity-50"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </li>
  );
}
