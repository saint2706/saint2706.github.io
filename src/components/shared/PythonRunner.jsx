/**
 * Python Runner Component Module
 * 
 * Provides an interactive Python code execution environment using Pyodide (Python compiled to WebAssembly).
 * This component allows users to run Python code directly in the browser with a terminal-like interface.
 * 
 * Features:
 * - Async Pyodide loading with global instance caching
 * - Dynamic code generation from templates
 * - Standard output (stdout) capture and display
 * - Loading states and error handling
 * - Keyboard shortcuts (Enter to run)
 * - Terminal-style UI with syntax highlighting
 * 
 * Technical Implementation:
 * - Pyodide is loaded once globally and reused across all instances
 * - Loading promise prevents duplicate CDN requests
 * - stdout is redirected to StringIO for capture
 * - Code execution is sandboxed in the browser's WASM runtime
 * 
 * @module components/shared/PythonRunner
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Play, Loader2 } from 'lucide-react';

// Global Pyodide instance - shared across all PythonRunner components for efficiency
let pyodideInstance = null;
// Loading promise - prevents multiple simultaneous loads from CDN
let pyodideLoadingPromise = null;

/**
 * Loads Pyodide runtime from CDN and caches it globally.
 * 
 * This function implements several optimizations:
 * - Returns cached instance if already loaded
 * - Returns in-progress promise if currently loading (prevents duplicate requests)
 * - Dynamically injects CDN script if not already present
 * - Caches the loaded instance for reuse
 * 
 * Pyodide is ~6MB, so caching is critical for performance.
 * 
 * @async
 * @returns {Promise<object>} Pyodide runtime instance
 * @private
 */
const loadPyodide = async () => {
    // Return cached instance if already loaded
    if (pyodideInstance) return pyodideInstance;

    // Return in-progress loading promise if currently loading
    if (pyodideLoadingPromise) return pyodideLoadingPromise;

    // Start loading process
    pyodideLoadingPromise = (async () => {
        // Dynamically inject Pyodide CDN script if not present
        if (!window.loadPyodide) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
            document.head.appendChild(script);

            // Wait for script to load
            await new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = reject;
            });
        }

        // Initialize Pyodide runtime with CDN path
        pyodideInstance = await window.loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
        });

        return pyodideInstance;
    })();

    return pyodideLoadingPromise;
};

/**
 * Interactive Python code execution component.
 * 
 * This component provides a terminal-like interface for running Python code snippets
 * in the browser using Pyodide. Users can provide input via a text field, which is
 * then interpolated into a code template and executed.
 * 
 * Execution Flow:
 * 1. User enters input and clicks Run (or presses Enter)
 * 2. Input is validated and inserted into code template
 * 3. Python stdout is redirected to StringIO for capture
 * 4. Code is executed in Pyodide runtime
 * 5. Output is captured from StringIO and displayed
 * 6. stdout is restored to default
 * 
 * @component
 * @param {object} props
 * @param {object} props.snippet - Code snippet configuration object
 * @param {object} props.snippet.interactive - Interactive configuration
 * @param {Function} props.snippet.interactive.codeTemplate - Function that generates Python code from input
 * @param {string} props.snippet.interactive.defaultInput - Default input value
 * @param {string} props.snippet.interactive.inputLabel - Label for input field
 * @param {boolean} props.shouldReduceMotion - Whether to reduce animations
 * @returns {JSX.Element} Interactive Python runner interface
 */
