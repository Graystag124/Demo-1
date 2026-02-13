-- Add collaboration_type column to collaborations table
ALTER TABLE public.collaborations 
ADD COLUMN IF NOT EXISTS collaboration_type TEXT NOT NULL DEFAULT 'paid' 
CHECK (collaboration_type IN ('paid', 'barter'));

-- Update existing records to have a default value
UPDATE public.collaborations SET collaboration_type = 'paid' WHERE collaboration_type IS NULL;
