-- Add instagram_handle column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'instagram_handle'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN instagram_handle text;
    
    -- Add index for faster lookups by Instagram handle
    CREATE INDEX idx_users_instagram_handle ON public.users(instagram_handle);
  END IF;
  
  -- Add page access token column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'meta_page_access_token'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN meta_page_access_token text;
  END IF;
END $$;
