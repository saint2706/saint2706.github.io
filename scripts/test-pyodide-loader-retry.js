import {
  __resetPyodideLoaderForTests,
  loadPyodide,
} from '../src/components/shared/pyodideLoader.js';

__resetPyodideLoaderForTests();

const originalWindow = globalThis.window;
const originalDocument = globalThis.document;

let appendAttempts = 0;
let removedScripts = 0;

const makeScript = () => ({
  src: '',
  integrity: '',
  crossOrigin: '',
  onload: null,
  onerror: null,
  parentNode: null,
});

const mockWindow = {
  loadPyodide: null,
};

const mockDocument = {
  head: {
    appendChild(script) {
      appendAttempts += 1;
      script.parentNode = this;

      queueMicrotask(() => {
        if (appendAttempts === 1) {
          script.onerror?.(new Error('network down'));
          return;
        }

        mockWindow.loadPyodide = async ({ indexURL }) => {
          if (!indexURL.includes('/pyodide/v0.24.1/full/')) {
            throw new Error(`Unexpected indexURL: ${indexURL}`);
          }
          return { ready: true };
        };
        script.onload?.();
      });
    },
    removeChild(script) {
      if (script?.parentNode !== this) {
        throw new Error('Tried to remove script with unexpected parent.');
      }
      removedScripts += 1;
      script.parentNode = null;
    },
  },
  createElement(tagName) {
    if (tagName !== 'script') {
      throw new Error(`Unexpected tag: ${tagName}`);
    }
    return makeScript();
  },
};

try {
  globalThis.window = mockWindow;
  globalThis.document = mockDocument;

  let firstErrorCaught = false;
  try {
    await loadPyodide();
  } catch (error) {
    firstErrorCaught = error.message === 'Failed to load Pyodide script';
  }

  if (!firstErrorCaught) {
    throw new Error('Expected first load attempt to fail with script load error.');
  }

  const pyodide = await loadPyodide();

  if (!pyodide?.ready) {
    throw new Error('Expected second load attempt to return the mock pyodide instance.');
  }

  if (appendAttempts !== 2) {
    throw new Error(`Expected two script injection attempts, got ${appendAttempts}.`);
  }

  if (removedScripts !== 1) {
    throw new Error(`Expected one failed script cleanup, got ${removedScripts}.`);
  }

  // Verify successful load is cached and doesn't re-append script.
  const cached = await loadPyodide();
  if (cached !== pyodide) {
    throw new Error('Expected cached pyodide instance to be returned after success.');
  }
  if (appendAttempts !== 2) {
    throw new Error('Expected cached load to avoid additional script injection.');
  }

  console.log('pyodide loader retry regression scenario passed');
} finally {
  globalThis.window = originalWindow;
  globalThis.document = originalDocument;
}
