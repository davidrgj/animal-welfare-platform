-- Optional cloud schema (Supabase / Postgres). The running prototype stores the same tables in the browser.
create table if not exists profiles (
  id uuid primary key,
  full_name text not null,
  email text not null unique,
  document_id text not null,
  phone text,
  role text not null check (role in ('PRODUCER', 'VETERINARIAN', 'ADMINISTRATOR')),
  created_at timestamptz not null default now()
);

create table if not exists farms (
  id uuid primary key,
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
  id uuid primary key,
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
  id uuid primary key,
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
  id uuid primary key,
  welfare_record_id uuid not null references welfare_records(id) on delete cascade,
  code text not null,
  domain text not null,
  severity text not null
);

create table if not exists welfare_photos (
  id uuid primary key,
  welfare_record_id uuid not null references welfare_records(id) on delete cascade,
  file_name text not null,
  content_type text not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);

create table if not exists alerts (
  id uuid primary key,
  farm_id uuid not null references farms(id) on delete cascade,
  animal_id uuid references animals(id) on delete cascade,
  severity text not null,
  code text not null,
  acknowledged boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists simulation_runs (
  id uuid primary key,
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
  id uuid primary key,
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
  id uuid primary key,
  simulation_run_id uuid not null references simulation_runs(id) on delete cascade,
  day_index int not null,
  event_date date not null,
  event_type text not null,
  from_stage text,
  to_stage text,
  related_value numeric
);
