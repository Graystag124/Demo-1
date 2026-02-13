import { DashboardPageHeader } from "@/components/navigation/dashboard-page-header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getStatusVariant, getStatusLabel } from "@/lib/status";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Edit, Instagram, TrendingUp, Users, ImageIcon } from 'lucide-react';
// import { DashboardPageHeader } from "@/components/navigation/dashboard-page-header";

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
    // Get basic profile info using the latest API version
    const apiVersion = 'v18.0'; // Using a stable version that supports the metrics we need
    const profileResponse = await fetch(
      `https://graph.facebook.com/${apiVersion}/${userData.instagram_business_account_id}?fields=username,name,biography,followers_count,follows_count,media_count,profile_picture_url&access_token=${userData.meta_page_access_token}`
    );
    
    if (!profileResponse.ok) {
      console.error('Failed to fetch profile data:', await profileResponse.text());
      throw new Error('Failed to fetch profile data');
    }
    
    const profileData = await profileResponse.json();

    // Get recent media with basic fields first
    const mediaResponse = await fetch(
      `https://graph.facebook.com/${apiVersion}/${userData.instagram_business_account_id}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&limit=6&access_token=${userData.meta_page_access_token}`
    );
    
    if (!mediaResponse.ok) {
      console.error('Failed to fetch media data:', await mediaResponse.text());
      throw new Error('Failed to fetch media data');
    }
    
    const mediaData = await mediaResponse.json();

    // If no media, return early with basic data
    if (!mediaData.data || mediaData.data.length === 0) {
      return {
        profile: profileData,
        recentMedia: [],
        metrics: {
          averageEngagementRate: 0,
          averageReach: 0,
          averageImpressions: 0,
          averageLikes: 0,
          totalReach: 0,
          validEngagementPosts: 0
        }
      };
    }

    // Fetch insights for each media item
    const mediaWithInsights = await Promise.all(
      mediaData.data.map(async (media: any) => {
        try {
          // Use a stable API version that supports the metrics we need
          const apiVersion = 'v18.0';
          
          // Define metrics based on media type
          const metrics = [
            'reach',
            'likes',
            'comments',
            'shares',
            'total_interactions',
            'saved'
          ];
          
          // Add metrics based on media type
          switch (media.media_type) {
            case 'IMAGE':
            case 'CAROUSEL_ALBUM':
              metrics.push('profile_visits', 'profile_activity', 'navigation');
              break;
              
            case 'VIDEO':
            case 'REELS':
            case 'IGTV':
              metrics.push('plays', 'video_views', 'ig_reels_video_view_total_time', 'ig_reels_avg_watch_time', 'clips_replays_count');
              break;
              
            case 'STORY':
              metrics.push('exits', 'replies', 'taps_forward', 'taps_back');
              break;
          }
          
          // Convert metrics array to comma-separated string and make the request
          const metricsString = metrics.join(',');
          const insightsUrl = `https://graph.facebook.com/${apiVersion}/${media.id}/insights?metric=${metricsString}&access_token=${userData.meta_page_access_token}`;
          
          let insightsResponse;
          let retryCount = 0;
          const maxRetries = 1;
          
          while (retryCount <= maxRetries) {
            try {
              insightsResponse = await fetch(insightsUrl);
              if (insightsResponse.ok) break;
              
              if (insightsResponse.status === 400) {
                const errorData = await insightsResponse.json();
                if (errorData.error?.code === 100) {
                  // Fallback to basic metrics if we get error 100
                  const basicMetrics = ['reach', 'likes', 'comments', 'saved'];
                  const basicUrl = `https://graph.facebook.com/${apiVersion}/${media.id}/insights?metric=${basicMetrics.join(',')}&access_token=${userData.meta_page_access_token}`;
                  insightsResponse = await fetch(basicUrl);
                  if (insightsResponse.ok) break;
                }
              }
              
              throw new Error(`HTTP error! status: ${insightsResponse.status}`);
              
            } catch (error) {
              console.error(`Error fetching insights for media ${media.id} (attempt ${retryCount + 1}):`, error);
              retryCount++;
              
              if (retryCount > maxRetries) {
                console.warn(`Using minimal metrics for media ${media.id} after ${maxRetries + 1} attempts`);
                const minimalMetrics = ['reach', 'likes', 'comments'];
                const minimalUrl = `https://graph.facebook.com/${apiVersion}/${media.id}/insights?metric=${minimalMetrics.join(',')}&access_token=${userData.meta_page_access_token}`;
                insightsResponse = await fetch(minimalUrl);
                break;
              }
            }
          }
          
          if (!insightsResponse || !insightsResponse.ok) {
            const errorText = insightsResponse ? await insightsResponse.text() : 'No response';
            console.error(`Failed to fetch insights for media ${media.id}:`, errorText);
            return {
              ...media,
              insights: {
                likes: media.like_count || 0,
                comments: media.comments_count || 0,
                engagement: (media.like_count || 0) + (media.comments_count || 0),
                impressions: 0,
                reach: 0,
                saved: 0,
                video_views: 0,
                plays: 0
              }
            };
          }
          
          const insights = await insightsResponse.json();
          
          // Initialize with default values
          const mediaInsights = {
            likes: media.like_count || 0,
            comments: media.comments_count || 0,
            shares: 0,
            engagement: (media.like_count || 0) + (media.comments_count || 0),
            impressions: 0,
            reach: 0,
            saved: 0,
            video_views: 0,
            plays: 0,
            total_interactions: 0
          };
          
          // Process the insights response
          if (insights.data && Array.isArray(insights.data)) {
            insights.data.forEach((item: any) => {
              const metricName = item.name;
              const metricValue = item.values?.[0]?.value;
              
              if (typeof metricValue === 'number') {
                const metricMap: { [key: string]: keyof typeof mediaInsights } = {
                  'likes': 'likes',
                  'comments': 'comments',
                  'shares': 'shares',
                  'impressions': 'impressions',
                  'reach': 'reach',
                  'saved': 'saved',
                  'video_views': 'video_views',
                  'plays': 'plays',
                  'total_interactions': 'total_interactions'
                };
                
                const targetMetric = metricMap[metricName];
                if (targetMetric) {
                  mediaInsights[targetMetric] = metricValue;
                }
              }
            });
            
            // Calculate engagement as sum of likes, comments, and shares
            mediaInsights.engagement = mediaInsights.likes + mediaInsights.comments + mediaInsights.shares;
          }
          
          console.log(`Processed insights for media ${media.id}:`, mediaInsights);
          
          return {
            ...media,
            insights: mediaInsights
          };
          
        } catch (error) {
          console.error(`Error processing media ${media.id}:`, error);
          return {
            ...media,
            insights: {
              likes: media.like_count || 0,
              comments: media.comments_count || 0,
              engagement: (media.like_count || 0) + (media.comments_count || 0),
              impressions: 0,
              reach: 0,
              saved: 0,
              video_views: 0,
              plays: 0
            }
          };
        }
      })
    );
    
    console.log('All media with insights:', JSON.stringify(mediaWithInsights, null, 2));

    // Calculate aggregate metrics
    let totalEngagementRate = 0;
    let validEngagementPosts = 0;
    
    const metrics = mediaWithInsights.reduce((acc: any, media: any) => {
      const insights = media.insights || {};
      const engagement = insights.likes + insights.comments || 0;
      const reach = Math.max(1, insights.reach || insights.impressions || (media.like_count * 5) || 1);
      const postEngagementRate = (engagement / reach) * 100;
      
      if (!isNaN(postEngagementRate) && isFinite(postEngagementRate)) {
        totalEngagementRate += postEngagementRate;
        validEngagementPosts++;
      }
      
      return {
        totalEngagement: acc.totalEngagement + engagement,
        totalReach: acc.totalReach + reach,
        totalImpressions: acc.totalImpressions + (insights.impressions || 0),
        totalLikes: acc.totalLikes + (insights.likes || 0)
      };
    }, {
      totalEngagement: 0,
      totalReach: 0,
      totalImpressions: 0,
      totalLikes: 0
    });
    
    const postCount = mediaWithInsights.length || 1;
    const avgEngagementRate = validEngagementPosts > 0 
      ? totalEngagementRate / validEngagementPosts 
      : 0;

    return {
      profile: profileData,
      recentMedia: mediaWithInsights,
      metrics: {
        averageEngagementRate: avgEngagementRate,
        averageReach: Math.round(metrics.totalReach / postCount) || 0,
        averageImpressions: Math.round(metrics.totalImpressions / postCount) || 0,
        averageLikes: Math.round(metrics.totalLikes / postCount) || 0,
        totalReach: metrics.totalReach,
        validEngagementPosts
      }
    };
    
  } catch (error) {
    console.error("[v0] Error fetching Instagram insights:", error);
    return null;
  }
}

