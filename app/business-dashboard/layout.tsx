"use client";

import { useState } from "react";
import { BusinessSidebar } from "@/components/business/business-sidebar";
import { Menu, X, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { ProfileDropdown } from "@/components/ui/profile-dropdown";

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 text-foreground font-sans selection:bg-primary/20">
      
      {/* 1. Desktop Sidebar (Hidden on Mobile) */}
      <div className="hidden md:block fixed inset-y-0 left-0 z-50 w-56 bg-[#012e28] text-white">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        <BusinessSidebar />
      </div>

      {/* 2. Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setIsSidebarOpen(false)}
          />
          
          {/* Sidebar Panel */}
          <div className="relative flex w-56 flex-col bg-[#012e28] text-white h-full animate-in slide-in-from-left-1/2 duration-200">
            <div className="absolute top-4 right-4">
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <BusinessSidebar onNavigate={() => setIsSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* 3. Main Content Wrapper */}
      <div className="flex-1 flex flex-col md:pl-56 h-screen">
        
        {/* Thin Header */}
        <header className="h-10 bg-[#012e28] text-white flex items-center justify-between px-4 md:px-6 border-b border-white/10 sticky top-0 z-40">
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden text-white/80 hover:text-white mr-2"
            >
              <Menu className="h-4 w-4" />
            </button>
            <Link href="/business-dashboard" className="md:hidden">
              <Image
                src="/Byberr 1.svg"
                alt="Byberr"
                width={72}
                height={28}
                className="h-5 w-auto object-contain"
              />
            </Link>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            {/* How It Works Button - Replaced ProfileDropdown in top right */}
            <Link
              href="/business-dashboard/how-it-works"
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all group text-white/70 hover:text-white hover:bg-white/10"
            >
              <HelpCircle className="h-4 w-4" />
              How It Works
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}