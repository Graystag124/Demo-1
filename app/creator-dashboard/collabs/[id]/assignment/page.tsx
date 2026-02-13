import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardPageHeader } from "@/components/navigation/dashboard-page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getStatusVariant, getStatusLabel } from "@/lib/status";
import { SubmissionForm } from "./submission-form";
import { AssignmentStatusActions } from "@/components/assignments/assignment-status-actions";

// Types
type Assignment = {
  id?: string;
  collaboration_id: string;
  creator_id: string;
  posts_required: number;
  stories_required: number;
  reels_required: number;
  notes?: string | null;
  status: "assigned" | "in_progress" | "completed" | "paused" | "completed_awaited_approval";
};

type Submission = {
  id: string;
  type: "post" | "story" | "reel";
  url: string;
  caption: string | null;
  status: "submitted" | "approved" | "rejected";
  submitted_at: string;
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CreatorAssignmentPage({ params }: PageProps) {
  const supabase = await createClient();
  const { id: collaboration_id } = await params;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const creator_id = user.id;

  // 1. Fetch Data in Parallel
  const [
    { data: assignment },
    { data: submissions },
    { data: collaboration },
    { data: userProfile }
  ] = await Promise.all([
    supabase.from("collaboration_assignments").select("*").eq("collaboration_id", collaboration_id).eq("creator_id", creator_id).maybeSingle(),
    supabase.from("collaboration_submissions").select("*").eq("collaboration_id", collaboration_id).eq("creator_id", creator_id).order("submitted_at", { ascending: false }),
    supabase.from("collaborations").select("title, business_id, approval_status, cover_image_url").eq("id", collaboration_id).single(),
    supabase.from("users").select("display_name, profile_image_url").eq("id", creator_id).maybeSingle()
  ]);

  // 2. Handle Assignment Logic
  let effectiveAssignment: Assignment | null = (assignment as Assignment) || null;
  
  if (!effectiveAssignment) {
    const { data: app } = await supabase.from('collaboration_applications').select('status').eq('collaboration_id', collaboration_id).eq('creator_id', creator_id).maybeSingle();
    
    if (!app && collaboration?.approval_status !== 'approved') {
      return (
        <div className="container mx-auto p-6 max-w-3xl space-y-6">
          <DashboardPageHeader title="Assignment Not Found" showBackButton={true} />
          <p className="text-destructive">Assignment not found.</p>
        </div>
      );
    }

    effectiveAssignment = {
      collaboration_id,
      creator_id,
      posts_required: 0,
      stories_required: 0,
      reels_required: 0,
      status: 'assigned',
    };
  }

  // 3. Fetch Business Name
  let businessName: string | null = null;
  if (collaboration?.business_id) {
    const { data: biz } = await supabase.from('users').select('display_name').eq('id', collaboration.business_id).maybeSingle();
    businessName = (biz as any)?.display_name || null;
  }

  // Get existing submissions for each type
  const existingSubmissions = (submissions || []).map((sub: any) => ({
    ...sub,
    type: sub.type as 'post' | 'story' | 'reel'
  }));

  return (
    <div className="container mx-auto p-6 max-w-3xl space-y-6">
      <DashboardPageHeader
        title={`Assignment: ${collaboration?.title || 'Collaboration'}`}
        description="Manage your progress and submissions."
        showBackButton={true}
      />

      <Card className="overflow-hidden">
        {/* Cover Image */}
        {collaboration?.cover_image_url && (
          <div className="w-full h-40 bg-gray-100 overflow-hidden">
            <img 
              src={`${collaboration.cover_image_url}?t=${new Date().getTime()}`} 
              alt={`Cover for ${collaboration?.title || 'collaboration'}`}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border">
                  <AvatarImage src={(userProfile as any)?.profile_image_url || undefined} />
                  <AvatarFallback>{(userProfile as any)?.display_name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-lg">@{(userProfile as any)?.display_name || 'Creator'}</div>
                  <Badge variant={getStatusVariant(effectiveAssignment.status)}>{getStatusLabel(effectiveAssignment.status)}</Badge>
                </div>
              </div>
            </div>

            {/* Deliverables Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg text-center border">
                <div className="text-[10px] uppercase text-muted-foreground font-bold">Posts</div>
                <div className="text-xl font-bold">{effectiveAssignment.posts_required}</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center border">
                <div className="text-[10px] uppercase text-muted-foreground font-bold">Stories</div>
                <div className="text-xl font-bold">{effectiveAssignment.stories_required}</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center border">
                <div className="text-[10px] uppercase text-muted-foreground font-bold">Reels</div>
                <div className="text-xl font-bold">{effectiveAssignment.reels_required}</div>
              </div>
            </div>

            {/* STATUS ACTION BUTTONS */}
            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold mb-3">Workflow Actions</h4>
              <AssignmentStatusActions 
                collaborationId={collaboration_id}
                creatorId={creator_id}
                currentStatus={effectiveAssignment.status}
                assignmentId={effectiveAssignment.id}
              />
            </div>

            {/* DYNAMIC CONTENT BASED ON STATUS */}
            <div className="pt-6 border-t">
              {effectiveAssignment.status === 'in_progress' ? (
                <div>
                  <h4 className="font-bold mb-4 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    Submit New Deliverable
                  </h4>
                  <SubmissionForm 
                    collaborationId={collaboration_id} 
                    creatorId={creator_id}
                    postsRequired={effectiveAssignment.posts_required || 0}
                    storiesRequired={effectiveAssignment.stories_required || 0}
                    reelsRequired={effectiveAssignment.reels_required || 0}
                    existingSubmissions={existingSubmissions}
                  />
                </div>
              ) : effectiveAssignment.status === 'completed_awaited_approval' ? (
                <div className="bg-primary/5 border border-primary/20 p-6 rounded-xl text-center">
                  <p className="font-semibold text-primary">All work submitted!</p>
                  <p className="text-sm text-muted-foreground">The business is currently reviewing your submissions. You cannot submit new items while awaiting approval.</p>
                </div>
              ) : (
                <div className="bg-muted/20 border border-dashed p-8 rounded-xl text-center">
                  <p className="text-sm text-muted-foreground">
                    {effectiveAssignment.status === 'paused' 
                      ? "Assignment is currently paused." 
                      : "Please start the assignment to enable the submission form."}
                  </p>
                </div>
              )}
            </div>

            {/* Submission History */}
            <div className="pt-6 border-t">
              <h4 className="font-semibold mb-4">Submission History</h4>
              {submissions && submissions.length > 0 ? (
                <div className="space-y-3">
                  {submissions.map((sub: Submission) => (
                    <div key={sub.id} className="p-3 border rounded-lg flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-xs font-bold uppercase text-muted-foreground">{sub.type}</div>
                        <a href={sub.url} target="_blank" className="text-sm text-primary hover:underline truncate block">
                          View Submission link
                        </a>
                      </div>
                      <Badge variant={getStatusVariant(sub.status)}>{getStatusLabel(sub.status)}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No deliverables submitted yet.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}