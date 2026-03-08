import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ChatInterface from './ChatInterface';
import * as aiService from '../../services/ai';
import * as storage from '../../utils/storage';

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

// Mock ScrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// Mock Clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
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

  it('applies liquid theme classes', () => {
    useTheme.mockReturnValue({ theme: 'liquid' });
    render(<ChatInterface onClose={mockOnClose} />);

    // Check for a known liquid theme class
    const botIconContainer =
      screen.getByText('Digital Rishabh').parentElement.previousElementSibling;
    expect(botIconContainer).toHaveClass('lg-surface-3');
  });

  it('renders safe and unsafe links correctly', () => {
    const mockHistory = [
      {
        id: '1',
        role: 'model',
        text: 'Safe: [Google](https://google.com)\nUnsafe: [Bad](javascript:alert(1))',
      },
    ];
    storage.safeGetLocalStorage.mockReturnValue(JSON.stringify(mockHistory));

    render(<ChatInterface onClose={mockOnClose} />);

    const safeLink = screen.getByText('Google');
    expect(safeLink.tagName).toBe('A');
    expect(safeLink).toHaveAttribute('href', 'https://google.com');

    const unsafeLink = screen.getByText('Bad');
    expect(unsafeLink.tagName).toBe('SPAN');
    expect(unsafeLink).not.toHaveAttribute('href');
  });

  it('renders safe and unsafe images correctly', () => {
    const mockHistory = [
      {
        id: '1',
        role: 'model',
        text: 'Safe: ![Safe Image](https://example.com/safe.png)\nUnsafe: ![Unsafe Image](javascript:alert(1))',
      },
    ];
    storage.safeGetLocalStorage.mockReturnValue(JSON.stringify(mockHistory));

    render(<ChatInterface onClose={mockOnClose} />);

    const safeImage = screen.getByAltText('Safe Image');
    expect(safeImage.tagName).toBe('IMG');
    expect(safeImage).toHaveAttribute('src', 'https://example.com/safe.png');

    const unsafeImage = screen.getByText('[Image blocked for security]');
    expect(unsafeImage).toBeInTheDocument();
  });

  it('handles code block copy', async () => {
    const mockHistory = [
      {
        id: '1',
        role: 'model',
        text: '```javascript\nconsole.log("hello");\n```',
      },
    ];
    storage.safeGetLocalStorage.mockReturnValue(JSON.stringify(mockHistory));

    const { unmount } = render(<ChatInterface onClose={mockOnClose} />);

    // The copy button is available on blocks, not inline.
    const copyButton = await screen.findByRole(
      'button',
      { name: /copy code to clipboard/i },
      { timeout: 3000 }
    );

    await act(async () => {
      await fireEvent.click(copyButton);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('console.log("hello");');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /copied code/i })).toBeInTheDocument();
    });

    await waitFor(
      () => {
        expect(screen.queryByRole('button', { name: /copied code/i })).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    unmount();
  });

  it('handles component unmount during code copy timeout', async () => {
    const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    const mockHistory = [
      {
        id: '1',
        role: 'model',
        text: '```javascript\nconsole.log("hello");\n```',
      },
    ];
    storage.safeGetLocalStorage.mockReturnValue(JSON.stringify(mockHistory));

    const { unmount } = render(<ChatInterface onClose={mockOnClose} />);

    const copyButton = await screen.findByRole('button', { name: /copy code to clipboard/i });

    await act(async () => {
      await fireEvent.click(copyButton);
    });

    // Grab the timeout id
    const setCall = setTimeoutSpy.mock.calls.find(call => call[1] === 2000);
    expect(setCall).toBeDefined();

    // Unmount before timeout finishes to test cleanup
    unmount();

    // Expect clearTimeout to have been called with the ID (since spy doesn't give us the ID easily unless we mock implementation, we just check it was called)
    expect(clearTimeoutSpy).toHaveBeenCalled();

    setTimeoutSpy.mockRestore();
    clearTimeoutSpy.mockRestore();
  });

  it('handles parsing errors gracefully when loading history', () => {
    storage.safeGetLocalStorage.mockReturnValue('{invalid-json');
    render(<ChatInterface onClose={mockOnClose} />);
    // Should render default greeting
    expect(screen.getAllByText(/Digital Rishabh/)[0]).toBeInTheDocument();
  });

  it('handles local storage save errors gracefully', async () => {
    vi.useRealTimers();
    aiService.chatWithGemini.mockResolvedValue('I am good');
    storage.safeSetLocalStorage.mockImplementation(() => {
      throw new Error('Quota Exceeded');
    });

    render(<ChatInterface onClose={mockOnClose} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'How are you?' } });

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Send message'));
    });

    await waitFor(() => {
      expect(screen.getByText('I am good')).toBeInTheDocument();
    });
    // Test passes if no unhandled exception
  });

  it('limits number of messages loaded from history', () => {
    const mockHistory = Array.from({ length: 110 }).map((_, i) => ({
      id: `id-${i}`,
      role: 'user',
      text: `Message ${i}`,
    }));
    storage.safeGetLocalStorage.mockReturnValue(JSON.stringify(mockHistory));

    render(<ChatInterface onClose={mockOnClose} />);

    // It should load the last 100 messages (MAX_STORED_MESSAGES)
    expect(screen.getByText('Message 109')).toBeInTheDocument();
    expect(screen.queryByText('Message 0')).not.toBeInTheDocument();
  });

  it('handles code block copy failure gracefully', async () => {
    navigator.clipboard.writeText.mockRejectedValueOnce(new Error('Failed to copy'));

    const mockHistory = [
      {
        id: '1',
        role: 'model',
        text: '```javascript\nconsole.log("hello");\n```',
      },
    ];
    storage.safeGetLocalStorage.mockReturnValue(JSON.stringify(mockHistory));

    const { unmount } = render(<ChatInterface onClose={mockOnClose} />);
    const copyButton = await screen.findByRole(
      'button',
      { name: /copy code to clipboard/i },
      { timeout: 3000 }
    );

    await act(async () => {
      await fireEvent.click(copyButton);
    });

    // Should still be visible as copy, not copied
    expect(screen.getByRole('button', { name: /copy code to clipboard/i })).toBeInTheDocument();

    unmount();
  });

  it('handles chatWithGemini API failure in handleSendMessage', async () => {
    aiService.chatWithGemini.mockRejectedValueOnce(new Error('API failed'));

    render(<ChatInterface onClose={mockOnClose} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Trigger error' } });

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Send message'));
    });

    // Should not crash, and typing indicator should be hidden
    await waitFor(() => {
      expect(screen.queryByLabelText('AI is typing')).not.toBeInTheDocument();
    });
  });

  it('handles form submission error in handleSubmit', async () => {
    render(<ChatInterface onClose={mockOnClose} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Trigger error' } });

    const form = screen.getByRole('textbox').closest('form');

    await act(async () => {
      fireEvent.submit(form, {
        preventDefault: () => {
          throw new Error('Simulated sync error in form submit');
        },
      });
    });

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('generates message ID with crypto fallback', () => {
    const originalCrypto = global.crypto;

    try {
      // Test randomUUID missing
      Object.defineProperty(global, 'crypto', {
        value: {
          getRandomValues: arr => {
            for (let i = 0; i < arr.length; i++) arr[i] = 12345;
            return arr;
          },
        },
        writable: true,
        configurable: true,
      });

      const mockHistory = [
        { id: '', role: 'user', text: 'Hello' }, // will trigger generateMessageId
      ];
      storage.safeGetLocalStorage.mockReturnValue(JSON.stringify(mockHistory));

      render(<ChatInterface onClose={mockOnClose} />);
      expect(screen.getByText('Hello')).toBeInTheDocument();

      // Test completely missing crypto
      Object.defineProperty(global, 'crypto', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      storage.safeGetLocalStorage.mockReturnValue(
        JSON.stringify([{ id: null, role: 'model', text: 'Hi' }])
      );

      render(<ChatInterface onClose={mockOnClose} />);
      expect(screen.getByText('Hi')).toBeInTheDocument();
    } finally {
      // Restore crypto reliably
      Object.defineProperty(global, 'crypto', {
        value: originalCrypto,
        writable: true,
        configurable: true,
      });
    }
  });
});
