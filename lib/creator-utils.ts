// lib/creator-utils.ts
export function calculateEngagementValue(insights: {
  followers_count: number
  average_engagement_rate: number
  total_posts: number
}): number {
  // Simple calculation - adjust weights as needed
  return Math.floor(
    (insights.followers_count * 0.5) + 
    (insights.average_engagement_rate * 1000) +
    (insights.total_posts * 10)
  )
}