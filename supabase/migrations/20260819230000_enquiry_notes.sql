-- Working notes on an enquiry: what was said, what was quoted, why it closed.
-- Separate rows rather than one editable field so the history is preserved.
create table enquiry_notes (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references enquiries(id) on delete cascade,
  author_email text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index enquiry_notes_enquiry_id_idx on enquiry_notes(enquiry_id, created_at desc);

alter table enquiry_notes enable row level security;

-- Notes concern private customer conversations; admin-only in every direction.
create policy "Admins read enquiry notes" on enquiry_notes
  for select using (is_admin());
create policy "Admins write enquiry notes" on enquiry_notes
  for insert with check (is_admin());
create policy "Admins delete enquiry notes" on enquiry_notes
  for delete using (is_admin());
