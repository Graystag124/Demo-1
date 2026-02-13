import { createClient } from "@/lib/supabase/server";
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Heart, 
  MessageCircle, 
  Eye, 
  BarChart3, 
  ArrowLeft, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  Ban, 
  HelpCircle,
  User,
  Database
} from "lucide-react";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// --- Types ---
type ContentMetrics = {
  likes: number;
  comments: number;
  reach: number;
  status: 'live' | 'db_fallback' | 'not_found' | 'no_token' | 'error';
  errorDetail?: string;
};

// --- Helper 1: Robust Shortcode Extractor ---
function getShortcodeFromUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const match = url.match(/instagram\.com\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) return match[1];
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split('/').filter(Boolean);
    return parts.length > 0 ? parts[parts.length - 1] : null;
  } catch (e) {
    return null;
  }
}

// --- Helper 2: Live Instagram API Fetcher ---
async function getLiveInstagramInsights(
  url: string, 
  accessToken: string | null, 
  pageId: string | null
): Promise<ContentMetrics> {
  if (!accessToken || !pageId) return { likes: 0, comments: 0, reach: 0, status: 'no_token' };
  const shortcode = getShortcodeFromUrl(url);
  if (!shortcode) return { likes: 0, comments: 0, reach: 0, status: 'error', errorDetail: 'Invalid URL' };

  try {
    const listUrl = `https://graph.facebook.com/v19.0/${pageId}/media?fields=id,shortcode&limit=100&access_token=${accessToken}`;
    const listRes = await fetch(listUrl, { next: { revalidate: 120 } }); 
    const listData = await listRes.json();

    if (listData.error) return { likes: 0, comments: 0, reach: 0, status: 'error', errorDetail: 'Token Expired/Error' };

    const matchingMedia = listData.data?.find((post: any) => post.shortcode === shortcode);
    if (!matchingMedia) return { likes: 0, comments: 0, reach: 0, status: 'not_found', errorDetail: 'Post > 100 recent' };

    const detailsUrl = `https://graph.facebook.com/v19.0/${matchingMedia.id}?fields=like_count,comments_count,insights.metric(reach)&access_token=${accessToken}`;
    const detailsRes = await fetch(detailsUrl, { next: { revalidate: 300 } });
    const detailsData = await detailsRes.json();

    if (detailsData.error) return { likes: 0, comments: 0, reach: 0, status: 'error', errorDetail: 'Insights Restricted' };

    const reachData = detailsData.insights?.data?.find((m: any) => m.name === 'reach');
    const reachValue = reachData?.values?.[0]?.value || 0;

    return {
      likes: detailsData.like_count || 0,
      comments: detailsData.comments_count || 0,
      reach: reachValue,
      status: 'live'
    };
  } catch (error) {
    return { likes: 0, comments: 0, reach: 0, status: 'error', errorDetail: 'Network Error' };
  }
}

