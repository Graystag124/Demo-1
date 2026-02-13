// "use client";

// import { createClient } from "@/lib/supabase/client";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Textarea } from "@/components/ui/textarea";
// import Link from "next/link";
// import { useRouter } from 'next/navigation';
// import { useState, useEffect } from "react";
// import { Instagram, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
// import { cn } from "@/lib/utils";
// import Image from "next/image";

// // Defined list of niches for the dropdown
// const CREATOR_NICHES = [
//   "Art & Design", "Automotive", "Beauty & Skincare", "Business & Finance",
//   "Comedy & Entertainment", "DIY & Crafts", "Education & Career", "Fashion & Style",
//   "Food & Drink", "Gaming", "Health & Fitness", "Home & Decor", "Lifestyle",
//   "Music & Dance", "Parenting & Family", "Pets & Animals", "Photography",
//   "Sports & Outdoors", "Technology", "Travel", "Other"
// ];

// // Defined list of business types for the dropdown
// const BUSINESS_TYPES = [
//   "Agency (Marketing/PR)", "App / SaaS", "Beauty & Cosmetics", "Clothing & Apparel",
//   "Consumer Electronics", "Education & Course", "Event & Entertainment",
//   "Food & Beverage", "Health & Wellness", "Home & Garden", "Local Business (Storefront)",
//   "Non-Profit", "Travel & Hospitality", "Other"
// ];

// interface OnboardingData {
//   email: string;
//   phone: string;
//   country: string;
//   state: string;
//   city: string;
//   website: string;
//   // Creator Specific
//   niche: string;
//   content_style: string;
//   languages: string;
//   // Business Specific
//   business_type: string;
//   business_description: string;
// }

// export default function Page() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [repeatPassword, setRepeatPassword] = useState("");
//   const [displayName, setDisplayName] = useState("");
//   const [userType, setUserType] = useState<"creator" | "business">("creator");
//   const [error, setError] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const router = useRouter();
//   const [metaAppId, setMetaAppId] = useState<string>("");

//   // --- New State for Onboarding Modal ---
//   const [showOnboarding, setShowOnboarding] = useState(false);
//   const [pendingInstaData, setPendingInstaData] = useState<any>(null);
//   const [onboardingData, setOnboardingData] = useState<OnboardingData>({
//     email: "",
//     phone: "",
//     country: "",
//     state: "",
//     city: "",
//     website: "",
//     niche: "",
//     content_style: "",
//     languages: "",
//     business_type: "",
//     business_description: "",
//   });

//   useEffect(() => {
//     fetch('/api/meta/config')
//       .then(res => res.json())
//       .then(data => {
//         setMetaAppId(data.appId);
//       })
//       .catch(err => console.error("[v0] Failed to load Meta config:", err));
//   }, []);

//   const handleOnboardingChange = (field: keyof OnboardingData, value: string) => {
//     setOnboardingData(prev => ({ ...prev, [field]: value }));
//   };

//   const handleInstagramSignup = () => {
//     if (!metaAppId) {
//       setError("Instagram configuration missing.");
//       return;
//     }

//     const redirectUri = `${window.location.origin}/auth/instagram/callback`;
//     const authUrl = new URL("https://www.facebook.com/v21.0/dialog/oauth");
//     authUrl.searchParams.set("client_id", metaAppId);
//     authUrl.searchParams.set("redirect_uri", redirectUri);
//     authUrl.searchParams.set("scope", "instagram_basic,pages_show_list,instagram_manage_insights,pages_read_engagement,business_management");
//     authUrl.searchParams.set("response_type", "code");
//     authUrl.searchParams.set("state", `instagram-signup-${userType}`);

//     const width = 600;
//     const height = 700;
//     const left = window.screen.width / 2 - width / 2;
//     const top = window.screen.height / 2 - height / 2;

//     const popup = window.open(
//       authUrl.toString(),
//       "Instagram Signup",
//       `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
//     );

//     if (!popup) {
//       setError("Popup blocked. Please allow popups for this site.");
//       return;
//     }

//     const messageHandler = async (event: MessageEvent) => {
//       if (event.origin !== window.location.origin) return;

//       if (event.data.type === "instagram-auth-success") {
//         window.removeEventListener("message", messageHandler);
//         popup?.close();
//         setPendingInstaData(event.data);
//         setShowOnboarding(true);
//       } else if (event.data.type === "instagram-auth-error") {
//         window.removeEventListener("message", messageHandler);
//         popup?.close();
//         setError(event.data.error || "Failed to connect Instagram");
//       }
//     };

//     window.addEventListener("message", messageHandler);

//     const checkPopup = setInterval(() => {
//       if (popup?.closed) {
//         clearInterval(checkPopup);
//         window.removeEventListener("message", messageHandler);
//       }
//     }, 500);
//   };

//   const handleOnboardingSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     await handleFinalizeSignup();
//   };

//   const handleFinalizeSignup = async () => {
//     if (!pendingInstaData) {
//       setError("Missing Instagram data. Please try again.");
//       return;
//     }

//     setIsLoading(true);
//     setError(null);

//     try {
//       // Validate required fields
//       const requiredFields = ['email', 'phone', 'country', 'state', 'city'];
//       const missingFields = requiredFields.filter(field => !onboardingData[field as keyof OnboardingData]);
      
//       if (missingFields.length > 0) {
//         throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
//       }

//       if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(onboardingData.email)) {
//         throw new Error('Please enter a valid email address');
//       }

//       const languagesArray = onboardingData.languages
//         .split(',')
//         .map(s => s.trim())
//         .filter(Boolean);

//       const payload = {
//         accessToken: pendingInstaData.accessToken,
//         pageAccessToken: pendingInstaData.pageAccessToken,
//         instagramUserId: pendingInstaData.instagramUserId,
//         instagramHandle: pendingInstaData.instagramHandle,
//         facebookPageId: pendingInstaData.facebookPageId,
//         followersCount: pendingInstaData.followersCount,
//         metaUserId: pendingInstaData.metaUserId,
//         metaUserName: pendingInstaData.metaUserName,
//         metaProfilePicture: pendingInstaData.metaProfilePicture,
//         userType,
//         email: onboardingData.email,
//         phone: onboardingData.phone,
//         country: onboardingData.country,
//         state: onboardingData.state,
//         city: onboardingData.city,
//         website: onboardingData.website || '',
//         ...(userType === 'creator' 
//           ? {
//               niche: onboardingData.niche,
//               content_style: onboardingData.content_style,
//               languages: languagesArray,
//             }
//           : {
//               business_type: onboardingData.business_type,
//               business_description: onboardingData.business_description,
//             }
//         )
//       };

//       console.log('Sending signup payload:', payload);

//       const response = await fetch("/api/auth/instagram/signup", {
//         method: "POST",
//         headers: { 
//           "Content-Type": "application/json",
//           "Accept": "application/json"
//         },
//         body: JSON.stringify(payload),
//       });

//       const result = await response.json();

//       if (!response.ok) {
//         throw new Error(result.error || "Failed to create account. Please try again.");
//       }

//       // Success - redirect to pending approval
//       router.push("/auth/pending-approval");
//       router.refresh();
//     } catch (err: any) {
//       console.error('Signup error:', err);
//       setError(err.message || "An error occurred while creating your account. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleSignUp = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const supabase = createClient();
//     setIsLoading(true);
//     setError(null);

//     if (password !== repeatPassword) {
//       setError("Passwords do not match");
//       setIsLoading(false);
//       return;
//     }

//     try {
//       const { error } = await supabase.auth.signUp({
//         email,
//         password,
//         options: {
//           emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/meta/connect`,
//           data: {
//             user_type: userType,
//             display_name: displayName,
//           },
//         },
//       });
//       if (error) throw error;
//       router.push("/auth/sign-up-success");
//     } catch (error: unknown) {
//       setError(error instanceof Error ? error.message : "An error occurred");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="w-full h-screen lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px] bg-slate-50 font-sans selection:bg-teal-200 selection:text-teal-900">
      
//       {/* Left Side - Branding & Visuals */}
//       {/* Uses the #012e28 "Deep Green" from the Landing Page Contact Section */}
//       <div className="relative hidden h-full flex-col justify-between overflow-hidden bg-[#012e28] p-10 lg:flex">
        
