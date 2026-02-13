"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
  CalendarIcon, 
  Loader2, 
  X 
} from "lucide-react";
import { useRouter } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "@/components/ui/use-toast";

// Import the new component
import { LocationInput } from "@/components/ui/location-input"; 

export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

interface CollaborationFormProps {
  initialData?: {
    id?: string;
    title?: string;
    description?: string;
    category?: string;
    requirements?: string;
    dates?: string[] | Date[]; 
    location?: string;
    creator_tier?: number | null;
  };
  isEditMode?: boolean;
  categories?: Category[];
  onSuccess?: () => void;
}

export function CollaborationForm({ initialData, isEditMode = false, categories = [], onSuccess }: CollaborationFormProps) {
  const router = useRouter();
  const supabase = createClient();
  
  const [isLoading, setIsLoading] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.cover_image_url || null);
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
  
  // Clean up object URL on component unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);
  
  // Location state is just a string, but now powered by autocomplete
  const [location, setLocation] = useState<string>(initialData?.location || "");
  const [isLocationValid, setIsLocationValid] = useState(!!initialData?.location);
  const [creatorTier, setCreatorTier] = useState<number | null>(initialData?.creator_tier || null);
  
  // Dates Logic
  const [dates, setDates] = useState<Date[] | undefined>(() => {
    if (!initialData?.dates) return [];
    return initialData.dates.map((d) => new Date(d));
  });

  const [description, setDescription] = useState(initialData?.description || '');
  
  // Parse initial requirements or set default values
  const [requirements, setRequirements] = useState(() => {
    try {
      if (initialData?.requirements) {
        const parsed = JSON.parse(initialData.requirements);
        return {
          reels: parsed.reels || 0,
          stories: parsed.stories || 0,
          posts: parsed.posts || 0,
          other: parsed.other || ''
        };
      }
    } catch (e) {
      // If parsing fails, check if it's an old format string
      if (typeof initialData?.requirements === 'string') {
        return {
          reels: 0,
          stories: 0,
          posts: 0,
          other: initialData.requirements
        };
      }
    }
    return { reels: 0, stories: 0, posts: 0, other: '' };
  });

  const handleRequirementChange = (type: 'reels' | 'stories' | 'posts', value: number) => {
    setRequirements(prev => ({
      ...prev,
      [type]: Math.max(0, value) // Ensure value is not negative
    }));
  };

  const handleOtherRequirementsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRequirements(prev => ({
      ...prev,
      other: e.target.value
    }));
  };

  // Convert requirements to string for form submission
  const getRequirementsString = () => {
    return JSON.stringify(requirements);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let imageUrl = '';
      const formData = new FormData(e.currentTarget);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      // Upload cover image if selected
      if (coverImage) {
        try {
          const fileExt = coverImage.name.split('.').pop();
          const fileName = `${user.id}_${Date.now()}.${fileExt}`; // Include user ID in filename
          const filePath = `collaboration-covers/${fileName}`;
          
          // First, try to delete existing cover image if it exists
          if (initialData?.cover_image_url) {
            const oldFileName = initialData.cover_image_url.split('/').pop();
            if (oldFileName) {
              await supabase.storage
                .from('collaborations')
                .remove([`collaboration-covers/${oldFileName}`])
                .catch(e => console.warn('Could not delete old cover image:', e));
            }
          }
          
          const { error: uploadError } = await supabase.storage
            .from('collaborations')
            .upload(filePath, coverImage, {
              cacheControl: '3600',
              upsert: false,
              contentType: coverImage.type
            });
            
          if (uploadError) {
            console.error('Upload error:', uploadError);
            throw new Error(`Failed to upload image: ${uploadError.message}`);
          }
          
          // Get public URL with cache busting
          const { data: { publicUrl } } = supabase.storage
            .from('collaborations')
            .getPublicUrl(filePath);
            
          imageUrl = `${publicUrl}?t=${Date.now()}`;
        } catch (e) {
          console.error('Error uploading cover image:', e);
          throw new Error(`Failed to upload image: ${e.message}`);
        }
      }

      // Validation
      if (description.length < 10) {
        toast({ 
          title: "Description too short", 
          description: "Please provide a more detailed description (minimum 10 characters).", 
          variant: "destructive" 
        });
        setIsLoading(false);
        return;
      }

      if (!dates || dates.length === 0) {
        toast({ 
          title: "Validation Error", 
          description: "Please select at least one date.", 
          variant: "destructive" 
        });
        setIsLoading(false);
        return;
      }

      if (!location || location.trim() === '') {
        toast({ 
          title: "Location Required", 
          description: "Please select a location from the dropdown or enter a valid address.",
          variant: "destructive" 
        });
        setIsLocationValid(false);
        setIsLoading(false);
        return;
      }

      // Prepare collaboration data
      const collaborationData: any = {
        title: formData.get("title") as string,
        description: description,
        category: formData.get("category") as string,
        requirements: getRequirementsString(),
        location: location,
        creator_tier: creatorTier,
        dates: dates,
        updated_at: new Date().toISOString()
      };

      // Add cover image URL if a new one was uploaded
      if (imageUrl) {
        collaborationData.cover_image_url = imageUrl;
      }

      if (isEditMode && initialData?.id) {
        // Update existing collaboration
        const { data, error } = await supabase
          .from("collaborations")
          .update({ 
            ...collaborationData,
            business_id: user.id  // Ensure business_id is included in updates
          })
          .eq("id", initialData.id)
          .eq("business_id", user.id)  // Additional security check
          .select()
          .single();
          
        if (error) {
          console.error('Update error:', error);
          throw new Error(`Failed to update collaboration: ${error.message}`);
        }
        
        toast({ 
          title: "Success!", 
          description: "Collaboration updated successfully.",
          variant: "default"
        });
        
        // Redirect to the updated collaboration page
        router.push(`/business-dashboard/collabs/${initialData.id}`);
      } else {
        // Create new collaboration
        const { data, error } = await supabase
          .from("collaborations")
          .insert({ ...collaborationData, business_id: user.id })
          .select()
          .single();
          
        if (error) throw error;
        
        toast({ 
          title: "Success!", 
          description: "Collaboration created successfully.",
          variant: "default"
        });
        
        // Redirect to the dashboard after creation
        router.push("/business-dashboard");
      }
      
      // Refresh the router to ensure latest data
      router.refresh();
      
    } catch (error: any) {
      console.error("Error:", error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to process your request. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border shadow-sm max-w-2xl mx-auto">
      
      {/* Cover Image Upload */}
      <div className="space-y-2">
        <Label htmlFor="cover-image">Cover Image</Label>
        <div className="mt-1 flex items-center">
          <label
            htmlFor="cover-image"
            className="cursor-pointer rounded-md border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            <span>Upload a cover image</span>
            <input
              id="cover-image"
              name="cover-image"
              type="file"
              className="sr-only"
              accept="image/*"
              onChange={handleFileChange}
            />
          </label>
        </div>
        {(previewUrl || initialData?.cover_image_url) && (
          <div className="mt-2">
            <div className="relative w-full h-48 rounded-md overflow-hidden">
              <img
                src={previewUrl || initialData?.cover_image_url}
                alt="Cover preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
                onClick={() => {
                  setCoverImage(null);
                  setPreviewUrl(null);
                  // If you want to allow removing the existing image, you'll need to handle that in your update logic
                }}
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            {!previewUrl && initialData?.cover_image_url && (
              <p className="mt-1 text-xs text-muted-foreground">
                Current cover image. Upload a new one to replace it.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="e.g., Summer Brand Campaign"
          required
          defaultValue={initialData?.title}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Describe the opportunity in detail (minimum 10 characters)..."
          rows={4}
          minLength={10}
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={description.length > 0 && description.length < 10 ? 'border-red-500' : ''}
        />
        <div className="flex justify-between items-center mt-1">
          <p className={`text-xs ${description.length > 0 && description.length < 10 ? 'text-red-500' : 'text-muted-foreground'}`}>
            {description.length > 0 && description.length < 10 ? (
              <span>Description must be at least 10 characters</span>
            ) : (
              <span>Minimum 10 characters</span>
            )}
          </p>
          <span className={`text-xs ${description.length < 10 ? 'text-red-500' : 'text-muted-foreground'}`}>
            {description.length}/10
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Creator Tier</Label>
          <Select 
            value={creatorTier ? creatorTier.toString() : "any"} 
            onValueChange={(value) => setCreatorTier(value === "any" ? null : parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select creator tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Tier</SelectItem>
              <SelectItem value="1">Tier 1</SelectItem>
              <SelectItem value="2">Tier 2</SelectItem>
              <SelectItem value="3">Tier 3</SelectItem>
              <SelectItem value="4">Tier 4</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select name="category" required defaultValue={initialData?.category || ''}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.length > 0 ? (
                categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-categories" disabled>
                  No categories available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 flex flex-col">
          <Label>Location</Label>
          <div className={cn("space-y-2 flex flex-col", !isLocationValid && location.trim() === '' && "text-destructive")}>
            <Label className={cn(!isLocationValid && location.trim() === '' && "text-destructive")}>
              Location {!isLocationValid && location.trim() === '' && "*"}
            </Label>
            <LocationInput 
              value={location} 
              onChange={(value) => {
                setLocation(value);
                setIsLocationValid(!!value && value.trim() !== '');
              }}
              onLocationSelect={() => setIsLocationValid(true)}
            />
            {!isLocationValid && location.trim() === '' && (
              <p className="text-sm text-destructive">Please select a valid location</p>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Search for your business or city (India only).
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="block mb-2">Content Requirements</Label>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="reels-checkbox"
                checked={requirements.reels > 0}
                onChange={(e) => handleRequirementChange('reels', e.target.checked ? 1 : 0)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="reels-checkbox" className="font-normal">Reels</Label>
              {requirements.reels > 0 && (
                <div className="flex items-center ml-4">
                  <button
                    type="button"
                    onClick={() => handleRequirementChange('reels', Math.max(0, requirements.reels - 1))}
                    className="w-8 h-8 flex items-center justify-center border rounded-l-md bg-gray-100 hover:bg-gray-200"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={requirements.reels}
                    onChange={(e) => handleRequirementChange('reels', parseInt(e.target.value) || 0)}
                    className="w-12 h-8 text-center border-t border-b border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => handleRequirementChange('reels', requirements.reels + 1)}
                    className="w-8 h-8 flex items-center justify-center border rounded-r-md bg-gray-100 hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="stories-checkbox"
                checked={requirements.stories > 0}
                onChange={(e) => handleRequirementChange('stories', e.target.checked ? 1 : 0)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="stories-checkbox" className="font-normal">Stories</Label>
              {requirements.stories > 0 && (
                <div className="flex items-center ml-4">
                  <button
                    type="button"
                    onClick={() => handleRequirementChange('stories', Math.max(0, requirements.stories - 1))}
                    className="w-8 h-8 flex items-center justify-center border rounded-l-md bg-gray-100 hover:bg-gray-200"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={requirements.stories}
                    onChange={(e) => handleRequirementChange('stories', parseInt(e.target.value) || 0)}
                    className="w-12 h-8 text-center border-t border-b border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => handleRequirementChange('stories', requirements.stories + 1)}
                    className="w-8 h-8 flex items-center justify-center border rounded-r-md bg-gray-100 hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="posts-checkbox"
                checked={requirements.posts > 0}
                onChange={(e) => handleRequirementChange('posts', e.target.checked ? 1 : 0)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="posts-checkbox" className="font-normal">Posts</Label>
              {requirements.posts > 0 && (
                <div className="flex items-center ml-4">
                  <button
                    type="button"
                    onClick={() => handleRequirementChange('posts', Math.max(0, requirements.posts - 1))}
                    className="w-8 h-8 flex items-center justify-center border rounded-l-md bg-gray-100 hover:bg-gray-200"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={requirements.posts}
                    onChange={(e) => handleRequirementChange('posts', parseInt(e.target.value) || 0)}
                    className="w-12 h-8 text-center border-t border-b border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => handleRequirementChange('posts', requirements.posts + 1)}
                    className="w-8 h-8 flex items-center justify-center border rounded-r-md bg-gray-100 hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="other-requirements">Other Requirements</Label>
          <Textarea
            id="other-requirements"
            placeholder="Any additional requirements or notes..."
            rows={2}
            value={requirements.other}
            onChange={handleOtherRequirementsChange}
          />
        </div>
      </div>

      <div className="space-y-2 flex flex-col">
        <Label>Available Dates</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full pl-3 text-left font-normal",
                !dates || dates.length === 0 ? "text-muted-foreground" : ""
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dates && dates.length > 0 ? (
                dates.length === 1 ? format(dates[0], "PPP") : <span>{dates.length} dates selected</span>
              ) : (
                <span>Pick available dates</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="multiple"
              selected={dates}
              onSelect={setDates}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        
        {dates && dates.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {dates.sort((a, b) => a.getTime() - b.getTime()).map((date, index) => (
              <div key={index} className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-md flex items-center gap-1">
                {format(date, "MMM d")}
                <button type="button" onClick={() => setDates(dates.filter(d => d !== date))}>
                  <X className="h-3 w-3 hover:text-destructive" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEditMode ? 'Update Collaboration' : 'Create Collaboration'}
      </Button>
    </form>
  );
}