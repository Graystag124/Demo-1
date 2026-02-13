"use client";

import { Suspense } from "react";
import NextDynamic from "next/dynamic";

// Load the actual component only in the browser (no SSR)
const InstagramCallbackPage = NextDynamic(
  () => import("./InstagramCallbackPage"),
  { ssr: false }
);

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading Instagram callback...</div>}>
      <InstagramCallbackPage />
    </Suspense>
  );
}
