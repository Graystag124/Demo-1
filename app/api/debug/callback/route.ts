import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    console.log("=== DEBUG CALLBACK ===");
    console.log("Full URL:", request.url);
    console.log("Query params:", Object.fromEntries(searchParams.entries()));
    console.log("=====================");

    return NextResponse.json({
      message: "Meta callback OK",
      url: request.url,
      query: Object.fromEntries(searchParams.entries()),
      timestamp: new Date().toISOString(),
      env: {
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        NEXT_PUBLIC_REDIRECT_URI: process.env.NEXT_PUBLIC_REDIRECT_URI
      }
    });
  } catch (error) {
    console.error("Debug callback error:", error);
    return NextResponse.json(
      { 
        error: "Debug callback error", 
        message: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}
