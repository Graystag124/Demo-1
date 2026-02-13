import { DashboardPageHeader } from "@/components/navigation/dashboard-page-header";
import { CollaborationApprovalList } from "@/components/admin/collaboration-approval-list";

export default function AdminCollaborationsPage() {
  return (
    <div className="p-8">
      <DashboardPageHeader
        title="Collaboration Approvals"
        showBackButton
      />
      <CollaborationApprovalList />
    </div>
  );
}
