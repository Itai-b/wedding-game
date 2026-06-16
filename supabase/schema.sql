-- Wedding game — Supabase schema.
-- Run this once in the Supabase dashboard → SQL Editor → New query → Run.

create table if not exists public.players (
  id         text primary key,           -- per-device player id (from the browser)
  name       text not null,
  score      integer not null default 0,
  updated_at timestamptz not null default now()
);

-- Fast leaderboard ordering.
create index if not exists players_score_idx on public.players (score desc);

-- Row Level Security: this is a low-stakes party game, so we allow the public
-- (anon) key to read the leaderboard and upsert/reset scores from the browser.
alter table public.players enable row level security;

drop policy if exists "players read"   on public.players;
drop policy if exists "players insert" on public.players;
drop policy if exists "players update" on public.players;
drop policy if exists "players delete" on public.players;

create policy "players read"   on public.players for select using (true);
create policy "players insert" on public.players for insert with check (true);
create policy "players update" on public.players for update using (true) with check (true);
create policy "players delete" on public.players for delete using (true);

-- Enable realtime so the leaderboard updates live.
alter publication supabase_realtime add table public.players;
