// import { redirect } from 'next/navigation';
// import { createClient } from "@/lib/supabase/server";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import Link from "next/link";
// import { 
//   Briefcase, 
//   Users, 
//   CheckCircle, 
//   Clock, 
//   AlertCircle, 
//   TrendingUp, 
//   ArrowRight,
//   Plus,
//   FileText
// } from 'lucide-react';
// import { Separator } from "@/components/ui/separator";

// export default async function BusinessDashboard() {
//   const supabase = await createClient();
  
//   // 1. Auth Check
//   const { data: { user } } = await supabase.auth.getUser();
//   if (!user) redirect("/auth/login");

//   // 2. User Profile Check
//   const { data: userData } = await supabase
//     .from("users")
//     .select("*")
//     .eq("id", user.id)
//     .single();

//   if (!userData || userData.user_type !== "business") redirect("/dashboard");
//   if (userData.approval_status === "pending") redirect("/auth/pending-approval");
//   if (userData.approval_status === "rejected") redirect("/auth/rejected");

//   // 3. Parallel Data Fetching
//   const [
//     { data: collaborations },
//     { count: pendingApplicationsCount },
//     { data: recentApplications }
//   ] = await Promise.all([
//     // Fetch all business collaborations
//     supabase
//       .from("collaborations")
//       .select("*, collaboration_applications(*)")
//       .eq("business_id", user.id)
//       .order("created_at", { ascending: false }),
    
//     // Fetch count of pending applications specifically for this business's collabs
//     // (Note: This requires a join or a second query. For simplicity here, we filter the fetched collabs below, 
//     // but in a large app, you'd want a direct RPC or foreign key count)
//     supabase.rpc('count_pending_applications_for_business', { business_uuid: user.id }), 
    
//     // Fetch recent applications for the "Recent Activity" feed
//     supabase
//       .from("collaboration_applications")
//       .select("*, collaboration:collaborations!inner(title, business_id), applicant:users!applicant_id(display_name, email)")
//       .eq("collaborations.business_id", user.id)
//       .eq("approval_status", "pending")
//       .order("created_at", { ascending: false })
//       .limit(5)
//   ]);

//   // Process Data
//   const allCollabs = collaborations || [];
//   const pendingCollabs = allCollabs.filter(c => c.approval_status === "pending");
//   const approvedCollabs = allCollabs.filter(c => c.approval_status === "approved");
  
//   // Flatten all applications from the fetched collaborations to calculate specific stats
//   const allApplications = allCollabs.flatMap(c => c.collaboration_applications || []);
//   const pendingAppsCount = allApplications.filter(a => a.approval_status === "pending").length;
//   const totalAppsCount = allApplications.length;

//   return (
//     <div className="container mx-auto space-y-8">
      
//       {/* Header */}
//       <div>
//         <h1 className="text-3xl font-bold">Overview</h1>
//         <p className="text-muted-foreground mt-1">
//           Welcome back, {userData.display_name || userData.full_name || "Business Partner"}. Here's what's happening.
//         </p>
//       </div>

//       {/* --- SECTION 1: ACTION REQUIRED --- */}
//       <div className="space-y-4">
//         <h2 className="text-lg font-semibold flex items-center gap-2">
//           <AlertCircle className="h-5 w-5 text-amber-500" />
//           Action Required
//         </h2>
//         <div className="grid gap-4 md:grid-cols-3">
          
//           {/* Pending Applications Card */}
//           <Card className="bg-card border-border shadow-sm">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium text-muted-foreground">Pending Applications</CardTitle>
//               <Users className="h-4 w-4 text-primary" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold">{pendingAppsCount}</div>
//               <p className="text-xs text-muted-foreground mt-1">Creators waiting for response</p>
//               <Link href="/business-dashboard/applications" className="text-xs text-primary hover:underline mt-2 inline-block">
//                 Review Proposals &rarr;
//               </Link>
//             </CardContent>
//           </Card>

//           {/* Pending Collab Approval */}
//           <Card className="bg-card border-border shadow-sm">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium text-muted-foreground">In Review</CardTitle>
//               <Clock className="h-4 w-4 text-amber-500" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold">{pendingCollabs.length}</div>
//               <p className="text-xs text-muted-foreground mt-1">Collabs waiting for admin approval</p>
//               <Link href="/business-dashboard/collabs?status=pending" className="text-xs text-muted-foreground hover:underline mt-2 inline-block">
//                 View Details &rarr;
//               </Link>
//             </CardContent>
//           </Card>

