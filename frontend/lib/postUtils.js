/**
 * postUtils.js — Shared utility library for all rendering pages (CSR, SSR, ISR, SSG).
 *
 * These helpers are used across all 4 homepage variants to ensure a fair,
 * equal JavaScript bundle size for performance benchmarking.
 *
 * All functions are pure and side-effect free unless noted.
 *
 * Sections:
 *  1. Reading Time
 *  2. Excerpt & Text
 *  3. Date Formatting
 *  4. Slug
 *  5. Tag Extraction
 *  6. Sorting & Filtering
 *  7. Image Preloading
 *  8. Word Count
 *  9. Post Enrichment
 * 10. Pagination
 * 11. SEO / Meta
 * 12. Local Storage Cache
 * 13. Vietnamese Text Utilities
 * 14. Performance Timing
 * 15. Post Statistics
 * 16. Content Parsing
 * 17. Schema.org Structured Data
 * 18. Render Mode Metadata
 */

// ─── 1. Reading Time ───────────────────────────────────────────────────────────

/**
 * Estimates reading time for a given HTML or plain-text string.
 * Strips HTML tags before counting words.
 * Average adult reading speed: 200 words per minute.
 *
 * @param {string} content - Raw HTML or plain text content of a blog post.
 * @param {number} [wpm=200] - Words per minute reading speed.
 * @returns {{ minutes: number, text: string }}
 */
export function calcReadingTime(content = '', wpm = 200) {
  const plainText = content.replace(/<[^>]*>/g, ' ');
  const words = plainText.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / wpm));
  return {
    minutes,
    text: minutes === 1 ? '1 phút đọc' : `${minutes} phút đọc`,
  };
}

// ─── 2. Excerpt & Text ─────────────────────────────────────────────────────────

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
  const trimmed = plain.slice(0, limit);
  const lastSpace = trimmed.lastIndexOf(' ');
  return (lastSpace > 0 ? trimmed.slice(0, lastSpace) : trimmed) + '…';
}

/**
 * Strips all HTML tags from a string, returning plain text.
 * Preserves whitespace structure approximately.
 *
 * @param {string} html - HTML string to strip.
 * @returns {string} Plain text.
 */
export function stripHtml(html = '') {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .trim();
}

/**
 * Highlights occurrences of a keyword in a plain-text string by wrapping
 * them in <mark> tags. Case-insensitive.
 * Intended for search result display.
 *
 * @param {string} text - Plain text to search within.
 * @param {string} keyword - Keyword to highlight.
 * @returns {string} HTML string with <mark> tags around matches.
 */
export function highlightKeyword(text = '', keyword = '') {
  if (!keyword.trim()) return text;
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * Extracts a plain-text preview sentence from HTML content.
 * Returns the first non-empty sentence up to `maxChars` characters.
 *
 * @param {string} html - HTML content.
 * @param {number} [maxChars=160] - Max characters for the preview.
 * @returns {string}
 */
export function extractPreviewSentence(html = '', maxChars = 160) {
  const plain = stripHtml(html);
  const sentences = plain.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
  if (!sentences.length) return truncateExcerpt(plain, maxChars);
  let result = '';
  for (const s of sentences) {
    if ((result + s).length > maxChars) break;
    result += (result ? '. ' : '') + s;
  }
  return result || truncateExcerpt(plain, maxChars);
}

// ─── 3. Date Formatting ────────────────────────────────────────────────────────

/**
 * Formats an ISO date string or Date object into a human-readable
 * Vietnamese-locale date string: "DD/MM/YYYY".
 *
 * @param {string | Date} dateInput
 * @returns {string}
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
 * @param {string | Date} dateInput
 * @returns {string}
 */
export function timeAgo(dateInput) {
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return formatDate(dateInput);
    const diffMs  = Date.now() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr  = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    const diffWk  = Math.floor(diffDay / 7);
    const diffMo  = Math.floor(diffDay / 30);

    if (diffSec < 60)  return 'Vừa xong';
    if (diffMin < 60)  return `${diffMin} phút trước`;
    if (diffHr  < 24)  return `${diffHr} giờ trước`;
    if (diffDay < 7)   return `${diffDay} ngày trước`;
    if (diffWk  < 4)   return `${diffWk} tuần trước`;
    if (diffMo  < 12)  return `${diffMo} tháng trước`;
    return formatDate(dateInput);
  } catch {
    return '—';
  }
}

