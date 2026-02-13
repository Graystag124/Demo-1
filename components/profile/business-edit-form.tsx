// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from 'next/navigation';
// import { createClient } from "@/lib/supabase/client";
// import { Country, State, City } from "country-state-city"; // Import Library

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { 
//   Building2, Phone, Globe, MapPin, Loader2, ArrowLeft, Trash2, AlertTriangle 
// } from "lucide-react";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";

// const BUSINESS_TYPES = [
//   "Agency (Marketing/PR)", "App / SaaS", "Beauty & Cosmetics", "Clothing & Apparel",
//   "Consumer Electronics", "Education & Course", "Event & Entertainment",
//   "Food & Beverage", "Health & Wellness", "Home & Garden", "Local Business (Storefront)",
//   "Non-Profit", "Travel & Hospitality", "Other"
// ];

// interface User {
//   id: string;
//   display_name: string;
//   bio: string | null;
//   profile_image_url: string | null;
//   email?: string;
//   phone?: string;
//   website?: string;
//   city?: string;
//   state?: string;
//   country?: string;
//   pincode?: string; // Added pincode
//   business_type?: string;
//   business_description?: string; 
// }

// export function BusinessEditForm({ user }: { user: User }) {
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(false);
//   const [isDeleteLoading, setIsDeleteLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [successMessage, setSuccessMessage] = useState<string | null>(null);

//   // --- Form Fields ---
//   const [displayName, setDisplayName] = useState(user.display_name || "");
//   const [description, setDescription] = useState(user.business_description || user.bio || ""); 
//   const [businessType, setBusinessType] = useState(user.business_type || "");
//   const [phone, setPhone] = useState(user.phone || "");
//   const [website, setWebsite] = useState(user.website || "");
//   const [pincode, setPincode] = useState(user.pincode || ""); // Added pincode state

//   // --- Location Logic States ---
//   const [country, setCountry] = useState(user.country || "");
//   const [state, setState] = useState(user.state || "");
//   const [city, setCity] = useState(user.city || "");

//   // Helpers for library logic (store ISO codes internally)
//   const [selectedCountryCode, setSelectedCountryCode] = useState("");
//   const [selectedStateCode, setSelectedStateCode] = useState("");

//   const countries = Country.getAllCountries();
//   const states = selectedCountryCode ? State.getStatesOfCountry(selectedCountryCode) : [];
//   const cities = selectedStateCode ? City.getCitiesOfState(selectedCountryCode, selectedStateCode) : [];

//   // --- Effect: Initialize Location Codes on Load ---
//   useEffect(() => {
//     if (user.country) {
//       const foundCountry = countries.find(c => c.name === user.country);
//       if (foundCountry) {
//         setSelectedCountryCode(foundCountry.isoCode);
        
//         if (user.state) {
//           const countryStates = State.getStatesOfCountry(foundCountry.isoCode);
//           const foundState = countryStates.find(s => s.name === user.state);
//           if (foundState) {
//             setSelectedStateCode(foundState.isoCode);
//           }
//         }
//       }
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []); // Run once on mount

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setIsLoading(true);
//     setError(null);
//     setSuccessMessage(null);

//     try {
//       const supabase = createClient();
      
//       const updates = {
//         display_name: displayName,
//         business_description: description || null,
//         bio: description || null,
//         business_type: businessType,
//         phone,
//         website,
//         country,
//         state,
//         city,
//         pincode: pincode || null, // Added to payload
//         updated_at: new Date().toISOString(),
//       };

//       const { error: updateError } = await supabase
//         .from("users")
//         .update(updates)
//         .eq("id", user.id);

//       if (updateError) {
//         throw new Error(updateError.message);
//       }

//       setSuccessMessage("Business profile updated successfully.");
//       router.refresh();
//       router.push("/business-dashboard/profile");
      
//     } catch (err: any) {
//       setError(err.message || "Failed to update profile");
//     } finally {
//       setIsLoading(false);
//     }
//   }

//   // Handle Delete Request
//   async function handleDeleteRequest() {
//     setIsDeleteLoading(true);
//     setError(null);
//     setSuccessMessage(null);

//     const supabase = createClient();
    
