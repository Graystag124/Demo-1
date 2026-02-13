// lib/tier-calculator.ts
import { getTierByEngagement } from "./creator-tiers";

/**
 * Calculate and update creator tier based on engagement value
 * This function should be called whenever engagement metrics change
 */
export async function calculateAndUpdateCreatorTier(
  supabase: any,
  userId: string,
  engagementValue: number
): Promise<{ success: boolean; tier: number; error?: string }> {
  try {
    const tier = getTierByEngagement(engagementValue);
    
    // Update user's tier and engagement_value
    const { error } = await supabase
      .from('users')
      .update({
        engagement_value: engagementValue,
        creator_tier: tier.level,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating creator tier:', error);
      return { success: false, tier: tier.level, error: error.message };
    }

    return { success: true, tier: tier.level };
  } catch (error) {
    console.error('Error in calculateAndUpdateCreatorTier:', error);
    return { 
      success: false, 
      tier: 4, // Default to lowest tier on error
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Calculate engagement value from various metrics
 * This is a sample calculation - adjust based on your business logic
 */
export function calculateEngagementValue(metrics: {
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  views?: number;
  followers?: number;
  collaborations_completed?: number;
}): number {
  const {
    likes = 0,
    comments = 0,
    shares = 0,
    saves = 0,
    views = 0,
    followers = 0,
    collaborations_completed = 0
  } = metrics;

  // Weight different metrics differently
  const weightedEngagement = 
    (likes * 1) +
    (comments * 3) +
    (shares * 5) +
    (saves * 4) +
    (views * 0.1) +
    (followers * 0.01) +
    (collaborations_completed * 100);

  return Math.round(weightedEngagement);
}

/**
 * Batch update tiers for all creators (for cron jobs)
 */
export async function batchUpdateCreatorTiers(supabase: any): Promise<{
  success: boolean;
  updated: number;
  errors: string[];
}> {
  try {
    const errors: string[] = [];
    let updated = 0;

    // Get all creators with their engagement metrics
    const { data: creators, error: fetchError } = await supabase
      .from('users')
      .select(`
        id,
        engagement_value,
        creator_tier,
        collaboration_applications!inner(
          approval_status,
          collaboration_id,
          collaboration_submissions!inner(
            reach_count,
            engagement_metrics
          )
        )
      `)
      .eq('user_type', 'creator');

    if (fetchError) {
      throw new Error(`Failed to fetch creators: ${fetchError.message}`);
    }

    for (const creator of creators || []) {
      try {
        // Calculate new engagement value based on recent activity
        let totalEngagement = creator.engagement_value || 0;
        
        // Add engagement from recent collaborations
        if (creator.collaboration_applications) {
          for (const app of creator.collaboration_applications) {
            if (app.approval_status === 'approved' && app.collaboration_submissions) {
              for (const submission of app.collaboration_submissions) {
                if (submission.engagement_metrics) {
                  const metrics = JSON.parse(submission.engagement_metrics);
                  totalEngagement += calculateEngagementValue(metrics);
                }
                totalEngagement += submission.reach_count || 0;
              }
            }
          }
        }

        // Update tier
        const result = await calculateAndUpdateCreatorTier(supabase, creator.id, totalEngagement);
        if (result.success) {
          updated++;
        } else {
          errors.push(`Failed to update user ${creator.id}: ${result.error}`);
        }
      } catch (error) {
        errors.push(`Error processing user ${creator.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { success: true, updated, errors };
  } catch (error) {
    return {
      success: false,
      updated: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

/**
 * Get tier statistics for admin dashboard
 */
export async function getTierStatistics(supabase: any): Promise<{
  tierDistribution: Record<number, number>;
  totalCreators: number;
  averageEngagement: number;
}> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('creator_tier, engagement_value')
      .eq('user_type', 'creator')
      .not('creator_tier', 'is', null);

    if (error) throw error;

    const tierDistribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0
    };

    let totalEngagement = 0;
    let totalCreators = 0;

    for (const user of data || []) {
      const tier = user.creator_tier || 4;
      tierDistribution[tier]++;
      totalEngagement += user.engagement_value || 0;
      totalCreators++;
    }

    return {
      tierDistribution,
      totalCreators,
      averageEngagement: totalCreators > 0 ? Math.round(totalEngagement / totalCreators) : 0
    };
  } catch (error) {
    console.error('Error getting tier statistics:', error);
    return {
      tierDistribution: { 1: 0, 2: 0, 3: 0, 4: 0 },
      totalCreators: 0,
      averageEngagement: 0
    };
  }
}
