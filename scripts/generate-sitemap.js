import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, '../public/sitemap.xml');

const SITE_URL = 'https://saint2706.github.io';
const ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'monthly' },
  { path: '/projects', priority: '0.9', changefreq: 'monthly' },
  { path: '/resume', priority: '0.9', changefreq: 'monthly' },
  { path: '/blog', priority: '0.8', changefreq: 'weekly' },
  { path: '/contact', priority: '0.5', changefreq: 'yearly' },
  { path: '/games', priority: '0.6', changefreq: 'monthly' },
  { path: '/playground', priority: '0.6', changefreq: 'monthly' },
];

function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  ROUTES.forEach(route => {
    // Ensure no trailing slash for root path unless it's just root
    const url = route.path === '/' ? SITE_URL + '/' : SITE_URL + route.path;

    xml += `  <url>\n`;
    xml += `    <loc>${url}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>`;

  fs.writeFileSync(OUTPUT_PATH, xml);
  console.log(`Successfully generated ${OUTPUT_PATH}`);
}

generateSitemap();
