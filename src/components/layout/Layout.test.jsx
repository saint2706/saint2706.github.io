import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Layout from './Layout';

vi.mock('../shared/theme-context', () => ({
  useTheme: vi.fn(() => ({ theme: 'neubrutalism' })),
}));

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
  default: () => null,
}));

vi.mock('../shared/CommandPalette', () => ({
  default: () => null,
}));

vi.mock('../shared/TerminalMode', () => ({
  default: () => null,
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

    const projectsHeading = screen.getByRole('heading', { name: 'Projects Heading', level: 1 });
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

    const heading = screen.getByRole('heading', { name: 'Projects Heading', level: 1 });
    const actionButton = screen.getByRole('button', { name: 'Projects Action' });

    expect(document.activeElement).toBe(heading);

    actionButton.focus();
    expect(document.activeElement).toBe(actionButton);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(document.activeElement).toBe(actionButton);
  });
});
