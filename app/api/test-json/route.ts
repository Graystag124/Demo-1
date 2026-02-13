import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    message: "JSON test working",
    timestamp: new Date().toISOString(),
    metaAppId: "717766051347061"
  });
}
