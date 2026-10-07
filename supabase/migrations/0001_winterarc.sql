create table if not exists public.winterarc_profiles (
  user_id text primary key,
  target_weight double precision,
  daily_protein integer not null default 150,
  daily_steps integer not null default 10000,
  workouts_per_week integer not null default 4,
  updated_at timestamptz not null default now()
);

create table if not exists public.winterarc_logs (
  user_id text not null,
  log_date date not null,
  workouts jsonb not null default '[]'::jsonb,
  weight double precision,
  protein double precision,
  steps integer,
  notes text,
  updated_at timestamptz not null default now(),
  primary key (user_id, log_date)
);

create index if not exists winterarc_logs_user_id_idx
  on public.winterarc_logs (user_id);

alter table public.winterarc_profiles enable row level security;
alter table public.winterarc_logs enable row level security;

grant select, insert, update, delete
  on table public.winterarc_profiles, public.winterarc_logs
  to authenticated;

drop policy if exists winterarc_profiles_owner on public.winterarc_profiles;
create policy winterarc_profiles_owner on public.winterarc_profiles
  for all to authenticated
  using (user_id = (select auth.uid())::text)
  with check (user_id = (select auth.uid())::text);

drop policy if exists winterarc_logs_owner on public.winterarc_logs;
create policy winterarc_logs_owner on public.winterarc_logs
  for all to authenticated
  using (user_id = (select auth.uid())::text)
  with check (user_id = (select auth.uid())::text);
