// "use client";

// import { useState, useEffect, useMemo } from "react";
// import { Search, X, Users, Briefcase, Hash, MapPin, Calendar, Clock, CheckCircle, Clock3, ArrowLeft } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import { toast } from "sonner";
// import { createClient } from "@/lib/supabase/client";

// interface SearchResult {
//   id: string;
//   type: 'creator' | 'campaign' | 'hashtag' | 'collaboration' | 'venue';
//   title: string;
//   subtitle: string;
//   image?: string;
//   stats?: {
//     icon: string;
//     value: string;
//   }[];
//   tags?: string[];
//   href: string;
//   status?: 'upcoming' | 'ongoing' | 'past';
//   dates?: string[];
//   location?: string;
// }

// export default function SearchPage() {
//   const [query, setQuery] = useState("");
//   const [activeTab, setActiveTab] = useState("all");
//   const [collaborationFilter, setCollaborationFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'past'>('all');
//   const [isLoading, setIsLoading] = useState(false);
//   const [results, setResults] = useState<SearchResult[]>([]);
//   const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
//   // State for Venue View
//   const [selectedVenue, setSelectedVenue] = useState<string | null>(null);

//   const supabase = createClient();

//   useEffect(() => {
//     loadRecentSearches();
//   }, []);

//   const loadRecentSearches = () => {
//     const savedSearches = localStorage.getItem("businessSearchHistory");
//     if (savedSearches) setRecentSearches(JSON.parse(savedSearches));
//   };

//   const saveSearch = (searchTerm: string) => {
//     if (!searchTerm.trim()) return;
//     const updatedSearches = [searchTerm, ...recentSearches.filter((item) => item !== searchTerm)].slice(0, 5);
//     setRecentSearches(updatedSearches);
//     localStorage.setItem("businessSearchHistory", JSON.stringify(updatedSearches));
//   };

//   const handleSearch = async (e?: React.FormEvent) => {
//     e?.preventDefault();
//     if (!query.trim()) return;
    
//     setIsLoading(true);
//     setSelectedVenue(null); // Reset venue view on new search
//     saveSearch(query);
    
//     try {
//       // 1. Search Creators
//       const { data: creators } = await supabase
//         .from('users')
//         .select(`id, email, display_name, profile_image_url, bio, instagram_business_account_id, facebook_page_id`)
//         .or(`display_name.ilike.%${query}%,email.ilike.%${query}%`)
//         .eq('user_type', 'creator')
//         .eq('approval_status', 'approved')
//         .limit(10);

//       // 2. Search Collaborations
//       const { data: collaborations } = await supabase
//         .from('collaborations')
//         .select('*, business:business_id(id, display_name, profile_image_url)')
//         .or(`title.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%`)
//         .order('created_at', { ascending: false });

//       // Format Creator Results
//       const creatorResults: SearchResult[] = (creators || []).map(creator => ({
//         id: creator.id,
//         type: 'creator',
//         title: creator.display_name || creator.email.split('@')[0],
//         subtitle: creator.bio || 'Creator',
//         image: creator.profile_image_url || undefined,
//         stats: [{ icon: 'users', value: creator.instagram_business_account_id ? 'Connected' : 'Not connected' }],
//         href: `/business-dashboard/creator/${creator.id}`,
//       }));

//       // Format Collaboration & Venue Results
//       const now = new Date();
//       const collabs: SearchResult[] = [];
//       const venuesMap = new Map<string, number>();

//       (collaborations || []).forEach(collab => {
//         const startDate = collab.dates?.[0] ? new Date(collab.dates[0]) : null;
//         const endDate = collab.dates?.[collab.dates.length - 1] ? new Date(collab.dates[collab.dates.length - 1]) : null;
        
//         let status: 'upcoming' | 'ongoing' | 'past' = 'upcoming';
//         if (startDate && endDate) {
//           if (now > endDate) status = 'past';
//           else if (now >= startDate && now <= endDate) status = 'ongoing';
//         }

//         collabs.push({
//           id: collab.id,
//           type: 'collaboration',
//           title: collab.title,
//           subtitle: collab.description.substring(0, 100),
//           image: collab.business?.profile_image_url || undefined,
//           status,
//           dates: collab.dates,
//           location: collab.location,
//           tags: [collab.collaboration_type, collab.collaboration_mode],
//           href: `/business-dashboard/collabs/${collab.id}`,
//         });

