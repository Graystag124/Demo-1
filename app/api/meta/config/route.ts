import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const appId = process.env.NEXT_PUBLIC_META_APP_ID || process.env.META_APP_ID;
  
  if (!appId) {
    console.error('Meta App ID is not set in environment variables');
    return NextResponse.json(
      { error: "Instagram configuration is not properly set up" },
      { status: 500 }
    );
  }

  return NextResponse.json({ appId });
}
