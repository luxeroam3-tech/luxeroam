-- Bookable windows per place. A place is available for a requested date range
-- when any window overlaps it, so "19-30 August" matches a search for the
-- 22nd-25th and one for the 15th-20th alike.
create table place_availability (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references places(id) on delete cascade,
  starts_on date not null,
  ends_on date not null,
  -- Optional: restrict a window to one trip type, or leave null for both.
  trip_type package_type,
  seats int,
  note text,
  created_at timestamptz not null default now(),
  constraint place_availability_range_valid check (ends_on >= starts_on)
);

create index place_availability_place_id_idx on place_availability(place_id);
create index place_availability_dates_idx on place_availability(starts_on, ends_on);
create index place_availability_range_idx on place_availability
  using gist (daterange(starts_on, ends_on, '[]'));

alter table place_availability enable row level security;

create policy "Public read availability" on place_availability
  for select using (true);

create policy "Admins insert availability" on place_availability
  for insert with check (is_admin());
create policy "Admins update availability" on place_availability
  for update using (is_admin()) with check (is_admin());
create policy "Admins delete availability" on place_availability
  for delete using (is_admin());
