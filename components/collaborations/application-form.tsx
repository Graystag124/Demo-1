"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner"; 
import { applyForCollaboration } from "@/app/actions/apply-collaboration";

interface ApplicationFormProps {
  collaborationId: string;
  availableDates: string[] | null;
  hasApplied: boolean;
}

export function ApplicationForm({
  collaborationId,
  availableDates,
  hasApplied,
}: ApplicationFormProps) {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  if (hasApplied) {
    return (
      <Button disabled className="w-full">
        Already applied
      </Button>
    );
  }

  const handleSubmit = () => {
    if (!selectedDate) {
      toast.error("Please select a date to apply.");
      return;
    }

    startTransition(async () => {
      const result = await applyForCollaboration(collaborationId, selectedDate);
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Application submitted successfully!");
      }
    });
  };

  return (
    <div className="space-y-6 pt-2">
      {availableDates && availableDates.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Select your availability:
          </h4>
          <RadioGroup 
            value={selectedDate} 
            onValueChange={setSelectedDate}
            className="grid gap-2"
          >
            {availableDates.map((date, index) => (
              <div key={index} className="flex items-center space-x-2 border p-3 rounded-md hover:bg-accent/50 cursor-pointer">
                <RadioGroupItem value={date} id={`date-${index}`} />
                <Label htmlFor={`date-${index}`} className="flex-1 cursor-pointer">
                  {new Date(date).toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      <Button 
        onClick={handleSubmit} 
        disabled={isPending || ((availableDates?.length ?? 0) > 0 && !selectedDate)}
        className="w-full"
      >
        {isPending ? "Submitting..." : "Apply Now"}
      </Button>
    </div>
  );
}