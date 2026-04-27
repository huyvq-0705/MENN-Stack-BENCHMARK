/**
 * postUtils.js — Shared utility library for all rendering pages (CSR, SSR, ISR, SSG).
 * 
 * These helpers are used across all 4 homepage variants to ensure a fair,
 * equal JavaScript bundle size for performance benchmarking.
 * 
 * All functions are pure and side-effect free.
 */

// ─── Reading Time ──────────────────────────────────────────────────────────────

/**
 * Estimates reading time for a given HTML or plain-text string.
 * Strips HTML tags before counting words.
 * Average adult reading speed: 200 words per minute.
 *
 * @param {string} content - Raw HTML or plain text content of a blog post.
 * @param {number} [wpm=200] - Words per minute reading speed.
 * @returns {{ minutes: number, text: string }} Estimated reading time.
 */
export function calcReadingTime(content = '', wpm = 200) {
  // Strip HTML tags to count only visible words
  const plainText = content.replace(/<[^>]*>/g, ' ');
  // Collapse whitespace and split into word tokens
  const words = plainText.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / wpm));
  return {
    minutes,
    text: minutes === 1 ? '1 phút đọc' : `${minutes} phút đọc`,
  };
}

// ─── Excerpt ───────────────────────────────────────────────────────────────────

/**
 * Truncates a string to a given character limit, appending an ellipsis
 * only if the original string exceeded the limit.
 * Strips HTML before truncating so tag characters aren't counted.
 *
 * @param {string} text - Raw text or HTML excerpt.
 * @param {number} [limit=120] - Maximum character count.
 * @returns {string} Truncated plain-text excerpt.
 */
export function truncateExcerpt(text = '', limit = 120) {
  const plain = text.replace(/<[^>]*>/g, '');
  if (plain.length <= limit) return plain;
  // Cut at last space before the limit to avoid mid-word cuts
  const trimmed = plain.slice(0, limit);
  const lastSpace = trimmed.lastIndexOf(' ');
  return (lastSpace > 0 ? trimmed.slice(0, lastSpace) : trimmed) + '…';
}

// ─── Date Formatting ───────────────────────────────────────────────────────────

/**
 * Formats an ISO date string or Date object into a human-readable
 * Vietnamese-locale date string: "DD/MM/YYYY".
 *
 * @param {string | Date} dateInput - Date to format.
 * @returns {string} Formatted date string, or "—" if invalid.
 */
export function formatDate(dateInput) {
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

/**
 * Returns a relative time string (e.g., "3 ngày trước") for a given date.
 * Falls back to a formatted date string for dates older than 30 days.
 *
 * @param {string | Date} dateInput - Date to compare against now.
 * @returns {string} Relative or absolute date string.
 */
export function timeAgo(dateInput) {
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return formatDate(dateInput);
    const diffMs = Date.now() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 60) return 'Vừa xong';
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHr < 24) return `${diffHr} giờ trước`;
    if (diffDay < 30) return `${diffDay} ngày trước`;
    return formatDate(dateInput);
  } catch {
    return '—';
  }
}

// ─── Slug ──────────────────────────────────────────────────────────────────────

/**
 * Validates that a slug string is URL-safe:
 * only lowercase letters, numbers, and hyphens.
 *
 * @param {string} slug - Slug to validate.
 * @returns {boolean} True if the slug is valid.
 */
