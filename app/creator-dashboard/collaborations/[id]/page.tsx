// import { createClient } from "@/lib/supabase/server";
// import { redirect, notFound } from "next/navigation";
// import Link from "next/link";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { ArrowLeft } from "lucide-react";
// // Import the new form component
// import { ApplicationForm } from "@/components/collaborations/application-form";

// interface PageProps {
//   params: Promise<{ id: string }>;
// }

// export default async function PublicCollabDetail({ params }: PageProps) {
//   const { id } = await params;

//   const supabase = await createClient();
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (!user) {
//     redirect("/auth/login");
//   }

//   // 1. Fetch Collaboration details INCLUDING 'dates'
//   const { data: collab, error } = await supabase
//     .from("collaborations")
//     .select(
//       `
//       *,
//       business:users!collaborations_business_id_fkey(
//         display_name,
//         instagram_handle,
//         profile_image_url
//       )
//     `
//     )
//     .eq("id", id)
//     .maybeSingle();

//   if (error) {
//     console.error("Error fetching collaboration:", error);
//   }

//   if (!collab) {
//     notFound();
//   }

//   // 2. Check if the current user has already applied
//   const { data: existingApplication } = await supabase
//     .from("collaboration_applications")
//     .select("id")
//     .eq("collaboration_id", id)
//     .eq("creator_id", user.id)
//     .maybeSingle();

//   const hasApplied = !!existingApplication;
//   const status: string = collab.approval_status || "pending";
//   // Ensure dates is an array of strings
//   const availableDates: string[] = Array.isArray(collab.dates) ? collab.dates : [];

//   return (
//     <div className="container mx-auto p-6 max-w-3xl">
//       <div className="mb-4">
//         <Link href="/creator-dashboard">
//           <Button variant="ghost" size="icon" className="rounded-full">
//             <ArrowLeft className="h-5 w-5" />
//             <span className="sr-only">Back to Dashboard</span>
//           </Button>
//         </Link>
//       </div>

//       <Card>
//         <CardHeader className="pt-6">
//           <div className="flex items-start justify-between gap-4">
//             <div>
//               {collab.business && (
//                 <div className="flex items-center gap-2">
//                   <Avatar className="h-7 w-7">
//                     <AvatarImage src={collab.business.profile_image_url || undefined} />
//                     <AvatarFallback>
//                       {(collab.business.display_name?.[0] || collab.business.instagram_handle?.[0] || "B").toUpperCase()}
//                     </AvatarFallback>
//                   </Avatar>
//                   <Link
//                     href={`/creator-dashboard/business/${collab.business_id}`}
//                     className="text-sm font-medium hover:underline"
//                   >
//                     {collab.business.display_name || collab.business.instagram_handle}
//                   </Link>
//                 </div>
//               )}
//               <CardTitle className="text-2xl font-bold mt-1">
//                 {collab.title}
//               </CardTitle>
//               {collab.category && (
//                 <CardDescription>{collab.category}</CardDescription>
//               )}
//             </div>
//             <Badge className="capitalize">{status}</Badge>
//           </div>
//         </CardHeader>

//         <CardContent className="space-y-4">
//           {collab.description && (
//             <p className="text-sm text-muted-foreground whitespace-pre-line">
//               {collab.description}
//             </p>
//           )}

//           {collab.compensation && (
//             <p className="text-sm text-muted-foreground">
//               <strong>Compensation:</strong> {collab.compensation}
//             </p>
//           )}

//           {collab.requirements && (
//             <div>
//               <h3 className="text-base font-semibold mb-1">Requirements</h3>
//               <p className="text-sm text-muted-foreground whitespace-pre-line">
//                 {collab.requirements}
//               </p>
//             </div>
//           )}

//           <div className="border-t pt-4 mt-4">
//             {/* 3. Pass data to the new Client Component */}
//             <ApplicationForm 
//               collaborationId={collab.id} 
//               availableDates={availableDates}
//               hasApplied={hasApplied}
//             />
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Video, BookOpen, Image as ImageIcon, PlusCircle } from "lucide-react";
// Import the new form component
import { ApplicationForm } from "@/components/collaborations/application-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicCollabDetail({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // 1. Fetch Collaboration details (Same as both)
  const { data: collab, error } = await supabase
    .from("collaborations")
    .select(
      `
      *,
      business:users!collaborations_business_id_fkey(
        display_name,
        instagram_handle,
        profile_image_url
      )
    `
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching collaboration:", error);
  }

  if (!collab) {
    notFound();
  }

  // 2. Check if the current user has already applied (Same as both)
  const { data: existingApplication } = await supabase
    .from("collaboration_applications")
    .select("id")
    .eq("collaboration_id", id)
    .eq("creator_id", user.id)
    .maybeSingle();

  const hasApplied = !!existingApplication;
  const status: string = collab.approval_status || "pending";
  const availableDates: string[] = Array.isArray(collab.dates) ? collab.dates : [];

  // Parse Requirements JSON (From uncommented logic)
  let reqs: any = null;
  try {
    reqs = typeof collab.requirements === 'string' ? JSON.parse(collab.requirements) : collab.requirements;
  } catch (e) {
    reqs = null;
  }

  // Logic to check if 'other' has actual content (From uncommented logic)
  const hasOther = reqs?.other && 
    reqs.other.toLowerCase() !== "none" && 
    reqs.other.toLowerCase() !== "none as of now" &&
    reqs.other.trim() !== "";

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="mb-4">
        <Link href="/creator-dashboard">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to Dashboard</span>
          </Button>
        </Link>
      </div>

      <Card className="overflow-hidden">
        {/* Cover Image */}
        {collab.cover_image_url && (
          <div className="w-full h-48 bg-gray-100 overflow-hidden">
            <img 
              src={`${collab.cover_image_url}?t=${new Date().getTime()}`} 
              alt={`Cover for ${collab.title}`}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardHeader className="px-2 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              {collab.business && (
                <div className="flex items-center gap-2 mb-1">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={collab.business.profile_image_url || undefined} />
                    <AvatarFallback className="text-[10px]">
                      {/* RESTORED: Multi-option fallback from commented code */}
                      {(collab.business.display_name?.[0] || collab.business.instagram_handle?.[0] || "B").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {/* RESTORED: Business Link and display name from commented code */}
                  <Link
                    href={`/creator-dashboard/business/${collab.business_id}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {collab.business.display_name || collab.business.instagram_handle}
                  </Link>
                </div>
              )}
              <CardTitle className="text-xl font-bold break-words leading-tight">
                {collab.title}
              </CardTitle>
              {/* RESTORED: Category description from commented code */}
              {collab.category && (
                <CardDescription>{collab.category}</CardDescription>
              )}
              {/* KEPT: ID label from uncommented code */}
              <p className="text-[10px] text-muted-foreground font-mono mt-1 opacity-50 break-all">
                {id}
              </p>
            </div>
            <Badge className="capitalize text-[10px] shrink-0">{status}</Badge>
          </div>
        </CardHeader>

        <CardContent className="px-2 sm:px-6 space-y-6">
          {collab.description && (
            <p className="text-sm text-muted-foreground whitespace-pre-line break-all leading-relaxed">
              {collab.description}
            </p>
          )}

          {collab.compensation && (
            <p className="text-sm text-muted-foreground">
              {/* RESTORED: Strong tag style from commented code */}
              <strong>Compensation:</strong> {collab.compensation}
            </p>
          )}

          {/* REQUIREMENTS SECTION - MOBILE OPTIMIZED ICONS */}
          {collab.requirements && (
            <div className="space-y-3">
              <h3 className="text-base font-semibold mb-1">Requirements</h3>
              
              {reqs && typeof reqs === 'object' ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-x-4 gap-y-3">
                    {reqs.reels > 0 && (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Video className="h-4 w-4 text-blue-500 shrink-0" />
                        <span className="whitespace-nowrap">{reqs.reels} Reels</span>
                      </div>
                    )}
                    {reqs.stories > 0 && (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <BookOpen className="h-4 w-4 text-pink-500 shrink-0" />
                        <span className="whitespace-nowrap">{reqs.stories} Stories</span>
                      </div>
                    )}
                    {reqs.posts > 0 && (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <ImageIcon className="h-4 w-4 text-purple-500 shrink-0" />
                        <span className="whitespace-nowrap">{reqs.posts} Posts</span>
                      </div>
                    )}
                  </div>

                  {hasOther && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-muted/20">
                      <PlusCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Additional Notes</p>
                        <p className="text-xs text-muted-foreground leading-snug break-words italic">
                          {reqs.other}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground whitespace-pre-line break-words">
                  {collab.requirements}
                </p>
              )}
            </div>
          )}

          <div className="border-t pt-4 mt-4">
            <ApplicationForm 
              collaborationId={collab.id} 
              availableDates={availableDates}
              hasApplied={hasApplied}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}