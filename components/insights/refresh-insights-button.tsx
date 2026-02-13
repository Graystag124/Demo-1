"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

export function RefreshInsightsButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleRefresh() {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/insights/refresh", {
        method: "POST",
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("[v0] Error refreshing insights:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button onClick={handleRefresh} disabled={isLoading}>
      {isLoading ? "Refreshing..." : "Refresh Insights"}
    </Button>
  );
}
