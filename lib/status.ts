export type ApprovalStatus =
  | "pending"
  | "approved"
  | "rejected";

export type SubmissionStatus =
  | "submitted"
  | "approved"
  | "rejected"
  | "in_progress"
  | "assigned"
  | "completed"
  | "applied"
  | "accepted";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export function getStatusVariant(status?: string): BadgeVariant {
  if (!status) return "outline";

  const s = status.toLowerCase();
  switch (s) {
    case "approved":
    case "accepted":
      return "default";
    case "pending":
    case "submitted":
    case "in_progress":
      return "secondary";
    case "rejected":
      return "destructive";
    default:
      return "outline";
  }
}

export function getStatusLabel(status?: string): string {
  if (!status) return "Unknown";
  const map: Record<string, string> = {
    submitted: "Submitted",
    approved: "Approved",
    rejected: "Rejected",
    pending: "Pending",
    in_progress: "In Progress",
    assigned: "Assigned",
    completed: "Completed",
    applied: "Applied",
    accepted: "Accepted",
  };
  const key = status.toLowerCase();
  return map[key] || status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
