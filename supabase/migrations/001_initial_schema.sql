-- =============================================================================
-- VoiceUp — Complete Initial Schema (Consolidated)
-- Run this once in Supabase SQL Editor, or via: node setup-db.js
-- =============================================================================

-- UUID extension
create extension if not exists "uuid-ossp";

-- =============================================================================
-- PROFILES
-- =============================================================================
create table if not exists public.profiles (
  id                    uuid references auth.users on delete cascade primary key,
  full_name             text,
  avatar_url            text,
  cefr_level            text            default 'A1',
  daily_goal_minutes    integer         default 10,
  interview_date        date,
  theme                 text            default 'dark',
  nova_voice            text            default 'default',
  reminder_enabled      boolean         default false,
  reminder_time         text,
  streak                integer         default 0,
  streak_count          integer         default 0,
  last_active_date      date,
  xp                    integer         default 0,
  scores                jsonb           default '{}'::jsonb,
  earned_badges         text            default '[]',
  generated_roadmap     text,
  description           text,
  language              text            default 'en',
  goal                  text,
  placement_done        boolean         default false,
  speaking_score        integer         default 0,
  listening_score       integer         default 0,
  reading_score         integer         default 0,
  writing_score         integer         default 0,
  voiceup_score         integer         default 0,
  streak_freeze_available boolean       default false,
  created_at            timestamptz     default now()
);

-- =============================================================================
-- SESSIONS
-- =============================================================================
create table if not exists public.sessions (
  id                uuid   primary key default gen_random_uuid(),
  user_id           uuid   references public.profiles(id) on delete cascade not null,
  type              text,
  activity_type     text,
  skill             text,
  lesson_id         text,
  score             integer,
  duration          integer,             -- minutes
  duration_minutes  integer,             -- alias (minutes)
  duration_seconds  integer,             -- raw seconds from some callers
  mistakes_count    integer,
  xp_earned         integer,
  created_at        timestamptz default now()
);

-- =============================================================================
-- ROADMAPS (chat-style history)
-- =============================================================================
create table if not exists public.roadmaps (
  id            uuid   primary key default gen_random_uuid(),
  user_id       uuid   references public.profiles(id) on delete cascade not null,
  goal_text     text   not null,
  roadmap_json  jsonb  not null,
  advice        text,
  created_at    timestamptz default now()
);

-- =============================================================================
-- MISTAKES
-- =============================================================================
create table if not exists public.mistakes (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references public.profiles(id) on delete cascade not null,
  original_text    text,
  corrected_text   text,
  rule_explanation text,
  practiced        boolean default false,
  created_at       timestamptz default now()
);

-- =============================================================================
-- CHALLENGES
-- =============================================================================
create table if not exists public.challenges (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references public.profiles(id) on delete cascade not null,
  challenge_date   date,
  challenge_type   text,
  score            integer,
  duration_seconds integer,
  created_at       timestamptz default now()
);

-- =============================================================================
-- CERTIFICATES
-- =============================================================================
create table if not exists public.certificates (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references public.profiles(id) on delete cascade not null,
  certificate_type text,
  cefr_level       text,
  verification_url text unique,
  issued_at        timestamptz default now()
);

-- =============================================================================
-- STORAGE — avatars bucket
-- =============================================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
alter table public.profiles    enable row level security;
alter table public.sessions    enable row level security;
alter table public.roadmaps    enable row level security;
alter table public.mistakes    enable row level security;
alter table public.challenges  enable row level security;
alter table public.certificates enable row level security;

-- PROFILES
do $$ begin
  if not exists (select 1 from pg_policies where tablename='profiles' and policyname='Users can view own profile') then
    execute 'create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id)';
  end if;
  if not exists (select 1 from pg_policies where tablename='profiles' and policyname='Users can insert own profile') then
    execute 'create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id)';
  end if;
  if not exists (select 1 from pg_policies where tablename='profiles' and policyname='Users can update own profile') then
    execute 'create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id)';
  end if;
  if not exists (select 1 from pg_policies where tablename='profiles' and policyname='Users can delete own profile') then
    execute 'create policy "Users can delete own profile" on public.profiles for delete using (auth.uid() = id)';
  end if;
