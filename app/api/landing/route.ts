import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Helper to initialize the Supabase client in Route Handlers
 */
async function getSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

export async function GET() {
  try {
    const supabase = await getSupabaseClient();
    
    const { data, error } = await supabase
      .from('landing_content')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    const contentBySection = (data || []).reduce((acc: Record<string, any>, item) => {
      acc[item.section_key] = item;
      return acc;
    }, {});

    return NextResponse.json(contentBySection);
  } catch (error) {
    console.error('Error fetching landing page content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch landing page content' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseClient();
    
    // Use getUser() instead of getSession() for security on the server
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const contentData = await request.json();
    
    const updates = await Promise.all(
      Object.entries(contentData).map(async ([sectionKey, sectionData]: [string, any]) => {
        const { error } = await supabase
          .from('landing_content')
          .upsert(
            {
              section_key: sectionKey,
              ...sectionData,
              updated_at: new Date().toISOString()
            },
            { onConflict: 'section_key' }
          );
        
        return { sectionKey, error };
      })
    );

    const errors = updates.filter(update => update.error);
    
    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Failed to update some sections', details: errors },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating landing page content:', error);
    return NextResponse.json(
      { error: 'Failed to update landing page content' },
      { status: 500 }
    );
  }
}