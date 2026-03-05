-- =============================================================================
-- Migration: Fix schema gaps between frontend expectations and existing schema
-- Created: 2026-03-05
--
-- Context: The first two migrations created profiles/sessions tables but with
-- column names that don't match what the frontend code reads/writes.
-- This migration adds the missing columns (all idempotent via IF NOT EXISTS).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- PROFILES: Add columns required by the frontend that are missing
-- ---------------------------------------------------------------------------

-- The frontend reads `profile.streak` but migration 1 created `streak_count`.
-- Add `streak` as a real column (kept in sync with streak_count via trigger).
alter table public.profiles add column if not exists streak integer default 0;

-- The progress page reads `p.scores` as a JSON blob (e.g. {"speaking": 72, "grammar": 65})
-- Migration 1 only had individual columns (speaking_score, listening_score etc.).
-- Add a scores jsonb column with an empty default.
alter table public.profiles add column if not exists scores jsonb default '{}'::jsonb;

-- Settings ProfileTab selects `daily_goal_minutes` — already exists in migration 1 ✅
-- Settings ProfileTab selects `interview_date` — already exists in migration 1 ✅
-- Settings PreferencesTab selects `theme`, `nova_voice`, `reminder_enabled`, `reminder_time`
--   theme: migration 1 ✅  |  nova_voice: migration 2 ✅  |  reminder_enabled/time: migration 2 ✅

-- `avatar_url`, `full_name`, `cefr_level`, `xp`, `earned_badges` — all exist ✅

-- `description` field (AccountTab export, migration 2 already added it) ✅
-- `generated_roadmap` (roadmap page, migration 2 already added it) ✅
-- `placement_done` — already exists ✅
-- `last_active_date` — already exists ✅

-- Allow upsert in ProfileTab (insert own profile if first login via social auth)
-- Check if policy already exists before creating to avoid duplicate errors
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'profiles'
      and policyname = 'Users can insert own profile'
  ) then
    execute 'create policy "Users can insert own profile"
      on public.profiles for insert
      with check (auth.uid() = id)';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- SESSIONS: Add columns that the frontend inserts but didn't exist
-- ---------------------------------------------------------------------------

-- `type` column — added in migration 2 ✅
-- `mistakes_count` — added in migration 2 ✅
-- `lesson_id` — exists in migration 1 ✅
-- `duration_seconds` — exists in migration 1 ✅
-- `xp_earned` — exists in migration 1 ✅
-- `skill` — exists in migration 1 ✅

-- The progress page reads `session.duration` (integer, in minutes).
-- Some insert sites use `duration_minutes` (checkpoint, weekly tests).
-- Add both as separate nullable columns so all callers work.
alter table public.sessions add column if not exists duration integer; -- minutes alias
alter table public.sessions add column if not exists duration_minutes integer;

-- `activity_type` is used by some insert sites alongside `type`
alter table public.sessions add column if not exists activity_type text;

-- ---------------------------------------------------------------------------
-- KEEP streak + streak_count IN SYNC
-- Update the existing handle_session_insert trigger to also mirror streak_count → streak
-- and keep the scores jsonb column up to date.
-- ---------------------------------------------------------------------------

create or replace function public.sync_streak_column()
returns trigger as $$
begin
  -- Mirror streak_count into streak so frontend reads profile.streak correctly
  if new.streak_count is distinct from old.streak_count then
    new.streak := new.streak_count;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Drop existing trigger if any, then recreate
drop trigger if exists sync_streak_on_update on public.profiles;
create trigger sync_streak_on_update
  before update on public.profiles
  for each row execute procedure public.sync_streak_column();

-- ---------------------------------------------------------------------------
-- BACK-FILL: Set streak = streak_count for all existing rows
-- ---------------------------------------------------------------------------
update public.profiles set streak = coalesce(streak_count, 0) where streak is distinct from streak_count;

-- ---------------------------------------------------------------------------
-- BACK-FILL scores jsonb from individual score columns for existing rows
-- ---------------------------------------------------------------------------
update public.profiles
set scores = jsonb_build_object(
  'speaking',   coalesce(speaking_score, 0),
  'grammar',    0,
  'listening',  coalesce(listening_score, 0),
  'vocabulary', 0,
  'writing',    coalesce(writing_score, 0)
)
where scores = '{}'::jsonb or scores is null;

-- ---------------------------------------------------------------------------
-- ENSURE the auth trigger exists (idempotent — or replace is safe)
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id,
    full_name,
    avatar_url,
    cefr_level,
    daily_goal_minutes,
    theme,
    nova_voice,
    reminder_enabled,
    streak,
    streak_count,
    xp,
    earned_badges,
    scores
  ) values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    'A1',
    10,
    'dark',
    'default',
    false,
    0,
    0,
    0,
    '[]',
    '{}'::jsonb
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Drop and recreate the trigger to pick up the updated function
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- STORAGE: Create avatars bucket if it doesn't exist (for ProfileTab uploads)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- RLS policy on avatars storage
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename  = 'objects'
      and policyname = 'Avatar images are publicly accessible'
  ) then
    execute 'create policy "Avatar images are publicly accessible"
      on storage.objects for select
      using (bucket_id = ''avatars'')';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename  = 'objects'
      and policyname = 'Users can upload their own avatar'
  ) then
    execute 'create policy "Users can upload their own avatar"
      on storage.objects for insert
      with check (bucket_id = ''avatars'' and auth.uid() is not null)';
  end if;
end $$;
