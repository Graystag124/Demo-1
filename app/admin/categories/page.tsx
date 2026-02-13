'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

type Category = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch categories',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      setLoading(true);
      const slug = newCategory.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      
      // First check if category already exists
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .or(`name.eq.${newCategory},slug.eq.${slug}`)
        .maybeSingle();

      if (existing) {
        throw new Error('A category with this name or slug already exists');
      }

      const { data, error } = await supabase
        .from('categories')
        .insert([{ name: newCategory.trim(), slug }])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message || 'Failed to add category to database');
      }

      if (!data) {
        throw new Error('No data returned from server');
      }

      setCategories(prev => [...prev, data]);
      setNewCategory('');
      toast({
        title: 'Success',
        description: 'Category added successfully',
      });
    } catch (error) {
      console.error('Error in handleAddCategory:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add category',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCategories(categories.filter(category => category.id !== id));
      toast({
        title: 'Success',
        description: 'Category deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete category. It might be in use.',
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
          <h1 className="text-2xl font-bold">Collaboration Categories</h1>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Add New Category</h2>
        <form onSubmit={handleAddCategory} className="flex gap-2">
          <Input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Enter category name"
            className="flex-1"
            disabled={loading}
          />
          <Button type="submit" disabled={!newCategory.trim() || loading}>
            {loading ? 'Adding...' : 'Add Category'}
          </Button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {categories.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              {loading ? 'Loading categories...' : 'No categories found'}
            </div>
          ) : (
            categories.map((category) => (
              <div key={category.id} className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{category.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {category.slug}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteCategory(category.id)}
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
