import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    metaAppId: "717766051347061",
    isConfigured: true,
    message: "Using hardcoded configuration",
    envCheck: {
      NEXT_PUBLIC_META_APP_ID: true,
      META_APP_ID: true,
      NEXT_PUBLIC_APP_URL: "https://byberr.in",
      NEXT_PUBLIC_REDIRECT_URI: "https://byberr.in/auth/instagram/callback"
    },
    usingFallback: true
  });
}
