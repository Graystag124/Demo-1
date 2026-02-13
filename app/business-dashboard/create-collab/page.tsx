import { DashboardPageHeader } from "@/components/navigation/dashboard-page-header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from 'next/navigation';
import { CollaborationForm } from "@/components/collaborations/collaboration-form";
import { getCategories } from "@/app/actions/categories";

export default async function CreateCollaboration() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const categories = await getCategories();

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <DashboardPageHeader
        title="Create New Collaboration"
        description="Post a new collaboration opportunity for creators"
        showBackButton
      />

      <CollaborationForm categories={categories} />
    </div>
  );
}
