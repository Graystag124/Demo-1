'use client'

import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { getProgressToNextTier, getTierByEngagement } from "@/lib/creator-tiers"

interface TierProgressBarProps {
  engagementValue: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function TierProgressBar({ 
  engagementValue, 
  showLabel = true, 
  size = 'md',
  className 
}: TierProgressBarProps) {
  const currentTier = getTierByEngagement(engagementValue)
  const { progress, nextTier } = getProgressToNextTier(engagementValue)
  
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  }

  const getProgressColor = (level: number) => {
    switch (level) {
      case 1: // Gold
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600'
      case 2: // Silver
        return 'bg-gradient-to-r from-slate-300 to-slate-500'
      case 3: // Bronze
        return 'bg-gradient-to-r from-amber-600 to-amber-800'
      case 4: // Neutral
        return 'bg-gradient-to-r from-gray-400 to-gray-600'
      default:
        return 'bg-gray-400'
    }
  }

  if (!nextTier) {
    return (
      <div className={cn('space-y-2', className)}>
        {showLabel && (
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Maximum Tier</span>
            <span className="text-sm font-bold text-yellow-600">{currentTier.name}</span>
          </div>
        )}
        <Progress value={100} className={cn(sizeClasses[size], 'bg-gray-200')} />
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      {showLabel && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Progress to {nextTier.name}</span>
          <span className="text-sm font-bold">
            {engagementValue.toLocaleString()} / {nextTier.minValue.toLocaleString()}
          </span>
        </div>
      )}
      <div className="relative">
        <Progress 
          value={progress} 
          className={cn(
            sizeClasses[size], 
            'bg-gray-200',
            '[&>div]:transition-all [&>div]:duration-500 [&>div]:ease-out'
          )} 
        />
        <div 
          className={cn(
            'absolute top-0 left-0 h-full rounded-full',
            getProgressColor(currentTier.level),
            'transition-all duration-500 ease-out'
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{currentTier.name}</span>
        <span>{nextTier.name}</span>
      </div>
    </div>
  )
}
