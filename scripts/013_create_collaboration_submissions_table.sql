-- Create collaboration_submissions table
-- This table stores the links/content submitted by a creator for an assignment.

create table if not exists public.collaboration_submissions (
  id uuid primary key default gen_random_uuid(),
  collaboration_id uuid not null references public.collaborations(id) on delete cascade,
  creator_id uuid not null references public.users(id) on delete cascade,
  
  "type" text not null check ("type" in ('post', 'story', 'reel')),
  url text not null,
  caption text,
  
  status text not null default 'submitted' check (status in ('submitted', 'approved', 'rejected')),
  
  submitted_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.collaboration_submissions enable row level security;

-- RLS Policies

-- Creators can manage their own submissions.
create policy "creators_manage_own_submissions"
  on public.collaboration_submissions for all
  using (creator_id = auth.uid());

-- Business owners can view submissions for their collaborations.
create policy "businesses_view_collaboration_submissions"
  on public.collaboration_submissions for select
  using (
    exists (
      select 1 from public.collaborations 
      where id = collaboration_id 
      and business_id = auth.uid()
    )
  );

-- Business owners can update submissions for their collaborations (to approve/reject).
create policy "businesses_moderate_collaboration_submissions"
  on public.collaboration_submissions for update
  using (
    exists (
      select 1 from public.collaborations 
      where id = collaboration_id 
      and business_id = auth.uid()
    )
  );

-- Admins can do anything.
create policy "admins_all_access_submissions"
  on public.collaboration_submissions for all
  using (
    exists (
      select 1 from public.users 
      where id = auth.uid() 
      and user_type = 'admin'
    )
  );

-- Trigger for updated_at
create trigger collaboration_submissions_updated_at
  before update on public.collaboration_submissions
  for each row
  execute function public.update_updated_at_column();
