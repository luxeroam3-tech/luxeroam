"use client";

import { useState, useTransition } from "react";
import {
  Mail,
  Phone,
  Users,
  CalendarDays,
  MapPin,
  StickyNote,
  Trash2,
} from "lucide-react";
import {
  setEnquiryStatus,
  addEnquiryNote,
  deleteEnquiryNote,
} from "@/app/actions/admin";
import type { AdminEnquiry } from "@/lib/admin/data";

const NEXT_STATUS = ["new", "contacted", "quoted", "booked", "closed"];

export function EnquiryRow({ enquiry }: { enquiry: AdminEnquiry }) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState(enquiry.status);
  const [notes, setNotes] = useState(enquiry.enquiry_notes ?? []);
  const [draft, setDraft] = useState("");
  const [noteError, setNoteError] = useState<string | null>(null);

  function saveNote() {
    const body = draft.trim();
    if (!body) return;
    startTransition(async () => {
      const result = await addEnquiryNote(enquiry.id, body);
      if (result.ok) {
        // Optimistic: the server list refreshes on revalidate, but showing it
        // immediately keeps the pipeline usable while typing several notes.
        setNotes((prev) => [
          {
            id: crypto.randomUUID(),
            author_email: "you",
            body,
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
        setDraft("");
        setNoteError(null);
      } else {
        setNoteError(result.message);
      }
    });
  }

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

      <div className="flex flex-col gap-2 rounded-lg bg-muted/50 p-3">
        <span className="flex items-center gap-2 text-xs font-medium">
          <StickyNote className="size-3.5" />
          Notes ({notes.length})
        </span>

        {notes.length > 0 && (
          <ul className="flex flex-col gap-2">
            {notes.map((note) => (
              <li
                key={note.id}
                className="flex items-start justify-between gap-2 text-xs"
              >
                <div className="flex flex-col">
                  <span className="whitespace-pre-wrap">{note.body}</span>
                  <span className="text-muted-foreground">
                    {note.author_email} ·{" "}
                    {new Date(note.created_at).toLocaleString()}
                  </span>
                </div>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      const result = await deleteEnquiryNote(
                        note.id,
                        enquiry.id,
                      );
                      if (result.ok)
                        setNotes((prev) =>
                          prev.filter((n) => n.id !== note.id),
                        );
                    })
                  }
                  aria-label="Delete note"
                  className="rounded p-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 className="size-3" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") saveNote();
            }}
            placeholder="Add a note — what was discussed, what was quoted"
            className="flex-1 rounded-lg border border-border bg-white px-3 py-1.5 text-xs outline-none focus:border-foreground"
          />
          <button
            type="button"
            disabled={pending || !draft.trim()}
            onClick={saveNote}
            className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
          >
            Save
          </button>
        </div>
        {noteError && <span className="text-xs text-red-600">{noteError}</span>}
      </div>

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
