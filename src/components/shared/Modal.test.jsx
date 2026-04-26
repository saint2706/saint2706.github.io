import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Modal from './Modal';
import { ThemeProvider } from './theme-context';

import { useTheme } from './theme-context';

// Mock theme context since Modal uses it
vi.mock('./theme-context', async () => {
  const actual = await vi.importActual('./theme-context');
  return {
    ...actual,
    useTheme: vi.fn(() => ({ theme: 'neubrutalism', toggleTheme: vi.fn() })),
    ThemeProvider: ({ children }) => <div>{children}</div>,
  };
});

describe('Modal Component', () => {
  const onCloseMock = vi.fn();
  const defaultProps = {
    isOpen: true,
    onClose: onCloseMock,
    title: 'Test Modal',
    children: <div>Modal Content</div>,
  };

  beforeEach(() => {
    onCloseMock.mockClear();
    vi.mocked(useTheme).mockReturnValue({ theme: 'neubrutalism', toggleTheme: vi.fn() });
  });

  it('renders correctly when open', () => {
    render(
      <ThemeProvider>
        <Modal {...defaultProps} />
      </ThemeProvider>
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <ThemeProvider>
        <Modal {...defaultProps} isOpen={false} />
      </ThemeProvider>
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <ThemeProvider>
        <Modal {...defaultProps} />
      </ThemeProvider>
    );
    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onClose when backdrop is clicked', () => {
    render(
      <ThemeProvider>
        <Modal {...defaultProps} />
      </ThemeProvider>
    );
    const dialog = screen.getByRole('dialog');
    const backdrop = dialog.parentElement;

    expect(backdrop).toBeInTheDocument();
    fireEvent.click(backdrop);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('does not call onClose when content is clicked', () => {
    render(
      <ThemeProvider>
        <Modal {...defaultProps} />
      </ThemeProvider>
    );
    const content = screen.getByText('Modal Content');
    fireEvent.click(content);
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('applies liquid theme classes', () => {
    vi.mocked(useTheme).mockReturnValue({ theme: 'liquid', toggleTheme: vi.fn() });
    render(
      <ThemeProvider>
        <Modal {...defaultProps} />
      </ThemeProvider>
    );

    // Check for a specific class that is only rendered when theme is liquid
    const closeButton = screen.getByLabelText('Close modal');
    expect(closeButton).toHaveClass('lg-surface-3');
  });
});
