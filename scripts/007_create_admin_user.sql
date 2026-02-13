-- Create admin user for testing
-- This script creates a default admin account
-- Email: admin@collabcart.com
-- Password: admin123

-- Note: This is for development only. In production, create admin accounts through a secure process.

-- First, we need to insert into auth.users (Supabase managed)
-- Then insert into public.users

-- Insert into public.users (the auth.users will be created when you sign up through the UI)
-- You should manually create the admin user through the sign-up flow first with:
-- Email: admin@collabcart.com
-- Password: admin123
-- User Type: admin

-- Then run this to approve the admin automatically:
UPDATE public.users 
SET approval_status = 'approved', approved_at = now()
WHERE email = 'admin@collabcart.com' AND user_type = 'admin';
