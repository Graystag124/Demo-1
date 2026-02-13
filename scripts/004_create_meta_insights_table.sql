-- Create meta_insights table
-- Store Meta API insights data for both creators and businesses

create table if not exists public.meta_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  
  -- Insight data from Meta API (stored as JSONB for flexibility)
  insights_data jsonb not null,
  
  -- Metadata
  insight_type text not null check (insight_type in ('account', 'post', 'story', 'audience')),
  period_start timestamptz,
  period_end timestamptz,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.meta_insights enable row level security;

-- Users can view their own insights
create policy "users_view_own_insights"
  on public.meta_insights for select
  using (user_id = auth.uid());

-- Users can insert their own insights
create policy "users_insert_own_insights"
  on public.meta_insights for insert
  with check (user_id = auth.uid());

-- Users can update their own insights
create policy "users_update_own_insights"
  on public.meta_insights for update
  using (user_id = auth.uid());

-- Admins can view all insights
create policy "admins_view_all_insights"
  on public.meta_insights for select
  using (
    exists (
      select 1 from public.users 
      where id = auth.uid() 
      and user_type = 'admin'
      and approval_status = 'approved'
    )
  );

create trigger meta_insights_updated_at
  before update on public.meta_insights
  for each row
  execute function public.update_updated_at_column();

-- Create index for faster queries
create index meta_insights_user_id_idx on public.meta_insights(user_id);
create index meta_insights_created_at_idx on public.meta_insights(created_at desc);
