
// import { createClient } from "@/lib/supabase/server";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import Link from "next/link";
// import { 
//   Users, 
//   Briefcase, 
//   FileText, 
//   CheckCircle, 
//   Clock, 
//   ArrowRight, 
//   AlertCircle, 
//   TrendingUp,
//   Store
// } from "lucide-react";
// import { Separator } from "@/components/ui/separator";

// export default async function AdminDashboardPage() {
//   const supabase = await createClient();

//   // --- Data Fetching (Parallel for performance) ---
//   const [
//     { count: totalUsers },
//     { count: pendingUsers },
//     { count: activeCreators },
//     { count: activeBusinesses },
//     { count: totalCollabs },
//     { count: pendingCollabs },
//     { count: activeCollabs },
//     { count: totalApplications },
//     { count: pendingApplications },
//     { data: recentPendingUsers }
//   ] = await Promise.all([
//     // 1. Total Users
//     supabase.from("users").select("*", { count: 'exact', head: true }),
//     // 2. Pending Users
//     supabase.from("users").select("*", { count: 'exact', head: true }).eq("approval_status", "pending"),
//     // 3. Active Creators
//     supabase.from("users").select("*", { count: 'exact', head: true }).eq("user_type", "creator").eq("approval_status", "approved"),
//     // 4. Active Businesses
//     supabase.from("users").select("*", { count: 'exact', head: true }).eq("user_type", "business").eq("approval_status", "approved"),
//     // 5. Total Collaborations
//     supabase.from("collaborations").select("*", { count: 'exact', head: true }),
//     // 6. Pending Collaborations
//     supabase.from("collaborations").select("*", { count: 'exact', head: true }).eq("approval_status", "pending"),
//     // 7. Active (Approved) Collaborations
//     supabase.from("collaborations").select("*", { count: 'exact', head: true }).eq("approval_status", "approved"),
//     // 8. Total Applications
//     supabase.from("collaboration_applications").select("*", { count: 'exact', head: true }),
//     // 9. Pending Applications (Global)
//     supabase.from("collaboration_applications").select("*", { count: 'exact', head: true }).eq("approval_status", "pending"),
//     // 10. Recent Pending Users List
//     supabase.from("users")
//       .select("id, display_name, email, user_type, created_at")
//       .eq("approval_status", "pending")
//       .order("created_at", { ascending: false })
//       .limit(3)
//   ]);

//   return (
//     <div className="container mx-auto p-8 space-y-8">
      
//       {/* Header */}
//       <div>
//         <h1 className="text-3xl font-bold">Admin Dashboard</h1>
//         <p className="text-muted-foreground mt-1">Platform overview, pending tasks, and growth metrics.</p>
//       </div>

//       {/* --- SECTION 1: ACTION REQUIRED (PENDING) --- */}
//       <div className="space-y-4">
//         <h2 className="text-lg font-semibold flex items-center gap-2">
//           <AlertCircle className="h-5 w-5 text-amber-500" />
//           Action Required
//         </h2>
//         <div className="grid gap-4 md:grid-cols-3">
//           {/* Pending Users */}
//           <Card className="bg-card border-border shadow-sm">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium text-muted-foreground">Pending User Approvals</CardTitle>
//               <Users className="h-4 w-4 text-primary" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold">{pendingUsers || 0}</div>
//               <p className="text-xs text-muted-foreground mt-1">Creators & Businesses waiting</p>
//               <Link href="/admin/users?status=pending" className="text-xs text-primary hover:underline mt-2 inline-block">
//                 Review Users &rarr;
//               </Link>
//             </CardContent>
//           </Card>

//           {/* Pending Collabs */}
//           <Card className="bg-card border-border shadow-sm">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium text-muted-foreground">Pending Collabs</CardTitle>
//               <FileText className="h-4 w-4 text-primary" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold">{pendingCollabs || 0}</div>
//               <p className="text-xs text-muted-foreground mt-1">Campaigns awaiting review</p>
//               <Link href="/admin/collaborations" className="text-xs text-primary hover:underline mt-2 inline-block">
//                 Review Collabs &rarr;
//               </Link>
//             </CardContent>
//           </Card>

