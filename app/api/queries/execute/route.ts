import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
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
              // Handle potential cookie setting errors in specific environments
            }
          },
        },
      }
    );

    // Check authentication using getUser() for security (verifies JWT)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    // Execute the query via RPC
    const { data, error } = await supabase.rpc('execute_sql', { query_text: query });

    if (error) {
      console.error('Query execution error:', error);
      return NextResponse.json(
        { 
          error: error.message || 'Failed to execute query',
          details: error.details,
          hint: error.hint,
          code: error.code
        },
        { status: 400 }
      );
    }

    // If it's a SELECT query (returns an array), return formatted results
    if (Array.isArray(data)) {
      if (data.length === 0) {
        return NextResponse.json({
          columns: [],
          rows: [],
          rowCount: 0
        });
      }

      const columns = Object.keys(data[0]);
      
      return NextResponse.json({
        columns,
        rows: data,
        rowCount: data.length
      });
    }

    // For non-SELECT queries (INSERT/UPDATE/DELETE)
    return NextResponse.json({
      message: 'Query executed successfully',
      result: data,
      rowCount: data?.length || 0
    });

  } catch (error) {
    console.error('Error executing query:', error);
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}