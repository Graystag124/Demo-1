
-- This table stores user profile information and Meta access tokens

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  user_type text not null check (user_type in ('creator', 'business', 'admin')),
  display_name text,
  bio text,
  profile_image_url text,
  
  -- Meta OAuth fields
  meta_access_token text,
  meta_refresh_token text,
  meta_user_id text,
  meta_token_expires_at timestamptz,
  
  -- Instagram Business Account fields (for Meta API)
  instagram_business_account_id text,
  facebook_page_id text,
  
  -- Admin approval system
  approval_status text not null default 'pending' check (approval_status in ('pending', 'approved', 'rejected')),
  approved_at timestamptz,
  rejected_at timestamptz,
  approval_notes text,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.users enable row level security;

-- Users can view their own profile
create policy "users_select_own"
  on public.users for select
  using (auth.uid() = id);

-- Users can update their own profile
create policy "users_update_own"
  on public.users for update
  using (auth.uid() = id);

-- Users can insert their own profile
create policy "users_insert_own"
  on public.users for insert
  with check (auth.uid() = id);

-- Admins can view all users
create policy "admins_select_all_users"
  on public.users for select
  using (
    exists (
      select 1 from public.users 
      where id = auth.uid() 
      and user_type = 'admin'
      and approval_status = 'approved'
    )
  );

-- Admins can update all users
create policy "admins_update_all_users"
  on public.users for update
  using (
    exists (
      select 1 from public.users 
      where id = auth.uid() 
      and user_type = 'admin'
      and approval_status = 'approved'
    )
  );

-- Create trigger for updated_at
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at
  before update on public.users
  for each row
  execute function public.update_updated_at_column();
