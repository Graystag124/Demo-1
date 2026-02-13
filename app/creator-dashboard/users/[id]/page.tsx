'use server';

import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Instagram, 
  Users, 
  BarChart2, 
  TrendingUp, 
  ImageIcon,
  Briefcase,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  ArrowLeft,
  CheckCircle2,
  Globe
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>
}

async function getInstagramInsights(userId: string) {
  const supabase = await createClient();
  const { data: userData } = await supabase
    .from("users")
    .select("meta_page_access_token, instagram_business_account_id")
    .eq("id", userId)
    .single();

  if (!userData?.meta_page_access_token || !userData?.instagram_business_account_id) return null;

  try {
    const profileResponse = await fetch(
      `https://graph.facebook.com/v21.0/${userData.instagram_business_account_id}?fields=username,name,followers_count,follows_count,media_count,profile_picture_url&access_token=${userData.meta_page_access_token}`
    );
    const profileData = await profileResponse.json();
    return { profile: profileData };
  } catch (error) {
    return null;
  }
}

export default async function CreatorPublicProfile({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
    
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (!user || user.user_type !== 'creator') notFound();

  const instagramInsights = await getInstagramInsights(user.id);

  // Get collaborations where this creator has participated
  const { data: collaborations } = await supabase
    .from("collaboration_applications")
    .select("*, collaborations(*, business:business_id(*))")
    .eq("creator_id", id)
    .eq("status", "accepted")
    .order('created_at', { ascending: false });

  // Get creator's content metrics
  const { data: contentMetrics } = await supabase
    .from("creator_content_metrics")
    .select("*")
    .eq("creator_id", id)
    .single();

  // Calculate metrics
  const totalCollabs = collaborations?.length || 0;
  const completedCollabs = collaborations?.filter(c => c.collaborations?.timeline_status === 'completed').length || 0;
  const activeCollabs = collaborations?.filter(c => c.collaborations?.is_active).length || 0;

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-5xl">
      {/* HEADER SECTION - Matches your 2nd code snippet exactly */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/creator-dashboard/discover">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          
          {instagramInsights?.profile?.profile_picture_url ? (
            <div className="h-16 w-16 relative rounded-full overflow-hidden border flex-shrink-0">
              <Image 
                src={instagramInsights.profile.profile_picture_url} 
                alt="Profile" 
                fill 
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <Briefcase className="h-8 w-8" />
            </div>
          )}
          
          <div>
            <h1 className="text-2xl font-bold">{user.display_name || user.username || 'Creator'}</h1>
            <p className="text-sm text-muted-foreground">{user.bio || 'Content Creator'}</p>
            {user.instagram_handle && (
              <div className="flex items-center mt-1 text-sm text-primary font-medium">
                <Instagram className="h-3.5 w-3.5 mr-1" />
                @{user.instagram_handle}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
            <Badge variant="default" className="bg-blue-600">Creator</Badge>
            {user.creator_category && (
              <Badge variant="secondary" className="capitalize">{user.creator_category}</Badge>
            )}
            <Badge variant="outline" className="capitalize">
              {user.approval_status === 'approved' ? 'Verified' : 'Pending'}
            </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="collaborations">My Collabs</TabsTrigger>
          {user.instagram_handle && <TabsTrigger value="instagram">Instagram</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="border-none shadow-sm bg-muted/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Activity Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 grid-cols-2 md:grid-cols-4 pb-6">
               <div className="p-3 border rounded-lg bg-background text-center space-y-1">
                  <div className="text-xl font-bold text-blue-600">{completedCollabs}</div>
                  <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Completed</div>
               </div>
               <div className="p-3 border rounded-lg bg-background text-center space-y-1">
                  <div className="text-xl font-bold text-green-600">{activeCollabs}</div>
                  <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Active</div>
               </div>
               <div className="p-3 border rounded-lg bg-background text-center space-y-1">
                  <div className="text-xl font-bold">{totalCollabs}</div>
                  <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Total Collabs</div>
               </div>
               <div className="p-3 border rounded-lg bg-background text-center space-y-1">
                  <div className="text-xl font-bold">{contentMetrics?.total_impressions?.toLocaleString() || '0'}</div>
                  <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Impressions</div>
               </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">About Me</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.bio && (
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{user.bio}</p>
              )}
              {user.content_categories && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {user.content_categories.map((category: string) => (
                    <Badge key={category} variant="secondary" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* COMPACT COLLABORATIONS TAB */}
        <TabsContent value="collaborations" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-tight">My Collaborations</h2>
            <Badge variant="outline" className="text-[10px]">{totalCollabs} total</Badge>
          </div>
          
          <div className="grid gap-3 md:grid-cols-2">
            {collaborations?.map((collab) => (
              <Card key={collab.id} className="overflow-hidden border-muted/60 shadow-none hover:border-primary/40 transition-colors">
                <CardContent className="p-3 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-sm font-bold truncate">{collab.title}</h3>
                    <Badge variant={collab.timeline_status === 'completed' ? 'outline' : 'default'} className="text-[9px] h-4 py-0 shrink-0">
                      {collab.timeline_status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="h-3 w-3" /> {collab.compensation || collab.collaboration_type}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3" /> {collab.collaboration_mode === 'virtual' ? 'Remote' : collab.location || 'Local'}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3 w-3" /> {collab.collaboration_applications?.[0]?.count || 0} applications
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3" /> {new Date(collab.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <Link href={`/creator-dashboard/collaborations/${collab.id}`} className="block pt-1">
                    <Button variant="secondary" size="sm" className="w-full h-7 text-[10px] font-bold">
                      VIEW & APPLY
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* REDUCED SIZE INSTAGRAM TAB */}
        <TabsContent value="instagram" className="space-y-6">
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-none">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="p-1.5 bg-blue-500/10 rounded-md">
                  <Users className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">Followers</p>
                  <p className="text-sm font-bold">{instagramInsights?.profile?.followers_count?.toLocaleString() || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-none">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="p-1.5 bg-purple-500/10 rounded-md">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">Following</p>
                  <p className="text-sm font-bold">{instagramInsights?.profile?.follows_count?.toLocaleString() || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-none">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="p-1.5 bg-green-500/10 rounded-md">
                  <ImageIcon className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">Posts</p>
                  <p className="text-sm font-bold">{instagramInsights?.profile?.media_count?.toLocaleString() || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-none">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="p-1.5 bg-orange-500/10 rounded-md">
                  <BarChart2 className="h-4 w-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">Engagement</p>
                  <p className="text-sm font-bold">4.8%</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}