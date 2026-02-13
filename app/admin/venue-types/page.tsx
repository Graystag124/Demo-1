'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

type VenueType = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

export default function VenueTypesPage() {
  const [venueTypes, setVenueTypes] = useState<VenueType[]>([]);
  const [newVenueType, setNewVenueType] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();

  const fetchVenueTypes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('venue_types')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setVenueTypes(data || []);
    } catch (error) {
      console.error('Error fetching venue types:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch venue types',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenueTypes();
  }, []);

  const handleAddVenueType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVenueType.trim()) return;

    try {
      setLoading(true);
      const slug = newVenueType.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      
      // Check if venue type already exists
      const { data: existing } = await supabase
        .from('venue_types')
        .select('id')
        .or(`name.eq.${newVenueType},slug.eq.${slug}`)
        .maybeSingle();

      if (existing) {
        throw new Error('A venue type with this name already exists');
      }

      const { data, error } = await supabase
        .from('venue_types')
        .insert([{ name: newVenueType.trim(), slug }])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from server');

      setVenueTypes(prev => [...prev, data]);
      setNewVenueType('');
      toast({
        title: 'Success',
        description: 'Venue type added successfully',
      });
    } catch (error) {
      console.error('Error adding venue type:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add venue type',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVenueType = async (id: string) => {
    if (!confirm('Are you sure you want to delete this venue type? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('venue_types')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setVenueTypes(venueTypes.filter(type => type.id !== id));
      toast({
        title: 'Success',
        description: 'Venue type deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting venue type:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete venue type. It might be in use.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Button 
            variant="ghost" 
            className="mb-2 p-0 h-auto text-muted-foreground hover:text-foreground"
            onClick={() => router.push('/admin/content-settings')}
          >
            ← Back to Content Settings
          </Button>
          <h1 className="text-2xl font-bold">Venue Types</h1>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Add New Venue Type</h2>
        <form onSubmit={handleAddVenueType} className="flex gap-2">
          <Input
            type="text"
            value={newVenueType}
            onChange={(e) => setNewVenueType(e.target.value)}
            placeholder="Enter venue type name"
            className="flex-1"
            disabled={loading}
          />
          <Button type="submit" disabled={!newVenueType.trim() || loading}>
            {loading ? 'Adding...' : 'Add Venue Type'}
          </Button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {venueTypes.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              {loading ? 'Loading venue types...' : 'No venue types found'}
            </div>
          ) : (
            venueTypes.map((type) => (
              <div key={type.id} className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{type.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {type.slug}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteVenueType(type.id)}
                  disabled={loading}
                >
                  Delete
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