//         // Track unique venues
//         if (collab.location) {
//           venuesMap.set(collab.location, (venuesMap.get(collab.location) || 0) + 1);
//         }
//       });

//       const venueResults: SearchResult[] = Array.from(venuesMap.entries()).map(([loc, count]) => ({
//         id: `venue-${loc}`,
//         type: 'venue',
//         title: loc,
//         subtitle: `${count} Collaboration${count > 1 ? 's' : ''} here`,
//         href: "#", // Handled by onClick
//         location: loc
//       }));

//       setResults([...creatorResults, ...collabs, ...venueResults]);
//     } catch (error: any) {
//       toast.error("Search failed");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const filteredByVenue = useMemo(() => {
//     if (!selectedVenue) return [];
//     return results.filter(r => r.type === 'collaboration' && r.location === selectedVenue);
//   }, [selectedVenue, results]);

//   const renderResultItem = (result: SearchResult) => {
//     const isVenue = result.type === 'venue';
    
//     const handleClick = (e: React.MouseEvent) => {
//       if (isVenue) {
//         e.preventDefault();
//         setSelectedVenue(result.location || null);
//         setActiveTab('collaborations');
//       }
//     };

//     return (
//       <a
//         key={`${result.type}-${result.id}`}
//         href={result.href}
//         onClick={handleClick}
//         className="block p-4 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
//       >
//         <div className="flex items-start gap-4">
//           <div className="flex-shrink-0">
//             {isVenue ? (
//               <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
//                 <MapPin className="h-6 w-6 text-orange-600" />
//               </div>
//             ) : (
//               <Avatar className="h-12 w-12">
//                 <AvatarImage src={result.image} />
//                 <AvatarFallback>{result.title.charAt(0)}</AvatarFallback>
//               </Avatar>
//             )}
//           </div>
          
//           <div className="flex-1 min-w-0">
//             <div className="flex items-center gap-2">
//               <h3 className="font-medium text-slate-900 dark:text-white truncate">{result.title}</h3>
//               <Badge variant="secondary" className="text-[10px] uppercase">
//                 {result.type === 'collaboration' ? result.status : result.type}
//               </Badge>
//             </div>
//             <p className="text-sm text-slate-500 truncate">{result.subtitle}</p>
            
//             {result.location && !isVenue && (
//               <div className="flex items-center text-xs text-slate-400 mt-1">
//                 <MapPin className="h-3 w-3 mr-1" /> {result.location}
//               </div>
//             )}
//           </div>
//         </div>
//       </a>
//     );
//   };

//   return (
//     <div className="container mx-auto p-4 md:p-6 max-w-5xl">
//       {/* Header & Search Input */}
//       {!selectedVenue && (
//         <>
//           <div className="mb-8">
//             <h1 className="text-2xl font-bold">Search</h1>
//             <p className="text-slate-500">Find creators, venues, and collaborations</p>
//           </div>
          
//           <form onSubmit={handleSearch} className="mb-8">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
//               <Input
//                 placeholder="Search by name, location, or keyword..."
//                 className="pl-10 h-12"
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//               />
//             </div>
//             <div className="mt-3 flex justify-end">
//               <Button type="submit" disabled={isLoading}>{isLoading ? "Searching..." : "Search"}</Button>
//             </div>
//           </form>
//         </>
//       )}

//       {/* Venue Detail View */}
//       {selectedVenue && (
//         <div className="space-y-6">
//           <Button variant="ghost" onClick={() => setSelectedVenue(null)} className="mb-4">
//             <ArrowLeft className="h-4 w-4 mr-2" /> Back to Search
//           </Button>
          
//           <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border">
//             <div className="flex items-center gap-4">
//               <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">
//                 <MapPin className="h-8 w-8 text-orange-600" />
//               </div>
//               <div>
//                 <h2 className="text-2xl font-bold">{selectedVenue}</h2>
//                 <p className="text-slate-500">All collaborations at this location</p>
//               </div>
//             </div>
//           </div>

//           <Tabs defaultValue="all">
//             <TabsList>
//               <TabsTrigger value="all">All</TabsTrigger>
//               <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
//               <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
//               <TabsTrigger value="past">Past</TabsTrigger>
//             </TabsList>
            
//             {['all', 'upcoming', 'ongoing', 'past'].map((tab) => (
//               <TabsContent key={tab} value={tab} className="space-y-4">
//                 {filteredByVenue
//                   .filter(collab => tab === 'all' || collab.status === tab)
//                   .map(renderResultItem)}
//                 {filteredByVenue.filter(collab => tab === 'all' || collab.status === tab).length === 0 && (
//                   <div className="text-center py-10 text-slate-500">No {tab} collaborations found here.</div>
//                 )}
//               </TabsContent>
//             ))}
//           </Tabs>
//         </div>
//       )}

