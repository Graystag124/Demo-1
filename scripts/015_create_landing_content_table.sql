-- Create a table to store landing page content sections
CREATE TABLE IF NOT EXISTS public.landing_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_key TEXT NOT NULL UNIQUE,
    title TEXT,
    subtitle TEXT,
    description TEXT,
    button_text TEXT,
    button_link TEXT,
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.landing_content ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Enable read access for all users" 
ON public.landing_content 
FOR SELECT 
USING (true);

-- Create policies for admin access
CREATE POLICY "Enable all operations for admin"
ON public.landing_content
FOR ALL
TO authenticated
USING (auth.role() = 'authenticated' AND auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_landing_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on row update
CREATE TRIGGER update_landing_content_updated_at
BEFORE UPDATE ON public.landing_content
FOR EACH ROW
EXECUTE FUNCTION update_landing_content_updated_at();

-- Insert initial data for the hero section
INSERT INTO public.landing_content (
    section_key,
    title,
    subtitle,
    description,
    button_text,
    button_link,
    is_active,
    display_order
) VALUES (
    'hero',
    'Let''s build something remarkable.',
    'Ready to scale your influence or brand?',
    'Our team is available 24/7 to guide you through the onboarding process and answer any technical questions.',
    'Get Started',
    '/auth/sign-up',
    true,
    1
)
ON CONFLICT (section_key) 
DO UPDATE SET
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    description = EXCLUDED.description,
    button_text = EXCLUDED.button_text,
    button_link = EXCLUDED.button_link,
    is_active = EXCLUDED.is_active,
    display_order = EXCLUDED.display_order,
    updated_at = NOW();