//         {/* Decorative Blobs */}
//         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
//         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        
//         {/* LOGO - Wrapped in Link for Redirect */}
//         <Link href="/" className="relative z-20 flex items-center gap-2 hover:opacity-90 transition-opacity">
//            {/* <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-teal-900/50">
//             <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
//               <rect x="3" y="3" width="8" height="8" className="opacity-50" />
//               <rect x="13" y="3" width="8" height="8" />
//               <rect x="3" y="13" width="8" height="8" />
//               <rect x="13" y="13" width="8" height="8" className="opacity-50" />
//             </svg>
//           </div>
//           <span className="font-bold text-xl text-white tracking-tight">BYBERR</span> */}
//           <Image
//             src="/Byberr 1.svg"   
//             alt="Byberr"
//             width={82}
//             height={32}
//             className="w-18 h-8 object-contain" // Keeps it the same size as the old box  
//           />
//         </Link>

//         {/* Testimonial / Bottom Content */}
//         <div className="relative z-20 mt-auto">
//           <blockquote className="space-y-6">
//              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-900/50 border border-teal-800 text-teal-300 text-xs font-medium">
//                 <span className="relative flex h-2 w-2">
//                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
//                   <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
//                 </span>
//                 Join 10,000+ Creators
//              </div>
             
//              <div className="flex gap-1 text-teal-400">
//                 {[1, 2, 3, 4, 5].map((i) => <span key={i} className="text-xl">★</span>)}
//              </div>
//             <p className="text-2xl font-medium leading-relaxed text-slate-100">
//               &ldquo;Byberr completely transformed how I manage brand deals. The matching is instant, and the analytics are finally accurate.&rdquo;
//             </p>
//             <footer className="flex items-center gap-3 pt-2">
//                 <div className="w-10 h-10 rounded-full bg-teal-800/50 border border-teal-700 flex items-center justify-center text-teal-200 font-bold text-sm">SJ</div>
//                 <div className="text-sm">
//                     <div className="font-semibold text-white">Sarah Jenkins</div>
//                     <div className="text-teal-200/60">Content Creator, 240K Followers</div>
//                 </div>
//             </footer>
//           </blockquote>
//         </div>
//       </div>

//       {/* Right Side - Sign Up Form */}
//       <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-y-auto bg-slate-50 relative">
//         <div className="mx-auto grid w-full max-w-[420px] gap-6 relative z-10">
          
//           {/* Card Container - White & Subtle */}
//           <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200">
             
//             {/* Header */}
//             <div className="flex flex-col space-y-2 text-center mb-8">
//                 <div className="flex justify-start mb-2">
//                     <Link 
//                     href="/auth/login" 
//                     className="text-sm font-medium text-slate-500 hover:text-teal-600 flex items-center gap-2 transition-colors"
//                     >
//                     <ArrowLeft className="h-4 w-4" />
//                     Back to login
//                     </Link>
//                 </div>
//                 <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create Account</h1>
//                 <p className="text-slate-500 text-sm">
//                     Enter your information to join the network.
//                 </p>
//             </div>

//             <div className="grid gap-5">
//                 {/* User Type Selection */}
//                 <div className="grid gap-2">
//                 <Label className="text-slate-700 font-semibold">I am a</Label>
//                 <Select
//                     value={userType}
//                     onValueChange={(value) => setUserType(value as "creator" | "business")}
//                 >
//                     <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all">
//                     <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent className="bg-white border-slate-200">
//                     <SelectItem value="creator">Creator</SelectItem>
//                     <SelectItem value="business">Business</SelectItem>
//                     </SelectContent>
//                 </Select>
//                 </div>

//                 {/* Instagram Button */}
//                 <Button
//                 type="button"
//                 variant="outline"
//                 className="w-full h-12 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-teal-700 hover:border-teal-200 relative font-semibold transition-all"
//                 onClick={handleInstagramSignup}
//                 >
//                 <Instagram className="mr-2 h-4 w-4 text-pink-600" />
//                 Sign up with Instagram
//                 </Button>

//                 <div className="relative my-2">
//                     <div className="absolute inset-0 flex items-center">
//                         <span className="w-full border-t border-slate-200" />
//                     </div>
//                     <div className="relative flex justify-center text-xs uppercase">
//                         <span className="bg-white px-2 text-slate-400 font-medium">
//                         Or continue with email
//                         </span>
//                     </div>
//                 </div>

//                 {/* Email Form */}
//                 <form onSubmit={handleSignUp} className="grid gap-4">
//                 <div className="grid gap-2">
//                     <Label htmlFor="display-name" className="text-slate-700 font-semibold">Display Name</Label>
//                     <Input
//                     id="display-name"
//                     type="text"
//                     placeholder="John Doe"
//                     required
//                     value={displayName}
//                     onChange={(e) => setDisplayName(e.target.value)}
//                     className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder:text-slate-400 transition-all"
//                     />
//                 </div>
                
//                 <div className="grid gap-2">
//                     <Label htmlFor="email" className="text-slate-700 font-semibold">Email</Label>
//                     <Input
//                     id="email"
//                     type="email"
//                     placeholder="m@example.com"
//                     required
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder:text-slate-400 transition-all"
//                     />
//                 </div>

//                 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//                     <div className="grid gap-2">
//                     <Label htmlFor="password" className="text-slate-700 font-semibold">Password</Label>
//                     <Input
//                         id="password"
//                         type="password"
//                         required
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder:text-slate-400 transition-all"
//                     />
//                     </div>
//                     <div className="grid gap-2">
//                     <Label htmlFor="repeat-password" className="text-slate-700 font-semibold">Repeat Password</Label>
//                     <Input
//                         id="repeat-password"
//                         type="password"
//                         required
//                         value={repeatPassword}
//                         onChange={(e) => setRepeatPassword(e.target.value)}
//                         className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder:text-slate-400 transition-all"
//                     />
//                     </div>
//                 </div>

//                 {error && (
//                     <div className="text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl flex items-center gap-2">
//                         <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
//                         {error}
//                     </div>
//                 )}

//                 <Button type="submit" className="w-full h-12 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-lg shadow-teal-600/20 transition-all mt-2" disabled={isLoading}>
//                     {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//                     {isLoading ? "Creating account..." : "Sign up"}
//                 </Button>
//                 </form>
//             </div>
//           </div>
//           <p className="text-center text-xs text-slate-400 mt-4">
//               By clicking continue, you agree to our Terms of Service and Privacy Policy.
//           </p>
//         </div>
//       </div>

//       {/* --- ONBOARDING MODAL --- */}
//       <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
//         <DialogContent className="sm:max-w-[600px] w-[95%] h-[90vh] flex flex-col p-0 gap-0 rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-2xl">
//           <form onSubmit={handleOnboardingSubmit} className="flex flex-col h-full overflow-y-auto">
//             <DialogHeader className="p-6 pb-4 border-b border-slate-100 shrink-0 bg-slate-50/50">
//               <div className="flex items-center gap-3 mb-2">
//                 <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
//                     <CheckCircle2 size={20} />
//                 </div>
//                 <DialogTitle className="text-xl text-slate-900">Complete Your Profile</DialogTitle>
//               </div>
//               <DialogDescription className="text-slate-500 ml-13 pl-12">
//                 Please provide some additional information to complete your {userType} profile.
//               </DialogDescription>
//             </DialogHeader>

//             <div className="flex-1 overflow-y-auto p-6 lg:p-8" style={{ maxHeight: 'calc(90vh - 200px)' }}>
//               <div className="grid gap-8">
                
//                 {/* Email Section */}
//                 <div className="space-y-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="email" className="text-slate-700 font-semibold">Email Address</Label>
//                     <Input
//                         id="email"
//                         type="email"
//                         placeholder="your.email@example.com"
//                         value={onboardingData.email}
//                         onChange={(e) => handleOnboardingChange('email', e.target.value)}
//                         required
//                         className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
//                     />
//                    </div>
//                 </div>