//           {/* Pending Applications (Insight) */}
//           <Card className="bg-card border-border shadow-sm">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium text-muted-foreground">Pending Applications</CardTitle>
//               <Clock className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold">{pendingApplications || 0}</div>
//               <p className="text-xs text-muted-foreground mt-1">Total proposals pending business review</p>
//               <Link href="/admin/applications" className="text-xs text-muted-foreground hover:underline mt-2 inline-block">
//                 View All &rarr;
//               </Link>
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//       <Separator />

//       {/* --- SECTION 2: PLATFORM HEALTH --- */}
//       <div className="space-y-4">
//         <h2 className="text-lg font-semibold flex items-center gap-2">
//           <TrendingUp className="h-5 w-5 text-accent" />
//           Platform Health
//         </h2>
//         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          
//           <Card className="bg-card border-border shadow-sm">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
//               <Users className="h-4 w-4 text-primary" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{totalUsers || 0}</div>
//               <div className="flex justify-between text-xs text-muted-foreground mt-2">
//                 <span>{activeCreators || 0} Creators</span>
//                 <span>{activeBusinesses || 0} Businesses</span>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="bg-card border-border shadow-sm">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium text-muted-foreground">Active Collabs</CardTitle>
//               <CheckCircle className="h-4 w-4 text-emerald-500" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{activeCollabs || 0}</div>
//               <p className="text-xs text-muted-foreground mt-1">Live opportunities</p>
//             </CardContent>
//           </Card>

//           <Card className="bg-card border-border shadow-sm">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium text-muted-foreground">Total Collabs</CardTitle>
//               <Briefcase className="h-4 w-4 text-accent" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{totalCollabs || 0}</div>
//               <p className="text-xs text-muted-foreground mt-1">All time posted</p>
//             </CardContent>
//           </Card>

//           <Card className="bg-card border-border shadow-sm">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium text-muted-foreground">Total Applications</CardTitle>
//               <FileText className="h-4 w-4 text-amber-500" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{totalApplications || 0}</div>
//               <p className="text-xs text-muted-foreground mt-1">All time submitted</p>
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//       {/* --- SECTION 3: RECENT ACTIVITY & QUICK ACTIONS --- */}
//       <div className="grid gap-6 md:grid-cols-2">
        
//         {/* Recent Pending Approvals List */}
//         <Card className="bg-card border-border h-full shadow-sm">
//           <CardHeader className="flex flex-row items-center justify-between">
//             <div>
//                 <CardTitle className="text-lg">Recent User Requests</CardTitle>
//                 <CardDescription>Newest accounts waiting for access</CardDescription>
//             </div>
//               <Link href="/admin/users?status=pending">
//                 <Button variant="outline" size="sm">View All</Button>
//               </Link>
//           </CardHeader>
//             <CardContent className="space-y-4">
//             {recentPendingUsers && recentPendingUsers.length > 0 ? (
//               recentPendingUsers.map((user) => (
//                 <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/40">
//                   <div className="flex items-center gap-3">
//                     <div className="p-2 rounded-full bg-muted text-muted-foreground">
//                         {user.user_type === 'creator' ? <Users className="h-4 w-4" /> : <Store className="h-4 w-4" />}
//                     </div>
//                     <div>
//                         <p className="font-medium">{user.display_name || "Unknown"}</p>
//                         <div className="flex gap-2 text-xs text-muted-foreground">
//                         <span className="capitalize">{user.user_type}</span>
//                         <span>•</span>
//                         <span>{new Date(user.created_at).toLocaleDateString()}</span>
//                         </div>
//                     </div>
//                   </div>
//                   <Link href={`/admin/users/${user.id}`}>
//                     <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary">
//                       <ArrowRight className="h-4 w-4" />
//                     </Button>
//                   </Link>
//                 </div>
//               ))
//             ) : (
//               <div className="text-center py-12 text-muted-foreground text-sm">
//                 No pending user approvals.
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         {/* Quick Actions */}
//         <Card className="bg-card border-border h-full shadow-sm">
//           <CardHeader>
//             <CardTitle className="text-lg">Quick Actions</CardTitle>
//             <CardDescription>Common administrative tasks</CardDescription>
//           </CardHeader>
//           <CardContent className="grid gap-4">
//             <Link href="/admin/users?type=creator&status=pending">
//               <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border hover:border-primary/50 hover:bg-muted transition-all cursor-pointer group">
//                 <div className="flex items-center gap-3">
//                   <div className="p-2 rounded-full bg-primary/10 text-primary">
//                     <Users className="h-5 w-5" />
//                   </div>
//                   <div>
//                     <h3 className="font-medium group-hover:text-primary">Review Creators</h3>
//                     <p className="text-xs text-muted-foreground">Approve or reject creator profiles</p>
//                   </div>
//                 </div>
//                 <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
//               </div>
//             </Link>

