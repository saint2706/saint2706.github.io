#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { parseStringPromise } = require('xml2js');
const { HttpsProxyAgent } = require('https-proxy-agent');

const DEVTO_USERNAME = process.env.DEVTO_USERNAME || 'saint2706';
const MEDIUM_USERNAME = process.env.MEDIUM_USERNAME || 'saint2706';
const OUTPUT_PATH = path.join(__dirname, '..', '_data', 'external_posts.json');
const MAX_POSTS_PER_SOURCE = parseInt(process.env.MAX_EXTERNAL_POSTS || '10', 10);

const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy || null;
const proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;
const defaultHeaders = {
  'User-Agent': 'Mozilla/5.0 (compatible; BlogSync/1.0; +https://saint2706.github.io)'
};

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
    description: (item['content:encoded']?.[0] || item.description?.[0] || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(),
    tags: [],
    source: 'Medium'
  }));
}

async function buildDataset() {
  try {
    const [devto, medium] = await Promise.all([
      fetchDevToArticles(DEVTO_USERNAME),
      fetchMediumFeed(MEDIUM_USERNAME)
    ]);

    const payload = {
      generated_at: new Date().toISOString(),
      devto,
      medium
    };

    await fs.promises.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
    await fs.promises.writeFile(OUTPUT_PATH, JSON.stringify(payload, null, 2));
    console.log(`Saved ${devto.length} dev.to and ${medium.length} Medium posts to ${OUTPUT_PATH}`);
  } catch (error) {
    console.error('Unable to refresh external posts:', error.message);
    process.exitCode = 1;
  }
}

buildDataset();
