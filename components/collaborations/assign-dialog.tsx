// src/components/collaborations/assign-dialog.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFormStatus } from "react-dom";
import { assignCreator } from "@/app/business-dashboard/collabs/[id]/actions";
import { useRouter } from "next/navigation";

// Helper to show loading state on button
function SubmitButton({ isSubmitting }: { isSubmitting: boolean }) {
  const { pending } = useFormStatus();
  const isLoading = pending || isSubmitting;
  
  return (
    <Button type="submit" disabled={isLoading}>
      {isLoading ? "Assigning..." : "Confirm Assignment"}
    </Button>
  );
}

export function AssignDialog({ 
  collabId, 
  creatorId, 
  creatorName 
}: { 
  collabId: string, 
  creatorId: string, 
  creatorName: string 
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const formData = new FormData(e.currentTarget);
      
      // Add required fields to form data
      formData.append("collaboration_id", collabId);
      formData.append("creator_id", creatorId);
      
      const result = await assignCreator(null, formData);
      
      if (result.success) {
        setOpen(false);
        // Refresh the page to show updated data
        router.refresh();
      } else {
        setError(result.message || "Failed to assign creator");
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* stopPropagation prevents clicking the parent card link */}
      <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button size="sm">Assign</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Assign {creatorName}</DialogTitle>
          <DialogDescription>
            Set the deliverables required for this collaboration.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <input type="hidden" name="collaboration_id" value={collabId} />
          <input type="hidden" name="creator_id" value={creatorId} />

          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="posts">Posts</Label>
              <Input 
                id="posts" 
                name="posts_required" 
                type="number" 
                defaultValue="1" 
                min="0" 
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stories">Stories</Label>
              <Input 
                id="stories" 
                name="stories_required" 
                type="number" 
                defaultValue="1" 
                min="0" 
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reels">Reels</Label>
              <Input 
                id="reels" 
                name="reels_required" 
                type="number" 
                defaultValue="0" 
                min="0"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Instructions / Notes</Label>
            <Textarea 
              id="notes" 
              name="notes" 
              placeholder="Details about the shipping address or content guidelines..."
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <DialogFooter>
            <SubmitButton isSubmitting={isSubmitting} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}