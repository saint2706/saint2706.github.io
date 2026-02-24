import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ThemedButton from './ThemedButton';

// Mock useTheme hook
vi.mock('./theme-context', () => ({
  useTheme: () => ({ theme: 'neubrutalism' }),
}));

describe('ThemedButton', () => {
  it('renders children correctly', () => {
    render(<ThemedButton>Click me</ThemedButton>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('shows loading spinner and disables button when isLoading is true', () => {
    render(<ThemedButton isLoading>Click me</ThemedButton>);
    const button = screen.getByRole('button', { name: /click me/i });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');

    // Check for spinner
    // We can find it by the unique class name we added 'animate-spin'
    // Since we are using React Testing Library, we can use container.querySelector
    const spinner = button.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('does not show spinner when isLoading is false', () => {
    render(<ThemedButton>Click me</ThemedButton>);
    const button = screen.getByRole('button', { name: /click me/i });

    expect(button).not.toBeDisabled();

    const spinner = button.querySelector('.animate-spin');
    expect(spinner).not.toBeInTheDocument();
  });

  it('applies different styles based on theme', () => {
    // This test relies on the mock returning 'neubrutalism'
    const { container } = render(<ThemedButton variant="primary">Themed</ThemedButton>);
    // Neubrutalism primary has 'bg-fun-yellow'
    expect(container.firstChild).toHaveClass('bg-fun-yellow');
  });
});
