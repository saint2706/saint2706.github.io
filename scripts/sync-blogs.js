/**
 * Blog Synchronization Script
 *
 * Fetches blog posts from multiple platforms (Dev.to, Medium, Substack) and consolidates
 * them into a single JSON file for the portfolio website. This script runs periodically
 * (via GitHub Actions) to keep the blog list up-to-date.
 *
 * Output: src/data/blogs.json
 *
 * Data Sources:
 * - Dev.to: Uses their public API
 * - Medium: Uses RSS feed parsing
 * - Substack: Uses RSS feed with custom slug mapping
 *
 * @module scripts/sync-blogs
 */

import Parser from 'rss-parser';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { htmlToText } from 'html-to-text';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parser = new Parser();

const NETWORK_TIMEOUT_MS = 10000;
const NETWORK_RETRY_ATTEMPTS = 2;

/**
 * Fetch helper with timeout and retries to avoid hanging CI jobs.
 *
 * @param {string} url - URL to fetch
 * @param {RequestInit} [options] - fetch options
 * @param {number} [attempts] - total attempts before giving up
 * @returns {Promise<Response>} fetch response
 */
async function fetchWithTimeoutAndRetry(url, options = {}, attempts = NETWORK_RETRY_ATTEMPTS) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), NETWORK_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;

      if (attempt < attempts) {
        console.warn(`Network fetch attempt ${attempt} failed for ${url}; retrying...`);
      }
    }
  }

  throw lastError;
}

/**
 * Fetches blog articles from Dev.to using their public API.
 *
 * @async
 * @returns {Promise<Array<object>>} Array of normalized blog post objects
 * @returns {Promise<Array>} Empty array if fetch fails
 */
async function fetchDevTo() {
  try {
    const response = await fetchWithTimeoutAndRetry('https://dev.to/api/articles?username=saint2706');
    if (!response.ok) {
      console.error('Failed to fetch Dev.to articles:', response.statusText);
      return [];
    }
    const articles = await response.json();

    // Normalize Dev.to API response to common blog post format
    return articles.map(article => ({
      title: article.title,
      link: article.url,
      date: article.published_at,
      summary: article.description,
      source: 'Dev.to',
      tags: article.tag_list,
      coverImage: article.cover_image,
    }));
  } catch (error) {
    console.error('Error fetching Dev.to:', error);
    return [];
  }
}

/**
 * Fetches blog articles from Medium using RSS feed.
 *
 * @async
 * @returns {Promise<Array<object>>} Array of normalized blog post objects
 * @returns {Promise<Array>} Empty array if fetch fails
 */
async function fetchMedium() {
  try {
    const feed = await parser.parseURL('https://medium.com/feed/@saint2706');

    // Normalize RSS feed items to common blog post format
    return feed.items.map(item => ({
      title: item.title,
      link: item.link,
      date: item.pubDate || item.isoDate,
      summary: extractSummary(item['content:encoded'] || item.contentSnippet),
      source: 'Medium',
      tags: item.categories || [],
      // Extract cover image from HTML content if available
      coverImage: extractImage(item['content:encoded']),
    }));
  } catch (error) {
    console.error('Error fetching Medium:', error);
    return [];
  }
}

/**
 * Fetches blog articles from Substack using RSS feed with custom slug mapping.
 *
 * Substack's RSS links don't always work directly, so we use a mapping file to
 * convert slugs to the correct post IDs for the web interface.
 *
 * @async
 * @returns {Promise<Array<object>>} Array of normalized blog post objects
 * @returns {Promise<Array>} Empty array if fetch fails
 */
async function fetchSubstack() {
  try {
    // Import the Substack mapping for converting slugs to post IDs
    let substackMapping = {};
    try {
      const mappingModule = await import('./substack-mapping.js');
      substackMapping = mappingModule.substackMapping || {};
    } catch {
      console.warn('No substack-mapping.js found, using RSS links directly');
    }

    // Use custom parser to capture GUID field from RSS
    const customParser = new Parser({
      customFields: {
        item: ['guid'],
      },
    });

    const feed = await customParser.parseURL('https://saint2706.substack.com/feed');

    return feed.items.map(item => {
      // Extract slug from RSS link: https://saint2706.substack.com/p/post-slug
      const linkMatch = item.link.match(/\/p\/([^/?]+)/);
      const slug = linkMatch ? linkMatch[1] : null;

      // Use mapping to convert slug to proper Substack web URL if available
      let postLink = item.link; // Default to RSS link
      if (slug && substackMapping[slug]) {
        postLink = `https://substack.com/home/post/p-${substackMapping[slug]}`;
      }

      // Extract and truncate summary from content
      let summary = item.contentSnippet || '';
      if (summary.length > 200) {
        summary = summary.substring(0, 200) + '...';
      }

      // Try to extract tags from categories if available
      const tags = item.categories || [];

      return {
        title: item.title,
        link: postLink,
        date: item.pubDate || item.isoDate,
        summary: summary,
        source: 'Substack',
        tags: tags,
        coverImage: item.enclosure?.url || extractImage(item['content:encoded']),
      };
    });
  } catch (error) {
    console.error('Error fetching Substack:', error);
    return [];
  }
}

/**
 * Extracts a plain text summary from HTML content.
 * Converts HTML to plain text and truncates to 200 characters.
 *
 * @param {string} content - HTML content string
 * @returns {string} Plain text summary with ellipsis
 */
function extractSummary(content) {
  if (!content) return '';

  // Use a robust HTML-to-text converter to avoid incomplete sanitization.
  const text = htmlToText(content, {
    wordwrap: false,
  }).trim();

  return text.substring(0, 200) + '...';
}

/**
 * Extracts the first image URL from HTML content.
 *
 * @param {string} content - HTML content string
 * @returns {string|null} Image URL or null if no image found
 */
function extractImage(content) {
  if (!content) return null;
  const match = content.match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : null;
}

/**
 * Main synchronization function that fetches from all sources and writes to JSON file.
 *
 * @async
 * @returns {Promise<void>}
 */
async function syncBlogs() {
  console.log('Starting blog sync...');

  // Fetch from all sources concurrently for better performance
  const [devTo, medium, substack] = await Promise.all([
    fetchDevTo(),
    fetchMedium(),
    fetchSubstack(),
  ]);

  // Combine all blogs and sort by date (newest first)
  const allBlogs = [...devTo, ...medium, ...substack].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const outputPath = path.join(__dirname, '../src/data/blogs.json');

  // Ensure directory exists
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  // Write consolidated blog data to JSON file
  await fs.writeFile(outputPath, JSON.stringify(allBlogs, null, 2));
  console.log(`Successfully synced ${allBlogs.length} blogs to ${outputPath}`);
}

// Execute the sync
syncBlogs().catch(error => {
  console.error(`Blog sync failed: ${error.message}`);
  process.exitCode = 1;
});
