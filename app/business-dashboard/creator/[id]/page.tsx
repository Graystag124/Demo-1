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
  status?: string;
  budget_range?: string;
  location_type?: string;
  platform?: string;
  business_id: string;
}

interface Application {
  id: string;
  status?: string;
  created_at: string;
  pitch?: string;
  collaboration: Collaboration; 
  collaboration_id: string;
}

interface PageProps {
  params: Promise<{ id: string }>
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

function getStatusColor(status?: string | null) {
  if (!status) return 'secondary';
  switch (status.toLowerCase()) {
    case 'active':
    case 'accepted':
    case 'open':
    case 'approved': return 'default'; 
    case 'pending': return 'secondary'; 
    case 'completed': return 'outline';
    case 'rejected':
    case 'cancelled': return 'destructive';
    default: return 'secondary';
  }
}

async function getInstagramInsights(userId: string): Promise<InstagramInsights | null> {
  const supabase = await createClient();
  const { data: userData } = await supabase
    .from("users")
    .select("meta_page_access_token, instagram_business_account_id")
    .eq("id", userId)
    .single();

  if (!userData?.meta_page_access_token || !userData?.instagram_business_account_id) return null;

  // Set timeout to prevent "Fetch failed" from hanging the whole page
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const profileResponse = await fetch(
      `https://graph.facebook.com/v21.0/${userData.instagram_business_account_id}?fields=username,name,followers_count,follows_count,media_count,profile_picture_url&access_token=${userData.meta_page_access_token}`,
      { signal: controller.signal }
    );
    const profileData = await profileResponse.json();
    if (profileData.error) throw new Error(profileData.error.message);

    const postsResponse = await fetch(
      `https://graph.facebook.com/v21.0/${userData.instagram_business_account_id}/media?fields=id,like_count,comments_count,media_type,media_url,permalink,thumbnail_url,timestamp&limit=20&access_token=${userData.meta_page_access_token}`,
      { signal: controller.signal }
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

    return { 
      profile: {
        ...profileData,
        avg_engagement_rate: validPostsCount > 0 ? (totalEngagementRateSum / validPostsCount) : 0
      },
      recent_posts: recentPosts || []
    };
  } catch (error) {
    console.error("[Instagram API Error]:", error);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

// --- Main Page Component ---
export default async function AdminUserProfile({ params }: PageProps) {
  const { id } = await params;
  
  const validation = uuidSchema.safeParse(id);
  if (!validation.success) throw new Error('Invalid user ID format');

  const supabase = await createClient();
  
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (userError || !user) throw new Error('User not found');

  const instagramInsights = user.instagram_handle ? await getInstagramInsights(user.id) : null;

  // Calculate engagement value for tier badge
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
    recent_posts: instagramInsights?.recent_posts || []
  };

  const [
    { data: collaborations },
    { data: applications }
  ] = await Promise.all([
    supabase.from("collaborations").select("*").eq("business_id", id).order('created_at', { ascending: false }),
    supabase.from("collaboration_applications").select("*, collaboration:collaborations(*)").eq("creator_id", id).order('created_at', { ascending: false })
  ]);

  const totalCollaborations = collaborations?.length || 0;
  const totalApplications = applications?.length || 0;
  const acceptedApplications = applications?.filter((app: any) => app.status === 'accepted').length || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/business-dashboard/search">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          {user.user_type === 'creator' ? (
            <TieredAvatar
              engagementValue={engagementValue}
              src={instagramInsights?.profile?.profile_picture_url || user.profile_image_url}
              alt={user.display_name || user.email}
              fallback={user.display_name?.[0] || 'U'}
              size="lg"
            />
          ) : (
            <div className="h-16 w-16 relative rounded-full overflow-hidden border flex-shrink-0">
              <Image 
                src={instagramInsights?.profile?.profile_picture_url || user.profile_image_url || '/placeholder.png'} 
                alt="Profile" 
                fill 
                className="object-cover"
              />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold">
              {userWithInsights.instagram_handle ? userWithInsights.instagram_handle : (userWithInsights.display_name || 'User')}
            </h1>
            <p className="text-muted-foreground">{userWithInsights.display_name || userWithInsights.email}</p>
            {userWithInsights.instagram_handle && (
              <div className="flex items-center mt-1">
                <Instagram className="h-4 w-4 mr-1" />
                <a 
                  href={`https://instagram.com/${userWithInsights.instagram_handle}`}
                  target="_blank"
                  className="text-sm text-blue-600 hover:underline flex items-center"
                >
                  {userWithInsights.instagram_handle}
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {userWithInsights.niche && (
            <Badge variant="secondary" className="flex items-center gap-1 capitalize">
              <Palette className="h-3 w-3" /> {userWithInsights.niche.toLowerCase()}
            </Badge>
          )}
          <Badge variant={userWithInsights.approval_status === 'approved' ? 'default' : 'secondary'} className="capitalize">
            {userWithInsights.approval_status || 'pending'}
          </Badge>
          <Badge variant="outline" className="capitalize">{userWithInsights.user_type}</Badge>
          {userWithInsights.user_type === 'creator' && engagementValue > 0 && (
            <TierBadge engagementValue={engagementValue} showProgress={false} size="sm" />
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

        {/* --- OVERVIEW TAB --- */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Platform Activity</CardTitle></CardHeader>
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

        {/* --- INSTAGRAM TAB --- */}
        <TabsContent value="instagram" className="space-y-6">
          {userWithInsights.instagram_handle ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Followers</CardTitle>
                    <Users className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{userWithInsights.instagram_followers?.toLocaleString() || 'N/A'}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Engagement</CardTitle>
                    <BarChart2 className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {/* FIXED TO 2 DECIMAL PLACES */}
                      {Number(userWithInsights.instagram_engagement_rate).toFixed(2)}%
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Posts</CardTitle>
                    <ImageIcon className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{userWithInsights.instagram_posts}</div>
                  </CardContent>
                </Card>
              </div>

              {userWithInsights.recent_posts && userWithInsights.recent_posts.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Recent Posts</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {userWithInsights.recent_posts.map((post) => (
                      <div key={post.id} className="group relative border rounded-lg overflow-hidden aspect-square bg-muted">
                        <Image src={post.media_url} alt="Post" fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 text-white transition-opacity">
                            <div className="flex items-center gap-1"><Heart className="h-4 w-4" /> {post.like_count}</div>
                            <div className="flex items-center gap-1"><MessageCircle className="h-4 w-4" /> {post.comments_count}</div>
                        </div>
                        <a href={post.permalink} target="_blank" className="absolute inset-0 z-10" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-10 text-muted-foreground">No Instagram account connected.</div>
          )}
        </TabsContent>

        {/* --- COLLABORATIONS TAB --- */}
        <TabsContent value="collaborations" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Hosted Collaborations</h2>
            <Badge variant="outline">{totalCollaborations}</Badge>
          </div>
          {collaborations && collaborations.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {collaborations.map((collab: Collaboration) => (
                <Card key={collab.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">{collab.title}</CardTitle>
                      <Badge variant={getStatusColor(collab.status) as any}>{collab.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {collab.location_type}</div>
                    <div className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> {collab.budget_range}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-muted/40 border-dashed p-8 text-center text-muted-foreground">
              <Briefcase className="mx-auto h-10 w-10 mb-2 opacity-50" />
              <p>No collaborations hosted yet.</p>
            </Card>
          )}
        </TabsContent>

        {/* --- APPLICATIONS TAB --- */}
        <TabsContent value="applications" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Application History</h2>
            <Badge variant="outline">{totalApplications}</Badge>
          </div>
          {applications && applications.length > 0 ? (
            <div className="space-y-3">
              {applications.map((app: Application) => (
                <Card key={app.id} className="p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex-1">
                    <p className="font-medium">Applied to: {app.collaboration?.title}</p>
                    <p className="text-xs text-muted-foreground"><Calendar className="inline h-3 w-3 mr-1" /> {formatDate(app.created_at)}</p>
                  </div>
                  <Badge variant={app.status === 'accepted' ? 'default' : 'secondary'}>{app.status || 'Pending'}</Badge>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-muted/40 border-dashed p-8 text-center text-muted-foreground">
              <CheckCircle2 className="mx-auto h-10 w-10 mb-2 opacity-50" />
              <p>No applications submitted yet.</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}