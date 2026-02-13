'use client';

import { Button } from "@/components/ui/button";
import { Loader2, Play, Pause } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { updateAssignmentStatus } from "@/app/actions/update-assignment-status";

type Status = 'assigned' | 'in_progress' | 'paused' | 'completed';

interface StatusUpdateButtonsProps {
  collaborationId: string;
  creatorId: string;
  currentStatus: Status;
  className?: string;
}

export function StatusUpdateButtons({
  collaborationId,
  creatorId,
  currentStatus,
  className = "",
}: StatusUpdateButtonsProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatusUpdate = (newStatus: 'in_progress' | 'paused') => {
    startTransition(async () => {
      const result = await updateAssignmentStatus({
        collaborationId,
        creatorId,
        status: newStatus,
      });

      if (result.success) {
        toast.success(
          newStatus === 'in_progress' 
            ? "Assignment started!" 
            : "Assignment paused"
        );
      } else {
        toast.error(result.error || "Failed to update status");
      }
    });
  };

  // Show start button if status is 'assigned' or 'paused'
  const showStartButton = ['assigned', 'paused'].includes(currentStatus);
  // Show pause button only if status is 'in_progress'
  const showPauseButton = currentStatus === 'in_progress';

  return (
    <div className={`flex gap-2 ${className}`}>
      {showStartButton && (
        <Button
          variant="default"
          size="sm"
          onClick={() => handleStatusUpdate('in_progress')}
          disabled={isPending}
          className="gap-1.5"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {currentStatus === 'paused' ? 'Resume' : 'Start'}
        </Button>
      )}
      
      {showPauseButton && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleStatusUpdate('paused')}
          disabled={isPending}
          className="gap-1.5"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Pause className="h-4 w-4" />
          )}
          Pause
        </Button>
      )}
    </div>
  );
}
