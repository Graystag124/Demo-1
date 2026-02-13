-- Create a function to check collaboration access
create or replace function public.get_collaboration_by_id(collab_id uuid)
returns json
language sql
security definer
as $$
  select json_build_object(
    'id', c.id,
    'title', c.title,
    'business_id', c.business_id,
    'exists', true,
    'current_user', auth.uid(),
    'is_owner', (c.business_id = auth.uid()),
    'approval_status', c.approval_status,
    'is_active', c.is_active
  )
  from public.collaborations c
  where c.id = collab_id;
$$;

-- Grant execute permission to authenticated users
grant execute on function public.get_collaboration_by_id(uuid) to authenticated;
