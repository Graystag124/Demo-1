// "use client";

// import Link from "next/link";
// import { format } from "date-fns";
// import { 
//   Heart, 
//   MessageCircle, 
//   Eye, 
//   ExternalLink,
//   MoreHorizontal
// } from "lucide-react";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";

// // Helper to extract clean URL for embedding
// const getEmbedUrl = (url: string) => {
//   try {
//     const urlObj = new URL(url);
//     // Ensure it ends with /embed for iframe or standard path
//     // Remove query params to prevent tracking/errors
//     return `${urlObj.origin}${urlObj.pathname}embed/captioned/`; 
//   } catch (e) {
//     return url;
//   }
// };

// const formatMetric = (num: number) => {
//   if (num === undefined || num === null) return "0";
//   return new Intl.NumberFormat('en-US', {
//     notation: "compact",
//     maximumFractionDigits: 1
//   }).format(num);
// };

// export function InstagramCard({ submission }: { submission: any }) {
//   // Use actual data from DB if available, otherwise default to 0
//   // Note: To get these accurately, you must fetch them from Graph API and save to your DB
//   const likes = submission.likes_count || 0;
//   const comments = submission.comments_count || 0;
//   const reach = submission.reach_count || 0; // or views

//   const embedUrl = getEmbedUrl(submission.url);

//   return (
//     <Card className="flex flex-col h-full overflow-hidden border-border/60 shadow-sm hover:shadow-md transition-all duration-200 group">
      
//       {/* 1. Header: Creator & Date */}
//       <CardHeader className="p-4 flex flex-row items-start justify-between space-y-0 bg-card">
//         <div className="flex items-center gap-3">
//           <Avatar className="h-10 w-10 border ring-2 ring-background">
//             <AvatarImage src={submission.creator?.profile_image_url} />
//             <AvatarFallback className="bg-primary/10 text-primary font-medium">
//               {submission.creator?.display_name?.substring(0, 2).toUpperCase()}
//             </AvatarFallback>
//           </Avatar>
//           <div>
//             <p className="text-sm font-semibold text-foreground leading-none">
//               {submission.creator?.display_name}
//             </p>
//             <p className="text-xs text-muted-foreground mt-1">
//               {format(new Date(submission.submitted_at), "MMM d, yyyy")}
//             </p>
//           </div>
//         </div>
        
//         <Badge variant="outline" className="capitalize bg-muted/50 font-normal">
//           {submission.type.replace("instagram_", "")}
//         </Badge>
//       </CardHeader>

//       <Separator />

//       {/* 2. The Real Preview (Iframe) */}
//       {/* We use aspect-[4/5] because standard IG posts are usually 4:5 vertical */}
//       <div className="relative w-full bg-black/5 aspect-[4/5] flex items-center justify-center overflow-hidden">
//         <iframe 
//           className="w-full h-full border-0"
//           src={embedUrl}
//           allowTransparency={true}
//           allow="encrypted-media"
//           title={`Instagram post by ${submission.creator?.display_name}`}
//         />
        
//         {/* Overlay Button (Visible on Hover) */}
//         <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
//            <Button size="sm" variant="secondary" className="shadow-lg backdrop-blur-md bg-white/90 text-black h-8" asChild>
//              <Link href={submission.url} target="_blank">
//                Open App <ExternalLink className="ml-2 h-3 w-3" />
//              </Link>
//            </Button>
//         </div>
//       </div>

//       <Separator />

//       {/* 3. Footer: Campaign Context & Metrics */}
//       <CardContent className="p-0 flex flex-col flex-1 bg-card">
        
//         {/* Campaign Info */}
//         <div className="px-4 py-3 bg-muted/20 border-b border-border/50">
//            <div className="flex items-center justify-between">
//               <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Campaign</span>
//               <span className="text-xs font-semibold text-foreground truncate max-w-[150px]">
//                 {submission.collaboration?.title}
//               </span>
//            </div>
//         </div>

//         {/* Metrics Grid */}
//         <div className="grid grid-cols-3 divide-x divide-border/50 h-20">
          
