-- Who may use the admin dashboard. Membership is granted out-of-band (SQL or
-- the Supabase dashboard); there is deliberately no self-service signup.
create table admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

alter table admin_users enable row level security;

-- SECURITY DEFINER so the check itself bypasses RLS; a policy that queried
-- admin_users directly would recurse into its own policy.
create or replace function is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from admin_users where user_id = auth.uid()
  );
$$;

create policy "Admins read admin_users" on admin_users
  for select using (is_admin());

create policy "Admins read all reviews" on reviews
  for select using (is_admin());
create policy "Admins update reviews" on reviews
  for update using (is_admin()) with check (is_admin());
create policy "Admins delete reviews" on reviews
  for delete using (is_admin());

create policy "Admins read enquiries" on enquiries
  for select using (is_admin());
create policy "Admins update enquiries" on enquiries
  for update using (is_admin()) with check (is_admin());

create policy "Admins update places" on places
  for update using (is_admin()) with check (is_admin());
create policy "Admins insert place photos" on place_photos
  for insert with check (is_admin());
create policy "Admins update place photos" on place_photos
  for update using (is_admin()) with check (is_admin());
create policy "Admins delete place photos" on place_photos
  for delete using (is_admin());
