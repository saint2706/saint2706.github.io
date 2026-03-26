import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Layout from './Layout';

vi.mock('./Navbar', () => ({
  default: ({ onOpenSettings }) => (
    <nav>
      <button type="button" onClick={onOpenSettings}>
        Settings
      </button>
    </nav>
  ),
}));

vi.mock('./Footer', () => ({
  default: () => <footer>Footer</footer>,
}));

vi.mock('../shared/CustomCursor', () => ({
  default: () => null,
}));

vi.mock('../shared/SettingsModal', () => ({
  default: ({ isOpen, onClose, cursorEnabled, cursorToggleDisabled, onToggleCursor }) =>
    isOpen ? (
      <div data-testid="settings-modal">
        <button type="button" onClick={onClose}>
          Close Settings
        </button>
        <button
          type="button"
          disabled={cursorToggleDisabled}
          onClick={onToggleCursor}
          data-testid="cursor-toggle"
        >
          Toggle Cursor: {cursorEnabled ? 'On' : 'Off'}
        </button>
      </div>
    ) : null,
}));

vi.mock('../shared/CustomCursor', () => ({
  default: ({ enabled }) => (enabled ? <div data-testid="custom-cursor">Custom Cursor</div> : null),
}));

vi.mock('../shared/CommandPalette', () => ({
  default: ({ isOpen, onClose, onOpenTerminal }) =>
    isOpen ? (
      <div data-testid="command-palette">
        Command Palette
        <button type="button" onClick={onClose}>
          Close Palette
        </button>
        <button type="button" onClick={onOpenTerminal}>
          Open Terminal
        </button>
      </div>
    ) : null,
}));

vi.mock('../shared/TerminalMode', () => ({
  default: ({ isOpen, onClose, welcomeMessage }) =>
    isOpen ? (
      <div data-testid="terminal-mode">
        {welcomeMessage}
        <button type="button" onClick={onClose}>
          Close Terminal
        </button>
      </div>
    ) : null,
}));

const mockUseTheme = vi.fn(() => ({ theme: 'neubrutalism' }));
vi.mock('../shared/theme-context', () => ({
  useTheme: () => mockUseTheme(),
}));

const TestRoutes = () => (
  <Routes>
    <Route
      path="/"
      element={
        <Layout>
          <h1>Home Heading</h1>
          <a href="#after-home">After Home Link</a>
        </Layout>
      }
    />
    <Route
      path="/projects"
      element={
        <Layout>
          <h1>Projects Heading</h1>
          <button type="button">Projects Action</button>
        </Layout>
      }
    />
    <Route
      path="*"
      element={
        <Layout>
          <div>No heading here</div>
          <button type="button">Fallback Action</button>
        </Layout>
      }
    />
  </Routes>
);

describe('Layout route accessibility behavior', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('restores focus to the page heading and announces route changes', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/projects']}>
          <TestRoutes />
        </MemoryRouter>
      );
    });

    const projectsHeading = await screen.findByRole('heading', {
      name: 'Projects Heading',
      level: 1,
    });
    expect(document.activeElement).toBe(projectsHeading);

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Navigated to Projects Heading');
  });

  it('falls back to focusing main landmark when no heading exists', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/no-heading']}>
          <TestRoutes />
        </MemoryRouter>
      );
    });

    const main = document.getElementById('main-content');
    expect(main).toBeInTheDocument();
    expect(document.activeElement).toBe(main);
    expect(main).toHaveAttribute('tabindex', '-1');
  });

  it('keeps keyboard navigation free after route changes (no outgoing focus trap)', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/projects']}>
          <TestRoutes />
        </MemoryRouter>
      );
    });

    const heading = await screen.findByRole('heading', { name: 'Projects Heading', level: 1 });
    const actionButton = screen.getByRole('button', { name: 'Projects Action' });

    expect(document.activeElement).toBe(heading);

    actionButton.focus();
    expect(document.activeElement).toBe(actionButton);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(document.activeElement).toBe(actionButton);
  });
});

