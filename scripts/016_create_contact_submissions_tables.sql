-- Create ContactSubmission table
CREATE TABLE IF NOT EXISTS public."ContactSubmission" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved')),
    "preferredMethod" TEXT NOT NULL CHECK ("preferredMethod" IN ('email', 'phone')),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "resolvedAt" TIMESTAMP WITH TIME ZONE
);

-- Create ContactSubmissionResponse table
CREATE TABLE IF NOT EXISTS public."ContactSubmissionResponse" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "submissionId" UUID NOT NULL REFERENCES public."ContactSubmission"(id) ON DELETE CASCADE,
    "adminId" UUID REFERENCES public."users"(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    "sentVia" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on ContactSubmission
ALTER TABLE public."ContactSubmission" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on ContactSubmissionResponse
ALTER TABLE public."ContactSubmissionResponse" ENABLE ROW LEVEL SECURITY;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_contact_submission_status ON public."ContactSubmission"(status);
CREATE INDEX IF NOT EXISTS idx_contact_submission_created_at ON public."ContactSubmission"("createdAt");

-- Add RLS policies for ContactSubmission
CREATE POLICY "Enable read access for admins"
ON public."ContactSubmission"
FOR SELECT
TO authenticated
USING (auth.role() = 'authenticated' AND 
       EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND 
              (email = 'admin@byberr.com' OR email LIKE '%@byberr.com')));

-- Add RLS policies for ContactSubmissionResponse
CREATE POLICY "Enable read access for admins on responses"
ON public."ContactSubmissionResponse"
FOR SELECT
TO authenticated
USING (auth.role() = 'authenticated' AND 
       EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND 
              (email = 'admin@byberr.com' OR email LIKE '%@byberr.com')));

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public."ContactSubmission" TO authenticated;
GRANT SELECT, INSERT ON public."ContactSubmissionResponse" TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE public."ContactSubmission" IS 'Stores contact form submissions from the website';
COMMENT ON TABLE public."ContactSubmissionResponse" IS 'Stores admin responses to contact form submissions';
