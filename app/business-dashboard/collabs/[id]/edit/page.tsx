"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CollaborationForm } from "@/components/collaborations/collaboration-form";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function EditCollaborationPage() {
  const router = useRouter();
  const params = useParams();
  const [collaboration, setCollaboration] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          throw new Error("You must be logged in to edit a collaboration");
        }

        // Fetch the collaboration and categories in parallel
        const [collabResult, categoriesResult] = await Promise.all([
          supabase
            .from("collaborations")
            .select("*")
            .eq("id", params.id)
            .single(),
          supabase
            .from("categories")
            .select("*")
            .order("name", { ascending: true })
        ]);

        const { data: collaborationData, error: collabError } = collabResult;
        const { data: categoriesData, error: categoriesError } = categoriesResult;

        if (collabError) {
          throw new Error("Failed to fetch collaboration");
        }

        if (!collaborationData) {
          throw new Error("Collaboration not found");
        }

        // Verify ownership
        if (collaborationData.business_id !== user.id) {
          throw new Error("You don't have permission to edit this collaboration");
        }

        if (categoriesError) {
          console.error("Error fetching categories:", categoriesError);
          // Don't throw here, just log the error
        }

        setCollaboration(collaborationData);
        setCategories(categoriesData || []);
      } catch (err) {
        console.error("Error:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleUpdateSuccess = () => {
    toast({
      title: "Success",
      description: "Collaboration updated successfully!",
    });
    router.push(`/business-dashboard/collabs/${params.id}`);
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-3xl">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <Button 
            variant="ghost" 
            className="mt-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Go back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="text-2xl font-bold">Edit Collaboration</h1>
        <p className="text-sm text-muted-foreground">
          Update the details of your collaboration
        </p>
      </div>
      
      {collaboration && (
        <CollaborationForm 
          initialData={{
            ...collaboration,
            deadline: collaboration.deadline ? new Date(collaboration.deadline) : undefined,
          }}
          categories={categories}
          isEditMode 
          onSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
}