//           {/* Likes */}
//           <div className="flex flex-col items-center justify-center p-2 hover:bg-muted/30 transition-colors">
//             <div className="flex items-center gap-1.5 mb-1">
//               <Heart className={`h-4 w-4 ${likes > 0 ? "text-rose-500 fill-rose-500" : "text-muted-foreground"}`} />
//             </div>
//             <span className="text-lg font-bold text-foreground leading-none">
//               {formatMetric(likes)}
//             </span>
//             <span className="text-[10px] uppercase font-medium text-muted-foreground mt-1">Likes</span>
//           </div>

//           {/* Comments */}
//           <div className="flex flex-col items-center justify-center p-2 hover:bg-muted/30 transition-colors">
//             <div className="flex items-center gap-1.5 mb-1">
//               <MessageCircle className="h-4 w-4 text-blue-500" />
//             </div>
//             <span className="text-lg font-bold text-foreground leading-none">
//               {formatMetric(comments)}
//             </span>
//             <span className="text-[10px] uppercase font-medium text-muted-foreground mt-1">Comments</span>
//           </div>

//           {/* Reach/Views */}
//           <div className="flex flex-col items-center justify-center p-2 hover:bg-muted/30 transition-colors">
//             <div className="flex items-center gap-1.5 mb-1">
//               <Eye className="h-4 w-4 text-emerald-500" />
//             </div>
//             <span className="text-lg font-bold text-foreground leading-none">
//               {formatMetric(reach)}
//             </span>
//             <span className="text-[10px] uppercase font-medium text-muted-foreground mt-1">Reach</span>
//           </div>

//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// "use client";

// import Link from "next/link";
// import { format } from "date-fns";
// import { 
//   Heart, 
//   MessageCircle, 
//   Eye, 
//   ExternalLink,
//   Instagram
// } from "lucide-react";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";

// // Helper to extract clean URL for embedding
// const getEmbedUrl = (url: string) => {
//   try {
//     const urlObj = new URL(url);
//     // Construct the embed URL. 
//     // using 'embed' instead of 'embed/captioned' often gives a cleaner media-focused result,
//     // but 'captioned' provides context. We stick to captioned but constrain height.
//     const cleanPath = urlObj.pathname.endsWith('/') ? urlObj.pathname : `${urlObj.pathname}/`;
//     return `${urlObj.origin}${cleanPath}embed/captioned/`; 
//   } catch (e) {
//     return url;
//   }
// };

// const formatMetric = (num: number) => {
//   if (num === undefined || num === null) return "0";
//   return new Intl.NumberFormat('en-US', {
//     notation: "compact",
//     maximumFractionDigits: 1
//   }).format(num);
// };

// export function InstagramCard({ submission }: { submission: any }) {
//   // Directly reading the metrics columns from your DB schema
//   const likes = submission.likes_count || 0;
//   const comments = submission.comments_count || 0;
//   const reach = submission.reach_count || 0; 

//   const embedUrl = getEmbedUrl(submission.url);

//   return (
//     <Card className="flex flex-col h-full overflow-hidden border-border/60 shadow-sm hover:shadow-md transition-all duration-200 group bg-card">
      
//       {/* 1. Header: Creator & Date */}
//       <CardHeader className="p-3 px-4 flex flex-row items-center justify-between space-y-0 bg-card border-b border-border/40">
//         <div className="flex items-center gap-3 overflow-hidden">
//           <Avatar className="h-8 w-8 border ring-1 ring-background">
//             <AvatarImage src={submission.creator?.profile_image_url} />
//             <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
//               {submission.creator?.display_name?.substring(0, 2).toUpperCase()}
//             </AvatarFallback>
//           </Avatar>
//           <div className="min-w-0">
//             <p className="text-sm font-semibold text-foreground truncate">
//               {submission.creator?.display_name}
//             </p>
//             <p className="text-[10px] text-muted-foreground truncate">
//               {format(new Date(submission.submitted_at), "MMM d, yyyy")}
//             </p>
//           </div>
//         </div>
        
//         <div className="flex items-center gap-2">
//             <Badge variant="outline" className="capitalize text-[10px] h-5 px-2 bg-muted/30 font-normal border-border/60">
//             {submission.type.replace("instagram_", "")}
//             </Badge>
//         </div>
//       </CardHeader>

