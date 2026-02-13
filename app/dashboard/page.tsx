import { createClient } from "@/lib/supabase/server";
import { redirect } from 'next/navigation';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AutoRefreshMeta } from "@/components/meta/auto-refresh-meta";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  console.log("[v0] Dashboard - User:", user?.id);

  if (!user) {
    redirect("/auth/login");
  }

  const { data: userData } = await supabase
    .from("users")
    .select("user_type, approval_status")
    .eq("id", user.id)
    .single();

  console.log("[v0] Dashboard - User data:", userData);

  if (!userData) {
    redirect("/auth/login");
  }

  if (userData.approval_status === "pending") {
    redirect("/auth/pending-approval");
  }

  if (userData.approval_status === "rejected") {
    redirect("/auth/rejected");
  }

  if (userData.user_type === "admin") {
    redirect("/admin");
  } else if (userData.user_type === "creator") {
    redirect("/creator-dashboard");
  } else if (userData.user_type === "business") {
    redirect("/business-dashboard");
  }

  // Fallback
  redirect("/auth/login");

  return (
    <div className="container mx-auto py-8 px-4">
      <AutoRefreshMeta />
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome, {userData.display_name}
          </h1>
          <p className="text-muted-foreground">
            {userData.user_type === "creator" ? "Creator Dashboard" : userData.user_type === "business" ? "Business Dashboard" : "Admin Dashboard"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/profile">View Profile</Link>
          </Button>
          {userData.user_type === "admin" && (
            <Button asChild variant="outline">
              <Link href="/admin">Admin Panel</Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {userData.user_type === "creator" && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Browse Collaborations</CardTitle>
                <CardDescription>
                  Find opportunities from businesses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/collaborations">Browse</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>My Applications</CardTitle>
                <CardDescription>
                  Track your collaboration applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/my-applications">View Applications</Link>
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {userData.user_type === "business" && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Post Collaboration</CardTitle>
                <CardDescription>
                  Create a new collaboration opportunity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/collaborations/new">Create</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>My Collaborations</CardTitle>
                <CardDescription>
                  Manage your posted collaborations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/collaborations">View Collaborations</Link>
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {userData.user_type === "admin" && (
          <Card>
            <CardHeader>
              <CardTitle>Admin Panel</CardTitle>
              <CardDescription>
                Manage users, collaborations, and applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/admin">Go to Admin</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>
              View collaborations and deadlines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="outline">
              <Link href="/calendar">View Calendar</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Insights</CardTitle>
            <CardDescription>
              View your Meta insights and analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="outline">
              <Link href="/insights">View Insights</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
