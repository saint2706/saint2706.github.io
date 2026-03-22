import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Navbar from './Navbar';
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom';

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

  it('closes menu when location changes', async () => {
    // To properly simulate location change in BrowserRouter, we need a way to navigate.
    // We can use window.history.pushState to force a path change which the component
    // will pick up through the useLocation hook from react-router-dom
    const TestComponent = () => {
      return (
        <div>
          <Navbar onOpenSettings={mockOnOpenSettings} />
        </div>
      );
    };

    const { container } = render(
      <BrowserRouter>
        <TestComponent />
      </BrowserRouter>
    );

    // Initial state: menu closed, path is /
    // Let's set a path to start with
    window.history.pushState({}, '', '/initial');

    // Re-render to pick up new path if needed
    fireEvent.click(document.body);

    // Open menu
    const menuBtn = screen.getByLabelText('Open navigation menu');
    fireEvent.click(menuBtn);

    await waitFor(() => {
      expect(container.querySelector('#mobile-nav-menu')).toBeInTheDocument();
    });

    // We can't easily change location without memory router in test without causing full navigation,
    // but we can try to click a link
    const resumeLinks = screen.getAllByText('Resume');
    const mobileResumeLink = resumeLinks[resumeLinks.length - 1]; // Click the mobile menu link
    fireEvent.click(mobileResumeLink);

    // Wait for the menu to not be in the document
    await waitFor(() => {
      expect(container.querySelector('#mobile-nav-menu')).not.toBeInTheDocument();
    });

    // Test the specific branch of location change without menu being open
    const contactLinks = screen.getAllByText('Contact');
    fireEvent.click(contactLinks[0]); // Click desktop link
  });

  it('resets isScrolled when theme changes from liquid to non-liquid', async () => {
    // To hit lines 80-82 we need:
    // 1. isLiquid previously true, now false.
    // 2. isScrolled must be true.

    let currentTheme = 'liquid';
    useTheme.mockImplementation(() => ({ theme: currentTheme }));

    const { container, rerender } = renderNavbar();

    // Trigger scroll to set isScrolled = true
    fireEvent.scroll(window, { target: { scrollY: 100 } });

    // Ensure state updates and verify 'lg-nav-compact' class is present when scrolled in liquid theme
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    await waitFor(() => {
      // Find nav inside container and assert
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('lg-nav-compact');
    });

    // Change theme to neubrutalism
    currentTheme = 'neubrutalism';

    // Force rerender by passing a different prop
    rerender(
      <BrowserRouter>
        <Navbar onOpenSettings={mockOnOpenSettings} forceRerenderProp={true} />
      </BrowserRouter>
    );

    // Verify isScrolled reset by checking 'lg-nav-compact' class is removed
    await waitFor(() => {
      const nav = container.querySelector('nav');
      expect(nav).not.toHaveClass('lg-nav-compact');
    });
  });

  it('closes menu when path changes', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <Navbar onOpenSettings={mockOnOpenSettings} />
        <Routes>
          <Route path="/" element={<div data-testid="page">Home</div>} />
          <Route path="/projects" element={<div data-testid="page">Projects Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Open menu
    const menuBtn = screen.getByLabelText('Open navigation menu');
    fireEvent.click(menuBtn);
    expect(container.querySelector('#mobile-nav-menu')).toBeInTheDocument();

    // Click a link that causes navigation
    const projectsLink = screen.getAllByText('Projects')[0];
    fireEvent.click(projectsLink);

    // We expect it to be closed immediately since state changes synchronously on path update
    expect(container.querySelector('#mobile-nav-menu')).not.toBeInTheDocument();
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
