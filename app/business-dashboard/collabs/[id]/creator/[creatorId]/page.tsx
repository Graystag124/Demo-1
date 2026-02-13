import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AssignmentManager } from "@/components/collaborations/assignment-manager";
import { getStatusVariant, getStatusLabel } from "@/lib/status";
import { LinkPreview } from "@/components/ui/link-preview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileVideo, ImageIcon, ExternalLink, MessageSquare, Instagram, FileText } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string; creatorId: string }>;
}

export default async function PerCreatorAssignmentPage({ params }: PageProps) {
  const { id, creatorId } = await params;
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // 1. Fetch Collaboration
  const { data: collab } = await supabase
    .from("collaborations")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!collab) notFound();

  // 2. Fetch Application
  const { data: app } = await supabase
    .from("collaboration_applications")
    .select(`*, creator:users!collaboration_applications_creator_id_fkey(*)`)
    .eq("collaboration_id", id)
    .eq("creator_id", creatorId)
    .maybeSingle();

  if (!app) notFound();

  // 3. Fetch Assignment
  const { data: assignment } = await supabase
    .from("collaboration_assignments")
    .select("*")
    .eq("collaboration_id", id)
    .eq("creator_id", creatorId)
    .limit(1)
    .maybeSingle();

  // 4. Fetch Submissions
  const { data: submissions } = await supabase
    .from('collaboration_submissions')
    .select('*')
    .eq('collaboration_id', id)
    .eq('creator_id', creatorId)
    .order('submitted_at', { ascending: false });

  // Helper to render the submission card
  const SubmissionCard = ({ s }: { s: any }) => (
    <div key={s.id} className="border rounded-xl p-5 bg-card shadow-sm mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          {s.url.includes('instagram') ? <Instagram className="w-4 h-4 text-pink-600"/> : 
           s.type === 'video' || s.url.endsWith('.mp4') ? <FileVideo className="w-4 h-4 text-blue-600"/> : 
           s.type === 'draft' ? <FileText className="w-4 h-4 text-orange-600"/> : <ImageIcon className="w-4 h-4 text-green-600"/>}
          <span className="font-medium capitalize">{s.type} Submission</span>
          <span className="text-xs text-muted-foreground">• {new Date(s.submitted_at).toLocaleDateString()}</span>
        </div>
        <Badge variant={getStatusVariant(s.status)}>{getStatusLabel(s.status)}</Badge>
      </div>
      
      <div className="bg-muted/10 rounded-lg overflow-hidden border">
        {s.url.includes('instagram.com') ? (
          <div className="max-w-md">
            <LinkPreview url={s.url} type="instagram" />
          </div>
        ) : s.type === 'video' || s.url.endsWith('.mp4') ? (
          <video controls className="w-full max-h-[400px] bg-black">
            <source src={s.url} />
          </video>
        ) : (
          <img src={s.url} alt="Submission" className="w-full max-h-[500px] object-contain bg-gray-50" />
        )}
      </div>
      
      {s.caption && (
        <div className="mt-4 p-3 bg-muted rounded text-sm text-muted-foreground flex gap-2 items-start">
          <MessageSquare className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold text-xs text-foreground uppercase block mb-1">Notes / Caption</span>
            {s.caption}
          </div>
        </div>
      )}
    </div>
  );

  const getSubmissionsByType = (type: string) => submissions?.filter(s => s.type === type) || [];

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <Card className="border-none shadow-none">
        <CardHeader className="px-0">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">{collab.title}</CardTitle>
              {collab.category && <CardDescription>{collab.category}</CardDescription>}
              <Link href={`/business-dashboard/collabs/${id}`} className="text-sm text-primary hover:underline flex items-center gap-1 mt-1">
                ← Back to Collaboration
              </Link>
            </div>
            <Badge variant="outline" className="capitalize">{(collab.approval_status as string) || "Pending"}</Badge>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          {/* Creator Header */}
          <div className="mb-6 p-4 bg-muted/30 rounded-lg border flex justify-between items-center">
             <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">Managing Creator</p>
                <div className="flex items-center gap-2">
                   <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden border-2 border-background shadow-sm">
                      <img 
                        src={(app.creator as any)?.profile_image_url || "/placeholder-avatar.jpg"} 
                        alt="Avatar" 
                        className="h-full w-full object-cover"
                      />
                   </div>
                   <div>
                    <Link href={`/business-dashboard/creator/${creatorId}`} className="font-semibold text-base hover:underline block">
                        {(app.creator as any)?.display_name || "Creator"}
                    </Link>
                    <span className="text-xs text-muted-foreground">@{(app.creator as any)?.instagram_handle?.replace(/^@+/, '')}</span>
                   </div>
                </div>
             </div>
             <div className="text-right">
                <p className="text-xs text-muted-foreground mb-1">Project Status</p>
                <Badge 
                  variant={assignment?.status === 'not_assigned' || !assignment ? 'outline' : 'secondary'} 
                  className="capitalize text-sm px-3 py-1"
                >
                  {assignment?.status?.replace('_', ' ') || 'Not Assigned'}
                </Badge>
             </div>
          </div>

          <AssignmentManager 
            collaborationId={id} 
            creatorId={creatorId} 
            initialAssignment={assignment} 
            submissions={submissions || []} 
          />

          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Deliverables Feed</h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    {submissions?.length || 0} Total Submissions
                </span>
            </div>

            <Tabs defaultValue="draft" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="draft" className="relative">
                    Drafts
                    {getSubmissionsByType('draft').some(s => s.status === 'submitted') && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full" />
                    )}
                </TabsTrigger>
                <TabsTrigger value="post">Posts</TabsTrigger>
                <TabsTrigger value="story">Stories</TabsTrigger>
                <TabsTrigger value="reel">Reels</TabsTrigger>
              </TabsList>

              {['draft', 'post', 'story', 'reel'].map((type) => (
                <TabsContent key={type} value={type} className="mt-0">
                  {getSubmissionsByType(type).length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed rounded-xl text-muted-foreground bg-muted/5">
                      <div className="flex justify-center mb-3">
                        {type === 'draft' ? <FileText className="w-8 h-8 opacity-20"/> : 
                         type === 'reel' ? <FileVideo className="w-8 h-8 opacity-20"/> : <ImageIcon className="w-8 h-8 opacity-20"/>}
                      </div>
                      <p className="text-sm">No {type} submissions found.</p>
                      {type === 'draft' && <p className="text-xs mt-1">Creator must submit drafts for your approval first.</p>}
                    </div>
                  ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                      {getSubmissionsByType(type).map((s) => (
                        <SubmissionCard key={s.id} s={s} />
                      ))}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}