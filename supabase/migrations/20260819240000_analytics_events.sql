-- Lightweight, privacy-preserving usage events. No address, no user agent, no
-- identifier of any kind: these rows answer "what is being looked at and
-- searched for", not "who did it".
create table analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('place_view', 'region_view', 'search')),
  place_slug text,
  region_slug text,
  query text,
  trip_type text,
  result_count int,
  created_at timestamptz not null default now()
);

create index analytics_events_type_created_idx on analytics_events(event_type, created_at desc);
create index analytics_events_place_idx on analytics_events(place_slug) where place_slug is not null;
create index analytics_events_query_idx on analytics_events(query) where query is not null;

alter table analytics_events enable row level security;

-- Only admins read. There is deliberately no public insert policy: writes go
-- through the function below so field shape and length are enforced.
create policy "Admins read analytics" on analytics_events
  for select using (is_admin());

create or replace function record_event(
  p_event_type text,
  p_place_slug text default null,
  p_region_slug text default null,
  p_query text default null,
  p_trip_type text default null,
  p_result_count int default null
) returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_event_type not in ('place_view', 'region_view', 'search') then
    return;
  end if;

  insert into analytics_events (
    event_type, place_slug, region_slug, query, trip_type, result_count
  ) values (
    p_event_type,
    left(p_place_slug, 100),
    left(p_region_slug, 100),
    -- Search terms are user input; cap the length and normalise the case so
    -- "Kenya" and "kenya" aggregate together.
    nullif(lower(left(trim(p_query), 120)), ''),
    left(p_trip_type, 40),
    p_result_count
  );
end; $$;

revoke execute on function public.record_event(text, text, text, text, text, int) from public;
grant execute on function public.record_event(text, text, text, text, text, int) to anon, authenticated;
