import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { code, redirectUri } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: "Authorization code is required" },
        { status: 400 }
      );
    }

    const appId = process.env.NEXT_PUBLIC_META_APP_ID || "717766051347061";
    const appSecret = process.env.META_APP_SECRET || "6d702034078200a885991c96620a0f89";

    if (!appId || !appSecret) {
      console.error("[v0] Missing Meta credentials");
      return NextResponse.json(
        { error: "Meta API credentials not configured" },
        { status: 500 }
      );
    }

    console.log("[v0] Exchanging code for access token...");
    console.log("[v0] App ID:", appId);
    console.log("[v0] Redirect URI:", redirectUri);

    // Exchange authorization code for access token
    const tokenUrl = new URL("https://graph.facebook.com/v21.0/oauth/access_token");
    tokenUrl.searchParams.set("client_id", appId);
    tokenUrl.searchParams.set("client_secret", appSecret);
    tokenUrl.searchParams.set("redirect_uri", redirectUri);
    tokenUrl.searchParams.set("code", code);

    const tokenResponse = await fetch(tokenUrl.toString());
    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("[v0] Token exchange error:", tokenData.error);
      return NextResponse.json(
        { error: tokenData.error.message || "Failed to exchange token" },
        { status: 400 }
      );
    }

    console.log("[v0] Successfully obtained access token");

    // Exchange for long-lived token (60 days)
    const longLivedUrl = new URL("https://graph.facebook.com/v21.0/oauth/access_token");
    longLivedUrl.searchParams.set("grant_type", "fb_exchange_token");
    longLivedUrl.searchParams.set("client_id", appId);
    longLivedUrl.searchParams.set("client_secret", appSecret);
    longLivedUrl.searchParams.set("fb_exchange_token", tokenData.access_token);

    const longLivedResponse = await fetch(longLivedUrl.toString());
    const longLivedData = await longLivedResponse.json();

    if (longLivedData.error) {
      console.error("[v0] Long-lived token exchange error:", longLivedData.error);
      // Return short-lived token if long-lived exchange fails
      return NextResponse.json({
        accessToken: tokenData.access_token,
        expiresIn: tokenData.expires_in,
      });
    }

    console.log("[v0] Successfully obtained long-lived token");

    return NextResponse.json({
      accessToken: longLivedData.access_token,
      expiresIn: longLivedData.expires_in,
    });
  } catch (error: any) {
    console.error("[v0] Token exchange error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