//           {/* Create New CTA */}
//           <Card className="bg-card border-border flex flex-col justify-center items-center hover:bg-muted transition-colors cursor-pointer group shadow-sm">
//             <Link href="/business-dashboard/create-collab" className="w-full h-full flex flex-col items-center justify-center p-6">
//               <div className="p-3 rounded-full bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors mb-2">
//                 <Plus className="h-6 w-6" />
//               </div>
//               <p className="font-medium text-foreground group-hover:text-primary-foreground">Post New Collaboration</p>
//             </Link>
//           </Card>
//         </div>
//       </div>

//       <Separator />

//       {/* --- SECTION 2: HEALTH & STATS --- */}
//       <div className="space-y-4">
//         <h2 className="text-lg font-semibold flex items-center gap-2">
//           <TrendingUp className="h-5 w-5 text-accent" />
//           Performance
//         </h2>
//         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          
//           <Card className="bg-card border-border shadow-sm">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium text-muted-foreground">Total Collabs</CardTitle>
//               <Briefcase className="h-4 w-4 text-primary" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{allCollabs.length}</div>
//               <p className="text-xs text-muted-foreground mt-1">All time campaigns</p>
//             </CardContent>
//           </Card>

//           <Card className="bg-card border-border shadow-sm">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium text-muted-foreground">Active Campaigns</CardTitle>
//               <CheckCircle className="h-4 w-4 text-emerald-500" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{approvedCollabs.length}</div>
//               <p className="text-xs text-muted-foreground mt-1">Live and public</p>
//             </CardContent>
//           </Card>

//           <Card className="bg-card border-border shadow-sm">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium text-muted-foreground">Total Applicants</CardTitle>
//               <FileText className="h-4 w-4 text-accent" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{totalAppsCount}</div>
//               <p className="text-xs text-muted-foreground mt-1">Lifetime interest received</p>
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//       {/* --- SECTION 3: RECENT ACTIVITY --- */}
//       <div className="grid gap-6 md:grid-cols-2">
        
//         {/* Recent Applications List */}
//         <Card className="bg-card border-border h-full shadow-sm">
//           <CardHeader className="flex flex-row items-center justify-between">
//             <div>
//                 <CardTitle className="text-lg">Recent Applications</CardTitle>
//                 <CardDescription>Creators applying to your campaigns</CardDescription>
//             </div>
//             <Link href="/business-dashboard/applications">
//                 <Button variant="outline" size="sm">View All</Button>
//             </Link>
//           </CardHeader>
//             <CardContent className="space-y-4">
//             {recentApplications && recentApplications.length > 0 ? (
//               recentApplications.map((app: any) => (
//                 <div key={app.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/40">
//                   <div className="flex items-center gap-3">
//                     <div className="p-2 rounded-full bg-muted text-muted-foreground">
//                         <Users className="h-4 w-4" />
//                     </div>
//                     <div>
//                         <p className="font-medium">{app.applicant?.display_name || "Creator"}</p>
//                         <div className="flex gap-2 text-xs text-muted-foreground">
//                            <span>Applied to: {app.collaboration?.title}</span>
//                         </div>
//                     </div>
//                   </div>
//                   <Link href={`/business-dashboard/applications/${app.id}`}>
//                     <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-muted">
//                       <ArrowRight className="h-4 w-4" />
//                     </Button>
//                   </Link>
//                 </div>
//               ))
//             ) : (
//               <div className="text-center py-12 text-muted-foreground text-sm">
//                 No recent applications found.
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         {/* Quick Actions / Recent Collabs */}
//         <Card className="bg-card border-border h-full shadow-sm">
//             <CardHeader>
//             <CardTitle className="text-lg">Active Campaigns</CardTitle>
//             <CardDescription>Your most recent live collaborations</CardDescription>
//           </CardHeader>
//             <CardContent className="space-y-4">
//             {approvedCollabs.length > 0 ? (
//                approvedCollabs.slice(0, 3).map((collab) => (
//                 <div key={collab.id} className="group flex items-center justify-between p-4 rounded-lg bg-card border border-border hover:border-primary/50 hover:bg-muted transition-all cursor-pointer">
//                   <div className="flex items-center gap-3">
//                     <div className="p-2 rounded-full bg-primary/10 text-primary">
//                       <Briefcase className="h-5 w-5" />
//                     </div>
//                     <div>
//                       <h3 className="font-medium group-hover:text-primary">{collab.title}</h3>
//                       <p className="text-xs text-muted-foreground">
//                         {collab.collaboration_applications?.length || 0} applicants
//                       </p>
//                     </div>
//                   </div>
//                   <Link href={`/business-dashboard/collabs/${collab.id}`}>
//                     <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
//                   </Link>
//                 </div>
//                ))
//             ) : (
//                <div className="text-center py-12 text-muted-foreground text-sm">
//                  No active campaigns. 
//                  <Link href="/business-dashboard/create-collab" className="text-primary hover:underline ml-1">Create one?</Link>
//                </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }

