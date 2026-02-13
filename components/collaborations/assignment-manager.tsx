// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { createClient } from "@/lib/supabase/client";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Badge } from "@/components/ui/badge";

// // Use server-side OG preview endpoint to avoid CORS issues

// type Application = {
//   id: string;
//   creator_id: string;
//   creator?: {
//     id: string;
//     display_name: string | null;
//     instagram_handle: string | null;
//     profile_image_url: string | null;
//   } | null;
// };

// type AssignmentRow = {
//   id?: string;
//   collaboration_id: string;
//   creator_id: string;
//   posts_required: number;
//   stories_required: number;
//   reels_required: number;
//   notes?: string | null;
//   status: "assigned" | "in_progress" | "completed" | "paused";
// };

// type SubmissionRow = {
//   id: string;
//   collaboration_id: string;
//   creator_id: string;
//   type: "post" | "story" | "reel";
//   url: string;
//   caption: string | null;
//   status: "submitted" | "approved" | "rejected";
//   submitted_at: string;
// };

// export function AssignmentManager({
//   collaborationId,
//   applications,
// }: {
//   collaborationId: string;
//   applications: Application[];
// }) {
//   const supabase = createClient();
//   const [assignments, setAssignments] = useState<Record<string, AssignmentRow>>({});
//   const [submissions, setSubmissions] = useState<Record<string, SubmissionRow[]>>({});
//   const [previews, setPreviews] = useState<Record<string, { title?: string; description?: string; image?: string } | null>>({});
//   const creatorIds = useMemo(() => Array.from(new Set(applications.map(a => a.creator_id))), [applications]);

//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       if (!creatorIds.length) return;
//       const { data: asg } = await supabase
//         .from("collaboration_assignments")
//         .select("*")
//         .eq("collaboration_id", collaborationId)
//         .in("creator_id", creatorIds);

//       if (mounted && asg) {
//         const map: Record<string, AssignmentRow> = {};
//         asg.forEach((r: any) => { map[r.creator_id] = r; });
//         setAssignments(map);
//       }

//       const { data: subs } = await supabase
//         .from("collaboration_submissions")
//         .select("*")
//         .eq("collaboration_id", collaborationId)
//         .in("creator_id", creatorIds)
//         .order("submitted_at", { ascending: false });

//       if (mounted && subs) {
//         const map: Record<string, SubmissionRow[]> = {};
//         subs.forEach((r: any) => {
//           map[r.creator_id] = map[r.creator_id] || [];
//           map[r.creator_id].push(r);
//         });
//         setSubmissions(map);

//         // Fetch previews for each submission via our server-side API to avoid CORS
//         (async () => {
//           try {
//             const allSubs = subs as SubmissionRow[];
//             for (const s of allSubs) {
//               // Skip if we already fetched a preview for this submission
//               let already = false;
//               setPreviews(prev => {
//                 if (prev[s.id] !== undefined) { already = true; return prev; }
//                 return { ...prev, [s.id]: null };
//               });
//               if (already) continue;

//               try {
//                 const resp = await fetch(`/api/og-preview?url=${encodeURIComponent(s.url)}`);
//                 if (resp.ok) {
//                   const data = await resp.json();
//                   setPreviews(prev => ({ ...prev, [s.id]: data }));
//                 } else {
//                   setPreviews(prev => ({ ...prev, [s.id]: null }));
//                 }
//               } catch (err) {
//                 console.error('Error fetching preview for', s.url, err);
//                 setPreviews(prev => ({ ...prev, [s.id]: null }));
//               }
//             }
//           } catch (err) {
//             console.error('Error fetching previews', err);
//           }
//         })();
//       }
//     })();
//     return () => { mounted = false; };
//   }, [collaborationId, JSON.stringify(creatorIds)]); // eslint-disable-line react-hooks/exhaustive-deps

//   const saveAssignment = async (creatorId: string) => {
//     const row = assignments[creatorId] || {
//       collaboration_id: collaborationId,
//       creator_id: creatorId,
//       posts_required: 0,
//       stories_required: 0,
//       reels_required: 0,
//       status: "assigned" as const,
//     };
//     const { error } = await supabase
//       .from("collaboration_assignments")
//       .upsert(row, { onConflict: "collaboration_id,creator_id" });
//     if (error) {
//       alert("Failed to save assignment");
//     } else {
//       alert("Assignment saved");
//     }
//   };

