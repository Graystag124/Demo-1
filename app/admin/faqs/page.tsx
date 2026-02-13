"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Plus, Save, X } from "lucide-react";
import { toast } from "sonner";

type FAQ = {
  id: string;
  question: string;
  answer: string;
  created_at: string;
};

export default function FAQSPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<FAQ, 'id' | 'created_at'>>({ 
    question: '', 
    answer: '' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  // Fetch FAQs
  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFaqs(data || []);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      toast.error('Failed to load FAQs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = (faq: FAQ) => {
    setIsEditing(true);
    setEditingId(faq.id);
    setFormData({
      question: faq.question,
      answer: faq.answer
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({ question: '', answer: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    console.log('Form submission started', { isEditing, editingId, formData });
    setIsSubmitting(true);

    try {
      console.log('Supabase client check:', {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ URL is set' : '❌ URL is missing',
        hasKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Key is set' : '❌ Key is missing',
        isEditing,
        editingId
      });

      if (editingId) {
        // Update existing FAQ
        console.log('Updating FAQ with ID:', editingId);
        const updateData = {
          question: formData.question,
          answer: formData.answer,
          updated_at: new Date().toISOString()
        };
        
        console.log('Update data:', updateData);
        
        const { data, error } = await supabase
          .from('faqs')
          .update(updateData)
          .eq('id', editingId)
          .select()
          .single();

        if (error) throw error;
        
        console.log('Update successful, data:', data);
        toast.success('FAQ updated successfully');
      } else {
        // Create new FAQ
        console.log('Creating new FAQ');
        const insertData = {
          question: formData.question,
          answer: formData.answer,
          created_at: new Date().toISOString()
        };
        
        console.log('Insert data:', insertData);
        
        const { data, error } = await supabase
          .from('faqs')
          .insert(insertData)
          .select()
          .single();

        if (error) throw error;
        
        console.log('Insert successful, data:', data);
        toast.success('FAQ added successfully');
      }

      // Refresh the list and reset form
      await fetchFAQs();
      handleCancel();
    } catch (error: any) {
      console.error('Error in handleSubmit:', {
        name: error?.name,
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        stack: error?.stack
      });
      
      const errorMessage = error?.message || 'An unknown error occurred';
      toast.error(`Failed to ${editingId ? 'update' : 'add'} FAQ: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('FAQ deleted successfully');
      fetchFAQs();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      toast.error('Failed to delete FAQ');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">FAQs</h1>
          <Button disabled>
            <Plus className="w-4 h-4 mr-2" />
            Add FAQ
          </Button>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 bg-white rounded-lg shadow animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-100 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full overflow-x-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">FAQs</h1>
        <Button 
          onClick={() => {
            setIsEditing(true);
            setEditingId(null);
            setFormData({ question: '', answer: '' });
          }}
          disabled={isEditing}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add FAQ
        </Button>
      </div>

      {isEditing && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit FAQ' : 'Add New FAQ'}
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
                Question
              </label>
              <Input
                id="question"
                name="question"
                value={formData.question}
                onChange={handleInputChange}
                placeholder="Enter question"
                className="w-full"
                required
              />
            </div>
            <div>
              <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-1">
                Answer
              </label>
              <Textarea
                id="answer"
                name="answer"
                value={formData.answer}
                onChange={handleInputChange}
                placeholder="Enter answer"
                className="w-full min-h-[100px]"
                required
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  'Saving...'
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isEditing === 'new' ? 'Add FAQ' : 'Save Changes'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      )}

      <div className="p-6 bg-white rounded-lg shadow w-full max-w-[95vw] mx-auto overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px] w-[30%]">Question</TableHead>
              <TableHead className="min-w-[300px] w-[50%] max-w-[500px]">Answer</TableHead>
              <TableHead className="sticky right-0 bg-white min-w-[150px] w-[20%] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {faqs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                  No FAQs found. Click "Add FAQ" to create one.
                </TableCell>
              </TableRow>
            ) : (
              faqs.map((faq) => (
                <TableRow key={faq.id}>
                  <TableCell className="font-medium">
                    {isEditing === faq.id ? (
                      <Input
                        name="question"
                        value={formData.question}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    ) : (
                      faq.question
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing === faq.id ? (
                      <Textarea
                        name="answer"
                        value={formData.answer}
                        onChange={handleInputChange}
                        className="w-full min-h-[60px]"
                      />
                    ) : (
                      <div className="whitespace-normal break-words">{faq.answer}</div>
                    )}
                  </TableCell>
                  <TableCell className="sticky right-0 bg-white z-10 whitespace-nowrap">
                    <div className="flex justify-end space-x-2 min-w-[100px]">
                      {isEditing === faq.id ? (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="default"
                            size="icon"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? '...' : <Save className="h-4 w-4" />}
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(faq)}
                            disabled={isEditing}
                            className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(faq.id)}
                            disabled={isEditing}
                            className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </>
                      )}
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
