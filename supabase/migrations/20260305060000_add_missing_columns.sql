-- Add missing columns to sessions table
alter table public.sessions add column if not exists type text;
alter table public.sessions add column if not exists mistakes_count integer;

-- Add missing columns to profiles table
alter table public.profiles add column if not exists nova_voice text;
alter table public.profiles add column if not exists reminder_enabled boolean default false;
alter table public.profiles add column if not exists reminder_time text default '20:00';
alter table public.profiles add column if not exists generated_roadmap text;
alter table public.profiles add column if not exists earned_badges text default '[]';
alter table public.profiles add column if not exists description text;

-- Add missing RLS policy: allow users to delete own profile (account deletion)
create policy "Users can delete own profile"
on public.profiles for delete
using (auth.uid() = id);
