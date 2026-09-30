-- Per-user Winterarc workout logs and goals (Oct–Dec 2026 season).
create table if not exists winterarc_profiles (
  user_id text primary key,
  target_weight double precision,
  daily_protein integer not null default 150,
  daily_steps integer not null default 10000,
  workouts_per_week integer not null default 4,
  updated_at timestamptz not null default now()
);

create table if not exists winterarc_logs (
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

create index if not exists winterarc_logs_user_id_idx on winterarc_logs (user_id);
