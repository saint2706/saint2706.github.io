/**
 * @fileoverview Syntax highlighter component using Prism.js.
 * Provides code highlighting for Python, CSS, and JavaScript.
 */

import React, { useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-css';

/**
 * Syntax highlighter component using Prism.js
 *
 * Features:
 * - Supports Python, CSS, and JavaScript syntax
 * - Dark theme (prism-tomorrow)
 * - Automatic highlighting on code changes
 * - Horizontal scrolling for long lines
 * - Neubrutalist border styling
 *
 * @component
 * @param {Object} props
 * @param {string} props.code - Code string to highlight
 * @param {string} props.language - Language for syntax highlighting (python, css, javascript, js)
 * @returns {JSX.Element} Highlighted code block
 */
const SyntaxHighlighter = ({ code, language }) => {
  const codeRef = useRef(null);

  // Re-highlight when code or language changes
  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, language]);

  /** Map language names to Prism language keys */
  const prismLanguage =
    {
      python: 'python',
      css: 'css',
      javascript: 'javascript',
      js: 'javascript',
    }[language] || language;

  return (
    <pre className="!bg-gray-900 !p-4 !rounded-lg !overflow-x-auto !text-sm !font-mono !leading-relaxed !border-2 !border-[color:var(--color-border)] !m-0">
      <code ref={codeRef} className={`language-${prismLanguage}`}>
        {code}
      </code>
    </pre>
  );
};

export default SyntaxHighlighter;
