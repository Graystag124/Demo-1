"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { FormHydrationFix } from "@/components/form-hydration-fix"
import { createClient } from "@supabase/supabase-js"
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { 
  Menu, CheckCircle2, ChevronDown,
  Users, ShieldCheck, BarChart3, Linkedin, Instagram, Check, X as XIcon,
  Search, Bell, Loader2, Mail, Phone, Send,Quote
} from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

// --- Global Styles Component ---
const GlobalStyles = () => {
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      *:focus {
        outline: none !important;
        box-shadow: none !important;
      }
      *:focus-visible {
        outline: 2px solid #2cc295 !important;
        outline-offset: 2px !important;
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])
  return null
}

// --- SUPABASE CLIENT INITIALIZATION ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

// --- UTILITIES ---
const smoothScroll = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.preventDefault();
  const targetId = e.currentTarget.getAttribute('href');
  if (!targetId) return;
  const targetElement = document.querySelector(targetId);
  if (targetElement) {
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

// --- HELPER COMPONENTS ---

const StickyFeature = ({ step, activeIndex, icon: Icon, title, desc }: any) => (
  <div className={cn(
    "flex gap-6 transition-all duration-300",
    activeIndex === step ? "opacity-100 translate-x-0" : "opacity-40 translate-x-4"
  )}>
    <div className={cn(
      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200",
      activeIndex === step ? "bg-[#03624c] text-white shadow-lg shadow-[#03624c]/20" : "bg-slate-100 text-slate-400"
    )}>
      <Icon size={24} />
    </div>
    <div>
      <h3 className={cn("text-xl font-bold mb-2", activeIndex === step ? "text-[#021a1a]" : "text-slate-400")}>
        {title}
      </h3>
      <p className="text-slate-500 leading-relaxed max-w-sm">{desc}</p>
    </div>
  </div>
)

const Marquee = ({ children, direction = "left" }: { children: React.ReactNode, direction?: "left" | "right" }) => {
  return (
    <div className="flex overflow-hidden w-full mask-linear-gradient">
      <div className={cn("flex gap-8 py-4 animate-scroll min-w-full shrink-0", direction === "right" && "animate-scroll-reverse")}>
        {children}
      </div>
      <div className={cn("flex gap-8 py-4 animate-scroll min-w-full shrink-0", direction === "right" && "animate-scroll-reverse")}>
        {children}
      </div>
      <style jsx>{`
        .mask-linear-gradient {
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        @keyframes scroll-reverse {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0); }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
        .animate-scroll-reverse {
          animation: scroll-reverse 40s linear infinite;
        }
      `}</style>
    </div>
  )
}

// --- SECTIONS ---

// 1. NAVIGATION (White Mode)
const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/20 bg-white/95 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-center px-6 py-4 relative">
        {/* Logo (White Header) */}
        <Link href="/" className="flex items-center gap-2 absolute left-6">
           <Image
            src="/Byberr 1.svg"   
            alt="Byberr"
            width={82}
            height={32}
            className="w-18 h-8 object-contain brightness-0"
          />
        </Link>

        {/* Desktop Menu - Centered */}
        <div className="hidden md:flex items-center gap-8">
          {["Features", "Comparison", "Reviews", "FAQ", "Contact"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              onClick={smoothScroll}
              className="text-sm font-medium text-[#021a1a] hover:text-[#03624c] transition-colors"
            >
              {item}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3 absolute right-6">
          <Link href="/auth/login">
            <Button>
              Log in
            </Button>
          </Link>
          <Link href="/auth/sign-up">
            <Button>
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile Menu - Moved to Right */}
        <div className="md:hidden absolute right-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-[#021a1a] hover:bg-white/20 rounded-full transition-all duration-300"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            
            <SheetContent 
              side="right" 
              className="bg-white border-l border-gray-200 w-[300px] sm:w-[400px] p-0 outline-none overflow-y-auto"
            >
              <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>
              <SheetDescription className="sr-only">Navigation menu for mobile devices</SheetDescription>
              
              <div className="flex flex-col h-full px-8 py-12">
                {/* 1. NAVIGATION LINKS - Larger, evenly distributed, right-aligned */}
                <nav className="flex flex-col justify-center gap-6 flex-1">
                  {["Features", "Comparison", "Reviews", "FAQ", "Contact"].map((item) => (
                    <SheetClose asChild key={item}>
                      <a
                        href={`#${item.toLowerCase()}`}
                        onClick={smoothScroll}
                        className="text-lg font-semibold text-black hover:text-green-600 active:text-green-700 transition-all duration-200 block text-right pr-4"
                      >
                        {item}
                      </a>
                    </SheetClose>
                  ))}
                </nav>

                {/* 2. CTA BUTTONS - Right aligned, compact */}
                <div className="flex flex-col gap-3 mt-8 mb-6">
                  <SheetClose asChild>
                    <Link href="/auth/login">
                      <Button variant="outline" className="w-full bg-[#0B3D2E] text-white border-[#0B3D2E] hover:bg-[#006A4E] hover:border-[#006A4E] rounded-full">
                        Log in
                      </Button>
                    </Link>
                  </SheetClose>

                  <SheetClose asChild>
                    <Link href="/auth/sign-up">
                      <Button className="w-full bg-[#0B3D2E] text-white hover:bg-[#006A4E] rounded-full">
                        Get Started
                      </Button>
                    </Link>
                  </SheetClose>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </nav>
  )
}

