-- Run once in Supabase SQL editor (project gkomojjjyydbdajpxyqw).
-- Goal: register → sign in immediately, without clicking the confirmation email.
--
-- ALSO do this in the dashboard (required for signUp to return a session):
-- Authentication → Providers → Email → turn OFF "Confirm email"
-- Authentication → URL Configuration → Site URL =
--   https://animal-welfare-platform-vepq.vercel.app

-- Confirm every pending user so they can log in now (e.g. Daniela).
update auth.users
set
  email_confirmed_at = coalesce(email_confirmed_at, now()),
  updated_at = now()
where email_confirmed_at is null;

-- Future inserts: mark email confirmed at creation time (helps login even if Confirm email is still on).
create or replace function public.autoconfirm_auth_user()
returns trigger
language plpgsql
security definer
set search_path = auth
as $$
begin
  if new.email_confirmed_at is null then
    new.email_confirmed_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_autoconfirm on auth.users;
create trigger on_auth_user_autoconfirm
  before insert on auth.users
  for each row
  execute function public.autoconfirm_auth_user();
