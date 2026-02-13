'use client'

import { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { DashboardPageHeader } from "@/components/navigation/dashboard-page-header"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TierBadge } from "@/components/ui/tier-badge"
import { TierRing } from "@/components/ui/tier-ring"
import { TierRestrictionMessage } from "@/components/ui/tier-restriction-message"
import { MapPin, Search, X, Loader2, ArrowUpDown, Check, Calendar as CalendarIcon, Lock } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar" 
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { format, isAfter, isSameDay } from "date-fns"
import { useRouter, useSearchParams } from "next/navigation"
import { getTierByEngagement, canDiscoverTier, getAccessibleTiers } from "@/lib/creator-tiers"

// --- Types ---
interface Business {
  display_name: string
  instagram_handle?: string
  profile_image_url?: string
  engagement_value?: number
}

interface Collaboration {
  id: string
  title: string
  description: string
  category: string
  venue_type?: string
  cuisine?: string
  experience_type?: string
  location: string
  dates: string[] | null; 
  created_at: string
  approval_status: string
  business_id: string
  business: Business
  is_active: boolean
  creator_tier: number | null
  timeline_status?: 'starting_soon' | 'ongoing' | 'deadline_approaching' | 'past_deadline' | 'completed' | 'upcoming';
  cover_image_url?: string
}

interface User {
  id: string
  engagement_value: number
}

interface FilterOption {
  name: string
  slug: string
}

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'upcoming':
    case 'starting_soon': return 'bg-blue-50 text-blue-600 border-blue-100';
    case 'ongoing': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    case 'past_deadline': return 'bg-red-50 text-red-600 border-red-100';
    default: return 'bg-gray-50 text-gray-500 border-gray-100';
  }
};

const formatLabel = (str: string | undefined) => {
  if (!str) return "";
  return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

const formatMultiDates = (dateStrings: string[] | null) => {
  if (!dateStrings || dateStrings.length === 0) return "Dates TBD";
  const now = new Date();
  const sortedDates = dateStrings.map(d => new Date(d)).sort((a, b) => a.getTime() - b.getTime());
  const displayDate = sortedDates.find(d => isAfter(d, now) || isSameDay(d, now)) || sortedDates[0];
  if (sortedDates.length === 1) return format(displayDate, "MMM do");
  if (sortedDates.length <= 2) return sortedDates.map(d => format(d, "MMM do")).join(", ");
  return `${format(displayDate, "MMM do")} (+${sortedDates.length - 1} dates)`;
};

// Server-side data fetching with tier filtering
const fetchCollaborations = async (page = 1, filters = {}, userTierLevel?: number) => {
  const supabase = createClient();
  const itemsPerPage = 10;
  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  try {
    let query = supabase
      .from('collaborations')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(from, to);

    // Apply tier filtering if user tier is specified
    if (userTierLevel) {
      const accessibleTiers = getAccessibleTiers(userTierLevel);
      query = query.in('creator_tier', accessibleTiers);
    }

    // Apply other filters if any
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        query = query.eq(key, value);
      }
    });

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }
    
    // Fetch business data separately to avoid complex joins
    const collaborationsWithBusiness = await Promise.all(
      (data || []).map(async (collab) => {
        try {
          const { data: business } = await supabase
            .from('users')
            .select('display_name, instagram_handle, profile_image_url, engagement_value')
            .eq('id', collab.business_id)
            .single();
          
          return {
            ...collab,
            business: business || {
              display_name: 'Unknown Business',
              instagram_handle: '',
              profile_image_url: '',
              engagement_value: 0
            }
          };
        } catch (err) {
          console.warn('Failed to fetch business for collab:', collab.id, err);
          return {
            ...collab,
            business: {
              display_name: 'Unknown Business',
              instagram_handle: '',
              profile_image_url: '',
              engagement_value: 0
            }
          };
        }
      })
    );
    
    return {
      data: collaborationsWithBusiness,
      hasMore: to < (count || 0) - 1,
      error: null
    };
  } catch (error) {
    console.error('Error fetching collaborations:', error);
    return { data: [], hasMore: false, error };
  }
};

// Get current user data
const getCurrentUser = async () => {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.warn('User not authenticated:', authError);
      return null;
    }
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('engagement_value')
      .eq('id', user.id)
      .single();
      
    if (userError) {
      console.warn('Failed to fetch user data:', userError);
      return { ...user, engagement_value: 0 };
    }
    
    return userData ? { ...user, ...userData } : { ...user, engagement_value: 0 };
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
};

