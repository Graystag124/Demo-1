'use server';

import { createClient } from "@/lib/supabase/server";

type Category = {
  id?: string;
  name: string;
  slug: string;
  created_at?: string;
};

export async function getCategories() {
  const supabase = await createClient();
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return categories;
}

export async function addCategory(name: string) {
  const supabase = await createClient();
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .or(`name.eq.${name},slug.eq.${slug}`)
    .single();

  if (existing) {
    throw new Error('A category with this name or slug already exists');
  }

  const { data, error } = await supabase
    .from('categories')
    .insert([{ name, slug }])
    .select()
    .single();

  if (error) {
    console.error('Error adding category:', error);
    throw new Error(error.message || 'Failed to add category');
  }

  return data;
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting category:', error);
    throw new Error(error.message || 'Failed to delete category');
  }

  return { success: true };
}