//                 {/* Basic Info */}
//                 <div className="space-y-4">
//                   <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
//                       <div className="w-1 h-4 bg-teal-500 rounded-full" />
//                       Basic Info
//                   </h3>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                     <div className="grid gap-2">
//                       <Label htmlFor="phone" className="text-slate-600 text-xs font-semibold uppercase">Phone</Label>
//                       <Input 
//                         id="phone" 
//                         placeholder="+1 234 567 890"
//                         className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
//                         value={onboardingData.phone}
//                         onChange={(e) => handleOnboardingChange('phone', e.target.value)}
//                       />
//                     </div>
//                     <div className="grid gap-2">
//                       <Label htmlFor="website" className="text-slate-600 text-xs font-semibold uppercase">Website (Optional)</Label>
//                       <Input 
//                         id="website" 
//                         placeholder="https://..."
//                         className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
//                         value={onboardingData.website}
//                         onChange={(e) => handleOnboardingChange('website', e.target.value)}
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Location */}
//                 <div className="space-y-4">
//                     <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
//                         <div className="w-1 h-4 bg-teal-500 rounded-full" />
//                         Location
//                     </h3>
//                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                     <div className="grid gap-2">
//                       <Label htmlFor="city" className="text-slate-600 text-xs font-semibold uppercase">City</Label>
//                       <Input 
//                         id="city" 
//                         placeholder="City"
//                         className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
//                         value={onboardingData.city}
//                         onChange={(e) => handleOnboardingChange('city', e.target.value)}
//                       />
//                     </div>
//                     <div className="grid gap-2">
//                       <Label htmlFor="state" className="text-slate-600 text-xs font-semibold uppercase">State</Label>
//                       <Input 
//                         id="state" 
//                         placeholder="State"
//                         className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
//                         value={onboardingData.state}
//                         onChange={(e) => handleOnboardingChange('state', e.target.value)}
//                       />
//                     </div>
//                     <div className="grid gap-2">
//                       <Label htmlFor="country" className="text-slate-600 text-xs font-semibold uppercase">Country</Label>
//                       <Input 
//                         id="country" 
//                         placeholder="Country"
//                         className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
//                         value={onboardingData.country}
//                         onChange={(e) => handleOnboardingChange('country', e.target.value)}
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Identity */}
//                 <div className="space-y-4">
//                     <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
//                         <div className="w-1 h-4 bg-teal-500 rounded-full" />
//                         {userType === 'creator' ? 'Creator Identity' : 'Business Identity'}
//                     </h3>
                  
//                   {userType === 'creator' ? (
//                     <>
//                       <div className="grid gap-2">
//                         <Label htmlFor="niche" className="text-slate-600 text-xs font-semibold uppercase">Niche</Label>
//                         <Select
//                           value={onboardingData.niche}
//                           onValueChange={(value) => handleOnboardingChange('niche', value)}
//                         >
//                           <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all">
//                             <SelectValue placeholder="Select a niche" />
//                           </SelectTrigger>
//                           <SelectContent className="bg-white border-slate-200">
//                             {CREATOR_NICHES.map((niche) => (
//                               <SelectItem key={niche} value={niche}>{niche}</SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                       </div>
//                       <div className="grid gap-2">
//                         <Label htmlFor="content_style" className="text-slate-600 text-xs font-semibold uppercase">Content Style</Label>
//                         <Input 
//                           id="content_style" 
//                           placeholder="e.g., Cinematic, Vlogs, Minimalist"
//                           className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
//                           value={onboardingData.content_style}
//                           onChange={(e) => handleOnboardingChange('content_style', e.target.value)}
//                         />
//                       </div>
//                       <div className="grid gap-2">
//                         <Label htmlFor="languages" className="text-slate-600 text-xs font-semibold uppercase">Languages</Label>
//                         <Input 
//                           id="languages" 
//                           placeholder="English, Spanish, French"
//                           className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
//                           value={onboardingData.languages}
//                           onChange={(e) => handleOnboardingChange('languages', e.target.value)}
//                         />
//                       </div>
//                     </>
//                   ) : (
//                     <>
//                       <div className="grid gap-2">
//                         <Label htmlFor="business_type" className="text-slate-600 text-xs font-semibold uppercase">Business Type</Label>
//                         <Select
//                           value={onboardingData.business_type}
//                           onValueChange={(value) => handleOnboardingChange('business_type', value)}
//                         >
//                           <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all">
//                             <SelectValue placeholder="Select a business type" />
//                           </SelectTrigger>
//                           <SelectContent className="bg-white border-slate-200">
//                             {BUSINESS_TYPES.map((type) => (
//                               <SelectItem key={type} value={type}>{type}</SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                       </div>
//                       <div className="grid gap-2">
//                         <Label htmlFor="business_description" className="text-slate-600 text-xs font-semibold uppercase">Description</Label>
//                         <Textarea 
//                           id="business_description" 
//                           placeholder="Tell us about your brand..." 
//                           value={onboardingData.business_description}
//                           onChange={(e) => handleOnboardingChange('business_description', e.target.value)}
//                           className="min-h-[100px] rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
//                         />
//                       </div>
//                     </>
//                   )}
//                 </div>
//                 {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
//               </div>
//             </div>

//             <DialogFooter className="p-6 pt-4 border-t border-slate-100 shrink-0 bg-slate-50">
//               <Button 
//                 type="button" 
//                 variant="outline" 
//                 onClick={() => setShowOnboarding(false)}
//                 disabled={isLoading}
//                 className="h-11 rounded-xl border-slate-200 hover:bg-white hover:text-slate-900 transition-all"
//               >
//                 Cancel
//               </Button>
//               <Button 
//                 type="submit" 
//                 disabled={isLoading}
//                 className="h-11 rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 transition-all"
//               >
//                 {isLoading ? (
//                   <>
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                     Creating...
//                   </>
//                 ) : (
//                   "Finish & Create Account"
//                 )}
//               </Button>
//             </DialogFooter>
//           </form>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }


// "use client";

// import { createClient } from "@/lib/supabase/client";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Textarea } from "@/components/ui/textarea";
// import Link from "next/link";
// import { useRouter } from 'next/navigation';
// import { useState, useEffect } from "react";
// import { Instagram, Loader2, ArrowLeft, CheckCircle2, Calendar, MapPin, XCircle } from 'lucide-react';
// import Image from "next/image";

// // Defined list of business types for the dropdown
// const BUSINESS_TYPES = [
//   "Agency (Marketing/PR)", "App / SaaS", "Beauty & Cosmetics", "Clothing & Apparel",
//   "Consumer Electronics", "Education & Course", "Event & Entertainment",
//   "Food & Beverage", "Health & Wellness", "Home & Garden", "Local Business (Storefront)",
//   "Non-Profit", "Travel & Hospitality", "Other"
// ];

// interface OnboardingData {
//   email: string;
//   phone: string;
//   country: string;
//   state: string;
//   city: string;
//   pincode: string;
//   website: string;
//   // Creator Specific
//   date_of_birth: string;
//   // Business Specific
//   business_type: string;
//   business_description: string;
// }

// export default function Page() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [repeatPassword, setRepeatPassword] = useState("");
//   const [displayName, setDisplayName] = useState("");
//   const [userType, setUserType] = useState<"creator" | "business">("creator");
//   const [error, setError] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const router = useRouter();
//   const [metaAppId, setMetaAppId] = useState<string>("");

//   // --- New State for Onboarding Modal ---
//   const [showOnboarding, setShowOnboarding] = useState(false);
//   const [pendingInstaData, setPendingInstaData] = useState<any>(null);
  
//   // Pincode & Validation Logic States
//   const [isValidatingPin, setIsValidatingPin] = useState(false);
//   const [pincodeError, setPincodeError] = useState<string | null>(null);

//   const [onboardingData, setOnboardingData] = useState<OnboardingData>({
//     email: "",
//     phone: "",
//     country: "India", // Default to India
//     state: "",
//     city: "",
//     pincode: "",
//     website: "",
//     date_of_birth: "",
//     business_type: "",
//     business_description: "",
//   });