//     const { error: deleteError } = await supabase
//       .from("deletion_requests")
//       .insert({
//         user_id: user.id,
//         reason: "Business user requested via profile settings",
//         status: "pending"
//       });

//     if (deleteError) {
//       console.error("Supabase Error:", deleteError.message);
//       setError("Failed to send deletion request. Please try again or contact support.");
//     } else {
//       setSuccessMessage("Your account deletion request has been sent to the admin.");
//     }
    
//     setIsDeleteLoading(false);
//   }

//   return (
//     <Card className="w-full max-w-4xl mx-auto border-border bg-card shadow-sm">
//       <CardHeader className="border-b border-border pb-6">
//         <div className="flex items-start gap-4">
//             {/* Back Button */}
//             <Button 
//                 variant="outline" 
//                 size="icon" 
//                 onClick={() => router.push('/business-dashboard/profile')}
//             >
//                 <ArrowLeft className="h-4 w-4" />
//             </Button>

//             <div className="flex-1 flex items-center justify-between">
//                 <div>
//                     <CardTitle className="text-xl">Business Profile Settings</CardTitle>
//                     <CardDescription>Manage your company details, branding, and contact info.</CardDescription>
//                 </div>
//                 <div className="hidden sm:block bg-blue-500/10 text-blue-500 px-3 py-1 rounded-md text-xs font-medium border border-blue-500/20">
//                     Business Account
//                 </div>
//             </div>
//         </div>
//       </CardHeader>
      
//       <CardContent className="pt-8">
//         <form onSubmit={handleSubmit} className="space-y-8">
          
//           {/* 1. Logo Section */}
//           <div className="flex items-start gap-6 p-4 bg-muted/40 rounded-lg border border-border/60">
//             <Avatar className="h-20 w-20 rounded-md border border-border">
//                 <AvatarImage src={user.profile_image_url || ""} />
//                 <AvatarFallback className="rounded-md bg-muted text-muted-foreground">
//                     <Building2 className="h-8 w-8" />
//                 </AvatarFallback>
//             </Avatar>
//             <div className="flex-1 space-y-1">
//                 <h3 className="text-sm font-medium">Company Logo</h3>
//                 <p className="text-xs text-muted-foreground">
//                     Your logo comes from your Instagram Business account.
//                 </p>
//             </div>
//           </div>

//           {/* 2. Business Details */}
//           <div className="space-y-4">
//              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Business Details</h3>
//              <div className="grid gap-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div className="space-y-2">
//                     <Label htmlFor="business-name">Business Name</Label>
//                     <Input
//                         id="business-name"
//                         value={displayName}
//                         onChange={(e) => setDisplayName(e.target.value)}
//                         required
//                     />
//                     </div>
//                     <div className="space-y-2">
//                         <Label>Business Type</Label>
//                         <Select value={businessType} onValueChange={setBusinessType}>
//                         <SelectTrigger>
//                             <SelectValue placeholder="Select Type" />
//                             </SelectTrigger>
//                             <SelectContent>
//                             {BUSINESS_TYPES.map((t) => (
//                                 <SelectItem key={t} value={t}>{t}</SelectItem>
//                             ))}
//                             </SelectContent>
//                         </Select>
//                     </div>
//                 </div>

//                 <div className="space-y-2">
//                 <Label htmlFor="description">Description</Label>
//                 <Textarea
//                     id="description"
//                     className="min-h-[120px]"
//                     value={description}
//                     onChange={(e) => setDescription(e.target.value)}
//                     placeholder="Describe your business mission..."
//                 />
//                 </div>
//              </div>
//           </div>

//           {/* 3. Location & Contact */}
//           <div className="space-y-4">
//             <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Location & Contact</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="space-y-2">
//                 <Label className="flex items-center gap-2"><Phone className="h-3 w-3"/> Phone</Label>
//                 <Input 
//                     value={phone} 
//                     onChange={(e) => setPhone(e.target.value)} 
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label className="flex items-center gap-2"><Globe className="h-3 w-3"/> Website</Label>
//                 <Input 
//                     value={website} 
//                     onChange={(e) => setWebsite(e.target.value)} 
//                 />
//               </div>
//             </div>
            
