import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    console.log("[Config] Environment check:");
    console.log("[Config] NEXT_PUBLIC_META_APP_ID:", process.env.NEXT_PUBLIC_META_APP_ID ? 'Present' : 'Missing');
    console.log("[Config] META_APP_ID:", process.env.META_APP_ID ? 'Present' : 'Missing');
    
    // Fallback to hardcoded values if environment variables are missing
    const metaAppId = process.env.NEXT_PUBLIC_META_APP_ID || 
                     process.env.META_APP_ID || 
                     "717766051347061"; // Hardcoded fallback
    
    const isConfigured = !!metaAppId;
    
    return NextResponse.json({
      metaAppId,
      isConfigured,
      envCheck: {
        NEXT_PUBLIC_META_APP_ID: !!process.env.NEXT_PUBLIC_META_APP_ID,
        META_APP_ID: !!process.env.META_APP_ID,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "https://byberr.in",
        NEXT_PUBLIC_REDIRECT_URI: process.env.NEXT_PUBLIC_REDIRECT_URI || "https://byberr.in/auth/instagram/callback"
      },
      usingFallback: !process.env.NEXT_PUBLIC_META_APP_ID && !process.env.META_APP_ID
    });
  } catch (error) {
    console.error("[Config] Error:", error);
    return NextResponse.json(
      { 
        error: "Configuration error", 
        message: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}