//       {/* 2. The Real Preview (Iframe) */}
//       <div className="relative w-full h-[450px] bg-muted/10">
//         {/* Open App Overlay Button - Positioned absolutely but clearly */}
//         <div className="absolute bottom-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
//            <Button size="sm" className="shadow-lg bg-white text-black hover:bg-white/90 h-8 text-xs font-medium gap-2" asChild>
//              <Link href={submission.url} target="_blank">
//                <Instagram className="h-3 w-3" /> Open App
//              </Link>
//            </Button>
//         </div>

//         {/* Iframe container with hidden scrollbar styling */}
//         <div className="w-full h-full overflow-y-auto no-scrollbar rounded-none">
//             <iframe 
//             className="w-full h-full min-h-[450px] border-0"
//             src={embedUrl}
//             // @ts-ignore - React type definition missing for legacy attribute
//             allowtransparency="true" // Fixed casing
//             allow="encrypted-media"
//             title={`Instagram post by ${submission.creator?.display_name}`}
//             />
//         </div>
//       </div>

//       <Separator className="bg-border/60" />

//       {/* 3. Footer: Campaign Context & Metrics */}
//       <CardContent className="p-0 flex flex-col bg-card">
        
//         {/* Campaign Info */}
//         <div className="px-4 py-3 border-b border-border/40 bg-muted/5">
//            <div className="flex items-center justify-between gap-4">
//               <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider shrink-0">Campaign</span>
//               <span className="text-xs font-medium text-foreground truncate text-right">
//                 {submission.collaboration?.title}
//               </span>
//            </div>
//         </div>

//         {/* Metrics Grid */}
//         <div className="grid grid-cols-3 divide-x divide-border/40">
          
//           {/* Likes */}
//           <div className="flex flex-col items-center justify-center p-3 hover:bg-muted/20 transition-colors">
//             <div className="flex items-center gap-1.5 mb-1 text-rose-500">
//               <Heart className={`h-4 w-4 ${likes > 0 ? "fill-current" : ""}`} />
//             </div>
//             <span className="text-sm font-bold text-foreground leading-none">
//               {formatMetric(likes)}
//             </span>
//             <span className="text-[9px] uppercase font-medium text-muted-foreground mt-1">Likes</span>
//           </div>

//           {/* Comments */}
//           <div className="flex flex-col items-center justify-center p-3 hover:bg-muted/20 transition-colors">
//             <div className="flex items-center gap-1.5 mb-1 text-blue-500">
//               <MessageCircle className="h-4 w-4" />
//             </div>
//             <span className="text-sm font-bold text-foreground leading-none">
//               {formatMetric(comments)}
//             </span>
//             <span className="text-[9px] uppercase font-medium text-muted-foreground mt-1">Comments</span>
//           </div>

//           {/* Reach/Views */}
//           <div className="flex flex-col items-center justify-center p-3 hover:bg-muted/20 transition-colors">
//             <div className="flex items-center gap-1.5 mb-1 text-emerald-500">
//               <Eye className="h-4 w-4" />
//             </div>
//             <span className="text-sm font-bold text-foreground leading-none">
//               {formatMetric(reach)}
//             </span>
//             <span className="text-[9px] uppercase font-medium text-muted-foreground mt-1">Reach</span>
//           </div>

//         </div>
//       </CardContent>
      
//       {/* CSS to hide scrollbars but allow scrolling */}
//       <style jsx global>{`
//         .no-scrollbar::-webkit-scrollbar {
//           display: none;
//         }
//         .no-scrollbar {
//           -ms-overflow-style: none;
//           scrollbar-width: none;
//         }
//       `}</style>
//     </Card>
//   );
// }


// "use client";

// import { useTransition } from "react"; // Added
// import Link from "next/link";
// import { format } from "date-fns";
// import { 
//   Heart, 
//   MessageCircle, 
//   Eye, 
//   ExternalLink,
//   Instagram,
//   RefreshCcw // Added icon
// } from "lucide-react";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
// import { syncSubmissionMetrics } from "@/app/actions/sync-metrics"; // Import your action
// import { toast } from "sonner"; // Optional: if you have a toast library installed

// // Helper to extract clean URL for embedding
// const getEmbedUrl = (url: string) => {
//   try {
//     const urlObj = new URL(url);
//     const cleanPath = urlObj.pathname.endsWith('/') ? urlObj.pathname : `${urlObj.pathname}/`;
//     return `${urlObj.origin}${cleanPath}embed/captioned/`; 
//   } catch (e) {
//     return url;
//   }
// };

