import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Modal from './Modal';
import { ThemeProvider } from './theme-context';

// Mock theme context since Modal uses it
vi.mock('./theme-context', async () => {
  const actual = await vi.importActual('./theme-context');
  return {
    ...actual,
    useTheme: () => ({ theme: 'neubrutalism', toggleTheme: vi.fn() }),
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
    // The backdrop is the outer div with role="dialog"
    const backdrop = screen.getByRole('dialog');
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
});
