'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";

type PreviewData = {
  title: string;
  description: string | null;
  image: string | null;
  url: string;
  metrics?: {
    likes?: number;
    comments?: number;
    engagement?: string;
    posted?: string;
    type?: string;
  } | null;
} | null;

// Extract Instagram shortcode from URL
const getInstagramShortcode = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    
    // Handle different Instagram URL formats
    if (url.includes('/reel/') || url.includes('/p/') || url.includes('/tv/')) {
      const reelIndex = pathParts.findIndex(part => ['reel', 'p', 'tv'].includes(part));
      if (reelIndex !== -1 && pathParts[reelIndex + 1]) {
        return pathParts[reelIndex + 1].split('?')[0];
      }
    }
    
    return null;
  } catch {
    return null;
  }
};

export function LinkPreview({ url, type = 'instagram' }: { url: string; type?: 'instagram' | 'other' }) {
  const [preview, setPreview] = useState<PreviewData>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFallback, setShowFallback] = useState(false);
  
  // Format number to K or M
  const formatNumber = (num: number | string | undefined): string => {
    if (typeof num === 'string') return num;
    if (!num && num !== 0) return 'N/A';
    
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  useEffect(() => {
    const fetchPreview = async () => {
      if (!url) {
        setError('No URL provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // For Instagram, we'll let the server handle the preview fetching
        // to avoid CORS issues and rate limiting
        
        // Use our API to fetch the preview
        const response = await fetch(`/api/og-preview?url=${encodeURIComponent(url)}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data || data.error) {
          throw new Error(data?.error || 'No preview data received');
        }

        setPreview({
          title: data.title || (type === 'instagram' ? 'Instagram Post' : 'Link Preview'),
          description: data.description,
          image: data.image,
          url: data.url || url
        });
      } catch (err) {
        console.error('Error fetching preview:', err);
        setError('Could not load preview');
        setShowFallback(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [url, type]);

  // If we're showing the fallback, just show a simple link
  if (showFallback) {
    return (
      <div className="mt-2">
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline break-all"
        >
          {url}
        </a>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-32 bg-muted/20 rounded-md flex items-center justify-center my-2">
        <div className="animate-pulse text-muted-foreground text-sm">Loading preview...</div>
      </div>
    );
  }

  if (error || !preview) {
    return (
      <div className="mt-2">
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline break-all"
        >
          {url}
        </a>
      </div>
    );
  }

  // Helper component for metric items
  function MetricItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
      <div className="flex flex-col items-center">
        <div className="text-gray-600 mb-1">
          {icon}
        </div>
        <div className="font-semibold text-sm">{value}</div>
        <div className="text-xs text-gray-500 mt-0.5">{label}</div>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <Card className="overflow-hidden border">
        {preview.image && (
          <div className="relative aspect-[4/3] bg-muted overflow-hidden">
            <img 
              src={preview.image} 
              alt={preview.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // If image fails to load, show the fallback
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
                setShowFallback(true);
              }}
            />
          </div>
        )}
        <CardContent className="p-3">
          <div className="space-y-1">
            <h4 className="font-medium text-sm line-clamp-1">Instagram</h4>
            <a 
              href={preview.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline inline-block mt-1"
            >
              View on Instagram
            </a>
            
            {/* Metrics in the grey area */}
            {preview.metrics && (
              <div className="mt-3 p-3 bg-gray-100 rounded-md">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <MetricItem 
                    icon={<Heart className="w-4 h-4 mx-auto" />}
                    label="Likes"
                    value={formatNumber(preview.metrics.likes)}
                  />
                  <MetricItem 
                    icon={<MessageSquare className="w-4 h-4 mx-auto" />}
                    label="Comments"
                    value={formatNumber(preview.metrics.comments)}
                  />
                  <MetricItem 
                    icon={<Eye className="w-4 h-4 mx-auto" />}
                    label="Reach"
                    value={formatNumber(preview.metrics.reach)}
                  />
                </div>
                
                {/* Engagement Rate */}
                {preview.metrics.engagement && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
                      <span>Engagement Rate</span>
                      <span className="font-medium">{preview.metrics.engagement}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-blue-500 h-1.5 rounded-full" 
                        style={{ 
                          width: `${Math.min(Number(preview.metrics.engagement?.replace('%', '')) || 0, 100)}%` 
                        }} 
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
