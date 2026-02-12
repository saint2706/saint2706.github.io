/**
 * Execute Python code while capturing stdout to StringIO.
 *
 * Guarantees sys.stdout is restored even if user code raises an exception.
 *
 * @param {object} pyodide - Pyodide runtime instance
 * @param {string} code - Python code to execute
 * @returns {string} Captured stdout
 */
export const executePythonWithCapturedStdout = (pyodide, code) => {
  pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
  `);

  try {
    pyodide.runPython(code);
    return pyodide.runPython('sys.stdout.getvalue()');
  } finally {
    pyodide.runPython('sys.stdout = sys.__stdout__');
  }
};
