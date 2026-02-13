import { DashboardPageHeader } from "@/components/navigation/dashboard-page-header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from 'next/navigation';
import { Button } from "@/components/ui/button";
import Link from "next/link";
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
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Filter, MoreHorizontal, Calendar } from "lucide-react";

export default async function MyCollaborations({
  searchParams,
}: {
  searchParams: { status?: string; month?: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get current filter from URL
  const currentStatus = searchParams.status;
  const currentMonth = searchParams.month;

  let query = supabase
    .from("collaborations")
    .select(`
      *,
      collaboration_applications(count)
    `)
    .eq("business_id", user.id)
    .order("created_at", { ascending: false });

  // Apply status filter if selected
  if (currentStatus && currentStatus !== "all") {
    query = query.eq("approval_status", currentStatus);
  }

  // Apply month filter if selected
  if (currentMonth && currentMonth !== "all") {
    const currentYear = new Date().getFullYear();
    const monthIndex = parseInt(currentMonth) - 1;
    
    // Create proper date range for the selected month
    const startDate = new Date(currentYear, monthIndex, 1);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(currentYear, monthIndex + 1, 0); // Last day of selected month
    endDate.setHours(23, 59, 59, 999);
    
    query = query.gte("created_at", startDate.toISOString()).lte("created_at", endDate.toISOString());
  }

  // If filtering by "applied", only show collaborations that have applications
  if (currentStatus === "applied") {
    query = query.gt("collaboration_applications(count)", 0);
  }

  const { data: collaborations } = await query;

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    approved: "bg-green-100 text-green-800 hover:bg-green-100",
    rejected: "bg-red-100 text-red-800 hover:bg-red-100",
    applied: "bg-blue-100 text-blue-800 hover:bg-blue-100"
  };

  // Generate month options
  const months = [
    { value: "all", label: "All Months" },
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" }
  ];

  const currentMonthLabel = months.find(m => m.value === (currentMonth || "all"))?.label || "All Months";

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <DashboardPageHeader
          title="My Collaborations"
          description="Manage your collaboration posts"
        />
        <Button asChild>
          <Link href="/business-dashboard/create-collab">Create New</Link>
        </Button>
      </div>

      {/* FILTER BAR */}
      <div className="flex items-center gap-2 pb-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <Filter className="h-3.5 w-3.5" />
              <span>Filter: {currentStatus ? currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1) : "All"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[150px]">
            <DropdownMenuItem asChild><Link href="/business-dashboard/collabs?status=all">All</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href="/business-dashboard/collabs?status=applied">Applied</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href="/business-dashboard/collabs?status=approved">Approved</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href="/business-dashboard/collabs?status=pending">Pending</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href="/business-dashboard/collabs?status=rejected">Rejected</Link></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{currentMonthLabel}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[140px] max-h-60 overflow-y-auto">
            {months.map((month) => (
              <DropdownMenuItem key={month.value} asChild>
                <Link href={`/business-dashboard/collabs?status=${currentStatus || 'all'}&month=${month.value}`}>
                  {month.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-semibold text-slate-900">Collaboration Name</TableHead>
                <TableHead className="font-semibold text-slate-900">Category</TableHead>
                <TableHead className="font-semibold text-slate-900">Status</TableHead>
                <TableHead className="font-semibold text-slate-900 text-center">Applicants</TableHead>
                <TableHead className="font-semibold text-slate-900">Added On</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collaborations && collaborations.length > 0 ? (
                collaborations.map((collab: any) => (
                  <TableRow key={collab.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="text-sm">{collab.title}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">ID: {collab.id.slice(0, 8)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{collab.category}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`${statusColors[collab.approval_status] || ""} capitalize border-none text-[11px]`}>
                        {collab.approval_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm font-semibold">
                         {collab.collaboration_applications?.[0]?.count || 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(collab.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/business-dashboard/collabs/${collab.id}`}>View Details</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/business-dashboard/collabs/${collab.id}/edit`}>Edit</Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No collaborations found for the selected filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden">
          <div className="divide-y divide-slate-200">
            {collaborations && collaborations.length > 0 ? (
              collaborations.map((collab: any) => (
                <div key={collab.id} className="p-4 space-y-3 hover:bg-slate-50/50 transition-colors">
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-slate-900 line-clamp-1">{collab.title}</h3>
                      <p className="text-[10px] text-muted-foreground font-mono mt-1">ID: {collab.id.slice(0, 8)}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 flex-shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/business-dashboard/collabs/${collab.id}`}>View Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/business-dashboard/collabs/${collab.id}/edit`}>Edit</Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Category</p>
                      <p className="text-slate-900">{collab.category}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Status</p>
                      <Badge variant="secondary" className={`${statusColors[collab.approval_status] || ""} capitalize border-none text-[10px]`}>
                        {collab.approval_status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Applicants</p>
                      <p className="font-semibold text-slate-900">{collab.collaboration_applications?.[0]?.count || 0}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Added On</p>
                      <p className="text-slate-900 text-xs">
                        {new Date(collab.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                No collaborations found for the selected filters.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}