// const formatMetric = (num: number) => {
//   if (num === undefined || num === null) return "0";
//   return new Intl.NumberFormat('en-US', {
//     notation: "compact",
//     maximumFractionDigits: 1
//   }).format(num);
// };

// export function InstagramCard({ submission }: { submission: any }) {
//   const [isPending, startTransition] = useTransition(); // Handle loading state

//   const likes = submission.likes_count || 0;
//   const comments = submission.comments_count || 0;
//   const reach = submission.reach_count || 0; 

//   const embedUrl = getEmbedUrl(submission.url);

//   // Sync Logic
//   const handleSync = () => {
//     startTransition(async () => {
//       try {
//         const result = await syncSubmissionMetrics(submission.id, submission.url);
//         if (result.success) {
//           toast?.success("Metrics updated successfully");
//         } else {
//           toast?.error(result.error || "Failed to sync metrics");
//         }
//       } catch (error) {
//         toast?.error("An unexpected error occurred");
//       }
//     });
//   };

//   return (
//     <Card className="flex flex-col h-full overflow-hidden border-border/60 shadow-sm hover:shadow-md transition-all duration-200 group bg-card">
      
//       {/* 1. Header: Creator & Date & Sync Button */}
//       <CardHeader className="p-3 px-4 flex flex-row items-center justify-between space-y-0 bg-card border-b border-border/40">
//         <div className="flex items-center gap-3 overflow-hidden">
//           <Avatar className="h-8 w-8 border ring-1 ring-background">
//             <AvatarImage src={submission.creator?.profile_image_url} />
//             <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
//               {submission.creator?.display_name?.substring(0, 2).toUpperCase()}
//             </AvatarFallback>
//           </Avatar>
//           <div className="min-w-0">
//             <p className="text-sm font-semibold text-foreground truncate">
//               {submission.creator?.display_name}
//             </p>
//             <p className="text-[10px] text-muted-foreground truncate">
//               {format(new Date(submission.submitted_at), "MMM d, yyyy")}
//             </p>
//           </div>
//         </div>
        
//         <div className="flex items-center gap-2">
//             {/* Sync Button */}
//             <Button 
//               variant="ghost" 
//               size="icon" 
//               className="h-7 w-7 text-muted-foreground hover:text-primary transition-colors"
//               onClick={handleSync}
//               disabled={isPending}
//               title="Sync latest metrics"
//             >
//               <RefreshCcw className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} />
//             </Button>

//             <Badge variant="outline" className="capitalize text-[10px] h-5 px-2 bg-muted/30 font-normal border-border/60">
//             {submission.type.replace("instagram_", "")}
//             </Badge>
//         </div>
//       </CardHeader>

//       {/* 2. The Real Preview (Iframe) */}
//       <div className="relative w-full h-[450px] bg-muted/10">
//         <div className="absolute bottom-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
//            <Button size="sm" className="shadow-lg bg-white text-black hover:bg-white/90 h-8 text-xs font-medium gap-2" asChild>
//              <Link href={submission.url} target="_blank">
//                <Instagram className="h-3 w-3" /> Open App
//              </Link>
//            </Button>
//         </div>

//         <div className="w-full h-full overflow-y-auto no-scrollbar rounded-none">
//             <iframe 
//             className="w-full h-full min-h-[450px] border-0"
//             src={embedUrl}
//             // @ts-ignore
//             allowtransparency="true"
//             allow="encrypted-media"
//             title={`Instagram post by ${submission.creator?.display_name}`}
//             />
//         </div>
//       </div>

//       <Separator className="bg-border/60" />

//       {/* 3. Footer: Campaign Context & Metrics */}
//       <CardContent className="p-0 flex flex-col bg-card">
        
//         <div className="px-4 py-3 border-b border-border/40 bg-muted/5">
//            <div className="flex items-center justify-between gap-4">
//               <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider shrink-0">Campaign</span>
//               <span className="text-xs font-medium text-foreground truncate text-right">
//                 {submission.collaboration?.title}
//               </span>
//            </div>
//         </div>

