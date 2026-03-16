import { describe, it, expect, vi } from 'vitest';

vi.mock('../data/resume', () => {
  return {
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
        {
          title: 'Project No Link',
          description: 'Desc',
        },
      ],
    },
  };
});

vi.mock('../data/blogs.json', () => {
  return {
    default: [{ title: 'Blog 1', link: 'https://blog.com/1', summary: 'Summary 1' }],
  };
});

import * as seo from './seo';

describe('seo utils', () => {
  describe('Constants', () => {
    it('exports correct constants based on mocked data', () => {
      expect(seo.SITE_URL).toBe('https://test.com');
      expect(seo.SITE_NAME).toBe('Rishabh Agrawal');
      expect(seo.DEFAULT_OG_IMAGE).toBe('https://test.com/og-image.png');
      expect(seo.SITE_LANGUAGE).toBe('en');
      expect(seo.DEFAULT_OG_IMAGE_ALT).toContain('Rishabh Agrawal');
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

  describe('organizationSchema', () => {
    it('returns Organization schema', () => {
      const schema = seo.organizationSchema();
      expect(schema['@type']).toBe('Organization');
      expect(schema.name).toBe('Rishabh Agrawal');
      expect(schema.logo).toBe('https://test.com/og-image.png');
      expect(schema.sameAs).toContain('https://social.com');
      expect(schema.founder['@type']).toBe('Person');
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
      expect(schema.mainEntity.itemListElement).toHaveLength(3);
      expect(schema.mainEntity.itemListElement[0].name).toBe('Project 1');
      expect(schema.mainEntity.itemListElement[0].url).toBe('https://p1.com');
      expect(schema.mainEntity.itemListElement[1].url).toBe('https://github.com/p2');
      expect(schema.mainEntity.itemListElement[2].url).toBe('https://test.com/projects');
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

  describe('blogPostingSchema', () => {
    it('returns TechArticle schema for a blog post', () => {
      const blog = {
        title: 'Blog Post Title',
        summary: 'This is a summary.',
        link: 'https://blog.com/post-1',
        date: '2023-01-01',
        source: 'Medium',
        tags: ['React', 'JavaScript'],
      };
      const schema = seo.blogPostingSchema(blog);
      expect(schema['@type']).toBe('TechArticle');
      expect(schema.headline).toBe('Blog Post Title');
      expect(schema.keywords).toBe('React, JavaScript');
      expect(schema.image).toBe(seo.DEFAULT_OG_IMAGE); // since no coverImage
    });

    it('uses cover image and handles missing tags', () => {
      const blog = {
        title: 'Blog Post Title',
        summary: 'This is a summary.',
        link: 'https://blog.com/post-1',
        date: '2023-01-01',
        source: 'Medium',
        coverImage: 'https://test.com/cover.jpg',
      };
      const schema = seo.blogPostingSchema(blog);
      expect(schema.image).toBe('https://test.com/cover.jpg');
      expect(schema.keywords).toBeUndefined();
    });
  });

  describe('contactPageSchema', () => {
    it('returns ContactPage schema', () => {
      const schema = seo.contactPageSchema();
      expect(schema['@type']).toBe('ContactPage');
      expect(schema.mainEntity.email).toBe('mailto:test@example.com');
    });
  });

  describe('gamesSchema', () => {
    it('returns SoftwareApplication schema for games', () => {
      const schema = seo.gamesSchema();
      expect(schema['@type']).toBe('SoftwareApplication');
      expect(schema.name).toBe('Interactive Mini-Games');
      expect(schema.author['@type']).toBe('Person');
    });
  });

  describe('playgroundSchema', () => {
    it('returns SoftwareApplication schema for playground', () => {
      const schema = seo.playgroundSchema();
      expect(schema['@type']).toBe('SoftwareApplication');
      expect(schema.name).toBe('Python Playground');
      expect(schema.author['@type']).toBe('Person');
    });
  });

  describe('faqSchema', () => {
    it('returns FAQPage schema', () => {
      const schema = seo.faqSchema();
      expect(schema['@type']).toBe('FAQPage');
      expect(schema.mainEntity.length).toBeGreaterThan(0);
      expect(schema.mainEntity[0]['@type']).toBe('Question');
    });
  });

  describe('resumePersonSchema', () => {
    it('returns Person schema with work history', () => {
      const schema = seo.resumePersonSchema();
      expect(schema['@type']).toBe('Person');
      expect(schema.worksFor.name).toBe('Test Corp');
    });
  });

  describe('projectCreativeWorkSchema', () => {
    it('returns CreativeWork schema with project details', () => {
      const project = {
        title: 'Test Project',
        description: 'Test Description',
        image: '/test.png',
        link: 'https://test.com',
      };
      const schema = seo.projectCreativeWorkSchema(project);
      expect(schema['@type']).toBe('CreativeWork');
      expect(schema.name).toBe('Test Project');
      expect(schema.image).toBe('https://test.com/test.png');
      expect(schema.url).toBe('https://test.com');
    });

    it('handles projects without images and links', () => {
      const project = {
        title: 'Test Project',
        description: 'Test Description',
      };
      const schema = seo.projectCreativeWorkSchema(project);
      expect(schema.image).toBe(seo.DEFAULT_OG_IMAGE);
      expect(schema.url).toBe('https://test.com/projects');
    });

    it('uses github link if main link is not available', () => {
      const project = {
        title: 'Test Project',
        description: 'Test Description',
        github: 'https://github.com/test',
      };
      const schema = seo.projectCreativeWorkSchema(project);
      expect(schema.url).toBe('https://github.com/test');
    });
  });

  describe('edge cases', () => {
    it('resumePersonSchema handles empty experience correctly', async () => {
      vi.resetModules();
      vi.doMock('../data/resume', () => {
        return {
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
            experience: [], // Empty experience
            skills: [{ category: 'Tech', items: [{ name: 'React' }] }],
            certifications: [{ name: 'Test Cert', issuer: 'Issuer' }],
            projects: [],
          },
        };
      });
      const newSeo = await import('./seo');
      const schema = newSeo.resumePersonSchema();
      expect(schema.worksFor).toBeUndefined();
    });
  });
});
