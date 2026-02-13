import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EditCollaborationDialog } from "@/components/admin/edit-collaboration-dialog";

interface PageProps {
  params: { id: string };
}

export default async function CollaborationDetailPage({ params }: PageProps) {
  const supabase = await createClient();

  const { data: collab, error } = await supabase
    .from("collaborations")
    .select(
      `
      *,
      collaboration_applications(*)
    `
    )
    .eq("id", params.id)
    .maybeSingle();

  if (error) {
    console.error("[v0] Error fetching collaboration:", error);
  }

  if (!collab) {
    notFound();
  }

  const status: string = collab.approval_status || "pending";

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">
                {collab.title}
              </CardTitle>
              {collab.category && (
                <CardDescription>{collab.category}</CardDescription>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  status === "pending"
                    ? "default"
                    : status === "approved"
                    ? "secondary"
                    : "destructive"
                }
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
              <EditCollaborationDialog collaboration={collab} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {collab.description && (
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {collab.description}
            </p>
          )}

          {collab.deadline && (
            <p className="text-sm text-muted-foreground">
              Deadline: {new Date(collab.deadline).toLocaleDateString()}
            </p>
          )}

          {status === "pending" && (
            <div className="mt-4 p-4 rounded-md bg-yellow-50 border border-yellow-200 text-sm text-yellow-900">
              This collaboration is currently <strong>pending admin approval</strong>.
              It will be visible to creators once an admin has reviewed and approved it.
            </div>
          )}

          {status === "approved" && (
            <div className="mt-4 p-4 rounded-md bg-green-50 border border-green-200 text-sm text-green-900">
              This collaboration has been <strong>approved</strong> and is visible to eligible creators.
            </div>
          )}

          {status === "rejected" && (
            <div className="mt-4 p-4 rounded-md bg-red-50 border border-red-200 text-sm text-red-900">
              This collaboration has been <strong>rejected</strong>. You can edit and submit a new one if needed.
            </div>
          )}

          {Array.isArray(collab.collaboration_applications) &&
            collab.collaboration_applications.length > 0 && (
              <div className="mt-6 space-y-2">
                <h2 className="text-sm font-semibold">Applications</h2>
                <p className="text-xs text-muted-foreground">
                  Detailed management is available from your dashboard, but here is a quick summary.
                </p>
                <p className="text-sm text-muted-foreground">
                  Total applications: {collab.collaboration_applications.length}
                </p>
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}