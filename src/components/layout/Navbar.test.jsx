import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Navbar from './Navbar';
import { BrowserRouter } from 'react-router-dom';

// Mock Theme Context
vi.mock('../shared/theme-context', () => ({
  useTheme: vi.fn(),
  ThemeProvider: ({ children }) => <div>{children}</div>,
  THEMES: {
    neubrutalism: 'neubrutalism',
    neubrutalismDark: 'neubrutalism-dark',
    liquid: 'liquid',
    liquidDark: 'liquid-dark',
  },
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
  const mockOnOpenSettings = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useTheme.mockReturnValue({ theme: 'neubrutalism' });
  });

  const renderNavbar = (props = {}) => {
    return render(
      <BrowserRouter>
        <Navbar
          onOpenSettings={mockOnOpenSettings}
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

  it('opens settings when gear button clicked', () => {
    renderNavbar();

    const settingsBtn = screen.getByLabelText('Open settings');
    fireEvent.click(settingsBtn);

    expect(mockOnOpenSettings).toHaveBeenCalled();
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
    useTheme.mockReturnValue({ theme: 'liquid' });
    renderNavbar();

    // Settings button should still be present in liquid theme
    expect(screen.getByLabelText('Open settings')).toBeInTheDocument();
  });

  it('renders liquid-dark theme correctly', () => {
    useTheme.mockReturnValue({ theme: 'liquid-dark' });
    renderNavbar();

    expect(screen.getByLabelText('Open settings')).toBeInTheDocument();
  });
});
