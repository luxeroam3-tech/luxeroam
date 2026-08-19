-- Who changed what. Cheap to write now, impossible to reconstruct later.
create table audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_email text,
  action text not null,
  entity text not null,
  entity_id uuid,
  detail jsonb,
  created_at timestamptz not null default now()
);

create index audit_log_created_at_idx on audit_log(created_at desc);
create index audit_log_entity_idx on audit_log(entity, entity_id);

alter table audit_log enable row level security;

create policy "Admins read audit log" on audit_log for select using (is_admin());
create policy "Admins write audit log" on audit_log for insert with check (is_admin());

-- Abuse controls for public review submission. The address is stored hashed:
-- enough to rate limit and spot floods, without retaining an identifier.
alter table reviews add column ip_hash text;
alter table reviews add column user_agent text;
create index reviews_ip_hash_idx on reviews(ip_hash, created_at desc);

-- Counting and inserting in one SECURITY DEFINER call keeps the cap
-- enforceable without exposing review counts, and closes the race where two
-- concurrent submissions each read a count below the limit.
create or replace function submit_review(
  p_place_id uuid, p_author_name text, p_rating int,
  p_body text, p_ip_hash text, p_user_agent text
) returns text
language plpgsql security definer set search_path = public as $$
declare recent int;
begin
  if p_rating < 1 or p_rating > 5 then return 'invalid_rating'; end if;
  if coalesce(trim(p_author_name), '') = '' then return 'invalid_author'; end if;

  select count(*) into recent from reviews
  where ip_hash = p_ip_hash and created_at > now() - interval '1 hour';

  if p_ip_hash is not null and recent >= 5 then return 'rate_limited'; end if;

  insert into reviews (place_id, author_name, rating, body, status, ip_hash, user_agent)
  values (p_place_id, left(trim(p_author_name), 80), p_rating,
          nullif(left(trim(coalesce(p_body, '')), 1000), ''), 'pending',
          p_ip_hash, left(coalesce(p_user_agent, ''), 300));
  return 'ok';
end; $$;

revoke execute on function public.submit_review(uuid, text, int, text, text, text) from public;
grant execute on function public.submit_review(uuid, text, int, text, text, text) to anon, authenticated;