//             {/* New Location Dropdowns */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
//                 {/* Country */}
//                <div className="space-y-2">
//                   <Label>Country</Label>
//                   <Select 
//                     value={country} 
//                     onValueChange={(value) => {
//                         setCountry(value);
//                         // Find ISO code
//                         const c = countries.find(x => x.name === value);
//                         setSelectedCountryCode(c?.isoCode || "");
//                         // Reset dependent fields
//                         setState("");
//                         setSelectedStateCode("");
//                         setCity("");
//                     }}
//                   >
//                     <SelectTrigger>
//                         <SelectValue placeholder="Select Country" />
//                     </SelectTrigger>
//                     <SelectContent>
//                         {countries.map((c) => (
//                             <SelectItem key={c.isoCode} value={c.name}>{c.name}</SelectItem>
//                         ))}
//                     </SelectContent>
//                   </Select>
//                </div>

//                {/* State */}
//                <div className="space-y-2">
//                   <Label>State / Region</Label>
//                   <Select 
//                     disabled={!selectedCountryCode}
//                     value={state} 
//                     onValueChange={(value) => {
//                         setState(value);
//                         const s = states.find(x => x.name === value);
//                         setSelectedStateCode(s?.isoCode || "");
//                         setCity("");
//                     }}
//                   >
//                     <SelectTrigger>
//                         <SelectValue placeholder="Select State" />
//                     </SelectTrigger>
//                     <SelectContent>
//                         {states.map((s) => (
//                             <SelectItem key={s.isoCode} value={s.name}>{s.name}</SelectItem>
//                         ))}
//                     </SelectContent>
//                   </Select>
//                </div>

//                {/* City */}
//                <div className="space-y-2">
//                   <Label className="flex items-center gap-2"><MapPin className="h-3 w-3"/> City</Label>
//                   <Select 
//                     disabled={!selectedStateCode}
//                     value={city} 
//                     onValueChange={setCity}
//                   >
//                     <SelectTrigger>
//                         <SelectValue placeholder="Select City" />
//                     </SelectTrigger>
//                     <SelectContent>
//                         {cities.map((c) => (
//                             <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
//                         ))}
//                     </SelectContent>
//                   </Select>
//                </div>

//                {/* Pincode */}
//                <div className="space-y-2">
//                   <Label>Pincode / Zip Code</Label>
//                   <Input 
//                     value={pincode} 
//                     onChange={(e) => setPincode(e.target.value)} 
//                     placeholder="e.g. 10012"
//                   />
//                </div>
//             </div>
//           </div>

//           {/* Notification Messages */}
//           {error && (
//             <div className="p-3 rounded-md bg-red-950/50 border border-red-900/50 text-red-400 text-sm">
//                 Error: {error}
//             </div>
//           )}
          
//           {successMessage && (
//             <div className="p-3 rounded-md bg-green-500/10 border border-green-500/20 text-green-500 text-sm">
//                 {successMessage}
//             </div>
//           )}

//           {/* Action Buttons */}
//           <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
//             <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => router.push("/business-dashboard/profile")}
//                 className=""
//             >
//                 Cancel
//             </Button>
//             <Button 
//                 type="submit" 
//                 disabled={isLoading}
//                 className="bg-white text-black hover:bg-gray-200"
//             >
//                 {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//                 {isLoading ? "Saving..." : "Save Changes"}
//             </Button>
//           </div>
//         </form>

//         {/* --- DANGER ZONE / DELETE ACCOUNT --- */}
//         <div className="mt-12 pt-8 border-t border-zinc-800">
//           <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-6">
//             <div className="flex items-start justify-between">
//               <div className="space-y-1">
//                 <h3 className="text-lg font-medium text-red-500 flex items-center gap-2">
//                   <AlertTriangle className="h-5 w-5" /> Danger Zone
//                 </h3>
//                 <p className="text-sm text-zinc-400">
//                   Request to delete your business account and all associated data. This action cannot be undone once processed by admin.
//                 </p>
//               </div>
              