describe('Layout component Terminal and Konami Code behavior', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('opens terminal via command palette callback', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="*" element={<Layout>Test</Layout>} />
        </Routes>
      </MemoryRouter>
    );

    // Open palette
    await act(async () => {
      fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    });

    const openTerminalBtn = screen.getByRole('button', { name: 'Open Terminal' });

    await act(async () => {
      fireEvent.click(openTerminalBtn);
    });

    expect(screen.getByTestId('terminal-mode')).toBeInTheDocument();
  });

  it('resets Konami Code progress on incorrect key', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="*" element={<Layout>Test</Layout>} />
        </Routes>
      </MemoryRouter>
    );

    // Partial correct code
    await act(async () => {
      fireEvent.keyDown(document, { key: 'ArrowUp' });
    });

    // Incorrect key
    await act(async () => {
      fireEvent.keyDown(document, { key: 'Space' });
    });

    // Now if we enter the rest, it should not trigger because it was reset
    const restOfSequence = [
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'b',
      'a',
    ];

    for (const key of restOfSequence) {
      await act(async () => {
        fireEvent.keyDown(document, { key });
      });
    }

    expect(screen.queryByTestId('terminal-mode')).not.toBeInTheDocument();
  });

  it('closes command palette with onClose callback and closes terminal with onClose callback', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="*" element={<Layout>Test</Layout>} />
        </Routes>
      </MemoryRouter>
    );

    // Open palette
    await act(async () => {
      fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    });

    const closePaletteBtn = screen.getByRole('button', { name: 'Close Palette' });

    await act(async () => {
      fireEvent.click(closePaletteBtn);
    });

    expect(screen.queryByTestId('command-palette')).not.toBeInTheDocument();

    // Trigger terminal
    const konamiSequence = [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'b',
      'a',
    ];
    for (const key of konamiSequence) {
      await act(async () => {
        fireEvent.keyDown(document, { key });
      });
    }

    expect(screen.getByTestId('terminal-mode')).toBeInTheDocument();

    const closeTerminalBtn = screen.getByRole('button', { name: 'Close Terminal' });
    await act(async () => {
      fireEvent.click(closeTerminalBtn);
    });

    expect(screen.queryByTestId('terminal-mode')).not.toBeInTheDocument();
  });

  it('activates secret terminal via Konami Code', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="*" element={<Layout>Test</Layout>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByTestId('terminal-mode')).not.toBeInTheDocument();

    const konamiSequence = [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'b',
      'a',
    ];

    for (const key of konamiSequence) {
      await act(async () => {
        fireEvent.keyDown(document, { key });
      });
    }

    const terminal = screen.getByTestId('terminal-mode');
    expect(terminal).toBeInTheDocument();
    expect(terminal).toHaveTextContent('🎮 KONAMI CODE ACTIVATED! You found the secret terminal!');
  });
});

describe('Layout component liquid tint behavior', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    mockUseTheme.mockReturnValue({ theme: 'liquid' });
  });

  afterEach(() => {
    mockUseTheme.mockReturnValue({ theme: 'neubrutalism' });
  });

  it('sets data-liquid-tint correctly for various routes when theme is liquid', async () => {
    const TestComponent = ({ path }) => (
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="*" element={<Layout>Test</Layout>} />
        </Routes>
      </MemoryRouter>
    );

    const routesAndTints = [
      { path: '/', expectedTint: 'blue' },
      { path: '/resume', expectedTint: 'green' },
      { path: '/projects', expectedTint: 'purple' },
      { path: '/blog', expectedTint: 'amber' },
      { path: '/contact', expectedTint: 'amber' },
      { path: '/playground', expectedTint: 'purple' },
      { path: '/games', expectedTint: 'blue' },
      { path: '/unknown-route', expectedTint: 'blue' },
    ];

    for (const { path, expectedTint } of routesAndTints) {
      const { container, unmount } = render(<TestComponent path={path} />);
      const layoutDiv = container.firstChild;
      expect(layoutDiv).toHaveAttribute('data-liquid-tint', expectedTint);
      unmount();
    }
  });

  it('does not set data-liquid-tint when theme is not liquid', async () => {
    mockUseTheme.mockReturnValue({ theme: 'neubrutalism' });
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="*" element={<Layout>Test</Layout>} />
        </Routes>
      </MemoryRouter>
    );
    const layoutDiv = container.firstChild;
    expect(layoutDiv).not.toHaveAttribute('data-liquid-tint');
  });
});

