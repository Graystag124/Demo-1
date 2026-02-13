"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";

export default function Page() {
  const [userType, setUserType] = useState<"creator" | "business" | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function getUserType() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: userData } = await supabase
        .from("users")
        .select("user_type")
        .eq("id", user.id)
        .single();

      if (userData) {
        setUserType(userData.user_type as "creator" | "business");
      }
      setIsLoading(false);
    }

    getUserType();
  }, [router]);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Verify origin
      if (event.origin !== window.location.origin) {
        console.log("[v0] Ignoring message from different origin:", event.origin);
        return;
      }

      console.log("[v0] Received message:", event.data);

      if (event.data.type === "instagram-auth-success") {
        const { accessToken, pageAccessToken, instagramUserId, instagramHandle, facebookPageId } = event.data;

        console.log("[v0] Instagram auth success, saving to database...");

        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();

          if (!user) {
            throw new Error("User not authenticated");
          }

          // Calculate expiry (60 days for long-lived token)
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 60);

          // Update user with Meta tokens
          const { error: updateError } = await supabase
            .from("users")
            .update({
              meta_access_token: pageAccessToken || accessToken,
              meta_user_id: instagramUserId,
              meta_token_expires_at: expiresAt.toISOString(),
              instagram_business_account_id: instagramUserId,
              facebook_page_id: facebookPageId,
              display_name: instagramHandle,
            })
            .eq("id", user.id);

          if (updateError) {
            console.error("[v0] Database update error:", updateError);
            throw updateError;
          }

          console.log("[v0] Successfully saved Meta tokens to database");
          
          // Redirect to pending approval page
          router.push("/pending");
        } catch (err: any) {
          console.error("[v0] Error saving Meta tokens:", err);
          setError(err.message || "Failed to save Meta connection");
          setIsConnecting(false);
        }
      } else if (event.data.type === "instagram-auth-error") {
        console.error("[v0] Instagram auth error:", event.data.error);
        setError(event.data.error || "Failed to connect Instagram account");
        setIsConnecting(false);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [router]);

  const handleConnectMeta = () => {
    if (!userType) return;
    
    setIsConnecting(true);
    setError(null);

    console.log("[v0] Starting Instagram OAuth flow for user type:", userType);
    
    const appId = process.env.NEXT_PUBLIC_META_APP_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/instagram/callback`;
    const configId = "1265845242421860";
    
    if (!appId) {
      setError("Meta App ID not configured. Please check environment variables.");
      setIsConnecting(false);
      return;
    }

    console.log("[v0] Meta App ID:", appId);
    console.log("[v0] Redirect URI:", redirectUri);
    console.log("[v0] Config ID:", configId);

    const authUrl = 
      `https://www.facebook.com/v21.0/dialog/oauth?` +
      `client_id=${appId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&config_id=${configId}` +
      `&response_type=code`;

    console.log("[v0] Opening Instagram OAuth popup:", authUrl);
    
    const width = 600;
    const height = 700;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    const popup = window.open(
      authUrl,
      'instagram-oauth',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );

    if (!popup) {
      console.log("[v0] Popup blocked, falling back to redirect");
      setError("Popup blocked. Please allow popups and try again.");
      setIsConnecting(false);
      return;
    }

    const checkPopup = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopup);
        if (isConnecting) {
          setIsConnecting(false);
          setError("Authentication was cancelled or failed");
        }
      }
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Connect Instagram Account</CardTitle>
              <CardDescription>
                Connect your Instagram Business/Creator account to access insights and analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                {userType === "business"
                  ? "Connect your Facebook Page with Instagram Business Account to access insights and manage collaborations."
                  : "Connect your Instagram Creator account to showcase your analytics to potential business partners."}
              </p>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              <Button 
                onClick={handleConnectMeta} 
                className="w-full"
                disabled={isConnecting}
              >
                {isConnecting ? "Connecting..." : "Connect with Instagram"}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/pending")}
                className="w-full"
              >
                Skip for now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
