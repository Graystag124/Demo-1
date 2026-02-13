'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Trash2, Edit } from 'lucide-react';
import { useState } from 'react';

type Cuisine = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

export default function CuisinesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newCuisine, setNewCuisine] = useState({ name: '', slug: '' });

  // TODO: Fetch cuisines from your API
  // useEffect(() => {
  //   const fetchCuisines = async () => {
  //     try {
  //       const response = await fetch('/api/admin/cuisines');
  //       const data = await response.json();
  //       setCuisines(data);
  //     } catch (error) {
  //       console.error('Error fetching cuisines:', error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //   fetchCuisines();
  // }, []);

  const handleAddCuisine = async () => {
    if (!newCuisine.name.trim() || !newCuisine.slug.trim()) return;
    
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/cuisines', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newCuisine),
      // });
      // const data = await response.json();
      // setCuisines([...cuisines, data]);
      
      // For demo purposes
      const demoCuisine = {
        id: Math.random().toString(36).substring(2, 9),
        name: newCuisine.name,
        slug: newCuisine.slug,
        created_at: new Date().toISOString(),
      };
      setCuisines([...cuisines, demoCuisine]);
      setNewCuisine({ name: '', slug: '' });
      setIsAdding(false);
    } catch (error) {
      console.error('Error adding cuisine:', error);
    }
  };

  const handleDeleteCuisine = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cuisine?')) return;
    
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/admin/cuisines/${id}`, { method: 'DELETE' });
      setCuisines(cuisines.filter(cuisine => cuisine.id !== id));
    } catch (error) {
      console.error('Error deleting cuisine:', error);
    }
  };

  const filteredCuisines = cuisines.filter(cuisine =>
    cuisine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cuisine.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Cuisines</h1>
          <p className="text-muted-foreground">Manage available cuisines for listings</p>
        </div>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Cuisine
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cuisines..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isAdding && (
        <div className="mb-6 p-4 border rounded-lg bg-muted/20">
          <h3 className="font-medium mb-4">Add New Cuisine</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Name</label>
              <Input
                placeholder="e.g., Italian, Chinese, Mexican"
                value={newCuisine.name}
                onChange={(e) => setNewCuisine({...newCuisine, name: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Slug</label>
              <Input
                placeholder="e.g., italian, chinese, mexican"
                value={newCuisine.slug}
                onChange={(e) => setNewCuisine({...newCuisine, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
            <Button onClick={handleAddCuisine}>Add Cuisine</Button>
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  Loading cuisines...
                </TableCell>
              </TableRow>
            ) : filteredCuisines.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No matching cuisines found' : 'No cuisines added yet'}
                </TableCell>
              </TableRow>
            ) : (
              filteredCuisines.map((cuisine) => (
                <TableRow key={cuisine.id}>
                  <TableCell className="font-medium">{cuisine.name}</TableCell>
                  <TableCell className="text-muted-foreground">{cuisine.slug}</TableCell>
                  <TableCell>
                    {new Date(cuisine.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteCuisine(cuisine.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