describe('Layout component media query preferences behavior', () => {
  let matchMediaMock;

  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();

    matchMediaMock = vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    window.matchMedia = matchMediaMock;
  });

  afterEach(() => {
    delete window.matchMedia;
  });

  it('sets dataset.contrast when prefers-contrast matches', () => {
    matchMediaMock.mockImplementation(query => ({
      matches: query === '(prefers-contrast: more)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="*" element={<Layout>Test</Layout>} />
        </Routes>
      </MemoryRouter>
    );

    expect(document.documentElement).toHaveAttribute('data-contrast', 'more');
  });

  it('sets dataset.contrast when forced-colors matches', () => {
    matchMediaMock.mockImplementation(query => ({
      matches: query === '(forced-colors: active)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="*" element={<Layout>Test</Layout>} />
        </Routes>
      </MemoryRouter>
    );

    expect(document.documentElement).toHaveAttribute('data-contrast', 'more');
  });

  it('sets dataset.contrast to no-preference when no contrast preferences match', () => {
    matchMediaMock.mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="*" element={<Layout>Test</Layout>} />
        </Routes>
      </MemoryRouter>
    );

    expect(document.documentElement).toHaveAttribute('data-contrast', 'no-preference');
  });

  it('updates preferences when media query changes', () => {
    const mockQueries = {};

    matchMediaMock.mockImplementation(query => {
      const mockQuery = {
        matches: false,
        addEventListener: vi.fn((event, callback) => {
          mockQueries[query].listeners.push(callback);
        }),
        removeEventListener: vi.fn(),
        listeners: [],
      };
      mockQueries[query] = mockQuery;
      return mockQuery;
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="*" element={<Layout>Test</Layout>} />
        </Routes>
      </MemoryRouter>
    );

    expect(document.documentElement).toHaveAttribute('data-contrast', 'no-preference');

    act(() => {
      mockQueries['(prefers-contrast: more)'].matches = true;
      mockQueries['(prefers-contrast: more)'].listeners.forEach(cb => cb());
    });

    expect(document.documentElement).toHaveAttribute('data-contrast', 'more');
  });
});

describe('Layout component cursor and settings interactions', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();

    // Default matchMedia to not force cursor off
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  });

  afterEach(() => {
    delete window.matchMedia;
  });

  it('opens and closes the settings modal', async () => {
    // Note: matchMedia was mocked to return false for pointer:fine in previous tests.
    // If hasFinePointer is false, the cursor is forced off. We need to mock it properly here.
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(pointer: fine)', // Ensure fine pointer so it's not forced off
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="*" element={<Layout>Test</Layout>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByTestId('settings-modal')).not.toBeInTheDocument();

    const settingsButton = screen.getByRole('button', { name: 'Settings' });
    await act(async () => {
      fireEvent.click(settingsButton);
    });

    expect(screen.getByTestId('settings-modal')).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: 'Close Settings' });
    await act(async () => {
      fireEvent.click(closeButton);
    });

    expect(screen.queryByTestId('settings-modal')).not.toBeInTheDocument();
  });

  it('toggles the custom cursor via settings modal and persists preference', async () => {
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(pointer: fine)', // Ensure fine pointer so it's not forced off
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="*" element={<Layout>Test</Layout>} />
        </Routes>
      </MemoryRouter>
    );

    // Initial state: cursor disabled by default
    expect(screen.queryByTestId('custom-cursor')).not.toBeInTheDocument();

    // Open settings
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
    });

    const toggleButton = screen.getByTestId('cursor-toggle');
    expect(toggleButton).toHaveTextContent('Toggle Cursor: Off');

    // Toggle cursor on
    await act(async () => {
      fireEvent.click(toggleButton);
    });

    expect(screen.getByTestId('custom-cursor')).toBeInTheDocument();
    expect(toggleButton).toHaveTextContent('Toggle Cursor: On');
    expect(window.localStorage.getItem('custom_cursor_enabled')).toBe('true');

    // Toggle cursor off
    await act(async () => {
      fireEvent.click(toggleButton);
    });

    expect(screen.queryByTestId('custom-cursor')).not.toBeInTheDocument();
    expect(toggleButton).toHaveTextContent('Toggle Cursor: Off');
    expect(window.localStorage.getItem('custom_cursor_enabled')).toBe('false');
  });

  it('toggles the custom cursor via toggleCursor custom event', async () => {
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(pointer: fine)', // Ensure fine pointer so it's not forced off
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="*" element={<Layout>Test</Layout>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByTestId('custom-cursor')).not.toBeInTheDocument();

    await act(async () => {
      document.dispatchEvent(new CustomEvent('toggleCursor'));
    });

    expect(screen.getByTestId('custom-cursor')).toBeInTheDocument();
  });
});

describe('Layout component Command Palette keyboard shortcuts', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('opens and closes command palette with Ctrl+K / Cmd+K and emits events', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="*" element={<Layout>Test</Layout>} />
        </Routes>
      </MemoryRouter>
    );

    const openEventSpy = vi.fn();
    const closeEventSpy = vi.fn();
    document.addEventListener('openCommandPalette', openEventSpy);
    document.addEventListener('closeCommandPalette', closeEventSpy);

    expect(screen.queryByTestId('command-palette')).not.toBeInTheDocument();

    // Trigger open (Ctrl + K)
    await act(async () => {
      fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    });

    expect(screen.getByTestId('command-palette')).toBeInTheDocument();
    expect(openEventSpy).toHaveBeenCalledTimes(1);

    // Trigger close (Cmd + K)
    await act(async () => {
      fireEvent.keyDown(document, { key: 'k', metaKey: true });
    });

    expect(screen.queryByTestId('command-palette')).not.toBeInTheDocument();
    expect(closeEventSpy).toHaveBeenCalledTimes(1);

    document.removeEventListener('openCommandPalette', openEventSpy);
    document.removeEventListener('closeCommandPalette', closeEventSpy);
  });

  it('closes overlays with Escape and emits close events', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="*" element={<Layout>Test</Layout>} />
        </Routes>
      </MemoryRouter>
    );

    const closePaletteEventSpy = vi.fn();
    const closeChatbotEventSpy = vi.fn();
    document.addEventListener('closeCommandPalette', closePaletteEventSpy);
    document.addEventListener('closeChatbot', closeChatbotEventSpy);

    // Open first
    await act(async () => {
      fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    });
    expect(screen.getByTestId('command-palette')).toBeInTheDocument();

    // Close with Escape
    await act(async () => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });

    expect(screen.queryByTestId('command-palette')).not.toBeInTheDocument();
    expect(closePaletteEventSpy).toHaveBeenCalledTimes(1);
    expect(closeChatbotEventSpy).toHaveBeenCalledTimes(1);

    document.removeEventListener('closeCommandPalette', closePaletteEventSpy);
    document.removeEventListener('closeChatbot', closeChatbotEventSpy);
  });
});
