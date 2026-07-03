/**
 * JS/HTML Sandbox Component Module
 *
 * Provides an interactive, editable HTML + CSS + JS playground rendered inside
 * a fully sandboxed iframe, with captured console output displayed alongside.
 *
 * Security model:
 * - The preview iframe loads `/sandbox.html`, a static document with no
 *   Content-Security-Policy, inside `sandbox="allow-scripts"` only — no
 *   `allow-same-origin`, so the document gets a unique opaque origin at
 *   runtime regardless of where it was served from. Scripts run, but can't
 *   read cookies/storage, reach the parent DOM, or navigate the top-level
 *   page. (A regular `srcDoc` iframe would inherit this page's strict
 *   `script-src` CSP and silently refuse to execute any injected code, which
 *   is why the sandbox content lives in its own document instead.)
 * - Code is delivered to the iframe via `postMessage` (not templated into
 *   HTML) after the iframe signals it's ready, and console output comes back
 *   the same way. The parent only accepts messages whose `event.source`
 *   matches the sandbox's own `contentWindow`; the child only accepts init
 *   messages whose `event.origin` matches its own origin, so a third-party
 *   page framing `/sandbox.html` directly (outside our sandboxed iframe)
 *   can't use it to run script in a non-opaque context.
 *
 * @module components/shared/JsHtmlSandbox
 */

import React, { useState, useCallback, useRef, useEffect, useId } from 'react';
import { Play, RotateCcw } from 'lucide-react';

const TABS = [
  { id: 'html', label: 'HTML' },
  { id: 'css', label: 'CSS' },
  { id: 'js', label: 'JS' },
];

/**
 * Interactive HTML/CSS/JS sandbox rendered in an isolated iframe.
 *
 * @component
 * @param {object} props
 * @param {object} props.snippet - Snippet configuration.
 * @param {object} props.snippet.interactive - Interactive sandbox configuration.
 * @param {string} props.snippet.interactive.html - Initial HTML markup.
 * @param {string} props.snippet.interactive.css - Initial CSS.
 * @param {string} props.snippet.interactive.js - Initial JavaScript.
 * @returns {JSX.Element} Interactive web sandbox interface.
 */
const JsHtmlSandbox = ({ snippet }) => {
  const { html: initialHtml, css: initialCss, js: initialJs } = snippet.interactive;

  const [activeTab, setActiveTab] = useState('js');
  const [html, setHtml] = useState(initialHtml);
  const [css, setCss] = useState(initialCss);
  const [js, setJs] = useState(initialJs);
  const [output, setOutput] = useState([]);
  const [runId, setRunId] = useState(0);
  const iframeRef = useRef(null);
  // Holds the payload for the run the iframe should execute once it signals it's ready.
  const pendingPayloadRef = useRef({
    html: initialHtml,
    css: initialCss,
    js: initialJs,
    runId: 0,
  });
  const tabsId = useId();

  const runCode = useCallback(() => {
    const nextRunId = runId + 1;
    pendingPayloadRef.current = { html, css, js, runId: nextRunId };
    setOutput([]);
    setRunId(nextRunId);
  }, [html, css, js, runId]);

  const resetCode = useCallback(() => {
    setHtml(initialHtml);
    setCss(initialCss);
    setJs(initialJs);
    setOutput([]);
    setRunId(prev => {
      const nextRunId = prev + 1;
      pendingPayloadRef.current = {
        html: initialHtml,
        css: initialCss,
        js: initialJs,
        runId: nextRunId,
      };
      return nextRunId;
    });
  }, [initialHtml, initialCss, initialJs]);

  useEffect(() => {
    const handleMessage = event => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      const data = event.data;
      if (!data) return;

      if (data.__jsSandboxReady === true) {
        event.source.postMessage({ __jsSandboxInit: true, ...pendingPayloadRef.current }, '*');
        return;
      }

      if (data.__jsSandbox === true && data.runId === runId) {
        setOutput(prev => [...prev, { type: data.type, text: data.args.join(' ') }]);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [runId]);

  const editorValue = activeTab === 'html' ? html : activeTab === 'css' ? css : js;
  const setEditorValue = value => {
    if (activeTab === 'html') setHtml(value);
    else if (activeTab === 'css') setCss(value);
    else setJs(value);
  };

  return (
    <div className="mt-4 border-2 border-[color:var(--color-border)] rounded-lg overflow-hidden bg-gray-100">
      {/* Editor tabs */}
      <div className="bg-gray-200 px-3 pt-2 border-b-2 border-[color:var(--color-border)] flex items-center justify-between">
        <div className="flex gap-1" role="tablist" aria-label="Sandbox source tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              id={`${tabsId}-${tab.id}-tab`}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`${tabsId}-${tab.id}-panel`}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-t-md border-2 border-b-0 border-[color:var(--color-border)] ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900'
                  : 'bg-gray-200 text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-600 font-mono mb-2">Web Sandbox</span>
      </div>

      {/* Editor */}
      <div
        id={`${tabsId}-${activeTab}-panel`}
        role="tabpanel"
        aria-labelledby={`${tabsId}-${activeTab}-tab`}
        className="bg-white border-b-2 border-[color:var(--color-border)]"
      >
        <label htmlFor={`${tabsId}-editor`} className="sr-only">
          {TABS.find(t => t.id === activeTab)?.label} source
        </label>
        <textarea
          id={`${tabsId}-editor`}
          value={editorValue}
          onChange={e => setEditorValue(e.target.value)}
          spellCheck="false"
          autoComplete="off"
          rows={8}
          className="w-full p-3 font-mono text-xs resize-y focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent"
        />
        <div className="flex gap-2 p-3 pt-0">
          <button
            onClick={runCode}
            className="flex items-center gap-2 px-4 py-2 font-heading font-bold text-sm border-2 border-[color:var(--color-border)] rounded-md bg-accent text-white transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
            style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
          >
            <Play size={14} aria-hidden="true" />
            Run
          </button>
          <button
            onClick={resetCode}
            className="flex items-center gap-2 px-4 py-2 font-heading font-bold text-sm border-2 border-[color:var(--color-border)] rounded-md bg-gray-200 text-gray-800 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
            style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
          >
            <RotateCcw size={14} aria-hidden="true" />
            Reset
          </button>
        </div>
      </div>

      {/* Live preview */}
      <div className="border-b-2 border-[color:var(--color-border)]">
        <iframe
          ref={iframeRef}
          key={runId}
          title="JS/HTML sandbox preview"
          className="w-full h-48 bg-white"
          sandbox="allow-scripts"
          src="/sandbox.html"
        />
      </div>

      {/* Console output */}
      <div
        className="bg-gray-900 p-4 min-h-[80px] max-h-[200px] overflow-auto"
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
      >
        {output.length > 0 ? (
          output.map((entry, idx) => (
            <pre
              key={idx}
              className={`font-mono text-xs whitespace-pre-wrap ${
                entry.type === 'error'
                  ? 'text-red-400'
                  : entry.type === 'warn'
                    ? 'text-yellow-400'
                    : 'text-green-400'
              }`}
            >
              {entry.text}
            </pre>
          ))
        ) : (
          <p className="text-gray-500 font-mono text-sm">
            Click &quot;Run&quot; to execute — console output appears here
          </p>
        )}
      </div>
    </div>
  );
};

export default JsHtmlSandbox;
