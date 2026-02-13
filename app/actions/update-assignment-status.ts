'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type UpdateStatusParams = {
  collaborationId: string;
  creatorId: string;
  status: 'in_progress' | 'paused' | 'completed';
};

export async function updateAssignmentStatus({ collaborationId, creatorId, status }: UpdateStatusParams) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('collaboration_assignments')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('collaboration_id', collaborationId)
      .eq('creator_id', creatorId)
      .select()
      .single();

    if (error) {
      console.error('Error updating assignment status:', error);
      return { success: false, error: error.message };
    }

    // Revalidate the assignment page
    const path = `/creator-dashboard/collabs/${collaborationId}/assignment`;
    revalidatePath(path);

    return { success: true, data };
  } catch (error) {
    console.error('Failed to update assignment status:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update assignment status' 
    };
  }
}
