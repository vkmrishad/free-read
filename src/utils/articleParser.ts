import { Article } from '../types';

// Validate only official Medium article URLs (not Medium-powered custom domains)
export const isMediumUrl = async (url: string): Promise<boolean> => {
  const mediumPattern = /^https?:\/\/(www\.)?medium\.com\/.+|^https?:\/\/medium\.com\/.+|^https?:\/\/link\.medium\.com\/.+|^https?:\/\/medium\.com\/@[^/]+\/[^/]+/;

  try {
    // Construct Freedium URL
    const freediumUrl = `https://freedium.cfd/${url}`;

    // Use CORS proxy to fetch from Freedium
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(freediumUrl)}`;

    console.log('Fetching from Freedium:', freediumUrl);

    const response = await fetch(proxyUrl);
    if (!response.ok) {
      return false;
    }

    // Get the HTML content from the response
    const data = await response.json();
    const html = data.contents;

    // Check for fallback error markers in Freedium response
    if (
      html.includes('Oppps!') ||
      html.includes('Unable to identify the link as a Medium.com article') ||
      html.includes('Your emergency transponder code') &&
      !mediumPattern.test(url)
    ) {
      return false;
    }

    // If we reach here, it means the URL is valid and Freedium was able to load the article
    return true;

  } catch {
    return false;
  }
}

// Helper function to extract text content from HTML
const extractTextFromHtml = (html: string): string => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

// Helper function to estimate reading time
const estimateReadingTime = (text: string): number => {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

// Helper function to clean and format content from Freedium
const cleanFreediumContent = (html: string): string => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Remove unwanted elements but preserve images and code blocks
  const unwantedSelectors = [
    'script', 'style', 'nav', 'header', 'footer',
    '.freedium-header', '.freedium-footer', '.freedium-nav',
    '.ad', '.ads', '.advertisement', '.promo',
    '.share-buttons', '.social-share', '.comments-section',
    '.related-articles', '.sidebar', '.widget', '.popup', '.modal',
    '.subscription-box', '.paywall', '.member-preview',
    '.hljs-copy', // Remove copy buttons from code blocks
    'button' // Remove all buttons from content
  ];

  unwantedSelectors.forEach(selector => {
    const elements = tempDiv.querySelectorAll(selector);
    elements.forEach(el => el.remove());
  });

  // Fix image sources and styling
  const images = tempDiv.querySelectorAll('img');
  images.forEach(img => {
    if (img.src && img.src.startsWith('/')) {
      img.src = `https://miro.medium.com${img.src}`;
    }

    // Remove Freedium-specific classes and add our own
    img.className = 'w-full h-auto rounded-lg my-6 mx-auto max-w-full shadow-md';

    // Wrap images in figure tags if not already wrapped
    if (img.parentElement?.tagName !== 'FIGURE' && img.parentElement?.tagName !== 'DIV') {
      const figure = document.createElement('figure');
      figure.className = 'my-8 text-center';
      img.parentNode?.insertBefore(figure, img);
      figure.appendChild(img);
    }
  });

  // Enhanced code block styling with syntax highlighting
  const codeBlocks = tempDiv.querySelectorAll('pre');
  codeBlocks.forEach(pre => {
    // Extract language from class if available
    const code = pre.querySelector('code');
    let language = 'code';
    // if (code) {
    //   const langMatch = code.className.match(/language-(\w+)/);
    //   if (langMatch) {
    //     language = langMatch[1];
    //   }
    // }

    // Create wrapper with copy functionality
    const wrapper = document.createElement('div');
    wrapper.className = 'relative group my-6';

    // Create header with language and copy button
    const header = document.createElement('div');
    header.className = 'flex items-center justify-between bg-gray-800 dark:bg-gray-900 px-4 py-2 rounded-t-lg';
    header.innerHTML = `
    <span class="text-gray-400 text-sm font-mono">${language}</span>
    <button class="copy-btn flex items-center space-x-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded transition-colors duration-200">
      <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
      </svg>
      <span>Copy</span>
    </button>
  `;

    // Style the pre element
    pre.className = 'bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 rounded-b-lg overflow-x-auto text-sm m-0';
    if (code) {
      code.className = 'text-gray-100';
    }

    // Replace the original pre element safely
    const parent = pre.parentNode;
    if (parent) {
      parent.insertBefore(wrapper, pre); // Insert wrapper before pre
      wrapper.appendChild(header);       // Add header to wrapper
      wrapper.appendChild(pre);          // Move pre into wrapper
    }
  });

  // Style inline code
  const inlineCodes = tempDiv.querySelectorAll('code:not(pre code)');
  inlineCodes.forEach(code => {
    code.className = 'bg-gray-100 dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded text-sm font-mono';
  });

  // Style blockquotes
  const blockquotes = tempDiv.querySelectorAll('blockquote');
  blockquotes.forEach(quote => {
    quote.className = 'border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 pl-6 py-4 my-6 italic text-gray-700 dark:text-gray-300 rounded-r-lg';
  });

  // Style headings
  const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
  headings.forEach(heading => {
    const level = parseInt(heading.tagName.charAt(1));
    const baseClasses = 'font-bold text-gray-900 dark:text-white mt-8 mb-4 leading-tight';

    switch (level) {
      case 1:
        heading.className = `${baseClasses} text-3xl md:text-4xl`;
        break;
      case 2:
        heading.className = `${baseClasses} text-2xl md:text-3xl`;
        break;
      case 3:
        heading.className = `${baseClasses} text-xl md:text-2xl`;
        break;
      case 4:
        heading.className = `${baseClasses} text-lg md:text-xl`;
        break;
      default:
        heading.className = `${baseClasses} text-base md:text-lg`;
    }
  });

  // Style paragraphs
  const paragraphs = tempDiv.querySelectorAll('p');
  paragraphs.forEach(p => {
    p.className = 'text-gray-700 dark:text-gray-300 leading-relaxed mb-4';
  });

  // Style lists
  const lists = tempDiv.querySelectorAll('ul, ol');
  lists.forEach(list => {
    if (list.tagName === 'UL') {
      list.className = 'list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2 pl-4';
    } else {
      list.className = 'list-decimal list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2 pl-4';
    }
  });

  // Style list items
  const listItems = tempDiv.querySelectorAll('li');
  listItems.forEach(li => {
    li.className = 'text-gray-700 dark:text-gray-300 leading-relaxed';
  });

  // Style links
  const links = tempDiv.querySelectorAll('a');
  links.forEach(link => {
    link.className = 'text-emerald-600 dark:text-emerald-400 hover:underline font-medium';
  });

  return tempDiv.innerHTML.trim();
};

