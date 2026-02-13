"use client";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { ArrowLeft, Command, Instagram, Loader2 } from 'lucide-react';
import { useAuth } from "@/contexts/auth-context";

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInstagramLoading, setIsInstagramLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // --- LOGIC START (Unchanged) ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      console.log("[v0] Login attempt with:", email);
      
      if (email === "admin" && password === "admin") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: "admin@collabcart.com",
          password: "admin123",
        });

        if (signInError) {
          setError("Admin account not set up.");
          setIsLoading(false);
          return;
        }
        router.push("/admin");
        return;
      }

      if (!email.includes("@") && !password) {
        const { data: userData, error: fetchError } = await supabase
          .from("users")
          .select("email, instagram_business_account_id")
          .eq("instagram_handle", email.startsWith("@") ? email : `@${email}`)
          .single();

        if (fetchError || !userData) {
          setError("Instagram account not found. Please use 'Login with Instagram' button.");
          setIsLoading(false);
          return;
        }

        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: userData.email,
          password: userData.instagram_business_account_id,
        });

        if (signInError) {
          setError("Failed to login. Please use 'Login with Instagram' button.");
          setIsLoading(false);
          return;
        }

        const { data: userStatus } = await supabase
          .from("users")
          .select("approval_status, user_type")
          .eq("id", data.user.id)
          .single();

        if (userStatus?.approval_status === "pending") {
          router.push("/auth/pending-approval");
        } else if (userStatus?.approval_status === "rejected") {
          router.push("/auth/rejected");
        } else {
          router.push("/dashboard");
        }
        return;
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      const { data: userData } = await supabase
        .from("users")
        .select("approval_status, user_type")
        .eq("id", data.user.id)
        .single();

      if (userData?.approval_status === "pending") {
        router.push("/auth/pending-approval");
      } else if (userData?.approval_status === "rejected") {
        router.push("/auth/rejected");
      } else {
        router.push("/dashboard");
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
      setIsLoading(false);
    }
  };

  const handleInstagramLogin = async () => {
    setIsInstagramLoading(true);
    setError(null);

    try {
      // Import the Meta auth function
      const { getMetaAuthUrl } = await import('@/lib/meta');
      
      // Check if we should use fallback (from URL params or previous errors)
      const urlParams = new URLSearchParams(window.location.search);
      const useFallback = urlParams.get('fallback') === 'true';
      
      // Try with config ID first, fallback to individual scopes if needed
      let authUrl = getMetaAuthUrl("creator", !useFallback, false);
      
      console.log(`[v0] Redirecting to Meta OAuth (${useFallback ? 'individual scopes' : 'config ID'})`);
      window.location.href = authUrl;

    } catch (err: any) {
      console.error('Error in Instagram login:', err);
      setError(err.message || "Failed to load Instagram configuration");
      setIsInstagramLoading(false);
    }
  };
  // --- LOGIC END ---

  return (
    <div className="w-full h-screen lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px] bg-slate-50 font-sans selection:bg-teal-200 selection:text-teal-900">
      
      {/* Left Side - Branding & Visuals (Updated) */}
      <div className="relative hidden h-full flex-col justify-between overflow-hidden bg-[#012e28] p-10 lg:flex">
        
        {/* Background Blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        {/* Logo */}
        <Link href="/" className="relative z-20 flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Image
                        src="/Byberr 1.svg"   
                        alt="Byberr"
                        width={82}
                        height={32}
                        className="w-18 h-8 object-contain" // Keeps it the same size as the old box  
                      />
        </Link>

        {/* Graph Illustration */}
        <div className="relative z-20 flex-1 flex items-center justify-center">
          <div className="w-full max-w-md h-64 relative">
            {/* Graph Grid */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-full h-px bg-white/10"></div>
              ))}
            </div>
            <div className="absolute inset-0 flex justify-between">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-full w-px bg-white/10"></div>
              ))}
            </div>
            
            {/* Graph Lines */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 256" fill="none">
              {/* Line 1 - Growth curve */}
              <path d="M 20 200 Q 100 180 150 120 T 280 60 L 380 40" 
                    stroke="white" strokeWidth="3" fill="none" opacity="0.8"/>
              
              {/* Line 2 - Steady growth */}
              <path d="M 20 220 L 100 200 L 180 160 L 260 140 L 340 100 L 380 80" 
                    stroke="white" strokeWidth="3" fill="none" opacity="0.6"/>
              
              {/* Line 3 - Moderate growth */}
              <path d="M 20 180 L 100 170 L 180 150 L 260 130 L 340 110 L 380 100" 
                    stroke="white" strokeWidth="3" fill="none" opacity="0.4"/>
              
              {/* Data points */}
              {[20, 100, 180, 260, 340, 380].map((x, i) => (
                <circle key={`points1-${i}`} cx={x} cy={200 - i * 30} r="4" fill="white" opacity="0.8"/>
              ))}
              {[20, 100, 180, 260, 340, 380].map((x, i) => (
                <circle key={`points2-${i}`} cx={x} cy={220 - i * 20} r="4" fill="white" opacity="0.6"/>
              ))}
            </svg>
            
            {/* Graph Labels */}
            <div className="absolute bottom-0 left-0 text-xs text-white/60 font-medium">Growth</div>
            <div className="absolute bottom-0 right-0 text-xs text-white/60 font-medium">Time</div>
          </div>
        </div>

        {/* Hero Text / Testimonial */}
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-4">
            <div className="flex gap-1 text-teal-400">
                {[1, 2, 3, 4, 5].map((i) => <span key={i} className="text-xl">★</span>)}
             </div>
            <p className="text-2xl font-medium leading-relaxed text-slate-100">
              &ldquo;Byberr bridges the gap between creators and brands, streamlining the collaboration process like never before.&rdquo;
            </p>
            <footer className="flex items-center gap-3 pt-2">
                <div className="w-10 h-10 rounded-full bg-teal-800/50 border border-teal-700 flex items-center justify-center text-teal-200 font-bold text-sm">BT</div>
                <div className="text-sm">
                    <div className="font-semibold text-white">The Byberr Team</div>
                    <div className="text-teal-200/60">Platform Update</div>
                </div>
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 relative">
        <div className="mx-auto grid w-full max-w-[420px] gap-6 relative z-10">
          
          {/* Card Container - White & Subtle */}
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200">
             
             {/* Back Link */}
             <div className="flex justify-start mb-6">
                <Link 
                  href="/auth/sign-up" 
                  className="text-sm font-medium text-slate-500 hover:text-teal-600 flex items-center gap-2 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Sign up instead
                </Link>
             </div>

             {/* Header */}
             <div className="text-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Welcome back</h1>
                <p className="text-slate-500 text-sm">
                  Login to manage your collaborations
                </p>
             </div>

             {/* Form Content */}
             <div className="grid gap-5">
                {/* Instagram Button */}
                <Button 
                  variant="outline"
                  className="w-full h-12"
                  onClick={handleInstagramLogin}
                  disabled={isInstagramLoading}
                >
                  {isInstagramLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Instagram className="mr-2 h-4 w-4 text-pink-600" />
                  )}
                  {isInstagramLoading ? "Connecting..." : "Continue with Instagram"}
                </Button>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-400 font-medium">
                      Or login with email
                    </span>
                  </div>
                </div>

                <form onSubmit={handleLogin} className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-slate-700 font-semibold">Email or Username</Label>
                    <Input
                      id="email"
                      type="text"
                      placeholder="m@example.com or @handle"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder:text-slate-400 transition-all"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-slate-700 font-semibold">Password</Label>
                      <Link
                        href="/forgot-password"
                        className="text-xs font-medium text-teal-600 hover:text-teal-700 hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder:text-slate-400 transition-all"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Leave empty if logging in with Instagram username
                    </p>
                  </div>

                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        {error}
                    </div>
                  )}

                  <Button type="submit" className="w-full h-12" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </form>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}