const PythonRunner = ({ snippet, shouldReduceMotion }) => {
    const [inputValue, setInputValue] = useState(snippet.interactive?.defaultInput || '');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false); // Code execution in progress
    const [isLoading, setIsLoading] = useState(false); // Pyodide runtime loading
    const [error, setError] = useState(null);
    const [pyodideReady, setPyodideReady] = useState(false); // Runtime initialization complete
    const outputRef = useRef(null);

    /**
     * Preload Pyodide runtime when component mounts.
     * 
     * This eagerly loads the Python runtime in the background so it's ready
     * when the user clicks Run. Without preloading, the first execution would
     * have a significant delay (~1-2 seconds) while Pyodide loads.
     * 
     * Handles loading errors gracefully by setting error state.
     */
    useEffect(() => {
        const preload = async () => {
            setIsLoading(true);
            try {
                await loadPyodide();
                setPyodideReady(true);
            } catch (err) {
                setError('Failed to load Python runtime');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        preload();
    }, []);

    /**
     * Executes Python code with user input and captures output.
     * 
     * This function:
     * 1. Validates user input (must not be empty)
     * 2. Gets the Pyodide runtime instance
     * 3. Generates Python code from template with user input
     * 4. Redirects Python stdout to StringIO for capture
     * 5. Executes the generated code
     * 6. Retrieves captured output from StringIO
     * 7. Restores stdout to default
     * 8. Displays output or error to user
     * 
     * Error Handling: Catches and displays Python execution errors (syntax errors,
     * runtime errors, etc.) in a user-friendly format.
     * 
     * @async
     */
    const runCode = useCallback(async () => {
        if (!inputValue.trim()) {
            setError('Please enter a name');
            return;
        }

        setIsRunning(true);
        setError(null);
        setOutput('');

        try {
            const pyodide = await loadPyodide();

            // Generate Python code from template with user input
            const code = snippet.interactive.codeTemplate(inputValue.trim());

            // Redirect stdout to StringIO to capture print statements
            pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
            `);

            // Execute the user's code
            pyodide.runPython(code);

            // Retrieve captured output from StringIO
            const result = pyodide.runPython('sys.stdout.getvalue()');
            setOutput(result);

            // Restore stdout to its original state
            pyodide.runPython('sys.stdout = sys.__stdout__');

        } catch (err) {
            // Display Python errors to user (syntax, runtime, etc.)
            setError(err.message);
            console.error('Python execution error:', err);
        } finally {
            setIsRunning(false);
        }
    }, [inputValue, snippet.interactive]);

    /**
     * Runs code when Enter key is pressed in the input field.
     * Only executes if Pyodide is ready and not currently running.
     * 
     * @param {KeyboardEvent} e - Keyboard event
     */
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !isRunning && pyodideReady) {
            runCode();
        }
    };

    return (
        <div className="mt-4 border-2 border-[color:var(--color-border)] rounded-lg overflow-hidden bg-gray-100">
            {/* Header */}
            <div className="bg-gray-200 px-3 py-2 border-b-2 border-[color:var(--color-border)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <span className="text-xs text-gray-600 font-mono ml-2">Python Runner (Pyodide)</span>
                </div>
                {isLoading && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Loader2 size={12} className="animate-spin" />
                        Loading Python...
                    </span>
                )}
                {pyodideReady && !isLoading && (
                    <span className="text-xs text-green-600 font-medium">✓ Ready</span>
                )}
            </div>

            {/* Input Section */}
            <div className="p-4 bg-white border-b-2 border-[color:var(--color-border)]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {snippet.interactive?.inputLabel || 'Input'}
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter your name..."
                        className="flex-1 px-3 py-2 border-2 border-[color:var(--color-border)] rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                        disabled={isRunning}
                    />
                    <button
                        onClick={runCode}
                        disabled={isRunning || !pyodideReady || isLoading}
                        className={`flex items-center gap-2 px-4 py-2 font-heading font-bold text-sm border-2 border-[color:var(--color-border)] rounded-md transition-all ${isRunning || !pyodideReady
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-accent text-white hover:-translate-x-0.5 hover:-translate-y-0.5'
                            }`}
                        style={{ boxShadow: isRunning || !pyodideReady ? 'none' : '2px 2px 0 var(--color-border)' }}
                    >
                        {isRunning ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                Running...
                            </>
                        ) : (
                            <>
                                <Play size={14} />
                                Run
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Output Section */}
            <div className="bg-gray-900 p-4 min-h-[120px] max-h-[300px] overflow-auto" ref={outputRef}>
                {error ? (
                    <pre className="text-red-400 font-mono text-xs whitespace-pre-wrap">
                        Error: {error}
                    </pre>
                ) : output ? (
                    <pre className="text-green-400 font-mono text-[8px] leading-tight whitespace-pre overflow-x-auto">
                        {output}
                    </pre>
                ) : (
                    <p className="text-gray-500 font-mono text-sm">
                        {isLoading ? 'Loading Python runtime...' : 'Click "Run" to execute the code'}
                    </p>
                )}
            </div>
        </div>
    );
};

export default PythonRunner;
