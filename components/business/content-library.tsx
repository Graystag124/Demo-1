// "use client";

// import { useState } from "react";
// import { Filter, Search } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { InstagramCard } from "./instagram-card";

// export function ContentLibrary({ data }: { data: any[] }) {
//   const [filterType, setFilterType] = useState("all");
//   const [searchQuery, setSearchQuery] = useState("");

//   // Filter Logic
//   const filteredData = data.filter(item => {
//     const matchesSearch = 
//       item.collaboration?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       item.creator?.display_name.toLowerCase().includes(searchQuery.toLowerCase());
    
//     const matchesType = filterType === "all" || item.type.toLowerCase().includes(filterType);

//     return matchesSearch && matchesType;
//   });

//   return (
//     <div className="space-y-8">
      
//       {/* Controls - Stacks cleanly on mobile */}
//       <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-card p-4 rounded-xl border shadow-sm">
//         <div className="relative w-full md:w-96">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//           <Input 
//             placeholder="Search by campaign or creator..." 
//             className="pl-9 bg-background/50"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//         </div>
//         <div className="flex items-center gap-2 w-full md:w-auto">
//           <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
//           <Select value={filterType} onValueChange={setFilterType}>
//             <SelectTrigger className="w-full md:w-[180px] bg-background/50">
//               <SelectValue placeholder="Filter by Type" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Content</SelectItem>
//               <SelectItem value="post">Posts</SelectItem>
//               <SelectItem value="reel">Reels</SelectItem>
//               <SelectItem value="story">Stories</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//       </div>

//       {/* Responsive Grid */}
//       {filteredData.length === 0 ? (
//         <div className="text-center py-32 border-2 border-dashed rounded-xl bg-muted/10">
//           <p className="text-muted-foreground font-medium">No approved content found.</p>
//           <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters.</p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
//           {filteredData.map((item) => (
//             <InstagramCard key={item.id} submission={item} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InstagramCard } from "./instagram-card";

export function ContentLibrary({ data }: { data: any[] }) {
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = data.filter(item => {
    const matchesSearch = 
      item.collaboration?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.creator?.display_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // DB types are usually 'reel', 'post', 'story'
    const itemType = item.type?.toLowerCase() || "";
    const matchesType = filterType === "all" || itemType === filterType.toLowerCase();

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search campaigns..." 
            className="pl-9 bg-background/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="All Content" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Content</SelectItem>
            <SelectItem value="post">Posts</SelectItem>
            <SelectItem value="reel">Reels</SelectItem>
            <SelectItem value="story">Stories</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredData.length === 0 ? (
        <div className="text-center py-32 border-2 border-dashed rounded-xl bg-muted/10">
          <p className="text-muted-foreground font-medium">No approved content found for this filter.</p>
          <p className="text-xs text-muted-foreground mt-1">Make sure submissions are approved and application status is 'completed'.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredData.map((item) => (
            <InstagramCard key={item.id} submission={item} />
          ))}
        </div>
      )}
    </div>
  );
}