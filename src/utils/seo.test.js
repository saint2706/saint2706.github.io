import { describe, it, expect } from 'vitest';
import {
  websiteSchema,
  personSchemaCompact,
  personSchemaFull,
  profilePageSchema,
  breadcrumbSchema,
  projectsCollectionSchema,
  blogCollectionSchema,
  contactPageSchema,
  resumePersonSchema,
  SITE_NAME,
  SITE_URL,
} from './seo';
import { resumeData } from '../data/resume';

describe('SEO Utils', () => {
  describe('websiteSchema', () => {
    it('returns valid WebSite schema', () => {
      const schema = websiteSchema();
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('WebSite');
      expect(schema.name).toBe(SITE_NAME);
      expect(schema.url).toBe(SITE_URL);
      expect(schema.description).toBe(resumeData.basics.summary);
      expect(schema.author).toEqual(personSchemaCompact());
      expect(schema.potentialAction).toBeDefined();
      expect(schema.potentialAction['@type']).toBe('SearchAction');
    });
  });

  describe('personSchemaCompact', () => {
    it('returns valid compact Person schema', () => {
      const schema = personSchemaCompact();
      expect(schema['@type']).toBe('Person');
      expect(schema.name).toBe(resumeData.basics.name);
      expect(schema.url).toBe(SITE_URL);
    });
  });

  describe('personSchemaFull', () => {
    it('returns valid full Person schema', () => {
      const schema = personSchemaFull();
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('Person');
      expect(schema.name).toBe(resumeData.basics.name);
      expect(schema.url).toBe(SITE_URL);
      expect(schema.email).toBe(`mailto:${resumeData.basics.email}`);
      expect(schema.telephone).toBe(resumeData.basics.phone);
      expect(schema.address).toBeDefined();
      expect(schema.sameAs).toHaveLength(resumeData.basics.socials.length);
      expect(schema.alumniOf).toHaveLength(resumeData.education.length);
    });
  });

  describe('profilePageSchema', () => {
    it('returns valid ProfilePage schema', () => {
      const schema = profilePageSchema();
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('ProfilePage');
      expect(schema.mainEntity).toEqual(personSchemaFull());
      expect(schema.name).toContain(resumeData.basics.name);
    });
  });

  describe('breadcrumbSchema', () => {
    it('returns valid BreadcrumbList schema', () => {
      const items = [
        { name: 'Home', url: '/' },
        { name: 'About', url: '/about' },
      ];
      const schema = breadcrumbSchema(items);
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('BreadcrumbList');
      expect(schema.itemListElement).toHaveLength(2);
      expect(schema.itemListElement[0].position).toBe(1);
      expect(schema.itemListElement[0].name).toBe('Home');
      expect(schema.itemListElement[1].position).toBe(2);
      expect(schema.itemListElement[1].name).toBe('About');
    });
  });

  describe('projectsCollectionSchema', () => {
    it('returns valid CollectionPage schema for projects', () => {
      const schema = projectsCollectionSchema();
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('CollectionPage');
      expect(schema.mainEntity['@type']).toBe('ItemList');
      expect(schema.mainEntity.numberOfItems).toBe(resumeData.projects.length);
      expect(schema.mainEntity.itemListElement).toHaveLength(resumeData.projects.length);
    });
  });

  describe('blogCollectionSchema', () => {
    it('returns valid CollectionPage schema for blog', () => {
      const schema = blogCollectionSchema();
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('CollectionPage');
      expect(schema.author).toEqual(personSchemaCompact());
    });
  });

  describe('contactPageSchema', () => {
    it('returns valid ContactPage schema', () => {
      const schema = contactPageSchema();
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('ContactPage');
      expect(schema.mainEntity['@type']).toBe('Person');
      expect(schema.mainEntity.email).toBe(`mailto:${resumeData.basics.email}`);
    });
  });

  describe('resumePersonSchema', () => {
    it('returns valid Person schema for resume', () => {
      const schema = resumePersonSchema();
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('Person');
      expect(schema.jobTitle).toBe(resumeData.basics.title);

      if (resumeData.experience.length > 0) {
        expect(schema.worksFor).toBeDefined();
        expect(schema.worksFor.name).toBe(resumeData.experience[0].company);
      }
    });
  });
});