//   const updateAssignmentField = (creatorId: string, patch: Partial<AssignmentRow>) => {
//     setAssignments(prev => {
//       const current = prev[creatorId] || {
//         collaboration_id: collaborationId,
//         creator_id: creatorId,
//         posts_required: 0,
//         stories_required: 0,
//         reels_required: 0,
//         status: "assigned" as const,
//       };
//       return { ...prev, [creatorId]: { ...current, ...patch } };
//     });
//   };

//   const moderateSubmission = async (submissionId: string, newStatus: "approved" | "rejected") => {
//     const { error } = await supabase
//       .from("collaboration_submissions")
//       .update({ status: newStatus })
//       .eq("id", submissionId);
//     if (error) {
//       alert("Failed to update submission");
//       return;
//     }
//     // refresh local
//     setSubmissions(prev => {
//       const next = { ...prev };
//       for (const key of Object.keys(next)) {
//         next[key] = next[key].map(s => s.id === submissionId ? { ...s, status: newStatus } as SubmissionRow : s);
//       }
//       return next;
//     });
//   };

//   return (
//     <div className="space-y-4">
//       {applications.map(app => {
//         const c = app.creator;
//         const asg = assignments[app.creator_id];
//         return (
//           <Card key={app.id}>
//             <CardContent className="pt-4 space-y-3">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <div className="h-8 w-8 rounded-full overflow-hidden bg-muted">
//                     {c?.profile_image_url ? (
//                       // eslint-disable-next-line @next/next/no-img-element
//                       <img src={c.profile_image_url} alt="" className="h-full w-full object-cover" />
//                     ) : null}
//                   </div>
//                   <div className="text-sm font-medium">
//                     {c?.instagram_handle ? `@${c.instagram_handle.replace(/^@+/, "")}` : (c?.display_name || "Creator")}
//                   </div>
//                 </div>
//                 <Badge variant="outline">{asg?.status || "assigned"}</Badge>
//               </div>

//               <div className="grid grid-cols-3 gap-3">
//                 <div>
//                   <label className="text-xs text-muted-foreground">Posts</label>
//                   <Input type="number" min={0}
//                     value={asg?.posts_required ?? 0}
//                     onChange={(e) => updateAssignmentField(app.creator_id, { posts_required: parseInt(e.target.value || "0", 10) })}
//                   />
//                 </div>
//                 <div>
//                   <label className="text-xs text-muted-foreground">Stories</label>
//                   <Input type="number" min={0}
//                     value={asg?.stories_required ?? 0}
//                     onChange={(e) => updateAssignmentField(app.creator_id, { stories_required: parseInt(e.target.value || "0", 10) })}
//                   />
//                 </div>
//                 <div>
//                   <label className="text-xs text-muted-foreground">Reels</label>
//                   <Input type="number" min={0}
//                     value={asg?.reels_required ?? 0}
//                     onChange={(e) => updateAssignmentField(app.creator_id, { reels_required: parseInt(e.target.value || "0", 10) })}
//                   />
//                 </div>
//               </div>

//               <div className="flex items-center gap-3">
//                 <div className="w-40">
//                   <label className="text-xs text-muted-foreground">Status</label>
//                   <Select
//                     value={asg?.status || "assigned"}
//                     onValueChange={(v: any) => updateAssignmentField(app.creator_id, { status: v })}
//                   >
//                     <SelectTrigger><SelectValue /></SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="assigned">Assigned</SelectItem>
//                       <SelectItem value="in_progress">In Progress</SelectItem>
//                       <SelectItem value="completed">Completed</SelectItem>
//                       <SelectItem value="paused">Paused</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="flex-1">
//                   <label className="text-xs text-muted-foreground">Notes</label>
//                   <Input
//                     value={asg?.notes || ""}
//                     onChange={(e) => updateAssignmentField(app.creator_id, { notes: e.target.value })}
//                     placeholder="Guidelines, deliverable details..."
//                   />
//                 </div>
//                 <Button onClick={() => saveAssignment(app.creator_id)}>Save</Button>
//               </div>

//               <div className="space-y-2">
//                 <div className="text-sm font-semibold">Submissions</div>
//                 <div className="space-y-2">
//                   {(submissions[app.creator_id] || []).map((s) => {
//                     const previewData = previews[s.id];

