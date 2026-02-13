'use client'

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Lock, Crown } from "lucide-react"
import { getTierByEngagement } from "@/lib/creator-tiers"

interface TierRestrictionMessageProps {
  userEngagementValue: number
  requiredTierLevel: number
  onUpgrade?: () => void
  className?: string
}

export function TierRestrictionMessage({ 
  userEngagementValue, 
  requiredTierLevel, 
  onUpgrade,
  className 
}: TierRestrictionMessageProps) {
  const userTier = getTierByEngagement(userEngagementValue)
  const requiredTier = getTierByEngagement(
    requiredTierLevel === 1 ? 10000 : 
    requiredTierLevel === 2 ? 2500 : 
    requiredTierLevel === 3 ? 1000 : 200
  )

  return (
    <Alert className={className}>
      <Lock className="h-4 w-4" />
      <AlertDescription className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Tier {requiredTier.level} Required</span>
          <Crown className="h-4 w-4 text-yellow-500" />
        </div>
        
        <p className="text-sm text-gray-600">
          You are currently <span className="font-semibold">{userTier.name}</span> ({userEngagementValue.toLocaleString()} engagement).
          Upgrade to <span className="font-semibold">{requiredTier.name}</span> to unlock higher-level creators.
        </p>
        
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-xs text-gray-500">
            Required: {requiredTier.minValue.toLocaleString()}+ engagement
          </div>
          {onUpgrade && (
            <Button size="sm" variant="outline" onClick={onUpgrade}>
              Learn How to Upgrade
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}
