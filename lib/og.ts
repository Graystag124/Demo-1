// Check if URL is from Instagram
const isInstagramUrl = (url: string) => {
  try {
    const { hostname } = new URL(url);
    return hostname.includes('instagram.com');
  } catch {
    return false;
  }
};

// Extract shortcode from Instagram URL
const getInstagramShortcode = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    
    // Handle different Instagram URL formats
    if (url.includes('/reel/') || url.includes('/p/') || url.includes('/tv/')) {
      const reelIndex = pathParts.findIndex(part => ['reel', 'p', 'tv'].includes(part));
      if (reelIndex !== -1 && pathParts[reelIndex + 1]) {
        return pathParts[reelIndex + 1].split('?')[0]; // Remove any query params
      }
    }
    
    return null;
  } catch {
    return null;
  }
};

export async function fetchOpenGraph(targetUrl: string) {
  try {
    // Special handling for Instagram
    if (isInstagramUrl(targetUrl)) {
      const shortcode = getInstagramShortcode(targetUrl);
      
      if (shortcode) {
        try {
          // Try to get basic media info first
          const mediaUrl = `https://www.instagram.com/p/${shortcode}/?__a=1&__d=dis`;
          const response = await fetch(mediaUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            const media = data.graphql?.shortcode_media;
            
            if (media) {
              const metrics = {
                likes: media.edge_media_preview_like?.count || 0,
                comments: media.edge_media_to_comment?.count || 0,
                is_video: media.is_video || false,
                timestamp: media.taken_at_timestamp ? new Date(media.taken_at_timestamp * 1000).toLocaleDateString() : null
              };
              
              return {
                title: 'Instagram Post',
                description: media.edge_media_to_caption?.edges?.[0]?.node?.text || null,
                image: media.display_url || `https://www.instagram.com/p/${shortcode}/media/?size=l`,
                url: targetUrl,
                metrics: {
                  likes: metrics.likes,
                  comments: metrics.comments,
                  engagement: ((metrics.likes + metrics.comments) / 1000).toFixed(1) + 'K',
                  posted: metrics.timestamp,
                  type: metrics.is_video ? 'video' : 'image'
                }
              };
            }
          }
        } catch (error) {
          console.error('Error fetching Instagram data:', error);
          // Fall through to basic OG data
        }
        
        // Fallback to just the thumbnail if detailed fetch fails
        const thumbnailUrl = `https://www.instagram.com/p/${shortcode}/media/?size=l`;
        return {
          title: 'Instagram Post',
          description: null,
          image: thumbnailUrl,
          url: targetUrl,
          metrics: null
        };
      }
      
      // Fallback to oEmbed if direct thumbnail fails
      try {
        const oembedUrl = `https://graph.facebook.com/v17.0/instagram_oembed?url=${encodeURIComponent(targetUrl)}&access_token=${process.env.INSTAGRAM_ACCESS_TOKEN || ''}`;
        const oembedRes = await fetch(oembedUrl);
        
        if (oembedRes.ok) {
          const oembed = await oembedRes.json();
          return {
            title: 'Instagram Post',
            description: oembed.title || null,
            image: oembed.thumbnail_url || null,
            url: targetUrl,
          };
        }
      } catch (error) {
        console.error('Instagram oEmbed failed, falling back to OpenGraph', error);
      }
    }

    // Fallback to standard OpenGraph for non-Instagram or if Instagram fetch fails
    let res;
    try {
      res = await fetch(targetUrl, {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        },
        redirect: 'follow'
      });
    } catch (fetchError) {
      console.error(`Error fetching URL: ${targetUrl}`, fetchError);
      return { 
        title: targetUrl, 
        description: null, 
        image: null, 
        url: targetUrl 
      };
    }

    if (!res.ok) {
      return { title: targetUrl, description: null, image: null, url: targetUrl };
    }

    const html = await res.text();

    // Extract OpenGraph metadata
    const getMeta = (property: string) => {
      const regex = new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i');
      return html.match(regex)?.[1];
    };

    const title = getMeta('og:title') || 
                 html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ||
                 'Social Media Post';

    const description = getMeta('og:description') || 
                       html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
                       null;

    const image = getMeta('og:image') || 
                 html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
                 html.match(/<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i)?.[1] ||
                 null;

    return {
      title: title.trim(),
      description: description?.trim() || null,
      image: image || null,
      url: targetUrl,
    };
  } catch (err) {
    console.error('Error in fetchOpenGraph:', err);
    return { 
      title: targetUrl, 
      description: null, 
      image: null, 
      url: targetUrl 
    };
  }
}