//                     return (
//                       <div key={s.id} className="flex items-center justify-between text-sm">
//                         <div className="truncate">
//                           <Badge variant="secondary" className="mr-2 capitalize">{s.type}</Badge>
//                           {previewData ? (
//                             <div className="flex flex-col">
//                               <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
//                                 {previewData.image ? (
//                                   <img src={previewData.image} alt="Preview" className="max-w-xs max-h-40 object-cover mb-1" />
//                                 ) : null}
//                                 <div className="font-medium">{previewData.title || s.url}</div>
//                                 {previewData.description ? (
//                                   <div className="text-muted-foreground">{previewData.description}</div>
//                                 ) : null}
//                               </a>
//                               {s.caption ? <span className="text-muted-foreground ml-2">— {s.caption}</span> : null}
//                             </div>
//                           ) : (
//                             <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
//                               {s.url}
//                             </a>
//                           )}
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <Badge variant="outline" className="capitalize">{s.status}</Badge>
//                           <Button size="sm" variant="outline" onClick={() => moderateSubmission(s.id, "approved")}>Approve</Button>
//                           <Button size="sm" variant="outline" onClick={() => moderateSubmission(s.id, "rejected")}>Reject</Button>
//                         </div>
//                       </div>
//                     );
//                   })}
//                   {(!submissions[app.creator_id] || submissions[app.creator_id].length === 0) && (
//                     <div className="text-xs text-muted-foreground">No submissions yet.</div>
//                   )}
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         );
//       })}
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { updateAssignmentAction, moderateSubmissionAction } from "@/app/actions/assignment-actions";
import { toast } from "sonner";
import { usePathname } from "next/navigation";

export function AssignmentManager({
  collaborationId,
  creatorId,
  initialAssignment,
  submissions
}: {
  collaborationId: string;
  creatorId: string;
  initialAssignment: any;
  submissions: any[];
}) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  
  const [posts, setPosts] = useState(initialAssignment?.posts_required ?? 0);
  const [stories, setStories] = useState(initialAssignment?.stories_required ?? 0);
  const [reels, setReels] = useState(initialAssignment?.reels_required ?? 0);
  const [notes, setNotes] = useState(initialAssignment?.notes ?? "");
  const [status, setStatus] = useState(initialAssignment?.status || "assigned");

  const handleSaveAssignment = async () => {
    setLoading(true);
    console.log("Saving assignment...", { collaborationId, creatorId, posts, notes });

    try {
      const result = await updateAssignmentAction({
        collaborationId,
        creatorId,
        postsRequired: Number(posts),
        storiesRequired: Number(stories),
        reelsRequired: Number(reels),
        notes: notes || "",
        status: status,
      });

      if (result.success) {
        toast.success("Assignment saved successfully");
      } else {
        console.error("Action error:", result.error);
        toast.error("Failed to save: " + result.error);
      }
    } catch (e: any) {
      console.error("Client error:", e);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (id: string, newStatus: "approved" | "rejected") => {
    try {
      await moderateSubmissionAction(id, newStatus, pathname);
      toast.success(`Submission ${newStatus}`);
    } catch (e) {
      toast.error("Failed to update submission");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="p-0 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Posts</label>
              <Input type="number" min={0} value={posts} onChange={(e) => setPosts(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Stories</label>
              <Input type="number" min={0} value={stories} onChange={(e) => setStories(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Reels</label>
              <Input type="number" min={0} value={reels} onChange={(e) => setReels(e.target.value)} />
            </div>
          </div>

          <div className="flex items-end gap-3">
            <div className="w-1/3">
              <label className="text-xs text-muted-foreground mb-1 block">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
              <Input value={notes} placeholder="Guidelines..." onChange={(e) => setNotes(e.target.value)} />
            </div>
            <Button onClick={handleSaveAssignment} disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 text-white">
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>

          <div className="pt-4 space-y-3">
            <h4 className="text-sm font-bold">Submissions</h4>
            {submissions.length === 0 ? (
              <p className="text-xs text-muted-foreground">No submissions yet.</p>
            ) : (
              submissions.map((s) => (
                <div key={s.id} className="flex items-center justify-between bg-muted/20 p-3 rounded-lg border">
                  <div className="flex flex-col mr-3 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] uppercase shrink-0">{s.type}</Badge>
                      <span className="text-xs font-medium truncate">{s.url}</span>
                    </div>
                    {s.status !== 'submitted' && (
                       <span className="text-[10px] text-muted-foreground capitalize mt-1">Status: {s.status}</span>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleModerate(s.id, "approved")}>Approve</Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs text-destructive" onClick={() => handleModerate(s.id, "rejected")}>Reject</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}