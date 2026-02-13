import { DashboardPageHeader } from "@/components/navigation/dashboard-page-header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from 'next/navigation';
import Link from "next/link";
import { 
  BarChart3, 
  ArrowUpRight, 
  MoreHorizontal, 
  AlertCircle,
  CalendarDays,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default async function CreatorStatsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Fetch collaborations where the creator has been assigned
  const { data: assignments, error } = await supabase
    .from("collaboration_assignments")
    .select(`
      id,
      status,
      collaboration:collaborations (
        id,
        title,
        timeline_status,
        created_at
      )
    `)
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="container mx-auto p-8 text-center text-red-500 flex flex-col items-center gap-2">
        <AlertCircle className="h-6 w-6" />
        <p>Failed to load collaborations.</p>
      </div>
    );
  }

  const validAssignments = assignments?.filter(a => a.collaboration) || [];

  const timelineStyles: Record<string, string> = {
    ongoing: "bg-green-100 text-green-700 border-green-200 hover:bg-green-100",
    starting_soon: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100",
    completed: "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100",
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-7xl">
      <DashboardPageHeader
        title="Your Performance Analytics"
        description="Monitor engagement metrics for your active and completed collaborations"
      />

      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-[350px]">Collaboration</TableHead>
              <TableHead>Campaign Timeline</TableHead>
              <TableHead>Your Status</TableHead>
              <TableHead>Joined On</TableHead>
              <TableHead className="text-right">Analytics</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {validAssignments.length > 0 ? (
              validAssignments.map(({ id, status, collaboration }: any) => (
                <TableRow key={id} className="hover:bg-slate-50/50 transition-colors">
                  {/* COLLAB INFO */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/5 rounded-lg shrink-0">
                        <BarChart3 className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-sm truncate">{collaboration.title}</span>
                        <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">
                          REF: {collaboration.id.slice(0, 8)}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* TIMELINE STATUS */}
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={`${timelineStyles[collaboration.timeline_status] || "bg-gray-100"} capitalize px-2 py-0 text-[10px] font-medium border`}
                    >
                      {collaboration.timeline_status?.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>

                  {/* ASSIGNMENT STATUS */}
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Target className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium capitalize">
                        {status?.replace(/_/g, " ")}
                      </span>
                    </div>
                  </TableCell>

                  {/* DATE */}
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {new Date(collaboration.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </TableCell>

                  {/* VIEW LINK */}
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild className="h-8 text-primary hover:text-primary hover:bg-primary/5">
                      <Link href={`/creator-dashboard/stats/${collaboration.id}`}>
                        View Report <ArrowUpRight className="ml-1.5 h-3 w-3" />
                      </Link>
                    </Button>
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
                           <Link href={`/creator-dashboard/stats/${collaboration.id}`}>Detailed Engagement Data</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                           <Link href={`/creator-dashboard/collabs/${collaboration.id}/assignment`}>View Assignment Task</Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                   No analytics data available yet. You'll see reports here once you're assigned to a campaign.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}