//       {/* Main Search Results */}
//       {!selectedVenue && results.length > 0 && (
//         <Tabs value={activeTab} onValueChange={setActiveTab}>
//           <TabsList className="mb-6">
//             <TabsTrigger value="all">All</TabsTrigger>
//             <TabsTrigger value="creators"><Users className="h-4 w-4 mr-2"/>Creators</TabsTrigger>
//             <TabsTrigger value="collaborations"><Briefcase className="h-4 w-4 mr-2"/>Collabs</TabsTrigger>
//             <TabsTrigger value="venues"><MapPin className="h-4 w-4 mr-2"/>Venues</TabsTrigger>
//           </TabsList>

//           <TabsContent value="all" className="space-y-4">
//             {results.map(renderResultItem)}
//           </TabsContent>
          
//           <TabsContent value="creators" className="space-y-4">
//             {results.filter(r => r.type === 'creator').map(renderResultItem)}
//           </TabsContent>

//           <TabsContent value="collaborations" className="space-y-4">
//             <div className="flex gap-2 mb-4">
//               {['all', 'upcoming', 'ongoing', 'past'].map((f) => (
//                 <Button 
//                   key={f} 
//                   variant={collaborationFilter === f ? "default" : "outline"} 
//                   size="sm"
//                   onClick={() => setCollaborationFilter(f as any)}
//                 >
//                   {f.charAt(0).toUpperCase() + f.slice(1)}
//                 </Button>
//               ))}
//             </div>
//             {results
//               .filter(r => r.type === 'collaboration' && (collaborationFilter === 'all' || r.status === collaborationFilter))
//               .map(renderResultItem)}
//           </TabsContent>

//           <TabsContent value="venues" className="space-y-4">
//             {results.filter(r => r.type === 'venue').map(renderResultItem)}
//           </TabsContent>
//         </Tabs>
//       )}

//       {/* Empty State / Recent Searches */}
//       {!selectedVenue && results.length === 0 && !isLoading && (
//         <div className="text-center py-20 border rounded-xl bg-slate-50/50">
//           <Search className="mx-auto h-12 w-12 text-slate-300 mb-4" />
//           <h3 className="text-lg font-medium">Start Searching</h3>
//           <p className="text-slate-500 mb-6">Search for creators by name or venues by location</p>
          
//           {recentSearches.length > 0 && (
//             <div className="max-w-xs mx-auto flex flex-wrap gap-2 justify-center">
//               {recentSearches.map((s) => (
//                 <Badge 
//                   key={s} 
//                   variant="secondary" 
//                   className="cursor-pointer hover:bg-slate-200"
//                   onClick={() => { setQuery(s); handleSearch(); }}
//                 >
//                   {s}
//                 </Badge>
//               ))}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, X, Users, Briefcase, MapPin, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

const STORAGE_KEY = "business_portal_search_history_v1";

