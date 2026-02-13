"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Play, Pause, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  collaborationId: string;
  creatorId: string;
  currentStatus: string;
  assignmentId?: string; // Optional because it might be a 'virtual' assignment initially
}

export function AssignmentStatusActions({ collaborationId, creatorId, currentStatus, assignmentId }: Props) {
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [missingSubmissions, setMissingSubmissions] = useState<string[]>([]);
  const supabase = createClient();
  const router = useRouter();

  const checkSubmissions = async () => {
    setLoading(true);
    try {
      // First, get the current assignment to check required counts
      const { data: assignmentData, error: assignmentError } = await supabase
        .from("collaboration_assignments")
        .select("posts_required, stories_required, reels_required")
        .eq("id", assignmentId || '')
        .single();

      if (assignmentError) throw assignmentError;

      // Get the count of approved submissions for each type
      const { count: postsCount } = await supabase
        .from("collaboration_submissions")
        .select("*", { count: 'exact', head: true })
        .eq("collaboration_id", collaborationId)
        .eq("creator_id", creatorId)
        .eq("type", "post")
        .eq("status", "approved");

      const { count: storiesCount } = await supabase
        .from("collaboration_submissions")
        .select("*", { count: 'exact', head: true })
        .eq("collaboration_id", collaborationId)
        .eq("creator_id", creatorId)
        .eq("type", "story")
        .eq("status", "approved");

      const { count: reelsCount } = await supabase
        .from("collaboration_submissions")
        .select("*", { count: 'exact', head: true })
        .eq("collaboration_id", collaborationId)
        .eq("creator_id", creatorId)
        .eq("type", "reel")
        .eq("status", "approved");

      // Check if all required submissions are completed
      const missing: string[] = [];
      if (assignmentData.posts_required > 0 && (!postsCount || postsCount < assignmentData.posts_required)) {
        missing.push(`${assignmentData.posts_required - (postsCount || 0)} more post(s)`);
      }
      if (assignmentData.stories_required > 0 && (!storiesCount || storiesCount < assignmentData.stories_required)) {
        missing.push(`${assignmentData.stories_required - (storiesCount || 0)} more storie(s)`);
      }
      if (assignmentData.reels_required > 0 && (!reelsCount || reelsCount < assignmentData.reels_required)) {
        missing.push(`${assignmentData.reels_required - (reelsCount || 0)} more reel(s)`);
      }

      if (missing.length > 0) {
        setMissingSubmissions(missing);
        setShowConfirmDialog(true);
        return false;
      }
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to check submissions");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (newStatus === 'completed_awaited_approval') {
      const canComplete = await checkSubmissions();
      if (!canComplete) return;
    }
    
    setLoading(true);
    try {
      if (newStatus === 'completed_awaited_approval') {
        // First, get the current assignment to check required counts
        const { data: assignmentData, error: assignmentError } = await supabase
          .from("collaboration_assignments")
          .select("posts_required, stories_required, reels_required")
          .eq("id", assignmentId || '')
          .single();

        if (assignmentError) throw assignmentError;

        // Get the count of approved submissions for each type
        const { count: postsCount } = await supabase
          .from("collaboration_submissions")
          .select("*", { count: 'exact', head: true })
          .eq("collaboration_id", collaborationId)
          .eq("creator_id", creatorId)
          .eq("type", "post")
          .eq("status", "approved");

        const { count: storiesCount } = await supabase
          .from("collaboration_submissions")
          .select("*", { count: 'exact', head: true })
          .eq("collaboration_id", collaborationId)
          .eq("creator_id", creatorId)
          .eq("type", "story")
          .eq("status", "approved");

        const { count: reelsCount } = await supabase
          .from("collaboration_submissions")
          .select("*", { count: 'exact', head: true })
          .eq("collaboration_id", collaborationId)
          .eq("creator_id", creatorId)
          .eq("type", "reel")
          .eq("status", "approved");

        // Check if all required submissions are completed
        const missingSubmissions = [];
        if (assignmentData.posts_required > 0 && (!postsCount || postsCount < assignmentData.posts_required)) {
          missingSubmissions.push(`${assignmentData.posts_required - (postsCount || 0)} more post(s)`);
        }
        if (assignmentData.stories_required > 0 && (!storiesCount || storiesCount < assignmentData.stories_required)) {
          missingSubmissions.push(`${assignmentData.stories_required - (storiesCount || 0)} more storie(s)`);
        }
        if (assignmentData.reels_required > 0 && (!reelsCount || reelsCount < assignmentData.reels_required)) {
          missingSubmissions.push(`${assignmentData.reels_required - (reelsCount || 0)} more reel(s)`);
        }

        if (missingSubmissions.length > 0) {
          throw new Error(`Complete required submissions: ${missingSubmissions.join(', ')}`);
        }
      }

      if (assignmentId) {
        const { error } = await supabase
          .from("collaboration_assignments")
          .update({ status: newStatus })
          .eq("id", assignmentId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("collaboration_assignments")
          .insert({
            collaboration_id: collaborationId,
            creator_id: creatorId,
            status: newStatus,
            posts_required: 0,
            stories_required: 0,
            reels_required: 0
          });
        if (error) throw error;
      }

      toast.success(`Status updated to ${newStatus.replace(/_/g, ' ')}`);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Button disabled variant="outline"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</Button>;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {/* Show Start button if not in progress */}
        {(currentStatus === 'assigned' || currentStatus === 'not_assigned' || currentStatus === 'paused') && (
          <Button onClick={() => updateStatus('in_progress')}>
            <Play className="mr-2 h-4 w-4" /> {currentStatus === 'paused' ? 'Resume' : 'Start Assignment'}
          </Button>
        )}

        {/* Show Pause and Complete buttons only when In Progress */}
        {currentStatus === 'in_progress' && (
          <>
            <Button variant="outline" onClick={() => updateStatus('paused')}>
              <Pause className="mr-2 h-4 w-4" /> Pause
            </Button>
            <Button 
              onClick={() => updateStatus('completed_awaited_approval')} 
              variant="default"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" /> 
                  Mark as Completed
                </>
              )}
            </Button>
          </>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <AlertDialogTitle>Incomplete Submissions</AlertDialogTitle>
            </div>
            <AlertDialogDescription asChild>
              <div className="pt-4 space-y-4">
                <div className="text-sm">
                  Please complete the following submissions before marking as completed:
                </div>
                <ul className="list-disc pl-5 space-y-2">
                  {missingSubmissions.map((item, index) => (
                    <li key={index} className="text-foreground">{item}</li>
                  ))}
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>OK</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}