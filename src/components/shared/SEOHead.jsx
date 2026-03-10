/**
 * @fileoverview Reusable SEO head component that injects meta tags via React Helmet.
 *
 * Usage:
 * ```jsx
 * <SEOHead
 *   title="Projects"
 *   description="Explore my projects."
 *   path="/projects"
 *   schemas={[breadcrumbSchema([...]), projectsCollectionSchema()]}
 * />
 * ```
 */

import React, { useMemo } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { safeJSONStringify } from '../../utils/security';
import {
  SITE_URL,
  SITE_NAME,
  SITE_TITLE_SUFFIX,
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_ALT,
  DEFAULT_SEO_KEYWORDS,
  TWITTER_HANDLE,
  LOCALE,
  SITE_LANGUAGE,
} from '../../utils/seo';

/**
 * @param {Object} props
 * @param {string}  props.title        — Page title (will have " | Rishabh Agrawal" appended)
 * @param {string}  props.description  — Meta description (≤155 chars recommended)
 * @param {string}  props.path         — Pathname, e.g. "/projects" (used for canonical + OG url)
 * @param {string}  [props.ogImage]    — Override og:image URL
 * @param {string}  [props.ogType]     — Override og:type (default "website")
 * @param {string}  [props.ogImageAlt] — Override OG/Twitter image alt text
 * @param {string}  [props.keywords]   — Comma separated keywords
 * @param {boolean} [props.noindex]    — If true, add noindex,nofollow
 * @param {Array}   [props.schemas]    — Array of JSON-LD schema objects to inject
 * @param {string}  [props.author]     — Override author name
 * @param {React.ReactNode} [props.children] — Extra <Helmet> children
 */
const SEOHead = ({
  title,
  description,
  path = '/',
  ogImage,
  ogType = 'website',
  ogImageAlt = DEFAULT_OG_IMAGE_ALT,
  keywords = DEFAULT_SEO_KEYWORDS,
  noindex = false,
  schemas = [],
  author,
  children,
}) => {
  const fullTitle = path === '/' ? title : `${title} ${SITE_TITLE_SUFFIX}`;
  const canonicalUrl = `${SITE_URL}${path}`;
  const resolvedImage = ogImage || DEFAULT_OG_IMAGE;
  const resolvedAuthor = author || SITE_NAME;

  // Memoize serialized schemas
  const serializedSchemas = useMemo(() => schemas.map(s => safeJSONStringify(s)), [schemas]);

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <link rel="canonical" href={canonicalUrl} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={resolvedAuthor} />
      <meta name="language" content={SITE_LANGUAGE} />

      {/* Robots */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />
      )}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={resolvedImage} />
      <meta property="og:image:alt" content={ogImageAlt} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content={LOCALE} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={resolvedImage} />
      <meta name="twitter:image:alt" content={ogImageAlt} />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:creator" content={TWITTER_HANDLE} />
      <link rel="alternate" hrefLang="en" href={canonicalUrl} />
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

      {/* JSON-LD Structured Data */}
      {serializedSchemas.map((json, i) => (
        <script
          key={i}
          type="application/ld+json"
          // SECURITY: safeJSONStringify escapes dangerous HTML characters (<, >, &, ', and line separators) to prevent XSS.
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: json }}
        />
      ))}

      {children}
    </Helmet>
  );
};

export default SEOHead;
