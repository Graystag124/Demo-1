"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getTierByEngagement } from "@/lib/creator-tiers"
import { cn } from "@/lib/utils"

interface TieredAvatarProps {
  engagementValue: number
  src?: string
  alt?: string
  fallback: string
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-16 w-16",
  xl: "h-24 w-24"
}

const ringSize = {
  sm: "p-0.5",
  md: "p-1",
  lg: "p-1.5",
  xl: "p-2"
}

export function TieredAvatar({
  engagementValue,
  src,
  alt,
  fallback,
  className,
  size = "md"
}: TieredAvatarProps) {
  const tier = getTierByEngagement(engagementValue)
  
  return (
    <div className={cn(
      "rounded-full inline-block",
      `bg-gradient-to-r ${tier.color}`,
      ringSize[size],
      className
    )}>
      <div className={cn(
        "bg-background rounded-full p-0.5"
      )}>
        <Avatar className={cn(
          sizeClasses[size]
        )}>
          <AvatarImage src={src} alt={alt} className="object-cover" />
          <AvatarFallback className="bg-muted">
            {fallback[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  )
}
