"use client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogOut, LucideIcon, Home, Briefcase, Users, Calendar, User, PlusCircle, TrendingUp, CheckCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { NavLink } from "./sidebar";

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

export function DashboardNavHeader({
  handleLogout,
  portalName,
  links,
  dashboardPath,
}: {
  handleLogout: () => Promise<void>;
  portalName: string;
  links: NavLink[];
  dashboardPath: string;
}) {
  const pathname = usePathname();

  return (
    <header className="lg:hidden flex items-center h-16 px-4 border-b bg-background">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col bg-gradient-to-br from-[#04614b] via-[#0fab70] to-[#00e27e] text-white border-none">
          <SheetHeader>
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          </SheetHeader>
          <div className="p-6 border-b border-white/20">
            <div className="flex flex-col items-center gap-2 mb-2 w-full">
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
            <p className="text-xs text-white/70 w-full text-center">{portalName}</p>
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
        </SheetContent>
      </Sheet>
      <div className="flex-1 ml-4">
        <Link href={dashboardPath} className="text-xl font-bold">
          {portalName}
        </Link>
      </div>
    </header>
  );
}