//         <div className="grid grid-cols-3 divide-x divide-border/40">
          
//           {/* Likes */}
//           <div className="flex flex-col items-center justify-center p-3 hover:bg-muted/20 transition-colors">
//             <div className="flex items-center gap-1.5 mb-1 text-rose-500">
//               <Heart className={`h-4 w-4 ${likes > 0 ? "fill-current" : ""}`} />
//             </div>
//             <span className="text-sm font-bold text-foreground leading-none">
//               {formatMetric(likes)}
//             </span>
//             <span className="text-[9px] uppercase font-medium text-muted-foreground mt-1">Likes</span>
//           </div>

//           {/* Comments */}
//           <div className="flex flex-col items-center justify-center p-3 hover:bg-muted/20 transition-colors">
//             <div className="flex items-center gap-1.5 mb-1 text-blue-500">
//               <MessageCircle className="h-4 w-4" />
//             </div>
//             <span className="text-sm font-bold text-foreground leading-none">
//               {formatMetric(comments)}
//             </span>
//             <span className="text-[9px] uppercase font-medium text-muted-foreground mt-1">Comments</span>
//           </div>

//           {/* Reach/Views */}
//           <div className="flex flex-col items-center justify-center p-3 hover:bg-muted/20 transition-colors">
//             <div className="flex items-center gap-1.5 mb-1 text-emerald-500">
//               <Eye className="h-4 w-4" />
//             </div>
//             <span className="text-sm font-bold text-foreground leading-none">
//               {formatMetric(reach)}
//             </span>
//             <span className="text-[9px] uppercase font-medium text-muted-foreground mt-1">Reach</span>
//           </div>

//         </div>
//       </CardContent>
      
//       <style jsx global>{`
//         .no-scrollbar::-webkit-scrollbar {
//           display: none;
//         }
//         .no-scrollbar {
//           -ms-overflow-style: none;
//           scrollbar-width: none;
//         }
//       `}</style>
//     </Card>
//   );
// }

"use client";

import { useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { 
  Heart, 
  MessageCircle, 
  Eye, 
  Instagram,
  RefreshCcw,
  Video,
  FileImage,
  ExternalLink
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { syncSubmissionMetrics } from "@/app/actions/sync-metrics";
import { toast } from "sonner";

const getEmbedUrl = (url: string) => {
  try {
    const urlObj = new URL(url);
    const cleanPath = urlObj.pathname.endsWith('/') ? urlObj.pathname : `${urlObj.pathname}/`;
    return `${urlObj.origin}${cleanPath}embed/captioned/`; 
  } catch (e) {
    return url;
  }
};

const formatMetric = (num: number) => {
  if (num === undefined || num === null) return "0";
  return new Intl.NumberFormat('en-US', {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(num);
};

export function InstagramCard({ submission }: { submission: any }) {
  const [isPending, startTransition] = useTransition();

  const likes = submission.likes_count || 0;
  const comments = submission.comments_count || 0;
  const reach = submission.reach_count || 0; 

  // --- Logic for handling Supabase vs Instagram ---
  const isInstagram = submission.url?.includes("instagram.com");
  
  // Detect if the direct file is a video or image based on extension or type
  const isVideoFile = submission.url?.match(/\.(mp4|webm|ogg|mov)$/i) || submission.type?.includes("video") || submission.type === 'reel';
  
  const embedUrl = getEmbedUrl(submission.url);

  const handleSync = () => {
    if (!isInstagram) return;
    startTransition(async () => {
      try {
        const result = await syncSubmissionMetrics(submission.id, submission.url);
        if (result.success) {
          toast?.success("Metrics updated successfully");
        } else {
          toast?.error(result.error || "Failed to sync metrics");
        }
      } catch (error) {
        toast?.error("An unexpected error occurred");
      }
    });
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden border-border/60 shadow-sm hover:shadow-md transition-all duration-200 group bg-card">
      
      {/* 1. Header */}
      <CardHeader className="p-3 px-4 flex flex-row items-center justify-between space-y-0 bg-card border-b border-border/40">
        <div className="flex items-center gap-3 overflow-hidden">
          <Avatar className="h-8 w-8 border ring-1 ring-background">
            <AvatarImage src={submission.creator?.profile_image_url} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
              {submission.creator?.display_name?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {submission.creator?.display_name}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              {format(new Date(submission.submitted_at), "MMM d, yyyy")}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
            {/* Only show Sync Button for Instagram links */}
            {isInstagram && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-muted-foreground hover:text-primary transition-colors"
                onClick={handleSync}
                disabled={isPending}
                title="Sync latest metrics"
              >
                <RefreshCcw className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} />
              </Button>
            )}

            <Badge variant="outline" className="capitalize text-[10px] h-5 px-2 bg-muted/30 font-normal border-border/60">
              {submission.type.replace("instagram_", "")}
            </Badge>
        </div>
      </CardHeader>

      {/* 2. Media Preview Section */}
      <div className="relative w-full h-[450px] bg-muted/10 flex items-center justify-center">
        <div className="absolute bottom-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
           <Button size="sm" className="shadow-lg bg-white text-black hover:bg-white/90 h-8 text-xs font-medium gap-2" asChild>
             <Link href={submission.url} target="_blank">
               {isInstagram ? <Instagram className="h-3 w-3" /> : <ExternalLink className="h-3 w-3" />} Open
             </Link>
           </Button>
        </div>

        {isInstagram ? (
          /* INSTAGRAM IFRAME */
          <div className="w-full h-full overflow-y-auto no-scrollbar rounded-none">
              <iframe 
                className="w-full h-full min-h-[450px] border-0"
                src={embedUrl}
                // @ts-ignore
                allowtransparency="true"
                allow="encrypted-media"
                title={`Instagram post by ${submission.creator?.display_name}`}
              />
          </div>
        ) : isVideoFile ? (
          /* SUPABASE VIDEO PLAYER */
          <video 
            src={submission.url} 
            controls 
            className="w-full h-full object-contain bg-black"
          />
        ) : (
          /* SUPABASE IMAGE VIEWER */
          <img 
            src={submission.url} 
            alt="Deliverable" 
            className="w-full h-full object-contain bg-muted/5" 
          />
        )}
      </div>

      <Separator className="bg-border/60" />

      {/* 3. Footer */}
      <CardContent className="p-0 flex flex-col bg-card flex-1">
        
        <div className="px-4 py-3 border-b border-border/40 bg-muted/5">
           <div className="flex items-center justify-between gap-4">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider shrink-0">Campaign</span>
              <span className="text-xs font-medium text-foreground truncate text-right">
                {submission.collaboration?.title}
              </span>
           </div>
        </div>

        {/* Metrics Logic: Only show for Instagram content */}
        {isInstagram ? (
          <div className="grid grid-cols-3 divide-x divide-border/40">
            <div className="flex flex-col items-center justify-center p-3 hover:bg-muted/20 transition-colors">
              <div className="flex items-center gap-1.5 mb-1 text-rose-500">
                <Heart className={`h-4 w-4 ${likes > 0 ? "fill-current" : ""}`} />
              </div>
              <span className="text-sm font-bold text-foreground leading-none">{formatMetric(likes)}</span>
              <span className="text-[9px] uppercase font-medium text-muted-foreground mt-1">Likes</span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 hover:bg-muted/20 transition-colors">
              <div className="flex items-center gap-1.5 mb-1 text-blue-500">
                <MessageCircle className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold text-foreground leading-none">{formatMetric(comments)}</span>
              <span className="text-[9px] uppercase font-medium text-muted-foreground mt-1">Comments</span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 hover:bg-muted/20 transition-colors">
              <div className="flex items-center gap-1.5 mb-1 text-emerald-500">
                <Eye className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold text-foreground leading-none">{formatMetric(reach)}</span>
              <span className="text-[9px] uppercase font-medium text-muted-foreground mt-1">Reach</span>
            </div>
          </div>
        ) : (
          /* Placeholder for non-instagram data to maintain card height/layout */
          <div className="flex-1 flex items-center justify-center p-6 bg-muted/5">
            <div className="flex flex-col items-center gap-2 opacity-40">
              {isVideoFile ? <Video className="h-5 w-5" /> : <FileImage className="h-5 w-5" />}
              <span className="text-[10px] font-bold uppercase tracking-widest">Deliverable Provided</span>
            </div>
          </div>
        )}
      </CardContent>
      
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </Card>
  );
}