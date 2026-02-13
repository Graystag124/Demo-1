"use client";

import { useRouter } from "next/navigation";
import type React from "react";

export function ClickableApplicationCard({
  href, className, children,
}: { href: string; className?: string; children: React.ReactNode }) {
  const router = useRouter();
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(href)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") router.push(href); }}
      className={className}
    >
      {children}
    </div>
  );
}

export function stopClick(e: React.MouseEvent) {
  e.stopPropagation();
}