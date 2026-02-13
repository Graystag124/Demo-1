import { DashboardPageHeader } from "@/components/navigation/dashboard-page-header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getStatusVariant, getStatusLabel } from "@/lib/status";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Edit, 
  Instagram, 
  TrendingUp, 
  Users, 
  ImageIcon, 
  Handshake, 
  BarChart, 
  ExternalLink 
} from 'lucide-react';
import { TierBadge } from "@/components/ui/tier-badge";
import { TierRing } from "@/components/ui/tier-ring";
import { TierProgressBar } from "@/components/ui/tier-progress-bar";

// --- 1. Helper: Get Instagram API Data ---
async function getInstagramInsights(userId: string) {
  const supabase = await createClient();
  
  const { data: userData } = await supabase
    .from("users")
    .select("meta_access_token, instagram_business_account_id, meta_page_access_token")
    .eq("id", userId)
    .single();

  if (!userData?.meta_page_access_token || !userData?.instagram_business_account_id) {
    return null;
  }

  try {
    // Fetch Profile
    const profileResponse = await fetch(
      `https://graph.facebook.com/v21.0/${userData.instagram_business_account_id}?fields=username,name,biography,followers_count,follows_count,media_count,profile_picture_url&access_token=${userData.meta_page_access_token}`,
      { next: { revalidate: 300 } }
    );
    
    if (!profileResponse.ok) throw new Error(`Failed to fetch profile`);
    const profileData = await profileResponse.json();

    // Fetch Recent Media
    const mediaResponse = await fetch(
      `https://graph.facebook.com/v21.0/${userData.instagram_business_account_id}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&limit=6&access_token=${userData.meta_page_access_token}`,
      { next: { revalidate: 300 } }
    );
    
    if (!mediaResponse.ok) throw new Error(`Failed to fetch media`);
    const mediaData = await mediaResponse.json();

    if (!mediaData.data || mediaData.data.length === 0) {
      return {
        profile: profileData,
        recentMedia: [],
        metrics: {
          averageEngagementRate: 0,
          averageReach: 0,
          averageImpressions: 0,
          totalLikes: 0,
          totalReach: 0,
          validEngagementPosts: 0
        }
      };
    }

    // Fetch Insights per media
    const mediaWithInsights = await Promise.all(
      mediaData.data.map(async (media: any) => {
        try {
          const metrics = ['impressions', 'reach', 'saved', 'likes', 'comments'];
          const insights: Record<string, number> = {};
          
          for (const metric of metrics) {
            try {
              const r = await fetch(
                `https://graph.facebook.com/v21.0/${media.id}/insights?metric=${metric}&access_token=${userData.meta_page_access_token}`,
                { next: { revalidate: 300 } }
              );
              const d = await r.json();
              insights[metric] = d.data?.[0]?.values?.[0]?.value || 0;
            } catch (e) {
              insights[metric] = 0;
            }
          }
          
          const engagement = (insights.likes || 0) + (insights.comments || 0);
          const reach = Math.max(1, insights.reach || insights.impressions || 1);
          const engagementRate = Math.min(100, (engagement / reach) * 100);
          
          return { ...media, insights: { ...insights, engagement, reach, engagementRate } };
        } catch (error) {
          return media; // Fallback
        }
      })
    );

    // Calculate Aggregates
    let totalEngagement = 0, totalReach = 0, totalImpressions = 0, totalLikes = 0, totalRate = 0, validPosts = 0;

    mediaWithInsights.forEach((m: any) => {
      if (m.insights) {
        totalEngagement += m.insights.engagement || 0;
        totalReach += m.insights.reach || 0;
        totalImpressions += m.insights.impressions || 0;
        totalLikes += m.insights.likes || 0;
        if ((m.insights.reach || 0) > 0) {
          totalRate += m.insights.engagementRate;
          validPosts++;
        }
      }
    });

    return {
      profile: profileData,
      recentMedia: mediaWithInsights,
      metrics: {
        averageEngagementRate: validPosts > 0 ? totalRate / validPosts : 0,
        averageReach: mediaWithInsights.length > 0 ? Math.round(totalReach / mediaWithInsights.length) : 0,
        averageImpressions: mediaWithInsights.length > 0 ? Math.round(totalImpressions / mediaWithInsights.length) : 0,
        totalLikes,
        totalReach,
        validEngagementPosts: validPosts
      }
    };
  } catch (error) {
    console.error("Error fetching Instagram insights:", error);
    return null;
  }
}

