// import { DashboardPageHeader } from "@/components/navigation/dashboard-page-header";
// import { createClient } from "@/lib/supabase/server";
// import { redirect } from 'next/navigation';
// import { CalendarView } from "@/components/calendar/calendar-view";

// export default async function BusinessCalendar() {
//   const supabase = await createClient();
//   const { data: { user } } = await supabase.auth.getUser();

//   if (!user) {
//     redirect("/auth/login");
//   }

//   // Get business's collaborations
//   const { data: collaborations } = await supabase
//     .from("collaborations")
//     .select("*")
//     .eq("business_id", user.id)
//     .order("created_at", { ascending: false });

//   return (
//     <div className="container mx-auto p-6 space-y-6">
//       <DashboardPageHeader
//         title="My Calendar"
//         description="View your collaborations and their deadlines"
//         showBackButton
//       />

//       <CalendarView collaborations={collaborations || []} userType="business" />
//     </div>
//   );
// }



// app/(dashboard)/business/calendar/page.tsx (or your path)
// import { DashboardPageHeader } from "@/components/navigation/dashboard-page-header";
// import { createClient } from "@/lib/supabase/server";
// import { redirect } from 'next/navigation';
// import { CalendarView } from "@/components/calendar/calendar-view";

// export default async function BusinessCalendar() {
//   const supabase = await createClient();
//   const { data: { user } } = await supabase.auth.getUser();

//   if (!user) {
//     redirect("/auth/login");
//   }

//   // Fetch collaborations. 
//   // Note: We use 'dates' instead of 'deadline' based on your schema.
//   const { data: collaborations } = await supabase
//     .from("collaborations")
//     .select(`
//       *,
//       business:business_id (
//         display_name
//       )
//     `)
//     .eq("business_id", user.id)
//     .order("created_at", { ascending: false });

//   return (
//     <div className="container mx-auto p-6 space-y-6">
//       <DashboardPageHeader
//         title="Business Calendar"
//         description="View your collaboration schedule and important dates"
//         showBackButton
//       />

//       <CalendarView 
//         collaborations={collaborations || []} 
//         userType="business" 
//       />
//     </div>
//   );
// }


// app/business-dashboard/calendar/page.tsx
import { DashboardPageHeader } from "@/components/navigation/dashboard-page-header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from 'next/navigation';
import { CalendarView } from "@/components/calendar/calendar-view";

export default async function BusinessCalendar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // FIX: Explicitly join business_transactions using the reference_id foreign key
  const { data: collaborationsData, error } = await supabase
    .from("collaborations")
    .select(`
      *,
      business:business_id (
        display_name
      ),
      transactions:business_transactions!business_transactions_reference_id_fkey (
        amount,
        type
      )
    `)
    .eq("business_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching calendar data:", error);
  }

  // Calculate the total transaction amount for each collaboration
  const collaborations = collaborationsData?.map(collab => {
    // Sum up the amounts. 
    // We use Math.abs because spent amounts are often stored as negative or labeled as 'debit'
    const totalTransactions = (collab.transactions || []).reduce((sum: number, tx: any) => {
      return sum + Math.abs(Number(tx.amount || 0));
    }, 0);

    return {
      ...collab,
      total_budget_spent: totalTransactions
    };
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <DashboardPageHeader
        title="My Calendar"
        description="View your collaborations and total spendings"
        showBackButton
      />

      <CalendarView 
        collaborations={collaborations || []} 
        userType="business" 
      />
    </div>
  );
}