import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// First, mock the imports that throw when Prism is not on the window
vi.mock('prismjs/themes/prism-tomorrow.css', () => ({}));
vi.mock('prismjs/components/prism-python', () => ({}));
vi.mock('prismjs/components/prism-css', () => ({}));

const { mockFn } = vi.hoisted(() => ({ mockFn: vi.fn() }));

vi.mock('prismjs', () => ({
  default: {
    highlightElement: mockFn,
  },
}));

// We must import the component after mocking to avoid the reference error
import SyntaxHighlighter from './SyntaxHighlighter';

describe('SyntaxHighlighter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<SyntaxHighlighter code="console.log('test');" language="js" />);
    const codeElement = screen.getByText("console.log('test');");
    expect(codeElement).toBeInTheDocument();
    expect(codeElement).toHaveClass('language-javascript');
    expect(mockFn).toHaveBeenCalled();
  });

  it('handles python', () => {
    render(<SyntaxHighlighter code="print('hello')" language="python" />);
    const codeElement = screen.getByText("print('hello')");
    expect(codeElement).toHaveClass('language-python');
  });

  it('handles css', () => {
    render(<SyntaxHighlighter code=".test { color: red; }" language="css" />);
    const codeElement = screen.getByText('.test { color: red; }');
    expect(codeElement).toHaveClass('language-css');
  });

  it('handles javascript', () => {
    render(<SyntaxHighlighter code="console.log('test');" language="javascript" />);
    const codeElement = screen.getByText("console.log('test');");
    expect(codeElement).toHaveClass('language-javascript');
  });

  it('handles unknown languages', () => {
    render(<SyntaxHighlighter code="print('hello')" language="unknown" />);
    const codeElement = screen.getByText("print('hello')");
    expect(codeElement).toHaveClass('language-unknown');
  });
});