// --- 2. Helper: Get Collaboration History & Stats ---
async function getCollaborationHistory(userId: string) {
  const supabase = await createClient();

  // A. Get Approved Brands (via Applications)
  const { data: applications } = await supabase
    .from("collaboration_applications")
    .select(`
      collaboration_id,
      collaborations!inner (
        business_id
      )
    `)
    .eq("creator_id", userId)
    .eq("approval_status", "approved");

  let brands: any[] = [];
  if (applications && applications.length > 0) {
    // Extract unique business IDs
    const businessIds = Array.from(new Set(applications.map((app: any) => app.collaborations?.business_id).filter(Boolean)));
    
    if (businessIds.length > 0) {
      const { data: brandUsers } = await supabase
        .from("users")
        .select("id, display_name, profile_image_url, website")
        .in("id", businessIds);
      brands = brandUsers || [];
    }
  }

  // B. Get Total Reach from Submissions
  const { data: submissions } = await supabase
    .from("collaboration_submissions")
    .select("reach_count")
    .eq("creator_id", userId);

  const totalCollabReach = submissions?.reduce((sum, sub) => sum + (sub.reach_count || 0), 0) || 0;

  return {
    brands,
    totalCollabReach,
    totalCollaborations: applications?.length || 0
  };
}

// --- 3. Main Component ---
export default async function CreatorProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: userData } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  // Parallel Fetching
  const [instagramInsights, collabHistory] = await Promise.all([
    getInstagramInsights(user.id),
    getCollaborationHistory(user.id)
  ]);

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <DashboardPageHeader
          title="Profile"
          description="Your creator profile and Instagram insights"
          showBackButton
        />
        <Link href="/creator-dashboard/profile/edit">
          <Button className="bg-green-500 hover:bg-green-600 text-white">
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </Link>
      </div>

      {/* --- Section 1: Profile Info --- */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Your Byberr profile details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <div className="relative">
              <TierRing 
                engagementValue={userData?.engagement_value || 0}
                src={userData?.profile_image_url || ""}
                alt={userData?.display_name || "Creator"}
                fallback={userData?.display_name?.[0] || "C"}
                size="xl"
              />
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-xl font-semibold">{userData?.display_name || "Creator"}</h3>
                <TierBadge 
                  engagementValue={userData?.engagement_value || 0}
                  size="sm"
                />
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              
              {/* Correctly structured conditional rendering */}
              {userData?.bio && (
                <p className="text-sm">{userData.bio}</p>
              )}

              <div className="flex gap-2 items-center justify-center sm:justify-start">
                <Badge variant="secondary" className="capitalize">{userData?.user_type}</Badge>
                <Badge variant={getStatusVariant(userData?.approval_status)}>{getStatusLabel(userData?.approval_status)}</Badge>
              </div>

              {/* Tier Progress */}
              <div className="pt-2">
                <TierProgressBar 
                  engagementValue={userData?.engagement_value || 0}
                  size="sm"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --- Section 2: Partnerships & Collab Stats --- */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        {/* Collab Stats */}
        <Card className="md:col-span-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-5 w-5" />
                    Platform Stats
                </CardTitle>
                <CardDescription>Performance on Byberr</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div className="space-y-0.5">
                        <p className="text-sm font-medium">Total Collaborations</p>
                        <p className="text-xs text-muted-foreground">Approved campaigns</p>
                    </div>
                    <div className="text-2xl font-bold">{collabHistory.totalCollaborations}</div>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div className="space-y-0.5">
                        <p className="text-sm font-medium">Campaign Reach</p>
                        <p className="text-xs text-muted-foreground">Verified metrics</p>
                    </div>
                    <div className="text-2xl font-bold">{collabHistory.totalCollabReach.toLocaleString()}</div>
                </div>
            </CardContent>
        </Card>

        {/* Previously Collaborated With */}
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Handshake className="h-5 w-5" />
                    Brand Partners
                </CardTitle>
                <CardDescription>Brands you have previously collaborated with</CardDescription>
            </CardHeader>
            <CardContent>
                {collabHistory.brands.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {collabHistory.brands.map((brand: any) => (
                            <div key={brand.id} className="group flex flex-col items-center p-3 border rounded-lg bg-card hover:bg-muted/30 hover:border-primary/50 transition-all">
                                <Avatar className="h-10 w-10 mb-2 ring-2 ring-offset-2 ring-transparent group-hover:ring-primary/20 transition-all">
                                    <AvatarImage src={brand.profile_image_url} alt={brand.display_name} />
                                    <AvatarFallback>{brand.display_name?.[0]?.toUpperCase() || "B"}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium text-center truncate w-full px-1">
                                    {brand.display_name || "Brand Partner"}
                                </span>
                                {brand.website && (
                                    <a 
                                      href={brand.website.startsWith('http') ? brand.website : `https://${brand.website}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-xs text-muted-foreground mt-1 flex items-center gap-1 hover:text-primary"
                                    >
                                      Visit <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                        <p className="text-sm">No completed collaborations yet.</p>
                        <p className="text-xs mt-1">Apply to opportunities to build your portfolio.</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>

      {/* --- Section 3: Instagram Insights --- */}
      {instagramInsights ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Instagram className="h-5 w-5" />
                Instagram Profile
              </CardTitle>
              <CardDescription>Your Instagram Business/Creator account stats</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Top Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Users className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{instagramInsights.profile.followers_count?.toLocaleString() || "0"}</p>
                    <p className="text-sm text-muted-foreground">Followers</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{instagramInsights.profile.follows_count?.toLocaleString() || "0"}</p>
                    <p className="text-sm text-muted-foreground">Following</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <ImageIcon className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{instagramInsights.profile.media_count?.toLocaleString() || "0"}</p>
                    <p className="text-sm text-muted-foreground">Posts</p>
                  </div>
                </div>
              </div>

              {/* Engagement Metrics */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm font-medium text-muted-foreground mb-3">Engagement Metrics</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <p className="text-sm font-medium">Avg. Engagement Rate</p>
                    <p className="text-xl font-semibold">
                      {instagramInsights.metrics.averageEngagementRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">based on {instagramInsights.metrics.validEngagementPosts} posts</p>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <p className="text-sm font-medium">Avg. Reach</p>
                    <p className="text-xl font-semibold">
                      {instagramInsights.metrics.averageReach.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">per post</p>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <p className="text-sm font-medium">Total Social Reach</p>
                    <p className="text-xl font-semibold">
                      {instagramInsights.metrics.totalReach.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">across recent posts</p>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <p className="text-sm font-medium">Total Likes</p>
                    <p className="text-xl font-semibold">
                      {instagramInsights.metrics.totalLikes.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">total likes</p>
                  </div>
                </div>
              </div>

              {instagramInsights.profile.biography && (
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Biography</p>
                  <p className="text-sm">{instagramInsights.profile.biography}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Posts Grid */}
          {instagramInsights.recentMedia.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Posts</CardTitle>
                <CardDescription>Your latest Instagram posts with engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                  {instagramInsights.recentMedia.map((media: any) => (
                    <a
                      key={media.id}
                      href={media.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-square rounded-md overflow-hidden"
                    >
                      <img
                        src={media.media_type === "VIDEO" ? media.thumbnail_url : media.media_url}
                        alt={media.caption || "Instagram post"}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="text-white text-center p-2">
                          <div className="flex items-center justify-center gap-4">
                            <div className="text-center">
                              <div className="font-bold">
                                {media.insights?.engagementRate?.toFixed(1) || 0}%
                              </div>
                              <div className="text-xs">Engagement</div>
                            </div>
                            <div className="h-6 w-px bg-white/30"></div>
                            <div className="text-center">
                              <div className="font-bold">
                                {media.insights?.reach?.toLocaleString() || 0}
                              </div>
                              <div className="text-xs">Reach</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Connect Instagram</CardTitle>
            <CardDescription>Connect your Instagram account to see insights</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Connect your Instagram Business or Creator account to view follower stats, engagement metrics, and recent posts.
            </p>
            <Link href="/auth/meta/connect">
              <Button>
                <Instagram className="mr-2 h-4 w-4" />
                Connect Instagram
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}