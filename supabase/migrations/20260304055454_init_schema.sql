-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  language text default 'en',
  theme text default 'dark',
  goal text,
  cefr_level text default 'A1',
  voiceup_score integer default 0,
  speaking_score integer default 0,
  listening_score integer default 0,
  reading_score integer default 0,
  writing_score integer default 0,
  xp integer default 0,
  streak_count integer default 0,
  streak_freeze_available boolean default false,
  last_active_date date,
  interview_date date,
  daily_goal_minutes integer default 20,
  placement_done boolean default false,
  created_at timestamptz default now()
);

-- SESSIONS
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  skill text,
  lesson_id text,
  duration_seconds integer,
  score integer,
  xp_earned integer,
  created_at timestamptz default now()
);

-- MISTAKES
create table if not exists public.mistakes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  original_text text,
  corrected_text text,
  rule_explanation text,
  practiced boolean default false,
  created_at timestamptz default now()
);

-- ROADMAP
create table if not exists public.roadmap (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  day_number integer,
  title text,
  skill text,
  lesson_id text,
  scheduled_date date,
  completed boolean default false,
  created_at timestamptz default now()
);

-- CHALLENGES
create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  challenge_date date,
  challenge_type text,
  score integer,
  duration_seconds integer,
  created_at timestamptz default now()
);

-- FEEDBACK
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  session_id uuid references public.sessions(id) on delete cascade,
  emoji_rating integer,
  text_feedback text,
  nps_score integer,
  created_at timestamptz default now()
);

-- CERTIFICATES
create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  certificate_type text,
  cefr_level text,
  verification_url text unique,
  issued_at timestamptz default now()
);

-- BADGES
create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  badge_type text,
  earned_at timestamptz default now()
);

-- ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.sessions enable row level security;
alter table public.mistakes enable row level security;
alter table public.roadmap enable row level security;
alter table public.challenges enable row level security;
alter table public.feedback enable row level security;
alter table public.certificates enable row level security;
alter table public.badges enable row level security;

-- Policies for Profiles
create policy "Users can view own profile" 
on public.profiles for select 
using (auth.uid() = id);

create policy "Users can update own profile" 
on public.profiles for update 
using (auth.uid() = id);

-- Policies for Sessions
create policy "Users can view own sessions" 
on public.sessions for select 
using (auth.uid() = user_id);

create policy "Users can insert own sessions" 
on public.sessions for insert 
with check (auth.uid() = user_id);

-- Policies for Mistakes
create policy "Users can view own mistakes" 
on public.mistakes for select 
using (auth.uid() = user_id);

create policy "Users can insert own mistakes" 
on public.mistakes for insert 
with check (auth.uid() = user_id);

create policy "Users can update own mistakes" 
on public.mistakes for update 
using (auth.uid() = user_id);

-- Policies for Roadmap
create policy "Users can view own roadmap" 
on public.roadmap for select 
using (auth.uid() = user_id);

create policy "Users can update own roadmap" 
on public.roadmap for update 
using (auth.uid() = user_id);

create policy "Users can insert own roadmap" 
on public.roadmap for insert 
with check (auth.uid() = user_id);

-- Policies for Challenges
create policy "Users can view own challenges" 
on public.challenges for select 
using (auth.uid() = user_id);

create policy "Users can insert own challenges" 
on public.challenges for insert 
with check (auth.uid() = user_id);

create policy "Users can update own challenges" 
on public.challenges for update 
using (auth.uid() = user_id);

-- Policies for Feedback
create policy "Users can view own feedback" 
on public.feedback for select 
using (auth.uid() = user_id);

create policy "Users can insert own feedback" 
on public.feedback for insert 
with check (auth.uid() = user_id);

-- Policies for Certificates
create policy "Users can view own certificates" 
on public.certificates for select 
using (auth.uid() = user_id);

-- Policies for Badges
create policy "Users can view own badges" 
on public.badges for select 
using (auth.uid() = user_id);

-- FUNCTIONS
create or replace function public.increment_streak(p_user_id uuid)
returns void as $$
begin
  update public.profiles
  set streak_count = streak_count + 1
  where id = p_user_id;
end;
$$ language plpgsql security definer;

create or replace function public.reset_streak(p_user_id uuid)
returns void as $$
begin
  update public.profiles
  set streak_count = 0
  where id = p_user_id;
end;
$$ language plpgsql security definer;

create or replace function public.add_xp(p_user_id uuid, p_amount integer)
returns void as $$
begin
  update public.profiles
  set xp = xp + p_amount
  where id = p_user_id;
end;
$$ language plpgsql security definer;

create or replace function public.update_scores(p_user_id uuid, p_skill text, p_new_score integer)
returns void as $$
begin
  if p_skill = 'speaking' then
    update public.profiles set speaking_score = p_new_score where id = p_user_id;
  elsif p_skill = 'listening' then
    update public.profiles set listening_score = p_new_score where id = p_user_id;
  elsif p_skill = 'reading' then
    update public.profiles set reading_score = p_new_score where id = p_user_id;
  elsif p_skill = 'writing' then
    update public.profiles set writing_score = p_new_score where id = p_user_id;
  end if;
end;
$$ language plpgsql security definer;

-- TRIGGERS
-- Trigger: Auto-create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger: Auto-update last_active_date
create or replace function public.handle_session_insert() 
returns trigger as $$
begin
  update public.profiles
  set last_active_date = current_date
  where id = new.user_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_session_created
  after insert on public.sessions
  for each row execute procedure public.handle_session_insert();