export const extractArticleData = async (url: string): Promise<Article> => {
  try {
    // Construct Freedium URL
    const freediumUrl = `https://freedium.cfd/${url}`;

    // Use CORS proxy to fetch from Freedium
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(freediumUrl)}`;

    console.log('Fetching from Freedium:', freediumUrl);

    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const htmlContent = data.contents;

    if (!htmlContent || htmlContent.length < 100) {
      throw new Error('No content received from Freedium');
    }

    // Parse the HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // Extract article data from the parsed HTML using Freedium's structure
    const article = extractArticleFromFreediumDOM(doc, url);

    return article;
  } catch (error) {
    console.error('Error fetching article from Freedium:', error);

    // Fallback to mock article with explanation
    return generateFallbackArticle(url, error as Error);
  }
};

const extractArticleFromFreediumDOM = (doc: Document, originalUrl: string): Article => {
  const id = Date.now().toString();

  // Find the main content container with Freedium's specific structure
  const mainContainer = doc.querySelector('.w-full.px-4.text-xl.leading-normal') ||
    doc.querySelector('[style*="font-family:Georgia,serif"]') ||
    doc.querySelector('.main-content') ||
    doc.body;

  if (!mainContainer) {
    throw new Error('Could not find main content container');
  }

  // Extract title from h1 within the container
  let title = '';
  const titleElement = mainContainer.querySelector('h1') || doc.querySelector('h1');
  if (titleElement && titleElement.textContent?.trim()) {
    title = titleElement.textContent.trim();
  }

  // Extract subtitle/description from h2 (the missing part you mentioned)
  let subtitle = '';
  const subtitleElement = mainContainer.querySelector('h2') || doc.querySelector('h2');
  if (subtitleElement && subtitleElement.textContent?.trim()) {
    subtitle = subtitleElement.textContent.trim();
    // This is the missing subtitle like "Rust is known for two things: memory safety without a garbage collector, and making grown developers cry with lifetimes."
  }

  // Extract author information from the author card
  let author = 'Unknown Author';
  let authorHandle = '';
  let authorAvatar = '';
  let read = '';

  // // Look for author information in the gray container
  // const authorContainer = mainContainer.querySelector('.bg-gray-100.border.border-gray-300') ||
  //                        mainContainer.querySelector('[class*="bg-gray-100"]');

  // if (authorContainer) {
  //   // Extract author name
  //   const authorNameElement = authorContainer.querySelector('a[href*="@"]') ||
  //                            authorContainer.querySelector('.font-semibold') ||
  //                            authorContainer.querySelector('.block.font-semibold');
  //   if (authorNameElement && authorNameElement.textContent?.trim()) {
  //     author = authorNameElement.textContent.trim();

  //     // Extract handle from href
  //     if (authorNameElement.tagName === 'A') {
  //       const href = (authorNameElement as HTMLAnchorElement).href;
  //       const handleMatch = href.match(/@([^/?]+)/);
  //       if (handleMatch) {
  //         authorHandle = handleMatch[1];
  //       }
  //     }
  //   }

  // Look for author information in the gray container
  const authorContainer = mainContainer.querySelector('.flex-grow') ||
    mainContainer.querySelector('[class*="bg-gray-100"]');

  if (authorContainer) {
    // Extract author name
    const authorNameElement = authorContainer.querySelector('a[href*="@"]');
    if (authorNameElement && authorNameElement.textContent?.trim()) {
      author = authorNameElement.textContent.trim();

      // Extract handle from href
      const href = (authorNameElement as HTMLAnchorElement).href;
      const handleMatch = href.match(/@([^/?]+)/);
      if (handleMatch) {
        authorHandle = handleMatch[1];
      }
    }

    // Extract read from the metadata section
    const metadataSection = authorContainer.querySelector('.flex.flex-wrap.items-center') ||
      authorContainer.querySelector('.text-sm.text-gray-500');
    if (metadataSection) {
      const spans = metadataSection.querySelectorAll('span');
      spans.forEach(span => {
        const text = span.textContent?.trim();
        if (text && text !== '·' && !text.includes('June') && !text.includes('Free:') && !text.includes('Updated:')) {
          if (!read && text.length > 2 && text.length < 50) {
            read = text;
          }
        }
      });
    }
  }

  const authorImageContainer = mainContainer.querySelector('.bg-gray-100.border.border-gray-300') ||
    mainContainer.querySelector('[class*="bg-gray-100"]');

  if (authorImageContainer) {
    // Extract author avatar
    const avatarElement = authorImageContainer.querySelector('img') as HTMLImageElement;
    if (avatarElement && avatarElement.src) {
      authorAvatar = avatarElement.src;
    }

  }


  // Extract dates and other metadata with proper formatting
  let publishedAt = new Date().toISOString();
  let updatedAt = '';
  let isPaid = false;

  // Look for date information in the exact format you specified
  const dateRegex = /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}/g;
  const updatedRegex = /Updated:\s*(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}/g;

  const htmlText = mainContainer.innerHTML;
  const dateMatches = htmlText.match(dateRegex);
  const updatedMatches = htmlText.match(updatedRegex);

  if (dateMatches && dateMatches.length > 0) {
    const publishDate = new Date(dateMatches[0]);
    if (!isNaN(publishDate.getTime())) {
      publishedAt = publishDate.toISOString();
    }
  }

  if (updatedMatches && updatedMatches.length > 0) {
    const updateDateStr = updatedMatches[0].replace('Updated: ', '');
    const updateDate = new Date(updateDateStr);
    if (!isNaN(updateDate.getTime())) {
      updatedAt = updateDate.toISOString();
    }
  }

  // Check for paid content indicator (Free: No)
  const paidIndicator = mainContainer.querySelector('.text-yellow-500') ||
    mainContainer.querySelector('[class*="text-yellow"]');
  if (paidIndicator && paidIndicator.textContent?.includes('Free: No')) {
    isPaid = true;
  }

  // Extract featured image
  let image = '';
  const featuredImageElement = mainContainer.querySelector('img[alt="Preview image"]') ||
    mainContainer.querySelector('img:first-of-type') as HTMLImageElement;
  if (featuredImageElement && featuredImageElement.src && !featuredImageElement.src.includes('avatar')) {
    image = featuredImageElement.src;
  }

  // Extract main content from the .main-content div or similar
  let content = '';
  const contentContainer = mainContainer.querySelector('.main-content') ||
    mainContainer.querySelector('.mt-8') ||
    mainContainer;

  if (contentContainer) {
    // Clone the container to avoid modifying the original
    const contentClone = contentContainer.cloneNode(true) as Element;

    // Remove author card and other metadata sections
    const authorCards = contentClone.querySelectorAll('.bg-gray-100.border, .m-2.mt-5');
    authorCards.forEach(card => card.remove());

    // Remove the title and subtitle as they're handled separately
    const titles = contentClone.querySelectorAll('h1, h2:first-of-type');
    titles.forEach((title, index) => {
      if (index < 2) title.remove(); // Remove first h1 and h2
    });

    // Remove "Go to original" links
    const originalLinks = contentClone.querySelectorAll('a[href*="#bypass"]');
    originalLinks.forEach(link => link.parentElement?.remove());

    // Remove tag sections at the end
    const tagSections = contentClone.querySelectorAll('.flex.flex-wrap.gap-2');
    tagSections.forEach(section => section.remove());

    content = cleanFreediumContent(contentClone.innerHTML);
  }

  // Extract tags from the tag section
  const tags: string[] = [];
  const tagContainer = mainContainer.querySelector('.flex.flex-wrap.gap-2');
  if (tagContainer) {
    const tagElements = tagContainer.querySelectorAll('span');
    tagElements.forEach(tagElement => {
      const tagText = tagElement.textContent?.trim();
      if (tagText && tagText.startsWith('#')) {
        tags.push(tagText.substring(1)); // Remove the # prefix
      }
    });
  }

  // Fallback tags if none found
  if (tags.length === 0) {
    tags.push('Medium', 'Article');
  }

  // Generate excerpt from subtitle or content
  const textContent = extractTextFromHtml(content);
  const excerpt = subtitle || textContent.slice(0, 250) + (textContent.length > 250 ? '...' : '');

  // Estimate reading time
  const readingTime = estimateReadingTime(textContent);

  // Clean up title if it's still empty or too short
  if (!title || title.length < 10) {
    const urlParts = originalUrl.split('/');
    const slug = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
    title = slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .slice(0, 100) || 'Medium Article';
  }

  return {
    id,
    url: originalUrl,
    title,
    author,
    authorHandle: authorHandle || undefined,
    authorAvatar: authorAvatar || undefined,
    publishedAt,
    updatedAt: updatedAt || undefined,
    readingTime: readingTime || 5,
    content: content || '<p>Content could not be extracted from this article.</p>',
    excerpt,
    tags: [...new Set(tags)].slice(0, 8), // Remove duplicates and limit to 8 tags
    addedAt: new Date().toISOString(),
    image: image || undefined,
    isPaid,
    read: read || undefined,
    claps: undefined,
    responses: undefined
  };
};

const generateFallbackArticle = (url: string, error: Error): Article => {
  const id = Date.now().toString();

  // Extract some info from the URL itself
  const urlParts = url.split('/');
  const slug = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
  const authorMatch = url.match(/@([^/]+)/);
  const author = authorMatch ? authorMatch[1].replace(/[^a-zA-Z0-9]/g, ' ') : 'Medium Author';
  const authorHandle = authorMatch ? authorMatch[1] : undefined;

  // Generate title from slug
  const title = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .slice(0, 100) || 'Medium Article';

  const content = `
    <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 my-8">
      <h3 class="text-red-700 dark:text-red-400 font-bold text-lg mb-3">Content Extraction Failed</h3>
      <p class="text-red-600 dark:text-red-300 mb-4"><strong>We encountered an issue while trying to fetch this article from Freedium.</strong></p>
      <p class="text-red-600 dark:text-red-300 mb-4"><strong>Error:</strong> ${error.message}</p>
    </div>
    
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">What happened?</h2>
    <p class="text-gray-700 dark:text-gray-300 mb-4">We tried to fetch the article content using Freedium (freedium.cfd), which is a service that provides free access to Medium articles. However, the request failed.</p>
    
    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Possible reasons:</h3>
    <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
      <li><strong>Network issues:</strong> Temporary connectivity problems</li>
      <li><strong>Freedium service unavailable:</strong> The service might be temporarily down</li>
      <li><strong>Article not accessible:</strong> The specific article might not be available through Freedium</li>
      <li><strong>CORS restrictions:</strong> Browser security policies blocking the request</li>
    </ul>
    
    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">What you can do:</h3>
    <ol class="list-decimal list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
      <li><strong>Try again:</strong> The issue might be temporary</li>
      <li><strong>Visit Freedium directly:</strong> Go to <a href="https://freedium.cfd/${url}" target="_blank" rel="noopener noreferrer" class="text-emerald-600 dark:text-emerald-400 hover:underline">https://freedium.cfd/${url}</a></li>
      <li><strong>Check the original article:</strong> <a href="${url}" target="_blank" rel="noopener noreferrer" class="text-emerald-600 dark:text-emerald-400 hover:underline">View on Medium</a></li>
    </ol>
    
    <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 my-6">
      <p class="text-blue-700 dark:text-blue-300"><strong>💡 Tip:</strong> Freedium is an excellent service for accessing Medium articles without paywalls. If this doesn't work, you can always visit freedium.cfd directly and paste the Medium URL there.</p>
    </div>
  `;

  return {
    id,
    url,
    title: `${title} (Content Unavailable)`,
    author,
    authorHandle,
    publishedAt: new Date().toISOString(),
    readingTime: 2,
    content,
    excerpt: `Failed to fetch content for this article. Error: ${error.message}. You can try visiting the article directly on Freedium or Medium.`,
    tags: ['Medium', 'Error', 'Unavailable'],
    addedAt: new Date().toISOString(),
    image: 'https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    isPaid: false
  };
};

export const formatPublishDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
};