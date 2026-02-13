import { NextResponse } from "next/server";
import { fetchOpenGraph } from "@/lib/og";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url).searchParams.get("url");
    if (!url) {
      return NextResponse.json(
        { error: "URL parameter is required" },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid URL provided" },
        { status: 400 }
      );
    }

    // Add a small delay to prevent rate limiting
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const og = await fetchOpenGraph(url);
    
    if (!og) {
      return NextResponse.json(
        { error: "Could not fetch link preview" },
        { status: 400 }
      );
    }

    return NextResponse.json(og, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    console.error("Error in og-preview API:", err);
    return NextResponse.json(
      { error: "Failed to fetch link preview" },
      { status: 500 }
    );
  }
}
