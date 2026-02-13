-- Add cover_image_url column to collaborations table
ALTER TABLE public.collaborations 
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- Add a comment to describe the column
COMMENT ON COLUMN public.collaborations.cover_image_url IS 'URL of the cover image for the collaboration, stored in Supabase Storage';