'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, TrendingUp, Users, ArrowUpRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Ensure you have this UI component
import Link from 'next/link';

export default function CreatorsPage() {
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');
  const [searchQuery, setSearchQuery] = useState('');
  const supabase = createClient();

  useEffect(() => {
    fetchTopCreators();
  }, [timeRange]);

  const fetchTopCreators = async () => {
    try {
      setLoading(true);
      
      let dateFilter = new Date();
      if (timeRange === 'week') {
        dateFilter.setDate(dateFilter.getDate() - 7);
      } else if (timeRange === 'month') {
        dateFilter.setMonth(dateFilter.getMonth() - 1);
      }

      // First, get the count of completed collaborations per creator
      const { data: completedCollabs, error: collabsError } = await supabase
        .from('collaboration_applications')
        .select('creator_id, status')
        .eq('status', 'completed');

      if (collabsError) throw collabsError;

      // Count completed collaborations per creator
      const completedCounts = completedCollabs?.reduce((acc, curr) => {
        acc[curr.creator_id] = (acc[curr.creator_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Get all approved creators
      const { data: creatorsData, error: creatorsError } = await supabase
        .from('users')
        .select('*')
        .eq('user_type', 'creator')
        .eq('approval_status', 'approved');

      if (creatorsError) throw creatorsError;

      if (!creatorsData) {
        setCreators([]);
        return;
      }

      // Format and prepare for sorting
      let creatorsList = creatorsData.map((creator) => {
        const completedCollabCount = completedCounts[creator.id] || 0;
        return {
          id: creator.id,
          username: creator.instagram_handle || creator.email?.split('@')[0] || 'user',
          avatar_url: creator.profile_image_url,
          full_name: creator.display_name || 'Unnamed Creator',
          created_at: creator.created_at,
          collabCount: completedCollabCount,
          performance: 0, // Not used in sorting anymore
          avgEngagement: 0, // Not used in sorting anymore
        };
      });

      // Sort by completed collaborations count
      creatorsList.sort((a, b) => b.collabCount - a.collabCount);

      // Assign fixed Ranks based on sorted order
      const rankedCreators = creatorsList.map((creator, index) => ({
        ...creator,
        rank: index + 1
      }));

      setCreators(rankedCreators);
    } catch (error: any) {
      console.error('Error:', error.message);
      setCreators([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Search Filtering Logic ---
  const filteredCreators = useMemo(() => {
    return creators.filter((c) => 
      c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, creators]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🏆';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 75) return 'text-blue-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-7xl space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Creator Leaderboard</h1>
          <p className="text-sm text-slate-500 mt-1">Global rankings by collaborations and engagement.</p>
        </div>
        
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name or handle..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-md">
            {(['week', 'month', 'all'] as const).map((range) => (
              <Button 
                key={range}
                variant={timeRange === range ? 'secondary' : 'ghost'} 
                size="sm"
                onClick={() => setTimeRange(range)}
                className="capitalize h-8 text-xs px-3"
              >
                {range}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {filteredCreators.length === 0 ? (
        <div className="text-center py-20 bg-white border rounded-xl">
          <p className="text-slate-400">No creators found matching "{searchQuery}"</p>
          <Button variant="link" onClick={() => setSearchQuery('')}>Clear search</Button>
        </div>
      ) : (
        <>
          {/* Top 3 UI - Only show if not searching or if top 3 match search */}
          {!searchQuery && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCreators.slice(0, 3).map((creator, index) => (
                <Card key={creator.id} className="border-2 border-amber-100 bg-gradient-to-br from-amber-50/50 to-white shadow-sm overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
                          <AvatarImage src={creator.avatar_url || ''} />
                          <AvatarFallback>{creator.full_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-black">
                          {creator.rank}
                        </div>
                      </div>
                      <div className="max-w-[150px]">
                        <h3 className="font-bold text-slate-900 truncate">{creator.full_name}</h3>
                        <p className="text-xs text-slate-500 truncate">@{creator.username}</p>
                      </div>
                    </div>
                    <div className="text-2xl">{getRankBadge(creator.rank)}</div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-amber-100/50 my-2">
                      <div className="text-center">
                        <p className="text-[10px] text-slate-400 uppercase">Collabs</p>
                        <p className="font-bold text-sm">{creator.collabCount}</p>
                      </div>
                      <div className="text-center border-x border-amber-100/50">
                        <p className="text-[10px] text-slate-400 uppercase">Engage</p>
                        <p className="font-bold text-sm">{creator.avgEngagement}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-slate-400 uppercase">Score</p>
                        <p className={`font-bold text-sm ${getPerformanceColor(creator.performance)}`}>{creator.performance}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="w-full mt-2 hover:bg-amber-100/50 text-xs" asChild>
                      <Link href={`/admin/users/${creator.id}`}>View Detailed Profile <ArrowUpRight className="ml-1 h-3 w-3" /></Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* List View */}
          <div className="mt-6 bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="grid grid-cols-12 bg-slate-50/50 p-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest border-b">
              <div className="col-span-1">Rank</div>
              <div className="col-span-5 sm:col-span-4">Creator</div>
              <div className="hidden sm:block col-span-2 text-center">Collaborations</div>
              <div className="col-span-3 sm:col-span-2 text-center">Engagement</div>
              <div className="col-span-2 text-center">Performance</div>
              <div className="col-span-1"></div>
            </div>
            
            {(searchQuery ? filteredCreators : filteredCreators.slice(3)).map((creator) => (
              <div key={creator.id} className="grid grid-cols-12 items-center p-4 border-b last:border-0 hover:bg-slate-50/80 transition-all group">
                <div className="col-span-1 font-mono text-sm text-slate-400">
                  {creator.rank <= 3 ? getRankBadge(creator.rank) : `#${creator.rank}`}
                </div>
                <div className="col-span-5 sm:col-span-4 flex items-center gap-3">
                  <Avatar className="h-9 w-9 border group-hover:border-orange-200 transition-colors">
                    <AvatarImage src={creator.avatar_url} />
                    <AvatarFallback>{creator.full_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="truncate">
                    <p className="font-semibold text-sm text-slate-900 truncate">{creator.full_name}</p>
                    <p className="text-xs text-slate-500 truncate">@{creator.username}</p>
                  </div>
                </div>
                <div className="hidden sm:block col-span-2 text-center">
                  <Badge variant="outline" className="font-medium">
                    <Users className="h-3 w-3 mr-1 text-slate-400" />
                    {creator.collabCount}
                  </Badge>
                </div>
                <div className="col-span-3 sm:col-span-2 text-center">
                  <div className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    {creator.avgEngagement}%
                  </div>
                </div>
                <div className="col-span-2 text-center">
                  <span className={`text-sm font-bold ${getPerformanceColor(creator.performance)}`}>
                    {creator.performance}%
                  </span>
                </div>
                <div className="col-span-1 flex justify-end">
                  <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" asChild>
                    <Link href={`/admin/creators/${creator.id}`}>
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}