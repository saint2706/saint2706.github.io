/**
 * Substack Post ID Mapping
 *
 * Maps Substack post slugs from RSS feeds to their actual post IDs used in the web interface.
 * This is necessary because Substack's RSS feeds use different URLs than the web interface.
 *
 * @module scripts/substack-mapping
 * @example
 * // To add a new mapping:
 * // 1. Open your Substack post in the web interface
 * // 2. The URL will be: https://substack.com/home/post/p-{POST_ID}
 * // 3. Copy the numeric ID and add it to the mapping below
 * // Example: "new-post-slug": "123456789"
 */

// Substack Post ID Mapping
// Format: { "post-slug": "post-id" }
//
// How to get the post ID:
// 1. Open your Substack post
// 2. The URL will be: https://substack.com/home/post/p-{POST_ID}
// 3. Copy the numeric ID and add it below
//
// Example: If URL is https://substack.com/home/post/p-177074905
// Add entry: "a-beginners-guide-to-stoic-philosophy": "177074905"

export const substackMapping = {
  // Add your Substack post slugs and IDs here
  // "post-slug-from-rss": "numeric-post-id"

  'a-comprehensive-guide-to-stoic-philosophy': '177074905',
  'ciceronian-governance': '177074076',

  // Add more mappings as you publish new posts:
  // "new-post-slug": "123456789",
};
