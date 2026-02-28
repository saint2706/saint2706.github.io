// Global Pyodide instance - shared across all PythonRunner components for efficiency
let pyodideInstance = null;
// Loading promise - prevents multiple simultaneous loads from CDN
let pyodideLoadingPromise = null;

const PYODIDE_SCRIPT_SRC = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
const PYODIDE_INDEX_URL = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/';
const PYODIDE_SCRIPT_SRI =
  'sha384-+R8PTzDXzivdjpxOqwVwRhPS9dlske7tKAjwj0O0Kr361gKY5d2Xe6Osl+faRLT7';
const PYODIDE_SCRIPT_LOAD_TIMEOUT_MS = 12_000;

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
        await new Promise((resolve, reject) => {
          let settled = false;
          const settle = (handler) => {
            if (settled) return;
            settled = true;
            clearTimeout(timeoutId);
            handler();
          };
          const timeoutId = setTimeout(() => {
            settle(() => reject(new Error('Timed out loading Pyodide script')));
          }, PYODIDE_SCRIPT_LOAD_TIMEOUT_MS);

          script.onload = () => {
            settle(resolve);
          };
          script.onerror = () => {
            settle(() => reject(new Error('Failed to load Pyodide script')));
          };

          document.head.appendChild(script);
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

export const __resetPyodideLoaderForTests = () => {
  pyodideInstance = null;
  pyodideLoadingPromise = null;
};
