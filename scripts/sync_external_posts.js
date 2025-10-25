#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { parseStringPromise } = require('xml2js');
const { HttpsProxyAgent } = require('https-proxy-agent');

const DEVTO_USERNAME = process.env.DEVTO_USERNAME || 'saint2706';
const MEDIUM_USERNAME = process.env.MEDIUM_USERNAME || 'saint2706';
const SUBSTACK_USERNAME = process.env.SUBSTACK_USERNAME || 'saint2706';
const OUTPUT_PATH = path.join(__dirname, '..', '_data', 'external_posts.json');
const MAX_POSTS_PER_SOURCE = parseInt(process.env.MAX_EXTERNAL_POSTS || '10', 10);
const MAX_RETRIES = parseInt(process.env.MAX_RETRIES || '3', 10);
const INITIAL_RETRY_DELAY = parseInt(process.env.INITIAL_RETRY_DELAY || '1000', 10);
const SUBSTACK_FEED_URL_OVERRIDE = (process.env.SUBSTACK_FEED_URL || '').trim() || null;
const TOTAL_SOURCES = 3; // dev.to, Medium, Substack

const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy || null;
const proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;
const defaultHeaders = {
  'User-Agent': 'Mozilla/5.0 (compatible; BlogSync/1.0; +https://saint2706.github.io)'
};

function sanitizeDescription(rawHtml) {
  // Remove HTML tags repeatedly to handle nested tags
  let text = rawHtml || '';
  let prevText;
  do {
    prevText = text;
    text = text.replace(/<[^>]+>/g, '');
  } while (text !== prevText);
  return text.replace(/\s+/g, ' ').trim();
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryWithBackoff(fn, retries = MAX_RETRIES, delay = INITIAL_RETRY_DELAY) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) {
        throw error;
      }
      const backoffDelay = delay * Math.pow(2, i);
      console.log(`  Retry ${i + 1}/${retries - 1} after ${backoffDelay}ms...`);
      await sleep(backoffDelay);
    }
  }
}

async function fetchJson(url, options = {}) {
  const { headers: customHeaders = {}, ...rest } = options;
  const response = await fetch(url, {
    agent: proxyAgent,
    headers: { ...defaultHeaders, ...customHeaders },
    ...rest
  });
  if (!response.ok) {
    throw new Error(`Request failed for ${url} with status ${response.status}`);
  }
  return response.json();
}

async function fetchDevToArticles(username) {
  const apiUrl = `https://dev.to/api/articles?username=${encodeURIComponent(username)}&per_page=${MAX_POSTS_PER_SOURCE}`;
  const articles = await fetchJson(apiUrl, {
    headers: { Accept: 'application/vnd.forem.api-v1+json' }
  });
  return articles.slice(0, MAX_POSTS_PER_SOURCE).map((article) => ({
    title: article.title,
    url: article.url,
    published_at: article.published_at,
    description: article.description,
    tags: article.tag_list,
    source: 'dev.to'
  }));
}

async function fetchMediumFeed(username) {
  const feedUrl = `https://medium.com/feed/@${encodeURIComponent(username)}`;
  const response = await fetch(feedUrl, {
    headers: { 'Accept': 'application/rss+xml', ...defaultHeaders },
    agent: proxyAgent
  });
  if (!response.ok) {
    throw new Error(`Request failed for ${feedUrl} with status ${response.status}`);
  }
  const xml = await response.text();
  const parsed = await parseStringPromise(xml, { trim: true, explicitArray: true });
  const items = (((parsed || {}).rss || {}).channel || [])[0]?.item || [];
  return items.slice(0, MAX_POSTS_PER_SOURCE).map((item) => ({
    title: item.title?.[0] || 'Untitled',
    url: item.link?.[0],
    published_at: item.pubDate?.[0],
    description: sanitizeDescription(item['content:encoded']?.[0] || item.description?.[0]),
    tags: [],
    source: 'Medium'
  }));
}

