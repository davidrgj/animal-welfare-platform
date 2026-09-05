-- Run once if schema.sql was already applied earlier.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'ADMINISTRATOR'
  );
$$;

grant execute on function public.is_admin() to authenticated;

drop policy if exists profiles_select on profiles;
create policy profiles_select on profiles for select to authenticated
  using (id = auth.uid() or public.is_staff());

drop policy if exists profiles_update on profiles;
create policy profiles_update on profiles for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

drop policy if exists profiles_insert on profiles;
create policy profiles_insert on profiles for insert to authenticated
  with check (public.is_admin() or id = auth.uid());
