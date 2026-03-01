// Global Pyodide instance - shared across all PythonRunner components for efficiency
let pyodideInstance = null;
// Loading promise - prevents multiple simultaneous loads from CDN
let pyodideLoadingPromise = null;

const PYODIDE_SCRIPT_SRC = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
const PYODIDE_INDEX_URL = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/';
const PYODIDE_SCRIPT_SRI =
  'sha384-+R8PTzDXzivdjpxOqwVwRhPS9dlske7tKAjwj0O0Kr361gKY5d2Xe6Osl+faRLT7';

/**
 * Loads Pyodide runtime from CDN and caches it globally.
 *
 * @async
 * @returns {Promise<object>} Pyodide runtime instance
 */
export const loadPyodide = async () => {
  if (pyodideInstance) return pyodideInstance;
  if (pyodideLoadingPromise) return pyodideLoadingPromise;

  pyodideLoadingPromise = (async () => {
    let injectedScript = null;

    try {
      if (!window.loadPyodide) {
        const script = document.createElement('script');
        script.src = PYODIDE_SCRIPT_SRC;
        script.integrity = PYODIDE_SCRIPT_SRI;
        script.crossOrigin = 'anonymous';
        injectedScript = script;
        document.head.appendChild(script);

        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = () => reject(new Error('Failed to load Pyodide script'));
        });
      }

      pyodideInstance = await window.loadPyodide({
        indexURL: PYODIDE_INDEX_URL,
      });

      return pyodideInstance;
    } catch (error) {
      pyodideLoadingPromise = null;
      if (injectedScript?.parentNode) {
        injectedScript.parentNode.removeChild(injectedScript);
      }
      throw error;
    }
  })();

  return pyodideLoadingPromise;
};

/**
 * Resets the internal Pyodide loader state.
 * This is primarily used for testing purposes to ensure a clean state between tests.
 *
 * @private
 */
export const __resetPyodideLoaderForTests = () => {
  pyodideInstance = null;
  pyodideLoadingPromise = null;
};
