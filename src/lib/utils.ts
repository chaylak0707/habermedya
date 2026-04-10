export const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export const stripHtml = (html: string) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
};

import client from './turso';

export const fetchWithCache = async (key: string, tableName: string) => {
  const cached = localStorage.getItem(key);
  const cachedTime = localStorage.getItem(`${key}_time`);
  const now = Date.now();

  // If cache exists and is less than 5 minutes old, use it
  if (cached && cachedTime && (now - parseInt(cachedTime)) < 300000) {
    return JSON.parse(cached);
  }

  try {
    const result = await client.execute(`SELECT * FROM ${tableName}`);
    const data = result.rows;
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem(`${key}_time`, now.toString());
    return data;
  } catch (error) {
    console.error(`Fetch failed for ${key}, trying cache:`, error);
    if (cached) {
      return JSON.parse(cached);
    }
    throw error;
  }
};


export const clearCache = (key: string) => {
  localStorage.removeItem(key);
  localStorage.removeItem(`${key}_time`);
};

export const formatTurkishContent = (html: string) => {
  if (!html) return "";

  // 1. Fix common character encoding issues
  let cleaned = html
    .replace(/&shy;/g, '') // Remove soft hyphens
    .replace(/\u00AD/g, '') // Remove soft hyphen character
    .replace(/\u200B/g, '') // Remove zero-width space
    .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces with normal spaces
    .replace(/Ã§/g, 'ç').replace(/Ã‡/g, 'Ç')
    .replace(/ÄŸ/g, 'ğ').replace(/Äž/g, 'Ğ')
    .replace(/Ä±/g, 'ı').replace(/Ä°/g, 'İ')
    .replace(/Ã¶/g, 'ö').replace(/Ã–/g, 'Ö')
    .replace(/ÅŸ/g, 'ş').replace(/Åž/g, 'Ş')
    .replace(/Ã¼/g, 'ü').replace(/Ãœ/g, 'Ü')
    .replace(/â€/g, '"').replace(/â€˜/g, "'").replace(/â€™/g, "'");

  // 2. Convert double <br> to paragraph breaks if they are used for spacing
  cleaned = cleaned.replace(/(<br\s*\/?>\s*){2,}/gi, '</p><p>');

  const parser = new DOMParser();
  const doc = parser.parseFromString(cleaned, 'text/html');

  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      let text = node.textContent || "";
      
      // Fix spacing around punctuation
      // No space before punctuation
      text = text.replace(/\s+([.,!?;:])/g, '$1'); 
      
      // Space after punctuation (if not followed by a digit or another punctuation)
      text = text.replace(/([.,!?;:])(?=[^\s\d.,!?;:])/g, '$1 ');
      
      // Fix Turkish specific: "soru eki" (mı, mi, mu, mü) should be separate but often pasted together
      // This is complex to do perfectly with regex, but we can fix common cases
      // text = text.replace(/(\w)(m[ıiuü])(\s|[.,!?;:])/gi, '$1 $2$3'); 
      
      // Remove multiple spaces
      text = text.replace(/\s\s+/g, ' ');
      
      // Remove unnecessary line breaks within text (common in PDF pastes)
      text = text.replace(/\n/g, ' ');
      
      node.textContent = text.trim();
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      
      // If it's a paragraph, check for excessive length
      if (el.tagName === 'P') {
        const text = el.textContent || "";
        // Only split if it's mostly text (no complex children like images or videos)
        const hasComplexChildren = Array.from(el.children).some(child => 
          !['BR', 'SPAN', 'B', 'I', 'STRONG', 'EM', 'A'].includes(child.tagName)
        );

        if (text.length > 800 && !hasComplexChildren) {
          // Split long paragraph into smaller ones at sentence ends
          // Improved sentence splitting regex
          const sentences = text.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) || [text];
          const newParas: string[] = [];
          let current = "";
          
          sentences.forEach(s => {
            if ((current + s).length > 500) {
              if (current) newParas.push(current.trim());
              current = s;
            } else {
              current += s;
            }
          });
          if (current) newParas.push(current.trim());
          
          if (newParas.length > 1) {
            const fragment = doc.createDocumentFragment();
            newParas.forEach(np => {
              const newP = doc.createElement('p');
              newP.textContent = np;
              fragment.appendChild(newP);
            });
            el.parentNode?.replaceChild(fragment, el);
            return; // Skip processing children of the replaced node
          }
        }
      }
      
      Array.from(el.childNodes).forEach(walk);
    }
  };

  walk(doc.body);
  
  // Final cleanup of empty tags and excessive breaks
  let finalHtml = doc.body.innerHTML;
  finalHtml = finalHtml
    .replace(/<p>\s*<\/p>/gi, '')
    .replace(/<p>&nbsp;<\/p>/gi, '')
    .replace(/(<p>)+/gi, '<p>')
    .replace(/(<\/p>)+/gi, '</p>')
    .replace(/<p>\s+/g, '<p>')
    .replace(/\s+<\/p>/g, '</p>');
  
  return finalHtml;
};

export const normalizeImageUrl = (url: string): string => {
  if (!url) return "https://picsum.photos/seed/plumbing/1200/600";
  
  // If it's a Firebase Storage URL, use our proxy to avoid CORS issues
  if (url.includes('firebasestorage.googleapis.com')) {
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  }

  // If it's already a full URL (http/https), return it
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // If it's a relative path starting with /uploads/ or uploads/
  if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
    const cleanUrl = url.startsWith('/') ? url : '/' + url;
    
    // If it's a legacy path that needs Firebase
    if (url.includes('/news/') || url.includes('/ads/')) {
       const bucket = "gen-lang-client-0675548272.firebasestorage.app";
       const path = url.startsWith('/') ? url.substring(1) : url;
       const firebaseURL = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(path)}?alt=media`;
       return `/api/proxy-image?url=${encodeURIComponent(firebaseURL)}`;
    }

    // Otherwise it's a local file served by our express server
    return cleanUrl;
  }
  
  return url;
};
