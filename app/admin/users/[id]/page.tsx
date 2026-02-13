'use server';

import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { TierBadge } from "@/components/creator/tier-badge";
import { TieredAvatar } from "@/components/creator/tiered-avatar";
import { calculateEngagementValue } from "@/lib/creator-utils";
import { 
  Instagram, 
  Users, 
  BarChart2, 
  TrendingUp, 
  ImageIcon,
  ExternalLink,
  Heart,
  MessageCircle,
  Briefcase,
  Palette,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Schema to validate UUID
const uuidSchema = z.string().uuid();

// --- Interfaces ---

interface InstagramPost {
  id: string;
  media_url: string;
  permalink: string;
  timestamp: string;
  like_count: number;
  comments_count: number;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  engagement_rate?: string;
}

interface InstagramInsights {
  profile: {
    username: string;
    name: string;
    followers_count: number;
    follows_count: number;
    media_count: number;
    profile_picture_url: string;
    avg_engagement_rate: number;
  };
  recent_posts: InstagramPost[];
}

interface User {
  id: string;
  email: string;
  display_name: string | null;
  user_type: string;
  created_at: string;
  approval_status?: string;
  instagram_handle?: string;
  bio?: string;
  niche?: string; 
  business_type?: string; 
  instagram_followers?: number;
  instagram_following?: number;
  instagram_posts?: number;
  instagram_engagement_rate?: number;
  instagram_insights?: {
    reach: number;
    impressions: number;
    profile_visits: number;
    website_clicks: number;
    email_clicks: number;
  };
  recent_posts?: InstagramPost[];
}

interface Collaboration {
  id: string;
  title: string;
  created_at: string;
  status?: string; // Made optional to handle potential missing data
  budget_range?: string;
  location_type?: string;
  platform?: string;
  business_id: string;
}

interface Application {
  id: string;
  status?: string; // Made optional
  created_at: string;
  pitch?: string;
  collaboration: Collaboration; 
  collaboration_id: string;
}

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// --- Helper Functions ---

function formatDate(dateString: string) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// FIXED: Handle undefined/null status
function getStatusColor(status?: string | null) {
  if (!status) return 'secondary'; // Default fallback
  
  switch (status.toLowerCase()) {
    case 'active':
    case 'accepted':
    case 'open':
    case 'approved':
      return 'default'; 
    case 'pending':
      return 'secondary'; 
    case 'completed':
      return 'outline';
    case 'rejected':
    case 'cancelled':
      return 'destructive';
    default:
      return 'secondary';
  }
}

async function getInstagramInsights(userId: string): Promise<InstagramInsights | null> {
  const supabase = await createClient();
  const { data: userData } = await supabase
    .from("users")
    .select("meta_page_access_token, instagram_business_account_id")
    .eq("id", userId)
    .single();

  if (!userData?.meta_page_access_token || !userData?.instagram_business_account_id) {
    return null;
  }

  try {
    const profileResponse = await fetch(
      `https://graph.facebook.com/v21.0/${userData.instagram_business_account_id}?fields=username,name,followers_count,follows_count,media_count,profile_picture_url&access_token=${userData.meta_page_access_token}`
    );
    const profileData = await profileResponse.json();

    if (profileData.error) throw new Error(profileData.error.message);

    const postsResponse = await fetch(
      `https://graph.facebook.com/v21.0/${userData.instagram_business_account_id}/media?fields=id,like_count,comments_count,media_type,media_url,permalink,thumbnail_url,timestamp&limit=20&access_token=${userData.meta_page_access_token}`
    );
    const postsData = await postsResponse.json();
    
    let totalEngagementRateSum = 0;
    let validPostsCount = 0;

    const recentPosts = postsData.data?.map((post: any) => {
      const likes = post.like_count || 0;
      const comments = post.comments_count || 0;
      const totalInteractions = likes + comments;
      
      let engagementRate = 0;
      if (profileData.followers_count > 0) {
        engagementRate = (totalInteractions / profileData.followers_count) * 100;
        totalEngagementRateSum += engagementRate;
        validPostsCount++;
      }

      return {
        id: post.id,
        media_url: post.media_type === 'VIDEO' && post.thumbnail_url ? post.thumbnail_url : post.media_url, 
        permalink: post.permalink,
        timestamp: post.timestamp,
        like_count: likes,
        comments_count: comments,
        media_type: post.media_type,
        engagement_rate: engagementRate.toFixed(2)
      };
    });

    const avgEngagementRate = validPostsCount > 0 
      ? (totalEngagementRateSum / validPostsCount).toFixed(2) 
      : "0";

    return { 
      profile: {
        ...profileData,
        avg_engagement_rate: parseFloat(avgEngagementRate)
      },
      recent_posts: recentPosts || []
    };
  } catch (error) {
    console.error("[v0] Error fetching Instagram insights (admin):", error);
    return null;
  }
}

// --- Main Component ---

export default async function AdminUserProfile({ params }: PageProps) {
  const { id } = await params;
  
  const validation = uuidSchema.safeParse(id);
  if (!validation.success) {
    throw new Error('Invalid user ID format');
  }

  try {
    const supabase = await createClient();
    
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (userError) throw userError;
    if (!user) throw new Error('User not found');

    const instagramInsights = user.instagram_handle ? await getInstagramInsights(user.id) : null;

    // Calculate engagement value for tier badge if user is a creator
    const engagementValue = user.user_type === 'creator' && instagramInsights?.profile ? calculateEngagementValue({
      followers_count: instagramInsights.profile.followers_count || 0,
      average_engagement_rate: instagramInsights.profile.avg_engagement_rate || 0,
      total_posts: instagramInsights.profile.media_count || 0
    }) : 0;

    const userWithInsights: User = {
      ...user,
      instagram_followers: instagramInsights?.profile?.followers_count || 0,
      instagram_following: instagramInsights?.profile?.follows_count || 0,
      instagram_posts: instagramInsights?.profile?.media_count || 0,
      instagram_engagement_rate: instagramInsights?.profile?.avg_engagement_rate || user.instagram_engagement_rate || 0,
      instagram_insights: user.instagram_insights || {
        reach: 0,
        impressions: 0,
        profile_visits: 0,
        website_clicks: 0,
        email_clicks: 0
      },
      recent_posts: instagramInsights?.recent_posts || []
    };

    const [
      { data: collaborations, error: collabError },
      { data: applications, error: appsError }
    ] = await Promise.all([
      supabase
        .from("collaborations")
        .select("*")
        .eq("business_id", id)
        .order('created_at', { ascending: false }),
      
      supabase
        .from("collaboration_applications")
        .select("*, collaboration:collaborations(*)")
        .eq("creator_id", id)
        .order('created_at', { ascending: false })
    ]);

    if (collabError) throw collabError;
    if (appsError) throw appsError;

    const totalCollaborations = collaborations?.length || 0;
    const totalApplications = applications?.length || 0;
    const acceptedApplications = applications?.filter((app: Application) => app.status === 'accepted').length || 0;

    return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
             <Link href="/admin/users">
              <Button variant="outline" size="icon">
                  <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
             {user.user_type === 'creator' ? (
                <TieredAvatar
                  engagementValue={engagementValue}
                  src={instagramInsights?.profile?.profile_picture_url}
                  alt={user.display_name || user.email}
                  fallback={user.display_name?.[0] || user.email?.[0] || 'U'}
                  size="lg"
                />
              ) : instagramInsights?.profile?.profile_picture_url ? (
                <div className="h-16 w-16 relative rounded-full overflow-hidden border flex-shrink-0">
                  <Image 
                    src={instagramInsights.profile.profile_picture_url} 
                    alt="Profile" 
                    fill 
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                  <Users className="h-8 w-8" />
                </div>
              )}
            <div>
              <h1 className="text-3xl font-bold">{userWithInsights.display_name || 'User'}</h1>
              <p className="text-muted-foreground">{userWithInsights.email}</p>
              {userWithInsights.instagram_handle && (
                <div className="flex items-center mt-1">
                  <Instagram className="h-4 w-4 mr-1" />
                  <a 
                    href={`https://instagram.com/${userWithInsights.instagram_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center"
                  >
                    @{userWithInsights.instagram_handle}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Badges Section */}
          <style>{`
            .approved-badge-green {
              background-color: #10b981 !important;
              color: #ffffff !important;
              border-color: #10b981 !important;
              background: #10b981 !important;
            }
          `}</style>
          <div className="flex flex-wrap items-center gap-2">
            
            {userWithInsights.user_type === 'creator' && userWithInsights.niche && (
              <Badge variant="secondary" className="flex items-center gap-1 capitalize">
                <Palette className="h-3 w-3" />
                {userWithInsights.niche.toLowerCase()}
              </Badge>
            )}

            {userWithInsights.user_type === 'business' && userWithInsights.business_type && (
              <Badge variant="secondary" className="flex items-center gap-1 capitalize">
                <Briefcase className="h-3 w-3" />
                {userWithInsights.business_type.toLowerCase()}
              </Badge>
            )}

            {userWithInsights.approval_status === 'approved' ? (
              <Badge variant="outline" className="capitalize">
                approved
              </Badge>
            ) : (
              <Badge variant="outline" className="capitalize">
                {userWithInsights.approval_status || 'pending'}
              </Badge>
            )}

            <Badge variant="outline" className="capitalize">
              {userWithInsights.user_type}
            </Badge>
            
            {userWithInsights.user_type === 'creator' && engagementValue > 0 && (
              <TierBadge 
                engagementValue={engagementValue}
                showProgress={false}
                size="sm"
              />
            )}
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {userWithInsights.instagram_handle && <TabsTrigger value="instagram">Instagram</TabsTrigger>}
            <TabsTrigger value="collaborations">Collaborations</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Platform Activity</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                 <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold">{totalApplications}</div>
                    <div className="text-sm text-muted-foreground">Total Applications</div>
                 </div>
                 <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold">{acceptedApplications}</div>
                    <div className="text-sm text-muted-foreground">Accepted Jobs</div>
                 </div>
                 <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold">{totalCollaborations}</div>
                    <div className="text-sm text-muted-foreground">Hosted Collabs</div>
                 </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instagram" className="space-y-6">
            {userWithInsights.instagram_handle ? (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Followers</CardTitle>
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Users className="h-4 w-4 text-blue-500" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {userWithInsights.instagram_followers?.toLocaleString() || 'N/A'}
                      </div>
                      <p className="text-xs text-muted-foreground">Total followers</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Following</CardTitle>
                      <div className="p-2 bg-purple-500/10 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-purple-500" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {userWithInsights.instagram_following?.toLocaleString() || 'N/A'}
                      </div>
                      <p className="text-xs text-muted-foreground">Accounts followed</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Posts</CardTitle>
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <ImageIcon className="h-4 w-4 text-green-500" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {userWithInsights.instagram_posts?.toLocaleString() || 'N/A'}
                      </div>
                      <p className="text-xs text-muted-foreground">Total posts</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Engagement</CardTitle>
                      <div className="p-2 bg-yellow-500/10 rounded-lg">
                        <BarChart2 className="h-4 w-4 text-yellow-500" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {userWithInsights.instagram_engagement_rate}%
                      </div>
                      <p className="text-xs text-muted-foreground">Avg. rate (last 20 posts)</p>
                    </CardContent>
                  </Card>
                </div>

                {userWithInsights.instagram_insights && (userWithInsights.instagram_insights.reach > 0) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>30-Day Performance</CardTitle>
                      <CardDescription>Based on stored insights data</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div className="p-4 border rounded-lg">
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Reach</h3>
                          <p className="text-2xl font-bold">
                            {userWithInsights.instagram_insights.reach?.toLocaleString()}
                          </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Impressions</h3>
                          <p className="text-2xl font-bold">
                            {userWithInsights.instagram_insights.impressions?.toLocaleString()}
                          </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Profile Visits</h3>
                          <p className="text-2xl font-bold">
                            {userWithInsights.instagram_insights.profile_visits?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {userWithInsights.recent_posts && userWithInsights.recent_posts.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Recent Posts & Performance</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {userWithInsights.recent_posts.map((post) => (
                        <div key={post.id} className="group relative border rounded-lg overflow-hidden bg-card">
                          <div className="aspect-square relative bg-muted">
                            {post.media_url ? (
                               <Image
                                 src={post.media_url}
                                 alt="Post"
                                 fill
                                 className="object-cover transition-transform group-hover:scale-105"
                               />
                            ) : (
                               <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                 <ImageIcon className="h-8 w-8" />
                               </div>
                            )}
                            <a 
                              href={post.permalink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                            >
                               <ExternalLink className="h-6 w-6 text-white drop-shadow-md" />
                            </a>
                          </div>
                          <div className="p-3 space-y-2">
                             <div className="flex justify-between text-sm">
                                <div className="flex items-center gap-1">
                                   <Heart className="h-3 w-3 text-muted-foreground" />
                                   <span className="text-xs font-medium">{post.like_count}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                   <MessageCircle className="h-3 w-3 text-muted-foreground" />
                                   <span className="text-xs font-medium">{post.comments_count}</span>
                                </div>
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No Instagram account connected</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* --- COLLABORATIONS TAB --- */}
          <TabsContent value="collaborations" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">Hosted Collaborations</h2>
              <Badge variant="outline">{totalCollaborations}</Badge>
            </div>
            
            {collaborations && collaborations.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {collaborations.map((collab: Collaboration) => (
                  <Card key={collab.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-base font-medium break-words">
                          {collab.title}
                        </CardTitle>
                        <Badge variant={getStatusColor(collab.status) as any} className="shrink-0 capitalize">
                          {collab.status || 'Unknown'}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-1 text-xs">
                         <Clock className="h-3 w-3" /> Created {formatDate(collab.created_at)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                         {collab.budget_range && (
                           <div className="flex items-center gap-2 text-muted-foreground">
                              <DollarSign className="h-4 w-4 text-zinc-400" />
                              <span>{collab.budget_range}</span>
                           </div>
                         )}
                         {collab.location_type && (
                           <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="h-4 w-4 text-zinc-400" />
                              <span className="capitalize">{collab.location_type}</span>
                           </div>
                         )}
                      </div>
                    </CardContent>
                    <CardFooter className="bg-muted/40 p-3">
                        {/* <Link href={`/admin/collaborations/${collab.id}`} className="w-full">
                            <Button variant="ghost" size="sm" className="w-full text-xs h-8">
                                View Details <ExternalLink className="ml-2 h-3 w-3" />
                            </Button>
                        </Link> */}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
               <Card className="bg-muted/40 border-dashed">
                 <CardContent className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                    <Briefcase className="h-10 w-10 mb-2 opacity-50" />
                    <p>No collaborations hosted yet.</p>
                 </CardContent>
               </Card>
            )}
          </TabsContent>

          {/* --- APPLICATIONS TAB --- */}
          <TabsContent value="applications" className="space-y-4">
             <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">Application History</h2>
              <Badge variant="outline">{totalApplications}</Badge>
            </div>

            {applications && applications.length > 0 ? (
               <div className="space-y-3">
                  {applications.map((app: Application) => (
                    <Card key={app.id}>
                       <div className="flex flex-col md:flex-row items-start md:items-center p-4 gap-4">
                          <div className="flex-1 space-y-1">
                             <div className="flex items-center gap-2">
                                <span className="font-medium text-yellow-600">Applied to:</span>
                                <span className="text-muted-foreground">
                                    {app.collaboration?.title || "Unknown Collaboration"}
                                </span>
                             </div>
                             <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" /> {formatDate(app.created_at)}
                                </span>
                                {app.collaboration?.budget_range && (
                                   <span className="flex items-center gap-1">
                                      <DollarSign className="h-3 w-3" /> {app.collaboration.budget_range}
                                   </span>
                                )}
                             </div>
                             {app.pitch && (
                               <p className="text-sm mt-2 p-2 bg-muted/50 rounded-md italic text-muted-foreground line-clamp-2">
                                 "{app.pitch}"
                               </p>
                             )}
                          </div>
                          
                          <div className="flex items-center gap-3 shrink-0 w-full md:w-auto mt-2 md:mt-0">
                              <Badge 
                                variant={
                                    app.status === 'accepted' ? 'default' : 
                                    app.status === 'rejected' ? 'destructive' : 'secondary'
                                }
                                className="capitalize flex items-center gap-1"
                              >
                                {app.status === 'accepted' && <CheckCircle2 className="h-3 w-3" />}
                                {app.status === 'rejected' && <XCircle className="h-3 w-3" />}
                                {app.status === 'pending' && <AlertCircle className="h-3 w-3" />}
                                {app.status || 'Pending'}
                              </Badge>
                              {/* <Link href={`/admin/applications/${app.id}`}>
                                <Button size="icon" variant="outline" className="h-8 w-8">
                                   <ExternalLink className="h-4 w-4" />
                                </Button>
                              </Link> */}
                          </div>
                       </div>
                    </Card>
                  ))}
               </div>
            ) : (
                <Card className="bg-muted/40 border-dashed">
                 <CardContent className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                    <CheckCircle2 className="h-10 w-10 mb-2 opacity-50" />
                    <p>No applications submitted yet.</p>
                 </CardContent>
               </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  } catch (error) {
    console.error('Error:', error);
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="ml-3">
            <p className="text-sm text-red-700">
              {error instanceof Error ? error.message : 'An error occurred while loading the user profile.'}
            </p>
          </div>
        </div>
      </div>
    );
  }
}