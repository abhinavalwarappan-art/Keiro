-- Users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) primary key,
  name text,
  age integer,
  sex text check (sex in ('male', 'female', 'prefer_not_to_say')),
  preferred_language text not null default 'en',
  language_code text not null default 'en-US',
  romanization_enabled boolean default false,
  preferred_voice text,
  is_anonymous boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Hospitals table (referenced by sessions)
create table public.hospitals (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  location text,
  qr_slug text unique,
  contact_email text,
  active boolean default true,
  created_at timestamp with time zone default now()
);

-- Sessions table
create table public.sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  hospital_id uuid references public.hospitals(id),
  mode text check (mode in ('new_symptoms', 'known_diagnosis', 'returning')),
  language text not null,
  language_code text not null,
  status text default 'active' check (status in ('active', 'completed', 'abandoned')),
  started_at timestamp with time zone default now(),
  completed_at timestamp with time zone,
  expires_at timestamp with time zone default (now() + interval '2 hours')
);

-- Reports table
create table public.reports (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.sessions(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  report_id text unique not null,
  patient_name text,
  patient_age integer,
  patient_sex text,
  language_used text,
  visit_type text,
  chief_complaint text,
  symptoms_json jsonb,
  associated_symptoms_json jsonb,
  lifestyle_json jsonb,
  medications_json jsonb,
  conditions_json jsonb,
  family_history_json jsonb,
  allergies_json jsonb,
  possible_conditions_json jsonb,
  additional_notes text,
  created_at timestamp with time zone default now()
);

-- API calls table (for rate limiting)
create table public.api_calls (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  endpoint text not null,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security on ALL tables
alter table public.profiles enable row level security;
alter table public.sessions enable row level security;
alter table public.reports enable row level security;
alter table public.hospitals enable row level security;
alter table public.api_calls enable row level security;

-- RLS Policies
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can view own sessions"
  on public.sessions for select using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on public.sessions for insert with check (auth.uid() = user_id);

create policy "Users can view own reports"
  on public.reports for select using (auth.uid() = user_id);

create policy "Users can insert own reports"
  on public.reports for insert with check (auth.uid() = user_id);

create policy "Users can delete own reports"
  on public.reports for delete using (auth.uid() = user_id);

create policy "Users can view own api calls"
  on public.api_calls for select using (auth.uid() = user_id);

create policy "Users can insert own api calls"
  on public.api_calls for insert with check (auth.uid() = user_id);

-- Hospitals are publicly readable
create policy "Hospitals are publicly readable"
  on public.hospitals for select using (true);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, is_anonymous)
  values (new.id, (new.raw_user_meta_data->>'is_anonymous')::boolean);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Index for rate limiting queries
create index on public.api_calls (user_id, endpoint, created_at);
