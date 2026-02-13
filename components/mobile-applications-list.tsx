"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Instagram, MoreHorizontal, UserCircle, Users, FileText, ArrowLeft } from "lucide-react";
import { useState } from "react";

// Helper function for formatting counts
const formatCount = (val?: number) => 
  val ? new Intl.NumberFormat('en-US', { notation: "compact" }).format(val) : 'N/A';

// Client component for mobile interactions
export function MobileApplicationsList({ creators }: { creators: any[] }) {
  const [selectedCreator, setSelectedCreator] = useState<any | null>(null);

  if (selectedCreator) {
    return (
      <div className="md:hidden">
        {/* Back Button */}
        <div className="mb-4">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedCreator(null)}
            className="flex items-center gap-2 text-slate-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Network
          </Button>
        </div>

        {/* Full-Width Detail Card */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6 space-y-6">
            {/* Profile Header */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-slate-200">
                <AvatarImage src={selectedCreator.profile_image_url} />
                <AvatarFallback className="text-lg font-semibold">
                  {selectedCreator.display_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-slate-900 truncate">
                  {selectedCreator.display_name}
                </h2>
                <p className="text-sm text-slate-500 font-mono">
                  ID: {selectedCreator.id.slice(0, 8)}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-10 w-10 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/business-dashboard/creator/${selectedCreator.id}`} className="flex items-center">
                      <UserCircle className="mr-2 h-4 w-4" /> View Full Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    Remove from Network
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Social Stats Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Social Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4 text-center">
                  <Users className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                  <div className="text-lg font-bold text-slate-900">
                    {formatCount(selectedCreator.meta_insights?.[0]?.insights_data?.followers_count)}
                  </div>
                  <div className="text-xs text-slate-500">Followers</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 text-center">
                  <FileText className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                  <div className="text-lg font-bold text-slate-900">
                    {formatCount(selectedCreator.meta_insights?.[0]?.insights_data?.media_count)}
                  </div>
                  <div className="text-xs text-slate-500">Posts</div>
                </div>
              </div>
            </div>

            {/* Active Campaigns Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Active Campaigns</h3>
              <div className="flex flex-wrap gap-2">
                {selectedCreator.collaborations.map((c: any, i: number) => (
                  <Badge key={i} variant="secondary" className="text-xs px-3 py-1 bg-blue-50 text-blue-700 border-blue-100">
                    {c.title}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Contact & Info Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Contact & Info</h3>
              <div className="space-y-3">
                {selectedCreator.instagram_handle && (
                  <div className="flex items-center gap-3 text-slate-600">
                    <Instagram className="h-5 w-5" />
                    <span>@{selectedCreator.instagram_handle.replace('@', '')}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-slate-600">
                  <span className="text-sm font-medium">Email:</span>
                  <span className="text-sm truncate">{selectedCreator.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <span className="text-sm font-medium">Joined:</span>
                  <span className="text-sm">{new Date(selectedCreator.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t">
              <Button variant="outline" asChild className="h-12">
                <Link href={`/business-dashboard/creator/${selectedCreator.id}`}>
                  View Full Profile
                </Link>
              </Button>
              <Button className="h-12">
                Send Message
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="md:hidden">
      {/* 2-Column Grid of Creator Cards */}
      <div className="grid grid-cols-2 gap-4">
        {creators.map((creator: any) => (
          <Card 
            key={creator.id}
            className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white"
            onClick={() => setSelectedCreator(creator)}
          >
            <CardContent className="p-4 text-center space-y-3">
              {/* Avatar */}
              <div className="flex justify-center">
                <Avatar className="h-16 w-16 border-2 border-slate-200">
                  <AvatarImage src={creator.profile_image_url} />
                  <AvatarFallback className="text-lg font-semibold bg-slate-100 text-slate-700">
                    {creator.display_name?.[0]}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Creator Info */}
              <div className="space-y-1">
                <h3 className="font-semibold text-sm text-slate-900 truncate px-2">
                  {creator.display_name}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  ID: {creator.id.slice(0, 8)}
                </p>
              </div>

              {/* Quick Stats */}
              <div className="text-xs text-slate-600 space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{formatCount(creator.meta_insights?.[0]?.insights_data?.followers_count)}</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <FileText className="h-3 w-3" />
                  <span>{creator.collaborations.length} campaigns</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {creators.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <div className="text-lg font-medium mb-2">No creators in your network yet</div>
          <p className="text-sm">Approved creators will appear here</p>
        </div>
      )}
    </div>
  );
}