//               <AlertDialog>
//                 <AlertDialogTrigger asChild>
//                   <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white shrink-0">
//                     <Trash2 className="mr-2 h-4 w-4" />
//                     Delete Account
//                   </Button>
//                 </AlertDialogTrigger>
//                 <AlertDialogContent className="bg-card border-border">
//                   <AlertDialogHeader>
//                     <AlertDialogTitle className="text-zinc-100">Are you absolutely sure?</AlertDialogTitle>
//                     <AlertDialogDescription className="text-zinc-400">
//                       This action will send a request to the administrators to permanently delete your account. 
//                       You may lose access to your dashboard while the request is being processed.
//                     </AlertDialogDescription>
//                   </AlertDialogHeader>
//                   <AlertDialogFooter>
//                     <AlertDialogCancel>Cancel</AlertDialogCancel>
//                     <AlertDialogAction 
//                       onClick={handleDeleteRequest}
//                       className="bg-red-600 hover:bg-red-700 text-white"
//                       disabled={isDeleteLoading}
//                     >
//                       {isDeleteLoading ? (
//                         <>
//                           <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
//                         </>
//                       ) : (
//                         "Yes, Send Request"
//                       )}
//                     </AlertDialogAction>
//                   </AlertDialogFooter>
//                 </AlertDialogContent>
//               </AlertDialog>
//             </div>
//           </div>
//         </div>
//         {/* --- END DANGER ZONE --- */}

//       </CardContent>
//     </Card>
//   );
// }


"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";
import { State, City } from "country-state-city"; 

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Building2, Phone, Globe, MapPin, Loader2, ArrowLeft, Trash2, AlertTriangle, 
  CheckCircle2, XCircle
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const BUSINESS_TYPES = [
  "Agency (Marketing/PR)", "App / SaaS", "Beauty & Cosmetics", "Clothing & Apparel",
  "Consumer Electronics", "Education & Course", "Event & Entertainment",
  "Food & Beverage", "Health & Wellness", "Home & Garden", "Local Business (Storefront)",
  "Non-Profit", "Travel & Hospitality", "Other"
];

// Common Indian City name variations to handle API discrepancies
const CITY_ALIASES: Record<string, string[]> = {
  "bengaluru": ["bangalore"],
  "bangalore": ["bengaluru"],
  "mumbai": ["bombay"],
  "kolkata": ["calcutta"],
  "chennai": ["madras"],
  "gurugram": ["gurgaon"],
  "mysuru": ["mysore"],
  "belagavi": ["belgaum"],
  "puducherry": ["pondicherry"],
  "thiruvananthapuram": ["trivandrum"],
  "kochi": ["cochin", "ernakulam"],
  "vijayapura": ["bijapur"],
  "kalaburagi": ["gulbarga"],
  "shivamogga": ["shimoga"],
  "mangaluru": ["mangalore"]
};

interface BusinessUser {
  id: string;
  display_name: string;
  bio: string | null;
  profile_image_url: string | null;
  email?: string;
  phone?: string;
  website?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string; 
  business_type?: string;
  business_description?: string; 
}