const HeroSection = () => {
  const containerRef = useRef<HTMLElement>(null)
  
  // Add scroll progress tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // Add spring for smooth animation
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  const dashboardY = useTransform(smoothProgress, [0, 1], ["85vh", "-10vh"]) 
  const dashboardScale = useTransform(smoothProgress, [0, 1], [0.85, 1])
  const textY = useTransform(smoothProgress, [0, 1], [0, -100])
  const textScale = useTransform(smoothProgress, [0, 1], [1, 0.9])
  const textOpacity = useTransform(smoothProgress, [0, 0.5], [1, 0])

  return (
    <section ref={containerRef} className="relative bg-white isolate">
      <div className="min-h-screen w-full overflow-hidden flex flex-col items-center justify-center pt-24">
        
        {/* --- EXACT 3-COLOR MESH GRADIENT --- */}
        <div className="absolute inset-0 -z-10 bg-white" />
        
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: `
              /* 1. Ensure the top stays white */
              linear-gradient(to bottom, white 0%, white 20%, transparent 50%),
              
              /* 2. Bottom Right: Highnote Teal (#4affdf) */
              radial-gradient(circle at 90% 100%, rgba(114, 218, 242, 0.7) 0%, transparent 70%),
              
              /* 3. Bottom Center: Highnote Green transition (#84ff96) */
              radial-gradient(circle at 20% 100%, rgba(46, 216, 31, 0.71) 0%, transparent 70%)
            `,
          }}
        />
        
        {/* Subtle Grain Texture Overlay */}
        <div 
          className="absolute inset-0 -z-10 opacity-[0.035] mix-blend-multiply pointer-events-none" 
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' /%3E%3C/svg%3E")` }} 
        />

        <div className="container mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center justify-center h-full mt-10">
          <motion.div 
            style={{ opacity: textOpacity, scale: textScale, y: textY }}
            className="absolute z-10 text-center max-w-4xl px-6 mt-0 origin-center will-change-transform flex flex-col items-center"
          >
            {/* Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-[#2cc295]/40 text-xs font-bold text-[#03624c] mb-8 mt-0 shadow-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00df82] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00df82]"></span>
              </span>
              Join 1000+ Creators
            </div>
            
            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-[#021a1a] leading-[1.1] mb-8">
              Authentic Creator <br />
              Partnerships <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#03624c] to-[#2cc295]">Made Simple.</span>
            </h1>
            
            <p className="text-lg text-slate-700 mb-10 max-w-2xl mx-auto leading-relaxed font-semibold">
              Byberr transforms how brands connect with creators. Streamline barter collaborations, access authentic content, and build genuine partnerships.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-16">
              <Link href="/auth/sign-up">
                <Button className="bg-[#0B3D2E] text-white hover:bg-[#006A4E] rounded-full px-10 h-14 text-lg font-bold shadow-xl shadow-[#0B3D2E]/40 w-full sm:w-auto transition-transform hover:scale-105">
                  Join Now - It's Free
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Dashboard Preview Animation */}
          <motion.div 
            style={{ y: dashboardY, scale: dashboardScale }}
            className="w-full max-w-6xl z-30 will-change-transform relative"
          >
             <div className={cn("relative w-full rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-300 overflow-hidden flex flex-col z-30", "h-[60vh] md:h-[75vh]" )}>
                {/* Dashboard Header */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#03624c] via-[#2cc295] to-[#00df82] z-20" />
                <div className="shrink-0 p-3 md:p-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400/20 border border-red-400" />
                    <div className="w-3 h-3 rounded-full bg-gray-400/20 border border-gray-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400/20 border border-green-400" />
                  </div>
                  <div className="hidden sm:flex bg-[#f1f7f7] px-4 py-1.5 rounded-md text-[11px] text-slate-400 font-mono items-center gap-2 border border-slate-100 shadow-sm">
                    <span className="w-2 h-2 bg-[#00df82] rounded-full animate-pulse"></span>
                    byberr.com/dashboard
                  </div>
                  <div className="flex gap-2">
                     <Search size={16} className="text-slate-400" />
                     <Bell size={16} className="text-slate-400" />
                  </div>
                </div>
                
                {/* Dashboard Content */}
                <div className="flex-1 bg-[#f1f7f7]/50 p-4 md:p-6 flex flex-col gap-4 md:gap-6 min-h-0 overflow-y-auto">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 shrink-0">
                        {[
                          { l: "Active Campaigns", v: "12", c: "text-[#03624c]" },
                          { l: "Total Reach", v: "840K", c: "text-blue-600" },
                          { l: "Engagement", v: "4.8%", c: "text-purple-600" }
                        ].map((s, i) => (
                          <div key={i} className={cn("bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between", i === 2 && "hidden md:flex")}>
                            <div className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wide">{s.l}</div>
                            <div className={`text-2xl md:text-3xl font-bold ${s.c} mt-2`}>{s.v}</div>
                          </div>
                        ))}
                    </div>
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 min-h-0">
                        <div className="lg:col-span-2 flex flex-col gap-4 h-full min-h-0">
                            <div className="flex justify-between items-center shrink-0">
                               <h3 className="font-bold text-slate-700 text-sm md:text-base">Recent Applications</h3>
                               <Button variant="ghost" size="sm" className="text-xs h-8">View All</Button>
                            </div>
                            <div className="flex flex-col gap-3 overflow-y-auto pr-2">
                                {[1, 2,].map((_, i) => (
                                  <div key={i} className="flex items-center gap-3 md:gap-4 bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:border-[#2cc295] transition-colors cursor-pointer group">
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#f1f7f7] flex items-center justify-center text-slate-400 group-hover:bg-[#f1f7f7] group-hover:text-[#03624c] transition-colors">
                                       <Users size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="w-1/2 h-2.5 bg-slate-200 rounded mb-2 group-hover:bg-slate-300 transition-colors" />
                                      <div className="w-1/3 h-2 bg-slate-100 rounded" />
                                    </div>
                                    <div className="hidden sm:block px-2 py-1 bg-[#f1f7f7] text-[#03624c] text-[10px] font-bold rounded border border-slate-200">VERIFIED</div>
                                  </div>
                                ))}
                            </div>
                        </div>
                        <div className="hidden lg:flex flex-col h-full bg-white rounded-xl border border-slate-100 p-5 shadow-sm min-h-0">
                             <div className="flex items-center justify-between mb-6 shrink-0">
                                <div className="h-2 w-16 bg-slate-200 rounded"></div>
                                <BarChart3 size={16} className="text-slate-300" />
                             </div>
                             <div className="flex-1 flex items-end gap-2 justify-between px-2 pb-2">
                                {[35, 60, 45, 80, 55, 90, 70].map((h, i) => (
                                    <div key={i} style={{ height: `${h}%` }} className="w-full bg-[#f1f7f7] rounded-t-sm relative group">
                                        <div className="absolute bottom-0 left-0 right-0 bg-[#2cc295] rounded-t-sm transition-all duration-500" style={{ height: '40%' }}></div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                </div>
             </div>
          </motion.div>
        </div>
        <div className="h-25"></div> 
      </div>
    </section>
  )
}

// Features Section
const FeaturesSection = () => {
  const [activeFeature, setActiveFeature] = useState(0)
  const featuresRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!featuresRef.current) return
      const { top } = featuresRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const elementHeight = featuresRef.current.offsetHeight
      const elementTop = top
      const elementBottom = top + elementHeight
      
      // Trigger when section is 20-30% visible
      const visibilityThreshold = viewportHeight * 0.7 // 30% from top = 70% from bottom
      
      if (elementTop < visibilityThreshold && elementBottom > viewportHeight * 0.2) {
        // Section is visible, trigger animations based on scroll position
        // Much slower progression to allow full viewing of each section
        const scrollProgress = Math.max(0, Math.min(1, (visibilityThreshold - elementTop) / (visibilityThreshold * 2.0)))
        
        // Much wider ranges for extended viewing time
        if (scrollProgress < 0.4) setActiveFeature(0)  // Smart Matching (0-40%)
        else if (scrollProgress < 0.7) setActiveFeature(1)  // Secure Contracts (40-70%)
        else setActiveFeature(2)  // Verified Analytics (70-100%)
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section id="features" ref={featuresRef} className="relative py-32 bg-white z-20">
      <div className="container mx-auto px-6 lg:px-12 max-w-6xl">
        <div className="mb-20 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-[#021a1a]">
            Workflow <span className="text-[#03624c]">Redefined</span>
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-lg">
            We don't just connect you; we provide the entire operating system for your creator business.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-start">
          <div className="hidden lg:flex flex-col gap-24 sticky top-40 pt-10">
            <StickyFeature
              step={0}
              activeIndex={activeFeature}
              icon={Users}
              title="Smart Matching"
              desc="Our AI analyzes your audience and style to pair you with brands that actually convert. No more cold pitching."
            />
            <StickyFeature
              step={1}
              activeIndex={activeFeature}
              icon={ShieldCheck}
              title="Secure Contracts"
              desc="Automated legal frameworks protect your intellectual property. Digital signatures and clear deliverables ensure mutual accountability."
            />
            <StickyFeature
              step={2}
              activeIndex={activeFeature}
              icon={BarChart3}
              title="Verified Analytics"
              desc="Real-time API integration with social platforms. Show brands your true ROI with transparent, unforgeable data reports."
            />
          </div>

          <div className="lg:hidden flex flex-col gap-12">
            {[
              { title: "Smart Matching", desc: "AI-driven discovery.", icon: Users },
              { title: "Secure Contracts", desc: "Built-in IP protection.", icon: ShieldCheck },
              { title: "Verified Analytics", desc: "Real-time data.", icon: BarChart3 },
            ].map((f, i) => (
              <div key={i} className="bg-[#f1f7f7] p-6 rounded-xl border border-slate-200 shadow-sm">
                <f.icon className="text-[#03624c] mb-4" size={24} />
                <h3 className="text-xl font-bold mb-2 text-[#021a1a]">{f.title}</h3>
                <p className="text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="relative aspect-square lg:aspect-[4/5] rounded-3xl overflow-hidden border border-slate-200 bg-[#f1f7f7] shadow-2xl shadow-slate-200/50">
            <div className={cn("absolute inset-0 transition-all duration-400 flex items-center justify-center p-8", activeFeature === 0 ? "opacity-100 scale-100" : "opacity-0 scale-95")}>
               <div className="w-full h-full bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="w-12 h-12 bg-gradient-to-br from-[#2cc295] to-[#03624c] rounded-full shadow-lg shadow-[#2cc295]/30 flex items-center justify-center">
                       <img 
                         src="/Byberr 1.svg" 
                         alt="Profile" 
                         className="w-6 h-6 object-contain"
                       />
                     </div>
                     <div>
                        <div className="h-3 w-32 bg-slate-200 rounded mb-2"></div>
                        <div className="h-2 w-20 bg-slate-100 rounded"></div>
                     </div>
                  </div>
                  <div className="space-y-3 flex-1">
                     <div className="h-24 w-full bg-[#f1f7f7] rounded-xl border border-slate-100 p-3">
                        <div className="flex justify-between items-center mb-2">
                           <div className="h-2 w-16 bg-slate-200 rounded"></div>
                           <div className="h-4 w-8 bg-green-100 text-green-700 text-[10px] flex items-center justify-center rounded font-bold">98%</div>
                        </div>
                        <div className="h-full w-full bg-slate-100/50 rounded"></div>
                     </div>
                     <div className="h-24 w-full bg-[#f1f7f7] rounded-xl border border-slate-100 opacity-60"></div>
                  </div>
                  <div className="mt-4 bg-[#03624c] text-white text-center py-3 rounded-lg font-medium text-sm">
                     Match Found
                  </div>
               </div>
            </div>

            <div className={cn("absolute inset-0 transition-all duration-400 flex items-center justify-center bg-white", activeFeature === 1 ? "opacity-100 scale-100" : "opacity-0 scale-95")}>
              <div className="text-center p-8 w-full">
                <div className="mx-auto w-20 h-20 bg-[#f1f7f7] rounded-full flex items-center justify-center text-[#03624c] mb-6">
                  <ShieldCheck size={40} />
                </div>
                <h4 className="font-bold text-xl text-[#021a1a] mb-2">Assets Secured</h4>
                <p className="text-slate-500 text-sm mb-8">Intellectual property protected via blockchain-verified contracts.</p>
                <div className="space-y-4 max-w-xs mx-auto">
                   <div className="flex items-center justify-between p-3 bg-[#f1f7f7] rounded-lg border border-slate-100">
                      <span className="text-xs font-semibold text-slate-700">NDA_Agreement.pdf</span>
                      <CheckCircle2 className="w-4 h-4 text-[#2cc295]" />
                   </div>
                   <div className="flex items-center justify-between p-3 bg-[#f1f7f7] rounded-lg border border-slate-100">
                      <span className="text-xs font-semibold text-slate-700">Usage_Rights.pdf</span>
                      <CheckCircle2 className="w-4 h-4 text-[#2cc295]" />
                   </div>
                </div>
              </div>
            </div>

            <div className={cn("absolute inset-0 transition-all duration-400 flex items-center justify-center bg-[#f1f7f7]", activeFeature === 2 ? "opacity-100 scale-100" : "opacity-0 scale-95")}>
              <div className="w-full h-full p-8 flex flex-col justify-center">
                 <div className="grid grid-cols-2 gap-4">
                    {[{ l: "Views", v: "124.5K", c: "+12%" }, { l: "Saves", v: "8.2K", c: "+5%" }, { l: "Shares", v: "4.1K", c: "+22%" }, { l: "Clicks", v: "9.3%", c: "+1.2%" }].map((s, i) => (
                       <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                          <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">{s.l}</div>
                          <div className="text-2xl font-bold text-[#021a1a]">{s.v}</div>
                          <div className="text-[#00df82] text-xs font-medium mt-2">{s.c} vs last post</div>
                       </div>
                    ))}
                 </div>
                 <div className="mt-6 h-32 bg-white rounded-xl border border-slate-200 p-4 flex items-end justify-between gap-2">
                    {[40, 60, 45, 70, 50, 80, 65, 90].map((h, i) => (
                       <div key={i} style={{ height: `${h}%` }} className="w-full bg-[#f1f7f7] rounded-t-sm relative group">
                          <div className="absolute bottom-0 left-0 right-0 bg-[#2cc295] rounded-t-sm transition-all duration-500" style={{ height: '40%' }}></div>
                       </div>
                    ))}
                 </div>
                 <style jsx>{` @keyframes grow { to { height: 100%; } } `}</style>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </section>
  )
}

// 3. COMPARISON SECTION
const ComparisonSection = () => {
   const comparisonData = [
      { feature: "Task Completion", without: "Several days", with: "Instantly" },
      { feature: "Error Rate", without: "Frequent", with: "Near-zero mistakes" },
      { feature: "Data Visibility", without: "Fragmented", with: "Real-Time, Centralized" },
      { feature: "Team Collaboration", without: "Disconnected", with: "Seamless" },
      { feature: "Workflow Automation", without: "Cross", with: "Check" },
      { feature: "Onboarding Speed", without: "Weeks to months", with: "Minutes" },
      { feature: "Scalability", without: "Cross", with: "Check" },
      { feature: "Customer Support", without: "Cross", with: "Check" },
      { feature: "Decision Making", without: "Sluggish", with: "Data-Driven" },
      { feature: "Productivity", without: "Mediocre", with: "Unstoppable" },
   ]

   return (
      <section id="comparison" className="py-24 bg-gradient-to-br from-slate-50 to-white">
         <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            
            {/* Section Header */}
            <div className="text-center mb-16">
               <h2 className="text-4xl font-bold text-[#021a1a] mb-4">
                  Why choose <span className="text-[#03624c]">BYBERR?</span>
               </h2>
               <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                  Compare the difference between traditional workflows and BYBERR's intelligent automation
               </p>
            </div>

            {/* Desktop Comparison Cards - Hidden on Mobile */}
            <div className="hidden md:grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
               {/* Without BYBERR Card */}
               <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-slate-50 px-8 py-6 border-b border-slate-200">
                     <h3 className="text-xl font-bold text-slate-700 text-center">Without BYBERR</h3>
                  </div>
                  <div className="p-8 space-y-6">
                     {comparisonData.map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                           <span className="text-slate-700 font-medium text-sm">{item.feature}</span>
                           <div className="text-right">
                              {item.without === "Cross" ? (
                                 <XIcon className="text-red-400 w-5 h-5 ml-auto" />
                              ) : (
                                 <span className="text-red-400/80 font-medium text-sm">{item.without}</span>
                              )}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* With BYBERR Card (Highlighted) */}
               <div className="bg-gradient-to-br from-[#03624c] to-[#028a6d] rounded-2xl border border-[#03624c]/20 shadow-xl overflow-hidden relative">
                  <div className="absolute top-4 right-4">
                     <div className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                        RECOMMENDED
                     </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm px-8 py-6 border-b border-white/20">
                     <h3 className="text-xl font-bold text-white text-center flex items-center justify-center gap-2">
                        <span>🚀</span>
                        <span>With BYBERR</span>
                     </h3>
                  </div>
                  <div className="p-8 space-y-6">
                     {comparisonData.map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
                           <span className="text-white/90 font-medium text-sm">{item.feature}</span>
                           <div className="text-right">
                              {item.with === "Check" ? (
                                 <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center ml-auto">
                                    <Check className="text-[#03624c] w-4 h-4" strokeWidth={3} />
                                 </div>
                              ) : (
                                 <span className="text-white font-bold text-sm">{item.with}</span>
                              )}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Mobile Stacked Layout */}
            <div className="md:hidden mt-12 space-y-6">
               {comparisonData.map((item, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                     <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                        <h4 className="font-bold text-slate-800 text-sm">{item.feature}</h4>
                     </div>
                     <div className="grid grid-cols-2 divide-x divide-slate-200">
                        <div className="p-4">
                           <div className="text-xs font-bold text-red-400 mb-2">Without BYBERR</div>
                           <div className="flex items-center justify-center min-h-[24px]">
                              {item.without === "Cross" ? (
                                 <XIcon className="text-red-400 w-5 h-5" />
                              ) : (
                                 <span className="text-red-400/80 font-medium text-sm text-center">{item.without}</span>
                              )}
                           </div>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-[#03624c] to-[#028a6d]">
                           <div className="text-xs font-bold text-white mb-2">With BYBERR</div>
                           <div className="flex items-center justify-center min-h-[24px]">
                              {item.with === "Check" ? (
                                 <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                                    <Check className="text-[#03624c] w-4 h-4" strokeWidth={3} />
                                 </div>
                              ) : (
                                 <span className="text-white font-bold text-sm text-center">{item.with}</span>
                              )}
                           </div>
                        </div>
                     </div>
                  </div>
               ))}
            </div>

            <div className="mt-16 text-center">
               <Button size="lg">
                  Get Started Now
               </Button>
            </div>
         </div>
      </section>
   )
}

// How It Works Section
const HowItWorksSection = () => {
   const [activeTab, setActiveTab] = useState<"creators" | "brands">("creators")
 
   return (
     <section id="how-it-works" className="py-24 relative overflow-hidden">
       <div className="absolute inset-0 -z-10">
         <div className="absolute inset-0 bg-gradient-to-br from-[#f8fcfc] via-white to-white" />
         <div className="absolute top-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-br from-[#03624c]/5 to-transparent rounded-full blur-3xl" />
         <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-white to-transparent" />
       </div>
       <div className="container mx-auto px-6">
         <div className="text-center mb-16">
           <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-[#021a1a]">How it works</h2>
           <p className="text-slate-500 max-w-2xl mx-auto text-lg">Simple booking-style collaboration process</p>
         </div>
 
         <div className="flex justify-center gap-4 mb-16">
           <button 
             onClick={() => setActiveTab("creators")} 
             className={cn(
               "px-8 py-3 rounded-full font-semibold transition-all text-sm shadow-sm border-2 w-40 text-center",
               activeTab === "creators" 
                 ? "bg-[#0B3D2E] text-white border-transparent shadow-[#0B3D2E]/20" 
                 : "bg-white border-slate-200 text-slate-600 hover:bg-white/80"
             )}
           >
             For Creators
           </button>
           <button 
             onClick={() => setActiveTab("brands")} 
             className={cn(
               "px-8 py-3 rounded-full font-semibold transition-all text-sm shadow-sm border-2 w-40 text-center",
               activeTab === "brands" 
                 ? "bg-[#0B3D2E] text-white border-transparent shadow-[#0B3D2E]/20" 
                 : "bg-white border-slate-200 text-slate-600 hover:bg-white/80"
             )}
           >
             For Brands
           </button>
         </div>
 
         <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
             {[
               {
                 creators: { step: "01", title: "Browse", desc: "Discover curated experiences from top brands." },
                 brands: { step: "01", title: "List", desc: "Set up experience listings with requirements." },
                 maxLines: 2
               },
               {
                 creators: { step: "02", title: "Apply", desc: "Submit your profile with one click." },
                 brands: { step: "02", title: "Review", desc: "Approve creators based on real metrics." },
                 maxLines: 2
               },
               {
                 creators: { step: "03", title: "Experience", desc: "Enjoy complimentary services & create content." },
                 brands: { step: "03", title: "Manage", desc: "Monitor campaign status in real-time." },
                 maxLines: 2
               },
               {
                 creators: { step: "04", title: "Track", desc: "Upload deliverables and see your analytics." },
                 brands: { step: "04", title: "Report", desc: "Get detailed ROI reports automatically." },
                 maxLines: 2
               }
             ].map((item, i) => {
               const content = item[activeTab];
               const boxHeight = 'h-64';
               
               return (
                 <div key={i} className="relative group">
                   <div className={`${boxHeight} flex flex-col`}>
                     <div className="relative bg-white border border-[#E5E7EB] shadow-[0_10px_25px_rgba(0,0,0,0.05)] p-8 rounded-xl transition-all duration-800 flex-1 flex flex-col hover:bg-gradient-to-br hover:from-[#0f766e] hover:to-[#064e3b] hover:shadow-[0_20px_45px_rgba(6,78,59,0.45)] hover:-translate-y-[6px] h-full overflow-hidden group">
                       
                       {/* Glass sheen effect on hover */}
                       <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-800"></div>
                       
                       {/* Inner glow on hover */}
                       <div className="absolute inset-0 bg-gradient-to-br from-gray-400/10 to-gray-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-800 backdrop-blur-sm"></div>
                       
                       <div className="relative z-10">
                         <div className="text-5xl font-black text-[#03624c] mb-6 transition-colors duration-800 group-hover:text-white drop-shadow-lg">
                           {content.step}
                         </div>
                         <h3 className="text-xl font-bold text-[#03624c] mb-3 transition-colors duration-300 group-hover:text-white">{content.title}</h3>
                         <div className="flex-1 flex items-start">
                           <p className="text-slate-600 leading-relaxed transition-colors duration-300 group-hover:text-white/85">
                             {content.desc}
                           </p>
                         </div>
                       </div>
                     </div>
                   </div>
                   {i < 3 && (
                     <div className="hidden md:block absolute top-1/2 -right-8 w-8 h-1 bg-[#03624c] transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-gray-400 group-hover:to-gray-600 group-hover:shadow-lg group-hover:shadow-gray-500/50 z-10" />
                   )}
                 </div>
               )
             })}
         </div>
       </div>
     </section>
   )
}

// Logo Showcase Section with Marquee
const LogoShowcase = () => {
  const logos = [
    { name: "Amazon", src: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" },
    { name: "Netflix", src: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" },
    { name: "Rick and Morty", src: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Rick_and_Morty.svg" },
    { name: "Google", src: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" },
    { name: "IBM", src: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg" },
    { name: "Facebook", src: "https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png" },
  ]

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-[#f8fcfc] to-white" />
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent" />
      </div>
      <div className="container mx-auto px-6 mb-12 text-center">
        <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Trusted by industry leaders</p>
      </div>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent z-10"></div>
        <div className="py-4">
          <Marquee direction="left">
            {[...logos, ...logos].map((logo, i) => (
              <div key={`${logo.name}-${i}`} className="flex items-center justify-center px-8 opacity-90 hover:opacity-100 transition-all duration-500 cursor-pointer">
                <img 
                  src={logo.src} 
                  alt={logo.name} 
                  className="h-8 md:h-12 w-auto object-contain filter brightness-0 hover:brightness-100 transition-all duration-500"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNjAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCAxNjAgODAiIGZpbGw9Im5vbmUiPgo8cmVjdCB3aWR0aD0iMTYwIiBoZWlnaHQ9IjgwIiByeD0iOCIgZmlsbD0iI2YxZjdmNyIvPgo8cmVjdCB4PSI0MCIgeT0iMzAiIHdpZHRoPSI4MCIgaGVpZ2h0PSIyMCIgcng9IjQiIGZpbGw9IiNlMWU2ZTkiLz4KPC9zdmc+'
                  }}
                  />
              </div>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  )
}

const FoundersSection = () => {
  return (
    <section id="about" className="py-32 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-center text-[#021a1a]">
            Built by a <span className="text-[#03624c]">Creator</span>
          </h2>
          <div className="h-1.5 w-20 bg-gradient-to-r from-[#03624c] to-[#2cc295] rounded-full" />
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Founder Card */}
            <div className="group relative h-[500px] w-full overflow-hidden rounded-3xl bg-[#f1f7f7] border border-slate-200 shadow-2xl transition-all duration-500">
              {/* Image Placeholder with Gradient */}
              <div className={cn(
                "absolute inset-0 transition-transform duration-1000 group-hover:scale-110",
                "bg-gradient-to-br from-slate-200 via-[#dcfce7] to-slate-300"
              )} />
              
              {/* Overlay Content */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#021a1a]/90 via-[#021a1a]/20 to-transparent" />
              
              <div className="absolute bottom-0 left-0 p-10 w-full">
                <div className="text-[#2cc295] font-mono text-xs uppercase tracking-[0.2em] mb-2 font-bold">
                  Founder & CEO
                </div>
                <h3 className="text-4xl font-bold text-white mb-4">Tanish Jain</h3>
                
                <div className="flex gap-5">
                  <a href="#" className="p-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-[#03624c] transition-all duration-300">
                    <Linkedin className="w-5 h-5 text-white" />
                  </a>
                  <a href="#" className="p-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-[#2cc295] transition-all duration-300">
                    <Instagram className="w-5 h-5 text-white" />
                  </a>
                </div>
              </div>
            </div>

            {/* Founder Vision / Bio */}
            <div className="space-y-8 relative">
              <Quote className="absolute -top-10 -left-6 w-20 h-20 text-[#2cc295]/10" />
              
              <div className="space-y-6 relative z-10">
                <h4 className="text-2xl font-bold text-[#021a1a]">
                  "Bridging the gap between creators and brands"
                </h4>
                
                <p className="text-slate-600 leading-relaxed text-lg italic">
                  Tanish Jain founded BYBERR with a clear vision: to create a better way for brands and creators to collaborate through barter.
                </p>
                
                <p className="text-slate-600 leading-relaxed">
                  After witnessing the inefficiencies in traditional influencer marketing, Tanish set out to build a platform that makes barter collaborations simple, transparent, and mutually beneficial. BYBERR was born from the need to create authentic partnerships where both creators and brands can thrive.
                </p>

                <div className="pt-6 grid grid-cols-2 gap-6">
                  <div className="p-4 rounded-2xl bg-[#f1f7f7] border border-slate-100">
                    <div className="text-2xl font-bold text-[#03624c]">1000+</div>
                    <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Successful Matches</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#f1f7f7] border border-slate-100">
                    <div className="text-2xl font-bold text-[#2cc295]">Mission</div>
                    <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Better Brand-Creator Partnerships</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
// FAQ Section
interface FAQ {
  id: string;
  question: string;
  answer: string;
}

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter FAQs based on category
  const filteredFaqs = faqs.filter(faq => {
    if (activeCategory === 'All') return true;
    if (activeCategory === 'Creators') return faq.question.toLowerCase().includes('creator') || faq.answer.toLowerCase().includes('creator');
    if (activeCategory === 'Brands') return faq.question.toLowerCase().includes('brand') || faq.answer.toLowerCase().includes('brand');
    if (activeCategory === 'General') return !faq.question.toLowerCase().includes('creator') && !faq.question.toLowerCase().includes('brand');
    return true;
  });

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const response = await fetch('/api/faqs');
        if (!response.ok) {
          throw new Error('Failed to fetch FAQs');
        }
        const data = await response.json();
        setFaqs(data);
      } catch (err) {
        console.error('Error fetching FAQs:', err);
        setError('Failed to load FAQs. Please try again later.');
        // Fallback to default FAQs if API fails
        setFaqs([
          { id: '1', question: "How do creators get started?", answer: "Sign up, complete your profile with metrics, browse experiences, and apply. Brands review matches quickly." },
          { id: '2', question: "How do brands submit experiences?", answer: "Create listings with requirements, demographics, and specs. Our platform matches you." },
          { id: '3', question: "Is BYBERR free for creators?", answer: "Yes! Access complimentary experiences at top spots while creating content." },
          { id: '4', question: "How are creators approved?", answer: "Brands review follower count, engagement rates, and content quality via transparent metrics." },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  if (isLoading) {
    return (
      <section id="faq" className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-2xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-[#021a1a]">FAQ</h2>
            <p className="text-slate-500 text-lg">Loading frequently asked questions...</p>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-slate-100 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="faq" className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-2xl text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-[#021a1a]">FAQ</h2>
          <p className="text-red-500 mb-8">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="faq" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f1f7f7] via-[#f8fcfc] to-[#e6f4f4]" />
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-[#03624c]/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tl from-[#00df82]/10 to-transparent rounded-full blur-3xl" />
      </div>
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-[#021a1a]">FAQ</h2>
          <p className="text-slate-500 text-lg">Got questions? We've got answers.</p>
        </div>
        
        {/* Filter Bar */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {['All', 'Creators', 'Brands', 'General'].map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all",
                activeCategory === category
                  ? "bg-[#03624c] text-white shadow-lg shadow-[#03624c]/20"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              )}
            >
              {category}
            </button>
          ))}
        </div>
        
        {/* FAQ Items - One Below Another */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, i) => (
            <div key={faq.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <button 
                onClick={() => setOpenIndex(openIndex === i ? null : i)} 
                className="w-full flex items-center justify-between p-6 text-left hover:bg-[#f8fcfc] transition-colors"
              >
                <h3 className="text-slate-900 font-semibold text-lg flex-1 pr-4">{faq.question}</h3>
                <div className={cn(
                  "text-[#03624c] transition-transform duration-200 flex-shrink-0",
                  openIndex === i ? "rotate-45" : "rotate-0"
                )}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="transition-transform duration-200">
                    <line x1="4" y1="10" x2="16" y2="10" stroke="currentColor" strokeWidth="2" />
                    <line x1="10" y1="4" x2="10" y2="16" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-0 text-slate-500 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Get In Touch Section
const GetInTouchSection = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formState, setFormState] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
    preferredMethod: "email" as "email" | "phone"
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value })
  }

  const handleMethodChange = (method: "email" | "phone") => {
    setFormState({ ...formState, preferredMethod: method })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('ContactSubmission')
        .insert([
          {
            firstName: formState.firstName,
            lastName: formState.lastName,
            email: formState.email,
            phone: formState.phone || null,
            message: formState.message,
            preferredMethod: formState.preferredMethod,
            status: 'pending'
          }
        ])

      if (error) throw error

      setSuccess(true)
      setFormState({ firstName: "", lastName: "", email: "", phone: "", message: "", preferredMethod: "email" })
      
    } catch (error) {
      console.error('Error submitting form:', error)
      alert("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contact" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-[#f8fcfc] to-white" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#03624c]/5 to-transparent -skew-x-12 -translate-x-20" />
        <div className="absolute -bottom-1/2 -left-1/4 w-full h-1/2 bg-gradient-to-t from-[#00df82]/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          
          {/* Left Side: Copy */}
          <div className="lg:w-1/2 pt-10">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-[#021a1a] leading-tight">
              Let's start a <br /><span className="text-[#03624c]">conversation</span>.
            </h2>
            <p className="text-slate-500 text-lg mb-10 max-w-md">
              Whether you're a brand looking to scale or a creator ready to monetize, our team is here to help you get started.
            </p>
            
            <div className="space-y-8">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-[#f1f7f7] rounded-xl flex items-center justify-center text-[#03624c] shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">Email us</h4>
                  <p className="text-slate-500">support@byberr.com</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                 <div className="w-12 h-12 bg-[#f1f7f7] rounded-xl flex items-center justify-center text-[#03624c] shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">Call us</h4>
                  <p className="text-slate-500">+1 (555) 000-0000</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="lg:w-1/2 w-full">
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">First Name</label>
                    <input 
                      required 
                      name="firstName" 
                      value={formState.firstName}
                      onChange={handleChange}
                      placeholder="Jane" 
                      className="w-full px-4 py-3 rounded-xl bg-[#f1f7f7] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2cc295]/30 focus:border-[#2cc295] transition-all text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Last Name</label>
                    <input 
                      required 
                      name="lastName" 
                      value={formState.lastName}
                      onChange={handleChange}
                      placeholder="Doe" 
                      className="w-full px-4 py-3 rounded-xl bg-[#f1f7f7] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2cc295]/30 focus:border-[#2cc295] transition-all text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Email</label>
                    <input 
                      required 
                      type="email" 
                      name="email" 
                      value={formState.email}
                      onChange={handleChange}
                      placeholder="jane@example.com" 
                      className="w-full px-4 py-3 rounded-xl bg-[#f1f7f7] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2cc295]/30 focus:border-[#2cc295] transition-all text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Phone</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={formState.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) ..." 
                      className="w-full px-4 py-3 rounded-xl bg-[#f1f7f7] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2cc295]/30 focus:border-[#2cc295] transition-all text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Preferred Method of Contact</label>
                  <div className="flex gap-4">
                    <button 
                      type="button" 
                      onClick={() => handleMethodChange('email')}
                      className={cn(
                        "flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all font-medium text-sm",
                        formState.preferredMethod === 'email' 
                          ? "bg-[#f1f7f7] border-[#2cc295] text-[#2cc295] ring-1 ring-[#2cc295]" 
                          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                      )}
                    >
                      <Mail size={16} /> Email
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleMethodChange('phone')}
                      className={cn(
                        "flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all font-medium text-sm",
                        formState.preferredMethod === 'phone' 
                          ? "bg-[#f1f7f7] border-[#2cc295] text-[#2cc295] ring-1 ring-[#2cc295]" 
                          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                      )}
                    >
                      <Phone size={16} /> Phone
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Message</label>
                  <textarea 
                    required 
                    name="message" 
                    value={formState.message}
                    onChange={handleChange}
                    rows={4} 
                    placeholder="Tell us about your needs..." 
                    className="w-full px-4 py-3 rounded-xl bg-[#f1f7f7] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2cc295]/30 focus:border-[#2cc295] transition-all text-slate-900 placeholder:text-slate-400 resize-none"
                  />
                </div>
                <Button 
                  disabled={loading}
                  className="w-full h-12 bg-[#0B3D2E] text-white rounded-xl font-bold text-base shadow-lg shadow-[#0B3D2E]/20 transition-all duration-400 mt-2"
                >
                  {loading ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2 w-4 h-4" />}
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Success Popup */}
      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#021a1a]/50 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center relative"
            >
              <button onClick={() => setSuccess(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                <XIcon size={20} />
              </button>
              <div className="w-16 h-16 bg-[#f1f7f7] rounded-full flex items-center justify-center text-[#00df82] mx-auto mb-6">
                <Check size={32} strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h3>
              <p className="text-slate-500 mb-6">
                Thanks for sending in your query. Our team will reach out to you shortly via {formState.preferredMethod}.
              </p>
              <Button onClick={() => setSuccess(false)} className="w-full bg-[#03624c] hover:bg-[#042222] text-white rounded-xl">
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default function HomePage() {
  return (
    <>
      <GlobalStyles />
      <FormHydrationFix />
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <ComparisonSection />
      <HowItWorksSection />
      <LogoShowcase />
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-[#f8fcfc] -z-10" />
        <FAQSection />
        <GetInTouchSection />
      </div>

      <footer className="bg-[#021a1a] border-t border-white/10 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-1">
              <Image
                src="/Byberr 1.svg"   
                alt="Byberr"
                width={82}
                height={32}
                className="w-18 h-8 object-contain brightness-0 invert"
              />
              <p className="text-sm text-slate-400 mt-4">Authentic creator partnerships, made simple.</p>
            </div>
            {[
               { 
                  h: "Platform", 
                  links: [
                    { name: "Creators", href: "#" }, 
                    { name: "Brands", href: "#" }, 
                    { name: "Pricing", href: "#" }
                  ] 
               },
               { 
                  h: "Company", 
                  links: [
                    { name: "About", href: "#" }, 
                    { name: "Careers", href: "#" }, 
                    { name: "Blog", href: "#" }
                  ] 
               },
               { 
                  h: "Legal", 
                  links: [
                    { name: "Privacy", href: "/privacy" }, 
                    { name: "Terms", href: "/termsandconditions" }
                  ] 
               }
            ].map((col, i) => (
               <div key={i}>
                  <h4 className="font-bold mb-4 text-white">{col.h}</h4>
                  <ul className="space-y-2 text-sm text-slate-400">
                     {col.links.map((link) => (
                        <li key={link.name}>
                          <Link href={link.href} className="hover:text-[#2cc295] transition-colors">
                            {link.name}
                          </Link>
                        </li>
                     ))}
                  </ul>
               </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-slate-500 gap-4">
            <p>&copy; 2025 BYBERR. All rights reserved.</p>
            <div className="flex gap-6">
               <a href="https://www.instagram.com/byberr.in?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" aria-label="Visit our Instagram">
                 <Instagram className="w-5 h-5 text-slate-400 hover:text-[#2cc295] transition-colors" />
               </a>
               <a href="https://www.linkedin.com/company/byberr/" target="_blank" rel="noopener noreferrer" aria-label="Visit our LinkedIn">
                 <Linkedin className="w-5 h-5 text-slate-400 hover:text-[#2cc295] transition-colors" />
               </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}