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

interface Application {
  id: string;
  message: string;
  portfolio_link: string;
  approval_status: string;
  created_at: string;
  collaboration_id: string;
  creator_id: string;
  collaborations: {
    title: string;
  };
  users: {
    display_name: string;
    email: string;
  };
}

export function ApplicationApprovalList() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [approvalNotes, setApprovalNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("collaboration_applications")
      .select(`
        *,
        collaborations:collaboration_id (
          title
        ),
        users:creator_id (
          display_name,
          email
        )
      `)
      .eq("approval_status", "pending")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setApplications(data as any);
    }
    setIsLoading(false);
  }

  async function handleApproval(
    appId: string,
    status: "approved" | "rejected"
  ) {
    const supabase = createClient();
    const notes = approvalNotes[appId] || "";

    const updateData: any = {
      approval_status: status,
      approval_notes: notes,
    };

    if (status === "approved") {
      updateData.approved_at = new Date().toISOString();
    } else {
      updateData.rejected_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("collaboration_applications")
      .update(updateData)
      .eq("id", appId);

    if (!error) {
      fetchApplications();
      setApprovalNotes((prev) => {
        const newNotes = { ...prev };
        delete newNotes[appId];
        return newNotes;
      });
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No pending application approvals
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((app) => (
        <Card key={app.id}>
          <CardHeader>
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <CardTitle>
                  Application by {app.users.display_name}
                </CardTitle>
                <CardDescription>
                  For collaboration: {app.collaborations.title}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {app.message && (
              <div>
                <h4 className="font-medium mb-2">Message</h4>
                <p className="text-sm text-muted-foreground">{app.message}</p>
              </div>
            )}

            {app.portfolio_link && (
              <div>
                <h4 className="font-medium mb-2">Portfolio</h4>
                <a
                  href={app.portfolio_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  {app.portfolio_link}
                </a>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              Applied: {new Date(app.created_at).toLocaleDateString()}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`notes-${app.id}`}>
                Approval Notes (Optional)
              </Label>
              <Textarea
                id={`notes-${app.id}`}
                placeholder="Add any notes about this approval decision..."
                value={approvalNotes[app.id] || ""}
                onChange={(e) =>
                  setApprovalNotes((prev) => ({
                    ...prev,
                    [app.id]: e.target.value,
                  }))
                }
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleApproval(app.id, "approved")}
                className="flex-1"
              >
                Approve
              </Button>
              <Button
                onClick={() => handleApproval(app.id, "rejected")}
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
