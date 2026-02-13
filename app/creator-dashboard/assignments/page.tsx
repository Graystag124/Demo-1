import { DashboardPageHeader } from "@/components/navigation/dashboard-page-header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from 'next/navigation';
import Link from "next/link";
import { 
  Briefcase, 
  CalendarDays, 
  MoreHorizontal, 
  ExternalLink,
  Instagram,
  Clapperboard,
  Image as ImageIcon,
  MessageSquare
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const STATUS_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Assigned", value: "assigned" },
  { label: "In Progress", value: "in_progress" },
  { label: "Awaiting Approval", value: "completed_awaited_approval" },
  { label: "Completed", value: "completed" },
];

export default async function CreatorAssignmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const supabase = await createClient();
  const { status: activeFilter } = await searchParams;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  let query = supabase
    .from("collaboration_assignments")
    .select(`
      id,
      status,
      created_at,
      posts_required,
      stories_required,
      reels_required,
      collaboration:collaborations (
        id,
        title
      )
    `)
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false });

  if (activeFilter && activeFilter !== "all") {
    query = query.eq("status", activeFilter);
  } else {
    query = query.in("status", ["assigned", "in_progress", "completed_awaited_approval", "completed"]);
  }

  const { data: assignments, error } = await query;

  if (error) return <div className="p-10">Error: {error.message}</div>;

  const getStatusBadge = (status: string) => {
    const config: Record<string, string> = {
      assigned: "bg-slate-100 text-slate-700 border-slate-200",
      in_progress: "bg-blue-100 text-blue-700 border-blue-200",
      completed_awaited_approval: "bg-amber-100 text-amber-700 border-amber-200",
      completed: "bg-green-100 text-green-700 border-green-200",
    };
    return config[status] || "bg-gray-100";
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-7xl">
      <DashboardPageHeader
        title="My Assignments"
        description="Track and manage your active content deliverables"
        showBackButton
      />

      {/* FILTER BUTTONS */}
      <div className="flex flex-wrap gap-1">
        {STATUS_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            variant={(!activeFilter && opt.value === 'all') || activeFilter === opt.value ? "secondary" : "ghost"}
            size="sm"
            asChild
            className="h-8 text-xs px-3"
          >
            <Link href={`/creator-dashboard/assignments?status=${opt.value}`}>
              {opt.label}
            </Link>
          </Button>
        ))}
      </div>

      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-[300px]">Collaboration</TableHead>
              <TableHead>Deliverables</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments && assignments.length > 0 ? (
              assignments.map((assignment: any) => (
                <TableRow key={assignment.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* COLLAB INFO */}
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm line-clamp-1">
                        {assignment.collaboration?.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">
                        ID: {assignment.id.slice(0, 8)}
                      </span>
                    </div>
                  </TableCell>

                  {/* DELIVERABLES */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1" title="Posts">
                        <ImageIcon className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-semibold">{assignment.posts_required || 0}</span>
                      </div>
                      <div className="flex items-center gap-1" title="Stories">
                        <MessageSquare className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-semibold">{assignment.stories_required || 0}</span>
                      </div>
                      <div className="flex items-center gap-1" title="Reels">
                        <Clapperboard className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-semibold">{assignment.reels_required || 0}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* STATUS */}
                  <TableCell>
                    <Badge variant="secondary" className={`${getStatusBadge(assignment.status)} capitalize px-2 py-0 text-[11px] font-medium border`}>
                      {assignment.status.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>

                  {/* DATE */}
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {new Date(assignment.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </TableCell>

                  {/* PRIMARY ACTION */}
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" className="h-8" asChild>
                      <Link href={`/creator-dashboard/collabs/${assignment.collaboration?.id}/assignment`}>
                        View Task
                      </Link>
                    </Button>
                  </TableCell>

                  {/* DROPDOWN */}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/creator-dashboard/collabs/${assignment.collaboration?.id}/assignment`}>
                            Open Assignment Manager
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                           <Link href={`/creator-dashboard/collabs/${assignment.collaboration?.id}`}>
                            Original Campaign Brief
                           </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Briefcase className="h-8 w-8 text-muted-foreground/30" />
                    <p className="text-muted-foreground text-sm">No {activeFilter && activeFilter !== 'all' ? activeFilter.replace('_', ' ') : ''} assignments found.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}