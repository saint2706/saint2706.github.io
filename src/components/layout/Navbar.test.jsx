import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Navbar from './Navbar';
import { BrowserRouter } from 'react-router-dom';

// Mock Theme Context
vi.mock('../shared/theme-context', () => ({
  useTheme: vi.fn(),
  ThemeProvider: ({ children }) => <div>{children}</div>,
}));
import { useTheme } from '../shared/theme-context';

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

describe('Navbar', () => {
  const mockToggleTheme = vi.fn();
  const mockOnToggleCursor = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useTheme.mockReturnValue({ theme: 'neubrutalism', toggleTheme: mockToggleTheme });
  });

  const renderNavbar = (props = {}) => {
    return render(
      <BrowserRouter>
        <Navbar
          cursorEnabled={true}
          cursorToggleDisabled={false}
          cursorToggleLabel="Disable Cursor"
          onToggleCursor={mockOnToggleCursor}
          {...props}
        />
      </BrowserRouter>
    );
  };

  it('renders correctly', () => {
    renderNavbar();
    expect(screen.getByText('<Rishabh />')).toBeInTheDocument();

    // Check for navigation links (desktop)
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Resume')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('toggles theme', () => {
    renderNavbar();

    // Find theme toggle button (desktop)
    // It has aria-label "Switch to Liquid theme" when theme is neubrutalism
    const themeBtn = screen.getByLabelText('Switch to Liquid theme');
    fireEvent.click(themeBtn);

    expect(mockToggleTheme).toHaveBeenCalled();
  });

  it('toggles cursor', () => {
    renderNavbar();

    const cursorBtn = screen.getByLabelText('Disable Cursor');
    fireEvent.click(cursorBtn);

    expect(mockOnToggleCursor).toHaveBeenCalled();
  });

  it('handles mobile menu', async () => {
    const { container } = renderNavbar();

    const menuBtn = screen.getByLabelText('Open navigation menu');
    expect(menuBtn).toBeInTheDocument();

    // Initial check: menu should be closed
    expect(container.querySelector('#mobile-nav-menu')).not.toBeInTheDocument();

    // Open menu
    fireEvent.click(menuBtn);

    // Wait for menu to appear
    await waitFor(() => {
      expect(container.querySelector('#mobile-nav-menu')).toBeInTheDocument();
    });

    // Close menu by clicking a link (mobile links are rendered when menu is open)
    // There are now multiple "Home" links (desktop + mobile)
    const links = screen.getAllByText('Home');
    // Assuming the last one is the mobile one (rendered later in DOM)
    const mobileLink = links[links.length - 1];
    fireEvent.click(mobileLink);

    // Menu should close
    await waitFor(() => {
      expect(container.querySelector('#mobile-nav-menu')).not.toBeInTheDocument();
    });
  });

  it('renders liquid theme correctly', () => {
    useTheme.mockReturnValue({ theme: 'liquid', toggleTheme: mockToggleTheme });
    renderNavbar();

    // Check for "Switch to Neubrutalism theme" label
    const themeBtn = screen.getByLabelText('Switch to Neubrutalism theme');
    expect(themeBtn).toBeInTheDocument();
  });
});
