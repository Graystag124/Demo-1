"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon, Home, Briefcase, Users, Calendar, User, PlusCircle, TrendingUp, CheckCircle, LogOut } from "lucide-react";

// Map string names to icon components
const iconMap: { [key: string]: LucideIcon } = {
  Home,
  Briefcase,
  Users,
  Calendar,
  User,
  PlusCircle,
  TrendingUp,
  CheckCircle,
};

export type NavLink = {
  href: string;
  label: string;
  icon: string; // Changed from LucideIcon to string
};

export function Sidebar({
  className,
  portalName,
  links,
  handleLogout,
}: {
  className?: string;
  portalName: string;
  links: NavLink[];
  handleLogout: () => Promise<void>;
}) {
  const pathname = usePathname();

  return (
    <aside className={cn("hidden lg:flex flex-col w-64 bg-gradient-to-br from-[#04614b] via-[#0fab70] to-[#00e27e] text-white", className)}>
      <div className="p-6 border-b border-white/20">
        <div className="flex flex-col items-center gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Image 
              src="/Byberr 1.svg"
              alt="Byberr" 
              width={82} 
              height={82} 
              className="w-18 h-8 object-contain"
            />
            <h2 className="text-2xl font-bold">Byberr</h2>
          </div>
          <span className="text-[10px] px-2 py-0.5 bg-white/10 rounded-full text-white/80">
            {portalName.includes('Business') ? 'For Business' : 'For Creators'}
          </span>
        </div>
        <p className="text-xs text-white/70">{portalName}</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => {
          const Icon = iconMap[link.icon];
          return (
            <Link key={link.href} href={link.href}>
              <Button
                variant={pathname === link.href ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                {Icon && <Icon className="mr-2 h-4 w-4" />}
                {link.label}
              </Button>
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-white/20">
        <form action={handleLogout}>
          <Button variant="outline" className="w-full text-xs" type="submit">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </form>
      </div>
    </aside>
  );
}
