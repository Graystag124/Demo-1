'use client'

import { Badge } from "@/components/ui/badge"
import { Crown, Star, Award, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { getTierByEngagement } from "@/lib/creator-tiers"

interface TierBadgeProps {
  engagementValue: number
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
  className?: string
}

export function TierBadge({ 
  engagementValue, 
  size = 'sm', 
  showTooltip = true,
  className 
}: TierBadgeProps) {
  const tier = getTierByEngagement(engagementValue)
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  const getTierColors = (level: number) => {
    switch (level) {
      case 1: // Gold
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-yellow-500'
      case 2: // Silver
        return 'bg-gradient-to-r from-slate-300 to-slate-500 text-white border-slate-400'
      case 3: // Bronze
        return 'bg-gradient-to-r from-amber-600 to-amber-800 text-white border-amber-700'
      case 4: // Neutral
        return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white border-gray-500'
      default:
        return 'bg-gray-100 text-gray-600 border-gray-300'
    }
  }

  const Icon = tier.icon

  const badge = (
    <Badge 
      variant="outline" 
      className={cn(
        'font-semibold border-2 flex items-center gap-1',
        getTierColors(tier.level),
        sizeClasses[size],
        className
      )}
    >
      <Icon className={iconSizes[size]} />
      {tier.name}
    </Badge>
  )

  if (!showTooltip) return badge

  return (
    <div className="group relative inline-block">
      {badge}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
        <div className="font-semibold">{tier.name} Creator</div>
        <div className="text-gray-300">{engagementValue.toLocaleString()}+ engagement</div>
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
          <div className="border-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    </div>
  )
}
