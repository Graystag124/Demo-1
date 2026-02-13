-- Create collaboration_assignments table
-- This table stores the specific deliverables required for a creator in a collaboration.

create table if not exists public.collaboration_assignments (
  id uuid primary key default gen_random_uuid(),
  collaboration_id uuid not null references public.collaborations(id) on delete cascade,
  creator_id uuid not null references public.users(id) on delete cascade,
  
  posts_required int not null default 0,
  stories_required int not null default 0,
  reels_required int not null default 0,
  
  notes text,
  
  status text not null default 'assigned' check (status in ('assigned', 'in_progress', 'completed', 'paused')),
  
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Each creator can only be assigned to a collaboration once
  unique(collaboration_id, creator_id)
);

-- Enable RLS
alter table public.collaboration_assignments enable row level security;

-- RLS Policies

-- Creators can view assignments they are a part of.
create policy "creators_view_own_assignments"
  on public.collaboration_assignments for select
  using (creator_id = auth.uid());

-- Business owners can view assignments for their collaborations.
create policy "businesses_view_collaboration_assignments"
  on public.collaboration_assignments for select
  using (
    exists (
      select 1 from public.collaborations 
      where id = collaboration_id 
      and business_id = auth.uid()
    )
  );

-- Business owners can insert/update assignments for their collaborations.
create policy "businesses_manage_collaboration_assignments"
  on public.collaboration_assignments for all -- all = insert, update, delete
  using (
    exists (
      select 1 from public.collaborations 
      where id = collaboration_id 
      and business_id = auth.uid()
    )
  );

-- Admins can do anything.
create policy "admins_all_access_assignments"
  on public.collaboration_assignments for all
  using (
    exists (
      select 1 from public.users 
      where id = auth.uid() 
      and user_type = 'admin'
    )
  );

-- Trigger for updated_at
create trigger collaboration_assignments_updated_at
  before update on public.collaboration_assignments
  for each row
  execute function public.update_updated_at_column();
