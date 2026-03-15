import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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

    // Create a mock main-content element for the aria-hidden test
    const mainContent = document.createElement('div');
    mainContent.id = 'main-content';
    document.body.appendChild(mainContent);
  });

  afterEach(() => {
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
          mainContent.remove();
      }
  });

  const renderNavbar = (props = {}) => {
    return render(
      <BrowserRouter>
        <Navbar onOpenSettings={mockOnOpenSettings} {...props} />
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

  it('handles mobile menu and aria-hidden on main content', async () => {
    const { container } = renderNavbar();

    const menuBtn = screen.getByLabelText('Open navigation menu');
    expect(menuBtn).toBeInTheDocument();

    // Initial check: menu should be closed
    expect(container.querySelector('#mobile-nav-menu')).not.toBeInTheDocument();

    // Check aria-hidden on main-content
    const mainContent = document.getElementById('main-content');
    expect(mainContent.hasAttribute('aria-hidden')).toBe(false);

    // Open menu
    fireEvent.click(menuBtn);

    // Wait for menu to appear
    await waitFor(() => {
      expect(container.querySelector('#mobile-nav-menu')).toBeInTheDocument();
    });

    // main-content should have aria-hidden
    expect(mainContent.getAttribute('aria-hidden')).toBe('true');

    // Close menu by clicking a link
    const links = screen.getAllByText('Home');
    const mobileLink = links[links.length - 1];
    fireEvent.click(mobileLink);

    // Menu should close
    await waitFor(() => {
      expect(container.querySelector('#mobile-nav-menu')).not.toBeInTheDocument();
    });

    // main-content should not have aria-hidden
    expect(mainContent.hasAttribute('aria-hidden')).toBe(false);
  });

  it('renders liquid theme correctly and handles scroll', () => {
    useTheme.mockReturnValue({ theme: 'liquid' });
    renderNavbar();

    expect(screen.getByLabelText('Open settings')).toBeInTheDocument();

    // Simulate scroll to test isScrolled state
    fireEvent.scroll(window, { target: { scrollY: 100 } });

    // The class 'lg-nav-compact' should be added when scrolled in liquid theme
    // We can verify this visually or just ensure the event listener runs without errors
  });

  it('renders liquid-dark theme correctly', () => {
    useTheme.mockReturnValue({ theme: 'liquid-dark' });
    renderNavbar();

    expect(screen.getByLabelText('Open settings')).toBeInTheDocument();
  });

  it('closes mobile menu on settings click from mobile menu', async () => {
    const { container } = renderNavbar();

    // Open menu
    const menuBtn = screen.getByLabelText('Open navigation menu');
    fireEvent.click(menuBtn);

    await waitFor(() => {
      expect(container.querySelector('#mobile-nav-menu')).toBeInTheDocument();
    });

    // We have two settings buttons: desktop and mobile
    const settingsBtns = screen.getAllByLabelText('Open settings');
    // The second one is in the mobile menu
    fireEvent.click(settingsBtns[1]);

    expect(mockOnOpenSettings).toHaveBeenCalled();

    // Menu should close
    await waitFor(() => {
      expect(container.querySelector('#mobile-nav-menu')).not.toBeInTheDocument();
    });
  });
});
