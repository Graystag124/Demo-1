"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";

function CallbackContent() {
  const [status, setStatus] = useState("Processing...");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function handleCallback() {
      const code = searchParams.get("code");
      const state = searchParams.get("state"); // user_type
      const error = searchParams.get("error");

      if (error) {
        setStatus("Failed to connect Meta account");
        setTimeout(() => router.push("/pending"), 2000);
        return;
      }

      if (!code) {
        setStatus("No authorization code received");
        setTimeout(() => router.push("/pending"), 2000);
        return;
      }

      try {
        const supabase = createClient();
        
        // Call our API route to exchange code for token
        const response = await fetch("/api/meta/exchange-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, userType: state }),
        });

        if (!response.ok) {
          throw new Error("Failed to exchange token");
        }

        setStatus("Successfully connected Meta account!");
        setTimeout(() => router.push("/pending"), 1500);
      } catch (error) {
        console.error("[v0] Error:", error);
        setStatus("Error connecting Meta account");
        setTimeout(() => router.push("/pending"), 2000);
      }
    }

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">{status}</h1>
        <p className="text-muted-foreground">Please wait...</p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex min-h-svh w-full items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p className="text-muted-foreground">Please wait...</p>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
