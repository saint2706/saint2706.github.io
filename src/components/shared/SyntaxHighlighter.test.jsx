import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import SyntaxHighlighter from './SyntaxHighlighter';
import Prism from 'prismjs';

// Mock Prism.js to avoid errors with sub-imports
vi.mock('prismjs', () => ({
  default: {
    highlightElement: vi.fn(),
  },
}));

// We need to mock the components so they don't try to register with a real Prism
vi.mock('prismjs/components/prism-python', () => ({}));
vi.mock('prismjs/components/prism-css', () => ({}));
vi.mock('prismjs/themes/prism-tomorrow.css', () => ({}));

describe('SyntaxHighlighter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with given code and language', () => {
    const { container } = render(<SyntaxHighlighter code="print('hello')" language="python" />);
    const codeElement = container.querySelector('code');

    expect(codeElement).toBeInTheDocument();
    expect(codeElement).toHaveTextContent("print('hello')");
    expect(codeElement).toHaveClass('language-python');
    expect(Prism.highlightElement).toHaveBeenCalledWith(codeElement);
  });

  it('maps "js" to "javascript"', () => {
    const { container } = render(<SyntaxHighlighter code="console.log('hi')" language="js" />);
    const codeElement = container.querySelector('code');

    expect(codeElement).toHaveClass('language-javascript');
  });

  it('uses provided language if not mapped', () => {
    const { container } = render(<SyntaxHighlighter code="<div>hello</div>" language="html" />);
    const codeElement = container.querySelector('code');

    expect(codeElement).toHaveClass('language-html');
  });
});
