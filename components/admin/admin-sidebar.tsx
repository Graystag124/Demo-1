import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { 
  LayoutDashboard, Users, FileCheck, Briefcase, ChevronDown, ChevronRight, 
  LogOut, Settings, ShieldCheck, ListTodo, Database, DollarSign, Tag, Sparkles, 
  HelpCircle, BarChart3, LineChart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Separator } from "@/components/ui/separator";

// Added optional prop to close mobile menu on click
export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isApprovalsOpen, setIsApprovalsOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    if (onNavigate) onNavigate();
  };

  const SidebarItem = ({ 
    href, 
    icon: Icon, 
    label, 
    active: isActive = false, 
    onClick, 
    className,
    exact = false
  }: { 
    href?: string; 
    icon: any; 
    label: string; 
    active?: boolean; 
    onClick?: () => void; 
    className?: string;
    exact?: boolean;
  }) => {
    const isActiveRoute = exact 
      ? pathname === href 
      : href ? pathname.startsWith(href) : false;
    
    const active = isActive || isActiveRoute;

    const content = (
      <div className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group w-full text-left",
        active 
          ? "bg-white/20 text-white" 
          : "text-white/70 hover:text-white hover:bg-white/10",
        className
      )}>
        <Icon className={cn("h-4 w-4 flex-shrink-0", active ? "text-white" : "text-white/70 group-hover:text-white")} />
        <span className="truncate">{label}</span>
      </div>
    );

    if (onClick) {
      return <button onClick={onClick} className="w-full">{content}</button>;
    }

    return (
      <Link href={href!} onClick={onNavigate} className="block w-full">
        {content}
      </Link>
    );
  };

  return (
    <div className="flex flex-col h-full text-white">
      <div className="p-6 pt-10">
        <div className="flex flex-col items-start gap-1">
          <div className="relative w-32 h-12">
            <Image 
              src="/Byberr 1.svg"
              alt="Byberr" 
              fill
              className="object-contain"
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/70 uppercase tracking-wider">
            <ShieldCheck className="w-3 h-3" />
            <span>Admin Portal</span>
          </div>
        </div>
      </div>
      
      <Separator className="mb-4 mx-4 w-auto bg-white/20" />

      <div className="flex-1 overflow-y-auto px-3 space-y-1">
        <SidebarItem href="/admin" icon={LayoutDashboard} label="Dashboard" exact />

        <div className="pt-2">
          <button 
            onClick={() => setIsApprovalsOpen(!isApprovalsOpen)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
              pathname === "/admin/users" ? "text-white" : "text-white/70 hover:text-white"
            )}
          >
            <div className="flex items-center gap-3"><Users className="h-4 w-4" /><span>User Approvals</span></div>
            {isApprovalsOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>

          {isApprovalsOpen && (
            <div className="mt-1 ml-4 pl-3 border-l border-white/20 space-y-1">
              <SidebarItem 
                href="/admin/users?type=creator" 
                icon={Users} 
                label="Creators" 
                active={pathname === "/admin/users" && (typeof window !== 'undefined' && window.location.search.includes("type=creator"))} 
              />
              <SidebarItem 
                href="/admin/users?type=business" 
                icon={Briefcase} 
                label="Business" 
                active={pathname === "/admin/users" && (typeof window !== 'undefined' && window.location.search.includes("type=business"))} 
              />
            </div>
          )}
        </div>

        <SidebarItem href="/admin/collaborations" icon={ListTodo} label="Collab Approvals" />
        <SidebarItem href="/admin/applications" icon={FileCheck} label="Application Approvals" />
        
        {/* Business Spend and Content Settings */}
        <SidebarItem href="/admin/business-spend" icon={DollarSign} label="Business Spend" />
        <SidebarItem href="/admin/content-settings" icon={Tag} label="Content Settings" />
      </div>

      <div className="p-4 border-t border-white/20 space-y-2">
        <div className="relative">
          <button 
            onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all"
          >
            <ShieldCheck className="h-4 w-4" />
            Admin Account
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
        <SidebarItem href="/admin/creators" icon={Sparkles} label="Top Creators" exact />
        <SidebarItem href="/admin/brands" icon={Briefcase} label="Top Brands" exact />
        <SidebarItem href="/admin/queries" icon={Database} label="Queries" exact />
        <SidebarItem href="/admin/settings" icon={Settings} label="Settings" exact />
      </div>
    </div>
  );
}