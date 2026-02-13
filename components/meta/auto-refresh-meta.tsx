"use client";

import { useEffect } from "react";

export function AutoRefreshMeta() {
  useEffect(() => {
    // Auto-refresh Meta token on dashboard load
    async function autoRefreshToken() {
      try {
        await fetch("/api/meta/auto-refresh", {
          method: "POST",
        });
      } catch (error) {
        console.error("Error auto-refreshing Meta token:", error);
      }
    }

    // Auto-refresh insights on dashboard load
    async function autoRefreshInsights() {
      try {
        await fetch("/api/insights/auto-refresh", {
          method: "POST",
        });
      } catch (error) {
        console.error("Error auto-refreshing insights:", error);
      }
    }

    autoRefreshToken();
    autoRefreshInsights();
  }, []);

  return null;
}
