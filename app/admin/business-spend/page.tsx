import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AddSpendForm } from "@/components/admin/add-spend-form";
import { getBusinesses, getBusinessesWithSpend } from "./actions"; // Updated import
import { DashboardPageHeader } from "@/components/navigation/dashboard-page-header";
import { SpendListTable } from "@/components/admin/spend-list-table"; // Import the new table

export default async function ManualSpendPage() {
  const supabase = await createClient();
  
  // 1. Admin Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: userData } = await supabase
    .from("users")
    .select("user_type")
    .eq("id", user.id)
    .single();

  if (userData?.user_type !== "admin") {
    redirect("/dashboard");
  }

  // 2. Fetch Data in Parallel
  // getBusinesses -> For the dropdown in the Add Form
  // getBusinessesWithSpend -> For the display table
  const [businesses, businessesWithSpend] = await Promise.all([
    getBusinesses(),
    getBusinessesWithSpend()
  ]);

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      <DashboardPageHeader 
        title="Manual Spend Entry" 
        description="Record expenses against business accounts and specific collaborations."
      />

      <div className="grid gap-8 grid-cols-1">
        {/* The Input Form */}
        <div className="max-w-3xl">
           <AddSpendForm businesses={businesses || []} />
        </div>

        {/* The List Table */}
        <SpendListTable data={businessesWithSpend || []} />
      </div>
    </div>
  );
}