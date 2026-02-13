// 'use server'

// import { createAdminClient } from "@/lib/supabase/server";
// import { revalidatePath } from "next/cache";

// export async function updateCollaboration(formData: FormData) {
//   const supabase = createAdminClient();
  
//   const id = formData.get("id") as string;
  
//   // Extract fields from the form
//   const updates = {
//     title: formData.get("title") as string,
//     category: formData.get("category") as string,
//     description: formData.get("description") as string,
//     requirements: formData.get("requirements") as string,
//     compensation: formData.get("compensation") as string,
//     // Handle date: if empty string, set to null
//     deadline: formData.get("deadline") ? new Date(formData.get("deadline") as string).toISOString() : null,
//     updated_at: new Date().toISOString(),
//   };

//   if (!id) {
//     return { error: "Missing Collaboration ID" };
//   }

//   const { error } = await supabase
//     .from("collaborations")
//     .update(updates)
//     .eq("id", id);

//   if (error) {
//     console.error("Update failed:", error);
//     return { error: "Failed to update collaboration" };
//   }

//   // Refresh the admin pages so data is up to date immediately
//   revalidatePath("/admin/collaborations");
//   revalidatePath(`/admin/collaborations/${id}`);
  
//   return { success: true };
// }


'use server'

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateCollaboration(formData: FormData) {
  const supabase = createAdminClient();
  
  const id = formData.get("id") as string;
  
  const updates = {
    title: formData.get("title") as string,
    category: formData.get("category") as string,
    description: formData.get("description") as string,
    requirements: formData.get("requirements") as string,
    compensation: formData.get("compensation") as string,
    deadline: formData.get("deadline") ? new Date(formData.get("deadline") as string).toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  if (!id) return { error: "Missing Collaboration ID" };

  // Add .select().single() to return the updated record
  const { data, error } = await supabase
    .from("collaborations")
    .update(updates)
    .eq("id", id)
    .select() 
    .single();

  if (error) {
    console.error("Update failed:", error);
    return { error: "Failed to update collaboration" };
  }

  revalidatePath("/admin/collaborations");
  
  // Return the updated data so the frontend can use it immediately
  return { success: true, data };
}