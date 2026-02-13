-- Create collaborations table
-- Businesses post collaboration opportunities

create table if not exists public.collaborations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.users(id) on delete cascade,
  
  title text not null,
  description text not null,
  requirements text,
  compensation text,
  category text,
  
  -- Admin approval
  approval_status text not null default 'pending' check (approval_status in ('pending', 'approved', 'rejected')),
  approved_at timestamptz,
  rejected_at timestamptz,
  approval_notes text,
  
  -- Collaboration status
  is_active boolean default true,
  deadline timestamptz,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.collaborations enable row level security;

-- Approved users can view approved collaborations
create policy "users_view_approved_collaborations"
  on public.collaborations for select
  using (
    approval_status = 'approved' and
    exists (
      select 1 from public.users 
      where id = auth.uid() 
      and approval_status = 'approved'
    )
  );

-- Business owners can view their own collaborations
create policy "businesses_view_own_collaborations"
  on public.collaborations for select
  using (
    business_id = auth.uid()
  );

-- Businesses can create collaborations
create policy "businesses_insert_collaborations"
  on public.collaborations for insert
  with check (
    business_id = auth.uid() and
    exists (
      select 1 from public.users 
      where id = auth.uid() 
      and user_type = 'business'
      and approval_status = 'approved'
    )
  );

-- Businesses can update their own collaborations
create policy "businesses_update_own_collaborations"
  on public.collaborations for update
  using (business_id = auth.uid());

-- Admins can view all collaborations
create policy "admins_view_all_collaborations"
  on public.collaborations for select
  using (
    exists (
      select 1 from public.users 
      where id = auth.uid() 
      and user_type = 'admin'
      and approval_status = 'approved'
    )
  );

-- Admins can update all collaborations (for approval)
create policy "admins_update_all_collaborations"
  on public.collaborations for update
  using (
    exists (
      select 1 from public.users 
      where id = auth.uid() 
      and user_type = 'admin'
      and approval_status = 'approved'
    )
  );

create trigger collaborations_updated_at
  before update on public.collaborations
  for each row
  execute function public.update_updated_at_column();
