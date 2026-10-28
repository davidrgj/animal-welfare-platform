-- Run this in the Supabase SQL editor (once).
create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  document_id text not null,
  phone text,
  role text not null check (role in ('PRODUCER', 'VETERINARIAN', 'ADMINISTRATOR')),
  created_at timestamptz not null default now()
);

create table if not exists farms (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  vaccination_registry text not null,
  hectares numeric not null,
  latitude numeric not null,
  longitude numeric not null,
  water_source text not null,
  soil_type text,
  department text,
  municipality text,
  created_at timestamptz not null default now()
);

create table if not exists animals (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references farms(id) on delete cascade,
  tag_id text not null,
  species text not null,
  breed text not null,
  birth_date date not null,
  sex text not null,
  initial_weight_kg numeric not null,
  current_weight_kg numeric not null,
  reproductive_status text not null,
  purpose text not null,
  horn_type text,
  electric_fence_associated boolean,
  swine_stage text,
  environmental_enrichment boolean,
  created_at timestamptz not null default now(),
  unique (farm_id, tag_id)
);

create table if not exists welfare_records (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid not null references animals(id) on delete cascade,
  evaluator_id uuid not null references profiles(id),
  recorded_at timestamptz not null,
  body_condition_score int not null,
  hydration_times_per_day int not null,
  bedding_status text not null,
  shade_percentage int not null,
  ambient_temperature_c numeric not null,
  relative_humidity int not null,
  lameness text not null,
  skin_lesions boolean not null,
  vaccination_up_to_date boolean not null,
  space_per_animal_m2 numeric not null,
  social_interaction text not null,
  handling_quality text not null,
  notes text,
  nutrition_score numeric not null,
  environment_score numeric not null,
  health_score numeric not null,
  behavior_score numeric not null,
  mental_score numeric not null,
  welfare_index numeric not null,
  compliance_level text not null,
  temperature_humidity_index numeric not null
);

create table if not exists compliance_findings (
  id uuid primary key default gen_random_uuid(),
  welfare_record_id uuid not null references welfare_records(id) on delete cascade,
  code text not null,
  domain text not null,
  severity text not null
);

create table if not exists welfare_photos (
  id uuid primary key default gen_random_uuid(),
  welfare_record_id uuid not null references welfare_records(id) on delete cascade,
  file_name text not null,
  content_type text not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);

create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references farms(id) on delete cascade,
  animal_id uuid references animals(id) on delete cascade,
  severity text not null,
  code text not null,
  acknowledged boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists simulation_runs (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references farms(id) on delete cascade,
  animal_id uuid not null references animals(id) on delete cascade,
  created_by_id uuid not null references profiles(id),
  name text not null,
  feed_type text not null,
  scenario text not null,
  horizon_days int not null,
  start_date date not null,
  estimated_compliance_date date,
  estimated_target_weight_date date,
  final_weight_kg numeric not null,
  final_welfare_index numeric not null,
  created_at timestamptz not null default now()
);

create table if not exists simulation_snapshots (
  id uuid primary key default gen_random_uuid(),
  simulation_run_id uuid not null references simulation_runs(id) on delete cascade,
  day_index int not null,
  simulated_date date not null,
  weight_kg numeric not null,
  average_daily_gain_kg numeric not null,
  welfare_index numeric not null,
  production_stage text not null,
  ica_weight_target_reached boolean not null
);

create table if not exists simulation_events (
  id uuid primary key default gen_random_uuid(),
  simulation_run_id uuid not null references simulation_runs(id) on delete cascade,
  day_index int not null,
  event_date date not null,
  event_type text not null,
  from_stage text,
  to_stage text,
  related_value numeric
);

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
    coalesce(new.raw_user_meta_data->>'role', 'PRODUCER')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('VETERINARIAN', 'ADMINISTRATOR')
  );
$$;

grant execute on function public.is_staff() to authenticated;

