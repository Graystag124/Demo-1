// "use client";
// import Image from "next/image";
// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import { cn } from "@/lib/utils";
// import { 
//   Briefcase, 
//   LayoutDashboard, 
//   PlusCircle, 
//   Users, 
//   Calendar, 
//   Settings, 
//   LogOut 
// } from "lucide-react";
// import { createClient } from "@/lib/supabase/client";

// interface BusinessSidebarProps {
//   onNavigate?: () => void;
// }

// export function BusinessSidebar({ onNavigate }: BusinessSidebarProps) {
//   const pathname = usePathname();
//   const router = useRouter();

//   const handleLogout = async () => {
//     const supabase = createClient();
//     await supabase.auth.signOut();
//     router.push("/auth/login");
//   };

//   const routes = [
//     {
//       label: "Dashboard",
//       icon: LayoutDashboard,
//       href: "/business-dashboard",
//       active: pathname === "/business-dashboard",
//     },
//     {
//       label: "Create Collab",
//       icon: PlusCircle,
//       href: "/business-dashboard/create-collab",
//       active: pathname === "/business-dashboard/create-collab",
//     },
//     {
//       label: "My Collaborations",
//       icon: Briefcase,
//       href: "/business-dashboard/collabs",
//       active: pathname.startsWith("/business-dashboard/collabs"),
//     },
//     {
//       label: "Applications",
//       icon: Users,
//       href: "/business-dashboard/applications",
//       active: pathname.startsWith("/business-dashboard/applications"),
//     },
//     {
//       </div>

//       <div className="p-4 border-t border-white/20">
//         <button 
//           onClick={handleLogout}
//           className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-red-500/20 transition-all"
//         >
//           <LogOut className="h-4 w-4" />
//           Sign Out
//         </button>
//       </div>
//     </div>
//   );
// }

// "use client";
// import Image from "next/image";
// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import { cn } from "@/lib/utils";
// import { 
//   Briefcase, 
//   LayoutDashboard, 
//   PlusCircle, 
//   Users, 
//   Calendar, 
//   Settings, 
//   LogOut,
//   Film // Added Icon for Content
// } from "lucide-react";
// import { createClient } from "@/lib/supabase/client";

// interface BusinessSidebarProps {
//   onNavigate?: () => void;
// }

// export function BusinessSidebar({ onNavigate }: BusinessSidebarProps) {
//   const pathname = usePathname();
//   const router = useRouter();

//   const handleLogout = async () => {
//     const supabase = createClient();
//     await supabase.auth.signOut();
//     router.push("/auth/login");
//   };

//   const routes = [
//     {
//       label: "Dashboard",
//       icon: LayoutDashboard,
//       href: "/business-dashboard",
//       active: pathname === "/business-dashboard",
//     },
//     {
//       label: "Create Collab",
//       icon: PlusCircle,
//       href: "/business-dashboard/create-collab",
//       active: pathname === "/business-dashboard/create-collab",
//     },
//     {
//       label: "My Collaborations",
//       icon: Briefcase,
//       href: "/business-dashboard/collabs",
//       active: pathname.startsWith("/business-dashboard/collabs"),
//     },
//     {
//       label: "Applications",
//       icon: Users,
//       href: "/business-dashboard/applications",
//       active: pathname.startsWith("/business-dashboard/applications"),
//     },
//     {
//       label: "Content Library", // New Route
//       icon: Film,
//       href: "/business-dashboard/content",
//       active: pathname === "/business-dashboard/content",
//     },
//     {
//       label: "Calendar",
//       icon: Calendar,
//       href: "/business-dashboard/calendar",
//       active: pathname === "/business-dashboard/calendar",
//     },
//     {
//       label: "Profile",
//       icon: Settings,
//       href: "/business-dashboard/profile",
//       active: pathname === "/business-dashboard/profile",
//     },
//   ];

