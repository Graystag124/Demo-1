"use client";

import { UserApprovalList } from "@/components/admin/user-approval-list";
import { useSearchParams } from 'next/navigation';

export default function UserListContent() {
  const searchParams = useSearchParams();
  
  // Get both filters
  const userType = searchParams?.get('type') || undefined;
  const status = searchParams?.get('status') || 'pending';

  return (
    <UserApprovalList 
      userType={userType} 
      status={status}
    />
  );
}
