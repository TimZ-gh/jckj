create extension if not exists pgcrypto;

create table if not exists public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  submitted_at timestamptz not null default now(),
  name text,
  department text,
  role text,
  phone text,
  platforms text[] default '{}',
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.survey_responses enable row level security;

drop policy if exists "Allow public survey inserts" on public.survey_responses;
create policy "Allow public survey inserts"
on public.survey_responses
for insert
to anon
with check (true);

drop policy if exists "Allow authenticated survey reads" on public.survey_responses;
create policy "Allow authenticated survey reads"
on public.survey_responses
for select
to authenticated
using (true);
