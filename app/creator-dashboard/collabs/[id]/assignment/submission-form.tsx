"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitAssignment } from "./actions";
import { Loader2, CheckCircle, XCircle, Link as LinkIcon, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ContentType = 'post' | 'story' | 'reel' | 'draft';
type ContentStatus = 'pending' | 'uploading' | 'uploaded' | 'error';

interface ContentItem {
  id: string; // Using string for dynamic IDs
  type: ContentType;
  status: ContentStatus;
  url: string;
  caption: string;
  file: File | null;
  error?: string;
  isLink: boolean;
  linkUrl: string;
}

interface SubmissionFormProps {
  collaborationId: string;
  creatorId: string;
  postsRequired: number;
  storiesRequired: number;
  reelsRequired: number;
  existingSubmissions: Array<{ 
    id: string; 
    type: ContentType; 
    url: string; 
    status: string;
    submitted_at: string;
  }>;
}

export function SubmissionForm({ 
  collaborationId, 
  creatorId, 
  postsRequired = 0,
  storiesRequired = 0,
  reelsRequired = 0,
  existingSubmissions = [] 
}: SubmissionFormProps) {
  const { toast } = useToast();

  const [contentItems, setContentItems] = useState<ContentItem[]>(() => {
    // 1. Setup Required Items (Posts, Stories, Reels)
    const createRequiredItems = (type: ContentType, count: number) => {
      const existing = existingSubmissions.filter(s => s.type === type);
      const remaining = Math.max(0, count - existing.length);
      
      return [
        ...existing.map((sub) => ({
          id: sub.id,
          type,
          status: 'uploaded' as ContentStatus,
          url: sub.url,
          caption: '',
          file: null,
          isLink: sub.url.startsWith('http'),
          linkUrl: sub.url
        })),
        ...Array.from({ length: remaining }, (_, i) => ({
          id: `${type}-req-${i}`,
          type,
          status: 'pending' as ContentStatus,
          url: '',
          caption: '',
          file: null,
          isLink: false,
          linkUrl: ''
        }))
      ];
    };

    // 2. Setup Unlimited Drafts
    const existingDrafts = existingSubmissions.filter(s => s.type === 'draft');
    const draftItems: ContentItem[] = [
      ...existingDrafts.map((sub) => ({
        id: sub.id,
        type: 'draft' as ContentType,
        status: 'uploaded' as ContentStatus,
        url: sub.url,
        caption: '',
        file: null,
        isLink: sub.url.startsWith('http'),
        linkUrl: sub.url
      })),
      // Always add one empty slot for a new draft
      {
        id: `draft-new-${Date.now()}`,
        type: 'draft' as ContentType,
        status: 'pending' as ContentStatus,
        url: '',
        caption: '',
        file: null,
        isLink: false,
        linkUrl: ''
      }
    ];

    return [
      ...createRequiredItems('post', postsRequired),
      ...createRequiredItems('story', storiesRequired),
      ...createRequiredItems('reel', reelsRequired),
      ...draftItems
    ];
  });

  const getContentItems = (type: ContentType) => 
    contentItems.filter(item => item.type === type);

  const getCompletedCount = (type: ContentType) => 
    contentItems.filter(item => item.type === type && item.status === 'uploaded').length;

  const handleFileChange = (id: string, file: File | null) => {
    setContentItems(prev => prev.map(item => 
      item.id === id ? { ...item, file, status: 'pending', isLink: false } : item
    ));
  };

  const handleLinkToggle = (id: string) => {
    setContentItems(prev => prev.map(item => 
      item.id === id ? { ...item, isLink: !item.isLink, file: null, url: '' } : item
    ));
  };

  const handleLinkChange = (id: string, url: string) => {
    setContentItems(prev => prev.map(item => 
      item.id === id ? { ...item, linkUrl: url, status: 'pending' } : item
    ));
  };

  const handleCaptionChange = (id: string, caption: string) => {
    setContentItems(prev => prev.map(item => 
      item.id === id ? { ...item, caption } : item
    ));
  };

  const handleSubmit = async (item: ContentItem) => {
    if ((!item.file && !item.linkUrl) || item.status === 'uploading') return;

    try {
      setContentItems(prev => prev.map(i => 
        i.id === item.id ? { ...i, status: 'uploading' } : i
      ));

      let publicUrl = '';
      if (item.isLink) {
        publicUrl = item.linkUrl;
      } else if (item.file) {
        const fileExt = item.file.name.split('.').pop();
        const fileName = `${item.type}_${Date.now()}.${fileExt}`;
        const filePath = `${collaborationId}/${creatorId}/${fileName}`;

        const { error: uploadError } = await createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        ).storage.from('submissions').upload(filePath, item.file);

        if (uploadError) throw uploadError;

        const { data } = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        ).storage.from('submissions').getPublicUrl(filePath);

        publicUrl = data.publicUrl;
      }

      const submissionData = new FormData();
      submissionData.set('collaboration_id', collaborationId);
      submissionData.set('creator_id', creatorId);
      submissionData.set('type', item.type);
      submissionData.set('caption', item.caption);
      submissionData.set('url', publicUrl);

      await submitAssignment(submissionData);

      setContentItems(prev => {
        const updated = prev.map(i => 
          i.id === item.id ? { ...i, status: 'uploaded' as ContentStatus, url: publicUrl, linkUrl: publicUrl } : i
        );
        
        // If it was a draft, add a NEW empty slot immediately
        if (item.type === 'draft') {
          updated.push({
            id: `draft-new-${Date.now()}`,
            type: 'draft',
            status: 'pending',
            url: '',
            caption: '',
            file: null,
            isLink: false,
            linkUrl: ''
          });
        }
        return updated;
      });

      toast({ title: 'Success', description: `${item.type} submitted!` });
    } catch (error) {
      setContentItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'error' } : i));
      toast({ title: 'Error', description: 'Failed to submit.', variant: 'destructive' });
    }
  };

  const renderContentSection = (type: ContentType, count: number) => {
    const items = getContentItems(type);
    const isDraft = type === 'draft';
    
    return (
      <div className="space-y-4">
        <h3 className="font-medium capitalize">
          {isDraft ? 'Draft Approvals' : `${type}s`} ({getCompletedCount(type)}{!isDraft ? `/${count}` : ''})
        </h3>
        {items.map((item, index) => (
          <Card key={item.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-medium capitalize">{type} {index + 1}</h4>
              <div className="flex items-center gap-2">
                {item.status === 'uploading' && <Loader2 className="h-4 w-4 animate-spin" />}
                {item.status === 'uploaded' && <CheckCircle className="h-4 w-4 text-green-500" />}
                {item.status === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                <span className="text-sm text-muted-foreground capitalize">{item.status}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Button
                  type="button"
                  variant={!item.isLink ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleLinkToggle(item.id)}
                  disabled={item.status === 'uploading' || item.status === 'uploaded'}
                >
                  <Upload className="h-4 w-4 mr-2" /> Upload
                </Button>
                <Button
                  type="button"
                  variant={item.isLink ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleLinkToggle(item.id)}
                  disabled={item.status === 'uploading' || item.status === 'uploaded'}
                >
                  <LinkIcon className="h-4 w-4 mr-2" /> Link
                </Button>
              </div>

              {item.isLink ? (
                <Input
                  type="url"
                  placeholder="https://..."
                  value={item.linkUrl}
                  onChange={(e) => handleLinkChange(item.id, e.target.value)}
                  disabled={item.status === 'uploading' || item.status === 'uploaded'}
                />
              ) : (
                <Input
                  type="file"
                  accept={type === 'reel' || type === 'draft' ? 'video/*,image/*' : 'image/*'}
                  disabled={item.status === 'uploading' || item.status === 'uploaded'}
                  onChange={(e) => handleFileChange(item.id, e.target.files?.[0] || null)}
                />
              )}

              <Textarea
                value={item.caption}
                onChange={(e) => handleCaptionChange(item.id, e.target.value)}
                placeholder={isDraft ? "Draft notes..." : "Caption..."}
                disabled={item.status === 'uploading' || item.status === 'uploaded'}
              />

              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={() => handleSubmit(item)}
                  disabled={item.status === 'uploading' || item.status === 'uploaded' || (!item.file && !item.linkUrl)}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {item.status === 'uploading' ? 'Submitting...' : item.status === 'uploaded' ? 'Submitted' : `Submit ${type}`}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const activeTabs = [
    { type: 'post', count: postsRequired, label: 'Posts' },
    { type: 'story', count: storiesRequired, label: 'Stories' },
    { type: 'reel', count: reelsRequired, label: 'Reels' },
    { type: 'draft', count: 0, label: 'Drafts' }
  ].filter(tab => tab.type === 'draft' || tab.count > 0);

  return (
    <Tabs defaultValue={activeTabs[0]?.type} className="space-y-4">
      <TabsList className={`grid w-full grid-cols-${activeTabs.length}`}>
        {activeTabs.map(tab => (
          <TabsTrigger key={tab.type} value={tab.type}>
            {tab.label} ({getCompletedCount(tab.type as ContentType)}{tab.type !== 'draft' ? `/${tab.count}` : ''})
          </TabsTrigger>
        ))}
      </TabsList>
      {activeTabs.map(tab => (
        <TabsContent key={tab.type} value={tab.type}>
          {renderContentSection(tab.type as ContentType, tab.count)}
        </TabsContent>
      ))}
    </Tabs>
  );
}