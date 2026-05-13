import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import Blog from './Blog';

// Wrap render with HelmetProvider to avoid Helmet context errors
const renderWithProviders = (ui, options) => {
  return render(ui, { wrapper: HelmetProvider, ...options });
};

// Mock SEO module properly
vi.mock('../../utils/seo', async () => {
  const actual = await vi.importActual('../../utils/seo');
  return {
    ...actual,
    SEO_CONFIG: {
      title: 'Thoughts & Ideas',
      description: 'Articles, tutorials, and insights',
    },
    breadcrumbSchema: vi.fn().mockReturnValue({}),
    collectionPageSchema: vi.fn().mockReturnValue({}),
  };
});

// We need to keep some real utils and just mock the theme one
vi.mock('../shared/ThemedPrimitives.utils', async () => {
  const actual = await vi.importActual('../shared/ThemedPrimitives.utils');
  return {
    ...actual,
    useThemeStyles: () => ({ isLiquid: false }),
  };
});

// Avoid IntersectionObserver errors if any nested components use it
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('Blog component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWithProviders(<Blog />);
    // Verify something basic loads from the real component
    expect(screen.getByText('Written Thoughts')).toBeInTheDocument();
  });

  it('handles search input', () => {
    renderWithProviders(<Blog />);
    const searchInput = screen.getByPlaceholderText('Search blogs...');
    fireEvent.change(searchInput, { target: { value: 'Python' } });
    expect(searchInput.value).toBe('Python');
  });

  it('handles tab click', () => {
    renderWithProviders(<Blog />);
    const devToBtn = screen.getByRole('button', { name: 'Dev.to' });
    fireEvent.click(devToBtn);
    // Dev.to button should become active
    expect(devToBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('handles clear search', async () => {
    renderWithProviders(<Blog />);
    const searchInput = screen.getByPlaceholderText('Search blogs...');
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    expect(searchInput.value).toBe('test search');

    // Find the clear button which appears after typing
    const clearBtn = await screen.findByRole('button', { name: 'Clear search' });
    fireEvent.click(clearBtn);

    // Search should be cleared
    expect(searchInput.value).toBe('');
  });

  it('handles empty state', async () => {
    renderWithProviders(<Blog />);
    const searchInput = screen.getByPlaceholderText('Search blogs...');
    fireEvent.change(searchInput, {
      target: { value: 'This search query will definitely not match any blog post' },
    });

    // Empty state should appear
    expect(await screen.findByText('No articles found')).toBeInTheDocument();

    // Click clear filters button
    const clearFiltersBtn = await screen.findByRole('button', { name: 'Clear all filters' });
    fireEvent.click(clearFiltersBtn);

    // Search should be cleared
    expect(searchInput.value).toBe('');
  });

  it('handles pagination next and prev', async () => {
    renderWithProviders(<Blog />);

    // Initial page shows pagination if there are more than POSTS_PER_PAGE (6) posts
    // We expect the next button to be present and enabled
    const nextBtn = await screen.findByRole('button', { name: 'Go to next page' });
    expect(nextBtn).not.toBeDisabled();

    fireEvent.click(nextBtn);

    // Now previous button should be enabled
    const prevBtn = await screen.findByRole('button', { name: 'Go to previous page' });
    expect(prevBtn).not.toBeDisabled();

    fireEvent.click(prevBtn);

    // Back on page 1, prev should be disabled
    expect(prevBtn).toBeDisabled();
  });
});
