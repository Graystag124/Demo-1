// // app/creator-dashboard/collabs/[id]/page.tsx

// import { DashboardPageHeader } from "@/components/navigation/dashboard-page-header";
// import { createClient } from "@/lib/supabase/server";
// import { redirect } from "next/navigation";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
// } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";

// interface Collaboration {
//   id: string;
//   business_id: string;
//   title: string;
//   description: string | null;
//   requirements: string | null;
//   compensation: string | null;
//   category: string | null;
//   collaboration_type: 'paid' | 'barter';
//   approval_status: "pending" | "approved" | "rejected";
//   deadline: string | null;
//   business: {
//     display_name: string | null;
//     instagram_handle: string | null;
//   } | null;
// }

// interface PageProps {
//   params: Promise<{ id: string }>;
// }

// export default async function CreatorCollabDetailPage({ params }: PageProps) {
//   const { id } = await params;
//   const supabase = await createClient();
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (!user) {
//     redirect("/auth/login");
//   }

//   const { data: collab, error } = await supabase
//     .from("collaborations")
//     .select(`
//       *,
//       business:users!collaborations_business_id_fkey (
//         display_name,
//         instagram_handle
//       )
//     `)
//     .eq("id", id)
//     .single<Collaboration>();

//   if (error || !collab) {
//     return (
//       <div className="container mx-auto p-6 max-w-3xl">
//         <DashboardPageHeader
//             title="Collaboration Not Found"
//             showBackButton={true}
//         />
//         <p className="text-sm text-destructive">
//           {error ? "Error loading collaboration details." : "Collaboration not found."}
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto p-6 max-w-3xl space-y-6">
//       <DashboardPageHeader
//         title="Collaboration Details"
//         showBackButton={true}
//       />

//       <Card>
//         <CardHeader>
//           <div className="flex items-start justify-between gap-4">
//             <div>
//               <CardTitle className="text-2xl font-bold">{collab.title}</CardTitle>
//                 <CardDescription className="mt-1">
//                     By: {collab.business?.display_name || collab.business?.instagram_handle || 'A Business'}
//                 </CardDescription>
//             </div>
//             {collab.category && (
//                 <Badge variant="secondary">{collab.category}</Badge>
//             )}
//           </div>
//         </CardHeader>

//         <CardContent className="space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//             {collab.deadline && (
//               <div className="flex flex-col">
//                 <span className="text-muted-foreground font-medium">Application Deadline</span>
//                 <span>{new Date(collab.deadline).toLocaleDateString()}</span>
//               </div>
//             )}
//             <div className="flex flex-col">
//               <span className="text-muted-foreground font-medium">
//                 {collab.collaboration_type === 'paid' ? 'Compensation' : 'Barter Details'}
//               </span>
//               <span>{collab.compensation}</span>
//             </div>
//           </div>

//           {collab.description && (
//             <div>
//               <h3 className="font-semibold mb-2">Description</h3>
//               <p className="text-sm text-muted-foreground whitespace-pre-line">
//                 {collab.description}
//               </p>
//             </div>
//           )}

//           {collab.requirements && (
//             <div>
//               <h3 className="font-semibold mb-2">Requirements</h3>
//               <p className="text-sm text-muted-foreground whitespace-pre-line">
//                 {collab.requirements}
//               </p>
//             </div>
//           )}

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

  if (error) console.error("Error fetching collaboration:", error);
  if (!collab) notFound();

  const { data: existingApplication } = await supabase
    .from("collaboration_applications")
    .select("id")
    .eq("collaboration_id", id)
    .eq("creator_id", user.id)
    .maybeSingle();

  const hasApplied = !!existingApplication;
  const status: string = collab.approval_status || "pending";
  const availableDates: string[] = Array.isArray(collab.dates) ? collab.dates : [];

  let reqs: any = null;
  try {
    reqs = typeof collab.requirements === 'string' ? JSON.parse(collab.requirements) : collab.requirements;
  } catch (e) {
    reqs = null;
  }

  const hasOther = reqs?.other && 
    !["none", "none as of now", ""].includes(reqs.other.toLowerCase().trim());

  return (
    // FIX: overflow-x-hidden and w-full ensures the page cannot scroll horizontally
    <div className="w-full max-w-full overflow-x-hidden mx-auto px-4 py-6 md:p-6 lg:max-w-3xl">
      <div className="mb-4">
        <Link href="/creator-dashboard">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to Dashboard</span>
          </Button>
        </Link>
      </div>

      <Card className="w-full overflow-hidden border-none sm:border shadow-none sm:shadow-sm">
        <CardHeader className="px-0 sm:px-6">
          <div className="flex flex-col gap-4">
            {/* Header: Business & Status */}
            <div className="flex items-center justify-between w-full">
              {collab.business && (
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar className="h-8 w-8 border shrink-0">
                    <AvatarImage src={collab.business.profile_image_url || undefined} />
                    <AvatarFallback className="text-xs bg-emerald-50 text-emerald-700">
                      {(collab.business.display_name?.[0] || "B").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Link
                    href={`/creator-dashboard/business/${collab.business_id}`}
                    className="text-sm font-semibold hover:underline truncate"
                  >
                    {collab.business.display_name || collab.business.instagram_handle}
                  </Link>
                </div>
              )}
              {/* Emerald status badge matched to Image 2 */}
              <Badge variant="secondary" className="capitalize text-[10px] font-bold bg-emerald-100 text-emerald-700 border-none px-3 py-1 shrink-0">
                {status}
              </Badge>
            </div>

            {/* Title & Technical ID */}
            <div className="space-y-1 min-w-0">
              <CardTitle className="text-2xl font-extrabold tracking-tight leading-tight break-words [overflow-wrap:anywhere]">
                {collab.title}
              </CardTitle>
              {collab.category && (
                <CardDescription className="text-emerald-600 font-medium">
                  {collab.category}
                </CardDescription>
              )}
              {/* FIX: break-all forces the technical ID to wrap even if it has no hyphens or spaces */}
              <p className="text-[10px] text-muted-foreground font-mono mt-2 break-all [overflow-wrap:anywhere] opacity-40 leading-relaxed">
                {id}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-0 sm:px-6 space-y-8 mt-4 w-full overflow-hidden">
          {/* Description Section */}
          {collab.description && (
            <div className="space-y-2">
              <p className="text-sm text-slate-600 whitespace-pre-wrap break-all [overflow-wrap:anywhere] leading-relaxed">
                {collab.description}
              </p>
            </div>
          )}

          {/* Compensation Section */}
          {collab.compensation && (
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Compensation</h3>
              <p className="text-base font-semibold text-slate-900 break-words">
                {collab.compensation}
              </p>
            </div>
          )}

          {/* Requirements Section - Icons Matched to Image 2 */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Requirements</h3>
            
            {reqs && typeof reqs === 'object' ? (
              <div className="space-y-5">
                <div className="flex flex-col gap-3">
                  {reqs.reels > 0 && (
                    <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                      <Video className="h-5 w-5 text-blue-500 shrink-0" />
                      <span>{reqs.reels} Reels</span>
                    </div>
                  )}
                  {reqs.stories > 0 && (
                    <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                      <BookOpen className="h-5 w-5 text-pink-500 shrink-0" />
                      <span>{reqs.stories} Stories</span>
                    </div>
                  )}
                  {reqs.posts > 0 && (
                    <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                      <ImageIcon className="h-5 w-5 text-purple-500 shrink-0" />
                      <span>{reqs.posts} Posts</span>
                    </div>
                  )}
                </div>

                {hasOther && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-start gap-2">
                      <PlusCircle className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                      <div className="space-y-1 min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Additional Notes</p>
                        <p className="text-sm text-slate-500 leading-relaxed italic break-all [overflow-wrap:anywhere]">
                          {reqs.other}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-600 whitespace-pre-wrap break-all [overflow-wrap:anywhere]">
                {collab.requirements}
              </p>
            )}
          </div>

          <div className="pt-6 border-t w-full">
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