"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <button onClick={handleLogout} className="w-full text-left">
      Logout
    </button>
  );
}
