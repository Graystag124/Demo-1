import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: faqs, error } = await supabase
      .from('faqs')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching FAQs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch FAQs' },
        { status: 500 }
      );
    }

    // If no FAQs found, return an empty array
    return NextResponse.json(faqs || []);
  } catch (error) {
    console.error('Error in FAQ API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
