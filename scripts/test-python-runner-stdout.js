import { executePythonWithCapturedStdout } from '../src/components/shared/pythonExecution.js';

const createMockPyodide = () => {
  let redirected = false;
  let captured = '';
  const defaultStdout = [];
  let restoreCalls = 0;

  return {
    runPython(code) {
      if (code.includes('sys.stdout = StringIO()')) {
        redirected = true;
        captured = '';
        return null;
      }

      if (code === 'sys.stdout = sys.__stdout__') {
        redirected = false;
        restoreCalls += 1;
        return null;
      }

      if (code === 'sys.stdout.getvalue()') {
        return captured;
      }

      if (code === 'raise_exception') {
        throw new Error('boom');
      }

      if (code === 'print_success') {
        if (redirected) {
          captured += 'ok\n';
        } else {
          defaultStdout.push('ok');
        }
        return null;
      }

      throw new Error(`Unexpected code: ${code}`);
    },
    getState() {
      return {
        redirected,
        captured,
        defaultStdout,
        restoreCalls,
      };
    },
  };
};

const pyodide = createMockPyodide();

let firstRunFailed = false;
try {
  executePythonWithCapturedStdout(pyodide, 'raise_exception');
} catch (error) {
  firstRunFailed = error.message === 'boom';
}

if (!firstRunFailed) {
  throw new Error('Expected first run to throw the simulated Python exception.');
}

if (pyodide.getState().redirected) {
  throw new Error('stdout was not restored after exception.');
}

const secondOutput = executePythonWithCapturedStdout(pyodide, 'print_success');

if (secondOutput !== 'ok\n') {
  throw new Error(`Expected second run output to be "ok\\n", got "${secondOutput}".`);
}

if (pyodide.getState().restoreCalls !== 2) {
  throw new Error('Expected stdout restore to run after both executions.');
}

console.log('stdout restore regression scenario passed');
