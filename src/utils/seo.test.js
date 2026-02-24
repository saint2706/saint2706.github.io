import { describe, it, expect, vi, afterEach } from 'vitest';
import * as seo from './seo';

// Default Mock dependencies
vi.mock('../data/resume', () => ({
  resumeData: {
    basics: {
      name: 'Test User',
      title: 'Test Title',
      email: 'test@example.com',
      phone: '+1234567890',
      website: 'https://test.com',
      summary: 'Test summary',
      location: { city: 'Test City', country: 'Test Country' },
      socials: [{ url: 'https://social.com', network: 'Social' }],
    },
    education: [{ institution: 'Test Uni', area: 'CS' }],
    experience: [{ company: 'Test Corp', position: 'Dev' }],
    skills: [{ category: 'Tech', items: [{ name: 'React' }] }],
    certifications: [{ name: 'Test Cert', issuer: 'Issuer' }],
    projects: [
      {
        title: 'Project 1',
        link: 'https://p1.com',
        description: 'Desc 1',
      },
      {
        title: 'Project 2',
        github: 'https://github.com/p2',
        description: 'Desc 2',
      },
    ],
  },
}));

vi.mock('../data/blogs.json', () => ({
  default: [{ title: 'Blog 1', link: 'https://blog.com/1', summary: 'Summary 1' }],
}));

describe('seo utils', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Constants', () => {
    it('exports correct constants based on mocked data', () => {
      expect(seo.SITE_URL).toBe('https://test.com');
      expect(seo.SITE_NAME).toBe('Rishabh Agrawal');
      expect(seo.DEFAULT_OG_IMAGE).toBe('https://test.com/og-image.png');
    });
  });

  describe('websiteSchema', () => {
    it('returns valid WebSite schema', () => {
      const schema = seo.websiteSchema();
      expect(schema['@type']).toBe('WebSite');
      expect(schema.name).toBe(seo.SITE_NAME);
      expect(schema.url).toBe('https://test.com');
      expect(schema.author['@type']).toBe('Person');
      expect(schema.potentialAction['@type']).toBe('SearchAction');
    });
  });

  describe('personSchemaCompact', () => {
    it('returns compact Person schema', () => {
      const schema = seo.personSchemaCompact();
      expect(schema['@type']).toBe('Person');
      expect(schema.name).toBe('Test User');
      expect(schema.url).toBe('https://test.com');
    });
  });

  describe('personSchemaFull', () => {
    it('returns full Person schema', () => {
      const schema = seo.personSchemaFull();
      expect(schema['@type']).toBe('Person');
      expect(schema.name).toBe('Test User');
      expect(schema.jobTitle).toBe('Test Title');
      expect(schema.email).toBe('mailto:test@example.com');
      expect(schema.address.addressLocality).toBe('Test City');
      expect(schema.sameAs).toContain('https://social.com');
      expect(schema.alumniOf).toHaveLength(1);
      expect(schema.alumniOf[0].name).toBe('Test Uni');
      expect(schema.knowsAbout).toContain('React');
      expect(schema.hasCredential[0].name).toBe('Test Cert');
    });
  });

  describe('profilePageSchema', () => {
    it('returns ProfilePage schema', () => {
      const schema = seo.profilePageSchema();
      expect(schema['@type']).toBe('ProfilePage');
      expect(schema.mainEntity['@type']).toBe('Person');
      expect(schema.name).toContain('Test User');
    });
  });

  describe('breadcrumbSchema', () => {
    it('returns BreadcrumbList schema', () => {
      const items = [
        { name: 'Home', url: '/' },
        { name: 'About', url: '/about' },
      ];
      const schema = seo.breadcrumbSchema(items);
      expect(schema['@type']).toBe('BreadcrumbList');
      expect(schema.itemListElement).toHaveLength(2);
      expect(schema.itemListElement[0].position).toBe(1);
      expect(schema.itemListElement[0].name).toBe('Home');
      expect(schema.itemListElement[1].position).toBe(2);
      expect(schema.itemListElement[1].name).toBe('About');
    });
  });

  describe('projectsCollectionSchema', () => {
    it('returns CollectionPage schema for projects', () => {
      const schema = seo.projectsCollectionSchema();
      expect(schema['@type']).toBe('CollectionPage');
      expect(schema.mainEntity['@type']).toBe('ItemList');
      expect(schema.mainEntity.itemListElement).toHaveLength(2);
      expect(schema.mainEntity.itemListElement[0].name).toBe('Project 1');
      expect(schema.mainEntity.itemListElement[0].url).toBe('https://p1.com');
      expect(schema.mainEntity.itemListElement[1].url).toBe('https://github.com/p2');
    });

    it('uses default URL when both link and github are missing', async () => {
      vi.resetModules();
      vi.doMock('../data/resume', () => ({
        resumeData: {
          basics: { website: 'https://test.com' },
          projects: [
            {
              title: 'Project No Link',
              description: 'Desc',
            },
          ],
        },
      }));

      const seoModule = await import('./seo');
      const schema = seoModule.projectsCollectionSchema();

      expect(schema.mainEntity.itemListElement[0].url).toBe('https://test.com/projects');
    });
  });

  describe('blogCollectionSchema', () => {
    it('returns CollectionPage schema for blogs', () => {
      const schema = seo.blogCollectionSchema();
      expect(schema['@type']).toBe('CollectionPage');
      expect(schema.mainEntity.itemListElement).toHaveLength(1);
      expect(schema.mainEntity.itemListElement[0].name).toBe('Blog 1');
    });
  });

  describe('contactPageSchema', () => {
    it('returns ContactPage schema', () => {
      const schema = seo.contactPageSchema();
      expect(schema['@type']).toBe('ContactPage');
      expect(schema.mainEntity.email).toBe('mailto:test@example.com');
    });
  });

  describe('resumePersonSchema', () => {
    it('returns Person schema with work history', () => {
      const schema = seo.resumePersonSchema();
      expect(schema['@type']).toBe('Person');
      expect(schema.worksFor.name).toBe('Test Corp');
    });

    it('handles empty experience correctly', async () => {
      vi.resetModules();
      vi.doMock('../data/resume', () => ({
        resumeData: {
          basics: {
            name: 'Test User',
            title: 'Test Title',
            email: 'test@example.com',
            phone: '+1234567890',
            website: 'https://test.com',
            summary: 'Test summary',
            location: { city: 'Test City', country: 'Test Country' },
            socials: [],
            languages: [],
          },
          education: [],
          experience: [], // Empty experience
          skills: [],
          certifications: [],
          projects: [],
        },
      }));

      // Re-import the module to pick up the new mock
      const seoModule = await import('./seo');
      const schema = seoModule.resumePersonSchema();

      expect(schema['@type']).toBe('Person');
      expect(schema.worksFor).toBeUndefined();
    });
  });
});
