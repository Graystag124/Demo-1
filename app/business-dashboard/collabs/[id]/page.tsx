import { DashboardPageHeader } from "@/components/navigation/dashboard-page-header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { 
  CalendarDays, 
  Wallet, 
  Tag, 
  Users, 
  FileText, 
  ClipboardCheck, 
  ChevronRight,
  Instagram
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getStatusVariant, getStatusLabel } from "@/lib/status";
import { ClickableApplicationCard, stopClick } from "@/components/collaborations/clickable-application-card";
import { EditCollaborationButton } from "@/components/collaborations/edit-collaboration-button";

interface CollaborationApplicationCreator {
  id: string;
  display_name: string | null;
  instagram_handle: string | null;
  profile_image_url: string | null;
}

interface CollaborationApplication {
  id: string;
  creator_id: string;
  message: string | null;
  portfolio_link: string | null;
  approval_status: string;
  status: string;
  created_at: string;
  creator: CollaborationApplicationCreator | null;
  assignments: any[];
}

interface Collaboration {
  id: string;
  title: string;
  description: string | null;
  requirements: string | null;
  category: string | null;
  collaboration_type: 'paid' | 'barter';
  approval_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  deadline: string | null;
  budget_range: string | null;
  cover_image_url?: string | null;
  location?: string | null;
}

interface PageProps {
  params: { id: string };
}

export default async function BusinessCollabDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: collab } = await supabase
    .from("collaborations")
    .select('*')
    .eq("id", id)
    .single<Collaboration>();
  if (!collab) return <div className="p-6 text-center">Collaboration not found.</div>;

  const [appsRes, assignsRes] = await Promise.all([
    supabase.from("collaboration_applications").select(`
      id, creator_id, message, approval_status, status, created_at,
      creator:users!collaboration_applications_creator_id_fkey (id, display_name, instagram_handle, profile_image_url)
    `).eq("collaboration_id", id),
    supabase.from("collaboration_assignments").select('*').eq("collaboration_id", id)
  ]);

  const applications = appsRes.data?.map(app => ({
    ...app,
    assignments: assignsRes.data?.filter(a => a.creator_id === app.creator_id) || []
  })) || [];

  const collabStatus = collab.approval_status || "pending";

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-4xl space-y-6 sm:space-y-8">
      {/* Cover Image */}
      {collab.cover_image_url && (
        <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden shadow-md">
          <img
            src={`${collab.cover_image_url}?t=${new Date().getTime()}`}
            alt={`Cover for ${collab.title}`}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      {/* Header Area */}
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="text-xl sm:text-2xl font-bold">
              <DashboardPageHeader title={collab.title} showBackButton={true} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge 
              variant={collabStatus === "approved" ? "secondary" : "outline"} 
              className="px-2.5 py-0.5 text-xs sm:text-sm h-6"
            >
              {collabStatus.toUpperCase()}
            </Badge>
            <span className="text-xs sm:text-sm text-muted-foreground">
              Created {new Date(collab.created_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>
        <div className="w-full sm:w-auto">
          <div className="w-full sm:w-auto">
            <EditCollaborationButton id={id} status={collabStatus} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Left Column: Details (2/3) */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          {/* Overview Section */}
          <section className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 text-base sm:text-lg font-semibold">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
              <h2>Overview</h2>
            </div>
            <div className="prose prose-sm max-w-none text-muted-foreground bg-muted/20 p-3 sm:p-4 rounded-lg sm:rounded-xl border">
              <p className="whitespace-pre-line leading-relaxed text-sm sm:text-[0.9375rem]">
                {collab.description || "No description provided."}
              </p>
            </div>
          </section>

          {/* Requirements Section */}
          <section className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 text-base sm:text-lg font-semibold">
              <ClipboardCheck className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
              <h2>Campaign Requirements</h2>
            </div>
            <div className="prose prose-sm max-w-none text-muted-foreground bg-muted/20 p-3 sm:p-4 rounded-lg sm:rounded-xl border">
              <p className="whitespace-pre-line leading-relaxed text-sm sm:text-[0.9375rem]">
                {collab.requirements || "No specific requirements listed."}
              </p>
            </div>
          </section>

          {/* Management Section */}
          <section className="space-y-4 pt-2 sm:pt-4">
            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
              <div className="flex items-center gap-2 text-base sm:text-lg font-semibold">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <h2>Creator Applications</h2>
                <Badge variant="outline" className="ml-1.5 h-5 px-1.5 py-0 text-xs">
                  {applications.length}
                </Badge>
              </div>

              {collabStatus === "approved" ? (
                <div className="space-y-3">
                  {applications.length === 0 ? (
                    <div className="text-center py-6 sm:py-8 bg-muted/20 rounded-lg border border-dashed">
                      <p className="text-sm sm:text-base text-muted-foreground">No applications received yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {applications.map((app) => {
                        const creatorName = app.creator?.display_name || 'Anonymous Creator';
                        const hasInstagram = !!app.creator?.instagram_handle;
                        
                        return (
                          <ClickableApplicationCard 
                            key={app.id} 
                            href={`/business-dashboard/collabs/${id}/applications/${app.id}`}
                            className="transition-all hover:shadow-sm"
                          >
                            <div className="flex items-center justify-between p-3 sm:p-4">
                              <div className="flex items-center gap-3 min-w-0">
                                <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border flex-shrink-0">
                                  <AvatarImage src={app.creator?.profile_image_url || ''} />
                                  <AvatarFallback className="bg-primary/5 text-primary text-sm">
                                    {creatorName[0]?.toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <p className="font-medium text-sm sm:text-base truncate">
                                    {creatorName}
                                  </p>
                                  <div className="flex items-center gap-1.5">
                                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                                      {new Date(app.created_at).toLocaleDateString(undefined, {
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </p>
                                    {app.approval_status === 'approved' && (
                                      <Badge 
                                        variant="outline" 
                                        className="h-4 px-1.5 text-[10px] border-green-200 bg-green-50 text-green-700"
                                      >
                                        Assigned
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 ml-2">
                                {hasInstagram && (
                                  <a 
                                    href={`https://instagram.com/${app.creator.instagram_handle}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    onClick={stopClick}
                                    className="p-1.5 rounded-full hover:bg-muted transition-colors flex-shrink-0"
                                    aria-label={`View ${app.creator.instagram_handle} on Instagram`}
                                  >
                                    <Instagram className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-foreground/60" />
                                  </a>
                                )}
                                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                              </div>
                            </div>
                          </ClickableApplicationCard>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 bg-yellow-50/50 border border-yellow-100 rounded-2xl text-center">
                  <p className="text-sm sm:text-base text-yellow-800">Applications will appear here once this collaboration is approved.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Key Stats (1/3) */}
        <div className="space-y-6">
          <Card className="shadow-sm border-none bg-gray-100 text-foreground overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Campaign Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <CalendarDays className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Deadline</p>
                  <p className="text-sm font-medium">{collab.deadline ? new Date(collab.deadline).toLocaleDateString() : "Flexible"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Tag className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Category</p>
                  <p className="text-sm font-medium capitalize">
                    {collab.category || "Not specified"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Helpful Tip */}
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-xs leading-relaxed text-primary/80">
              <strong>Tip:</strong> Click on a creator to view their profile, manage deliverables, and review their past performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}