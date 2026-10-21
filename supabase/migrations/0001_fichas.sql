-- La ficha de la persona: one row per record, owned by the signed-in carer or
-- by the autistic person themselves. The record itself is the jsonb `data`
-- (the Ficha shape from src/lib/ficha/model.ts); `updated_at` decides merges.
-- Row-level security: a row is visible and writable only to its owner.

create table if not exists public.fichas (
  id text primary key check (id ~ '^ficha_[a-z0-9_]+$'),
  owner uuid not null default auth.uid() references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists fichas_owner_idx on public.fichas (owner);

alter table public.fichas enable row level security;

drop policy if exists "owner reads" on public.fichas;
create policy "owner reads" on public.fichas for select using (auth.uid() = owner);

drop policy if exists "owner inserts" on public.fichas;
create policy "owner inserts" on public.fichas for insert with check (auth.uid() = owner);

drop policy if exists "owner updates" on public.fichas;
create policy "owner updates" on public.fichas for update using (auth.uid() = owner) with check (auth.uid() = owner);

drop policy if exists "owner deletes" on public.fichas;
create policy "owner deletes" on public.fichas for delete using (auth.uid() = owner);
