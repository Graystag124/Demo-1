import { useEffect, useState } from 'react';

interface LandingContent {
  [key: string]: {
    id: string;
    section_key: string;
    title?: string;
    subtitle?: string;
    description?: string;
    button_text?: string;
    button_link?: string;
    image_url?: string;
    display_order: number;
    is_active: boolean;
  };
}

export function useLandingContent() {
  const [content, setContent] = useState<LandingContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/landing');
        if (!response.ok) {
          throw new Error('Failed to fetch landing page content');
        }
        const data = await response.json();
        setContent(data);
      } catch (err) {
        console.error('Error fetching landing content:', err);
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  return { content, isLoading, error };
}