/**
 * Formats a date as a full Vietnamese long-form string:
 * "Thứ Ba, ngày 15 tháng 4 năm 2025"
 *
 * @param {string | Date} dateInput
 * @returns {string}
 */
export function formatDateLong(dateInput) {
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

/**
 * Returns an ISO 8601 date string (YYYY-MM-DD) from any date input.
 * Used for <time datetime="..."> attributes and sitemap generation.
 *
 * @param {string | Date} dateInput
 * @returns {string}
 */
export function toISODateString(dateInput) {
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

// ─── 4. Slug ──────────────────────────────────────────────────────────────────

/**
 * Validates that a slug string is URL-safe:
 * only lowercase letters, numbers, and hyphens.
 *
 * @param {string} slug
 * @returns {boolean}
 */
export function isValidSlug(slug = '') {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Converts a Vietnamese or general UTF-8 title string into a URL-safe slug.
 * Removes diacritics, replaces spaces with hyphens, strips special characters.
 *
 * @param {string} title
 * @returns {string}
 */
export function slugify(title = '') {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Converts a slug back into a human-readable title by replacing hyphens
 * with spaces and capitalising each word.
 *
 * @param {string} slug
 * @returns {string}
 */
export function slugToTitle(slug = '') {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// ─── 5. Tag Extraction ────────────────────────────────────────────────────────

/**
 * Extracts a unique, sorted list of tags/categories from an array of posts.
 *
 * @param {Array<{ category?: string }>} posts
 * @returns {string[]}
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

/**
 * Returns a frequency map of how many posts belong to each category.
 *
 * @param {Array<{ category?: string }>} posts
 * @returns {Record<string, number>} e.g. { "Quận 1": 3, "Bình Thạnh": 1 }
 */
export function categoryFrequency(posts = []) {
  return posts.reduce((acc, post) => {
    const cat = (post.category || 'Uncategorised').trim();
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
}

// ─── 6. Sorting & Filtering ───────────────────────────────────────────────────

/**
 * Sorts an array of posts by their creation date, newest first.
 *
 * @param {Array<{ createdAt?: string }>} posts
 * @returns {Array}
 */
export function sortByNewest(posts = []) {
  return [...posts].sort((a, b) => {
    const da = new Date(a.createdAt || 0).getTime();
    const db = new Date(b.createdAt || 0).getTime();
    return db - da;
  });
}

/**
 * Sorts posts alphabetically by title (A → Z).
 *
 * @param {Array<{ title?: string }>} posts
 * @returns {Array}
 */
export function sortByTitle(posts = []) {
  return [...posts].sort((a, b) =>
    (a.title || '').localeCompare(b.title || '', 'vi')
  );
}

/**
 * Filters posts by a given category string (case-insensitive).
 *
 * @param {Array<{ category?: string }>} posts
 * @param {string} category
 * @returns {Array}
 */
export function filterByCategory(posts = [], category = '') {
  if (!category || category === '*') return posts;
  const lower = category.toLowerCase();
  return posts.filter(p => (p.category || '').toLowerCase() === lower);
}

/**
 * Performs a case-insensitive keyword search across post title and excerpt.
 *
 * @param {Array<{ title?: string, excerpt?: string }>} posts
 * @param {string} keyword
 * @returns {Array}
 */
export function searchPosts(posts = [], keyword = '') {
  if (!keyword.trim()) return posts;
  const lower = keyword.toLowerCase();
  return posts.filter(p => {
    const title   = (p.title   || '').toLowerCase();
    const excerpt = (p.excerpt || '').toLowerCase();
    return title.includes(lower) || excerpt.includes(lower);
  });
}

/**
 * Returns the N most recently created posts.
 *
 * @param {Array} posts
 * @param {number} [n=3]
 * @returns {Array}
 */
export function getLatestPosts(posts = [], n = 3) {
  return sortByNewest(posts).slice(0, n);
}

/**
 * Returns posts that share the same category as a given post,
 * excluding the post itself. Used for "related posts" sections.
 *
 * @param {object} currentPost
 * @param {Array} allPosts
 * @param {number} [limit=3]
 * @returns {Array}
 */
export function getRelatedPosts(currentPost = {}, allPosts = [], limit = 3) {
  return allPosts
    .filter(p =>
      p._id !== currentPost._id &&
      (p.category || '') === (currentPost.category || '')
    )
    .slice(0, limit);
}

// ─── 7. Image Preloading ──────────────────────────────────────────────────────

/**
 * Preloads an array of image URLs in the browser.
 * Only works in a browser environment.
 *
 * @param {string[]} urls
 * @returns {Promise<void[]>}
 */
export function preloadImages(urls = []) {
  if (typeof window === 'undefined') return Promise.resolve([]);
  return Promise.all(
    urls.map(
      url =>
        new Promise(resolve => {
          const img = new Image();
          img.onload  = resolve;
          img.onerror = resolve;
          img.src = url;
        })
    )
  );
}

/**
 * Extracts the first <img> src URL from an HTML string.
 * Useful for deriving an Open Graph image from post content.
 *
 * @param {string} html
 * @returns {string | null}
 */
export function extractFirstImage(html = '') {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

// ─── 8. Word Count ────────────────────────────────────────────────────────────

/**
 * Counts the number of words in a plain-text or HTML string.
 *
 * @param {string} content
 * @returns {number}
 */
export function wordCount(content = '') {
  const plain = content.replace(/<[^>]*>/g, ' ');
  return plain.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Counts the number of characters in a plain-text or HTML string
 * (excluding HTML tags and extra whitespace).
 *
 * @param {string} content
 * @returns {number}
 */
export function charCount(content = '') {
  return stripHtml(content).replace(/\s+/g, ' ').trim().length;
}

// ─── 9. Post Enrichment ───────────────────────────────────────────────────────

/**
 * Enriches a raw post object from the API with derived display fields.
 *
 * @param {object} post
 * @returns {object}
 */
export function enrichPost(post = {}) {
  return {
    ...post,
    readingTime:   calcReadingTime(post.content).text,
    shortExcerpt:  truncateExcerpt(post.excerpt),
    formattedDate: formatDate(post.publishedAt || post.createdAt),
    relativeDate:  timeAgo(post.createdAt),
    wordCount:     wordCount(post.content),
    charCount:     charCount(post.content),
    slugValid:     isValidSlug(post.slug),
    previewSentence: extractPreviewSentence(post.content),
    firstImage:    extractFirstImage(post.content) || post.coverImage || null,
  };
}

/**
 * Enriches an array of posts and sorts by newest.
 *
 * @param {object[]} posts
 * @returns {object[]}
 */
export function enrichAndSortPosts(posts = []) {
  return sortByNewest(posts.map(enrichPost));
}

// ─── 10. Pagination ───────────────────────────────────────────────────────────

/**
 * Splits an array of posts into pages of a given size.
 *
 * @param {Array} posts - Full list of posts.
 * @param {number} [pageSize=6] - Number of posts per page.
 * @returns {{ pages: Array[], totalPages: number, totalPosts: number }}
 */
export function paginatePosts(posts = [], pageSize = 6) {
  const totalPosts = posts.length;
  const totalPages = Math.ceil(totalPosts / pageSize);
  const pages = Array.from({ length: totalPages }, (_, i) =>
    posts.slice(i * pageSize, i * pageSize + pageSize)
  );
  return { pages, totalPages, totalPosts };
}

/**
 * Returns the posts for a specific page number (1-indexed).
 *
 * @param {Array} posts
 * @param {number} page - 1-indexed page number.
 * @param {number} [pageSize=6]
 * @returns {{ posts: Array, hasNext: boolean, hasPrev: boolean, totalPages: number }}
 */
export function getPage(posts = [], page = 1, pageSize = 6) {
  const { pages, totalPages } = paginatePosts(posts, pageSize);
  const idx = Math.max(0, Math.min(page - 1, totalPages - 1));
  return {
    posts:      pages[idx] || [],
    hasNext:    page < totalPages,
    hasPrev:    page > 1,
    totalPages,
  };
}

// ─── 11. SEO / Meta ───────────────────────────────────────────────────────────

/**
 * Generates an SEO-optimised <title> string for a blog post page.
 * Format: "{Post Title} | {Site Name}"
 *
 * @param {string} postTitle
 * @param {string} [siteName='Blog HCM']
 * @returns {string}
 */
export function buildPageTitle(postTitle = '', siteName = 'Blog HCM') {
  const clean = postTitle.trim();
  return clean ? `${clean} | ${siteName}` : siteName;
}

/**
 * Builds an Open Graph meta object for a post.
 * Returns an object whose keys map to <meta property="og:*"> tags.
 *
 * @param {object} post
 * @param {string} [siteUrl='https://ie213saigonblog.online']
 * @returns {Record<string, string>}
 */
export function buildOpenGraph(post = {}, siteUrl = 'https://ie213saigonblog.online') {
  const description = truncateExcerpt(post.excerpt || post.content, 160);
  return {
    'og:type':        'article',
    'og:title':       post.title || '',
    'og:description': description,
    'og:url':         `${siteUrl}/posts/${post.slug || ''}`,
    'og:image':       post.coverImage || extractFirstImage(post.content || '') || '',
    'article:published_time': toISODateString(post.publishedAt || post.createdAt),
    'article:section': post.category || '',
  };
}

/**
 * Builds a canonical URL string for a given post slug.
 *
 * @param {string} slug
 * @param {string} [base='https://ie213saigonblog.online']
 * @returns {string}
 */
export function buildCanonicalUrl(slug = '', base = 'https://ie213saigonblog.online') {
  return `${base}/posts/${slug}`;
}

// ─── 12. Local Storage Cache ──────────────────────────────────────────────────

/**
 * Saves an object to localStorage under a given key with a TTL.
 * Data is stored as JSON with an expiry timestamp.
 * No-ops on server-side (SSR) environments.
 *
 * Used by CSR pages to cache post lists and avoid redundant API calls.
 *
 * @param {string} key - Storage key.
 * @param {*} data - JSON-serialisable data.
 * @param {number} [ttlMs=60000] - Time-to-live in milliseconds (default 1 min).
 */
export function cacheSet(key, data, ttlMs = 60_000) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify({ data, expiry: Date.now() + ttlMs }));
  } catch {
    // localStorage might be full or unavailable (private browsing)
  }
}

/**
 * Retrieves a cached value from localStorage.
 * Returns null if the key doesn't exist or the TTL has expired.
 * Automatically removes expired entries.
 *
 * @param {string} key
 * @returns {* | null}
 */
export function cacheGet(key) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, expiry } = JSON.parse(raw);
    if (Date.now() > expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

/**
 * Removes a specific key from localStorage cache.
 *
 * @param {string} key
 */
export function cacheClear(key) {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem(key); } catch {}
}

// ─── 13. Vietnamese Text Utilities ────────────────────────────────────────────

/**
 * Vietnamese district/area name normalization map.
 * Maps common abbreviations and misspellings to canonical names.
 * Used for category normalisation in Sài Gòn Blog posts.
 */
const VN_DISTRICT_MAP = {
  'q1':         'Quận 1',
  'q.1':        'Quận 1',
  'quan 1':     'Quận 1',
  'q3':         'Quận 3',
  'q.3':        'Quận 3',
  'quan 3':     'Quận 3',
  'binh thanh': 'Bình Thạnh',
  'binh thạnh': 'Bình Thạnh',
  'go vap':     'Gò Vấp',
  'gò vấp':     'Gò Vấp',
  'thu duc':    'Thủ Đức',
  'thủ đức':    'Thủ Đức',
};

/**
 * Normalises a Vietnamese district name to its canonical form.
 * Returns the original string if no match is found.
 *
 * @param {string} name
 * @returns {string}
 */
export function normalizeDistrict(name = '') {
  const key = name.toLowerCase().trim();
  return VN_DISTRICT_MAP[key] || name;
}

/**
 * Removes Vietnamese diacritics from a string.
 * Useful for ASCII-safe comparisons and slug generation.
 *
 * @param {string} str
 * @returns {string}
 */
export function removeDiacritics(str = '') {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

/**
 * Performs a diacritic-insensitive search: compares strings after removing
 * all Vietnamese accents from both the target and the keyword.
 *
 * @param {string} text
 * @param {string} keyword
 * @returns {boolean}
 */
export function diacriticSearch(text = '', keyword = '') {
  return removeDiacritics(text.toLowerCase()).includes(
    removeDiacritics(keyword.toLowerCase())
  );
}

/**
 * Searches posts using diacritic-insensitive matching on title and excerpt.
 * Allows users to search "quan 1" and match "Quận 1".
 *
 * @param {Array} posts
 * @param {string} keyword
 * @returns {Array}
 */
export function smartSearchPosts(posts = [], keyword = '') {
  if (!keyword.trim()) return posts;
  return posts.filter(p =>
    diacriticSearch(p.title   || '', keyword) ||
    diacriticSearch(p.excerpt || '', keyword) ||
    diacriticSearch(p.category|| '', keyword)
  );
}

// ─── 14. Performance Timing ───────────────────────────────────────────────────

/**
 * Creates a simple performance timer.
 * Call `.start()` to begin, `.end()` to get elapsed milliseconds.
 *
 * Used by all 4 rendering pages to measure how long their data-fetch
 * and render cycle takes — displayed in the RenderBenchmark component.
 *
 * @returns {{ start: () => void, end: () => number }}
 */
export function createTimer() {
  let t0 = 0;
  return {
    start: () => { t0 = typeof performance !== 'undefined' ? performance.now() : Date.now(); },
    end:   () => {
      const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
      return parseFloat((t1 - t0).toFixed(2));
    },
  };
}

/**
 * Formats a millisecond duration into a human-readable string.
 * < 1000ms → "342ms"
 * >= 1000ms → "1.34s"
 *
 * @param {number} ms
 * @returns {string}
 */
export function formatDuration(ms) {
  if (typeof ms !== 'number' || isNaN(ms)) return '—';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Returns a Lighthouse-style rating label for a given duration and metric.
 *
 * @param {'FCP'|'LCP'|'TBT'|'TTFB'} metric
 * @param {number} value - Value in milliseconds.
 * @returns {'good' | 'needs-improvement' | 'poor'}
 */
export function getLighthouseRating(metric, value) {
  const thresholds = {
    FCP:  { good: 1800,  poor: 3000  },
    LCP:  { good: 2500,  poor: 4000  },
    TBT:  { good: 200,   poor: 600   },
    TTFB: { good: 800,   poor: 1800  },
  };
  const t = thresholds[metric];
  if (!t) return 'good';
  if (value <= t.good) return 'good';
  if (value <= t.poor) return 'needs-improvement';
  return 'poor';
}

// ─── 15. Post Statistics ──────────────────────────────────────────────────────

/**
 * Computes aggregate statistics for a collection of posts.
 * Returns counts, averages, and category breakdowns.
 *
 * @param {object[]} posts
 * @returns {{
 *   total: number,
 *   avgWordCount: number,
 *   avgReadingMinutes: number,
 *   categoryBreakdown: Record<string, number>,
 *   longestPost: object | null,
 *   shortestPost: object | null,
 * }}
 */
export function computePostStats(posts = []) {
  if (!posts.length) {
    return { total: 0, avgWordCount: 0, avgReadingMinutes: 0, categoryBreakdown: {}, longestPost: null, shortestPost: null };
  }
  const enriched = posts.map(enrichPost);
  const total    = enriched.length;
  const totalWC  = enriched.reduce((s, p) => s + p.wordCount, 0);
  const totalMin = enriched.reduce((s, p) => s + calcReadingTime(p.content).minutes, 0);

  const sorted   = [...enriched].sort((a, b) => b.wordCount - a.wordCount);

  return {
    total,
    avgWordCount:       Math.round(totalWC  / total),
    avgReadingMinutes:  Math.round(totalMin / total),
    categoryBreakdown:  categoryFrequency(posts),
    longestPost:        sorted[0]  || null,
    shortestPost:       sorted[sorted.length - 1] || null,
  };
}

// ─── 16. Content Parsing ──────────────────────────────────────────────────────

/**
 * Extracts all heading texts (h1–h3) from an HTML string.
 * Useful for building a table of contents.
 *
 * @param {string} html
 * @returns {Array<{ level: number, text: string, id: string }>}
 */
export function extractHeadings(html = '') {
  const regex = /<h([1-3])[^>]*>(.*?)<\/h[1-3]>/gi;
  const headings = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1], 10);
    const text  = stripHtml(match[2]);
    const id    = slugify(text);
    headings.push({ level, text, id });
  }
  return headings;
}

/**
 * Counts how many images are embedded in an HTML content string.
 *
 * @param {string} html
 * @returns {number}
 */
export function countImages(html = '') {
  return (html.match(/<img/gi) || []).length;
}

/**
 * Extracts all href values from anchor tags in an HTML string.
 * Separates internal links (starting with /) from external ones.
 *
 * @param {string} html
 * @returns {{ internal: string[], external: string[] }}
 */
export function extractLinks(html = '') {
  const regex  = /href=["']([^"']+)["']/gi;
  const internal = [];
  const external = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    const href = match[1];
    if (href.startsWith('/') || href.startsWith('#')) internal.push(href);
    else external.push(href);
  }
  return { internal, external };
}

// ─── 17. Schema.org Structured Data ──────────────────────────────────────────

/**
 * Generates a JSON-LD Schema.org Article object for a blog post.
 * Should be injected into <script type="application/ld+json"> in the <head>.
 *
 * Improves SEO on SSG/ISR/SSR pages where Google can read the HTML.
 * Has no effect on CSR pages since Google's crawler doesn't execute JS.
 *
 * @param {object} post
 * @param {string} [siteUrl='https://ie213saigonblog.online']
 * @returns {object} Schema.org Article JSON-LD object.
 */
export function buildArticleSchema(post = {}, siteUrl = 'https://ie213saigonblog.online') {
  return {
    '@context':         'https://schema.org',
    '@type':            'Article',
    headline:           post.title || '',
    description:        truncateExcerpt(post.excerpt || post.content, 160),
    image:              post.coverImage || extractFirstImage(post.content || '') || '',
    datePublished:      toISODateString(post.publishedAt || post.createdAt),
    dateModified:       toISODateString(post.updatedAt   || post.createdAt),
    url:                buildCanonicalUrl(post.slug, siteUrl),
    articleSection:     post.category || '',
    wordCount:          wordCount(post.content),
    publisher: {
      '@type': 'Organization',
      name:    'Blog HCM',
      url:     siteUrl,
    },
  };
}

/**
 * Serialises a Schema.org object to a JSON string safe for
 * injection into a <script> tag (escapes </script> sequences).
 *
 * @param {object} schema
 * @returns {string}
 */
export function serializeSchema(schema = {}) {
  return JSON.stringify(schema).replace(/<\/script>/gi, '<\\/script>');
}

// ─── 18. Render Mode Metadata ─────────────────────────────────────────────────

/**
 * Metadata descriptor for each rendering strategy.
 * Used by all 4 homepage variants to render consistent info banners,
 * benchmark labels, and explanation cards.
 *
 * Centralising this here ensures the bundle cost is shared equally
 * across all pages — a key requirement for fair performance comparison.
 */
export const RENDER_MODE_META = {
  SSG: {
    label:       'SSG',
    fullName:    'Static Site Generation',
    color:       'emerald',
    tagline:     'Nhanh như chớp — HTML xây sẵn tại build time',
    description: 'HTML được tạo một lần khi build. Mọi request đều nhận cùng file tĩnh từ CDN. TTFB thấp nhất, không có server compute khi user request.',
    pros:        ['TTFB cực thấp', 'Dễ cache CDN', 'Không tốn server resource'],
    cons:        ['Dữ liệu có thể cũ', 'Phải rebuild để cập nhật'],
    lighthouse:  { performance: 95, seo: 100, accessibility: 90 },
  },
  SSR: {
    label:       'SSR',
    fullName:    'Server-Side Rendering',
    color:       'rose',
    tagline:     'Dữ liệu luôn mới — Server render mỗi request',
    description: 'Server tạo HTML mới cho mỗi request. Dữ liệu luôn cập nhật nhưng TTFB cao hơn SSG vì phải chờ server xử lý và fetch database.',
    pros:        ['Dữ liệu luôn mới nhất', 'Tốt cho nội dung cá nhân hoá', 'SEO đầy đủ'],
    cons:        ['TTFB cao hơn SSG', 'Tốn server resource mỗi request'],
    lighthouse:  { performance: 78, seo: 100, accessibility: 90 },
  },
  ISR: {
    label:       'ISR',
    fullName:    'Incremental Static Regeneration',
    color:       'blue',
    tagline:     'Tốt nhất cả hai — Static speed, dynamic content',
    description: 'Kết hợp SSG và SSR. Phục vụ HTML tĩnh (nhanh như SSG) nhưng tự động regenerate sau một khoảng thời gian revalidate. Không cần rebuild toàn bộ site.',
    pros:        ['TTFB thấp như SSG', 'Dữ liệu tự cập nhật', 'Không rebuild toàn site'],
    cons:        ['Có thể serve dữ liệu cũ trong khoảng revalidate'],
    lighthouse:  { performance: 92, seo: 100, accessibility: 90 },
  },
  CSR: {
    label:       'CSR',
    fullName:    'Client-Side Rendering',
    color:       'amber',
    tagline:     'JavaScript trước, nội dung sau — SPA style',
    description: 'Server trả về HTML rỗng. Toàn bộ render xảy ra ở browser sau khi JS bundle tải và chạy xong. FCP và LCP cao nhất trong 4 phương pháp.',
    pros:        ['Trải nghiệm app-like sau khi load', 'Giảm tải server', 'Dễ build SPA'],
    cons:        ['FCP/LCP cao', 'SEO kém', 'Phụ thuộc vào JS của client'],
    lighthouse:  { performance: 45, seo: 60, accessibility: 85 },
  },
};

/**
 * Returns the metadata object for a given rendering mode.
 *
 * @param {'SSG'|'SSR'|'ISR'|'CSR'} mode
 * @returns {object}
 */
export function getRenderModeMeta(mode) {
  return RENDER_MODE_META[mode] || RENDER_MODE_META.CSR;
}