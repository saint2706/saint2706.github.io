import Parser from 'rss-parser';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parser = new Parser();

async function fetchDevTo() {
  try {
    const response = await fetch('https://dev.to/api/articles?username=saint2706');
    if (!response.ok) {
      console.error('Failed to fetch Dev.to articles:', response.statusText);
      return [];
    }
    const articles = await response.json();
    return articles.map(article => ({
      title: article.title,
      link: article.url,
      date: article.published_at,
      summary: article.description,
      source: 'Dev.to',
      tags: article.tag_list,
      coverImage: article.cover_image
    }));
  } catch (error) {
    console.error('Error fetching Dev.to:', error);
    return [];
  }
}

async function fetchMedium() {
  try {
    const feed = await parser.parseURL('https://medium.com/feed/@saint2706');
    return feed.items.map(item => ({
      title: item.title,
      link: item.link,
      date: item.pubDate || item.isoDate,
      summary: extractSummary(item['content:encoded'] || item.contentSnippet),
      source: 'Medium',
      tags: item.categories || [],
      // Medium RSS doesn't give a nice cover image usually, so we might need a default or extract from content
      coverImage: extractImage(item['content:encoded'])
    }));
  } catch (error) {
    console.error('Error fetching Medium:', error);
    return [];
  }
}

async function fetchSubstack() {
  try {
    // Import the Substack mapping
    let substackMapping = {};
    try {
      const mappingModule = await import('./substack-mapping.js');
      substackMapping = mappingModule.substackMapping || {};
    } catch (e) {
      console.warn('No substack-mapping.js found, using RSS links directly');
    }

    // Use custom fields to capture GUID
    const customParser = new Parser({
      customFields: {
        item: ['guid']
      }
    });

    const feed = await customParser.parseURL('https://saint2706.substack.com/feed');
    return feed.items.map(item => {
      // Extract slug from RSS link: https://saint2706.substack.com/p/post-slug
      const linkMatch = item.link.match(/\/p\/([^/?]+)/);
      const slug = linkMatch ? linkMatch[1] : null;

      // Check if we have a mapping for this slug
      let postLink = item.link; // Default to RSS link
      if (slug && substackMapping[slug]) {
        postLink = `https://substack.com/home/post/p-${substackMapping[slug]}`;
      }

      // Extract summary - use contentSnippet or content
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
        coverImage: item.enclosure?.url || extractImage(item['content:encoded'])
      };
    });
  } catch (error) {
    console.error('Error fetching Substack:', error);
    return [];
  }
}

function extractSummary(content) {
  if (!content) return '';
  // Strip HTML tags, then remove any remaining angle brackets, and take first 200 chars
  const text = content
    .replace(/<[^>]*>?/gm, '')
    .replace(/[<>]/g, '');
  return text.substring(0, 200) + '...';
}

function extractImage(content) {
  if (!content) return null;
  const match = content.match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : null;
}

async function syncBlogs() {
  console.log('Starting blog sync...');

  const [devTo, medium, substack] = await Promise.all([
    fetchDevTo(),
    fetchMedium(),
    fetchSubstack()
  ]);

  const allBlogs = [...devTo, ...medium, ...substack]
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const outputPath = path.join(__dirname, '../src/data/blogs.json');

  // Ensure directory exists
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  await fs.writeFile(outputPath, JSON.stringify(allBlogs, null, 2));
  console.log(`Successfully synced ${allBlogs.length} blogs to ${outputPath}`);
}

syncBlogs();
