'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { DashboardPageHeader } from "@/components/navigation/dashboard-page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Search, X, Loader2, ArrowUpDown, Check, Calendar as CalendarIcon } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar"; 
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format, isAfter, isSameDay } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";

// --- Types ---
interface Business {
  display_name: string;
  instagram_handle?: string;
  profile_image_url?: string;
}

interface Collaboration {
  id: string;
  title: string;
  description: string;
  category: string;
  venue_type?: string;
  cuisine?: string;
  experience_type?: string;
  location: string;
  dates: string[] | null; 
  created_at: string;
  approval_status: string;
  business_id: string;
  business: Business;
  is_active: boolean;
  creator_tier: number | null;
  timeline_status?: 'starting_soon' | 'ongoing' | 'deadline_approaching' | 'past_deadline' | 'completed' | 'upcoming';
  cover_image_url?: string;
}

interface FilterOption {
  name: string;
  slug: string;
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

// Server-side data fetching with caching
const fetchCollaborations = async (page = 1, filters = {}) => {
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

    // Apply filters if any
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        query = query.eq(key, value);
      }
    });

    const { data, error, count } = await query;

    if (error) throw error;
    
    return {
      data: data || [],
      hasMore: to < (count || 0) - 1,
      error: null
    };
  } catch (error) {
    console.error('Error fetching collaborations:', error);
    return { data: [], hasMore: false, error };
  }
};

// This is the client component that uses useSearchParams
export default function DiscoverCollabsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(true);
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

  // ... rest of your component code remains the same
  // [Previous component code continues...]
  
  return (
    <div className="container mx-auto p-4 md:p-6 space-y-8 max-w-7xl">
      <DashboardPageHeader title="Discover" description="Find and apply for collaborations" showBackButton />
      
      {/* Your existing JSX */}
      {/* ... */}
    </div>
  );
}