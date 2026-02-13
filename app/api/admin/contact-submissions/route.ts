// app/api/admin/contact-submissions/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Enable debug logging
const debug = process.env.NODE_ENV === 'development';

function log(...args: any[]) {
  if (debug) {
    console.log('[ContactSubmissions]', ...args);
  }
}

export const dynamic = 'force-dynamic';

export async function GET() {
  log('GET request received');
  
  const cookieStore = cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = cookieStore.get(name);
          return cookie ? cookie.value : null;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set(name, value, options);
          } catch (error) {
            // Handle cookie setting in server components
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set(name, '', { ...options, maxAge: 0 });
          } catch (error) {
            // Handle cookie removal in server components
          }
        },
      },
    }
  );
  
  try {
    log('Checking authentication');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      const errorMessage = sessionError?.message || 'No session found';
      log('Authentication failed:', errorMessage);
      return NextResponse.json(
        { error: 'Unauthorized', details: 'No active session found' },
        { status: 401 }
      );
    }

    log('User authenticated:', session.user?.email);
    log('Executing database query');

    // Fetch contact submissions with responses
    const { data, error, count } = await supabase
      .from('ContactSubmission')
      .select(`
        *,
        responses:ContactSubmissionResponse(
          id,
          message,
          "sentVia",
          "createdAt",
          "adminId",
          admin:adminId(
            email
          )
        )
      `, { count: 'exact' })
      .order('createdAt', { ascending: false });

    if (error) {
      log('Database query error:', error);
      console.error('Database error:', error);
      return NextResponse.json(
        { 
          error: 'Database error',
          details: error.message,
          hint: 'Check if the ContactSubmission table exists and has the correct permissions'
        },
        { status: 500 }
      );
    }

    log(`Found ${count || 0} submissions`);

    // Format the response
    const formattedData = (data || []).map((submission: any) => ({
      ...submission,
      responses: ((submission.responses as Array<any>) || []).map((response: any) => ({
        ...response,
        admin: response.admin || { email: 'Unknown' }
      }))
    }));

    return NextResponse.json(formattedData);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const stack = error instanceof Error ? error.stack : undefined;
    log('Unexpected error:', errorMessage, '\nStack:', stack);
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}