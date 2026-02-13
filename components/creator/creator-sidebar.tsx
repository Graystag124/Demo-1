"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Briefcase, 
  TrendingUp, 
  Calendar, 
  User, 
  LogOut,
  Search,
  Compass,
  X,
  BarChart3,
  ChevronDown
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CreatorSidebarProps {
  onNavigate?: () => void;
}

export function CreatorSidebar({ onNavigate }: CreatorSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const routes = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/creator-dashboard",
      active: pathname === "/creator-dashboard",
    },
    {
      label: "Discover",
      icon: Compass,
      href: "/creator-dashboard/discover",
      active: pathname === "/creator-dashboard/discover",
    },
    {
      label: "Search",
      icon: Search,
      href: "/creator-dashboard/search",
      active: pathname === "/creator-dashboard/search",
    },
    {
      label: "My Applications",
      icon: Briefcase,
      href: "/creator-dashboard/applications",
      active: pathname.startsWith("/creator-dashboard/applications"),
    },
    {
      label: "My Assignments",
      icon: Briefcase,
      href: "/creator-dashboard/assignments",
      active: pathname.startsWith("/creator-dashboard/assignments"),
    },
    {
      label: "Calendar",
      icon: Calendar,
      href: "/creator-dashboard/calendar",
      active: pathname === "/creator-dashboard/calendar",
    },
    {
      label: "Performance",
      icon: BarChart3,
      href: "/creator-dashboard/stats",
      active: pathname.startsWith("/creator-dashboard/stats"),
    },
    {
      label: "Profile",
      icon: User,
      href: "/creator-dashboard/profile",
      active: pathname === "/creator-dashboard/profile",
    },
  ];

  return (
    <div className="flex flex-col h-full text-white">
      <div className="p-6 pt-10">
        <Link href="/creator-dashboard" className="flex flex-col items-start gap-1">
          <div className="relative w-32 h-12">
            <Image 
              src="/Byberr 1.svg"
              alt="Byberr" 
              fill
              className="object-contain"
            />
          </div>
          <span className="text-xs text-white/70 font-medium">For Creators</span>
        </Link>
      </div>
      
      <div className="flex-1 flex flex-col gap-1 px-3 py-4">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
              route.active 
                ? "bg-white/20 text-white" 
                : "text-white/70 hover:text-white hover:bg-white/10"
            )}
          >
            <route.icon
              className={cn(
                "h-4 w-4",
                route.active ? "text-white" : "text-white/70 group-hover:text-white"
              )}
            />
            {route.label}
          </Link>
        ))}
      </div>

      <div className="p-4 border-t border-white/20">
        <div className="relative">
          <button 
            onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all"
          >
            <User className="h-4 w-4" />
            Creator Account
          </button>
          
          {isAccountDropdownOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100">
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
      </div>
    </div>
  );
}