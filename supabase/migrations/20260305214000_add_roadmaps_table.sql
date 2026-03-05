-- Add roadmaps table for storing user-generated roadmap history
create table if not exists public.roadmaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  goal_text text not null,
  roadmap_json jsonb not null,
  advice text,
  created_at timestamptz default now()
);

alter table public.roadmaps enable row level security;

create policy "Users can view own roadmaps"
  on public.roadmaps for select
  using (auth.uid() = user_id);

create policy "Users can insert own roadmaps"
  on public.roadmaps for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own roadmaps"
  on public.roadmaps for delete
  using (auth.uid() = user_id);
