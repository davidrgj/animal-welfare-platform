-- Harden welfare photo storage for existing Supabase projects.
-- Run in the SQL editor (or via supabase db) after deploying the signed-URL client.

update storage.buckets
set public = false
where id = 'welfare-photos';

drop policy if exists photo_read on storage.objects;
create policy photo_read on storage.objects for select to authenticated
  using (bucket_id = 'welfare-photos');

drop policy if exists photo_write on storage.objects;
create policy photo_write on storage.objects for insert to authenticated
  with check (bucket_id = 'welfare-photos');

drop policy if exists photo_update on storage.objects;
create policy photo_update on storage.objects for update to authenticated
  using (bucket_id = 'welfare-photos') with check (bucket_id = 'welfare-photos');

drop policy if exists photo_delete on storage.objects;
create policy photo_delete on storage.objects for delete to authenticated
  using (bucket_id = 'welfare-photos');
