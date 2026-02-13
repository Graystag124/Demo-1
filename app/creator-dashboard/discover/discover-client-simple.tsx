'use client'

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { DashboardPageHeader } from "@/components/navigation/dashboard-page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function DiscoverCollabsSimple() {
  const [collaborations, setCollaborations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCollaborations = async () => {
      try {
        const supabase = createClient();
        
        // Simple query without complex joins
        const { data, error } = await supabase
          .from('collaborations')
          .select('*')
          .eq('is_active', true)
          .limit(10);

        if (error) {
          console.error('Simple query error:', error);
          toast.error('Failed to load collaborations');
        } else {
          console.log('Loaded collaborations:', data);
          setCollaborations(data || []);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        toast.error('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadCollaborations();
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-8 max-w-7xl">
      <DashboardPageHeader title="Discover" description="Find and apply for collaborations" showBackButton />
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading collaborations...</span>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Found {collaborations.length} collaborations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collaborations.map((collab) => (
              <Card key={collab.id}>
                <CardContent className="p-4">
                  <h4 className="font-semibold">{collab.title || 'Untitled'}</h4>
                  <p className="text-sm text-muted-foreground mt-2">
                    {collab.description || 'No description'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Business ID: {collab.business_id}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Tier Required: {collab.creator_tier || 'None'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
