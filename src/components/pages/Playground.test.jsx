import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// We mock everything thoroughly to make tests fast
vi.mock('framer-motion', () => {
  const MotionDiv = React.forwardRef(
    (
      {
        children,
        variants: _v,
        initial: _i,
        animate: _a,
        exit: _e,
        transition: _t,
        whileHover: _wh,
        whileTap: _wt,
        layout: _l,
        layoutId: _li,
        ...rest
      },
      ref
    ) => {
      return (
        <div ref={ref} {...rest}>
          {children}
        </div>
      );
    }
  );
  MotionDiv.displayName = 'MotionDiv';

  const MotionArticle = React.forwardRef(
    (
      {
        children,
        variants: _v,
        initial: _i,
        animate: _a,
        exit: _e,
        transition: _t,
        whileHover: _wh,
        whileTap: _wt,
        layout: _l,
        layoutId: _li,
        ...rest
      },
      ref
    ) => {
      return (
        <article ref={ref} {...rest}>
          {children}
        </article>
      );
    }
  );
  MotionArticle.displayName = 'MotionArticle';

  return {
    motion: {
      div: MotionDiv,
      article: MotionArticle,
    },
    AnimatePresence: ({ children }) => <>{children}</>,
    useReducedMotion: () => false,
  };
});

vi.mock('lucide-react', async () => {
  const ReactLib = await vi.importActual('react');
  const lucide = await vi.importActual('lucide-react');
  const mockIcon = iconName => {
    if (!lucide[iconName]) {
      throw new Error(`[lucide mock] ${iconName} is not exported by lucide-react.`);
    }
    return props =>
      ReactLib.createElement('span', { ...props, 'data-testid': `icon-${iconName.toLowerCase()}` });
  };

  return {
    Code2: mockIcon('Code2'),
    Palette: mockIcon('Palette'),
    Copy: mockIcon('Copy'),
    Check: mockIcon('Check'),
    Play: mockIcon('Play'),
    Terminal: mockIcon('Terminal'),
  };
});

vi.mock('../shared/SEOHead', () => ({
  default: () => <div data-testid="seo-head">SEO Head Mock</div>,
}));

vi.mock('../shared/pyodideLoader', () => ({
  loadPyodide: vi.fn().mockResolvedValue(true),
}));

vi.mock('../shared/PythonRunner', () => ({
  default: () => <div data-testid="python-runner">Python Runner Mock</div>,
}));

vi.mock('../shared/Modal', () => ({
  default: ({ isOpen, onClose, title, children }) =>
    isOpen ? (
      <div data-testid="modal">
        <h2>{title}</h2>
        <button onClick={onClose} data-testid="modal-close">
          Close
        </button>
        {children}
      </div>
    ) : null,
}));

vi.mock('../shared/ThemedButton', () => ({
  default: ({ children, onClick, variant: _v, className: _c, style: _s, ...rest }) => (
    <button onClick={onClick} {...rest} data-testid="themed-button">
      {children}
    </button>
  ),
}));

vi.mock('../shared/ThemedCard', () => ({
  default: ({
    children,
    as: Component = 'div',
    variant: _v,
    className: _c,
    style: _s,
    ...rest
  }) => {
    const ValidComponent = typeof Component === 'string' ? Component : 'div';
    return (
      <ValidComponent {...rest} data-testid="themed-card">
        {children}
      </ValidComponent>
    );
  },
}));

vi.mock('../shared/ThemedChip', () => ({
  default: ({ children, variant: _v, className: _c, style: _s, ...rest }) => (
    <span {...rest} data-testid="themed-chip">
      {children}
    </span>
  ),
}));

vi.mock('../shared/SyntaxHighlighter', () => ({
  default: ({ code, language }) => (
    <div data-testid="syntax-highlighter" data-code={code} data-language={language}>
      Syntax Highlighter Mock
    </div>
  ),
}));

