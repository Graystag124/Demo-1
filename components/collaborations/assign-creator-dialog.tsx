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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFormStatus } from "react-dom";
import { assignCreator } from "@/app/business-dashboard/collabs/[id]/actions";

// Helper to show loading state on button
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Assigning..." : "Confirm Assignment"}
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
  const [state, setState] = useState<{success: boolean, message: string} | null>(null);

  async function clientAction(prevState: any, formData: FormData) {
    const result = await assignCreator(prevState, formData);
    if (result.success) {
      setOpen(false); // Close modal on success
    }
    setState(result);
    return result;
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
        
        <form action={clientAction as any} className="grid gap-4 py-4">
          <input type="hidden" name="collaboration_id" value={collabId} />
          <input type="hidden" name="creator_id" value={creatorId} />

          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="posts">Posts</Label>
              <Input id="posts" name="posts_required" type="number" defaultValue="1" min="0" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stories">Stories</Label>
              <Input id="stories" name="stories_required" type="number" defaultValue="1" min="0" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reels">Reels</Label>
              <Input id="reels" name="reels_required" type="number" defaultValue="0" min="0" />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Instructions / Notes</Label>
            <Textarea 
              id="notes" 
              name="notes" 
              placeholder="Details about the shipping address or content guidelines..." 
            />
          </div>

          {state?.message && !state.success && (
            <p className="text-sm text-red-500">{state.message}</p>
          )}

          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}