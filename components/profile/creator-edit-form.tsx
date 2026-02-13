// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from 'next/navigation';
// import { createClient } from "@/lib/supabase/client";
// import { State, City } from "country-state-city"; 

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { 
//   User as UserIcon, Camera, Phone, ArrowLeft, Loader2, Trash2, AlertTriangle, Calendar, MapPin, CheckCircle2, XCircle
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

// // City Aliases for Pincode Validation
// const CITY_ALIASES: Record<string, string[]> = {
//   "bengaluru": ["bangalore"],
//   "bangalore": ["bengaluru"],
//   "mumbai": ["bombay"],
//   "kolkata": ["calcutta"],
//   "chennai": ["madras"],
//   "gurugram": ["gurgaon"],
//   "mysuru": ["mysore"],
//   "belagavi": ["belgaum"],
//   "puducherry": ["pondicherry"],
//   "thiruvananthapuram": ["trivandrum"],
//   "kochi": ["cochin", "ernakulam"],
//   "vijayapura": ["bijapur"],
//   "kalaburagi": ["gulbarga"],
//   "shivamogga": ["shimoga"],
//   "mangaluru": ["mangalore"]
// };

// interface CreatorUser {
//   id: string;
//   display_name: string;
//   bio: string | null;
//   profile_image_url: string | null;
//   email?: string;
//   phone?: string;
//   city?: string;
//   state?: string;
//   country?: string;
//   pincode?: string;
//   date_of_birth?: string;
// }

// export function CreatorEditForm({ user }: { user: CreatorUser }) {
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(false);
//   const [isDeleteLoading, setIsDeleteLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [successMessage, setSuccessMessage] = useState<string | null>(null);

//   // Form States
//   const [displayName, setDisplayName] = useState(user.display_name || "");
//   const [bio, setBio] = useState(user.bio || "");
//   const [phone, setPhone] = useState(user.phone || "");
//   const [dateOfBirth, setDateOfBirth] = useState(user.date_of_birth || "");
  
//   // Location States
//   const countryCode = "IN";
//   const [pincode, setPincode] = useState(user.pincode || "");
//   const [state, setState] = useState(user.state || "");
//   const [city, setCity] = useState(user.city || "");
  
//   const [selectedStateCode, setSelectedStateCode] = useState("");

//   // Validation
//   const [isValidatingPin, setIsValidatingPin] = useState(false);
//   const [pincodeError, setPincodeError] = useState<string | null>(null);

//   const states = State.getStatesOfCountry(countryCode);
//   const cities = selectedStateCode ? City.getCitiesOfState(countryCode, selectedStateCode) : [];

//   useEffect(() => {
//     if (user.state) {
//       const foundState = states.find(s => s.name === user.state);
//       if (foundState) setSelectedStateCode(foundState.isoCode);
//     }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const verifyPincodeAgainstLocation = async (pin: string, selectedState: string, selectedCity: string) => {
//     if (!pin || pin.length !== 6) return;
//     if (!selectedState || !selectedCity) {
//         setPincodeError("Please select State and City first.");
//         return;
//     }

//     setIsValidatingPin(true);
//     setPincodeError(null);

//     try {
//         const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
//         const data = await response.json();

//         if (data && data[0].Status === "Success") {
//             const postOffice = data[0].PostOffice[0];
//             const apiState = postOffice.State;
//             const apiDistrict = postOffice.District;

//             if (apiState.toLowerCase() !== selectedState.toLowerCase()) {
//                 setPincodeError(`Pincode belongs to ${apiState}, not ${selectedState}.`);
//                 setIsValidatingPin(false);
//                 return;
//             }

//             const cleanApiDistrict = apiDistrict.toLowerCase().replace("district", "").trim();
//             const cleanSelectedCity = selectedCity.toLowerCase();

//             let isMatch = cleanSelectedCity.includes(cleanApiDistrict) || cleanApiDistrict.includes(cleanSelectedCity);

//             if (!isMatch) {
//               if (CITY_ALIASES[cleanSelectedCity]) {
//                  isMatch = CITY_ALIASES[cleanSelectedCity].some(alias => cleanApiDistrict.includes(alias));
//               }
//               if (!isMatch && CITY_ALIASES[cleanApiDistrict]) {
//                  isMatch = CITY_ALIASES[cleanApiDistrict].some(alias => cleanSelectedCity.includes(alias));
//               }
//             }

//             if (!isMatch) {
//                  setPincodeError(`Pincode is for ${apiDistrict}, doesn't match ${selectedCity}.`);
//                  setIsValidatingPin(false);
//                  return;
//             }

//             setPincodeError(null);
//         } else {
//             setPincodeError("Invalid Pincode.");
//         }
//     } catch (err) {
//         console.error("API Error", err);
//     } finally {
//         setIsValidatingPin(false);
//     }
//   };

//   const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const val = e.target.value.replace(/\D/g, ''); 
//     if (val.length > 6) return;
    
//     setPincode(val);
//     if (val.length < 6) setPincodeError(null);
//     if (val.length === 6) verifyPincodeAgainstLocation(val, state, city);
//   };

//   // Helper function for strict Age calculation
//   const getAge = (dateString: string) => {
//     const today = new Date();
//     // Parse manually to avoid timezone issues with new Date(string)
//     const [year, month, day] = dateString.split("-").map(Number);
    
//     let age = today.getFullYear() - year;
//     const m = (today.getMonth() + 1) - month;
    
//     // If current month is less than birth month, or same month but day hasn't passed
//     if (m < 0 || (m === 0 && today.getDate() < day)) {
//         age--;
//     }
//     return age;
//   };

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setIsLoading(true);
//     setError(null);
//     setSuccessMessage(null);

//     // 1. AGE VALIDATION
//     if (!dateOfBirth) {
//         setError("Date of Birth is required.");
//         setIsLoading(false);
//         return;
//     }

//     const age = getAge(dateOfBirth);
//     if (age < 16) {
//         setError(`You must be at least 16 years old. (Current age: ${age})`);
//         setIsLoading(false);
//         return;
//     }

//     // 2. PINCODE VALIDATION
//     if (pincode && pincode.length !== 6) {
//         setError("Pincode must be exactly 6 digits.");
//         setIsLoading(false);
//         return;
//     }

//     if (isValidatingPin) {
//         setError("Validating pincode... please wait.");
//         setIsLoading(false);
//         return;
//     }

//     if (pincodeError) {
//         setError("Please fix the Pincode error before saving.");
//         setIsLoading(false);
//         return;
//     }

//     const supabase = createClient();
//     const { error: updateError } = await supabase
//       .from("users")
//       .update({
//         display_name: displayName,
//         bio: bio || null,
//         phone,
//         date_of_birth: dateOfBirth,
//         pincode: pincode || null,
//         city,
//         state,
//         country: "India",
//         updated_at: new Date().toISOString(),
//       })
//       .eq("id", user.id);

//     if (updateError) {
//       setError(updateError.message);
//       setIsLoading(false);
//       return;
//     }

//     setSuccessMessage("Profile updated successfully");
//     setIsLoading(false);
//     router.refresh();
//   }

//   async function handleDeleteRequest() {
//     setIsDeleteLoading(true);
//     const supabase = createClient();
//     const { error: deleteError } = await supabase.from("deletion_requests").insert({
//         user_id: user.id, reason: "User requested via profile settings", status: "pending"
//     });
//     if (deleteError) setError("Failed to send deletion request.");
//     else setSuccessMessage("Deletion request sent.");
//     setIsDeleteLoading(false);
//   }

//   return (
//     <Card className="w-full max-w-4xl mx-auto border-border bg-card shadow-sm">
//       <CardHeader className="border-b border-border pb-6">
//         <div className="flex items-start gap-4">
//             <Button variant="outline" size="icon" onClick={() => router.push('/creator-dashboard/profile')}>
//                 <ArrowLeft className="h-4 w-4" />
//             </Button>
//             <div className="flex-1 flex items-center justify-between">
//                 <div>
//                     <CardTitle className="text-xl">Edit Creator Profile</CardTitle>
//                     <CardDescription>Update your personal details.</CardDescription>
//                 </div>
//                 <div className="hidden sm:block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium border border-primary/20">Creator</div>
//             </div>
//         </div>
//       </CardHeader>
      
//       <CardContent className="pt-8">
//         <form onSubmit={handleSubmit} className="space-y-8">
          
//           {/* Visual Identity */}
//           <div className="flex flex-col items-center sm:flex-row gap-6 pb-6 border-b border-border">
//             <div className="relative group">
//                 <Avatar className="h-24 w-24 cursor-pointer ring-2 ring-muted group-hover:ring-primary/60 transition-all">
//                     <AvatarImage src={user.profile_image_url || ""} />
//                     <AvatarFallback className="bg-muted text-muted-foreground"><UserIcon className="h-10 w-10" /></AvatarFallback>
//                 </Avatar>
//                 <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
//                     <Camera className="h-4 w-4" />
//                 </div>
//             </div>
//             <div className="flex-1 space-y-4 w-full">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="space-y-2"><Label>Display Name</Label><Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required /></div>
//                   <div className="space-y-2"><Label>Bio</Label><Textarea value={bio} onChange={(e) => setBio(e.target.value)} className="min-h-[80px]" /></div>
//                 </div>
//             </div>
//           </div>

//           {/* Personal Details */}
//           <div className="space-y-4">
//             <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Personal Details</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                <div className="space-y-2">
//                   <Label className="flex items-center gap-2">
//                     <Calendar className="h-3 w-3"/> Date of Birth <span className="text-red-500">*</span>
//                   </Label>
//                   <Input 
//                     type="date" 
//                     className="block" 
//                     value={dateOfBirth} 
//                     onChange={(e) => setDateOfBirth(e.target.value)}
//                     required
//                   />
//                   <p className="text-[10px] text-muted-foreground pt-1">Must be at least 16 years old.</p>
//                </div>
//                <div className="space-y-2">
//                 <Label className="flex items-center gap-2"><Phone className="h-3 w-3"/> Phone</Label>
//                 <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
//               </div>
//             </div>
//           </div>

//           {/* Location Logic */}
//           <div className="space-y-4">
//             <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Location</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                <div className="space-y-2">
//                   <Label>Country</Label>
//                   <Input value="India" disabled className="bg-muted text-muted-foreground" />
//                </div>

//                 {/* State Dropdown */}
//                <div className="space-y-2">
//                   <Label>State</Label>
//                   <Select 
//                     value={state} 
//                     onValueChange={(value) => {
//                         setState(value);
//                         setCity("");
//                         setPincode("");
//                         setPincodeError(null);
//                         const s = states.find(x => x.name === value);
//                         setSelectedStateCode(s?.isoCode || "");
//                     }}
//                   >
//                     <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
//                     <SelectContent>
//                         {states.map((s) => <SelectItem key={s.isoCode} value={s.name}>{s.name}</SelectItem>)}
//                     </SelectContent>
//                   </Select>
//                </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
//                {/* City Dropdown */}
//                <div className="space-y-2">
//                   <Label className="flex items-center gap-2"><MapPin className="h-3 w-3"/> City</Label>
//                   <Select 
//                     disabled={!selectedStateCode}
//                     value={city} 
//                     onValueChange={(val) => {
//                         setCity(val);
//                         setPincode(""); 
//                         setPincodeError(null);
//                     }}
//                   >
//                     <SelectTrigger><SelectValue placeholder="Select City" /></SelectTrigger>
//                     <SelectContent>
//                         {cities.map((c) => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
//                     </SelectContent>
//                   </Select>
//                </div>

//                {/* Pincode Verification */}
//                <div className="space-y-2">
//                   <Label>Pincode</Label>
//                   <div className="relative">
//                     <Input 
//                         value={pincode} 
//                         onChange={handlePincodeChange} 
//                         placeholder="Enter 6-digit Pincode"
//                         maxLength={6}
//                         disabled={!state || !city}
//                         className={pincodeError ? "border-red-500 pr-10" : "pr-10"}
//                     />
//                     <div className="absolute right-3 top-2.5">
//                         {isValidatingPin ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : 
//                          !pincodeError && pincode.length === 6 ? <CheckCircle2 className="h-5 w-5 text-green-500" /> :
//                          pincodeError ? <XCircle className="h-5 w-5 text-red-500" /> : null
//                         }
//                     </div>
//                   </div>
//                   {pincodeError && <p className="text-xs text-red-500 mt-1">{pincodeError}</p>}
//                   {!state && <p className="text-xs text-muted-foreground mt-1">Select State & City first.</p>}
//                </div>
//             </div>
//           </div>

//           {error && <div className="p-3 rounded-md bg-red-500/10 text-red-500 text-sm">{error}</div>}
//           {successMessage && <div className="p-3 rounded-md bg-green-500/10 text-green-500 text-sm">{successMessage}</div>}

//           <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
//             <Button type="button" variant="outline" onClick={() => router.push("/creator-dashboard/profile")}>Cancel</Button>
//             <Button type="submit" disabled={isLoading || isValidatingPin}>
//                 {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
//             </Button>
//           </div>
//         </form>
        
//         {/* Delete Section */}
//         <div className="mt-12 pt-8 border-t border-border">
//           <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-6">
//             <div className="flex items-start justify-between">
//               <div className="space-y-1">
//                 <h3 className="text-lg font-medium text-red-500 flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Danger Zone</h3>
//                 <p className="text-sm text-muted-foreground">Request to delete your account.</p>
//               </div>
//               <AlertDialog>
//                 <AlertDialogTrigger asChild><Button variant="destructive" className="bg-red-600">Delete Account</Button></AlertDialogTrigger>
//                 <AlertDialogContent className="bg-card border-border">
//                   <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will request permanent deletion.</AlertDialogDescription></AlertDialogHeader>
//                   <AlertDialogFooter>
//                     <AlertDialogCancel>Cancel</AlertDialogCancel>
//                     <AlertDialogAction onClick={handleDeleteRequest} className="bg-red-600" disabled={isDeleteLoading}>{isDeleteLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Yes, Send Request"}</AlertDialogAction>
//                   </AlertDialogFooter>
//                 </AlertDialogContent>
//               </AlertDialog>
//             </div>
//           </div>
//         </div>
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
  User as UserIcon, Camera, Phone, ArrowLeft, Loader2, Trash2, AlertTriangle, Calendar, MapPin, CheckCircle2, XCircle
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

// City Aliases for Pincode Validation
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

interface CreatorUser {
  id: string;
  display_name: string;
  bio: string | null;
  profile_image_url: string | null;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  date_of_birth?: string;
}

export function CreatorEditForm({ user }: { user: CreatorUser }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form States
  const [displayName, setDisplayName] = useState(user.display_name || "");
  const [bio, setBio] = useState(user.bio || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [dateOfBirth, setDateOfBirth] = useState(user.date_of_birth || "");
  
  // Location States
  const countryCode = "IN";
  const [pincode, setPincode] = useState(user.pincode || "");
  const [state, setState] = useState(user.state || "");
  const [city, setCity] = useState(user.city || "");
  
  const [selectedStateCode, setSelectedStateCode] = useState("");

  // Validation
  const [isValidatingPin, setIsValidatingPin] = useState(false);
  const [pincodeError, setPincodeError] = useState<string | null>(null);

  const states = State.getStatesOfCountry(countryCode);
  const cities = selectedStateCode ? City.getCitiesOfState(countryCode, selectedStateCode) : [];

  useEffect(() => {
    if (user.state) {
      const foundState = states.find(s => s.name === user.state);
      if (foundState) setSelectedStateCode(foundState.isoCode);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifyPincodeAgainstLocation = async (pin: string, selectedState: string, selectedCity: string) => {
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

            if (apiState.toLowerCase() !== selectedState.toLowerCase()) {
                setPincodeError(`Pincode belongs to ${apiState}, not ${selectedState}.`);
                setIsValidatingPin(false);
                return;
            }

            const cleanApiDistrict = apiDistrict.toLowerCase().replace("district", "").trim();
            const cleanSelectedCity = selectedCity.toLowerCase();

            let isMatch = cleanSelectedCity.includes(cleanApiDistrict) || cleanApiDistrict.includes(cleanSelectedCity);

            if (!isMatch) {
              if (CITY_ALIASES[cleanSelectedCity]) {
                 isMatch = CITY_ALIASES[cleanSelectedCity].some(alias => cleanApiDistrict.includes(alias));
              }
              if (!isMatch && CITY_ALIASES[cleanApiDistrict]) {
                 isMatch = CITY_ALIASES[cleanApiDistrict].some(alias => cleanSelectedCity.includes(alias));
              }
            }

            if (!isMatch) {
                 setPincodeError(`Pincode is for ${apiDistrict}, doesn't match ${selectedCity}.`);
                 setIsValidatingPin(false);
                 return;
            }

            setPincodeError(null);
        } else {
            setPincodeError("Invalid Pincode.");
        }
    } catch (err) {
        console.error("API Error", err);
    } finally {
        setIsValidatingPin(false);
    }
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ''); 
    if (val.length > 6) return;
    
    setPincode(val);
    if (val.length < 6) setPincodeError(null);
    if (val.length === 6) verifyPincodeAgainstLocation(val, state, city);
  };

  // Helper function for strict Age calculation
  const getAge = (dateString: string) => {
    const today = new Date();
    // Parse manually to avoid timezone issues with new Date(string)
    const [year, month, day] = dateString.split("-").map(Number);
    
    let age = today.getFullYear() - year;
    const m = (today.getMonth() + 1) - month;
    
    // If current month is less than birth month, or same month but day hasn't passed
    if (m < 0 || (m === 0 && today.getDate() < day)) {
        age--;
    }
    return age;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    // 1. AGE VALIDATION
    if (!dateOfBirth) {
        setError("Date of Birth is required.");
        setIsLoading(false);
        return;
    }

    const age = getAge(dateOfBirth);
    if (age < 16) {
        setError(`You must be at least 16 years old. (Current age: ${age})`);
        setIsLoading(false);
        return;
    }

    // 2. PINCODE VALIDATION
    if (pincode && pincode.length !== 6) {
        setError("Pincode must be exactly 6 digits.");
        setIsLoading(false);
        return;
    }

    if (isValidatingPin) {
        setError("Validating pincode... please wait.");
        setIsLoading(false);
        return;
    }

    if (pincodeError) {
        setError("Please fix the Pincode error before saving.");
        setIsLoading(false);
        return;
    }

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("users")
      .update({
        display_name: displayName,
        bio: bio || null,
        phone,
        date_of_birth: dateOfBirth,
        pincode: pincode || null,
        city,
        state,
        country: "India",
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
      setIsLoading(false);
      return;
    }

    setSuccessMessage("Profile updated successfully");
    setIsLoading(false);
    router.refresh();
  }

  async function handleDeleteRequest() {
    setIsDeleteLoading(true);
    const supabase = createClient();
    const { error: deleteError } = await supabase.from("deletion_requests").insert({
        user_id: user.id, reason: "User requested via profile settings", status: "pending"
    });
    if (deleteError) setError("Failed to send deletion request.");
    else setSuccessMessage("Deletion request sent.");
    setIsDeleteLoading(false);
  }

  return (
    <Card className="w-full max-w-3xl mx-auto border-none sm:border bg-card shadow-none sm:shadow-sm">
      {/* 
          Header shifted to the left by reducing mobile pl-4 to pl-2. 
          Changed items-start to items-center for better vertical alignment.
      */}
      <CardHeader className="border-b border-border py-5 pl-2 pr-4 sm:px-6">
        <div className="flex items-center gap-3 sm:gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-9 w-9 shrink-0 flex items-center justify-center border-muted-foreground/10" 
              onClick={() => router.push('/creator-dashboard/profile')}
            >
                <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 flex flex-col min-w-0 justify-center">
                <CardTitle className="text-xl font-bold leading-none mb-1">
                  Edit Creator Profile
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm truncate leading-none">
                  Update your personal details.
                </CardDescription>
            </div>
            <div className="hidden xs:block bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-primary/20 shrink-0">
              Creator
            </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-8 pt-6 sm:pt-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Visual Identity Section */}
          <div className="flex flex-col items-center sm:flex-row gap-6 sm:gap-8 pb-8 border-b border-border">
            <div className="relative group shrink-0">
                <Avatar className="h-28 w-28 cursor-pointer ring-4 ring-muted group-hover:ring-primary/40 transition-all duration-300">
                    <AvatarImage src={user.profile_image_url || ""} />
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      <UserIcon className="h-12 w-12" />
                    </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-1 right-1 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer shadow-lg hover:scale-110 transition-all">
                    <Camera className="h-4 w-4" />
                </div>
            </div>
            <div className="flex-1 space-y-4 w-full text-center sm:text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-tight text-muted-foreground">Display Name</Label>
                    <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required placeholder="Your display name" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-tight text-muted-foreground">Bio</Label>
                    <Textarea value={bio} onChange={(e) => setBio(e.target.value)} className="min-h-[80px] resize-none" placeholder="Tell us about yourself..." />
                  </div>
                </div>
            </div>
          </div>

          {/* Personal Details Section */}
          <div className="space-y-6">
            <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="h-px w-4 bg-muted-foreground/30"></span> Personal Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4 text-muted-foreground"/> Date of Birth <span className="text-red-500 font-bold">*</span>
                  </Label>
                  <Input 
                    type="date" 
                    className="block w-full h-10" 
                    value={dateOfBirth} 
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                  />
                  <p className="text-[10px] text-muted-foreground italic">Must be at least 16 years old.</p>
               </div>
               <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                    <Phone className="h-4 w-4 text-muted-foreground"/> Phone Number
                </Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 ..." className="h-10" />
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="space-y-6">
            <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="h-px w-4 bg-muted-foreground/30"></span> Location
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <Label className="text-xs font-semibold">Country</Label>
                  <Input value="India" disabled className="bg-muted text-muted-foreground opacity-70 h-10" />
               </div>

               <div className="space-y-2">
                  <Label className="text-xs font-semibold">State</Label>
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
                    <SelectTrigger className="w-full h-10"><SelectValue placeholder="Select State" /></SelectTrigger>
                    <SelectContent>
                        {states.map((s) => <SelectItem key={s.isoCode} value={s.name}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium"><MapPin className="h-4 w-4 text-muted-foreground"/> City</Label>
                  <Select 
                    disabled={!selectedStateCode}
                    value={city} 
                    onValueChange={(val) => {
                        setCity(val);
                        setPincode(""); 
                        setPincodeError(null);
                    }}
                  >
                    <SelectTrigger className="w-full h-10"><SelectValue placeholder="Select City" /></SelectTrigger>
                    <SelectContent>
                        {cities.map((c) => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
               </div>

               <div className="space-y-2">
                  <Label className="text-xs font-semibold">Pincode</Label>
                  <div className="relative">
                    <Input 
                        value={pincode} 
                        onChange={handlePincodeChange} 
                        placeholder="6-digit Pincode"
                        maxLength={6}
                        disabled={!state || !city}
                        className={`h-10 ${pincodeError ? "border-red-500 pr-10" : "pr-10"}`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isValidatingPin ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : 
                         !pincodeError && pincode.length === 6 ? <CheckCircle2 className="h-4 w-4 text-green-500" /> :
                         pincodeError ? <XCircle className="h-4 w-4 text-red-500" /> : null
                        }
                    </div>
                  </div>
                  {pincodeError && <p className="text-[10px] text-red-500 font-medium leading-tight">{pincodeError}</p>}
                  {!state && <p className="text-[10px] text-muted-foreground">Select State & City first.</p>}
               </div>
            </div>
          </div>

          {error && <div className="p-3 rounded-md bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20">{error}</div>}
          {successMessage && <div className="p-3 rounded-md bg-green-500/10 text-green-600 text-xs font-medium border border-green-500/20">{successMessage}</div>}

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-6 border-t border-border">
            <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={() => router.push("/creator-dashboard/profile")}>Cancel</Button>
            <Button type="submit" className="w-full sm:w-auto min-w-[120px]" disabled={isLoading || isValidatingPin}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
          </div>
        </form>
        
        {/* Delete Section */}
        <div className="mt-16">
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 overflow-hidden">
            <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-destructive flex items-center justify-center sm:justify-start gap-2">
                    <AlertTriangle className="h-4 w-4" /> Danger Zone
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Account deletion is permanent. Once requested, your data will be queued for removal.</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="w-full sm:w-auto font-bold uppercase tracking-wider text-[10px] h-9">Delete Account</Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-[90vw] sm:max-w-md border-border">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-bold">Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
                      This will request permanent deletion of your account. This action is irreversible.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-3 pt-4">
                    <AlertDialogCancel className="w-full sm:w-auto mt-0">Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteRequest} 
                      className="bg-destructive hover:bg-destructive/90 w-full sm:w-auto" 
                      disabled={isDeleteLoading}
                    >
                        {isDeleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yes, Send Request"}
                    </AlertDialogAction>
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