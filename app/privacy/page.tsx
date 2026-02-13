import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient'; // Adjust path to your client

// --- Type Definitions ---
type SectionContent = {
  title: string;
  text?: string;
  list?: string[];
  subsections?: {
    title: string;
    items: string[];
  }[];
  footer?: string;
};

type PrivacyPolicyData = {
  id: string;
  last_updated: string;
  company_legal_name: string;
  platform_name: string;
  jurisdiction: string;
  registered_address: string;
  contact_email: string;
  min_user_age: string;
  content: SectionContent[]; // Maps to the JSONB column
};

// --- Data Fetching ---
async function getPrivacyData() {
  const { data, error } = await supabase
    .from('privacy_policies')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    console.error('Error fetching privacy policy:', error);
    return null;
  }

  return data as PrivacyPolicyData;
}

// --- Metadata Generation ---
export async function generateMetadata(): Promise<Metadata> {
  const data = await getPrivacyData();
  return {
    title: `Privacy Policy - ${data?.platform_name || 'Byberr'}`,
    description: `Learn how we collect, use, and protect your information on the ${data?.platform_name} platform.`,
  };
}

// --- Main Page Component ---
export default async function PrivacyPage() {
  const data = await getPrivacyData();

  if (!data) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back Home
            </Button>
          </Link>
        </div>
        
        {/* Header Section */}
        <div className="mb-12 border-b border-border pb-8">
          <h1 className="text-4xl font-bold mb-2 uppercase tracking-wide">
            {data.platform_name} – PRIVACY POLICY
          </h1>
          <p className="text-primary font-medium mb-6">
            Last Updated: {data.last_updated}
          </p>

          <div className="bg-muted/30 p-6 rounded-lg border border-border text-sm grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p><span className="font-bold text-foreground">Company:</span> {data.company_legal_name}</p>
              <p><span className="font-bold text-foreground">Platform:</span> {data.platform_name}</p>
              <p><span className="font-bold text-foreground">Jurisdiction:</span> {data.jurisdiction}</p>
              <p><span className="font-bold text-foreground">Min Age:</span> {data.min_user_age}</p>
            </div>
            <div className="space-y-2">
              <p><span className="font-bold text-foreground">Address:</span> {data.registered_address}</p>
              <p><span className="font-bold text-foreground">Email:</span> {data.contact_email}</p>
            </div>
          </div>
        </div>

        {/* Dynamic Content Sections */}
        <div className="space-y-12">
          {data.content.map((section, index) => (
            <section key={index} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Section Title */}
              <h2 className="text-xl font-bold mb-4 text-foreground border-l-4 border-primary pl-4">
                {section.title}
              </h2>

              {/* Main Text Body */}
              {section.text && (
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {section.text}
                </p>
              )}

              {/* Top Level List (e.g., Section 3 & 4) */}
              {section.list && (
                <ul className="space-y-2 mb-4 ml-1">
                  {section.list.map((item, i) => (
                    <li key={i} className="flex items-start text-muted-foreground">
                      <span className="text-primary mr-3 mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Subsections (e.g., Section 2 - A, B, C) */}
              {section.subsections && (
                <div className="space-y-6 mt-4 ml-2">
                  {section.subsections.map((sub, i) => (
                    <div key={i} className="bg-muted/10 p-4 rounded-md">
                      <h3 className="font-semibold text-foreground mb-3">{sub.title}</h3>
                      <ul className="space-y-2">
                        {sub.items.map((item, j) => (
                          <li key={j} className="flex items-start text-muted-foreground pl-2">
                            <span className="mr-2 text-primary">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer Note (e.g., Section 4) */}
              {section.footer && (
                <p className="text-foreground font-medium mt-4 italic border-t border-border pt-2 inline-block">
                  {section.footer}
                </p>
              )}
            </section>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 pt-8 border-t border-border text-center">
          <p className="text-muted-foreground mb-2">Have any privacy concerns?</p>
          <a 
            href={`mailto:${data.contact_email}`} 
            className="text-primary font-bold hover:underline text-lg"
          >
            {data.contact_email}
          </a>
        </div>
      </div>
    </div>
  );
}