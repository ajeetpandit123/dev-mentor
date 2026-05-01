-- Profiles table (extends Supabase Auth)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique,
  full_name text,
  avatar_url text,
  plan text default 'Free',
  analysis_tokens integer default 3,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Projects table
create table projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  repo_name text,
  repo_url text,
  analysis_result jsonb,
  score float,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Resumes table
create table resumes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  file_url text,
  analysis_result jsonb,
  ats_score float,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Skills table
create table skills (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  skill_name text,
  level integer check (level between 1 and 10),
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Roadmaps table
create table roadmaps (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  roadmap_json jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Chat History table
create table chat_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  message text,
  response text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Activities table
create table activities (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text,
  description text,
  type text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;
alter table projects enable row level security;
alter table resumes enable row level security;
alter table skills enable row level security;
alter table roadmaps enable row level security;
alter table chat_history enable row level security;
alter table activities enable row level security;

-- Policies
create policy "Users can view their own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);

create policy "Users can view their own projects" on projects for select using (auth.uid() = user_id);
create policy "Users can insert their own projects" on projects for insert with check (auth.uid() = user_id);

create policy "Users can view their own resumes" on resumes for select using (auth.uid() = user_id);
create policy "Users can insert their own resumes" on resumes for insert with check (auth.uid() = user_id);

create policy "Users can view their own skills" on skills for select using (auth.uid() = user_id);
create policy "Users can update their own skills" on skills for all using (auth.uid() = user_id);

create policy "Users can view their own roadmaps" on roadmaps for select using (auth.uid() = user_id);
create policy "Users can insert their own roadmaps" on roadmaps for insert with check (auth.uid() = user_id);

create policy "Users can view their own chat history" on chat_history for select using (auth.uid() = user_id);
create policy "Users can insert their own chat history" on chat_history for insert with check (auth.uid() = user_id);

create policy "Users can view their own activities" on activities for select using (auth.uid() = user_id);
create policy "Users can insert their own activities" on activities for insert with check (auth.uid() = user_id);

-- Trigger for automatic profile creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to decrement tokens safely
create or replace function decrement_tokens(user_id uuid)
returns void as $$
begin
  update profiles
  set analysis_tokens = analysis_tokens - 1
  where id = user_id and analysis_tokens > 0;
end;
$$ language plpgsql security definer;

