-- Add instagram_handle column to store the @username
alter table public.users add column if not exists instagram_handle text;

-- Add index for faster lookups
create index if not exists idx_users_instagram_handle on public.users(instagram_handle);
