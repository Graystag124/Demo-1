'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { getTierByEngagement } from "@/lib/creator-tiers"

interface TierRingProps {
  engagementValue: number
  src?: string
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function TierRing({ 
  engagementValue, 
  src, 
  alt, 
  fallback, 
  size = 'md',
  className 
}: TierRingProps) {
  const tier = getTierByEngagement(engagementValue)
  
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20'
  }

  const ringSizes = {
    sm: 'ring-2',
    md: 'ring-3',
    lg: 'ring-4',
    xl: 'ring-4'
  }

  const getRingColor = (level: number) => {
    switch (level) {
      case 1: // Gold
        return 'ring-yellow-500 shadow-yellow-500/25'
      case 2: // Silver
        return 'ring-slate-400 shadow-slate-400/25'
      case 3: // Bronze
        return 'ring-amber-600 shadow-amber-600/25'
      case 4: // Neutral
        return 'ring-gray-500 shadow-gray-500/25'
      default:
        return 'ring-gray-400 shadow-gray-400/25'
    }
  }

  return (
    <div className={cn('relative inline-block', className)}>
      <Avatar className={cn(
        sizeClasses[size],
        ringSizes[size],
        getRingColor(tier.level),
        'shadow-lg'
      )}>
        <AvatarImage src={src} alt={alt} />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
    </div>
  )
}
