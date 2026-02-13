// 'use client';
import { createClient } from "@/lib/supabase/server";
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/cards/stats-card";
import { EngagementMetrics } from "@/components/engagement-metrics";
import { AudienceDemographics } from "@/components/audience-demographics";
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
  Database,
  User,
  Bookmark,
  PlayCircle,
  Users as UsersIcon,
  MapPin,
  Globe,
  Calendar
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// --- Types ---
type ContentMetrics = {
  // Basic metrics
  likes: number;
  comments: number;
  reach: number;
  impressions: number;
  saved: number;
  video_views?: number;
  engagement: number;
  status: 'live' | 'db_fallback' | 'not_found' | 'no_token' | 'error';
  errorDetail?: string;
  // Audience metrics
  audience?: {
    ageRanges: Record<string, number>;
    genders: Record<string, number>;
    cities: Array<{name: string, value: number}>;
    countries: Array<{name: string, value: number}>;
  };
  // Timeline data for charts
  timeline?: Array<{
    date: string;
    impressions: number;
    reach: number;
    engagement: number;
  }>;
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

// --- Helper 2: Enhanced Instagram API Fetcher with Insights ---
async function getLiveInstagramInsights(
  url: string,
  accessToken: string | null,
  pageId: string | null
): Promise<ContentMetrics> {
  if (!accessToken || !pageId) {
    return { 
      likes: 0, 
      comments: 0, 
      reach: 0, 
      impressions: 0,
      saved: 0,
      engagement: 0,
      status: 'no_token' 
    };
  }

  const shortcode = getShortcodeFromUrl(url);
  if (!shortcode) {
    return { 
      likes: 0, 
      comments: 0, 
      reach: 0, 
      impressions: 0,
      saved: 0,
      engagement: 0,
      status: 'error', 
      errorDetail: 'Invalid URL' 
    };
  }

  try {
    // Get media ID from shortcode
    const listUrl = `https://graph.facebook.com/v19.0/${pageId}/media?fields=id,shortcode,media_type&limit=100&access_token=${accessToken}`;
    const listRes = await fetch(listUrl, { next: { revalidate: 120 } });
    const listData = await listRes.json();

    if (listData.error) {
      return createErrorResponse('Token Expired/Error');
    }

    const matchingMedia = listData.data?.find((post: any) => post.shortcode === shortcode);
    if (!matchingMedia) {
      return createErrorResponse('Post not found in recent 100 posts');
    }

    const mediaId = matchingMedia.id;
    const isVideo = matchingMedia.media_type === 'VIDEO' || matchingMedia.media_type === 'REEL';

    // Get detailed metrics
    const metrics = [
      'engagement',
      'impressions',
      'reach',
      'saved',
      'likes',
      'comments',
      isVideo ? 'video_views' : null,
      'total_interactions'
    ].filter(Boolean).join(',');

    // Get insights
    const insightsUrl = `https://graph.facebook.com/v19.0/${mediaId}/insights?metric=${metrics}&access_token=${accessToken}`;
    const insightsRes = await fetch(insightsUrl, { next: { revalidate: 300 } });
    const insightsData = await insightsRes.json();

    if (insightsData.error) {
      return createErrorResponse('Failed to fetch insights');
    }

    // Get audience data
    const audienceUrl = `https://graph.facebook.com/v19.0/${mediaId}/insights?metric=audience_gender_age,audience_country,audience_city&access_token=${accessToken}`;
    const audienceRes = await fetch(audienceUrl, { next: { revalidate: 3600 } });
    const audienceData = await audienceRes.json();

    // Process metrics
    const metricsData = insightsData.data.reduce((acc: any, item: any) => {
      const value = item.values?.[0]?.value;
      if (Array.isArray(value)) {
        acc[item.name] = value.reduce((sum: number, v: any) => sum + (parseInt(v) || 0), 0);
      } else {
        acc[item.name] = parseInt(value) || 0;
      }
      return acc;
    }, {});

    // Process audience data
    const audience = processAudienceData(audienceData.data);

    // Get timeline data (last 30 days)
    const timelineUrl = `https://graph.facebook.com/v19.0/${mediaId}/insights?metric=impressions,reach,engagement&period=day&since=${Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60}&until=${Math.floor(Date.now() / 1000)}&access_token=${accessToken}`;
    const timelineRes = await fetch(timelineUrl, { next: { revalidate: 3600 } });
    const timelineData = await timelineRes.json();
    
    const timeline = processTimelineData(timelineData.data);

    return {
      likes: metricsData.likes || 0,
      comments: metricsData.comments || 0,
      reach: metricsData.reach || 0,
      impressions: metricsData.impressions || 0,
      saved: metricsData.saved || 0,
      video_views: isVideo ? metricsData.video_views : undefined,
      engagement: metricsData.engagement || 0,
      audience,
      timeline,
      status: 'live'
    };
  } catch (error) {
    console.error('Error fetching Instagram insights:', error);
    return createErrorResponse('Network Error');
  }
}

// Helper: Process audience data from API response
function processAudienceData(data: any[]) {
  const result: any = {
    ageRanges: {},
    genders: {},
    cities: [],
    countries: []
  };

  data.forEach((item) => {
    if (item.name === 'audience_gender_age') {
      item.values[0].value.forEach((entry: any) => {
        const [gender, age] = entry.split('.');
        if (gender && age) {
          result.genders[gender] = (result.genders[gender] || 0) + entry.value;
          result.ageRanges[age] = (result.ageRanges[age] || 0) + entry.value;
        }
      });
    } else if (item.name === 'audience_city') {
      result.cities = item.values[0].value
        .map((city: any) => ({
          name: city.key,
          value: city.value
        }))
        .sort((a: any, b: any) => b.value - a.value)
        .slice(0, 10); // Top 10 cities
    } else if (item.name === 'audience_country') {
      result.countries = item.values[0].value
        .map((country: any) => ({
          name: country.key,
          value: country.value
        }))
        .sort((a: any, b: any) => b.value - a.value)
        .slice(0, 10); // Top 10 countries
    }
  });

  return result;
}

// Helper: Process timeline data for charts
function processTimelineData(data: any[]) {
  const result: any[] = [];
  const dates = new Set<string>();
  
  // Collect all unique dates
  data.forEach((metric) => {
    if (metric.values && metric.values[0]?.end_time) {
      metric.values.forEach((value: any) => {
        dates.add(value.end_time.split('T')[0]);
      });
    }
  });

  // Initialize result with all dates
  Array.from(dates).sort().forEach(date => {
    result.push({
      date,
      impressions: 0,
      reach: 0,
      engagement: 0
    });
  });

  // Fill in the metrics
  data.forEach((metric) => {
    metric.values?.forEach((value: any) => {
      if (!value.end_time) return;
      
      const date = value.end_time.split('T')[0];
      const dayData = result.find((d) => d.date === date);
      if (!dayData) return;

      const metricValue = Array.isArray(value.value) 
        ? value.value.reduce((sum: number, v: any) => sum + (parseInt(v) || 0), 0)
        : parseInt(value.value) || 0;

      switch (metric.name) {
        case 'impressions':
          dayData.impressions = metricValue;
          break;
        case 'reach':
          dayData.reach = metricValue;
          break;
        case 'engagement':
          dayData.engagement = metricValue;
          break;
      }
    });
  });

  return result;
}

// Helper: Create error response with all required fields
function createErrorResponse(detail: string): ContentMetrics {
  return {
    likes: 0,
    comments: 0,
    reach: 0,
    impressions: 0,
    saved: 0,
    engagement: 0,
    status: 'error',
    errorDetail: detail
  };
}

// --- MAIN PAGE COMPONENT ---
export default async function CollabStatsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { id: collabId } = await params;

  // Fetch Collab Info
  const { data: collab } = await supabase
    .from("collaborations")
    .select("title, timeline_status")
    .eq("id", collabId)
    .single();

  if (!collab) return <div className="p-8 text-center">Collaboration not found</div>;

  // Fetch Submissions with additional metrics
  const { data: submissions } = await supabase
    .from("collaboration_submissions")
    .select(`
      id, 
      url, 
      type, 
      likes_count, 
      comments_count, 
      reach_count,
      impressions_count,
      saved_count,
      engagement_rate,
      created_at,
      creator:users!creator_id ( 
        id,
        display_name, 
        meta_access_token, 
        instagram_business_account_id,
        avatar_url
      )
    `)
    .eq("collaboration_id", collabId)
    .eq("status", "approved")
    .order('created_at', { ascending: false }); 

  // Aggregation Logic
  let totalMetrics = { likes: 0, comments: 0, reach: 0, impressions: 0, saved: 0, engagement: 0 };
  
  const submissionsWithMetrics = await Promise.all(
    (submissions || []).map(async (sub: any) => {
      let finalMetrics: ContentMetrics = {
        likes: sub.likes_count || 0,
        comments: sub.comments_count || 0,
        reach: sub.reach_count || 0,
        impressions: sub.impressions_count || 0,
        saved: sub.saved_count || 0,
        engagement: sub.engagement_rate || 0,
        status: 'db_fallback'
      };

      if (sub.url && sub.creator?.meta_access_token && sub.creator?.instagram_business_account_id) {
        const liveData = await getLiveInstagramInsights(sub.url, sub.creator.meta_access_token, sub.creator.instagram_business_account_id);
        if (liveData.status === 'live') {
          finalMetrics = liveData;
        } else {
          finalMetrics.status = liveData.status;
          finalMetrics.errorDetail = liveData.errorDetail;
        }
      } else {
        finalMetrics.status = 'no_token';
      }

      totalMetrics.likes += finalMetrics.likes;
      totalMetrics.comments += finalMetrics.comments;
      totalMetrics.reach += finalMetrics.reach;
      totalMetrics.impressions += finalMetrics.impressions;
      totalMetrics.saved += finalMetrics.saved;
      totalMetrics.engagement += finalMetrics.engagement;

      return { ...sub, metrics: finalMetrics };
    })
  );

  const totalEngagementRate = totalMetrics.reach > 0 
    ? ((totalMetrics.likes + totalMetrics.comments + totalMetrics.saved) / totalMetrics.reach * 100).toFixed(2)
    : 0;

  const campaignTotals = {
    reach: totalMetrics.reach,
    impressions: totalMetrics.impressions,
    saved: totalMetrics.saved,
    engagement: totalMetrics.engagement
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header with Back Button */}
      <div className="flex items-center mb-6">
        <Link href="/business-dashboard" className="mr-4 group">
          <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{collab.title} - Performance Analytics</h1>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              collab.timeline_status === 'completed' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {collab.timeline_status === 'completed' ? 'Completed' : 'In Progress'}
            </span>
            <span className="mx-2">•</span>
            <span>{submissionsWithMetrics.length} Content {submissionsWithMetrics.length === 1 ? 'Piece' : 'Pieces'}</span>
          </div>
        </div>
      </div>

      {/* Campaign Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard 
          title="Total Reach" 
          value={campaignTotals.reach > 0 ? campaignTotals.reach.toLocaleString() : '0'} 
          icon="Users" 
          color="text-blue-500"
          sub="Unique accounts reached"
          trend={0}
          trendColor="text-gray-500"
        />
        <StatsCard 
          title="Total Impressions" 
          value={campaignTotals.impressions > 0 ? campaignTotals.impressions.toLocaleString() : '0'} 
          icon="Eye" 
          color="text-purple-500"
          sub="Total times content was seen"
          trend={0}
          trendColor="text-gray-500"
        />
        <StatsCard 
          title="Engagement Rate" 
          value={totalEngagementRate > 0 ? (totalEngagementRate * 100).toFixed(2) + '%' : '0%'} 
          icon="BarChart" 
          color="text-green-500"
          sub="(Likes + Comments + Saves) / Reach"
          trend={0}
          trendColor="text-gray-500"
        />
        <StatsCard 
          title="Content Saved" 
          value={campaignTotals.saved > 0 ? campaignTotals.saved.toLocaleString() : '0'} 
          icon="Bookmark" 
          color="text-yellow-500"
          sub="Total number of saves"
          trend={0}
          trendColor="text-gray-500"
        />
      </div>

      {/* Engagement Metrics */}
      <EngagementMetrics metrics={campaignTotals} />

      {/* Audience Demographics (from first submission with audience data) */}
      {submissionsWithMetrics[0]?.metrics.audience && (
        <AudienceDemographics audience={submissionsWithMetrics[0].metrics.audience} />
      )}

      {/* Campaign Summary */}
      <div className="mt-10 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-gray-700" />
          Campaign Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-blue-50 border-blue-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">Total Reach</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{campaignTotals.reach.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">across all posts</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-600">Total Engagements</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{campaignTotals.engagement.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">likes, comments & saves</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Engagement Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {campaignTotals.reach > 0 ? 
                  ((campaignTotals.engagement / campaignTotals.reach) * 100).toFixed(2) : 
                  '0.00'}%
              </p>
              <p className="text-xs text-gray-500 mt-1">average across posts</p>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 border-yellow-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">Total Saves</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{campaignTotals.saved.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">total bookmarks</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Individual Post Performance */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-gray-700" />
          Individual Post Performance
        </h2>
        <div className="space-y-4">
          {submissionsWithMetrics.map((submission) => {
            const engagementRate = submission.metrics.reach > 0 
              ? ((submission.metrics.likes + submission.metrics.comments + (submission.metrics.saved || 0)) / submission.metrics.reach * 100).toFixed(2)
              : 0;
            
            return (
              <Card key={submission.id} className="overflow-hidden hover:shadow-lg transition-shadow border-l-4 border-blue-400">
                <CardHeader className="bg-gray-50 p-4 border-b">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      {submission.creator?.avatar_url ? (
                        <img 
                          src={submission.creator.avatar_url} 
                          alt={submission.creator.display_name || 'Creator'}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{submission.creator?.display_name || 'Unknown Creator'}</p>
                        <div className="flex items-center flex-wrap gap-1">
                          <span className="text-xs text-gray-500">
                            {new Date(submission.created_at).toLocaleDateString()}
                          </span>
                          <StatusBadge 
                            status={submission.metrics.status} 
                            detail={submission.metrics.errorDetail} 
                            compact 
                          />
                        </div>
                      </div>
                      
                      {submission.url && (
                        <a 
                          href={submission.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center"
                        >
                          View on Instagram <ExternalLink className="w-3.5 h-3.5 ml-1" />
                        </a>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-4">
                  {/* Main Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {/* Likes */}
                    <div className="text-center p-3 bg-pink-50 rounded-lg border border-pink-100">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <Heart className="w-4 h-4 text-pink-500" />
                        <span className="text-sm font-medium text-pink-600">LIKES</span>
                      </div>
                      <div className="text-xl font-bold text-pink-700">
                        {submission.metrics.likes.toLocaleString()}
                      </div>
                      {totalMetrics.likes > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {((submission.metrics.likes / totalMetrics.likes) * 100).toFixed(1)}% of total
                        </div>
                      )}
                    </div>
                    
                    {/* Comments */}
                    <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <MessageCircle className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-blue-600">COMMENTS</span>
                      </div>
                      <div className="text-xl font-bold text-blue-700">
                        {submission.metrics.comments.toLocaleString()}
                      </div>
                      {totalMetrics.comments > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {((submission.metrics.comments / totalMetrics.comments) * 100).toFixed(1)}% of total
                        </div>
                      )}
                    </div>
                    
                    {/* Reach */}
                    <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <UsersIcon className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium text-purple-600">REACH</span>
                      </div>
                      <div className="text-xl font-bold text-purple-700">
                        {submission.metrics.reach.toLocaleString()}
                      </div>
                      {totalMetrics.reach > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {((submission.metrics.reach / totalMetrics.reach) * 100).toFixed(1)}% of total
                        </div>
                      )}
                    </div>
                    
                    {/* Saves */}
                    <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <Bookmark className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium text-yellow-600">SAVED</span>
                      </div>
                      <div className="text-xl font-bold text-yellow-700">
                        {submission.metrics.saved?.toLocaleString() || 'N/A'}
                      </div>
                      {totalMetrics.saved > 0 && submission.metrics.saved !== undefined && (
                        <div className="text-xs text-gray-500 mt-1">
                          {((submission.metrics.saved / totalMetrics.saved) * 100).toFixed(1)}% of total
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    {/* Impressions */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="font-medium text-gray-700">Impressions</div>
                      <div className="text-lg font-semibold">
                        {submission.metrics.impressions?.toLocaleString() || 'N/A'}
                      </div>
                    </div>
                    
                    {/* Engagement Rate */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="font-medium text-gray-700">Engagement Rate</div>
                      <div className="text-lg font-semibold">
                        {engagementRate}%
                      </div>
                    </div>
                    
                    {/* Video Views (if available) */}
                    {submission.metrics.video_views !== undefined && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="font-medium text-gray-700">Video Views</div>
                        <div className="text-lg font-semibold">
                          {submission.metrics.video_views.toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}