export function isValidSlug(slug = '') {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Converts a Vietnamese or general UTF-8 title string into a URL-safe slug.
 * Removes diacritics, replaces spaces with hyphens, strips special characters.
 *
 * @param {string} title - Title string to slugify.
 * @returns {string} A URL-safe slug.
 */
export function slugify(title = '') {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')    // Remove diacritics
    .replace(/đ/g, 'd')                 // Vietnamese đ → d
    .replace(/[^a-z0-9\s-]/g, '')       // Strip non-alphanumeric
    .trim()
    .replace(/\s+/g, '-')               // Spaces → hyphens
    .replace(/-+/g, '-');               // Collapse multiple hyphens
}

// ─── Tag Extraction ────────────────────────────────────────────────────────────

/**
 * Extracts a unique, sorted list of tags/categories from an array of posts.
 * Filters out empty or undefined values.
 *
 * @param {Array<{ category?: string }>} posts - List of post objects.
 * @returns {string[]} Alphabetically sorted unique category names.
 */
export function extractTags(posts = []) {
  const seen = new Set();
  const tags = [];
  for (const post of posts) {
    const cat = (post.category || '').trim();
    if (cat && !seen.has(cat)) {
      seen.add(cat);
      tags.push(cat);
    }
  }
  return tags.sort((a, b) => a.localeCompare(b, 'vi'));
}

// ─── Sorting & Filtering ───────────────────────────────────────────────────────

/**
 * Sorts an array of posts by their creation date, newest first.
 * Non-destructive — returns a new array.
 *
 * @param {Array<{ createdAt?: string }>} posts - List of post objects.
 * @returns {Array} Sorted copy of the post array.
 */
export function sortByNewest(posts = []) {
  return [...posts].sort((a, b) => {
    const da = new Date(a.createdAt || 0).getTime();
    const db = new Date(b.createdAt || 0).getTime();
    return db - da;
  });
}

/**
 * Filters posts by a given category string (case-insensitive).
 * Returns all posts if category is empty or "*".
 *
 * @param {Array<{ category?: string }>} posts - List of post objects.
 * @param {string} category - Category to filter by.
 * @returns {Array} Filtered post array.
 */
export function filterByCategory(posts = [], category = '') {
  if (!category || category === '*') return posts;
  const lower = category.toLowerCase();
  return posts.filter((p) => (p.category || '').toLowerCase() === lower);
}

/**
 * Performs a case-insensitive keyword search across post title and excerpt.
 *
 * @param {Array<{ title?: string, excerpt?: string }>} posts - Posts to search.
 * @param {string} keyword - Search term.
 * @returns {Array} Matching posts.
 */
export function searchPosts(posts = [], keyword = '') {
  if (!keyword.trim()) return posts;
  const lower = keyword.toLowerCase();
  return posts.filter((p) => {
    const title = (p.title || '').toLowerCase();
    const excerpt = (p.excerpt || '').toLowerCase();
    return title.includes(lower) || excerpt.includes(lower);
  });
}

// ─── Image Preloading ─────────────────────────────────────────────────────────

/**
 * Preloads an array of image URLs in the browser by creating Image objects
 * and waiting for each to fire its `load` or `error` event.
 *
 * This ensures images are in the browser cache before they are displayed,
 * preventing a flash of broken/unloaded images on first render.
 *
 * Only works in a browser environment (checks for `window`).
 *
 * @param {string[]} urls - Array of image URL strings to preload.
 * @returns {Promise<void[]>} Resolves when all images have settled.
 */
export function preloadImages(urls = []) {
  if (typeof window === 'undefined') return Promise.resolve([]);
  return Promise.all(
    urls.map(
      (url) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = resolve; // resolve even on error — don't block the page
          img.src = url;
        })
    )
  );
}

// ─── Word Count ────────────────────────────────────────────────────────────────

/**
 * Counts the number of words in a plain-text or HTML string.
 * HTML tags are stripped before counting.
 *
 * @param {string} content - Text or HTML content.
 * @returns {number} Approximate word count.
 */
export function wordCount(content = '') {
  const plain = content.replace(/<[^>]*>/g, ' ');
  return plain.trim().split(/\s+/).filter(Boolean).length;
}

// ─── Post Enrichment ───────────────────────────────────────────────────────────

/**
 * Enriches a raw post object from the API with derived display fields:
 * - `readingTime`: human-readable reading time string
 * - `shortExcerpt`: truncated plain-text excerpt (120 chars)
 * - `formattedDate`: DD/MM/YYYY formatted publish date
 * - `relativeDate`: relative time string ("3 ngày trước")
 * - `wordCount`: total word count of the content
 * - `slugValid`: whether the post's slug passes URL validation
 *
 * @param {{ title?: string, content?: string, excerpt?: string, publishedAt?: string, createdAt?: string, slug?: string }} post
 * @returns {object} Enriched post object (original fields preserved).
 */
export function enrichPost(post = {}) {
  return {
    ...post,
    readingTime: calcReadingTime(post.content).text,
    shortExcerpt: truncateExcerpt(post.excerpt),
    formattedDate: formatDate(post.publishedAt || post.createdAt),
    relativeDate: timeAgo(post.createdAt),
    wordCount: wordCount(post.content),
    slugValid: isValidSlug(post.slug),
  };
}

/**
 * Enriches an array of posts using `enrichPost`.
 * Applies sorting by newest after enrichment.
 *
 * @param {object[]} posts - Raw posts array from the API.
 * @returns {object[]} Sorted and enriched posts array.
 */
export function enrichAndSortPosts(posts = []) {
  return sortByNewest(posts.map(enrichPost));
}