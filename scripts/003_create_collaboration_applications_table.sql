-- Create collaboration_applications table
-- Creators apply to collaborations

create table if not exists public.collaboration_applications (
  id uuid primary key default gen_random_uuid(),
  collaboration_id uuid not null references public.collaborations(id) on delete cascade,
  creator_id uuid not null references public.users(id) on delete cascade,
  
  message text,
  portfolio_link text,
  
  -- Admin approval for the application
  approval_status text not null default 'pending' check (approval_status in ('pending', 'approved', 'rejected')),
  approved_at timestamptz,
  rejected_at timestamptz,
  approval_notes text,
  
  -- Application status
  status text not null default 'applied' check (status in ('applied', 'accepted', 'rejected', 'completed')),
  
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Prevent duplicate applications
  unique(collaboration_id, creator_id)
);

-- Enable RLS
alter table public.collaboration_applications enable row level security;

-- Creators can view their own applications
create policy "creators_view_own_applications"
  on public.collaboration_applications for select
  using (creator_id = auth.uid());

-- Creators can insert applications
create policy "creators_insert_applications"
  on public.collaboration_applications for insert
  with check (
    creator_id = auth.uid() and
    exists (
      select 1 from public.users 
      where id = auth.uid() 
      and user_type = 'creator'
      and approval_status = 'approved'
    )
  );

-- Business owners can view applications for their collaborations
create policy "businesses_view_collaboration_applications"
  on public.collaboration_applications for select
  using (
    exists (
      select 1 from public.collaborations 
      where id = collaboration_id 
      and business_id = auth.uid()
    )
  );

-- Admins can view all applications
create policy "admins_view_all_applications"
  on public.collaboration_applications for select
  using (
    exists (
      select 1 from public.users 
      where id = auth.uid() 
      and user_type = 'admin'
      and approval_status = 'approved'
    )
  );

-- Admins can update all applications
create policy "admins_update_all_applications"
  on public.collaboration_applications for update
  using (
    exists (
      select 1 from public.users 
      where id = auth.uid() 
      and user_type = 'admin'
      and approval_status = 'approved'
    )
  );

create trigger collaboration_applications_updated_at
  before update on public.collaboration_applications
  for each row
  execute function public.update_updated_at_column();