export default function DiscoverCollabsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userTier, setUserTier] = useState(getTierByEngagement(0));
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedVenue, setSelectedVenue] = useState("all");
  const [selectedCuisine, setSelectedCuisine] = useState("all");
  const [selectedExperience, setSelectedExperience] = useState("all");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [appliedFilters, setAppliedFilters] = useState<string[]>([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Load user data on mount
  useEffect(() => {
    const loadUser = async () => {
      const userData = await getCurrentUser();
      if (userData) {
        setUser(userData);
        const tier = getTierByEngagement(userData.engagement_value || 0);
        setUserTier(tier);
      }
      setInitialLoadComplete(true);
    };
    loadUser();
  }, []);

  // Load collaborations
  const loadCollaborations = useCallback(async (pageNum = 1, isLoadMore = false) => {
    if (!initialLoadComplete) return;
    
    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const filters = {
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        venue_type: selectedVenue !== "all" ? selectedVenue : undefined,
        cuisine: selectedCuisine !== "all" ? selectedCuisine : undefined,
        experience_type: selectedExperience !== "all" ? selectedExperience : undefined,
      };

      const result = await fetchCollaborations(pageNum, filters, userTier.level);

      if (result.error) {
        console.error('Fetch collaborations error:', result.error);
        toast.error("Failed to load collaborations. Please try again.");
      } else {
        if (isLoadMore) {
          setCollaborations(prev => [...prev, ...result.data]);
        } else {
          setCollaborations(result.data);
        }
        setHasMore(result.hasMore);
      }
    } catch (error) {
      console.error('Unexpected error in loadCollaborations:', error);
      toast.error("An unexpected error occurred. Please refresh the page.");
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }
  }, [selectedCategory, selectedVenue, selectedCuisine, selectedExperience, userTier.level, initialLoadComplete, isInitialLoad]);

  // Initial load
  useEffect(() => {
    if (initialLoadComplete) {
      loadCollaborations(1, false);
    }
  }, [loadCollaborations, initialLoadComplete]);

  // Filter collaborations based on search term
  const filteredCollaborations = useMemo(() => {
    if (!searchTerm.trim()) return collaborations;
    
    const lowercasedSearch = searchTerm.toLowerCase();
    return collaborations.filter(collab => {
      const title = collab.title || '';
      const description = collab.description || '';
      const location = collab.location || '';
      const businessName = collab.business?.display_name || '';
      
      return title.toLowerCase().includes(lowercasedSearch) ||
             description.toLowerCase().includes(lowercasedSearch) ||
             location.toLowerCase().includes(lowercasedSearch) ||
             businessName.toLowerCase().includes(lowercasedSearch);
    });
  }, [collaborations, searchTerm]);

  // Check if user can access a collaboration
  const canAccessCollaboration = (collab: Collaboration) => {
    if (!user) return false;
    if (!collab.creator_tier) return true; // No tier restriction
    
    return canDiscoverTier(userTier.level, collab.creator_tier);
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadCollaborations(nextPage, true);
    }
  };

  const handleUpgradeInfo = () => {
    toast.info("Increase your engagement to unlock higher-tier collaborations!");
  };

  if (!initialLoadComplete) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-8 max-w-7xl">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <DashboardPageHeader title="Discover" description="Find and apply for collaborations" showBackButton />
        
        {/* User Tier Info */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Your Tier:</span>
          <TierBadge engagementValue={user?.engagement_value || 0} size="sm" />
        </div>
      </div>

      {/* Tier Access Info */}
      <div className="bg-muted/30 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Tier-Based Access</span>
        </div>
        <p className="text-sm text-muted-foreground">
          As {userTier.name}, you can discover collaborations from {getAccessibleTiers(userTier.level).map(t => `Tier ${t}`).join(', ')}.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-semibold">Filters</h3>
            {isFiltered && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedVenue("all");
                  setSelectedCuisine("all");
                  setSelectedExperience("all");
                  setDate(undefined);
                  setSearchTerm("");
                  setIsFiltered(false);
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search collaborations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="food">Food & Beverage</SelectItem>
                  <SelectItem value="fashion">Fashion</SelectItem>
                  <SelectItem value="beauty">Beauty</SelectItem>
                  <SelectItem value="tech">Technology</SelectItem>
                  <SelectItem value="lifestyle">Lifestyle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Experience Type</label>
              <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="in-person">In-Person</SelectItem>
                  <SelectItem value="virtual">Virtual</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="deadline">Deadline Soon</SelectItem>
                  <SelectItem value="engagement">High Engagement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-6">
        {loading && collaborations.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCollaborations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No collaborations found matching your criteria.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCollaborations.map((collab) => {
                const canAccess = canAccessCollaboration(collab);
                
                return (
                  <Card key={collab.id} className={cn(
                    "hover:shadow-lg transition-shadow duration-200",
                    !canAccess && "opacity-75"
                  )}>
                    {collab.cover_image_url && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={collab.cover_image_url}
                          alt={collab.title}
                          className="w-full h-full object-cover"
                        />
                        {!canAccess && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Lock className="h-8 w-8 text-white" />
                          </div>
                        )}
                        {collab.timeline_status && (
                          <div className="absolute top-2 right-2">
                            <Badge className={getStatusBadgeVariant(collab.timeline_status)}>
                              {formatLabel(collab.timeline_status)}
                            </Badge>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg line-clamp-1">{collab.title || 'Untitled Collaboration'}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{collab.description || 'No description available'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <TierRing 
                            engagementValue={collab.business?.engagement_value || 0}
                            src={collab.business?.profile_image_url}
                            alt={collab.business?.display_name || 'Business'}
                            fallback={collab.business?.display_name?.[0] || "B"}
                            size="sm"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{collab.business?.display_name || 'Unknown Business'}</p>
                            <p className="text-xs text-muted-foreground">@{collab.business?.instagram_handle || 'unknown'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{collab.location || 'Location not specified'}</span>
                        </div>
                        
                        {collab.creator_tier && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Required Tier:</span>
                            <TierBadge 
                              engagementValue={
                                collab.creator_tier === 1 ? 10000 :
                                collab.creator_tier === 2 ? 2500 :
                                collab.creator_tier === 3 ? 1000 : 200
                              }
                              size="sm"
                            />
                          </div>
                        )}
                        
                        {canAccess ? (
                          <Link href={`/creator-dashboard/collabs/${collab.id}`}>
                            <Button className="w-full">
                              View Details
                            </Button>
                          </Link>
                        ) : (
                          <TierRestrictionMessage
                            userEngagementValue={user?.engagement_value || 0}
                            requiredTierLevel={collab.creator_tier || 4}
                            onUpgrade={handleUpgradeInfo}
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            {hasMore && (
              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
