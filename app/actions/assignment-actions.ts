'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateAssignmentAction(data: {
  collaborationId: string;
  creatorId: string;
  postsRequired: number;
  storiesRequired: number;
  reelsRequired: number;
  notes: string;
  status: string;
}) {
  const supabase = await createClient();

  const payload = {
    collaboration_id: data.collaborationId,
    creator_id: data.creatorId,
    posts_required: data.postsRequired,
    stories_required: data.storiesRequired,
    reels_required: data.reelsRequired,
    notes: data.notes || "",
    status: data.status,
    updated_at: new Date().toISOString(),
  };

  try {
    // 1. ATTEMPT UPDATE: Update any record matching this Collab + Creator
    // We utilize .select() to get back the rows that were actually updated.
    const { data: updatedRows, error: updateError } = await supabase
      .from("collaboration_assignments")
      .update(payload)
      .eq("collaboration_id", data.collaborationId)
      .eq("creator_id", data.creatorId)
      .select();

    if (updateError) {
      console.error("Update failed:", updateError);
      return { success: false, error: updateError.message };
    }

    // 2. CHECK RESULT: If no rows were updated, it means it doesn't exist yet.
    if (!updatedRows || updatedRows.length === 0) {
      console.log("No existing assignment found. Inserting new record...");
      
      const { error: insertError } = await supabase
        .from("collaboration_assignments")
        .insert(payload);

      if (insertError) {
        console.error("Insert failed:", insertError);
        return { success: false, error: insertError.message };
      }
    }

    // 3. REVALIDATE: Force the page to reload the fresh data
    const path = `/business-dashboard/collabs/${data.collaborationId}/creator/${data.creatorId}`;
    revalidatePath(path);
    
    return { success: true };

  } catch (err: any) {
    console.error("Unexpected error in updateAssignmentAction:", err);
    return { success: false, error: err.message || "Unknown error" };
  }
}

export async function moderateSubmissionAction(
  submissionId: string, 
  status: "approved" | "rejected",
  path: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("collaboration_submissions")
    .update({ status })
    .eq("id", submissionId);

  if (error) return { success: false, error: error.message };

  revalidatePath(path);
  return { success: true };
}