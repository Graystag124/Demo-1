"use client";

import { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isSameDay, parseISO, isAfter, startOfDay } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";

// --- Fixed Interfaces ---
interface Collaboration {
  id: string;
  title: string;
  description: string;
  dates: string[];
  budget_range: string;
  total_budget_spent?: number;
  approval_status: string;
  created_at: string;
  hasApplied?: boolean;
  applicationStatus?: string | null;
  business?: {
    display_name: string;
  };
}

interface CalendarViewProps {
  collaborations: Collaboration[];
  userType: "business" | "creator";
}

export function CalendarView({ collaborations, userType }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // --- Logic to categorize dates (Memoized for performance) ---
  const { appliedAll, appliedSome, appliedNone } = useMemo(() => {
    // Get unique list of all dates mentioned in collaborations
    const allDatesStrings = Array.from(new Set(collaborations.flatMap((c) => c.dates || [])));
    
    const statusGroups: {
      appliedAll: Date[];
      appliedSome: Date[];
      appliedNone: Date[];
    } = {
      appliedAll: [],
      appliedSome: [],
      appliedNone: [],
    };

    allDatesStrings.forEach((dateStr) => {
      const dateObj = parseISO(dateStr);
      const collabsOnDate = collaborations.filter((c) =>
        c.dates?.some((d) => isSameDay(parseISO(d), dateObj))
      );

      const totalOnDate = collabsOnDate.length;
      const appliedOnDate = collabsOnDate.filter((c) => c.hasApplied).length;

      if (totalOnDate > 0) {
        if (appliedOnDate === totalOnDate) {
          statusGroups.appliedAll.push(dateObj);
        } else if (appliedOnDate > 0) {
          statusGroups.appliedSome.push(dateObj);
        } else {
          statusGroups.appliedNone.push(dateObj);
        }
      }
    });

    return statusGroups;
  }, [collaborations]);

  const getCollabLink = (id: string) => {
    return userType === "creator"
      ? `/creator-dashboard/collaborations/${id}`
      : `/business-dashboard/collabs/${id}`;
  };

  const pendingCollabs = collaborations
    .filter((c) => c.approval_status === 'pending' || c.approval_status === 'pending_approval')
    .sort((a, b) => {
      const earliestA = Math.min(...(a.dates?.map(d => parseISO(d).getTime()) || [0]));
      const earliestB = Math.min(...(b.dates?.map(d => parseISO(d).getTime()) || [0]));
      return earliestA - earliestB;
    });

  const approvedCollabs = collaborations
    .filter((c) => c.approval_status === 'approved' || c.approval_status === 'accepted')
    .sort((a, b) => {
      const earliestA = Math.min(...(a.dates?.map(d => parseISO(d).getTime()) || [0]));
      const earliestB = Math.min(...(b.dates?.map(d => parseISO(d).getTime()) || [0]));
      return earliestA - earliestB;
    })
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start w-full">
      {/* --- Left Column (Calendar) --- */}
      <Card className="w-full shadow-sm flex flex-col">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Select Date</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center flex-1">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={{
              appliedAll: appliedAll,
              appliedSome: appliedSome,
              appliedNone: appliedNone,
            }}
            modifiersClassNames={{
              appliedAll: "",
              appliedSome: "",
              appliedNone: "",
            }}
            className="rounded-md border p-3 w-fit"
            classNames={{
              day: cn("h-9 w-9 p-0 font-normal flex items-center justify-center m-0.5 transition-colors"),
              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            }}
          />
        </CardContent>
      </Card>

      {/* --- Right Column (Details) --- */}
      <div className="space-y-6">
        <Card className="shadow-sm min-h-[300px]">
          <CardHeader className="border-b bg-muted/5">
            <CardTitle className="text-xl">
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {pendingCollabs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center opacity-60">
                <p className="text-muted-foreground">No pending approvals at the moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingCollabs.map((collab) => (
                  <div key={collab.id} className="group rounded-xl border p-4 hover:border-primary/50 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="font-bold text-lg leading-none">
                          <Link href={getCollabLink(collab.id)} className="hover:text-primary transition-colors">
                            {collab.title}
                          </Link>
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {userType === 'creator' && collab.business 
                            ? `with ${collab.business.display_name}` 
                            : 'Collaboration Transaction Total'}
                        </p>
                        {collab.dates && collab.dates.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Scheduled: {format(parseISO(collab.dates[0]), "MMM d, yyyy")}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-[10px] capitalize border-orange-500 text-orange-600">
                        Pending
                      </Badge>
                    </div>
                    
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{collab.description}</p>
                    
                    <div className="mt-4 flex justify-end pt-3 border-t">
                      <Link 
                        href={getCollabLink(collab.id)}
                        className="bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Review Application →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* --- Approved Collaborations List --- */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Approved Collaborations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {approvedCollabs.length > 0 ? (
                approvedCollabs.map((collab) => (
                  <div key={collab.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col gap-1">
                      <Link href={getCollabLink(collab.id)} className="font-semibold text-sm hover:underline">
                        {collab.title}
                      </Link>
                      <span className="text-[10px] text-muted-foreground">
                        {collab.dates?.length || 0} scheduled dates
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[10px] capitalize border-green-500 text-green-600">
                      Approved
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No approved collaborations found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}