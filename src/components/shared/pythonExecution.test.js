import { describe, it, expect, vi } from 'vitest';
import { executePythonWithCapturedStdout } from './pythonExecution';

describe('executePythonWithCapturedStdout', () => {
  it('executes code and returns captured stdout', () => {
    const runPythonMock = vi
      .fn()
      .mockImplementationOnce(() => {}) // Setup capture
      .mockImplementationOnce(() => {}) // User code
      .mockImplementationOnce(() => 'captured output') // Get stdout
      .mockImplementationOnce(() => {}); // Restore stdout

    const pyodide = { runPython: runPythonMock };
    const code = 'print("hello")';

    const result = executePythonWithCapturedStdout(pyodide, code);

    expect(result).toBe('captured output');
    expect(runPythonMock).toHaveBeenCalledTimes(4);

    // Check call order and arguments
    expect(runPythonMock.mock.calls[0][0]).toContain('sys.stdout = StringIO()');
    expect(runPythonMock.mock.calls[1][0]).toBe(code);
    expect(runPythonMock.mock.calls[2][0]).toBe('sys.stdout.getvalue()');
    expect(runPythonMock.mock.calls[3][0]).toBe('sys.stdout = sys.__stdout__');
  });

  it('restores stdout even if user code throws', () => {
    const error = new Error('User code failed');
    const runPythonMock = vi
      .fn()
      .mockImplementationOnce(() => {}) // Setup capture
      .mockImplementationOnce(() => {
        throw error;
      }) // User code throws
      // Get stdout skipped
      .mockImplementationOnce(() => {}); // Restore stdout

    const pyodide = { runPython: runPythonMock };
    const code = 'raise Exception("fail")';

    expect(() => executePythonWithCapturedStdout(pyodide, code)).toThrow(error);

    expect(runPythonMock).toHaveBeenCalledTimes(3);

    // Check call order and arguments
    expect(runPythonMock.mock.calls[0][0]).toContain('sys.stdout = StringIO()');
    expect(runPythonMock.mock.calls[1][0]).toBe(code);
    // getvalue() is skipped
    expect(runPythonMock.mock.calls[2][0]).toBe('sys.stdout = sys.__stdout__');
  });
});
