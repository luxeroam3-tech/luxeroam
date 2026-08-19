-- Bucket for photos uploaded from an admin's device. Public-read so next/image
-- can fetch without a signed URL; writes are admin-only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'place-photos', 'place-photos', true, 10485760,
  array['image/jpeg','image/png','image/webp','image/avif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "Public read place photo files" on storage.objects
  for select using (bucket_id = 'place-photos');

create policy "Admins upload place photo files" on storage.objects
  for insert with check (bucket_id = 'place-photos' and is_admin());

create policy "Admins update place photo files" on storage.objects
  for update using (bucket_id = 'place-photos' and is_admin())
  with check (bucket_id = 'place-photos' and is_admin());

create policy "Admins delete place photo files" on storage.objects
  for delete using (bucket_id = 'place-photos' and is_admin());
