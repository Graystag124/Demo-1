import { DashboardPageHeader } from "@/components/navigation/dashboard-page-header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Instagram, MoreHorizontal, UserCircle, Users, FileText } from "lucide-react";
import { MobileApplicationsList } from "@/components/mobile-applications-list";

// Helper function for formatting counts
const formatCount = (val?: number) => 
  val ? new Intl.NumberFormat('en-US', { notation: "compact" }).format(val) : 'N/A';

// Main page component (server component)
async function ApplicationsPageContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const { data: business } = await supabase.from('users').select('*').eq('id', user.id).single();
  if (!business) return <div>Business profile not found</div>;

  const { data: collaborations } = await supabase
    .from('collaborations')
    .select('id, title')
    .eq('business_id', user.id);
  
  if (!collaborations || collaborations.length === 0) {
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-7xl">
        <DashboardPageHeader title="Collaborators" description="View your creator network" showBackButton />
        <Card className="mt-6"><CardContent className="py-12 text-center">No collaborations yet.</CardContent></Card>
      </div>
    );
  }

  const collaborationIds = collaborations.map(c => c.id);

  // Fetch Approved Applications
  const { data: appsData } = await supabase
    .from('collaboration_applications')
    .select(`
      *,
      creator:users!creator_id(id, display_name, email, instagram_handle, profile_image_url, created_at, meta_insights(*)),
      collaboration:collaborations!collaboration_id(id, title)
    `)
    .eq('approval_status', 'approved')
    .in('collaboration_id', collaborationIds);

  // Group by Creator
  const creatorsMap = new Map();
  appsData?.forEach(app => {
    if (!app.creator) return;
    const cid = app.creator.id;
    if (!creatorsMap.has(cid)) {
      creatorsMap.set(cid, { ...app.creator, collaborations: [] });
    }
    creatorsMap.get(cid).collaborations.push({
      title: app.collaboration.title,
      date: app.created_at
    });
  });

  const creators = Array.from(creatorsMap.values());

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-7xl">
      <DashboardPageHeader
        title={`${business.display_name || 'Business'} - Network`}
        description="Manage creators you have approved for campaigns"
        // showBackButton
      />

      {/* Mobile View - Card Based Layout */}
      <MobileApplicationsList creators={creators} />

      {/* Desktop View - Original Table (unchanged) */}
      <div className="hidden md:block rounded-md border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-[300px]">Creator</TableHead>
              <TableHead>Social Stats</TableHead>
              <TableHead>Active Campaigns</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Joined Network</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {creators.length > 0 ? (
              creators.map((creator: any) => (
                <TableRow key={creator.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* CREATOR CELL */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border">
                        <AvatarImage src={creator.profile_image_url} />
                        <AvatarFallback>{creator.display_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{creator.display_name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">
                          ID: {creator.id.slice(0, 8)}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* STATS CELL */}
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="font-semibold">{formatCount(creator.meta_insights?.[0]?.insights_data?.followers_count)}</span>
                        <span className="text-muted-foreground">Followers</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <FileText className="h-3 w-3" />
                        <span>{formatCount(creator.meta_insights?.[0]?.insights_data?.media_count)} Posts</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* COLLABS CELL */}
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {creator.collaborations.map((c: any, i: number) => (
                        <Badge key={i} variant="secondary" className="text-[10px] font-normal px-1.5 py-0 bg-blue-50 text-blue-700 border-blue-100">
                          {c.title}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>

                  {/* CONTACT CELL */}
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {creator.instagram_handle && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Instagram className="h-3 w-3" />
                          <span>@{creator.instagram_handle.replace('@', '')}</span>
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground truncate max-w-[150px]">{creator.email}</span>
                    </div>
                  </TableCell>

                  {/* DATE CELL */}
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(creator.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </TableCell>

                  {/* ACTIONS */}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/business-dashboard/creator/${creator.id}`} className="flex items-center">
                            <UserCircle className="mr-2 h-4 w-4" /> View Full Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Remove from Network
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No approved collaborators found in your network.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default async function ApplicationsPage() {
  return <ApplicationsPageContent />;
}