// src/app/business-dashboard/collabs/[id]/actions.ts
'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function assignCreator(prevState: any, formData: FormData | null) {
  // Add null check for formData
  if (!formData) {
    console.error("Form data is null or undefined");
    return { success: false, message: "Form data is missing" };
  }

  const supabase = await createClient();

  try {
    // Get values with null checks
    const collabId = formData.get("collaboration_id")?.toString() || "";
    const creatorId = formData.get("creator_id")?.toString() || "";
    
    if (!collabId || !creatorId) {
      return { 
        success: false, 
        message: "Missing required fields: collaboration_id or creator_id" 
      };
    }

    // Convert form strings to Numbers with proper fallbacks
    const posts = formData.has("posts_required") 
      ? Number(formData.get("posts_required")) 
      : 0;
    const stories = formData.has("stories_required")
      ? Number(formData.get("stories_required"))
      : 0;
    const reels = formData.has("reels_required")
      ? Number(formData.get("reels_required"))
      : 0;
    const notes = formData.get("notes")?.toString() || "";

    const { error: assignError } = await supabase
      .from("collaboration_assignments")
      .insert({
        collaboration_id: collabId,
        creator_id: creatorId,
        posts_required: posts,
        stories_required: stories,
        reels_required: reels,
        notes: notes,
        status: "assigned"
      });

    if (assignError) {
      console.error("Assignment DB Error:", assignError);
      return { success: false, message: "Database error: " + assignError.message };
    }

    // Update application status
    const { error: updateError } = await supabase
      .from("collaboration_applications")
      .update({ 
        status: "accepted", 
        approval_status: "approved",
        updated_at: new Date().toISOString()
      })
      .eq("collaboration_id", collabId)
      .eq("creator_id", creatorId);

    if (updateError) {
      console.error("Update Application Error:", updateError);
      return { 
        success: false, 
        message: "Failed to update application status: " + updateError.message 
      };
    }

    revalidatePath(`/business-dashboard/collabs/${collabId}`);
    return { 
      success: true, 
      message: "Creator assigned successfully" 
    };

  } catch (e) {
    console.error("Unexpected error in assignCreator:", e);
    return { 
      success: false, 
      message: "An unexpected error occurred: " + (e instanceof Error ? e.message : String(e)) 
    };
  }
}