async function fetchSubstackFeed(username) {
  // Validate username to prevent subdomain injection
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    throw new Error(
      `Invalid Substack username: ${username}. Only alphanumeric characters, hyphens, and underscores are allowed.`
    );
  }

  const feedUrl = SUBSTACK_FEED_URL_OVERRIDE || `https://${username}.substack.com/feed`;
  if (SUBSTACK_FEED_URL_OVERRIDE) {
    console.log(`  Using custom Substack feed URL: ${feedUrl}`);
  }

  async function downloadFeed(url, label) {
    const response = await fetch(url, {
      headers: { 'Accept': 'application/rss+xml', ...defaultHeaders },
      agent: proxyAgent
    });

    if (!response.ok) {
      const error = new Error(`Request failed for ${url} with status ${response.status}`);
      error.status = response.status;
      error.url = url;
      error.context = label;
      throw error;
    }

    return response.text();
  }

  let xml;
  try {
    xml = await downloadFeed(feedUrl, 'direct');
  } catch (error) {
    if (error.status === 403) {
      const proxyHint = proxyAgent
        ? ' Substack often blocks requests that arrive through shared proxies or VPNs. Try running the script without a proxy or provide a mirror URL via SUBSTACK_FEED_URL.'
        : ' Ensure that the publication is public and accessible without authentication.';
      console.warn(`  Direct feed blocked with 403. Falling back to AllOrigins proxy.${proxyHint}`);

      const proxiedUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`;
      try {
        xml = await downloadFeed(proxiedUrl, 'allorigins');
      } catch (proxyError) {
        if (proxyError.status === 403) {
          throw new Error(
            `Request failed for ${feedUrl} with status 403 (forbidden) even after using the AllOrigins proxy.${proxyHint}`
          );
        }
        throw proxyError;
      }
    } else {
      throw error;
    }
  }

  const parsed = await parseStringPromise(xml, { trim: true, explicitArray: true });
  const items = (((parsed || {}).rss || {}).channel || [])[0]?.item || [];
  return items.slice(0, MAX_POSTS_PER_SOURCE).map((item) => ({
    title: item.title?.[0] || 'Untitled',
    url: item.link?.[0],
    published_at: item.pubDate?.[0],
    description: sanitizeDescription(item['content:encoded']?.[0] || item.description?.[0]),
    tags: [],
    source: 'Substack'
  }));
}

async function fetchWithFallback(fetchFn, sourceName) {
  try {
    console.log(`Fetching ${sourceName}...`);
    const result = await retryWithBackoff(fetchFn);
    console.log(`✓ Successfully fetched ${result.length} posts from ${sourceName}`);
    return result;
  } catch (error) {
    // Sanitize error message to avoid logging sensitive data
    // Note: This script only accesses public APIs without credentials,
    // so error messages contain only network/HTTP errors and public URLs
    const safeMessage = error.message?.replace(/api[_-]?key[=:]\s*\S+/gi, 'api_key=***') || 'Unknown error';
    console.error(`✗ Failed to fetch ${sourceName}: ${safeMessage}`);
    return [];
  }
}

async function buildDataset() {
  try {
    // Try to load existing data to preserve it if some sources fail
    let existingData = { devto: [], medium: [], substack: [] };
    try {
      const existingContent = await fs.promises.readFile(OUTPUT_PATH, 'utf8');
      existingData = JSON.parse(existingContent);
    } catch (err) {
      // File doesn't exist or is invalid, use empty arrays
      console.log('No existing data found, starting fresh');
    }

    const [devto, medium, substack] = await Promise.all([
      fetchWithFallback(() => fetchDevToArticles(DEVTO_USERNAME), 'dev.to'),
      fetchWithFallback(() => fetchMediumFeed(MEDIUM_USERNAME), 'Medium'),
      fetchWithFallback(() => fetchSubstackFeed(SUBSTACK_USERNAME), 'Substack')
    ]);

    // Use new data if fetch succeeded (length > 0), otherwise preserve existing data
    const finalDevto = devto.length > 0 ? devto : existingData.devto || [];
    const finalMedium = medium.length > 0 ? medium : existingData.medium || [];
    const finalSubstack = substack.length > 0 ? substack : existingData.substack || [];

    const totalNewPosts = devto.length + medium.length + substack.length;
    const totalFinalPosts = finalDevto.length + finalMedium.length + finalSubstack.length;
    
    if (totalNewPosts === 0) {
      if (totalFinalPosts === 0) {
        console.error('Unable to refresh external posts. All sources failed and no existing data available.');
        process.exitCode = 1;
        return;
      }
      console.log('⚠ All sources failed, but preserved existing data');
    }

    const payload = {
      generated_at: new Date().toISOString(),
      devto: finalDevto,
      medium: finalMedium,
      substack: finalSubstack
    };

    await fs.promises.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
    await fs.promises.writeFile(OUTPUT_PATH, JSON.stringify(payload, null, 2));
    console.log(`✓ Saved ${finalDevto.length} dev.to, ${finalMedium.length} Medium, and ${finalSubstack.length} Substack posts to ${OUTPUT_PATH}`);
    
    if (totalNewPosts > 0 && totalNewPosts < TOTAL_SOURCES) {
      console.log(`  (${totalNewPosts} source(s) updated, ${TOTAL_SOURCES - totalNewPosts} preserved from previous run)`);
    }
  } catch (error) {
    console.error('Unable to refresh external posts. Unexpected error occurred.');
    // Note: Detailed error already logged at source level by fetchWithFallback
    process.exitCode = 1;
  }
}

buildDataset();