interface SearchResult {
  id: string;
  type: 'creator' | 'campaign' | 'hashtag' | 'collaboration' | 'venue';
  title: string;
  subtitle: string;
  image?: string;
  stats?: {
    icon: string;
    value: string;
  }[];
  tags?: string[];
  href: string;
  status?: 'upcoming' | 'ongoing' | 'past';
  dates?: string[];
  location?: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [collaborationFilter, setCollaborationFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'past'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = () => {
    const savedSearches = localStorage.getItem(STORAGE_KEY);
    if (savedSearches) setRecentSearches(JSON.parse(savedSearches));
  };

  const saveSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    const updatedSearches = [searchTerm, ...recentSearches.filter((item) => item !== searchTerm)].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSearches));
  };

  const clearAllSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const removeSearch = (searchToRemove: string) => {
    const updatedSearches = recentSearches.filter((item) => item !== searchToRemove);
    setRecentSearches(updatedSearches);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSearches));
  };

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    
    setIsLoading(true);
    setSelectedVenue(null); 
    saveSearch(query);
    
    try {
      const [creatorsRes, collaborationsRes] = await Promise.all([
        supabase
          .from('users')
          .select(`id, email, display_name, profile_image_url, bio, instagram_business_account_id, facebook_page_id`)
          .or(`display_name.ilike.%${query}%,email.ilike.%${query}%`)
          .eq('user_type', 'creator')
          .eq('approval_status', 'approved')
          .limit(10),
        supabase
          .from('collaborations')
          .select('*, business:business_id(id, display_name, profile_image_url)')
          .or(`title.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%`)
          .order('created_at', { ascending: false })
      ]);

      const creators = creatorsRes.data;
      const collaborations = collaborationsRes.data;

      const creatorResults: SearchResult[] = (creators || []).map(creator => ({
        id: creator.id,
        type: 'creator',
        title: creator.display_name || creator.email.split('@')[0],
        subtitle: creator.bio || 'Creator',
        image: creator.profile_image_url || undefined,
        stats: [{ icon: 'users', value: creator.instagram_business_account_id ? 'Connected' : 'Not connected' }],
        href: `/business-dashboard/creator/${creator.id}`,
      }));

      const now = new Date();
      const collabs: SearchResult[] = [];
      const venuesMap = new Map<string, number>();

      (collaborations || []).forEach(collab => {
        const startDate = collab.dates?.[0] ? new Date(collab.dates[0]) : null;
        const endDate = collab.dates?.[collab.dates.length - 1] ? new Date(collab.dates[collab.dates.length - 1]) : null;
        
        let status: 'upcoming' | 'ongoing' | 'past' = 'upcoming';
        if (startDate && endDate) {
          if (now > endDate) status = 'past';
          else if (now >= startDate && now <= endDate) status = 'ongoing';
        }

        collabs.push({
          id: collab.id,
          type: 'collaboration',
          title: collab.title,
          subtitle: collab.description.substring(0, 100),
          image: collab.business?.profile_image_url || undefined,
          status,
          dates: collab.dates,
          location: collab.location,
          tags: [collab.collaboration_type, collab.collaboration_mode],
          href: `/business-dashboard/collabs/${collab.id}`,
        });

        if (collab.location) {
          venuesMap.set(collab.location, (venuesMap.get(collab.location) || 0) + 1);
        }
      });

      const venueResults: SearchResult[] = Array.from(venuesMap.entries()).map(([loc, count]) => ({
        id: `venue-${loc}`,
        type: 'venue',
        title: loc,
        subtitle: `${count} Collaboration${count > 1 ? 's' : ''} here`,
        href: "#", 
        location: loc
      }));

      setResults([...creatorResults, ...collabs, ...venueResults]);
    } catch (error: any) {
      toast.error("Search failed");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredByVenue = useMemo(() => {
    if (!selectedVenue) return [];
    return results.filter(r => r.type === 'collaboration' && r.location === selectedVenue);
  }, [selectedVenue, results]);

  const renderResultItem = (result: SearchResult) => {
    const isVenue = result.type === 'venue';
    const handleClick = (e: React.MouseEvent) => {
      if (isVenue) {
        e.preventDefault();
        setSelectedVenue(result.location || null);
        setActiveTab('collaborations');
      }
    };

    return (
      <a
        key={`${result.type}-${result.id}`}
        href={result.href}
        onClick={handleClick}
        className="block p-4 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {isVenue ? (
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
              </div>
            ) : (
              <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                <AvatarImage src={result.image} />
                <AvatarFallback>{result.title.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h3 className="font-semibold text-slate-900 dark:text-white break-all leading-tight text-sm sm:text-base">
                {result.title}
              </h3>
              <Badge variant="secondary" className="text-[9px] uppercase h-3.5 px-1 shrink-0">
                {result.type === 'collaboration' ? result.status : result.type}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 break-all mt-1 leading-relaxed line-clamp-2">
                {result.subtitle}
            </p>
            {result.location && !isVenue && (
              <div className="flex items-start text-[10px] text-slate-400 mt-1.5 leading-normal">
                <MapPin className="h-2.5 w-2.5 mr-1 mt-0.5 shrink-0" /> 
                <span className="break-all">{result.location}</span>
              </div>
            )}
          </div>
        </div>
      </a>
    );
  };

  const triggerClass = "flex-1 inline-flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-[11px] sm:text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-500 hover:text-slate-700 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white whitespace-nowrap";

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-2xl">
      {!selectedVenue && (
        <>
          <div className="mb-6 px-1">
            <h1 className="text-xl font-bold tracking-tight">Search</h1>
            <p className="text-slate-500 text-xs">Find creators, venues, and collaborations</p>
          </div>
          
          <form onSubmit={handleSearch} className="mb-10 px-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search..."
                className="pl-9 h-11 text-sm ring-offset-background focus-visible:ring-1 focus-visible:ring-ring"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="mt-3 flex justify-end">
              <Button type="submit" disabled={isLoading} className="bg-[#00FF85] hover:bg-[#00E677] text-slate-900 font-bold px-6 h-9 rounded-lg text-sm">
                {isLoading ? "Searching..." : "Search"}
              </Button>
            </div>
          </form>
        </>
      )}

      {selectedVenue && (
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => setSelectedVenue(null)} className="mb-2 p-0 h-auto hover:bg-transparent text-slate-500 font-normal text-xs">
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Search
          </Button>
          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
              <MapPin className="h-6 w-6 text-orange-600" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold break-all leading-tight">{selectedVenue}</h2>
              <p className="text-slate-500 text-xs">Collaborations at this location</p>
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="flex h-10 items-center justify-start rounded-xl bg-slate-100/80 p-1 dark:bg-slate-800/50 mb-6 w-full gap-1">
              <TabsTrigger value="all" className={triggerClass}>All</TabsTrigger>
              <TabsTrigger value="upcoming" className={triggerClass}>Upcoming</TabsTrigger>
              <TabsTrigger value="ongoing" className={triggerClass}>Ongoing</TabsTrigger>
              <TabsTrigger value="past" className={triggerClass}>Past</TabsTrigger>
            </TabsList>
            {['all', 'upcoming', 'ongoing', 'past'].map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-2 mt-0">
                {filteredByVenue.filter(c => tab === 'all' || c.status === tab).map(renderResultItem)}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}

      {!selectedVenue && results.length > 0 && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex h-10 items-center justify-start rounded-xl bg-slate-100/80 p-1 dark:bg-slate-800/50 mb-8 w-full gap-1">
            <TabsTrigger value="all" className={triggerClass}>All</TabsTrigger>
            <TabsTrigger value="creators" className={triggerClass}><Users className="h-3 w-3" /> Creators</TabsTrigger>
            <TabsTrigger value="collaborations" className={triggerClass}><Briefcase className="h-3 w-3" /> Collabs</TabsTrigger>
            <TabsTrigger value="venues" className={triggerClass}><MapPin className="h-3 w-3" /> Venues</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-1 mt-0">{results.map(renderResultItem)}</TabsContent>
          <TabsContent value="creators" className="space-y-1 mt-0">{results.filter(r => r.type === 'creator').map(renderResultItem)}</TabsContent>
          <TabsContent value="collaborations" className="space-y-1 mt-0">
            <div className="flex flex-wrap gap-1.5 mb-4 px-1">
              {['all', 'upcoming', 'ongoing', 'past'].map((f) => (
                <Button 
                  key={f} 
                  variant={collaborationFilter === f ? "default" : "outline"} 
                  size="sm"
                  className="rounded-full text-[9px] h-6 px-3 uppercase font-bold"
                  onClick={() => setCollaborationFilter(f as any)}
                >
                  {f}
                </Button>
              ))}
            </div>
            {results.filter(r => r.type === 'collaboration' && (collaborationFilter === 'all' || r.status === collaborationFilter)).map(renderResultItem)}
          </TabsContent>
          <TabsContent value="venues" className="space-y-1 mt-0">{results.filter(r => r.type === 'venue').map(renderResultItem)}</TabsContent>
        </Tabs>
      )}

      {!selectedVenue && results.length === 0 && !isLoading && (
        <div className="text-center py-12 px-4 border border-dashed rounded-xl bg-slate-50/50">
          <h3 className="text-slate-400 uppercase tracking-widest text-[10px] font-bold mb-4">Recent Searches</h3>
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {recentSearches.map((s) => (
              <div key={s} className="relative group">
                 <Badge 
                    variant="secondary" 
                    className="cursor-pointer px-3 py-1.5 pr-7 rounded-full border-none hover:bg-slate-200 transition-colors text-[11px]"
                    onClick={() => { setQuery(s); handleSearch(); }}
                  >
                    {s}
                  </Badge>
                  <button 
                    onClick={() => removeSearch(s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
              </div>
            ))}
          </div>
          {recentSearches.length > 0 && (
            <Button variant="link" size="sm" onClick={clearAllSearches} className="text-slate-400 font-normal hover:text-slate-600 no-underline text-xs">Clear all searches</Button>
          )}
        </div>
      )}
    </div>
  );
}