//   useEffect(() => {
//     fetch('/api/meta/config')
//       .then(res => res.json())
//       .then(data => {
//         setMetaAppId(data.appId);
//       })
//       .catch(err => console.error("[v0] Failed to load Meta config:", err));
//   }, []);

//   const handleOnboardingChange = (field: keyof OnboardingData, value: string) => {
//     setOnboardingData(prev => ({ ...prev, [field]: value }));
//   };

//   // --- Helper: Age Calculation ---
//   const getAge = (dateString: string) => {
//     const today = new Date();
//     const [year, month, day] = dateString.split("-").map(Number);
//     let age = today.getFullYear() - year;
//     const m = (today.getMonth() + 1) - month;
//     if (m < 0 || (m === 0 && today.getDate() < day)) {
//         age--;
//     }
//     return age;
//   };

//   // --- Helper: Pincode Validation ---
//   const validatePincode = async (pin: string) => {
//     const indianPinRegex = /^[1-9][0-9]{5}$/;
    
//     if (!indianPinRegex.test(pin)) {
//         setPincodeError("Pincode must be 6 digits and cannot start with 0.");
//         return;
//     }

//     setIsValidatingPin(true);
//     setPincodeError(null);

//     try {
//         const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
//         const data = await response.json();

//         if (data && data[0].Status === "Success") {
//             const postOffice = data[0].PostOffice[0];
            
//             // Auto-fill State and City
//             setOnboardingData(prev => ({
//                 ...prev,
//                 pincode: pin,
//                 state: postOffice.State,
//                 city: postOffice.District,
//                 country: "India"
//             }));
//             setPincodeError(null);
//         } else {
//             setPincodeError("Invalid Pincode. Please check and try again.");
//             // Reset dependent fields
//             setOnboardingData(prev => ({ ...prev, state: "", city: "" }));
//         }
//     } catch (err) {
//         console.error("Pincode API Error", err);
//         // Don't block completely on API failure, but warn
//     } finally {
//         setIsValidatingPin(false);
//     }
//   };

//   const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const val = e.target.value.replace(/\D/g, ''); 
//     if (val.length > 6) return; 

//     handleOnboardingChange('pincode', val);
    
//     if (val.length < 6) {
//         setPincodeError(null);
//         // Optional: Clear state/city if user clears pincode
//         if (val.length === 0) setOnboardingData(prev => ({ ...prev, state: "", city: "" }));
//     }

//     if (val.length === 6) {
//         validatePincode(val);
//     }
//   };

//   const handleInstagramSignup = () => {
//     if (!metaAppId) {
//       setError("Instagram configuration missing.");
//       return;
//     }

//     const redirectUri = `${window.location.origin}/auth/instagram/callback`;
//     const authUrl = new URL("https://www.facebook.com/v21.0/dialog/oauth");
//     authUrl.searchParams.set("client_id", metaAppId);
//     authUrl.searchParams.set("redirect_uri", redirectUri);
//     authUrl.searchParams.set("scope", "instagram_basic,pages_show_list,instagram_manage_insights,pages_read_engagement,business_management");
//     authUrl.searchParams.set("response_type", "code");
//     authUrl.searchParams.set("state", `instagram-signup-${userType}`);

//     const width = 600;
//     const height = 700;
//     const left = window.screen.width / 2 - width / 2;
//     const top = window.screen.height / 2 - height / 2;

//     const popup = window.open(
//       authUrl.toString(),
//       "Instagram Signup",
//       `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
//     );

//     if (!popup) {
//       setError("Popup blocked. Please allow popups for this site.");
//       return;
//     }

//     const messageHandler = async (event: MessageEvent) => {
//       if (event.origin !== window.location.origin) return;

//       if (event.data.type === "instagram-auth-success") {
//         window.removeEventListener("message", messageHandler);
//         popup?.close();
//         setPendingInstaData(event.data);
//         setShowOnboarding(true);
//       } else if (event.data.type === "instagram-auth-error") {
//         window.removeEventListener("message", messageHandler);
//         popup?.close();
//         setError(event.data.error || "Failed to connect Instagram");
//       }
//     };

//     window.addEventListener("message", messageHandler);

//     const checkPopup = setInterval(() => {
//       if (popup?.closed) {
//         clearInterval(checkPopup);
//         window.removeEventListener("message", messageHandler);
//       }
//     }, 500);
//   };

//   const handleOnboardingSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     await handleFinalizeSignup();
//   };

//   const handleFinalizeSignup = async () => {
//     if (!pendingInstaData) {
//       setError("Missing Instagram data. Please try again.");
//       return;
//     }

//     setIsLoading(true);
//     setError(null);

//     try {
//       // 1. PINCODE Check
//       if (onboardingData.pincode.length !== 6) {
//         throw new Error("Pincode must be exactly 6 digits.");
//       }
//       if (pincodeError) {
//         throw new Error("Please enter a valid Pincode before proceeding.");
//       }
//       if (isValidatingPin) {
//         throw new Error("Validating pincode... please wait.");
//       }

//       // 2. AGE Check (Creators Only)
//       if (userType === 'creator') {
//         if (!onboardingData.date_of_birth) throw new Error("Date of birth is required.");
//         const age = getAge(onboardingData.date_of_birth);
//         if (age < 16) {
//             throw new Error(`You must be at least 16 years old to join. (Current age: ${age})`);
//         }
//       }

//       // 3. Required Fields Check
//       const baseRequired = ['email', 'phone', 'country', 'state', 'city', 'pincode'];
//       const missingFields = baseRequired.filter(field => !onboardingData[field as keyof OnboardingData]);

//       // Only check specific business fields if user is business
//       if (userType === 'business') {
//         if (!onboardingData.business_type) missingFields.push('business_type');
//       }
      
//       if (missingFields.length > 0) {
//         throw new Error(`Please fill in all required fields: ${missingFields.map(f => f.replace(/_/g, ' ')).join(', ')}`);
//       }

//       // 4. Email Regex
//       if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(onboardingData.email)) {
//         throw new Error('Please enter a valid email address');
//       }

//       const payload = {
//         accessToken: pendingInstaData.accessToken,
//         pageAccessToken: pendingInstaData.pageAccessToken,
//         instagramUserId: pendingInstaData.instagramUserId,
//         instagramHandle: pendingInstaData.instagramHandle,
//         facebookPageId: pendingInstaData.facebookPageId,
//         followersCount: pendingInstaData.followersCount,
//         metaUserId: pendingInstaData.metaUserId,
//         metaUserName: pendingInstaData.metaUserName,
//         metaProfilePicture: pendingInstaData.metaProfilePicture,
//         userType,
//         email: onboardingData.email,
//         phone: onboardingData.phone,
//         country: onboardingData.country,
//         state: onboardingData.state,
//         city: onboardingData.city,
//         pincode: onboardingData.pincode, 
//         ...(userType === 'creator' 
//           ? {
//               date_of_birth: onboardingData.date_of_birth,
//               website: '', 
//               // Removed niche, content_style, languages
//             }
//           : {
//               website: onboardingData.website || '',
//               business_type: onboardingData.business_type,
//               business_description: onboardingData.business_description,
//             }
//         )
//       };

//       const response = await fetch("/api/auth/instagram/signup", {
//         method: "POST",
//         headers: { 
//           "Content-Type": "application/json",
//           "Accept": "application/json"
//         },
//         body: JSON.stringify(payload),
//       });

//       const result = await response.json();

//       if (!response.ok) {
//         throw new Error(result.error || "Failed to create account. Please try again.");
//       }

//       router.push("/auth/pending-approval");
//       router.refresh();
//     } catch (err: any) {
//       console.error('Signup error:', err);
//       setError(err.message || "An error occurred while creating your account. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleSignUp = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const supabase = createClient();
//     setIsLoading(true);
//     setError(null);

//     if (password !== repeatPassword) {
//       setError("Passwords do not match");
//       setIsLoading(false);
//       return;
//     }

//     try {
//       const { error } = await supabase.auth.signUp({
//         email,
//         password,
//         options: {
//           emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/meta/connect`,
//           data: {
//             user_type: userType,
//             display_name: displayName,
//           },
//         },
//       });
//       if (error) throw error;
//       router.push("/auth/sign-up-success");
//     } catch (error: unknown) {
//       setError(error instanceof Error ? error.message : "An error occurred");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="w-full h-screen lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px] bg-slate-50 font-sans selection:bg-teal-200 selection:text-teal-900">
      
