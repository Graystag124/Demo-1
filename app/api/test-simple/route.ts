import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    message: "Simple test working",
    timestamp: new Date().toISOString(),
    hasMetaId: !!process.env.NEXT_PUBLIC_META_APP_ID,
    metaIdLength: process.env.NEXT_PUBLIC_META_APP_ID?.length || 0
  });
}
