'use client';

import { createClient } from '@/lib/supabase/client';

export interface SearchResult {
  id: string;
  type: 'creator' | 'campaign' | 'hashtag';
  title: string;
  subtitle: string;
  image?: string;
  stats?: {
    icon: string;
    value: string;
  }[];
  tags?: string[];
  href: string;
}

export async function searchDatabase(query: string): Promise<SearchResult[]> {
  const supabase = createClient();
  
  if (!query.trim()) {
    return [];
  }

  try {
    // Search creators
    const { data: creators, error: creatorError } = await supabase
      .from('users')
      .select('id, full_name, username, profile_image_url, followers_count, engagement_rate')
      .ilike('full_name', `%${query}%`)
      .or(`username.ilike.%${query}%`)
      .eq('user_type', 'creator')
      .limit(10);

    if (creatorError) throw creatorError;

    // Search campaigns
    const { data: campaigns, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, title, status, start_date, end_date, categories')
      .ilike('title', `%${query}%`)
      .limit(10);

    if (campaignError) throw campaignError;

    // Format creator results
    const creatorResults: SearchResult[] = (creators || []).map(creator => ({
      id: creator.id,
      type: 'creator',
      title: creator.full_name || 'Unnamed Creator',
      subtitle: `@${creator.username}`,
      image: creator.profile_image_url || undefined,
      stats: [
        { icon: 'users', value: creator.followers_count ? `${Math.floor(creator.followers_count / 1000)}K` : '0' },
        { icon: 'bar-chart', value: creator.engagement_rate ? `${creator.engagement_rate}%` : 'N/A' },
      ],
      href: `/business-dashboard/creators/${creator.id}`,
    }));

    // Format campaign results
    const campaignResults: SearchResult[] = (campaigns || []).map(campaign => ({
      id: campaign.id,
      type: 'campaign',
      title: campaign.title,
      subtitle: campaign.status === 'active' ? 'Active' : 'Inactive',
      tags: campaign.categories || [],
      href: `/business-dashboard/campaigns/${campaign.id}`,
    }));

    // Combine and return results
    return [...creatorResults, ...campaignResults];
  } catch (error) {
    console.error('Search error details:', error);
    if (error instanceof Error) {
      throw new Error(`Search failed: ${error.message}`);
    }
    throw new Error('An unknown error occurred during search');
  }
}