export function BusinessEditForm({ user }: { user: BusinessUser }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form Fields
  const [displayName, setDisplayName] = useState(user.display_name || "");
  const [description, setDescription] = useState(user.business_description || user.bio || ""); 
  const [businessType, setBusinessType] = useState(user.business_type || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [website, setWebsite] = useState(user.website || "");
  
  // Location State
  const countryCode = "IN"; 
  const [pincode, setPincode] = useState(user.pincode || ""); 
  const [state, setState] = useState(user.state || "");
  const [city, setCity] = useState(user.city || "");
  
  // Helper for Dropdowns
  const [selectedStateCode, setSelectedStateCode] = useState("");
  
  // Validation State
  const [isValidatingPin, setIsValidatingPin] = useState(false);
  const [pincodeError, setPincodeError] = useState<string | null>(null);

  // Library Data
  const states = State.getStatesOfCountry(countryCode);
  const cities = selectedStateCode ? City.getCitiesOfState(countryCode, selectedStateCode) : [];

  // Initialize State Code on Load to populate Cities
  useEffect(() => {
    if (user.state) {
      const foundState = states.find(s => s.name === user.state);
      if (foundState) setSelectedStateCode(foundState.isoCode);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // --- Validation Logic ---
  const verifyPincodeAgainstLocation = async (pin: string, selectedState: string, selectedCity: string) => {
    // Basic guards
    if (!pin || pin.length !== 6) return;
    if (!selectedState || !selectedCity) {
        setPincodeError("Please select State and City first.");
        return;
    }

    setIsValidatingPin(true);
    setPincodeError(null);

    try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const data = await response.json();

        if (data && data[0].Status === "Success") {
            const postOffice = data[0].PostOffice[0];
            const apiState = postOffice.State;
            const apiDistrict = postOffice.District;

            // 1. Strict State Check
            if (apiState.toLowerCase() !== selectedState.toLowerCase()) {
                setPincodeError(`Pincode belongs to ${apiState}, not ${selectedState}.`);
                setIsValidatingPin(false);
                return;
            }

            // 2. City Check with Aliases (Fix for Bangalore/Bengaluru issue)
            const cleanApiDistrict = apiDistrict.toLowerCase().replace("district", "").trim();
            const cleanSelectedCity = selectedCity.toLowerCase();
            
            // Check direct inclusion
            let isMatch = cleanSelectedCity.includes(cleanApiDistrict) || cleanApiDistrict.includes(cleanSelectedCity);

            // Check aliases if direct match failed
            if (!isMatch) {
              if (CITY_ALIASES[cleanSelectedCity]) {
                 // Check if API result matches any alias of the selected city
                 isMatch = CITY_ALIASES[cleanSelectedCity].some(alias => cleanApiDistrict.includes(alias));
              }
              if (!isMatch && CITY_ALIASES[cleanApiDistrict]) {
                 // Check if Selected city matches any alias of the API result
                 isMatch = CITY_ALIASES[cleanApiDistrict].some(alias => cleanSelectedCity.includes(alias));
              }
            }

            if (!isMatch) {
                 setPincodeError(`Pincode is for ${apiDistrict}, doesn't match ${selectedCity}.`);
                 setIsValidatingPin(false);
                 return;
            }

            // Valid
            setPincodeError(null);
        } else {
            setPincodeError("Invalid Pincode.");
        }
    } catch (err) {
        console.error("API Error", err);
        // We don't block on API failure
    } finally {
        setIsValidatingPin(false);
    }
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ''); 
    if (val.length > 6) return;
    
    setPincode(val);
    
    // Clear error if typing, but validation only runs at 6
    if (val.length < 6) setPincodeError(null);
    
    if (val.length === 6) {
        verifyPincodeAgainstLocation(val, state, city);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    // 1. Length Check
    if (pincode && pincode.length !== 6) {
        setError("Pincode must be exactly 6 digits.");
        setIsLoading(false);
        return;
    }

    // 2. Wait for validation to finish
    if (isValidatingPin) {
        setError("Validating pincode... please wait.");
        setIsLoading(false);
        return;
    }

    // 3. Check existing errors
    if (pincodeError) {
        setError("Please fix the Pincode error before saving.");
        setIsLoading(false);
        return;
    }

    try {
      const supabase = createClient();
      const updates = {
        display_name: displayName,
        business_description: description || null,
        bio: description || null,
        business_type: businessType,
        phone,
        website,
        country: "India",
        state,
        city,
        pincode: pincode || null,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase.from("users").update(updates).eq("id", user.id);
      if (updateError) throw new Error(updateError.message);

      setSuccessMessage("Business profile updated successfully.");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  }

  // Handle Delete
  async function handleDeleteRequest() {
    setIsDeleteLoading(true);
    const supabase = createClient();
    const { error: deleteError } = await supabase.from("deletion_requests").insert({
        user_id: user.id, reason: "Business user requested via profile settings", status: "pending"
    });
    if (deleteError) setError("Failed to send deletion request.");
    else setSuccessMessage("Deletion request sent.");
    setIsDeleteLoading(false);
  }

  return (
    <Card className="w-full max-w-4xl mx-auto border-border bg-card shadow-sm">
      <CardHeader className="border-b border-border pb-6">
        <div className="flex items-start gap-4">
            <Button variant="outline" size="icon" onClick={() => router.push('/business-dashboard/profile')}>
                <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 flex items-center justify-between">
                <div>
                    <CardTitle className="text-xl">Business Profile Settings</CardTitle>
                    <CardDescription>Manage your company details and location.</CardDescription>
                </div>
                <div className="hidden sm:block bg-blue-500/10 text-blue-500 px-3 py-1 rounded-md text-xs font-medium border border-blue-500/20">Business Account</div>
            </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Logo */}
          <div className="flex items-start gap-6 p-4 bg-muted/40 rounded-lg border border-border/60">
            <Avatar className="h-20 w-20 rounded-md border border-border">
                <AvatarImage src={user.profile_image_url || ""} />
                <AvatarFallback className="rounded-md bg-muted text-muted-foreground"><Building2 className="h-8 w-8" /></AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
                <h3 className="text-sm font-medium">Company Logo</h3>
                <p className="text-xs text-muted-foreground">Managed via Instagram.</p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
             <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Business Details</h3>
             <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Business Name</Label>
                        <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label>Business Type</Label>
                        <Select value={businessType} onValueChange={setBusinessType}>
                        <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                        <SelectContent>{BUSINESS_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[100px]" />
                </div>
             </div>
          </div>

          {/* Location & Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Location & Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Phone className="h-3 w-3"/> Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Globe className="h-3 w-3"/> Website</Label>
                <Input value={website} onChange={(e) => setWebsite(e.target.value)} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Country */}
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input value="India" disabled className="bg-muted text-muted-foreground" />
                </div>

                {/* State */}
                <div className="space-y-2">
                  <Label>State</Label>
                  <Select 
                    value={state} 
                    onValueChange={(value) => {
                        setState(value);
                        setCity(""); 
                        setPincode(""); 
                        setPincodeError(null);
                        const s = states.find(x => x.name === value);
                        setSelectedStateCode(s?.isoCode || "");
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
                    <SelectContent>
                        {states.map((s) => <SelectItem key={s.isoCode} value={s.name}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* City */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><MapPin className="h-3 w-3"/> City</Label>
                  <Select 
                    disabled={!selectedStateCode}
                    value={city} 
                    onValueChange={(val) => {
                        setCity(val);
                        setPincode(""); 
                        setPincodeError(null);
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Select City" /></SelectTrigger>
                    <SelectContent>
                        {cities.map((c) => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Pincode */}
                <div className="space-y-2">
                  <Label>Pincode</Label>
                  <div className="relative">
                    <Input 
                        value={pincode} 
                        onChange={handlePincodeChange} 
                        placeholder="Enter 6-digit Pincode"
                        maxLength={6}
                        disabled={!state || !city}
                        className={pincodeError ? "border-red-500 pr-10" : "pr-10"}
                    />
                    <div className="absolute right-3 top-2.5">
                        {isValidatingPin ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : 
                         !pincodeError && pincode.length === 6 ? <CheckCircle2 className="h-5 w-5 text-green-500" /> :
                         pincodeError ? <XCircle className="h-5 w-5 text-red-500" /> : null
                        }
                    </div>
                  </div>
                  {pincodeError && <p className="text-xs text-red-500 mt-1">{pincodeError}</p>}
                  {!state && <p className="text-xs text-muted-foreground mt-1">Select State & City to enable.</p>}
                </div>
            </div>
          </div>

          {error && <div className="p-3 rounded-md bg-red-500/10 text-red-500 text-sm">{error}</div>}
          {successMessage && <div className="p-3 rounded-md bg-green-500/10 text-green-500 text-sm">{successMessage}</div>}

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
            <Button type="button" variant="outline" onClick={() => router.push("/business-dashboard/profile")}>Cancel</Button>
            <Button type="submit" disabled={isLoading || isValidatingPin}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
            </Button>
          </div>
        </form>

        {/* Danger Zone */}
        <div className="mt-12 pt-8 border-t border-zinc-800">
           <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-medium text-red-500 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" /> Danger Zone
                </h3>
                <p className="text-sm text-zinc-400">
                  Request to delete your business account.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild><Button variant="destructive" className="bg-red-600">Delete Account</Button></AlertDialogTrigger>
                <AlertDialogContent className="bg-card border-border">
                  <AlertDialogHeader><AlertDialogTitle className="text-zinc-100">Are you sure?</AlertDialogTitle><AlertDialogDescription className="text-zinc-400">This will request permanent deletion.</AlertDialogDescription></AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteRequest} className="bg-red-600" disabled={isDeleteLoading}>{isDeleteLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Yes, Send Request"}</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}