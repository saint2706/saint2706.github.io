import {
  __resetPyodideLoaderForTests,
  loadPyodide,
} from '../src/components/shared/pyodideLoader.js';

const originalWindow = globalThis.window;
const originalDocument = globalThis.document;
const originalSetTimeout = globalThis.setTimeout;
const originalClearTimeout = globalThis.clearTimeout;

const makeScript = () => ({
  src: '',
  integrity: '',
  crossOrigin: '',
  onload: null,
  onerror: null,
  parentNode: null,
});

const runRetryScenario = async () => {
  __resetPyodideLoaderForTests();

  let appendAttempts = 0;
  let removedScripts = 0;

  const mockWindow = {
    loadPyodide: null,
  };

  const mockDocument = {
    head: {
      appendChild(script) {
        appendAttempts += 1;
        script.parentNode = this;

        if (typeof script.onload !== 'function' || typeof script.onerror !== 'function') {
          throw new Error('Expected script handlers to be assigned before appendChild.');
        }

        queueMicrotask(() => {
          if (appendAttempts === 1) {
            script.onerror(new Error('network down'));
            return;
          }

          mockWindow.loadPyodide = async ({ indexURL }) => {
            if (!indexURL.includes('/pyodide/v0.24.1/full/')) {
              throw new Error(`Unexpected indexURL: ${indexURL}`);
            }
            return { ready: true };
          };
          script.onload();
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
};

const runTimeoutScenario = async () => {
  __resetPyodideLoaderForTests();

  let removedScripts = 0;
  const timeoutCallbacks = new Map();
  let timeoutIdCounter = 0;
  let clearTimeoutCalls = 0;

  globalThis.setTimeout = (fn) => {
    timeoutIdCounter += 1;
    timeoutCallbacks.set(timeoutIdCounter, fn);
    return timeoutIdCounter;
  };
  globalThis.clearTimeout = (id) => {
    clearTimeoutCalls += 1;
    timeoutCallbacks.delete(id);
  };

  const mockWindow = {
    loadPyodide: null,
  };

  const mockDocument = {
    head: {
      appendChild(script) {
        script.parentNode = this;
      },
      removeChild(script) {
        if (script?.parentNode !== this) {
          throw new Error('Tried to remove script with unexpected parent in timeout scenario.');
        }
        removedScripts += 1;
        script.parentNode = null;
      },
    },
    createElement() {
      return makeScript();
    },
  };

  globalThis.window = mockWindow;
  globalThis.document = mockDocument;

  const pendingLoad = loadPyodide();

  for (const callback of timeoutCallbacks.values()) {
    callback();
  }

  let timeoutErrorCaught = false;
  try {
    await pendingLoad;
  } catch (error) {
    timeoutErrorCaught = error.message === 'Timed out loading Pyodide script';
  }

  if (!timeoutErrorCaught) {
    throw new Error('Expected loader to reject with timeout error.');
  }

  if (removedScripts !== 1) {
    throw new Error(`Expected timeout failure to cleanup one script, got ${removedScripts}.`);
  }

  if (clearTimeoutCalls < 1) {
    throw new Error('Expected clearTimeout to be called when timeout failure settles.');
  }
};

try {
  await runRetryScenario();
  await runTimeoutScenario();
  console.log('pyodide loader retry+timeout regression scenarios passed');
} finally {
  __resetPyodideLoaderForTests();
  globalThis.window = originalWindow;
  globalThis.document = originalDocument;
  globalThis.setTimeout = originalSetTimeout;
  globalThis.clearTimeout = originalClearTimeout;
}
