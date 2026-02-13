-- Add instagram_handle and meta_page_access_token columns if they don't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS instagram_handle text,
ADD COLUMN IF NOT EXISTS meta_page_access_token text;

-- Create index for faster Instagram handle lookups
CREATE INDEX IF NOT EXISTS idx_users_instagram_handle ON public.users(instagram_handle);
