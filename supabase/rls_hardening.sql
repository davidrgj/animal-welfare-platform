-- Run once in the Supabase SQL editor if schema.sql was already applied earlier.
-- Closes the two privilege escalations found by rls_isolation_tests.sql (cases 12 and 13).
-- It does not touch existing users, passwords or rows.

-- Sign-up metadata is written by the client, so it can never grant the administrator role.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, document_id, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Usuario'),
    new.email,
    coalesce(new.raw_user_meta_data->>'document_id', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    case when new.raw_user_meta_data->>'role' = 'VETERINARIAN' then 'VETERINARIAN' else 'PRODUCER' end
  );
  return new;
end;
$$;

-- RLS lets a user update the own profile row; this keeps the role column out of that permission.
-- Requests without a user session (SQL editor, service role) are not restricted.
create or replace function public.guard_profile_role()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;
  if tg_op = 'UPDATE' and new.role is distinct from old.role then
    raise exception 'Only an administrator can change a role' using errcode = 'insufficient_privilege';
  end if;
  if tg_op = 'INSERT' and new.role = 'ADMINISTRATOR' then
    raise exception 'Only an administrator can create an administrator' using errcode = 'insufficient_privilege';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_role on profiles;
create trigger profiles_guard_role
  before insert or update on profiles
  for each row execute function public.guard_profile_role();