//       {/* Left Side */}
//       <div className="relative hidden h-full flex-col justify-between overflow-hidden bg-[#012e28] p-10 lg:flex">
//         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
//         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        
//         <Link href="/" className="relative z-20 flex items-center gap-2 hover:opacity-90 transition-opacity">
//           <Image
//             src="/Byberr 1.svg"   
//             alt="Byberr"
//             width={82}
//             height={32}
//             className="w-18 h-8 object-contain"  
//           />
//         </Link>

//         <div className="relative z-20 mt-auto">
//           <blockquote className="space-y-6">
//              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-900/50 border border-teal-800 text-teal-300 text-xs font-medium">
//                 <span className="relative flex h-2 w-2">
//                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
//                   <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
//                 </span>
//                 Join 10,000+ Creators
//              </div>
             
//              <div className="flex gap-1 text-teal-400">
//                 {[1, 2, 3, 4, 5].map((i) => <span key={i} className="text-xl">★</span>)}
//              </div>
//             <p className="text-2xl font-medium leading-relaxed text-slate-100">
//               &ldquo;Byberr completely transformed how I manage brand deals. The matching is instant, and the analytics are finally accurate.&rdquo;
//             </p>
//             <footer className="flex items-center gap-3 pt-2">
//                 <div className="w-10 h-10 rounded-full bg-teal-800/50 border border-teal-700 flex items-center justify-center text-teal-200 font-bold text-sm">SJ</div>
//                 <div className="text-sm">
//                     <div className="font-semibold text-white">Sarah Jenkins</div>
//                     <div className="text-teal-200/60">Content Creator, 240K Followers</div>
//                 </div>
//             </footer>
//           </blockquote>
//         </div>
//       </div>

//       {/* Right Side - Sign Up Form */}
//       <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-y-auto bg-slate-50 relative">
//         <div className="mx-auto grid w-full max-w-[420px] gap-6 relative z-10">
          
//           <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200">
//             <div className="flex flex-col space-y-2 text-center mb-8">
//                 <div className="flex justify-start mb-2">
//                     <Link 
//                     href="/auth/login" 
//                     className="text-sm font-medium text-slate-500 hover:text-teal-600 flex items-center gap-2 transition-colors"
//                     >
//                     <ArrowLeft className="h-4 w-4" />
//                     Back to login
//                     </Link>
//                 </div>
//                 <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create Account</h1>
//                 <p className="text-slate-500 text-sm">
//                     Enter your information to join the network.
//                 </p>
//             </div>

//             <div className="grid gap-5">
//                 <div className="grid gap-2">
//                 <Label className="text-slate-700 font-semibold">I am a</Label>
//                 <Select
//                     value={userType}
//                     onValueChange={(value) => setUserType(value as "creator" | "business")}
//                 >
//                     <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all">
//                     <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent className="bg-white border-slate-200">
//                     <SelectItem value="creator">Creator</SelectItem>
//                     <SelectItem value="business">Business</SelectItem>
//                     </SelectContent>
//                 </Select>
//                 </div>

//                 <Button
//                 type="button"
//                 variant="outline"
//                 className="w-full h-12 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-teal-700 hover:border-teal-200 relative font-semibold transition-all"
//                 onClick={handleInstagramSignup}
//                 >
//                 <Instagram className="mr-2 h-4 w-4 text-pink-600" />
//                 Sign up with Instagram
//                 </Button>

//                 <div className="relative my-2">
//                     <div className="absolute inset-0 flex items-center">
//                         <span className="w-full border-t border-slate-200" />
//                     </div>
//                     <div className="relative flex justify-center text-xs uppercase">
//                         <span className="bg-white px-2 text-slate-400 font-medium">
//                         Or continue with email
//                         </span>
//                     </div>
//                 </div>

//                 <form onSubmit={handleSignUp} className="grid gap-4">
//                 <div className="grid gap-2">
//                     <Label htmlFor="display-name" className="text-slate-700 font-semibold">Display Name</Label>
//                     <Input
//                     id="display-name"
//                     type="text"
//                     placeholder="John Doe"
//                     required
//                     value={displayName}
//                     onChange={(e) => setDisplayName(e.target.value)}
//                     className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder:text-slate-400 transition-all"
//                     />
//                 </div>
                
//                 <div className="grid gap-2">
//                     <Label htmlFor="email" className="text-slate-700 font-semibold">Email</Label>
//                     <Input
//                     id="email"
//                     type="email"
//                     placeholder="m@example.com"
//                     required
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder:text-slate-400 transition-all"
//                     />
//                 </div>

//                 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//                     <div className="grid gap-2">
//                     <Label htmlFor="password" className="text-slate-700 font-semibold">Password</Label>
//                     <Input
//                         id="password"
//                         type="password"
//                         required
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder:text-slate-400 transition-all"
//                     />
//                     </div>
//                     <div className="grid gap-2">
//                     <Label htmlFor="repeat-password" className="text-slate-700 font-semibold">Repeat Password</Label>
//                     <Input
//                         id="repeat-password"
//                         type="password"
//                         required
//                         value={repeatPassword}
//                         onChange={(e) => setRepeatPassword(e.target.value)}
//                         className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder:text-slate-400 transition-all"
//                     />
//                     </div>
//                 </div>

//                 {error && (
//                     <div className="text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl flex items-center gap-2">
//                         <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
//                         {error}
//                     </div>
//                 )}

//                 <Button type="submit" className="w-full h-12 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-lg shadow-teal-600/20 transition-all mt-2" disabled={isLoading}>
//                     {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//                     {isLoading ? "Creating account..." : "Sign up"}
//                 </Button>
//                 </form>
//             </div>
//           </div>
//           <p className="text-center text-xs text-slate-400 mt-4">
//               By clicking continue, you agree to our Terms of Service and Privacy Policy.
//           </p>
//         </div>
//       </div>

//       {/* --- ONBOARDING MODAL --- */}
//       <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
//         <DialogContent className="sm:max-w-[600px] w-[95%] h-[90vh] flex flex-col p-0 gap-0 rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-2xl">
//           <form onSubmit={handleOnboardingSubmit} className="flex flex-col h-full overflow-y-auto">
//             <DialogHeader className="p-6 pb-4 border-b border-slate-100 shrink-0 bg-slate-50/50">
//               <div className="flex items-center gap-3 mb-2">
//                 <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
//                     <CheckCircle2 size={20} />
//                 </div>
//                 <DialogTitle className="text-xl text-slate-900">Complete Your Profile</DialogTitle>
//               </div>
//               <DialogDescription className="text-slate-500 ml-13 pl-12">
//                 Please provide some additional information to complete your {userType} profile.
//               </DialogDescription>
//             </DialogHeader>

//             <div className="flex-1 overflow-y-auto p-6 lg:p-8" style={{ maxHeight: 'calc(90vh - 200px)' }}>
//               <div className="grid gap-8">
                
//                 {/* Email Section */}
//                 <div className="space-y-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="email" className="text-slate-700 font-semibold">Email Address</Label>
//                     <Input
//                         id="email"
//                         type="email"
//                         placeholder="your.email@example.com"
//                         value={onboardingData.email}
//                         onChange={(e) => handleOnboardingChange('email', e.target.value)}
//                         required
//                         className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
//                     />
//                    </div>
//                 </div>

//                 {/* Basic Info */}
//                 <div className="space-y-4">
//                   <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
//                       <div className="w-1 h-4 bg-teal-500 rounded-full" />
//                       Basic Info
//                   </h3>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                     <div className="grid gap-2">
//                       <Label htmlFor="phone" className="text-slate-600 text-xs font-semibold uppercase">Phone</Label>
//                       <Input 
//                         id="phone" 
//                         placeholder="+1 234 567 890"
//                         className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
//                         value={onboardingData.phone}
//                         onChange={(e) => handleOnboardingChange('phone', e.target.value)}
//                       />
//                     </div>
                    