//   return (
//     <div className="flex flex-col h-full text-white">
//       <div className="p-6">
//         <Link href="/business-dashboard" className="flex items-center gap-2 font-bold text-xl">
//           <Image 
//             src="/Byberr 1.svg"
//             alt="Byberr" 
//             width={82} 
//             height={82} 
//             className="w-18 h-8 object-contain"
//           />
//         </Link>
//       </div>
      
//       <div className="flex-1 flex flex-col gap-1 px-3">
//         {routes.map((route) => (
//           <Link
//             key={route.href}
//             href={route.href}
//             onClick={onNavigate}
//             className={cn(
//               "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
//               route.active 
//                 ? "bg-white/20 text-white" 
//                 : "text-white/70 hover:text-white hover:bg-white/10"
//             )}
//           >
//             <route.icon
//               className={cn(
//                 "h-4 w-4",
//                 route.active ? "text-white" : "text-white/70 group-hover:text-white"
//               )}
//             />
//             {route.label}
//           </Link>
//         ))}
//       </div>

//       <div className="p-4 border-t border-white/20">
//         <button 
//           onClick={handleLogout}
//           className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-red-500/20 transition-all"
//         >
//           <LogOut className="h-4 w-4" />
//           Sign Out
//         </button>
"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Briefcase, 
  LayoutDashboard, 
  PlusCircle, 
  Users, 
  Calendar, 
  Settings, 
  LogOut,
  Film,
  BarChart3,
  DollarSign,
  Search,
  HelpCircle,
  ChevronDown
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

interface BusinessSidebarProps {
  onNavigate?: () => void;
}

export function BusinessSidebar({ onNavigate }: BusinessSidebarProps) {
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
      icon: LayoutDashboard,
      href: "/business-dashboard",
      active: pathname === "/business-dashboard",
    },
    {
      label: "Search",
      icon: Search,
      href: "/business-dashboard/search",
      active: pathname === "/business-dashboard/search",
    },
    {
      label: "Create Collab",
      icon: PlusCircle,
      href: "/business-dashboard/create-collab",
      active: pathname === "/business-dashboard/create-collab",
    },
    {
      label: "My Collaborations",
      icon: Briefcase,
      href: "/business-dashboard/collabs",
      active: pathname.startsWith("/business-dashboard/collabs"),
    },
    {
      label: "Applications",
      icon: Users,
      href: "/business-dashboard/applications",
      active: pathname.startsWith("/business-dashboard/applications"),
    },
    {
      label: "Content Library",
      icon: Film,
      href: "/business-dashboard/content",
      active: pathname === "/business-dashboard/content",
    },
    {
      label: "Performance Stats",
      icon: BarChart3,
      href: "/business-dashboard/stats",
      active: pathname.startsWith("/business-dashboard/stats"),
    },
    {
      label: "Spend",
      icon: DollarSign,
      href: "/business-dashboard/spend",
      active: pathname.startsWith("/business-dashboard/spend"),
    },
    {
      label: "Calendar",
      icon: Calendar,
      href: "/business-dashboard/calendar",
      active: pathname === "/business-dashboard/calendar",
    },
    {
      label: "Profile",
      icon: Settings,
      href: "/business-dashboard/profile",
      active: pathname === "/business-dashboard/profile",
    },
  ];

  return (
    <div className="flex flex-col h-full text-white">
      <div className="p-6 pt-10">
        <Link href="/business-dashboard" className="flex flex-col items-start gap-1">
          <div className="relative w-32 h-12">
            <Image 
              src="/Byberr 1.svg"
              alt="Byberr" 
              fill
              className="object-contain"
            />
          </div>
          <span className="text-xs text-white/70 font-medium">For Brands</span>
        </Link>
      </div>
      
      <div className="flex-1 flex flex-col gap-1 px-3 overflow-y-auto">
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
                "h-4 w-4 flex-shrink-0",
                route.active ? "text-white" : "text-white/70 group-hover:text-white"
              )}
            />
            <span className="truncate">{route.label}</span>
          </Link>
        ))}
      </div>

      <div className="p-4 border-t border-white/20">
        <div className="relative">
          <button 
            onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all"
          >
            <Briefcase className="h-4 w-4" />
            Business Account
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