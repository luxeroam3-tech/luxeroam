-- Granting admin rights needs to look up auth.users, which the anon key cannot
-- read. These wrap that lookup and re-check is_admin() inside, so only an
-- existing admin can promote or demote anyone. Verified: a signed-in
-- non-admin gets 'forbidden' from both.
create or replace function grant_admin(p_email text)
returns text language plpgsql security definer set search_path = public as $$
declare target uuid;
begin
  if not is_admin() then return 'forbidden'; end if;
  select id into target from auth.users where lower(email) = lower(trim(p_email));
  if target is null then return 'no_such_user'; end if;
  insert into admin_users (user_id, email) values (target, lower(trim(p_email)))
  on conflict (user_id) do nothing;
  return 'ok';
end; $$;

create or replace function revoke_admin(p_email text)
returns text language plpgsql security definer set search_path = public as $$
declare remaining int;
begin
  if not is_admin() then return 'forbidden'; end if;
  -- Refuse to remove the last admin; undoing that would need database access.
  select count(*) into remaining from admin_users;
  if remaining <= 1 then return 'last_admin'; end if;
  delete from admin_users where lower(email) = lower(trim(p_email));
  return 'ok';
end; $$;

revoke execute on function public.grant_admin(text) from public, anon;
revoke execute on function public.revoke_admin(text) from public, anon;
grant execute on function public.grant_admin(text) to authenticated;
grant execute on function public.revoke_admin(text) to authenticated;
