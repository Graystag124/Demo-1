// app/admin/business-spend/actions.ts
'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// --- Validation Schema ---
const spendSchema = z.object({
  businessId: z.string().uuid("Invalid business ID"),
  collaborationId: z.string().uuid("Invalid collaboration ID"),
  creatorId: z.string().uuid("Invalid creator ID"),
  amount: z.coerce.number().positive("Amount must be positive"),
  description: z.string().min(3, "Description is required"),
});

// 1. Fetch Businesses
export async function getBusinesses() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, display_name, email, profile_image_url")
    .eq("user_type", "business")
    .order("display_name", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

// 2. Fetch Collaborations for a Business
export async function getBusinessCollaborations(businessId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collaborations")
    .select("id, title, status:approval_status, created_at")
    .eq("business_id", businessId)
    .eq("approval_status", "approved") // Only show approved collabs
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

// 3. NEW: Fetch Approved Creators for a Collaboration
export async function getCollabCreators(collabId: string) {
  const supabase = await createClient();
  
  // We need to fetch creators who have an 'approved' application for this collab
  const { data, error } = await supabase
    .from("collaboration_applications")
    .select(`
      creator_id,
      creator:users!collaboration_applications_creator_id_fkey (
        id, display_name, email, profile_image_url
      )
    `)
    .eq("collaboration_id", collabId)
    .eq("approval_status", "approved");

  if (error) throw new Error(error.message);
  
  // Flatten the response
  return data.map((app: any) => app.creator);
}

// 4. NEW: Check for existing spend (for Edit mode)
export async function getExistingSpend(collabId: string, creatorId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("business_transactions")
    .select("amount, description")
    .eq("reference_id", collabId)
    .eq("creator_id", creatorId)
    .eq("category", "collaboration_spend")
    .maybeSingle(); // Returns null if not found, instead of error
    
  return data;
}

// 5. Modified: Record (Upsert) Business Spend
export async function recordBusinessSpend(prevState: any, formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const rawData = {
    businessId: formData.get("businessId"),
    collaborationId: formData.get("collaborationId"),
    creatorId: formData.get("creatorId"),
    amount: formData.get("amount"),
    description: formData.get("description"),
  };

  const validated = spendSchema.safeParse(rawData);

  if (!validated.success) {
    return { error: "Please check all fields." };
  }

  const { businessId, collaborationId, creatorId, amount, description } = validated.data;

  // Perform Upsert (Insert or Update based on unique constraint reference_id + creator_id)
  const { error } = await supabase.from("business_transactions").upsert({
    business_id: businessId,
    admin_id: user.id,
    creator_id: creatorId,     // Save the creator
    reference_id: collaborationId, // Save the collab
    amount: amount,
    description: description,
    type: "debit",
    category: "collaboration_spend",
  }, {
    onConflict: 'reference_id, creator_id' // Uses the constraint we added in SQL
  });

  if (error) {
    console.error("Transaction Error:", error);
    return { error: "Failed to record transaction. " + error.message };
  }

  revalidatePath("/admin/business-spend");
  return { success: "Expenditure saved successfully!" };
}

// 6. Modified: Fetch Full History for Table
export async function getBusinessesWithSpend() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("users")
    .select(`
      id, 
      display_name, 
      email, 
      profile_image_url,
      business_transactions!business_transactions_business_id_fkey (
        id,
        amount,
        description,
        created_at,
        reference_id,
        creator_id,
        collaborations:reference_id ( title ),
        creator:creator_id ( display_name, profile_image_url )
      )
    `)
    .eq("user_type", "business")
    .order("display_name", { ascending: true });

  if (error) {
    console.error("Error fetching spend:", error);
    return [];
  }

  const formattedData = data.map((business) => {
    const rawTransactions = (business.business_transactions as any[]) || [];
    
    // Filter to only show relevant spend
    const validTransactions = rawTransactions.filter(t => t.amount > 0);

    const transactions = validTransactions.sort(
      (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const totalSpend = transactions.reduce(
      (sum: number, t: any) => sum + Number(t.amount), 
      0
    );

    return {
      id: business.id,
      display_name: business.display_name,
      email: business.email,
      profile_image_url: business.profile_image_url,
      transactions,
      totalSpend,
    };
  });

  return formattedData.sort((a, b) => b.totalSpend - a.totalSpend);
}