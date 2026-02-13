"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from "react";
import { Instagram, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import Image from "next/image";

// Defined list of niches for the dropdown
const CREATOR_NICHES = [
  "Art & Design", "Automotive", "Beauty & Skincare", "Business & Finance",
  "Comedy & Entertainment", "DIY & Crafts", "Education & Career", "Fashion & Style",
  "Food & Drink", "Gaming", "Health & Fitness", "Home & Decor", "Lifestyle",
  "Music & Dance", "Parenting & Family", "Pets & Animals", "Photography",
  "Sports & Outdoors", "Technology", "Travel", "Other"
];

// Defined list of business types for the dropdown
const BUSINESS_TYPES = [
  "Agency (Marketing/PR)", "App / SaaS", "Beauty & Cosmetics", "Clothing & Apparel",
  "Consumer Electronics", "Education & Course", "Event & Entertainment",
  "Food & Beverage", "Health & Wellness", "Home & Garden", "Local Business (Storefront)",
  "Non-Profit", "Travel & Hospitality", "Other"
];

interface OnboardingData {
  email: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  website: string;
  date_of_birth: string;
  // Creator Specific
  niche: string;
  content_style: string;
  languages: string;
  // Business Specific
  business_type: string;
  business_description: string;
}

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [userType, setUserType] = useState<"creator" | "business">("creator");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [metaAppId, setMetaAppId] = useState<string>("");

  // --- New State for Onboarding Modal ---
  const [showOnboarding, setShowOnboarding] = useState(false);
  // NEW: State for Meta Requirement Disclaimer Popup
  const [showMetaRequirements, setShowMetaRequirements] = useState(false);
  const [pendingInstaData, setPendingInstaData] = useState<any>(null);
  
  // Pincode & Validation Logic States
  const [isValidatingPin, setIsValidatingPin] = useState(false);
  const [pincodeError, setPincodeError] = useState<string | null>(null);

  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    email: "",
    phone: "",
    country: "India", // Default to India
    state: "",
    city: "",
    pincode: "",
    website: "",
    date_of_birth: "",
    business_type: "",
    business_description: "",
  });

  useEffect(() => {
    const loadConfig = async () => {
      try {
        let response = await fetch('/api/config');
        let data;
        
        try {
          data = await response.json();
        } catch (jsonError) {
          console.log('[v0] Primary config failed, trying hardcoded fallback');
          response = await fetch('/api/config-hardcoded');
          data = await response.json();
        }
        
        if (data && data.metaAppId) {
          setMetaAppId(data.metaAppId);
          console.log('[v0] Meta App ID loaded:', data.metaAppId);
        } else {
          console.error('[v0] No Meta App ID found in config');
          setError('Instagram configuration is not properly set up. Please contact support.');
        }
      } catch (err) {
        console.error('[v0] Error loading Meta config:', err);
        setError('Failed to load Instagram configuration. Please try again.');
      }
    };

    const checkInstagramAuthData = () => {
      try {
        const authData = sessionStorage.getItem('instagramAuthData');
        if (authData) {
          console.log('[v0] Found Instagram auth data in sessionStorage:', authData);
          setPendingInstaData(authData);
          setShowOnboarding(true);
          // Clear the stored data after using it
          sessionStorage.removeItem('instagramAuthData');
        }
      } catch (err) {
        console.error('[v0] Error parsing Instagram auth data:', err);
        sessionStorage.removeItem('instagramAuthData');
      }
    };

    loadConfig();
    checkInstagramAuthData();
  }, []);

  const handleOnboardingChange = (field: keyof OnboardingData, value: string) => {
    setOnboardingData(prev => ({ ...prev, [field]: value }));
  };

  const handleInstagramSignup = () => {
    if (!metaAppId) {
      setError("Instagram configuration missing.");
      return;
    }

    const configId = "1265845242421860";
    
    // Dynamic redirect URI based on current origin
    const redirectUri = `${window.location.origin}/auth/instagram/callback`;
    
    // Direct redirect to Instagram OAuth
    const authUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${metaAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&config_id=${configId}&response_type=code&state=instagram-signup-${userType}`;
    
    window.location.href = authUrl;
  };

  // --- Helper: Age Calculation ---
  const getAge = (dateString: string) => {
    const today = new Date();
    const [year, month, day] = dateString.split("-").map(Number);
    let age = today.getFullYear() - year;
    const m = (today.getMonth() + 1) - month;
    if (m < 0 || (m === 0 && today.getDate() < day)) {
        age--;
    }
    return age;
  };

  // --- Helper: Pincode Validation ---
  const validatePincode = async (pin: string) => {
    const indianPinRegex = /^[1-9][0-9]{5}$/;
    
    if (!indianPinRegex.test(pin)) {
        setPincodeError("Pincode must be 6 digits and cannot start with 0.");
        return;
    }

    setIsValidatingPin(true);
    setPincodeError(null);

    try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const data = await response.json();

        if (data && data[0].Status === "Success") {
            const postOffice = data[0].PostOffice[0];
            const { District, State, Country } = postOffice;
            
            setOnboardingData(prev => ({
                ...prev,
                city: District || "",
                state: State || "",
                country: Country || ""
            }));
        } else {
            setPincodeError("Invalid pincode. Please enter a valid Indian pincode.");
        }
    } catch (err) {
        console.error('[v0] Pincode validation error:', err);
        setPincodeError("Failed to validate pincode. Please try again.");
    } finally {
        setIsValidatingPin(false);
    }
  };

  // --- Form Submit Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    if (password !== repeatPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      
      // Create synthetic email for Instagram users
      const syntheticEmail = `${email.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}@instagram.collabcart.com`;
      
      const { data, error } = await supabase.auth.signUp({
        email: syntheticEmail,
        password,
        options: {
          data: {
            email: syntheticEmail,
            display_name: displayName || email.split('@')[0],
            user_type: userType,
            approval_status: 'pending',
          }
        }
      });

      if (error) {
        console.error('[v0] Signup error:', error);
        setError(error.message || "Failed to create account. Please try again.");
      } else if (data.user) {
        console.log('[v0] Account created successfully:', data.user.id);
        
        // Store onboarding data for after Instagram auth
        sessionStorage.setItem('pendingOnboardingData', JSON.stringify({
          ...onboardingData,
          user_id: data.user.id,
          email: syntheticEmail,
          user_type: userType
        }));
        
        // Redirect to Instagram OAuth
        handleInstagramSignup();
      }
    } catch (err: any) {
      console.error('[v0] Unexpected error:', err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Complete Onboarding Handler ---
  const completeOnboarding = async () => {
    if (!pendingInstaData) return;
    
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Calculate expiry (60 days for long-lived token)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 60);

      // Update user with Meta tokens and onboarding data
      const { error: updateError } = await supabase
        .from("users")
        .update({
          meta_access_token: pendingInstaData.pageAccessToken || pendingInstaData.accessToken,
          meta_user_id: pendingInstaData.metaUserId,
          meta_token_expires_at: expiresAt.toISOString(),
          instagram_business_account_id: pendingInstaData.instagramUserId,
          facebook_page_id: pendingInstaData.facebookPageId,
          display_name: pendingInstaData.instagramHandle,
          email: onboardingData.email,
          phone: onboardingData.phone,
          country: onboardingData.country,
          state: onboardingData.state,
          city: onboardingData.city,
          website: onboardingData.website,
          date_of_birth: onboardingData.date_of_birth,
          // Creator specific
          niche: onboardingData.niche,
          content_style: onboardingData.content_style,
          languages: onboardingData.languages,
          // Business specific
          business_type: onboardingData.business_type,
          business_description: onboardingData.business_description,
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("[v0] Database update error:", updateError);
        throw updateError;
      }

      console.log("[v0] Onboarding completed successfully");
      router.push("/pending-approval");
      
    } catch (err: any) {
      console.error("[v0] Onboarding completion error:", err);
      setError(err.message || "Failed to complete onboarding. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px] bg-slate-50 font-sans selection:bg-teal-200 selection:text-teal-900">
      
      {/* Left Side - Branding & Visuals (Same as Login) */}
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
              &ldquo;Join thousands of creators and brands collaborating seamlessly on Byberr.&rdquo;
            </p>
            <footer className="flex items-center gap-3 pt-2">
                <div className="w-10 h-10 rounded-full bg-teal-800/50 border border-teal-700 flex items-center justify-center text-teal-200 font-bold text-sm">BT</div>
                <div className="text-sm">
                    <div className="font-semibold text-white">The Byberr Team</div>
                    <div className="text-teal-200/60">Join Our Community</div>
                </div>
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 relative">
        <div className="mx-auto grid w-full max-w-[420px] gap-6 relative z-10">
          
          {/* Card Container - White & Subtle */}
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200">
             
             {/* Back Link */}
             <div className="flex justify-start mb-6">
                <Link 
                  href="/auth/login" 
                  className="text-sm font-medium text-slate-500 hover:text-teal-600 flex items-center gap-2 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Link>
             </div>

             {/* Header */}
             <div className="text-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Create Account</h1>
                <p className="text-slate-500 text-sm">
                  Join as a Creator or Business to start collaborating
                </p>
             </div>

             {/* Form Content */}
             <div className="grid gap-5">
              {!showOnboarding ? (
                <>
                  {/* User Type Selection */}
                  <div className="grid gap-2">
                    <Label htmlFor="userType" className="text-slate-700 font-semibold">Account Type</Label>
                    <Select value={userType} onValueChange={setUserType}>
                      <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500">
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="creator">Creator</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Email Field */}
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-slate-700 font-semibold">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder:text-slate-400 transition-all"
                    />
                  </div>

                  {/* Password Fields */}
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-slate-700 font-semibold">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder:text-slate-400 transition-all"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="repeatPassword" className="text-slate-700 font-semibold">Confirm Password</Label>
                    <Input
                      id="repeatPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                      required
                      className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder:text-slate-400 transition-all"
                    />
                  </div>

                  {/* Instagram Connect Button */}
                  <Button 
                    type="button"
                    variant="outline"
                    className="w-full h-12"
                    onClick={handleInstagramSignup}
                    disabled={!metaAppId}
                  >
                    <Instagram className="mr-2 h-4 w-4 text-pink-600" />
                    Continue with Instagram
                  </Button>

                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        {error}
                    </div>
                  )}

                  <div className="text-center">
                    <p className="text-sm text-slate-500">
                      Already have an account?{" "}
                      <Link href="/auth/login" className="text-teal-600 hover:text-teal-700 hover:underline font-medium">
                        Sign in
                      </Link>
                    </p>
                  </div>
                </>
              ) : (
                /* Onboarding Modal */
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-xl font-semibold text-slate-900">Complete Your Profile</h2>
                    <p className="text-slate-500 text-sm mt-2">
                      Please provide the following information to complete your account setup
                    </p>
                  </div>

                  {/* Onboarding Form Fields */}
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="onboardingEmail" className="text-slate-700 font-semibold">Email</Label>
                      <Input
                        id="onboardingEmail"
                        type="email"
                        placeholder="Your email address"
                        value={onboardingData.email}
                        onChange={(e) => handleOnboardingChange('email', e.target.value)}
                        className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder:text-slate-400 transition-all"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-slate-700 font-semibold">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={onboardingData.phone}
                        onChange={(e) => handleOnboardingChange('phone', e.target.value)}
                        className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder:text-slate-400 transition-all"
                      />
                    </div>

                    {/* Country */}
                    <div className="space-y-2">
                      <Label htmlFor="country" className="text-slate-700 font-semibold">Country</Label>
                      <Input
                        id="country"
                        placeholder="India"
                        value={onboardingData.country}
                        onChange={(e) => handleOnboardingChange('country', e.target.value)}
                        className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder:text-slate-400 transition-all"
                      />
                    </div>

                    {/* State and City */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="state" className="text-slate-700 font-semibold">State</Label>
                        <Input
                          id="state"
                          placeholder="Maharashtra"
                          value={onboardingData.state}
                          onChange={(e) => handleOnboardingChange('state', e.target.value)}
                          className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder:text-slate-400 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-slate-700 font-semibold">City</Label>
                        <Input
                          id="city"
                          placeholder="Mumbai"
                          value={onboardingData.city}
                          onChange={(e) => handleOnboardingChange('city', e.target.value)}
                          className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder:text-slate-400 transition-all"
                        />
                      </div>
                    </div>

                    {/* Pincode */}
                    <div className="space-y-2">
                      <Label htmlFor="pincode" className="text-slate-700 font-semibold">Pincode</Label>
                      <div className="relative">
                        <Input
                          id="pincode"
                          placeholder="400001"
                          value={onboardingData.pincode}
                          onChange={(e) => handleOnboardingChange('pincode', e.target.value)}
                          onBlur={() => onboardingData.pincode.length === 6 && validatePincode(onboardingData.pincode)}
                          className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder:text-slate-400 transition-all"
                        />
                        {isValidatingPin && (
                          <div className="absolute right-3 top-3">
                            <Loader2 className="w-4 h-4 animate-spin" />
                          </div>
                        )}
                      </div>
                      {pincodeError && (
                        <p className="text-destructive text-xs mt-1">{pincodeError}</p>
                      )}
                    </div>

                    {/* Website */}
                    <div className="space-y-2">
                      <Label htmlFor="website" className="text-slate-700 font-semibold">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        placeholder="https://yourwebsite.com"
                        value={onboardingData.website}
                        onChange={(e) => handleOnboardingChange('website', e.target.value)}
                        className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder:text-slate-400 transition-all"
                      />
                    </div>

                    {/* Date of Birth */}
                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth" className="text-slate-700 font-semibold">Date of Birth</Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={onboardingData.date_of_birth}
                        onChange={(e) => handleOnboardingChange('date_of_birth', e.target.value)}
                        className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder:text-slate-400 transition-all"
                      />
                    </div>

                    {/* User Type Specific Fields */}
                    {userType === 'creator' ? (
                      <>
                        {/* Niche */}
                        <div className="space-y-2">
                          <Label htmlFor="niche" className="text-slate-700 font-semibold">Content Niche</Label>
                          <Select value={onboardingData.niche} onValueChange={(value) => handleOnboardingChange('niche', value)}>
                            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500">
                              <SelectValue placeholder="Select your niche" />
                            </SelectTrigger>
                            <SelectContent>
                              {CREATOR_NICHES.map((niche) => (
                                <SelectItem key={niche} value={niche}>
                                  {niche}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Content Style */}
                        <div className="space-y-2">
                          <Label htmlFor="content_style" className="text-slate-700 font-semibold">Content Style</Label>
                          <Textarea
                            id="content_style"
                            placeholder="Describe your content style..."
                            value={onboardingData.content_style}
                            onChange={(e) => handleOnboardingChange('content_style', e.target.value)}
                            rows={3}
                            className="rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder:text-slate-400 transition-all"
                          />
                        </div>

                        {/* Languages */}
                        <div className="space-y-2">
                          <Label htmlFor="languages" className="text-slate-700 font-semibold">Languages</Label>
                          <Input
                            id="languages"
                            placeholder="English, Hindi, Marathi"
                            value={onboardingData.languages}
                            onChange={(e) => handleOnboardingChange('languages', e.target.value)}
                            className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder:text-slate-400 transition-all"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Business Type */}
                        <div className="space-y-2">
                          <Label htmlFor="business_type" className="text-slate-700 font-semibold">Business Type</Label>
                          <Select value={onboardingData.business_type} onValueChange={(value) => handleOnboardingChange('business_type', value)}>
                            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500">
                              <SelectValue placeholder="Select business type" />
                            </SelectTrigger>
                            <SelectContent>
                              {BUSINESS_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Business Description */}
                        <div className="space-y-2">
                          <Label htmlFor="business_description" className="text-slate-700 font-semibold">Business Description</Label>
                          <Textarea
                            id="business_description"
                            placeholder="Describe your business..."
                            value={onboardingData.business_description}
                            onChange={(e) => handleOnboardingChange('business_description', e.target.value)}
                            rows={3}
                            className="rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder:text-slate-400 transition-all"
                          />
                        </div>
                      </>
                    )}

                    {error && (
                      <div className="text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          {error}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowOnboarding(false)}
                      className="flex-1 h-12"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={completeOnboarding}
                      disabled={isLoading}
                      className="flex-1 h-12"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Completing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Complete Profile
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