import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Briefcase, 
  Users, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  ArrowRight,
  Plus,
  DollarSign,
  CheckSquare,
  Video,
  FileVideo
} from 'lucide-react';
import { Separator } from "@/components/ui/separator";

export default async function BusinessDashboard() {
  const supabase = await createClient();
  
  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // 2. User Profile Check
  const { data: userData } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!userData || userData.user_type !== "business") redirect("/dashboard");
  if (userData.approval_status === "pending") redirect("/auth/pending-approval");
  if (userData.approval_status === "rejected") redirect("/auth/rejected");

  // 3. Parallel Data Fetching
  const [
    { data: collaborations },
    { count: pendingApplicationsCount },
    { data: recentApplications }
  ] = await Promise.all([
    // Fetch all business collaborations
    supabase
      .from("collaborations")
      .select("*, collaboration_applications(*)")
      .eq("business_id", user.id)
      .order("created_at", { ascending: false }),
    
    // Fetch count of pending applications
    supabase.rpc('count_pending_applications_for_business', { business_uuid: user.id }), 
    
    // Fetch recent applications for the feed
    supabase
      .from("collaboration_applications")
      .select("*, collaboration:collaborations!inner(title, business_id), applicant:users!applicant_id(display_name, email)")
      .eq("collaborations.business_id", user.id)
      .eq("approval_status", "pending")
      .order("created_at", { ascending: false })
      .limit(5)
  ]);

  // --- Process Data for Metrics ---
  const allCollabs = collaborations || [];
  const pendingCollabs = allCollabs.filter(c => c.approval_status === "pending");
  const approvedCollabs = allCollabs.filter(c => c.approval_status === "approved");
  
  // Flatten all applications
  const allApplications = allCollabs.flatMap(c => c.collaboration_applications || []);
  const pendingAppsCount = allApplications.filter(a => a.approval_status === "pending").length;

  // --- NEW PERFORMANCE METRICS CALCULATIONS ---
  
  // 1. Campaigns Completed (Assuming status 'completed' exists, otherwise checking date or manual status)
  const completedCampaigns = allCollabs.filter(c => c.status === 'completed').length;

  // 2. Total Campaign Spend (Sum of budgets of active/completed campaigns)
  const totalSpend = allCollabs
    .filter(c => c.status === 'active' || c.status === 'completed' || c.approval_status === 'approved')
    .reduce((sum, c) => sum + (Number(c.budget) || 0), 0);

  // 3. Total Content Pieces Delivered (Mock logic: Assuming approved apps = content delivered for now)
  // In a real scenario, you would count from a 'deliverables' table
  const contentDelivered = allApplications.filter(a => a.status === 'completed' || a.approval_status === 'approved').length;

  // 4. Total Influencers Worked With (Unique count of approved applicants)
  const approvedApps = allApplications.filter(a => a.approval_status === 'approved');
  const uniqueInfluencers = new Set(approvedApps.map(a => a.applicant_id)).size;

  // Formatter for currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="min-h-screen bg-slate-50/30">
      <div className="container mx-auto px-4 md:px-6 py-8 max-w-7xl">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-900">Overview</h1>
          <p className="text-slate-500 text-base mt-1">
            Welcome back, {userData.display_name || userData.full_name || "Business Partner"}. Here's what's happening.
          </p>
        </div>

        {/* Action Required Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-slate-900">Action Required</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pending Applications */}
            <div className="bg-white rounded-lg border border-slate-200/60 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-600">Pending Applications</h3>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-2xl font-semibold text-slate-900">{pendingAppsCount}</div>
                <p className="text-xs text-slate-500">Creators waiting for response</p>
                <Link href="/business-dashboard/applications" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                  Review Proposals
                </Link>
              </div>
            </div>

            {/* In Review */}
            <div className="bg-white rounded-lg border border-slate-200/60 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-600">In Review</h3>
                <div className="p-2 bg-amber-50 rounded-lg">
                  <Clock className="h-4 w-4 text-amber-600" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-2xl font-semibold text-slate-900">{pendingCollabs.length}</div>
                <p className="text-xs text-slate-500">Collabs waiting for admin approval</p>
                <Link href="/business-dashboard/collabs?status=pending" className="text-xs text-slate-600 hover:text-slate-700 font-medium">
                  View Details
                </Link>
              </div>
            </div>

            {/* Create New */}
            <Link href="/business-dashboard/create-collab" className="block">
              <div className="bg-white rounded-lg border border-slate-200/60 p-6 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer group h-full">
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="p-3 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors mb-3">
                    <Plus className="h-6 w-6" />
                  </div>
                  <h3 className="font-medium text-slate-900 group-hover:text-blue-600">Post New Collaboration</h3>
                </div>
              </div>
            </Link>
          </div>
        </div>

        <div className="border-t border-slate-200/60 my-8"></div>

        {/* Performance Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-slate-900">Performance</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Campaigns Completed */}
            <div className="bg-white rounded-lg border border-slate-200/60 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-600">Campaigns Completed</h3>
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <CheckSquare className="h-4 w-4 text-emerald-600" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-2xl font-semibold text-slate-900">{completedCampaigns}</div>
                <p className="text-xs text-slate-500">Successfully finished</p>
              </div>
            </div>

            {/* Total Campaign Spend */}
            <div className="bg-white rounded-lg border border-slate-200/60 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-600">Total Campaign Spend</h3>
                <div className="p-2 bg-green-50 rounded-lg">
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-2xl font-semibold text-slate-900">{formatCurrency(totalSpend)}</div>
                <p className="text-xs text-slate-500">Invested in creators</p>
              </div>
            </div>

            {/* Content Delivered */}
            <div className="bg-white rounded-lg border border-slate-200/60 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-600">Content Delivered</h3>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <FileVideo className="h-4 w-4 text-purple-600" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-2xl font-semibold text-slate-900">{contentDelivered}</div>
                <p className="text-xs text-slate-500">Posts, Reels & Stories</p>
              </div>
            </div>

            {/* Influencers Hired */}
            <div className="bg-white rounded-lg border border-slate-200/60 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-600">Influencers Hired</h3>
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Users className="h-4 w-4 text-indigo-600" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-2xl font-semibold text-slate-900">{uniqueInfluencers}</div>
                <p className="text-xs text-slate-500">Unique partners</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity & Active Campaigns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Applications List */}
          <div className="bg-white rounded-lg border border-slate-200/60">
            <div className="px-6 py-4 border-b border-slate-200/60">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Recent Applications</h2>
                  <p className="text-sm text-slate-500 mt-1">Creators applying to your campaigns</p>
                </div>
                <Link href="/business-dashboard/applications">
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">View All</Button>
                </Link>
              </div>
            </div>
            <div className="p-6 space-y-3">
              {recentApplications && recentApplications.length > 0 ? (
                recentApplications.map((app: any) => (
                  <div key={app.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200/60 bg-slate-50/30">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                        <Users className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate">{app.applicant?.display_name || "Creator"}</p>
                        <div className="flex gap-2 text-xs text-slate-500 mt-1">
                           <span>Applied to: {app.collaboration?.title}</span>
                        </div>
                      </div>
                    </div>
                    <Link href={`/business-dashboard/applications/${app.id}`}>
                      <Button size="icon" variant="ghost" className="text-slate-400 hover:text-slate-600">
                        View
                      </Button>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-500 text-sm">No recent applications found.</p>
                </div>
              )}
            </div>
          </div>

          {/* Active Campaigns */}
          <div className="bg-white rounded-lg border border-slate-200/60">
            <div className="px-6 py-4 border-b border-slate-200/60">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Active Campaigns</h2>
                <p className="text-sm text-slate-500 mt-1">Your most recent live collaborations</p>
              </div>
            </div>
            <div className="p-6 space-y-3">
              {approvedCollabs.length > 0 ? (
                 approvedCollabs.slice(0, 3).map((collab, index) => (
                   <div key={collab.id || index} className="flex items-center justify-between p-4 rounded-lg border border-slate-200/60 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer group">
                     <div className="flex items-center gap-3">
                       <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                         <Briefcase className="h-5 w-5" />
                       </div>
                       <div>
                         <h3 className="font-medium text-slate-900 group-hover:text-blue-600">{collab.title}</h3>
                         <p className="text-xs text-slate-500">
                           {collab.collaboration_applications?.length || 0} applicants
                         </p>
                       </div>
                     </div>
                   </div>
                 ))
              ) : (
                 <div className="text-center py-12">
                   <p className="text-slate-500 text-sm mb-2">No active campaigns.</p>
                   <Link href="/business-dashboard/create-collab" className="text-blue-600 hover:text-blue-700 font-medium text-sm">Create one?</Link>
                 </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}