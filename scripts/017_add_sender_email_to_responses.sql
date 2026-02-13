-- Add senderEmail column to ContactSubmissionResponse table
ALTER TABLE public."ContactSubmissionResponse"
ADD COLUMN "senderEmail" TEXT DEFAULT 'support@byberr.in';

-- Update existing rows to have the default sender email
UPDATE public."ContactSubmissionResponse"
SET "senderEmail" = 'support@byberr.in'
WHERE "senderEmail" IS NULL;

-- Make the column NOT NULL after setting default values
ALTER TABLE public."ContactSubmissionResponse"
ALTER COLUMN "senderEmail" SET NOT NULL;
