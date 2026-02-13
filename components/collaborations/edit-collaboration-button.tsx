"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface EditCollaborationButtonProps {
  id: string;
  status: string;
}

export function EditCollaborationButton({ id, status }: EditCollaborationButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (status !== 'approved') {
      alert('Only approved collaborations can be edited. Please contact support if you need to make changes.');
      return;
    }
    router.push(`/business-dashboard/collabs/${id}/edit`);
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleClick}
      className="group relative"
    >
      <Pencil className="h-4 w-4 mr-1 transition-transform group-hover:rotate-12" />
      <span>Edit</span>
    </Button>
  );
}
