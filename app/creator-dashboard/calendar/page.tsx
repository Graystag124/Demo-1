import { DashboardPageHeader } from "@/components/navigation/dashboard-page-header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from 'next/navigation';
import { CalendarView } from "@/components/calendar/calendar-view";

export default async function CreatorCalendar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // First, get all approved collaborations
  const { data: allCollaborations } = await supabase
    .from("collaborations")
    .select(`
      *,
      business:users!collaborations_business_id_fkey(display_name)
    `)
    .eq("approval_status", "approved")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  // Get all collaborations the user has applied to
  const { data: userApplications } = await supabase
    .from("collaboration_applications")
    .select("collaboration_id, status")
    .eq("creator_id", user.id);

  // Create a map of collaboration IDs to their application status
  const applicationStatusMap = new Map(
    (userApplications || []).map(app => [app.collaboration_id, app.status])
  );

  // Add hasApplied and applicationStatus to each collaboration
  const collaborations = (allCollaborations || []).map(collab => {
    const status = applicationStatusMap.get(collab.id);
    return {
      ...collab,
      hasApplied: applicationStatusMap.has(collab.id),
      applicationStatus: status || null
    };
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <DashboardPageHeader
        title="My Calendar"
        description="View your accepted collaborations and their deadlines"
        showBackButton
      />

      <CalendarView collaborations={collaborations} userType="creator" />
    </div>
  );
}
