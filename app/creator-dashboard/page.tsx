
import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  ArrowRight,
  Search,
  CheckCircle,
  Clock,
  ExternalLink,
  BarChart3
} from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { TierBadge } from "@/components/creator/tier-badge";
import { TieredAvatar } from "@/components/creator/tiered-avatar";
import { calculateEngagementValue } from "@/lib/creator-utils";

export default async function CreatorDashboard() {
  const supabase = await createClient();
  
  // 1. Get Auth Session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/auth/login");

  // 2. Get Basic User Profile (Separate from stats to prevent crashes)
  const { data: userData } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // Basic validation
  if (!userData) return redirect("/auth/login");
  if (userData.user_type !== "creator") return redirect("/dashboard");
  if (userData.approval_status === "pending") return redirect("/auth/pending-approval");
  if (userData.approval_status === "rejected") return redirect("/auth/rejected");

  // 3. Parallel Fetching for Stats & Feed
  // We fetch insights, posts, and applications in parallel
  const [
    insightsResult,
    postsResult,
    appsResult,
    collabsResult
  ] = await Promise.all([
    supabase.from("meta_insights").select("*").eq("user_id", user.id).order('created_at', { ascending: false }).limit(1),
    supabase.from("meta_posts").select("engagement_rate").eq("user_id", user.id).order('created_at', { ascending: false }).limit(6),
    supabase.from("collaboration_applications").select("*, collaborations(*)").eq("creator_id", user.id).order("created_at", { ascending: false }),
    supabase.from("collaborations").select("*").eq("approval_status", "approved").order("created_at", { ascending: false }).limit(5)
  ]);

  // 4. Extract Data Safely
  const latestInsights = insightsResult.data?.[0];
  const recentPosts = postsResult.data || [];
  const applications = appsResult.data || [];
  const availableCollabs = collabsResult.data || [];
  const activeApps = applications.filter(a => a.approval_status === 'pending');
  
  // 5. Calculate Metrics
  const avgEngagement = recentPosts.length > 0 
    ? (recentPosts.reduce((sum, post) => sum + (Number(post.engagement_rate) || 0), 0) / recentPosts.length).toFixed(2)
    : "0.00";

  const engagementValue = latestInsights?.insights_data ? calculateEngagementValue({
    followers_count: latestInsights.insights_data.followers_count || 0,
    average_engagement_rate: latestInsights.insights_data.average_engagement_rate || 0,
    total_posts: latestInsights.insights_data.media_count || 0
  }) : 0;
  
  const formatNumber = (num: number | undefined) => 
    num ? new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(num) : "—";

  return (
    <div className="min-h-screen bg-slate-50/30">
      <div className="container mx-auto px-4 md:px-6 py-8 max-w-7xl">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <TieredAvatar
                engagementValue={engagementValue}
                src={userData.profile_image_url}
                alt={userData.display_name || userData.full_name || "Creator"}
                fallback={userData.display_name?.[0] || userData.full_name?.[0] || "C"}
                size="lg"
              />
              <div>
                <h1 className="text-3xl font-semibold text-slate-900">Overview</h1>
                <p className="text-slate-500 text-base mt-1">
                  Welcome back, {userData.display_name || userData.full_name || "Creator"}.
                </p>
              </div>
            </div>
            {latestInsights?.insights_data && (
              <TierBadge 
                engagementValue={engagementValue}
                showProgress={false}
                size="md"
                className="hidden sm:flex"
              />
            )}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Followers */}
          <div className="bg-white rounded-lg border border-slate-200/60 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600">Total Followers</h3>
              <div className="p-2 bg-blue-50 rounded-lg">
                 <Users className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-semibold text-slate-900">{formatNumber(latestInsights?.insights_data?.followers_count)}</div>
              <p className="text-xs text-slate-500">Instagram audience</p>
            </div>
          </div>

          {/* Posts */}
          <div className="bg-white rounded-lg border border-slate-200/60 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600">Total Posts</h3>
              <div className="p-2 bg-emerald-50 rounded-lg">
                 <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-semibold text-slate-900">{formatNumber(latestInsights?.insights_data?.media_count)}</div>
              <p className="text-xs text-slate-500">Media count</p>
            </div>
          </div>

          {/* Pending Apps */}
          <div className="bg-white rounded-lg border border-amber-200/60 p-6 relative">
            <div className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full"></div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600">Pending Applications</h3>
              <div className="p-2 bg-amber-50 rounded-lg">
                 <Clock className="h-4 w-4 text-amber-600" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-semibold text-slate-900">{activeApps.length}</div>
              <p className="text-xs text-slate-500">Waiting for response</p>
            </div>
          </div>

          {/* Engagement */}
          <div className="bg-white rounded-lg border border-slate-200/60 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600 pr-2">Avg. Engagement</h3>
              <div className="p-2 bg-purple-50 rounded-lg">
                 <BarChart3 className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-semibold text-slate-900">{avgEngagement}%</div>
              <p className="text-xs text-slate-500">Latest 6 posts average</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Collabs */}
          <div className="bg-white rounded-lg border border-slate-200/60">
            <div className="px-6 py-4 border-b border-slate-200/60">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">New Opportunities</h2>
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900" asChild>
                    <Link href="/creator-dashboard/discover">View All</Link>
                </Button>
              </div>
            </div>
            <div className="p-6 space-y-3">
              {availableCollabs.length > 0 ? (
                availableCollabs.map((collab) => (
                  <Link key={collab.id} href={`/creator-dashboard/collaborations/${collab.id}`} className="block">
                    <div className="group flex items-center justify-between p-4 rounded-lg border border-slate-200/60 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate">{collab.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{collab.category || "General"}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-500">No collaborations available.</p>
                </div>
              )}
            </div>
          </div>

          {/* Application Status */}
          <div className="bg-white rounded-lg border border-slate-200/60">
            <div className="px-6 py-4 border-b border-slate-200/60">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Application Status</h2>
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900" asChild>
                    <Link href="/creator-dashboard/applications">View All</Link>
                </Button>
              </div>
            </div>
            <div className="p-6 space-y-3">
               {applications.length > 0 ? (
                  applications.slice(0, 5).map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200/60 bg-slate-50/30">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${app.approval_status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                            {app.approval_status === 'approved' ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0">
                            <p className="font-medium text-slate-900 truncate">{app.collaborations?.title || "Collaboration"}</p>
                            <span className="inline-flex items-center text-[10px] font-bold uppercase px-2 py-1 rounded mt-1 bg-amber-100 text-amber-700">
                              {app.approval_status}
                            </span>
                        </div>
                      </div>
                      <Button size="icon" variant="ghost" className="text-slate-400 hover:text-slate-600" asChild>
                        <Link href={`/creator-dashboard/collaborations/${app.collaboration_id}`}>
                          View
                        </Link>
                      </Button>
                    </div>
                  ))
               ) : (
                  <div className="text-center py-12">
                      <p className="text-slate-500 text-sm mb-4">No applications yet.</p>
                      <Button size="sm" className="bg-slate-900 hover:bg-slate-800" asChild><Link href="/creator-dashboard/discover">Find Collabs</Link></Button>
                  </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}