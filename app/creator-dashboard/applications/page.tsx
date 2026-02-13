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

  DropdownMenuTrigger,

} from "@/components/ui/dropdown-menu";

import { Filter, MoreHorizontal, ExternalLink, CalendarDays } from "lucide-react";



export default async function MyApplications({

  searchParams,

}: {

  searchParams: { status?: string };

}) {

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();



  if (!user) redirect("/auth/login");



  const currentFilter = searchParams.status || "all";



  // Base Query

  let query = supabase

    .from("collaboration_applications")

    .select(`

      *,

      collaboration:collaborations!collaboration_applications_collaboration_id_fkey(

        id,

        title,

        business:users!collaborations_business_id_fkey(

          display_name,

          instagram_handle

        )

      )

    `)

    .eq("creator_id", user.id)

    .order("created_at", { ascending: false });



  // Apply basic status filtering if requested

  if (currentFilter !== "all") {

    query = query.eq("status", currentFilter);

  }



  const { data: applications, error } = await query;



  if (error) return <div className="p-6 text-red-500">Error loading applications.</div>;



  // Render Status Badge using your specific logic

  const renderStatusBadge = (app: any) => {

    if (app.status === 'accepted' && app.approval_status === 'approved') {

      return <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100 capitalize">Approved for Assignment</Badge>;

    }

    if (app.approval_status === 'rejected') {

      return <Badge variant="destructive" className="capitalize">Rejected by Admin</Badge>;

    }

    if (app.status === 'rejected') {

      return <Badge variant="destructive" className="capitalize">Rejected by Business</Badge>;

    }

    

    const statusColors: Record<string, string> = {

      applied: "bg-yellow-100 text-yellow-800 border-yellow-200",

      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",

      completed: "bg-purple-100 text-purple-800 border-purple-200"

    };



    return (

      <Badge variant="secondary" className={`${statusColors[app.status] || "bg-gray-100"} border capitalize`}>

        {app.status}

      </Badge>

    );

  };



  return (

    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-7xl">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <DashboardPageHeader

          title="My Applications"

          description="Track the status of your collaboration applications"

          showBackButton

        />

        <Button asChild>

          <Link href="/creator-dashboard/discover">Discover Collabs</Link>

        </Button>

      </div>



      {/* FILTER BAR */}

      <div className="flex items-center gap-2">

        <DropdownMenu>

          <DropdownMenuTrigger asChild>

            <Button variant="outline" size="sm" className="h-8 gap-1">

              <Filter className="h-3.5 w-3.5" />

              <span>Filter: {currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1)}</span>

            </Button>

          </DropdownMenuTrigger>

          <DropdownMenuContent align="start">

            <DropdownMenuItem asChild><Link href="/creator-dashboard/applications?status=all">All</Link></DropdownMenuItem>

            <DropdownMenuItem asChild><Link href="/creator-dashboard/applications?status=accepted">Accepted</Link></DropdownMenuItem>

            <DropdownMenuItem asChild><Link href="/creator-dashboard/applications?status=pending">Pending</Link></DropdownMenuItem>

            <DropdownMenuItem asChild><Link href="/creator-dashboard/applications?status=rejected">Rejected</Link></DropdownMenuItem>

          </DropdownMenuContent>

        </DropdownMenu>

      </div>



      <div className="rounded-md border bg-white shadow-sm overflow-hidden">

        {/* Desktop Table View */}

        <div className="hidden lg:block">

          <Table>

            <TableHeader className="bg-slate-50/50">

              <TableRow>

                <TableHead className="w-[300px]">Collaboration</TableHead>

                <TableHead>Business</TableHead>

                <TableHead>Status</TableHead>

                <TableHead>Applied On</TableHead>

                <TableHead className="text-right">Action</TableHead>

                <TableHead className="w-[50px]"></TableHead>

              </TableRow>

            </TableHeader>

            <TableBody>

              {applications && applications.length > 0 ? (

                applications.map((app: any) => (

                  <TableRow key={app.id} className="hover:bg-slate-50/50 transition-colors">

                    {/* COLLAB INFO */}

                    <TableCell>

                      <div className="flex flex-col">

                        <span className="font-medium text-sm line-clamp-1">

                          {app.collaboration?.title || "Untitled Collaboration"}

                        </span>

                        <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">

                          ID: {app.id.slice(0, 8)}

                        </span>

                      </div>

                    </TableCell>



                    {/* BUSINESS INFO */}

                    <TableCell>

                      <span className="text-sm text-muted-foreground">

                        {app.collaboration?.business?.display_name || app.collaboration?.business?.instagram_handle || '—'}

                      </span>

                    </TableCell>



                    {/* STATUS */}

                    <TableCell>

                      {renderStatusBadge(app)}

                    </TableCell>



                    {/* DATE */}

                    <TableCell>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">

                        <CalendarDays className="h-3.5 w-3.5" />

                        {new Date(app.created_at).toLocaleDateString()}

                      </div>

                    </TableCell>



                    {/* PRIMARY ACTION */}

                    <TableCell className="text-right">

                      {app.approval_status === 'approved' && app.status === 'accepted' ? (

                        <Button size="sm" variant="default" className="h-8" asChild>

                          <Link href={`/creator-dashboard/collabs/${app.collaboration_id}/assignment`}>

                            View Assignment

                          </Link>

                        </Button>

                      ) : (

                        <Button size="sm" variant="outline" className="h-8" asChild>

                          <Link href={`/creator-dashboard/collabs/${app.collaboration_id}`}>

                            View Collab

                          </Link>

                        </Button>

                      )}

                    </TableCell>



                    {/* DROPDOWN ACTIONS */}

                    <TableCell>

                      <DropdownMenu>

                        <DropdownMenuTrigger asChild>

                          <Button variant="ghost" className="h-8 w-8 p-0">

                            <MoreHorizontal className="h-4 w-4" />

                          </Button>

                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">

                          <DropdownMenuItem asChild>

                             <Link href={`/creator-dashboard/collabs/${app.collaboration_id}`}>

                              Collaboration Brief

                             </Link>

                          </DropdownMenuItem>

                          {app.message && (

                             <DropdownMenuItem onSelect={() => alert(`Your Message: ${app.message}`)}>

                               View Your Message

                             </DropdownMenuItem>

                          )}

                        </DropdownMenuContent>

                      </DropdownMenu>

                    </TableCell>

                  </TableRow>

                ))

              ) : (

                <TableRow>

                  <TableCell colSpan={6} className="h-32 text-center">

                    <p className="text-muted-foreground text-sm">No applications found.</p>

                    <Button variant="link" asChild className="mt-1">

                      <Link href="/creator-dashboard/discover">Browse opportunities</Link>

                    </Button>

                  </TableCell>

                </TableRow>

              )}

            </TableBody>

          </Table>

        </div>



        {/* Mobile Card View */}

        <div className="lg:hidden">

          <div className="divide-y divide-slate-200">

            {applications && applications.length > 0 ? (

              applications.map((app: any) => (

                <div key={app.id} className="p-4 space-y-4 hover:bg-slate-50/50 transition-colors">

                  {/* Header */}

                  <div className="flex items-start justify-between gap-3">

                    <div className="flex-1 min-w-0">

                      <h3 className="font-medium text-sm text-slate-900 line-clamp-1">

                        {app.collaboration?.title || "Untitled Collaboration"}

                      </h3>

                      <p className="text-[10px] text-muted-foreground font-mono mt-1">ID: {app.id.slice(0, 8)}</p>

                    </div>

                    <DropdownMenu>

                      <DropdownMenuTrigger asChild>

                        <Button variant="ghost" className="h-8 w-8 p-0 flex-shrink-0">

                          <MoreHorizontal className="h-4 w-4" />

                        </Button>

                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">

                        <DropdownMenuItem asChild>

                           <Link href={`/creator-dashboard/collabs/${app.collaboration_id}`}>

                            Collaboration Brief

                           </Link>

                        </DropdownMenuItem>

                        {app.message && (

                           <DropdownMenuItem onSelect={() => alert(`Your Message: ${app.message}`)}>

                             View Your Message

                           </DropdownMenuItem>

                        )}

                      </DropdownMenuContent>

                    </DropdownMenu>

                  </div>



                  {/* Details Grid */}

                  <div className="grid grid-cols-1 gap-3 text-sm">

                    <div>

                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Business</p>

                      <p className="text-slate-900">

                        {app.collaboration?.business?.display_name || app.collaboration?.business?.instagram_handle || '—'}

                      </p>

                    </div>

                    <div>

                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Status</p>

                      {renderStatusBadge(app)}

                    </div>

                    <div>

                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Applied On</p>

                      <div className="flex items-center gap-2 text-muted-foreground">

                        <CalendarDays className="h-3.5 w-3.5" />

                        <span className="text-xs">{new Date(app.created_at).toLocaleDateString()}</span>

                      </div>

                    </div>

                  </div>



                  {/* Action Button */}

                  <div className="pt-2">

                    {app.approval_status === 'approved' && app.status === 'accepted' ? (

                      <Button size="sm" variant="default" className="w-full h-9" asChild>

                        <Link href={`/creator-dashboard/collabs/${app.collaboration_id}/assignment`}>

                          View Assignment

                        </Link>

                      </Button>

                    ) : (

                      <Button size="sm" variant="outline" className="w-full h-9" asChild>

                        <Link href={`/creator-dashboard/collabs/${app.collaboration_id}`}>

                          View Collaboration

                        </Link>

                      </Button>

                    )}

                  </div>

                </div>

              ))

            ) : (

              <div className="p-8 text-center text-muted-foreground">

                <p className="text-sm mb-2">No applications found.</p>

                <Button variant="link" asChild>

                  <Link href="/creator-dashboard/discover">Browse opportunities</Link>

                </Button>

              </div>

            )}

          </div>

        </div>

      </div>

    </div>

  );

}