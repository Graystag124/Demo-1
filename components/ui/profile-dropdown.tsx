"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

export function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState<{ display_name?: string; profile_image_url?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('display_name, profile_image_url')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setUserData(data);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative flex items-center" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
      >
        {loading ? (
          <Skeleton className="h-4 w-20 bg-white/20" />
        ) : (
          <span className="text-sm text-white font-medium">
            {userData?.display_name || 'Profile'}
          </span>
        )}
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
          {userData?.profile_image_url ? (
            <Image
              src={userData.profile_image_url}
              alt="Profile"
              width={24}
              height={24}
              className="rounded-full w-6 h-6 object-cover"
            />
          ) : (
            <User className="h-3 w-3 text-white" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