//             <Link href="/admin/users?type=business&status=pending">
//               <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border hover:border-primary/50 hover:bg-muted transition-all cursor-pointer group">
//                 <div className="flex items-center gap-3">
//                   <div className="p-2 rounded-full bg-primary/10 text-primary">
//                     <Store className="h-5 w-5" />
//                   </div>
//                   <div>
//                     <h3 className="font-medium group-hover:text-primary">Review Businesses</h3>
//                     <p className="text-xs text-muted-foreground">Verify business accounts</p>
//                   </div>
//                 </div>
//                 <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
//               </div>
//             </Link>

//             <Link href="/admin/collaborations">
//               <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border hover:border-accent/60 hover:bg-muted transition-all cursor-pointer group">
//                 <div className="flex items-center gap-3">
//                   <div className="p-2 rounded-full bg-accent/10 text-accent">
//                     <Briefcase className="h-5 w-5" />
//                   </div>
//                   <div>
//                     <h3 className="font-medium group-hover:text-accent">Review Collaborations</h3>
//                     <p className="text-xs text-muted-foreground">Check content compliance</p>
//                   </div>
//                 </div>
//                 <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent" />
//               </div>
//             </Link>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }




import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Users, 
  Briefcase, 
  FileText, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  AlertCircle, 
  TrendingUp,
  Store
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // --- Data Fetching (Parallel for performance) ---
  const [
    { count: totalUsers },
    { count: pendingUsers },
    { count: activeCreators },
    { count: activeBusinesses },
    { count: totalCollabs },
    { count: pendingCollabs },
    { count: activeCollabs },
    { count: totalApplications },
    { count: pendingApplications },
    { data: recentPendingUsers }
  ] = await Promise.all([
    // 1. Total Users
    supabase.from("users").select("*", { count: 'exact', head: true }),
    // 2. Pending Users
    supabase.from("users").select("*", { count: 'exact', head: true }).eq("approval_status", "pending"),
    // 3. Active Creators
    supabase.from("users").select("*", { count: 'exact', head: true }).eq("user_type", "creator").eq("approval_status", "approved"),
    // 4. Active Businesses
    supabase.from("users").select("*", { count: 'exact', head: true }).eq("user_type", "business").eq("approval_status", "approved"),
    // 5. Total Collaborations
    supabase.from("collaborations").select("*", { count: 'exact', head: true }),
    // 6. Pending Collaborations
    supabase.from("collaborations").select("*", { count: 'exact', head: true }).eq("approval_status", "pending"),
    // 7. Active (Approved) Collaborations
    supabase.from("collaborations").select("*", { count: 'exact', head: true }).eq("approval_status", "approved"),
    // 8. Total Applications
    supabase.from("collaboration_applications").select("*", { count: 'exact', head: true }),
    // 9. Pending Applications (Global)
    supabase.from("collaboration_applications").select("*", { count: 'exact', head: true }).eq("approval_status", "pending"),
    // 10. Recent Pending Users List
    supabase.from("users")
      .select("id, display_name, email, user_type, created_at")
      .eq("approval_status", "pending")
      .order("created_at", { ascending: false })
      .limit(3)
  ]);

  return (
    <div className="min-h-screen bg-slate-50/30">
      <div className="container mx-auto px-4 md:px-6 py-8 max-w-7xl">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 text-base mt-1">Platform overview, pending tasks, and growth metrics.</p>
        </div>

        {/* Action Required Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-slate-900">Action Required</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pending Users */}
            <div className="bg-white rounded-lg border border-slate-200/60 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-600">Pending User Approvals</h3>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-2xl font-semibold text-slate-900">{pendingUsers || 0}</div>
                <p className="text-xs text-slate-500">Creators & Businesses waiting</p>
                <Link href="/admin/users?status=pending" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                  Review Users
                </Link>
              </div>
            </div>

            {/* Pending Collabs */}
            <div className="bg-white rounded-lg border border-slate-200/60 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-600">Pending Collabs</h3>
                <div className="p-2 bg-amber-50 rounded-lg">
                  <FileText className="h-4 w-4 text-amber-600" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-2xl font-semibold text-slate-900">{pendingCollabs || 0}</div>
                <p className="text-xs text-slate-500">Campaigns awaiting review</p>
                <Link href="/admin/collaborations" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                  Review Collabs
                </Link>
              </div>
            </div>

            {/* Pending Applications */}
            <div className="bg-white rounded-lg border border-slate-200/60 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-600">Pending Applications</h3>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Clock className="h-4 w-4 text-purple-600" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-2xl font-semibold text-slate-900">{pendingApplications || 0}</div>
                <p className="text-xs text-slate-500">Total proposals pending business review</p>
                <Link href="/admin/applications" className="text-xs text-slate-600 hover:text-slate-700 font-medium">
                  View All
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200/60 my-8"></div>

        {/* Platform Health Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-slate-900">Platform Health</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Users */}
            <div className="bg-white rounded-lg border border-slate-200/60 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-600">Total Users</h3>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-2xl font-semibold text-slate-900">{totalUsers || 0}</div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{activeCreators || 0} Creators</span>
                  <span>{activeBusinesses || 0} Businesses</span>
                </div>
              </div>
            </div>

            {/* Active Collabs */}
            <div className="bg-white rounded-lg border border-slate-200/60 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-600">Active Collabs</h3>
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-2xl font-semibold text-slate-900">{activeCollabs || 0}</div>
                <p className="text-xs text-slate-500">Live opportunities</p>
              </div>
            </div>

            {/* Total Collabs */}
            <div className="bg-white rounded-lg border border-slate-200/60 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-600">Total Collabs</h3>
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Briefcase className="h-4 w-4 text-indigo-600" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-2xl font-semibold text-slate-900">{totalCollabs || 0}</div>
                <p className="text-xs text-slate-500">All time posted</p>
              </div>
            </div>

            {/* Total Applications */}
            <div className="bg-white rounded-lg border border-slate-200/60 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-600">Total Applications</h3>
                <div className="p-2 bg-amber-50 rounded-lg">
                  <FileText className="h-4 w-4 text-amber-600" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-2xl font-semibold text-slate-900">{totalApplications || 0}</div>
                <p className="text-xs text-slate-500">All time submitted</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Pending Approvals List */}
          <div className="bg-white rounded-lg border border-slate-200/60">
            <div className="px-6 py-4 border-b border-slate-200/60">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Recent User Requests</h2>
                  <p className="text-sm text-slate-500 mt-1">Newest accounts waiting for access</p>
                </div>
                <Link href="/admin/users?status=pending">
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">View All</Button>
                </Link>
              </div>
            </div>
            <div className="p-6 space-y-3">
              {recentPendingUsers && recentPendingUsers.length > 0 ? (
                recentPendingUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200/60 bg-slate-50/30">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                        {user.user_type === 'creator' ? <Users className="h-4 w-4" /> : <Store className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate">{user.display_name || "Unknown"}</p>
                        <div className="flex gap-2 text-xs text-slate-500 mt-1">
                          <span className="capitalize">{user.user_type}</span>
                          <span>•</span>
                          <span>{new Date(user.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <Link href={`/admin/users/${user.id}`}>
                      <Button size="icon" variant="ghost" className="text-slate-400 hover:text-slate-600">
                        View
                      </Button>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-500 text-sm">No pending user approvals.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-slate-200/60">
            <div className="px-6 py-4 border-b border-slate-200/60">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
                <p className="text-sm text-slate-500 mt-1">Common administrative tasks</p>
              </div>
            </div>
            <div className="p-6 space-y-3">
              <Link href="/admin/users?type=creator&status=pending">
                <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200/60 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 group-hover:text-blue-600">Review Creators</h3>
                      <p className="text-xs text-slate-500">Approve or reject creator profiles</p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/admin/users?type=business&status=pending">
                <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200/60 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                      <Store className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 group-hover:text-blue-600">Review Businesses</h3>
                      <p className="text-xs text-slate-500">Verify business accounts</p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/admin/collaborations">
                <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200/60 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 group-hover:text-indigo-600">Review Collaborations</h3>
                      <p className="text-xs text-slate-500">Check content compliance</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}