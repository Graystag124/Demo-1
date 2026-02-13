import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import BusinessSpendContent from './spend-content';

export default async function BusinessSpendPage() {
  // In Next.js 15+, cookies() must be awaited
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
            // The setAll method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );

  // Use getUser() instead of getSession() for better security in Server Components
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get user data from your custom table
  const { data: userData } = await supabase
    .from('users')
    .select('approval_status')
    .eq('id', user.id)
    .single();

  // Check if user is approved
  if (userData?.approval_status !== 'approved') {
    redirect('/auth/pending-approval');
  }

  return <BusinessSpendContent />;
}