//                     {/* Website - Only for Business */}
//                     {userType === 'business' && (
//                         <div className="grid gap-2">
//                             <Label htmlFor="website" className="text-slate-600 text-xs font-semibold uppercase">Website</Label>
//                             <Input 
//                                 id="website" 
//                                 placeholder="https://..."
//                                 className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
//                                 value={onboardingData.website}
//                                 onChange={(e) => handleOnboardingChange('website', e.target.value)}
//                             />
//                         </div>
//                     )}

//                     {/* Date of Birth - Only for Creator */}
//                     {userType === 'creator' && (
//                         <div className="grid gap-2">
//                             <Label htmlFor="dob" className="text-slate-600 text-xs font-semibold uppercase flex items-center gap-1">
//                                 Date of Birth <span className="text-red-500">*</span>
//                             </Label>
//                             <div className="relative">
//                                 <Input 
//                                     id="dob" 
//                                     type="date"
//                                     required
//                                     className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all block w-full"
//                                     value={onboardingData.date_of_birth}
//                                     onChange={(e) => handleOnboardingChange('date_of_birth', e.target.value)}
//                                 />
//                                 <p className="text-[10px] text-slate-400 pt-1">Must be at least 16 years old.</p>
//                             </div>
//                         </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Location */}
//                 <div className="space-y-4">
//                     <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
//                         <div className="w-1 h-4 bg-teal-500 rounded-full" />
//                         Location
//                     </h3>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                     <div className="grid gap-2">
//                       <Label htmlFor="country" className="text-slate-600 text-xs font-semibold uppercase">Country</Label>
//                       <Input 
//                         id="country" 
//                         value="India"
//                         disabled // Disabled because logic is tied to India
//                         className="h-12 rounded-xl bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed"
//                       />
//                     </div>

//                     {/* Pincode - Required & Validation */}
//                     <div className="grid gap-2 relative">
//                       <Label htmlFor="pincode" className="text-slate-600 text-xs font-semibold uppercase flex items-center gap-1">
//                         Pincode (India) <span className="text-red-500">*</span>
//                       </Label>
//                       <div className="relative">
//                           <Input 
//                             id="pincode" 
//                             placeholder="Enter 6-digit Pincode"
//                             maxLength={6}
//                             className={`h-12 rounded-xl border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all pr-10 ${pincodeError ? "border-red-300 focus:border-red-500 focus:ring-red-200" : ""}`}
//                             value={onboardingData.pincode}
//                             onChange={handlePincodeChange}
//                           />
//                           <div className="absolute right-3 top-3.5">
//                               {isValidatingPin ? (
//                                   <Loader2 className="h-5 w-5 animate-spin text-teal-500" />
//                               ) : !pincodeError && onboardingData.pincode.length === 6 ? (
//                                   <CheckCircle2 className="h-5 w-5 text-green-500" />
//                               ) : pincodeError ? (
//                                   <XCircle className="h-5 w-5 text-red-500" />
//                               ) : (
//                                   <MapPin className="h-5 w-5 text-slate-400" />
//                               )}
//                           </div>
//                       </div>
//                       {pincodeError && (
//                           <span className="text-xs text-red-500 mt-1 font-medium">{pincodeError}</span>
//                       )}
//                     </div>

//                     <div className="grid gap-2">
//                       <Label htmlFor="state" className="text-slate-600 text-xs font-semibold uppercase">State</Label>
//                       <Input 
//                         id="state" 
//                         placeholder="Auto-filled"
//                         className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
//                         value={onboardingData.state}
//                         readOnly // Read-only because it comes from API
//                         onChange={() => {}} 
//                       />
//                     </div>
//                     <div className="grid gap-2">
//                       <Label htmlFor="city" className="text-slate-600 text-xs font-semibold uppercase">City / District</Label>
//                       <Input 
//                         id="city" 
//                         placeholder="Auto-filled"
//                         className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
//                         value={onboardingData.city}
//                         readOnly // Read-only because it comes from API
//                         onChange={() => {}}
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Identity - Only show for Business */}
//                 {userType === 'business' && (
//                   <div className="space-y-4">
//                       <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
//                           <div className="w-1 h-4 bg-teal-500 rounded-full" />
//                           Business Identity
//                       </h3>
//                       <div className="grid gap-2">
//                         <Label htmlFor="business_type" className="text-slate-600 text-xs font-semibold uppercase">Business Type</Label>
//                         <Select
//                           value={onboardingData.business_type}
//                           onValueChange={(value) => handleOnboardingChange('business_type', value)}
//                         >
//                           <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all">
//                             <SelectValue placeholder="Select a business type" />
//                           </SelectTrigger>
//                           <SelectContent className="bg-white border-slate-200">
//                             {BUSINESS_TYPES.map((type) => (
//                               <SelectItem key={type} value={type}>{type}</SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                       </div>
//                       <div className="grid gap-2">
//                         <Label htmlFor="business_description" className="text-slate-600 text-xs font-semibold uppercase">Description</Label>
//                         <Textarea 
//                           id="business_description" 
//                           placeholder="Tell us about your brand..." 
//                           value={onboardingData.business_description}
//                           onChange={(e) => handleOnboardingChange('business_description', e.target.value)}
//                           className="min-h-[100px] rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
//                         />
//                       </div>
//                   </div>
//                 )}

//                 {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
//               </div>
//             </div>

