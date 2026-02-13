// lib/creator-tiers.ts
import { Crown, Star, Award, Zap } from "lucide-react"

export interface TierInfo {
  level: number
  name: string
  color: string
  hexColor: string
  icon: React.ComponentType<{ className?: string }>
  minValue: number
  maxValue: number
}

export const TIERS: TierInfo[] = [
  {
    level: 1,
    name: "Tier 1",
    color: "from-yellow-400 to-yellow-600", // Gold
    hexColor: "#FFD700",
    icon: Crown,
    minValue: 10000,
    maxValue: Infinity
  },
  {
    level: 2,
    name: "Tier 2",
    color: "from-slate-300 to-slate-500", // Silver
    hexColor: "#C0C0C0",
    icon: Star,
    minValue: 2500,
    maxValue: 9999
  },
  {
    level: 3,
    name: "Tier 3",
    color: "from-amber-600 to-amber-800", // Bronze
    hexColor: "#CD7F32",
    icon: Award,
    minValue: 1000,
    maxValue: 2499
  },
  {
    level: 4,
    name: "Tier 4",
    color: "from-gray-400 to-gray-600", // Neutral
    hexColor: "#999999",
    icon: Zap,
    minValue: 200,
    maxValue: 999
  }
]

export function getTierByEngagement(engagementValue: number): TierInfo {
  const tier = TIERS.find(
    t => engagementValue >= t.minValue && engagementValue <= t.maxValue
  )
  return tier || TIERS[TIERS.length - 1] // Default to lowest tier
}

export function getProgressToNextTier(
  engagementValue: number
): { progress: number; nextTier: TierInfo | null } {
  const currentTier = getTierByEngagement(engagementValue)
  const currentTierIndex = TIERS.findIndex(t => t.level === currentTier.level)
  
  if (currentTierIndex === 0) {
    return { progress: 100, nextTier: null } // Already at highest tier
  }

  const nextTier = TIERS[currentTierIndex - 1]
  const currentRangeStart = currentTier.minValue
  const currentRangeEnd = currentTier.maxValue === Infinity ? nextTier.minValue : currentTier.maxValue
  const range = currentRangeEnd - currentRangeStart
  const progress = Math.min(
    100,
    Math.max(0, ((engagementValue - currentRangeStart) / range) * 100)
  )

  return { progress, nextTier }
}

export function getAccessibleTiers(userTierLevel: number): number[] {
  // Returns tier levels that user can discover
  switch (userTierLevel) {
    case 1: // Tier 1 can discover all tiers
      return [1, 2, 3, 4]
    case 2: // Tier 2 can discover Tier 2, 3, 4
      return [2, 3, 4]
    case 3: // Tier 3 can discover Tier 3, 4
      return [3, 4]
    case 4: // Tier 4 can only discover Tier 4
      return [4]
    default:
      return [4] // Default to lowest tier
  }
}

export function canDiscoverTier(userTierLevel: number, targetTierLevel: number): boolean {
  const accessibleTiers = getAccessibleTiers(userTierLevel)
  return accessibleTiers.includes(targetTierLevel)
}