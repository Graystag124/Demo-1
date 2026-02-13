-- Fix RLS policy infinite recursion error
-- Drop existing policies that cause recursion
drop policy if exists "admins_select_all_users" on public.users;
drop policy if exists "admins_update_all_users" on public.users;

-- Create admin policies that don't cause recursion by checking auth metadata instead
create policy "admins_select_all_users"
  on public.users for select
  using (
    -- Allow if user is selecting their own row
    auth.uid() = id
    OR
    -- Or if the user's auth metadata indicates they're an admin
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );

create policy "admins_update_all_users"
  on public.users for update
  using (
    -- Allow if user is updating their own row
    auth.uid() = id
    OR
    -- Or if they're an admin (check via simple flag, not recursive query)
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );

-- Add service role bypass for backend operations
create policy "service_role_all_users"
  on public.users for all
  using (auth.jwt() ->> 'role' = 'service_role');
