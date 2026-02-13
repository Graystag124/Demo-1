"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2, Trash2, Undo2 } from "lucide-react";
import { toast } from "sonner"; 

interface UserActionButtonsProps {
  userId: string;
  // New optional props for the deletion feature
  isDeletionRequest?: boolean; 
  requestId?: string;
  onStatusChange?: (status: string) => void;
  onDeleteSuccess?: () => void;
}

export function UserActionButtons({ userId, isDeletionRequest, requestId, onStatusChange, onDeleteSuccess }: UserActionButtonsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // --- 1. Logic for Standard User Approval (Existing) ---
  const handleUpdate = async (status: "approved" | "rejected") => {
    setIsLoading(true);
    const previousStatus = document.querySelector(`[data-user-id="${userId}"]`)?.getAttribute('data-status');
    
    try {
      // Optimistic update
      if (onStatusChange) {
        onStatusChange(status);
      }

      const { error } = await supabase
        .from("users")
        .update({ approval_status: status })
        .eq("id", userId);

      if (error) throw error;
      
      toast.success(`User ${status} successfully`); 
      router.refresh();
    } catch (error) {
      console.error(error);
      // Revert optimistic update on error
      if (onStatusChange && previousStatus) {
        onStatusChange(previousStatus);
      }
      toast.error("Failed to update status");
    } finally {
      setIsLoading(false);
    }
  };

  // --- 2. Logic for Deletion Requests (New) ---
  const handleDeleteAction = async (action: 'approve_delete' | 'reject_delete') => {
    if (!requestId) return;
    setIsLoading(true);

    try {
      // Optimistic update
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }

      if (action === 'approve_delete') {
        const { error } = await supabase.from("users").delete().eq("id", userId);
        if (error) throw error;
        toast.success("User account deleted successfully");
      } else {
        const { error } = await supabase
          .from("deletion_requests")
          .update({ status: 'rejected' })
          .eq("id", requestId);
          
        if (error) throw error;
        toast.info("Deletion request rejected (User kept)");
      }
      
      // Only refresh if we didn't already handle the UI update optimistically
      if (!onDeleteSuccess) {
        router.refresh();
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Action failed: " + error.message);
      // If we have onDeleteSuccess, the parent will handle the error state
      if (!onDeleteSuccess) {
        router.refresh();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDER: If this is a Deletion Request ---
  if (isDeletionRequest) {
    return (
      <div className="flex flex-col gap-2 w-40">
        {/* Approve Delete = Destructive Action (Red) */}
        <Button 
          size="sm" 
          variant="destructive"
          onClick={() => handleDeleteAction('approve_delete')} 
          disabled={isLoading}
          className="w-full bg-red-600 hover:bg-red-700 text-white h-8 text-xs"
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Trash2 className="h-3 w-3 mr-1" />
          )}
          Delete Account
        </Button>
        
        {/* Reject Delete = Keep User (Neutral/Outline) */}
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => handleDeleteAction('reject_delete')} 
          disabled={isLoading}
          className="w-full border-border bg-background hover:bg-muted text-foreground h-8 text-xs"
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Undo2 className="h-3 w-3 mr-1" />
          )}
          Keep Account
        </Button>
      </div>
    );
  }

  // --- RENDER: Standard User Approval (Your existing buttons) ---
  return (
    <div className="flex flex-col gap-2 w-32">
      <Button 
        size="sm" 
        onClick={() => handleUpdate("approved")} 
        disabled={isLoading}
        className="w-full h-8 text-xs"
      >
        {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3 mr-1" />}
        Approve
      </Button>
      
      <Button 
        size="sm" 
        variant="destructive"
        onClick={() => handleUpdate("rejected")} 
        disabled={isLoading}
        className="w-full h-8 text-xs"
      >
        {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3 mr-1" />}
        Reject
      </Button>
    </div>
  );
}