"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EditCollaborationDialog } from "@/components/admin/edit-collaboration-dialog";

// ... (Interface definitions remain the same)
interface Collaboration {
  id: string;
  title: string;
  description: string;
  requirements: string;
  compensation: string;
  category: string;
  approval_status: string;
  created_at: string;
  deadline: string;
  business_id: string;
  users: {
    display_name: string;
    email: string;
  };
}

export function CollaborationApprovalList() {
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [approvalNotes, setApprovalNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCollaborations();
  }, []);

  async function fetchCollaborations() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("collaborations")
      .select(`
        *,
        users:business_id (
          display_name,
          email
        )
      `)
      .eq("approval_status", "pending")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setCollaborations(data as any);
    }
    setIsLoading(false);
  }

  // --- NEW FUNCTION: Update local state instantly ---
  const handleEditUpdate = (updatedCollab: any) => {
    setCollaborations((prev) => 
      prev.map((item) => 
        item.id === updatedCollab.id 
          ? { ...item, ...updatedCollab } // Merge the new data into the existing item
          : item
      )
    );
  };
  // ------------------------------------------------

  async function handleApproval(collabId: string, status: "approved" | "rejected") {
    const supabase = createClient();
    const notes = approvalNotes[collabId] || "";

    const updateData: any = {
      approval_status: status,
      approval_notes: notes,
      is_active: status === "approved"
    };

    if (status === "approved") {
      updateData.approved_at = new Date().toISOString();
    } else {
      updateData.rejected_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("collaborations")
      .update(updateData)
      .eq("id", collabId);

    if (!error) {
      // Remove the item from the list locally
      setCollaborations((prev) => prev.filter(c => c.id !== collabId));
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (collaborations.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No pending collaboration approvals
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {collaborations.map((collab) => (
        <Card key={collab.id}>
          <CardHeader>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="space-y-1">
                <CardTitle className="text-xl">{collab.title}</CardTitle>
                <CardDescription>
                  By {collab.users?.display_name || "Business"} <span className="text-xs opacity-70">({collab.users?.email})</span>
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-2">
                {collab.category && (
                  <Badge variant="secondary" className="uppercase text-xs">{collab.category}</Badge>
                )}
                {/* Pass the optimized update handler */}
                <EditCollaborationDialog 
                  collaboration={collab} 
                  onUpdate={handleEditUpdate} 
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-1 text-sm">Description</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {collab.description}
              </p>
            </div>

            {collab.requirements && (
              <div>
                <h4 className="font-medium mb-1 text-sm">Requirements</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {collab.requirements}
                </p>
              </div>
            )}

            <div className="flex gap-4 text-sm text-muted-foreground pt-2">
                {collab.compensation && (
                <div>
                    <span className="font-medium text-foreground">Compensation:</span> {collab.compensation}
                </div>
                )}
                <div>
                    <span className="font-medium text-foreground">Posted:</span> {new Date(collab.created_at).toLocaleDateString()}
                </div>
                {collab.deadline && (
                  <div>
                    <span className="font-medium text-foreground">Deadline:</span> {new Date(collab.deadline).toLocaleDateString()}
                  </div>
                )}
            </div>

            <div className="space-y-2 pt-2">
              <Label htmlFor={`notes-${collab.id}`}>
                Approval Notes (Optional)
              </Label>
              <Textarea
                id={`notes-${collab.id}`}
                placeholder="Add any notes about this approval decision..."
                value={approvalNotes[collab.id] || ""}
                onChange={(e) =>
                  setApprovalNotes((prev) => ({
                    ...prev,
                    [collab.id]: e.target.value,
                  }))
                }
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => handleApproval(collab.id, "approved")}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
              >
                Approve
              </Button>
              <Button
                onClick={() => handleApproval(collab.id, "rejected")}
                variant="destructive"
                className="flex-1"
              >
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}