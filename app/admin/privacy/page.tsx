'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

// --- Types ---
type PolicySection = {
  title: string;
  text: string;
  list?: string[]; // Optional bullet points
};

type PrivacyPolicy = {
  id: string;
  company_legal_name: string;
  platform_name: string;
  jurisdiction: string;
  registered_address: string;
  contact_email: string;
  min_user_age: string;
  last_updated: string;
  content: PolicySection[]; 
};

// --- Helper Icons (Simple SVGs) ---
const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
);
const ArrowUpIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
);
const ArrowDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
);

export default function EditPrivacyPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const handleBackToSettings = () => {
    router.push('/admin/content-settings');
  };
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState<PrivacyPolicy | null>(null);

  // 1. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('privacy_policies')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching data:', error);
        alert('Could not load privacy policy.');
      } else if (data) {
        // Ensure content is an array
        const safeContent = Array.isArray(data.content) ? data.content : [];
        setFormData({ ...data, content: safeContent });
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // 2. Handle Top-Level Fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Section Management Helpers
  const handleSectionChange = (index: number, field: keyof PolicySection, value: any) => {
    if (!formData) return;
    const newContent = [...formData.content];
    newContent[index] = { ...newContent[index], [field]: value };
    setFormData({ ...formData, content: newContent });
  };

  const addSection = () => {
    if (!formData) return;
    const newSection: PolicySection = { title: 'New Section', text: '', list: [] };
    setFormData({ ...formData, content: [...formData.content, newSection] });
  };

  const removeSection = (index: number) => {
    if (!formData) return;
    if (!confirm('Are you sure you want to delete this section?')) return;
    const newContent = formData.content.filter((_, i) => i !== index);
    setFormData({ ...formData, content: newContent });
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (!formData) return;
    const newContent = [...formData.content];
    if (direction === 'up' && index > 0) {
      [newContent[index], newContent[index - 1]] = [newContent[index - 1], newContent[index]];
    } else if (direction === 'down' && index < newContent.length - 1) {
      [newContent[index], newContent[index + 1]] = [newContent[index + 1], newContent[index]];
    }
    setFormData({ ...formData, content: newContent });
  };

  // 4. List (Bullet Point) Management Helpers
  const handleListChange = (sectionIndex: number, itemIndex: number, value: string) => {
    if (!formData) return;
    const newContent = [...formData.content];
    const newList = [...(newContent[sectionIndex].list || [])];
    newList[itemIndex] = value;
    newContent[sectionIndex].list = newList;
    setFormData({ ...formData, content: newContent });
  };

  const addListItem = (sectionIndex: number) => {
    if (!formData) return;
    const newContent = [...formData.content];
    const newList = [...(newContent[sectionIndex].list || []), ''];
    newContent[sectionIndex].list = newList;
    setFormData({ ...formData, content: newContent });
  };

  const removeListItem = (sectionIndex: number, itemIndex: number) => {
    if (!formData) return;
    const newContent = [...formData.content];
    const newList = (newContent[sectionIndex].list || []).filter((_, i) => i !== itemIndex);
    newContent[sectionIndex].list = newList;
    setFormData({ ...formData, content: newContent });
  };

  // 5. Save to Supabase
  const handleSave = async () => {
    if (!formData) return;
    setSaving(true);

    const { error } = await supabase
      .from('privacy_policies')
      .update({
        company_legal_name: formData.company_legal_name,
        platform_name: formData.platform_name,
        jurisdiction: formData.jurisdiction,
        registered_address: formData.registered_address,
        contact_email: formData.contact_email,
        min_user_age: formData.min_user_age,
        last_updated: formData.last_updated,
        content: formData.content, // Save the array directly
      })
      .eq('id', formData.id);

    setSaving(false);

    if (error) {
      console.error(error);
      alert('Error saving changes.');
    } else {
      alert('Privacy Policy updated successfully!');
      router.refresh();
    }
  };

  if (loading) return <div className="p-10">Loading...</div>;
  if (!formData) return <div className="p-10">No active policy found.</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Button 
            variant="ghost" 
            className="mb-2 p-0 h-auto text-muted-foreground hover:text-foreground"
            onClick={handleBackToSettings}
          >
            ← Back to Content Settings
          </Button>
          <h1 className="text-2xl font-bold">Privacy Policy Editor</h1>
        </div>
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="ml-4"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* --- Company Details Card --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Company Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Platform Name" name="platform_name" value={formData.platform_name} onChange={handleInputChange} />
          <InputField label="Legal Company Name" name="company_legal_name" value={formData.company_legal_name} onChange={handleInputChange} />
          <InputField label="Last Updated" name="last_updated" value={formData.last_updated} onChange={handleInputChange} />
          <InputField label="Min Age" name="min_user_age" value={formData.min_user_age} onChange={handleInputChange} />
          <InputField label="Contact Email" name="contact_email" value={formData.contact_email} onChange={handleInputChange} />
          <InputField label="Jurisdiction" name="jurisdiction" value={formData.jurisdiction} onChange={handleInputChange} />
          <div className="md:col-span-2">
            <InputField label="Registered Address" name="registered_address" value={formData.registered_address} onChange={handleInputChange} />
          </div>
        </div>
      </div>

      {/* --- Content Sections Editor --- */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Policy Sections</h2>
          <button
            onClick={addSection}
            className="flex items-center gap-2 text-sm font-medium text-white bg-[#0B3D2E] px-4 py-2 rounded-lg hover:bg-[#006A4E] transition-all duration-300 ease-in-out"
          >
            <PlusIcon /> Add New Section
          </button>
        </div>

        {formData.content.map((section, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative group transition hover:border-blue-300">
            
            {/* Section Controls (Top Right) */}
            <div className="absolute top-4 right-4 flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition">
              <button onClick={() => moveSection(index, 'up')} disabled={index === 0} className="p-2 text-gray-400 hover:text-gray-700 disabled:opacity-30 bg-gray-50 rounded"><ArrowUpIcon /></button>
              <button onClick={() => moveSection(index, 'down')} disabled={index === formData.content.length - 1} className="p-2 text-gray-400 hover:text-gray-700 disabled:opacity-30 bg-gray-50 rounded"><ArrowDownIcon /></button>
              <button onClick={() => removeSection(index)} className="p-2 text-red-400 hover:text-red-600 bg-red-50 rounded ml-2"><TrashIcon /></button>
            </div>

            {/* Title Input */}
            <div className="mb-4 pr-32">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Section Title</label>
              <input
                type="text"
                value={section.title}
                onChange={(e) => handleSectionChange(index, 'title', e.target.value)}
                className="w-full text-lg font-bold text-gray-800 border-b border-gray-200 focus:border-blue-500 focus:outline-none py-1 placeholder-gray-300"
                placeholder="e.g. 1. Introduction"
              />
            </div>

            {/* Text Area */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Main Content</label>
              <textarea
                rows={3}
                value={section.text}
                onChange={(e) => handleSectionChange(index, 'text', e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Type the legal text here..."
              />
            </div>

            {/* List / Bullet Points */}
            <div className="pl-4 border-l-2 border-gray-100">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Bullet Points (Optional)</label>
              
              <div className="space-y-2">
                {section.list?.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleListChange(index, i, e.target.value)}
                      className="flex-1 text-sm border border-gray-200 rounded px-2 py-1.5 focus:border-blue-500 focus:outline-none"
                      placeholder="Bullet point detail..."
                    />
                    <button onClick={() => removeListItem(index, i)} className="text-gray-400 hover:text-red-500"><TrashIcon /></button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => addListItem(index)}
                className="mt-3 text-xs font-semibold text-blue-600 flex items-center gap-1 hover:underline"
              >
                <PlusIcon /> Add Bullet Point
              </button>
            </div>
          </div>
        ))}

        {/* Empty State Helper */}
        {formData.content.length === 0 && (
          <div className="text-center py-12 bg-gray-100 rounded-xl border-dashed border-2 border-gray-300">
            <p className="text-gray-500">No sections added yet.</p>
            <button onClick={addSection} className="text-[#0B3D2E] font-bold mt-2 hover:underline">Start by adding a section</button>
          </div>
        )}
      </div>
        
      {/* Footer Padding */}
      <div className="h-20"></div>
    </div>
  );
}

// Simple Sub-component for inputs to keep code clean
function InputField({ label, name, value, onChange }: { label: string, name: string, value: string, onChange: (e: any) => void }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black focus:outline-none transition"
      />
    </div>
  );
}