export default async function BusinessProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: userData } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: collaborations } = await supabase
    .from("collaborations")
    .select("*, collaboration_applications(*)")
    .eq("business_id", user.id);

  const totalCollabs = collaborations?.length || 0;
  const totalApplications = collaborations?.reduce((acc, c) => acc + (c.collaboration_applications?.length || 0), 0) || 0;

  const insights = await getInstagramInsights(user.id);

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <DashboardPageHeader 
          title="Profile"
          description="Your business profile and Instagram insights"
          showBackButton
        />
        <Link href="/business-dashboard/profile/edit">
          <Button variant="outline" className="bg-green-500 hover:bg-green-600 text-white border-green-500">
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Your Byberr business profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <Avatar className="h-24 w-24">
              <AvatarImage src={(insights?.profile?.profile_picture_url as string) || userData?.profile_image_url || ""} />
              <AvatarFallback>{userData?.display_name?.[0] || "B"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-xl font-semibold">{userData?.display_name || "Business"}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              {userData?.bio && (
                <p className="text-sm">{userData.bio}</p>
              )}
              <div className="flex gap-2">
                <Badge variant="secondary">{userData?.user_type}</Badge>
                <Badge variant={getStatusVariant(userData?.approval_status)}>{getStatusLabel(userData?.approval_status)}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Collaboration Statistics</CardTitle>
          <CardDescription>Your platform performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Collaborations Posted</p>
              <p className="text-2xl font-bold">{totalCollabs}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Applications Received</p>
              <p className="text-2xl font-bold">{totalApplications}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Collaborations</p>
              <p className="text-2xl font-bold">
                {collaborations?.filter(c => c.approval_status === "approved").length || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {insights ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Instagram className="h-5 w-5" />
                Instagram Business Profile
              </CardTitle>
              <CardDescription>Your Instagram business account metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Users className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{insights.profile.followers_count?.toLocaleString() || "0"}</p>
                    <p className="text-sm text-muted-foreground">Followers</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{insights.profile.follows_count?.toLocaleString() || "0"}</p>
                    <p className="text-sm text-muted-foreground">Following</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <ImageIcon className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{insights.profile.media_count?.toLocaleString() || "0"}</p>
                    <p className="text-sm text-muted-foreground">Posts</p>
                  </div>
                </div>
              </div>
              
              {/* Engagement Metrics */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm font-medium text-muted-foreground mb-3">Engagement Metrics</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <p className="text-sm font-medium flex items-center">
                      <span className="mr-1">📈</span> Engagement Rate
                    </p>
                    <p className="text-xl font-semibold">
                      {insights.metrics.averageEngagementRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      avg. across {insights.metrics.validEngagementPosts} posts
                    </p>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <p className="text-sm font-medium flex items-center">
                      <span className="mr-1">👥</span> Avg. Reach
                    </p>
                    <p className="text-xl font-semibold">
                      {insights.metrics.averageReach.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">per post</p>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <p className="text-sm font-medium flex items-center">
                      <span className="mr-1">❤️</span> Avg. Likes
                    </p>
                    <p className="text-xl font-semibold">
                      {insights.metrics.averageLikes.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      last {insights.recentMedia.length} posts
                    </p>
                  </div>
                </div>
              </div>

              {insights.profile.biography && (
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Biography</p>
                  <p className="text-sm">{insights.profile.biography}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {insights.recentMedia.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Posts</CardTitle>
                <CardDescription>Your latest Instagram posts with engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  {insights.recentMedia.map((media: any) => (
                    <a
                      key={media.id}
                      href={media.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-square rounded-md overflow-hidden bg-muted/20"
                      title={media.caption || 'Instagram post'}
                    >
                      <img
                        src={media.media_type === "VIDEO" ? media.thumbnail_url : media.media_url}
                        alt={media.caption || "Instagram post"}
                        className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-2 text-center space-y-1">
                        <div className="flex items-center">
                          <span className="mr-1">❤️</span>
                          <span className="font-medium">
                            {media.insights?.likes?.toLocaleString() || media.like_count || '0'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-1">💬</span>
                          <span className="font-medium">
                            {media.insights?.comments?.toLocaleString() || media.comments_count || '0'}
                          </span>
                        </div>
                        <div className="text-xs mt-1">
                          <div className="flex items-center justify-center">
                            <span className="mr-1">📊</span>
                            {((media.insights.engagement / Math.max(1, media.insights.reach || media.insights.impressions || (media.like_count * 5) || 1)) * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs text-white mt-1">
                            {Math.max(1, media.insights.reach || media.insights.impressions || (media.like_count * 5) || 1).toLocaleString()} accounts reached
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
            <CardDescription>Connect your Instagram business account to see insights</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Connect your Instagram Business account to view follower stats, engagement metrics, and recent posts.
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
