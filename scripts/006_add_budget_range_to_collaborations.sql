-- Update collaborations table to add budget_range column if missing
-- This ensures compatibility with the calendar view

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'collaborations' 
        AND column_name = 'budget_range'
    ) THEN
        ALTER TABLE public.collaborations 
        ADD COLUMN budget_range text;
    END IF;
END $$;
