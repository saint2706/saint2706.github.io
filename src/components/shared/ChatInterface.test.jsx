import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
// Instead of mocking the module, we can wrap the component in a real ThemeProvider
// or a mock provider if the real one is complex.
// The real ThemeProvider uses localStorage and has logic.
// Let's mock the hook instead for better control.
vi.mock('./theme-context', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    useTheme: vi.fn(),
  };
});
import { useTheme } from './theme-context';

// Mock Framer Motion to avoid animation issues
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

describe('ChatInterface', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useTheme.mockReturnValue({ theme: 'neubrutalism', toggleTheme: vi.fn() });

    // Default storage return (empty history)
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

    // Should display user message immediately
    expect(screen.getByText('How are you?')).toBeInTheDocument();

    // Should verify loading state (implementation detail: typing indicator)
    // We can check if input is disabled or placeholder changed
    expect(input).toBeDisabled();

    // Wait for response
    await waitFor(() => {
      expect(screen.getByText('I am good')).toBeInTheDocument();
    });

    expect(aiService.chatWithGemini).toHaveBeenCalledWith('How are you?', expect.any(Array));
  });

  it('handles cleared history', async () => {
    // Start with some history
    const mockHistory = [
      { id: '1', role: 'user', text: 'Hello' },
      { id: '2', role: 'model', text: 'Hi there' },
    ];
    storage.safeGetLocalStorage.mockReturnValue(JSON.stringify(mockHistory));

    render(<ChatInterface onClose={mockOnClose} />);

    // Initial check
    expect(screen.getByText('Hello')).toBeInTheDocument();

    // Find clear button
    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);

    // Verify confirmation
    expect(screen.getByText('Confirm?')).toBeInTheDocument();

    // Click confirm
    fireEvent.click(screen.getByText('Confirm?'));

    // Verify history cleared (default message should be there? Or empty?)
    // createDefaultMessage text: "Hi! I'm Digital Rishabh..."
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
});