alter table profiles enable row level security;
alter table farms enable row level security;
alter table animals enable row level security;
alter table welfare_records enable row level security;
alter table compliance_findings enable row level security;
alter table welfare_photos enable row level security;
alter table alerts enable row level security;
alter table simulation_runs enable row level security;
alter table simulation_snapshots enable row level security;
alter table simulation_events enable row level security;

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

drop policy if exists farms_select on farms;
create policy farms_select on farms for select to authenticated
  using (owner_id = auth.uid() or public.is_staff());
drop policy if exists farms_insert on farms;
create policy farms_insert on farms for insert to authenticated
  with check (owner_id = auth.uid() or public.is_staff());
drop policy if exists farms_update on farms;
create policy farms_update on farms for update to authenticated
  using (owner_id = auth.uid() or public.is_staff());
drop policy if exists farms_delete on farms;
create policy farms_delete on farms for delete to authenticated
  using (owner_id = auth.uid() or public.is_staff());

drop policy if exists animals_all on animals;
create policy animals_all on animals for all to authenticated
  using (exists (select 1 from farms where farms.id = animals.farm_id and (farms.owner_id = auth.uid() or public.is_staff())))
  with check (exists (select 1 from farms where farms.id = animals.farm_id and (farms.owner_id = auth.uid() or public.is_staff())));

drop policy if exists records_all on welfare_records;
create policy records_all on welfare_records for all to authenticated
  using (exists (
    select 1 from animals join farms on farms.id = animals.farm_id
    where animals.id = welfare_records.animal_id and (farms.owner_id = auth.uid() or public.is_staff())
  ))
  with check (exists (
    select 1 from animals join farms on farms.id = animals.farm_id
    where animals.id = welfare_records.animal_id and (farms.owner_id = auth.uid() or public.is_staff())
  ));

drop policy if exists findings_all on compliance_findings;
create policy findings_all on compliance_findings for all to authenticated
  using (exists (select 1 from welfare_records where welfare_records.id = compliance_findings.welfare_record_id))
  with check (exists (select 1 from welfare_records where welfare_records.id = compliance_findings.welfare_record_id));

drop policy if exists photos_all on welfare_photos;
create policy photos_all on welfare_photos for all to authenticated
  using (exists (select 1 from welfare_records where welfare_records.id = welfare_photos.welfare_record_id))
  with check (exists (select 1 from welfare_records where welfare_records.id = welfare_photos.welfare_record_id));

drop policy if exists alerts_all on alerts;
create policy alerts_all on alerts for all to authenticated
  using (exists (select 1 from farms where farms.id = alerts.farm_id and (farms.owner_id = auth.uid() or public.is_staff())))
  with check (exists (select 1 from farms where farms.id = alerts.farm_id and (farms.owner_id = auth.uid() or public.is_staff())));

drop policy if exists runs_all on simulation_runs;
create policy runs_all on simulation_runs for all to authenticated
  using (exists (select 1 from farms where farms.id = simulation_runs.farm_id and (farms.owner_id = auth.uid() or public.is_staff())))
  with check (exists (select 1 from farms where farms.id = simulation_runs.farm_id and (farms.owner_id = auth.uid() or public.is_staff())));

drop policy if exists snapshots_all on simulation_snapshots;
create policy snapshots_all on simulation_snapshots for all to authenticated
  using (exists (select 1 from simulation_runs where simulation_runs.id = simulation_snapshots.simulation_run_id))
  with check (exists (select 1 from simulation_runs where simulation_runs.id = simulation_snapshots.simulation_run_id));

drop policy if exists events_all on simulation_events;
create policy events_all on simulation_events for all to authenticated
  using (exists (select 1 from simulation_runs where simulation_runs.id = simulation_events.simulation_run_id))
  with check (exists (select 1 from simulation_runs where simulation_runs.id = simulation_events.simulation_run_id));

insert into storage.buckets (id, name, public)
values ('welfare-photos', 'welfare-photos', false)
on conflict (id) do update set public = excluded.public;

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
