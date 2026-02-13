"use client";

import { useForm } from "react-hook-form";

interface Category {
  id: string;
  name: string;
}

interface CollaborationFormProps {
  categories: Category[];
}

export function CollaborationForm({ categories }: CollaborationFormProps) {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data: any) => {
    console.log("Form Data:", data);
    // Handle submission to Supabase here
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <select 
          {...register("category_id", { required: true })}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select a category...</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <button 
        type="submit" 
        className="bg-[#0B3D2E] text-white px-4 py-2 rounded-md hover:bg-[#006A4E] transition-all duration-300 ease-in-out"
      >
        Create Collaboration
      </button>
    </form>
  );
}