vi.mock('../shared/theme-context', () => ({
  useTheme: () => ({ theme: 'neubrutalism', toggleTheme: vi.fn() }),
  ThemeProvider: ({ children }) => <div data-testid="theme-provider">{children}</div>,
}));

// Provide immediate mock component for React.lazy
vi.mock('react', async () => {
  const actualReact = await vi.importActual('react');
  return {
    ...actualReact,
    lazy: _fn => {
      // Return a normal component immediately
      const MockLazy = () => <div data-testid="lazy-component">Mock Lazy</div>;
      MockLazy.displayName = 'MockLazy';
      return MockLazy;
    },
  };
});

// Mock data to ensure we have snippets to render
vi.mock('../../data/snippets', () => ({
  getSnippetsByLanguage: vi.fn(filter => {
    const snippets = [
      {
        id: 'test-python-1',
        title: 'Python Test',
        language: 'python',
        description: 'Python snippet description',
        code: 'print("Hello Python")',
        tags: ['python', 'test'],
        interactive: { type: 'python-runner' },
      },
      {
        id: 'test-css-1',
        title: 'CSS Test',
        language: 'css',
        description: 'CSS snippet description',
        code: '.test { color: red; }',
        tags: ['css', 'test'],
        preview: { html: '<div class="test">Test</div>', css: '.test { color: red; }' },
      },
    ];
    if (filter === 'all') return snippets;
    return snippets.filter(s => s.language === filter);
  }),
}));

// Import component after mocks
import Playground from './Playground';

Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(),
  },
});

const renderPlayground = () => {
  return render(
    <MemoryRouter>
      <Playground />
    </MemoryRouter>
  );
};

describe('Playground Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    try {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    } catch {
      // ignore
    }
    vi.restoreAllMocks();
  });

  it('renders correctly and displays snippets initially', async () => {
    renderPlayground();
    // It should render very fast now
    expect(screen.getByText('Code Playground')).toBeInTheDocument();
  });

  it('filters snippets when clicking filter tabs', async () => {
    renderPlayground();

    const tabs = screen.getAllByRole('tab');
    const pythonTab = tabs.find(t => t.textContent.includes('Python'));
    fireEvent.click(pythonTab);

    // Check if python filter is active (checking the tab list)
    expect(pythonTab).toHaveAttribute('aria-selected', 'true');

    const cssTab = tabs.find(t => t.textContent.includes('CSS'));
    fireEvent.click(cssTab);

    expect(cssTab).toHaveAttribute('aria-selected', 'true');
  });

  it('handles copy to clipboard functionality', async () => {
    vi.useFakeTimers();
    renderPlayground();

    const copyButtons = screen.getAllByRole('button', { name: /copy .* code/i });
    expect(copyButtons.length).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.click(copyButtons[0]);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    const copiedElements = screen.getAllByText('Copied!');
    expect(copiedElements.length).toBeGreaterThan(0);
    expect(copiedElements[0]).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(2500);
    });

    expect(screen.queryByText('Copied!')).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  it('opens CSS live preview modal', async () => {
    renderPlayground();

    // Some snippets may have live preview
    const previewButtons = screen.getAllByText('Live Preview');
    expect(previewButtons.length).toBeGreaterThan(0);

    fireEvent.click(previewButtons[0]);
    expect(screen.getByTestId('modal')).toBeInTheDocument();

    const closeButton = screen.getByTestId('modal-close');
    fireEvent.click(closeButton);
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('opens Python runner modal', async () => {
    renderPlayground();

    const tryItLiveButtons = screen.getAllByText(/Try It Live!/i);
    expect(tryItLiveButtons.length).toBeGreaterThan(0);
    const tryItLiveButton = tryItLiveButtons[0];

    fireEvent.mouseEnter(tryItLiveButton);
    fireEvent.focus(tryItLiveButton);
    fireEvent.click(tryItLiveButton);

    expect(screen.getByTestId('modal')).toBeInTheDocument();

    const closeButton = screen.getByTestId('modal-close');
    fireEvent.click(closeButton);
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });
});
