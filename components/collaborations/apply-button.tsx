"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface ApplyButtonProps {
  collaborationId: string;
}

export function ApplyButton({ collaborationId }: ApplyButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("collaboration_applications")
        .select("id")
        .eq("collaboration_id", collaborationId)
        .eq("creator_id", user.id)
        .maybeSingle();
      if (mounted && data) setHasApplied(true);
    })();
    return () => {
      mounted = false;
    };
  }, [collaborationId, supabase]);

  const handleApply = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("collaboration_applications")
        .insert({
          collaboration_id: collaborationId,
          creator_id: user.id,
        });

      if (error) {
        // Unique violation means already applied
        const msg = (error as any)?.message?.toLowerCase?.() || "";
        if (msg.includes("duplicate") || msg.includes("unique") || msg.includes("already exists")) {
          setHasApplied(true);
          alert("You have already applied for this collaboration.");
          return;
        }
        throw error;
      }

      setHasApplied(true);
      alert("Thanks for showing interest! Your application has been submitted.");
      router.refresh();
    } catch (error) {
      console.error("Error applying:", error);
      alert("Something went wrong while applying. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleApply} disabled={isLoading || hasApplied} className="w-full">
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {hasApplied ? "Already applied" : "Apply for Collaboration"}
    </Button>
  );
}
