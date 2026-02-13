






import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

async function getLinkPreview(url: string): Promise<{ title: string; description: string; image: string } | null> {
  try {
    // Replace with actual fetch_url_content invocation
    const response = await (async () => {
      try {
        const fetchResponse = await fetch(url);
        const text = await fetchResponse.text();
        return { content: text };
      } catch (e) {
        console.error("Error fetching URL", e);
        return { content: null };
      }
    })();
    const html = response.content;

    if (!html) {
      return null;
    }

    // Extract title, description, and image from meta tags
    const title = extractMetaTagContent(html, "og:title") || extractMetaTagContent(html, "title") || "";
    const description = extractMetaTagContent(html, "og:description") || extractMetaTagContent(html, "description") || "";
    const image = extractMetaTagContent(html, "og:image") || "";

    return { title, description, image };
  } catch (error) {
    console.error("Error fetching link preview:", error);
    return null;
  }
}

function extractMetaTagContent(html: string, property: string): string | null {
  const regex = new RegExp(`<meta property="${property}" content="(.*?)" />`, "i");
  const match = regex.exec(html);
  return match ? match[1] : null;
}

export { getLinkPreview };