end $$;

-- SESSIONS
do $$ begin
  if not exists (select 1 from pg_policies where tablename='sessions' and policyname='Users can view own sessions') then
    execute 'create policy "Users can view own sessions" on public.sessions for select using (auth.uid() = user_id)';
  end if;
  if not exists (select 1 from pg_policies where tablename='sessions' and policyname='Users can insert own sessions') then
    execute 'create policy "Users can insert own sessions" on public.sessions for insert with check (auth.uid() = user_id)';
  end if;
end $$;

-- ROADMAPS
do $$ begin
  if not exists (select 1 from pg_policies where tablename='roadmaps' and policyname='Users can view own roadmaps') then
    execute 'create policy "Users can view own roadmaps" on public.roadmaps for select using (auth.uid() = user_id)';
  end if;
  if not exists (select 1 from pg_policies where tablename='roadmaps' and policyname='Users can insert own roadmaps') then
    execute 'create policy "Users can insert own roadmaps" on public.roadmaps for insert with check (auth.uid() = user_id)';
  end if;
  if not exists (select 1 from pg_policies where tablename='roadmaps' and policyname='Users can delete own roadmaps') then
    execute 'create policy "Users can delete own roadmaps" on public.roadmaps for delete using (auth.uid() = user_id)';
  end if;
end $$;

-- MISTAKES
do $$ begin
  if not exists (select 1 from pg_policies where tablename='mistakes' and policyname='Users can view own mistakes') then
    execute 'create policy "Users can view own mistakes" on public.mistakes for select using (auth.uid() = user_id)';
  end if;
  if not exists (select 1 from pg_policies where tablename='mistakes' and policyname='Users can insert own mistakes') then
    execute 'create policy "Users can insert own mistakes" on public.mistakes for insert with check (auth.uid() = user_id)';
  end if;
  if not exists (select 1 from pg_policies where tablename='mistakes' and policyname='Users can update own mistakes') then
    execute 'create policy "Users can update own mistakes" on public.mistakes for update using (auth.uid() = user_id)';
  end if;
end $$;

-- STORAGE — avatars
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Avatar images are publicly accessible') then
    execute 'create policy "Avatar images are publicly accessible" on storage.objects for select using (bucket_id = ''avatars'')';
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Users can upload their own avatar') then
    execute 'create policy "Users can upload their own avatar" on storage.objects for insert with check (bucket_id = ''avatars'' and auth.uid() is not null)';
  end if;
end $$;

-- =============================================================================
-- TRIGGER — Auto-create profile on signup
-- =============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id, full_name, avatar_url,
    cefr_level, daily_goal_minutes, theme, nova_voice,
    reminder_enabled, streak, streak_count, xp,
    earned_badges, scores
  ) values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    'A1', 10, 'dark', 'default',
    false, 0, 0, 0,
    '[]', '{}'::jsonb
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================================================
-- TRIGGER — Keep streak_count and streak in sync on profile update
-- =============================================================================
create or replace function public.sync_streak_column()
returns trigger as $$
begin
  if new.streak_count is distinct from old.streak_count then
    new.streak := new.streak_count;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists sync_streak_on_update on public.profiles;
create trigger sync_streak_on_update
  before update on public.profiles
  for each row execute procedure public.sync_streak_column();

-- =============================================================================
-- TRIGGER — Auto-update last_active_date on session insert
-- =============================================================================
create or replace function public.handle_session_insert()
returns trigger as $$
begin
  update public.profiles
  set last_active_date = current_date
  where id = new.user_id;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_session_created on public.sessions;
create trigger on_session_created
  after insert on public.sessions
  for each row execute procedure public.handle_session_insert();
