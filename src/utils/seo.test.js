import { describe, it, expect } from 'vitest';
import { blogCollectionSchema } from './seo';

describe('seo utils', () => {
  it('blogCollectionSchema returns valid schema with items', () => {
    const schema = blogCollectionSchema();
    expect(schema['@type']).toBe('CollectionPage');
    expect(schema.mainEntity['@type']).toBe('ItemList');
    expect(schema.mainEntity.itemListElement.length).toBeGreaterThan(0);
    expect(schema.mainEntity.itemListElement[0]['@type']).toBe('ListItem');
    expect(schema.mainEntity.itemListElement[0].name).toBeDefined();
    expect(schema.mainEntity.itemListElement[0].url).toBeDefined();
  });
});
