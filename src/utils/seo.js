/**
 * @fileoverview Centralized SEO configuration and JSON-LD schema generators.
 *
 * All site-wide SEO constants and structured-data helpers live here so every
 * page can import what it needs without duplicating strings or logic.
 */

import { resumeData } from '../data/resume';
import blogs from '../data/blogs.json';

/* ──────────────────────────────────────────────────────── */
/*  Constants                                              */
/* ──────────────────────────────────────────────────────── */

/** @type {string} Base URL of the website */
/**
 * The base URL of the website.
 * @constant {string}
 */
export const SITE_URL = resumeData.basics.website;

/** @type {string} Name of the website/owner */
/**
 * The name of the website.
 * @constant {string}
 */
export const SITE_NAME = 'Rishabh Agrawal';

/** @type {string} Suffix for the page title */
/**
 * The suffix appended to page titles.
 * @constant {string}
 */
export const SITE_TITLE_SUFFIX = '| Rishabh Agrawal';

/** @type {string} Default Open Graph image URL */
/**
 * The default Open Graph image URL.
 * @constant {string}
 */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

/** @type {string} Twitter handle of the website owner */
/**
 * The Twitter handle associated with the site.
 * @constant {string}
 */
export const TWITTER_HANDLE = '@saint2706'; // update if you have one

/** @type {string} Locale of the website */
/**
 * The default locale for the site.
 * @constant {string}
 */
export const LOCALE = 'en_US';

/** @type {string} Primary language used in SEO tags */
/**
 * The primary language of the site.
 * @constant {string}
 */
export const SITE_LANGUAGE = 'en';

/** @type {string} Default OG/Twitter image alt text */
/**
 * The default alternative text for the Open Graph image.
 * @constant {string}
 */
export const DEFAULT_OG_IMAGE_ALT =
  'Rishabh Agrawal portfolio showcasing analytics, data storytelling, and AI projects';

/** @type {string} Fallback SEO keywords */
/**
 * Default SEO keywords used across the site.
 * @constant {string[]}
 */
export const DEFAULT_SEO_KEYWORDS = [
  'Rishabh Agrawal',
  'Data Storyteller',
  'Analytics Strategist',
  'AI Portfolio',
  'Machine Learning Projects',
  'Data Analytics',
  'Python Developer',
  'React Portfolio',
].join(', ');

/** @type {string} Theme color for PWA and browser UI */
/**
 * The primary theme color of the site.
 * @constant {string}
 */
export const THEME_COLOR = '#1e1e2e'; // dark background

/* ──────────────────────────────────────────────────────── */
/*  JSON-LD Schema Generators                              */
/* ──────────────────────────────────────────────────────── */

/**
 * WebSite schema – enables Google Sitelinks search box.
 * Should be injected on the homepage only.
 * @returns {Object} WebSite structured data schema.
 *
 * @example
 * const schema = websiteSchema();
 * // => { "@context": "https://schema.org", "@type": "WebSite", "name": "Rishabh Agrawal", ... }
 */
export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: resumeData.basics.summary,
    author: personSchemaCompact(),
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Organization schema for rich profile panels and identity consistency.
 * @returns {Object} Organization structured data schema.
 *
 * @example
 * const schema = organizationSchema();
 * // => { "@context": "https://schema.org", "@type": "Organization", "name": "Rishabh Agrawal", ... }
 */
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: DEFAULT_OG_IMAGE,
    sameAs: resumeData.basics.socials.map(s => s.url),
    founder: personSchemaCompact(),
  };
}

/**
 * TechArticle/BlogPosting schema for an individual blog post.
 * @param {Object} blog - Blog post object from blogs.json
 * @returns {Object} TechArticle structured data schema.
 *
 * @example
 * const schema = blogPostingSchema({ title: "My Blog", summary: "Summary", link: "https...", date: "2023-01-01" });
 * // => { "@context": "https://schema.org", "@type": "TechArticle", "headline": "My Blog", ... }
 */
export function blogPostingSchema(blog) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: blog.title,
    description: blog.summary,
    url: blog.link,
    datePublished: blog.date,
    author: personSchemaCompact(),
    image: blog.coverImage || DEFAULT_OG_IMAGE,
    publisher: {
      '@type': 'Organization',
      name: blog.source,
    },
    keywords: blog.tags?.join(', '),
  };
}

