// components/creator/tier-badge.tsx
"use client"

import { cn } from "@/lib/utils"
import { getTierByEngagement, getProgressToNextTier, TIERS } from "@/lib/creator-tiers"
import { Progress } from "@/components/ui/progress"

interface TierBadgeProps {
  engagementValue: number
  showProgress?: boolean
  className?: string
  size?: "sm" | "md" | "lg"
}

export function TierBadge({
  engagementValue = 0,
  showProgress = true,
  className,
  size = "md"
}: TierBadgeProps) {
  const tier = getTierByEngagement(engagementValue)
  const { progress, nextTier } = getProgressToNextTier(engagementValue)
  const Icon = tier.icon

  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-12 w-12 text-base"
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <div
          className={cn(
            sizeClasses[size],
            "rounded-full flex items-center justify-center bg-gradient-to-r",
            tier.color,
            "text-white"
          )}
        >
          <Icon
            className={cn(
              size === "sm" ? "h-3 w-3" : size === "md" ? "h-4 w-4" : "h-5 w-5"
            )}
          />
        </div>
        <div>
          <p className="text-sm font-medium">{tier.name}</p>
          <p className="text-xs text-muted-foreground">
            {engagementValue.toLocaleString()} points
          </p>
        </div>
      </div>

      {showProgress && nextTier && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress to {nextTier.name}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
    </div>
  )
}