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

export const SITE_URL = resumeData.basics.website;
export const SITE_NAME = 'Rishabh Agrawal';
export const SITE_TITLE_SUFFIX = '| Rishabh Agrawal';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
export const TWITTER_HANDLE = '@saint2706'; // update if you have one
export const LOCALE = 'en_US';
export const THEME_COLOR = '#1e1e2e'; // dark background

/* ──────────────────────────────────────────────────────── */
/*  JSON-LD Schema Generators                              */
/* ──────────────────────────────────────────────────────── */

/**
 * WebSite schema – enables Google Sitelinks search box.
 * Should be injected on the homepage only.
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
 * Compact Person reference (used as nested author/creator).
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
 * CollectionPage schema for the Blog listing.
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
 * Resume/CV page – Person with employment aggregate.
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
