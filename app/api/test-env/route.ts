import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    metaAppId: process.env.NEXT_PUBLIC_META_APP_ID,
    nodeEnv: process.env.NODE_ENV,
  });
}
