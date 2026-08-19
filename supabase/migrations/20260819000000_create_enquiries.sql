-- Customer enquiries from the contact form.
create table enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  -- Optional context when the enquiry starts from a destination page.
  destination_slug text,
  trip_type package_type,
  travel_dates text,
  party_size int,
  message text not null,
  status text not null default 'new'
    check (status in ('new','contacted','quoted','booked','closed')),
  created_at timestamptz not null default now()
);

create index enquiries_status_idx on enquiries(status);
create index enquiries_created_at_idx on enquiries(created_at desc);

alter table enquiries enable row level security;

-- Anyone may submit an enquiry, but only as a new one.
create policy "Public submit enquiries" on enquiries
  for insert with check (status = 'new');

-- Deliberately no public select policy: enquiries contain personal contact
-- details and must not be readable with the anon key. Reading them requires
-- an authenticated admin, added with the admin dashboard.