// --- MAIN PAGE COMPONENT ---
export default async function CreatorCollabStatsPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { id: collabId } =  await params;

  // Fetch Collab Info and verify the creator is assigned to it
  const { data: assignment } = await supabase
    .from("collaboration_assignments")
    .select(`
      id,
      status,
      collaboration:collaborations (
        id,
        title,
        timeline_status
      )
    `)
    .eq("collaboration_id", collabId)
    .eq("creator_id", user.id)
    .single();

  if (!assignment || !assignment.collaboration) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Collaboration Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The requested collaboration either doesn't exist or you don't have permission to view it.
        </p>
        <Link 
          href="/creator-dashboard/stats" 
          className="inline-flex items-center text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Your Performance
        </Link>
      </div>
    );
  }

  // Fetch submissions for this creator and collaboration
  const { data: submissions } = await supabase
    .from("collaboration_submissions")
    .select(`
      id, 
      url, 
      type, 
      created_at,
      likes_count, 
      comments_count, 
      reach_count,
      status
    `)
    .eq("collaboration_id", collabId)
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false });

  // Calculate total metrics
  let totalMetrics = { likes: 0, comments: 0, reach: 0 };
  
  const submissionsWithStats = await Promise.all(
    (submissions || []).map(async (sub: any) => {
      let finalStats: ContentMetrics = {
        likes: sub.likes_count || 0,
        comments: sub.comments_count || 0,
        reach: sub.reach_count || 0,
        status: 'db_fallback'
      };

      // Try to get fresh data if we have the user's access token
      const { data: userData } = await supabase
        .from("users")
        .select("meta_access_token, instagram_business_account_id")
        .eq("id", user.id)
        .single();

      if (sub.url && userData?.meta_access_token && userData?.instagram_business_account_id) {
        const liveData = await getLiveInstagramInsights(
          sub.url, 
          userData.meta_access_token, 
          userData.instagram_business_account_id
        );
        
        if (liveData.status === 'live') {
          finalStats = liveData;
          
          // Update the database with fresh data if it's different
          if (finalStats.likes !== sub.likes_count || 
              finalStats.comments !== sub.comments_count || 
              finalStats.reach !== sub.reach_count) {
            await supabase
              .from("collaboration_submissions")
              .update({
                likes_count: finalStats.likes,
                comments_count: finalStats.comments,
                reach_count: finalStats.reach,
                updated_at: new Date().toISOString()
              })
              .eq("id", sub.id);
          }
        } else {
          finalStats.status = liveData.status;
          finalStats.errorDetail = liveData.errorDetail;
        }
      } else {
        finalStats.status = 'no_token';
      }

      totalMetrics.likes += finalStats.likes;
      totalMetrics.comments += finalStats.comments;
      totalMetrics.reach += finalMetrics.reach;

      return { ...sub, metrics: finalStats };
    })
  );

  const engagementRate = totalMetrics.reach > 0 
    ? (((totalMetrics.likes + totalMetrics.comments) / totalMetrics.reach) * 100).toFixed(2)
    : "0";

  return (
    <div className="container mx-auto py-6 px-4 md:px-6 space-y-6 md:space-y-8">
      {/* Back Navigation */}
      <Link 
        href="/creator-dashboard/stats" 
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Your Performance
      </Link>

      {/* Header Section */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
          <h1 className="text-2xl md:text-3xl font-bold truncate">{assignment.collaboration.title}</h1>
          <div className="flex gap-2">
            <span className="w-fit px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium capitalize">
              {assignment.collaboration.timeline_status?.replace(/_/g, " ")}
            </span>
            <span className="w-fit px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium capitalize">
              {assignment.status?.replace(/_/g, " ")}
            </span>
          </div>
        </div>
        <p className="text-sm md:text-base text-muted-foreground">
          Your performance metrics for this collaboration.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatsCard title="Total Reach" value={totalMetrics.reach} icon={Eye} color="text-muted-foreground" />
        <StatsCard title="Total Likes" value={totalMetrics.likes} icon={Heart} color="text-pink-500" />
        <StatsCard title="Total Comments" value={totalMetrics.comments} icon={MessageCircle} color="text-blue-500" />
        <StatsCard 
          title="Engagement Rate" 
          value={`${engagementRate}%`} 
          icon={BarChart3} 
          color="text-green-500" 
          sub={
            totalMetrics.reach > 0 
              ? `Based on ${totalMetrics.reach} reach` 
              : 'No reach data available'
          } 
        />
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Your Submissions</h2>
          <span className="text-sm text-muted-foreground">
            {submissionsWithStats.length} {submissionsWithStats.length === 1 ? 'submission' : 'submissions'}
          </span>
        </div>

        {submissionsWithStats.length > 0 ? (
          <div className="grid gap-4">
            {submissionsWithStats.map((sub: any) => (
              <Card key={sub.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium truncate">
                          {new Date(sub.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </h3>
                        <StatusBadge status={sub.metrics.status} detail={sub.metrics.errorDetail} />
                      </div>
                      
                      {sub.url && (
                        <a 
                          href={sub.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1 w-fit"
                        >
                          View on Instagram <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Likes</p>
                        <p className="font-medium">{sub.metrics.likes.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Comments</p>
                        <p className="font-medium">{sub.metrics.comments.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Reach</p>
                        <p className="font-medium">
                          {sub.metrics.reach > 0 ? sub.metrics.reach.toLocaleString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center p-8">
            <p className="text-muted-foreground">
              No submissions found. Your performance metrics will appear here once you submit content for this collaboration.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

// --- Sub-Components ---

function StatsCard({ title, value, icon: Icon, color, sub }: { 
  title: string; 
  value: string | number; 
  icon: any; 
  color: string;
  sub?: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className={`p-2 rounded-lg ${color.replace('text', 'bg')}/10`}>
            <Icon className={`h-4 w-4 ${color}`} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status, detail, compact = false }: { 
  status: ContentMetrics['status'], 
  detail?: string, 
  compact?: boolean 
}) {
  const statusConfig = {
    live: {
      icon: CheckCircle2,
      color: 'bg-green-100 text-green-700 border-green-200',
      label: 'Live Data',
      tooltip: 'Showing real-time metrics from Instagram'
    },
    db_fallback: {
      icon: Database,
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      label: 'Saved Data',
      tooltip: 'Showing last saved metrics (not live)'
    },
    not_found: {
      icon: AlertCircle,
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      label: 'Post Not Found',
      tooltip: detail || 'Post not found in recent 100 posts'
    },
    no_token: {
      icon: User,
      color: 'bg-gray-100 text-gray-700 border-gray-200',
      label: 'Connect Instagram',
      tooltip: 'Connect your Instagram account for live metrics'
    },
    error: {
      icon: AlertCircle,
      color: 'bg-red-100 text-red-700 border-red-200',
      label: 'Error',
      tooltip: detail || 'Error fetching data'
    }
  };

  const config = statusConfig[status] || statusConfig.error;
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
            <Icon className="h-3 w-3" />
            {!compact && <span>{config.label}</span>}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[250px]">
          <p>{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
