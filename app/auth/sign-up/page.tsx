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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link 
          href="/auth/login" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        {/* Signup Form */}
        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">Create Account</h1>
            <p className="text-muted-foreground text-sm mt-2">
              Join as a Creator or Business to start collaborating
            </p>
          </div>

          {!showOnboarding ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* User Type Selection */}
              <div className="space-y-2">
                <Label htmlFor="userType">Account Type</Label>
                <Select value={userType} onValueChange={setUserType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="creator">Creator</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password Fields */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="repeatPassword">Confirm Password</Label>
                <Input
                  id="repeatPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  required
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
                <div className="text-destructive text-sm text-center">
                  {error}
                </div>
              )}

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          ) : (
            /* Onboarding Modal */
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold">Complete Your Profile</h2>
                <p className="text-muted-foreground text-sm mt-2">
                  Please provide the following information to complete your account setup
                </p>
              </div>

              {/* Onboarding Form Fields */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="onboardingEmail">Email</Label>
                  <Input
                    id="onboardingEmail"
                    type="email"
                    placeholder="Your email address"
                    value={onboardingData.email}
                    onChange={(e) => handleOnboardingChange('email', e.target.value)}
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={onboardingData.phone}
                    onChange={(e) => handleOnboardingChange('phone', e.target.value)}
                  />
                </div>

                {/* Country */}
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    placeholder="India"
                    value={onboardingData.country}
                    onChange={(e) => handleOnboardingChange('country', e.target.value)}
                  />
                </div>

                {/* State and City */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      placeholder="Maharashtra"
                      value={onboardingData.state}
                      onChange={(e) => handleOnboardingChange('state', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="Mumbai"
                      value={onboardingData.city}
                      onChange={(e) => handleOnboardingChange('city', e.target.value)}
                    />
                  </div>
                </div>

                {/* Pincode */}
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <div className="relative">
                    <Input
                      id="pincode"
                      placeholder="400001"
                      value={onboardingData.pincode}
                      onChange={(e) => handleOnboardingChange('pincode', e.target.value)}
                      onBlur={() => onboardingData.pincode.length === 6 && validatePincode(onboardingData.pincode)}
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
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://yourwebsite.com"
                    value={onboardingData.website}
                    onChange={(e) => handleOnboardingChange('website', e.target.value)}
                  />
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={onboardingData.date_of_birth}
                    onChange={(e) => handleOnboardingChange('date_of_birth', e.target.value)}
                  />
                </div>

                {/* User Type Specific Fields */}
                {userType === 'creator' ? (
                  <>
                    {/* Niche */}
                    <div className="space-y-2">
                      <Label htmlFor="niche">Content Niche</Label>
                      <Select value={onboardingData.niche} onValueChange={(value) => handleOnboardingChange('niche', value)}>
                        <SelectTrigger>
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
                      <Label htmlFor="content_style">Content Style</Label>
                      <Textarea
                        id="content_style"
                        placeholder="Describe your content style..."
                        value={onboardingData.content_style}
                        onChange={(e) => handleOnboardingChange('content_style', e.target.value)}
                        rows={3}
                      />
                    </div>

                    {/* Languages */}
                    <div className="space-y-2">
                      <Label htmlFor="languages">Languages</Label>
                      <Input
                        id="languages"
                        placeholder="English, Hindi, Marathi"
                        value={onboardingData.languages}
                        onChange={(e) => handleOnboardingChange('languages', e.target.value)}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Business Type */}
                    <div className="space-y-2">
                      <Label htmlFor="business_type">Business Type</Label>
                      <Select value={onboardingData.business_type} onValueChange={(value) => handleOnboardingChange('business_type', value)}>
                        <SelectTrigger>
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
                      <Label htmlFor="business_description">Business Description</Label>
                      <Textarea
                        id="business_description"
                        placeholder="Describe your business..."
                        value={onboardingData.business_description}
                        onChange={(e) => handleOnboardingChange('business_description', e.target.value)}
                        rows={3}
                      />
                    </div>
                  </>
                )}

                {error && (
                  <div className="text-destructive text-sm">
                    {error}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowOnboarding(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={completeOnboarding}
                  disabled={isLoading}
                  className="flex-1"
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
  );
}