//             <DialogFooter className="p-6 pt-4 border-t border-slate-100 shrink-0 bg-slate-50">
//               <Button 
//                 type="button" 
//                 variant="outline" 
//                 onClick={() => setShowOnboarding(false)}
//                 disabled={isLoading}
//                 className="h-11 rounded-xl border-slate-200 hover:bg-white hover:text-slate-900 transition-all"
//               >
//                 Cancel
//               </Button>
//               <Button 
//                 type="submit" 
//                 disabled={isLoading || !!pincodeError}
//                 className="h-11 rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 transition-all"
//               >
//                 {isLoading ? (
//                   <>
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                     Creating...
//                   </>
//                 ) : (
//                   "Finish & Create Account"
//                 )}
//               </Button>
//             </DialogFooter>
//           </form>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

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
// Added Info, ExternalLink, and Check icons for the new requirements
import { Instagram, Loader2, ArrowLeft, CheckCircle2, Calendar, MapPin, XCircle, Info, ExternalLink, Check } from 'lucide-react';
import Image from "next/image";

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
  pincode: string;
  website: string;
  // Creator Specific
  date_of_birth: string;
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
  // NEW: State for the Meta Requirement Disclaimer Popup
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
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load configuration');
        }
        
        if (!data.isConfigured) {
          console.error('Instagram is not properly configured');
          setError("Instagram integration is not properly configured. Please contact support.");
          return;
        }
        
        console.log('Successfully loaded config:', { 
          metaAppId: data.metaAppId ? '***' + data.metaAppId.slice(-4) : 'Not set',
          isConfigured: data.isConfigured 
        });
        
        setMetaAppId(data.metaAppId);
      } catch (err) {
        console.error('Failed to load configuration:', err);
        setError("Failed to load application configuration. Please try again later.");
      }
    };

    const checkInstagramAuthData = () => {
      try {
        const authDataStr = sessionStorage.getItem('instagramAuthData');
        if (authDataStr) {
          const authData = JSON.parse(authDataStr);
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
            
            // Auto-fill State and City
            setOnboardingData(prev => ({
                ...prev,
                pincode: pin,
                state: postOffice.State,
                city: postOffice.District,
                country: "India"
            }));
            setPincodeError(null);
        } else {
            setPincodeError("Invalid Pincode. Please check and try again.");
            // Reset dependent fields
            setOnboardingData(prev => ({ ...prev, state: "", city: "" }));
        }
    } catch (err) {
        console.error("Pincode API Error", err);
        // Don't block completely on API failure, but warn
    } finally {
        setIsValidatingPin(false);
    }
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ''); 
    if (val.length > 6) return; 

    handleOnboardingChange('pincode', val);
    
    if (val.length < 6) {
        setPincodeError(null);
        // Optional: Clear state/city if user clears pincode
        if (val.length === 0) setOnboardingData(prev => ({ ...prev, state: "", city: "" }));
    }

    if (val.length === 6) {
        validatePincode(val);
    }
  };

  // NEW: Separated the OAuth logic so it can be triggered after the disclaimer
  const triggerInstagramOAuth = () => {
    setShowMetaRequirements(false);
    if (!metaAppId) {
      console.error('Meta App ID is not set. Current environment:', {
        metaAppId,
        env: process.env.NODE_ENV,
        publicMetaAppId: process.env.NEXT_PUBLIC_META_APP_ID,
        metaAppIdFromEnv: process.env.META_APP_ID
      });
      setError("Instagram configuration is not properly set up. Please contact support.");
      return;
    }

    const configId = "1238315747827593";
    
    // Dynamic redirect URI based on current origin
    const redirectUri = `${window.location.origin}/auth/instagram/callback`;
    
    // Direct redirect to Instagram OAuth
    const authUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${metaAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&config_id=${configId}&response_type=code&state=instagram-signup-${userType}`;
    
    window.location.href = authUrl;
  };

  const handleInstagramSignup = () => {
    // UPDATED: Only show disclaimer if user is a Creator
    if (userType === "creator") {
        setShowMetaRequirements(true);
    } else {
        triggerInstagramOAuth();
    }
  };

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleFinalizeSignup();
  };

  const handleFinalizeSignup = async () => {
    if (!pendingInstaData) {
      setError("Missing Instagram data. Please try again.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. PINCODE Check
      if (onboardingData.pincode.length !== 6) {
        throw new Error("Pincode must be exactly 6 digits.");
      }
      if (pincodeError) {
        throw new Error("Please enter a valid Pincode before proceeding.");
      }
      if (isValidatingPin) {
        throw new Error("Validating pincode... please wait.");
      }

      // 2. AGE Check (Creators Only)
      if (userType === 'creator') {
        if (!onboardingData.date_of_birth) throw new Error("Date of birth is required.");
        const age = getAge(onboardingData.date_of_birth);
        if (age < 16) {
            throw new Error(`You must be at least 16 years old to join. (Current age: ${age})`);
        }
      }

      // 3. Required Fields Check
      const baseRequired = ['email', 'phone', 'country', 'state', 'city', 'pincode'];
      const missingFields = baseRequired.filter(field => !onboardingData[field as keyof OnboardingData]);

      // Only check specific business fields if user is business
      if (userType === 'business') {
        if (!onboardingData.business_type) missingFields.push('business_type');
      }
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.map(f => f.replace(/_/g, ' ')).join(', ')}`);
      }

      // 4. Email Regex
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(onboardingData.email)) {
        throw new Error('Please enter a valid email address');
      }

      const payload = {
        accessToken: pendingInstaData.accessToken,
        pageAccessToken: pendingInstaData.pageAccessToken,
        instagramUserId: pendingInstaData.instagramUserId,
        instagramHandle: pendingInstaData.instagramHandle,
        facebookPageId: pendingInstaData.facebookPageId,
        followersCount: pendingInstaData.followersCount,
        metaUserId: pendingInstaData.metaUserId,
        metaUserName: pendingInstaData.metaUserName,
        metaProfilePicture: pendingInstaData.metaProfilePicture,
        userType,
        email: onboardingData.email,
        phone: onboardingData.phone,
        country: onboardingData.country,
        state: onboardingData.state,
        city: onboardingData.city,
        pincode: onboardingData.pincode, 
        ...(userType === 'creator' 
          ? {
              date_of_birth: onboardingData.date_of_birth,
              website: '', 
            }
          : {
              website: onboardingData.website || '',
              business_type: onboardingData.business_type,
              business_description: onboardingData.business_description,
            }
        )
      };

      const response = await fetch("/api/auth/instagram/signup", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create account. Please try again.");
      }

      router.push("/auth/pending-approval");
      router.refresh();
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || "An error occurred while creating your account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/meta/connect`,
          data: {
            user_type: userType,
            display_name: displayName,
          },
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px] bg-slate-50 font-sans selection:bg-teal-200 selection:text-teal-900">
      
      {/* Left Side (Identical to Original) */}
      <div className="relative hidden h-full flex-col justify-between overflow-hidden bg-[#012e28] p-10 lg:flex">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        
        <Link href="/" className="relative z-20 flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Image
            src="/Byberr 1.svg"   
            alt="Byberr"
            width={82}
            height={32}
            className="w-18 h-8 object-contain"  
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

        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-6">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-900/50 border border-teal-800 text-teal-300 text-xs font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
                Join 10,000+ Creators
             </div>
             
             <div className="flex gap-1 text-teal-400">
                {[1, 2, 3, 4, 5].map((i) => <span key={i} className="text-xl">★</span>)}
             </div>
            <p className="text-2xl font-medium leading-relaxed text-slate-100">
              &ldquo;Byberr completely transformed how I manage brand deals. The matching is instant, and the analytics are finally accurate.&rdquo;
            </p>
            <footer className="flex items-center gap-3 pt-2">
                <div className="w-10 h-10 rounded-full bg-teal-800/50 border border-teal-700 flex items-center justify-center text-teal-200 font-bold text-sm">SJ</div>
                <div className="text-sm">
                    <div className="font-semibold text-white">Sarah Jenkins</div>
                    <div className="text-teal-200/60">Content Creator, 240K Followers</div>
                </div>
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-y-auto bg-slate-50 relative">
        <div className="mx-auto grid w-full max-w-[420px] gap-6 relative z-10">
          
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200">
            <div className="flex flex-col space-y-2 text-center mb-8">
                <div className="flex justify-start mb-2">
                    <Link 
                    href="/auth/login" 
                    className="text-sm font-medium text-slate-500 hover:text-teal-600 flex items-center gap-2 transition-colors"
                    >
                    <ArrowLeft className="h-4 w-4" />
                    Back to login
                    </Link>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create Account</h1>
                <p className="text-slate-500 text-sm">
                    Enter your information to join the network.
                </p>
            </div>

            <div className="grid gap-5">
                <div className="grid gap-2">
                <Label className="text-slate-700 font-semibold">I am a</Label>
                <Select
                    value={userType}
                    onValueChange={(value) => setUserType(value as "creator" | "business")}
                >
                    <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all">
                    <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                    <SelectItem value="creator">Creator</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                </Select>
                </div>

                {/* --- FIXED INSTAGRAM BUTTON WITH HOVER VISIBILITY --- */}
                <Button
                type="button"
                variant="outline"
                className="w-full h-12 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 relative font-bold transition-all group"
                onClick={handleInstagramSignup}
                >
                <Instagram className="mr-2 h-4 w-4 text-pink-600 group-hover:text-pink-600 transition-colors" />
                Sign up with Instagram
                </Button>

                <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-slate-400 font-medium">
                        Or continue with email
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSignUp} className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="display-name" className="text-slate-700 font-semibold">Display Name</Label>
                    <Input
                    id="display-name"
                    type="text"
                    placeholder="John Doe"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder:text-slate-400 transition-all"
                    />
                </div>
                
                <div className="grid gap-2">
                    <Label htmlFor="email" className="text-slate-700 font-semibold">Email</Label>
                    <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder:text-slate-400 transition-all"
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                    <Label htmlFor="password" className="text-slate-700 font-semibold">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder:text-slate-400 transition-all"
                    />
                    </div>
                    <div className="grid gap-2">
                    <Label htmlFor="repeat-password" className="text-slate-700 font-semibold">Repeat Password</Label>
                    <Input
                        id="repeat-password"
                        type="password"
                        required
                        value={repeatPassword}
                        onChange={(e) => setRepeatPassword(e.target.value)}
                        className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder:text-slate-400 transition-all"
                    />
                    </div>
                </div>

                {error && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        {error}
                    </div>
                )}

                {/* SIGN UP BUTTON COLOR MAINTAINED AS #009688 */}
                <Button type="submit" className="w-full h-12 rounded-xl bg-[#0B3D2E] hover:bg-[#006A4E] text-white font-bold shadow-lg shadow-[#0B3D2E]/20 transition-all mt-2" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? "Creating account..." : "Sign up"}
                </Button>
                </form>
            </div>
          </div>
          <p className="text-center text-xs text-slate-400 mt-4">
              By clicking continue, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>

      {/* --- NEW: META REQUIREMENTS POPUP (Triggered on click for creators) --- */}
      <Dialog open={showMetaRequirements} onOpenChange={setShowMetaRequirements}>
        <DialogContent className="sm:max-w-[440px] rounded-[32px] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <DialogHeader className="bg-[#012e28] p-8 text-center relative">
            <div className="bg-teal-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-teal-500/30">
              <Instagram className="text-white h-8 w-8" />
            </div>
            <DialogTitle className="text-2xl font-bold text-white mb-2">Before you connect</DialogTitle>
            <DialogDescription className="text-teal-100/70 text-sm px-4">Ensure your Instagram is ready to avoid connection errors.</DialogDescription>
          </DialogHeader>
          
          <div className="p-8 space-y-5">
            <div className="bg-[#f0fdfa] border border-[#ccfbf1] rounded-2xl p-5 space-y-4">
              <div className="flex gap-4">
                <div className="bg-[#ccfbf1] p-2 rounded-full h-fit flex items-center justify-center">
                  <Info className="h-5 w-5 text-[#0d9488]" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-base font-bold text-slate-900">Checklist</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                      <Check className="h-3 w-3 text-[#0d9488]" /> Instagram Professional Account
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                      <Check className="h-3 w-3 text-[#0d9488]" /> Linked to a Facebook Page
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 grid gap-3">
              <Button onClick={triggerInstagramOAuth} className="w-full h-12 bg-[#0B3D2E] hover:bg-[#006A4E] text-white rounded-xl font-bold text-sm shadow-md transition-all">
                I'm Ready, Continue
              </Button>
              <a 
                href="https://help.instagram.com/502981923235522" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-center text-[#0d9488] hover:underline flex items-center justify-center gap-2 font-bold"
              >
                How to connect to Facebook? <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- ONBOARDING MODAL (Identical to Original) --- */}
      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="sm:max-w-[600px] w-[95%] h-[90vh] flex flex-col p-0 gap-0 rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-2xl">
          <form onSubmit={handleOnboardingSubmit} className="flex flex-col h-full overflow-y-auto">
            <DialogHeader className="p-6 pb-4 border-b border-slate-100 shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                    <CheckCircle2 size={20} />
                </div>
                <DialogTitle className="text-xl text-slate-900">Complete Your Profile</DialogTitle>
              </div>
              <DialogDescription className="text-slate-500 ml-13 pl-12">
                Please provide some additional information to complete your {userType} profile.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-6 lg:p-8" style={{ maxHeight: 'calc(90vh - 200px)' }}>
              <div className="grid gap-8">
                
                {/* Email Section */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 font-semibold">Email Address</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={onboardingData.email}
                        onChange={(e) => handleOnboardingChange('email', e.target.value)}
                        required
                        className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    />
                   </div>
                </div>

                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                      <div className="w-1 h-4 bg-teal-500 rounded-full" />
                      Basic Info
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="phone" className="text-slate-600 text-xs font-semibold uppercase">Phone</Label>
                      <Input 
                        id="phone" 
                        placeholder="+1 234 567 890"
                        className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                        value={onboardingData.phone}
                        onChange={(e) => handleOnboardingChange('phone', e.target.value)}
                      />
                    </div>
                    
                    {/* Website - Only for Business */}
                    {userType === 'business' && (
                        <div className="grid gap-2">
                            <Label htmlFor="website" className="text-slate-600 text-xs font-semibold uppercase">Website</Label>
                            <Input 
                                id="website" 
                                placeholder="https://..."
                                className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                value={onboardingData.website}
                                onChange={(e) => handleOnboardingChange('website', e.target.value)}
                            />
                        </div>
                    )}

                    {/* Date of Birth - Only for Creator */}
                    {userType === 'creator' && (
                        <div className="grid gap-2">
                            <Label htmlFor="dob" className="text-slate-600 text-xs font-semibold uppercase flex items-center gap-1">
                                Date of Birth <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Input 
                                    id="dob" 
                                    type="date"
                                    required
                                    className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all block w-full"
                                    value={onboardingData.date_of_birth}
                                    onChange={(e) => handleOnboardingChange('date_of_birth', e.target.value)}
                                />
                                <p className="text-[10px] text-slate-400 pt-1">Must be at least 16 years old.</p>
                            </div>
                        </div>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                        <div className="w-1 h-4 bg-teal-500 rounded-full" />
                        Location
                    </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="country" className="text-slate-600 text-xs font-semibold uppercase">Country</Label>
                      <Input 
                        id="country" 
                        value="India"
                        disabled // Disabled because logic is tied to India
                        className="h-12 rounded-xl bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed"
                      />
                    </div>

                    {/* Pincode - Required & Validation */}
                    <div className="grid gap-2 relative">
                      <Label htmlFor="pincode" className="text-slate-600 text-xs font-semibold uppercase flex items-center gap-1">
                        Pincode (India) <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                          <Input 
                            id="pincode" 
                            placeholder="Enter 6-digit Pincode"
                            maxLength={6}
                            className={`h-12 rounded-xl border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all pr-10 ${pincodeError ? "border-red-300 focus:border-red-500 focus:ring-red-200" : ""}`}
                            value={onboardingData.pincode}
                            onChange={handlePincodeChange}
                          />
                          <div className="absolute right-3 top-3.5">
                              {isValidatingPin ? (
                                  <Loader2 className="h-5 w-5 animate-spin text-teal-500" />
                              ) : !pincodeError && onboardingData.pincode.length === 6 ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                              ) : pincodeError ? (
                                  <XCircle className="h-5 w-5 text-red-500" />
                              ) : (
                                  <MapPin className="h-5 w-5 text-slate-400" />
                              )}
                          </div>
                      </div>
                      {pincodeError && (
                          <span className="text-xs text-red-500 mt-1 font-medium">{pincodeError}</span>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="state" className="text-slate-600 text-xs font-semibold uppercase">State</Label>
                      <Input 
                        id="state" 
                        placeholder="Auto-filled"
                        className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                        value={onboardingData.state}
                        readOnly // Read-only because it comes from API
                        onChange={() => {}} 
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="city" className="text-slate-600 text-xs font-semibold uppercase">City / District</Label>
                      <Input 
                        id="city" 
                        placeholder="Auto-filled"
                        className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                        value={onboardingData.city}
                        readOnly // Read-only because it comes from API
                        onChange={() => {}}
                      />
                    </div>
                  </div>
                </div>

                {/* Identity - Only show for Business */}
                {userType === 'business' && (
                  <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                          <div className="w-1 h-4 bg-teal-500 rounded-full" />
                          Business Identity
                      </h3>
                      <div className="grid gap-2">
                        <Label htmlFor="business_type" className="text-slate-600 text-xs font-semibold uppercase">Business Type</Label>
                        <Select
                          value={onboardingData.business_type}
                          onValueChange={(value) => handleOnboardingChange('business_type', value)}
                        >
                          <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all">
                            <SelectValue placeholder="Select a business type" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-slate-200">
                            {BUSINESS_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="business_description" className="text-slate-600 text-xs font-semibold uppercase">Description</Label>
                        <Textarea 
                          id="business_description" 
                          placeholder="Tell us about your brand..." 
                          value={onboardingData.business_description}
                          onChange={(e) => handleOnboardingChange('business_description', e.target.value)}
                          className="min-h-[100px] rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                        />
                      </div>
                  </div>
                )}

                {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
              </div>
            </div>

            <DialogFooter className="p-6 pt-4 border-t border-slate-100 shrink-0 bg-slate-50">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowOnboarding(false)}
                disabled={isLoading}
                className="h-11 rounded-xl border-slate-200 hover:bg-white hover:text-slate-900 transition-all"
              >
                Cancel
              </Button>
              {/* MAINTAINED #009688 FOR FINISH BUTTON AS WELL */}
              <Button 
                type="submit" 
                disabled={isLoading || !!pincodeError}
                className="h-11 rounded-xl bg-[#0B3D2E] hover:bg-[#006A4E] text-white shadow-md transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Finish & Create Account"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}