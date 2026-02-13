-- Auto-create user profile on signup
-- This trigger creates a profile in the users table when a new auth user is created

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (
    id, 
    email, 
    user_type, 
    display_name,
    approval_status
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'user_type', 'creator'),
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    -- First user becomes admin with auto-approval
    case 
      when not exists (select 1 from public.users) then 'approved'
      else 'pending'
    end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
