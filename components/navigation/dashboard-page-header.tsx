"use client";

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface DashboardPageHeaderProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
  backPath?: string;
}

export function DashboardPageHeader({
  title,
  description,
  showBackButton = false,
  backPath,
}: DashboardPageHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleBack = () => {
    if (backPath) {
      router.push(backPath);
      return;
    }
    const pathSegments = pathname.split('/').filter(Boolean);
    if (pathSegments.length > 1) {
      const dashboardRoot = `/${pathSegments[0]}`;
      router.push(dashboardRoot);
    } else {
      router.back(); // Fallback
    }
  };

  return (
    <div className="flex items-center gap-4 mb-6">
      {showBackButton && (
        <Button
          variant="outline"
          size="icon"
          onClick={handleBack}
          className="flex-shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
      )}
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
