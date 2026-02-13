"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function applyForCollaboration(
  collaborationId: string,
  selectedDate: string
) {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "User not authenticated" };
  }

  // Check if already applied
  const { data: existing } = await supabase
    .from("collaboration_applications")
    .select("id")
    .eq("collaboration_id", collaborationId)
    .eq("creator_id", user.id)
    .single();

  if (existing) {
    return { error: "You have already applied for this collaboration." };
  }

  const { error } = await supabase.from("collaboration_applications").insert({
    collaboration_id: collaborationId,
    creator_id: user.id,
    selected_dates: [selectedDate], // Keep the array fix from before
    // REMOVED: status: "pending" 
    // We let the database use its default value here to avoid constraint errors
  });

  if (error) {
    console.error("Application error:", error);
    // Helpful log to see what the constraint actually wants if it fails again
    if (error.code === '23514') { 
       return { error: "Database status rule violation. Check allowed status values." };
    }
    return { error: "Failed to submit application." };
  }

  revalidatePath("/creator-dashboard");
  return { success: true };
}