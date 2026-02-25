import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatInterface, { LinkRenderer, ImageRenderer, CodeRenderer } from './ChatInterface';
import * as aiService from '../../services/ai';
import * as storage from '../../utils/storage';
import React from 'react';

// Mock AI Service
vi.mock('../../services/ai', () => ({
  chatWithGemini: vi.fn(),
  sanitizeHistoryForGemini: vi.fn(h => h), // identity mock
}));

// Mock Storage
vi.mock('../../utils/storage', () => ({
  safeGetLocalStorage: vi.fn(),
  safeSetLocalStorage: vi.fn(),
  safeRemoveLocalStorage: vi.fn(),
}));

// Mock Theme Context
vi.mock('./theme-context', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    useTheme: vi.fn(),
  };
});
import { useTheme } from './theme-context';

// Mock Framer Motion
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    AnimatePresence: ({ children }) => <>{children}</>,
    motion: {
      div: ({ children, ...props }) => <div {...props}>{children}</div>,
      nav: ({ children, ...props }) => <nav {...props}>{children}</nav>,
    },
    useReducedMotion: () => false,
  };
});

// Mock SyntaxHighlighter to avoid lazy loading issues in tests
vi.mock('./SyntaxHighlighter', () => ({
  default: ({ code, language }) => (
    <pre data-testid="syntax-highlighter" data-language={language}>
      {code}
    </pre>
  ),
}));

// Mock ScrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// Mock Navigator Clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

