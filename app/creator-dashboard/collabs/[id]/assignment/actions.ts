
'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function submitAssignment(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  const payload = {
    collaboration_id: formData.get("collaboration_id") as string,
    creator_id: user.id,
    url: formData.get("url") as string,
    type: formData.get("type") as "post" | "story" | "reel",
    caption: formData.get("caption") as string | null,
    status: "submitted" as const,
  };

  // Validation
  if (!payload.collaboration_id || !payload.url || !payload.type) {
    console.error("Missing required fields");
    return;
  }

  try {
    // 1. Ensure Assignment Row Exists
    const { data: existingAssignment } = await supabase
      .from("collaboration_assignments")
      .select("id, status")
      .eq("collaboration_id", payload.collaboration_id)
      .eq("creator_id", payload.creator_id)
      .maybeSingle();

    if (!existingAssignment) {
      await supabase
        .from("collaboration_assignments")
        .insert({
          collaboration_id: payload.collaboration_id,
          creator_id: payload.creator_id,
          posts_required: 0,
          stories_required: 0,
          reels_required: 0,
          notes: null,
          status: 'in_progress'
        });
    }

    // 2. Insert Submission
    const { error } = await supabase
      .from("collaboration_submissions")
      .insert(payload);

    if (error) {
      console.error("Submission DB Error:", error);
      return;
    }

    // 3. Update Status
    await supabase
        .from("collaboration_assignments")
        .update({ status: 'in_progress' })
        .eq('collaboration_id', payload.collaboration_id)
        .eq('creator_id', payload.creator_id)
        .eq('status', 'assigned');

    revalidatePath(`/creator-dashboard/collabs/${payload.collaboration_id}/assignment`);
    return;

  } catch (e) {
    console.error("Unexpected error during submission:", e);
    return;
  }
}