import React from 'react';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import JsHtmlSandbox from './JsHtmlSandbox';

const snippet = {
  interactive: {
    type: 'web-sandbox',
    html: '<button id="btn">Click me</button>',
    css: 'button { color: red; }',
    js: 'console.log("hello");',
  },
};

const getIframe = () => document.querySelector('iframe[title="JS/HTML sandbox preview"]');

describe('JsHtmlSandbox', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders HTML/CSS/JS tabs with the JS tab active by default', () => {
    render(<JsHtmlSandbox snippet={snippet} />);
    const jsTab = screen.getByRole('tab', { name: 'JS' });
    expect(jsTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('textbox')).toHaveValue('console.log("hello");');
  });

  it('points the preview iframe at the sandboxed static document', () => {
    render(<JsHtmlSandbox snippet={snippet} />);
    const iframe = getIframe();
    expect(iframe).toHaveAttribute('src', '/sandbox.html');
    expect(iframe).toHaveAttribute('sandbox', 'allow-scripts');
  });

  it('switches editor content when a different tab is selected', () => {
    render(<JsHtmlSandbox snippet={snippet} />);
    fireEvent.click(screen.getByRole('tab', { name: 'HTML' }));
    expect(screen.getByRole('textbox')).toHaveValue('<button id="btn">Click me</button>');

    fireEvent.click(screen.getByRole('tab', { name: 'CSS' }));
    expect(screen.getByRole('textbox')).toHaveValue('button { color: red; }');
  });

  it('persists edits across tab switches', () => {
    render(<JsHtmlSandbox snippet={snippet} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'console.log("edited");' } });

    fireEvent.click(screen.getByRole('tab', { name: 'HTML' }));
    fireEvent.click(screen.getByRole('tab', { name: 'JS' }));
    expect(screen.getByRole('textbox')).toHaveValue('console.log("edited");');
  });

  it('sends the initial payload once the sandbox iframe signals it is ready', async () => {
    render(<JsHtmlSandbox snippet={snippet} />);
    const iframe = getIframe();
    const postMessageSpy = vi.spyOn(iframe.contentWindow, 'postMessage');

    await act(async () => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: { __jsSandboxReady: true },
          source: iframe.contentWindow,
        })
      );
    });

    expect(postMessageSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        __jsSandboxInit: true,
        runId: 0,
        js: 'console.log("hello");',
      }),
      '*'
    );
  });

  it('sends edited code and a new run id after clicking Run', async () => {
    render(<JsHtmlSandbox snippet={snippet} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'console.log("edited");' } });
    fireEvent.click(screen.getByRole('button', { name: /^Run$/i }));

    // Run remounts the iframe (key change), so re-query it post-remount.
    const iframe = getIframe();
    const postMessageSpy = vi.spyOn(iframe.contentWindow, 'postMessage');

    await act(async () => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: { __jsSandboxReady: true },
          source: iframe.contentWindow,
        })
      );
    });

    expect(postMessageSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        __jsSandboxInit: true,
        runId: 1,
        js: 'console.log("edited");',
      }),
      '*'
    );
  });

  it('resets edited code back to the original snippet', () => {
    render(<JsHtmlSandbox snippet={snippet} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'console.log("edited");' } });
    fireEvent.click(screen.getByRole('button', { name: /Reset/i }));
    expect(screen.getByRole('textbox')).toHaveValue('console.log("hello");');
  });

  it('renders console output forwarded from the sandboxed iframe', async () => {
    render(<JsHtmlSandbox snippet={snippet} />);
    const iframe = getIframe();

    await act(async () => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: { __jsSandbox: true, runId: 0, type: 'log', args: ['hello'] },
          source: iframe.contentWindow,
        })
      );
    });

    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('ignores messages from a stale run id', async () => {
    render(<JsHtmlSandbox snippet={snippet} />);
    const iframe = getIframe();

    await act(async () => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: { __jsSandbox: true, runId: 999, type: 'log', args: ['stale output'] },
          source: iframe.contentWindow,
        })
      );
    });

    expect(screen.queryByText('stale output')).not.toBeInTheDocument();
  });
});