/**
 * Compact Person reference (used as nested author/creator).
 * @returns {Object} Compact Person structured data schema.
 *
 * @example
 * const schema = personSchemaCompact();
 * // => { "@type": "Person", "name": "Rishabh Agrawal", "url": "https://rishabhagrawal.com" }
 */
export function personSchemaCompact() {
  return {
    '@type': 'Person',
    name: resumeData.basics.name,
    url: SITE_URL,
  };
}

/**
 * Full Person schema – homepage / about.
 * @returns {Object} Full Person structured data schema.
 *
 * @example
 * const schema = personSchemaFull();
 * // => { "@context": "https://schema.org", "@type": "Person", "name": "Rishabh Agrawal", ... }
 */
export function personSchemaFull() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: resumeData.basics.name,
    url: SITE_URL,
    image: DEFAULT_OG_IMAGE,
    jobTitle: resumeData.basics.title,
    description: resumeData.basics.summary,
    email: `mailto:${resumeData.basics.email}`,
    telephone: resumeData.basics.phone,
    address: {
      '@type': 'PostalAddress',
      addressLocality: resumeData.basics.location.city,
      addressCountry: resumeData.basics.location.country,
    },
    sameAs: resumeData.basics.socials.map(s => s.url),
    alumniOf: resumeData.education.map(edu => ({
      '@type': 'EducationalOrganization',
      name: edu.institution,
    })),
    knowsAbout: resumeData.skills.flatMap(cat => cat.items.map(i => i.name)).slice(0, 20),
    hasCredential: resumeData.certifications.slice(0, 5).map(cert => ({
      '@type': 'EducationalOccupationalCredential',
      name: cert.name,
      credentialCategory: 'certification',
      recognizedBy: {
        '@type': 'Organization',
        name: cert.issuer,
      },
    })),
  };
}

/**
 * SoftwareApplication schema for the Games page.
 * @returns {Object} SoftwareApplication structured data schema for games.
 *
 * @example
 * const schema = gamesSchema();
 * // => { "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "Interactive Mini-Games", ... }
 */
export function gamesSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Interactive Mini-Games',
    operatingSystem: 'Browser',
    applicationCategory: 'GameApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'A collection of interactive mini-games including Tic Tac Toe, Snake, Memory Match, Minesweeper, Simon Says, Whack-a-Mole, and Lights Out.',
    author: personSchemaCompact(),
  };
}

/**
 * SoftwareApplication schema for the Playground.
 * @returns {Object} SoftwareApplication structured data schema for the playground.
 *
 * @example
 * const schema = playgroundSchema();
 * // => { "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "Python Playground", ... }
 */
export function playgroundSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Python Playground',
    operatingSystem: 'Browser',
    applicationCategory: 'DeveloperApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'Interactive Python playground running directly in the browser via Pyodide. Test snippets, visualize algorithms, and learn Python.',
    author: personSchemaCompact(),
  };
}

/**
 * ProfilePage schema – wraps the Person for homepage.
 * @returns {Object} ProfilePage structured data schema.
 *
 * @example
 * const schema = profilePageSchema();
 * // => { "@context": "https://schema.org", "@type": "ProfilePage", "mainEntity": { ... }, ... }
 */
export function profilePageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: personSchemaFull(),
    name: `${resumeData.basics.name} – Portfolio`,
    url: SITE_URL,
    description: resumeData.basics.summary,
  };
}

/**
 * BreadcrumbList schema helper.
 * @param {Array<{name:string, url:string}>} items
 * @returns {Object} BreadcrumbList structured data schema.
 *
 * @example
 * const schema = breadcrumbSchema([{ name: "Home", url: "https://example.com" }]);
 * // => { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [ ... ] }
 */
export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * ItemList schema for the Projects page (CollectionPage).
 * @returns {Object} CollectionPage structured data schema for projects.
 *
 * @example
 * const schema = projectsCollectionSchema();
 * // => { "@context": "https://schema.org", "@type": "CollectionPage", "name": "Projects | Rishabh Agrawal", ... }
 */
