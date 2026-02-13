"use client";

import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import UserListContent from './user-list';

export default function UserApprovalsPage() {
  return (
    <div className="container mx-auto p-8">
      <Suspense fallback={
        <div className="space-y-4">
          <Skeleton className="h-10 w-64 mb-6" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      }>
        <UserListContent />
      </Suspense>
    </div>
  );
}