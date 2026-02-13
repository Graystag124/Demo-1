// // "use client";
// import { createClient } from "@/lib/supabase/server";
// import { redirect } from 'next/navigation';
// import { ContentLibrary } from "@/components/business/content-library";
// import { AlertCircle } from "lucide-react";

// export default async function ContentLibraryPage() {
//   const supabase = await createClient();

//   // 1. Auth Check
//   const { data: { user } } = await supabase.auth.getUser();
//   if (!user) redirect("/auth/login");

//   // 2. Fetch Approved Submissions
//   // We join:
//   // - collaboration (to filter by business_id and get Title)
//   // - creator (to get Name/Avatar)
//   const { data: submissions, error } = await supabase
//     .from("collaboration_submissions")
//     .select(`
//       *,
//       collaboration:collaborations!inner(id, title, business_id),
//       creator:users!creator_id(display_name, profile_image_url, email)
//     `)
//     .eq("collaboration.business_id", user.id) // Filter by logged-in business
//     .eq("status", "approved") // Only approved content
//     .order("submitted_at", { ascending: false });

//   if (error) {
//     console.error("Error fetching content:", error);
//     return (
//       <div className="p-8 text-center text-red-500 flex flex-col items-center gap-2">
//         <AlertCircle className="h-6 w-6" />
//         <p>Failed to load content library. Please try again later.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto py-8 space-y-8">
//       <div>
//         <h1 className="text-3xl font-bold">Content Library</h1>
//         <p className="text-muted-foreground mt-1">
//           View and manage approved content deliverables from your influencers.
//         </p>
//       </div>

//       <ContentLibrary data={submissions || []} />
//     </div>
//   );
// }


import { createClient } from "@/lib/supabase/server";
import { redirect } from 'next/navigation';
import { AlertCircle } from "lucide-react";
import { ContentLibrary } from "@/components/business/content-library";

export default async function ContentLibraryPage() {
  const supabase = await createClient();

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // 2. Fetch Submissions + Collaboration + Assignment Status
  // We use !inner on collaborations to filter by business_id
  const { data: rawSubmissions, error } = await supabase
    .from("collaboration_submissions")
    .select(`
      *,
      collaboration:collaborations!inner(
        id, 
        title, 
        business_id,
        assignments:collaboration_assignments(
          status,
          creator_id
        )
      ),
      creator:users!creator_id(
        display_name, 
        profile_image_url
      )
    `)
    .eq("collaboration.business_id", user.id)
    .eq("status", "approved") // Submission must be approved
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("Content Library Query Error:", error);
    return (
      <div className="p-8 text-center text-red-500">
        <AlertCircle className="mx-auto h-6 w-6 mb-2" />
        <p>Failed to load library: {error.message}</p>
      </div>
    );
  }

  // 3. Filter Logic: Only show content where the CREATOR'S assignment is 'completed'
  const submissions = rawSubmissions?.filter(sub => {
    const collab = sub.collaboration as any;
    // Find the specific assignment for the creator of this submission
    const creatorAssignment = collab.assignments?.find(
      (asn: any) => asn.creator_id === sub.creator_id
    );
    // Only return if that specific creator is marked as 'completed'
    return creatorAssignment?.status?.toLowerCase() === 'completed';
  }) || [];

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Content Library</h1>
        <p className="text-muted-foreground mt-1">
          Assets from your successfully completed influencer assignments.
        </p>
      </div>

      <ContentLibrary data={submissions} />
    </div>
  );
}