export function projectsCollectionSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Projects | ${SITE_NAME}`,
    url: `${SITE_URL}/projects`,
    description:
      'Explore case studies and side projects spanning analytics, AI, and full-stack builds.',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: resumeData.projects.length,
      itemListElement: resumeData.projects.map((project, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: project.title,
        url: project.link || project.github || `${SITE_URL}/projects`,
        description: project.description,
      })),
    },
  };
}

/**
 * CreativeWork schema for an individual project.
 * @param {Object} project - Project object from resumeData.projects
 * @returns {Object} CreativeWork structured data schema.
 *
 * @example
 * const schema = projectCreativeWorkSchema({ title: "My Project", description: "Desc", image: "/img.png" });
 * // => { "@context": "https://schema.org", "@type": "CreativeWork", "name": "My Project", ... }
 */
export function projectCreativeWorkSchema(project) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.description,
    image: project.image ? `${SITE_URL}${project.image}` : DEFAULT_OG_IMAGE,
    url: project.link || project.github || `${SITE_URL}/projects`,
    author: personSchemaCompact(),
  };
}

/**
 * CollectionPage schema for the Blog listing.
 * @returns {Object} CollectionPage structured data schema for the blog.
 *
 * @example
 * const schema = blogCollectionSchema();
 * // => { "@context": "https://schema.org", "@type": "CollectionPage", "name": "Blog | Rishabh Agrawal", ... }
 */
export function blogCollectionSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Blog | ${SITE_NAME}`,
    url: `${SITE_URL}/blog`,
    description:
      'Read articles on analytics, product thinking, and the intersection of data and creativity.',
    author: personSchemaCompact(),
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: blogs.length,
      itemListElement: blogs.map((blog, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: blog.title,
        url: blog.link,
        description: blog.summary,
      })),
    },
  };
}

/**
 * ContactPage schema.
 * @returns {Object} ContactPage structured data schema.
 *
 * @example
 * const schema = contactPageSchema();
 * // => { "@context": "https://schema.org", "@type": "ContactPage", "name": "Contact | Rishabh Agrawal", ... }
 */
export function contactPageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: `Contact | ${SITE_NAME}`,
    url: `${SITE_URL}/contact`,
    description:
      'Get in touch for collaborations, analytics consulting, or data storytelling projects.',
    mainEntity: {
      '@type': 'Person',
      name: resumeData.basics.name,
      email: `mailto:${resumeData.basics.email}`,
      telephone: resumeData.basics.phone,
      address: {
        '@type': 'PostalAddress',
        addressLocality: resumeData.basics.location.city,
        addressCountry: resumeData.basics.location.country,
      },
    },
  };
}

/**
 * FAQPage schema for Chatbot quick replies or general FAQs.
 * @returns {Object} FAQPage structured data schema.
 *
 * @example
 * const schema = faqSchema();
 * // => { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [ ... ] }
 */
export function faqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Tell me about your projects',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'I have built various projects spanning analytics, AI, and full-stack development. Check out my Projects page for more details.',
        },
      },
      {
        '@type': 'Question',
        name: 'What are your top skills?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'My core competencies include Python, Data Analytics, Machine Learning, React, Node.js, and Business Strategy.',
        },
      },
      {
        '@type': 'Question',
        name: 'How can I contact you?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can reach me via email at rishabh.agrawal25b@gim.ac.in or connect with me on LinkedIn and GitHub.',
        },
      },
    ],
  };
}

/**
 * Resume/CV page – Person with employment aggregate.
 * @returns {Object} Person structured data schema with employment history.
 *
 * @example
 * const schema = resumePersonSchema();
 * // => { "@context": "https://schema.org", "@type": "Person", "name": "Rishabh Agrawal", "jobTitle": "...", ... }
 */
export function resumePersonSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: resumeData.basics.name,
    url: `${SITE_URL}/resume`,
    jobTitle: resumeData.basics.title,
    worksFor: resumeData.experience[0]
      ? {
          '@type': 'Organization',
          name: resumeData.experience[0].company,
        }
      : undefined,
    alumniOf: resumeData.education.map(edu => ({
      '@type': 'EducationalOrganization',
      name: edu.institution,
    })),
    knowsAbout: resumeData.skills.flatMap(cat => cat.items.map(i => i.name)).slice(0, 20),
    hasCredential: resumeData.certifications.slice(0, 5).map(cert => ({
      '@type': 'EducationalOccupationalCredential',
      name: cert.name,
      recognizedBy: { '@type': 'Organization', name: cert.issuer },
    })),
  };
}
