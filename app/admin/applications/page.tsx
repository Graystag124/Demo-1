import { DashboardPageHeader } from "@/components/navigation/dashboard-page-header";
import { ApplicationApprovalList } from "@/components/admin/application-approval-list";

export default function AdminApplicationsPage() {
  return (
    <div className="p-8">
      <DashboardPageHeader
        title="Application Approvals"
        showBackButton
      />
      <ApplicationApprovalList />
    </div>
  );
}