describe('ChatInterface Subcomponents', () => {
  describe('LinkRenderer', () => {
    it('renders safe links correctly', () => {
      render(<LinkRenderer href="https://example.com">Safe Link</LinkRenderer>);
      const link = screen.getByRole('link', { name: 'Safe Link' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'https://example.com');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('renders unsafe links as text', () => {
      render(<LinkRenderer href="javascript:alert(1)">Unsafe Link</LinkRenderer>);
      const link = screen.queryByRole('link');
      expect(link).not.toBeInTheDocument();
      expect(screen.getByText('Unsafe Link')).toBeInTheDocument();
    });
  });

  describe('ImageRenderer', () => {
    it('renders safe images correctly', () => {
      render(<ImageRenderer src="https://example.com/image.png" alt="Test Image" />);
      const img = screen.getByRole('img', { name: 'Test Image' });
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://example.com/image.png');
    });

    it('renders fallback for unsafe images', () => {
      render(<ImageRenderer src="javascript:alert(1)" alt="Unsafe Image" />);
      const img = screen.queryByRole('img');
      expect(img).not.toBeInTheDocument();
      expect(screen.getByText('[Image blocked for security]')).toBeInTheDocument();
    });
  });

  describe('CodeRenderer', () => {
    it('renders inline code correctly', () => {
      render(<CodeRenderer>const x = 1;</CodeRenderer>);
      // Inline code usually renders as a <code> element without SyntaxHighlighter
      const code = screen.getByText('const x = 1;');
      expect(code.tagName).toBe('CODE');
    });

    it('renders code blocks with syntax highlighter and copy button', async () => {
      // Mock node prop to simulate block code
      const node = {
        position: {
          start: { line: 1 },
          end: { line: 3 },
        },
      };

      render(
        <CodeRenderer className="language-js" node={node}>
          {'console.log("test");'}
        </CodeRenderer>
      );

      // Check for SyntaxHighlighter mock
      await waitFor(() => {
        expect(screen.getByTestId('syntax-highlighter')).toBeInTheDocument();
      });
      expect(screen.getByText('console.log("test");')).toBeInTheDocument();

      // Check for copy button
      const copyButton = screen.getByLabelText('Copy code to clipboard');
      expect(copyButton).toBeInTheDocument();

      // Test copy functionality
      fireEvent.click(copyButton);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('console.log("test");');

      // Check if button state changes (optimistic update)
      await waitFor(() => {
        expect(screen.getByLabelText('Copied code')).toBeInTheDocument();
      });
    });
  });
});

describe('ChatInterface', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useTheme.mockReturnValue({ theme: 'neubrutalism', toggleTheme: vi.fn() });
    storage.safeGetLocalStorage.mockReturnValue(null);
  });

  it('renders correctly', () => {
    render(<ChatInterface onClose={mockOnClose} />);

    expect(screen.getByText('Digital Rishabh')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByLabelText('Close chat (Escape)')).toBeInTheDocument();
  });

  it('loads history from local storage', () => {
    const mockHistory = [
      { id: '1', role: 'user', text: 'Hello' },
      { id: '2', role: 'model', text: 'Hi there' },
    ];
    storage.safeGetLocalStorage.mockReturnValue(JSON.stringify(mockHistory));

    render(<ChatInterface onClose={mockOnClose} />);

    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there')).toBeInTheDocument();
  });

  it('sends a message and displays response', async () => {
    aiService.chatWithGemini.mockResolvedValue('I am good');

    render(<ChatInterface onClose={mockOnClose} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'How are you?' } });

    const sendButton = screen.getByLabelText('Send message');
    fireEvent.click(sendButton);

    expect(screen.getByText('How are you?')).toBeInTheDocument();
    expect(input).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByText('I am good')).toBeInTheDocument();
    });

    expect(aiService.chatWithGemini).toHaveBeenCalledWith('How are you?', expect.any(Array));
  });

  it('handles cleared history', async () => {
    const mockHistory = [
      { id: '1', role: 'user', text: 'Hello' },
      { id: '2', role: 'model', text: 'Hi there' },
    ];
    storage.safeGetLocalStorage.mockReturnValue(JSON.stringify(mockHistory));

    render(<ChatInterface onClose={mockOnClose} />);

    expect(screen.getByText('Hello')).toBeInTheDocument();

    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);

    expect(screen.getByText('Confirm?')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Confirm?'));

    await waitFor(() => {
      expect(screen.queryByText('Hello')).not.toBeInTheDocument();
      expect(storage.safeRemoveLocalStorage).toHaveBeenCalled();
    });
  });

  it('handles quick replies', async () => {
    aiService.chatWithGemini.mockResolvedValue('AI Response');

    render(<ChatInterface onClose={mockOnClose} />);

    const quickReply = screen.getByText('Tell me about your projects');
    fireEvent.click(quickReply);

    await waitFor(() => {
      expect(aiService.chatWithGemini).toHaveBeenCalledWith(
        'Tell me about your projects',
        expect.any(Array)
      );
      expect(screen.getByText('AI Response')).toBeInTheDocument();
    });
  });

  it('closes on escape key', () => {
    render(<ChatInterface onClose={mockOnClose} />);

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('renders markdown content correctly', () => {
    const mockHistory = [
      {
        id: '1',
        role: 'model',
        text: 'Link: [Google](https://google.com)\nImage: ![Alt Text](https://example.com/image.png)\nCode: `console.log("hello")`',
      },
    ];
    storage.safeGetLocalStorage.mockReturnValue(JSON.stringify(mockHistory));

    render(<ChatInterface onClose={mockOnClose} />);

    const link = screen.getByText('Google');
    expect(link).toHaveAttribute('href', 'https://google.com');
    expect(link).toHaveAttribute('target', '_blank');

    const image = screen.getByAltText('Alt Text');
    expect(image).toHaveAttribute('src', 'https://example.com/image.png');

    expect(screen.getByText('console.log("hello")')).toBeInTheDocument();
  });

  it('displays error message from AI service', async () => {
    aiService.chatWithGemini.mockResolvedValue('I seem to be having a connection glitch.');

    render(<ChatInterface onClose={mockOnClose} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Crash' } });
    fireEvent.click(screen.getByLabelText('Send message'));

    await waitFor(() => {
      expect(screen.getByText('I seem to be having a connection glitch.')).toBeInTheDocument();
    });
  });

  it('updates character count and validates input', () => {
    render(<ChatInterface onClose={mockOnClose} />);
    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: 'a'.repeat(450) } });
    expect(screen.getByText('450/500')).toHaveClass('text-orange-500');

    fireEvent.change(input, { target: { value: 'a'.repeat(500) } });
    expect(screen.getByText('500/500')).toHaveClass('text-red-500');

    expect(input).toHaveAttribute('maxLength', '500');
  });

  it('disables send button when input is empty', () => {
    render(<ChatInterface onClose={mockOnClose} />);
    const sendButton = screen.getByLabelText('Send message');
    expect(sendButton).toBeDisabled();

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '  ' } }); // Whitespace only
    expect(sendButton).toBeDisabled();

    fireEvent.change(input, { target: { value: 'Hi' } });
    expect(sendButton).not.toBeDisabled();
  });

  it('handles API errors gracefully', async () => {
    // Mock console.error to avoid noise
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    aiService.chatWithGemini.mockRejectedValue(new Error('Network Error'));

    render(<ChatInterface onClose={mockOnClose} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(screen.getByLabelText('Send message'));

    // Should wait for loading to finish
    await waitFor(() => {
      expect(input).not.toBeDisabled();
    });

    // Verify error was logged
    expect(consoleSpy).toHaveBeenCalledWith('Failed to send message', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('applies liquid theme classes', () => {
    useTheme.mockReturnValue({ theme: 'liquid' });
    render(<ChatInterface onClose={mockOnClose} />);

    // Check for a known liquid theme class
    const botIconContainer =
      screen.getByText('Digital Rishabh').parentElement.previousElementSibling;
    expect(botIconContainer).toHaveClass('lg-surface-3');
  });
});
