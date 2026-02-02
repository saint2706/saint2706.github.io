import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Play, Loader2 } from 'lucide-react';

// Global Pyodide instance
let pyodideInstance = null;
let pyodideLoadingPromise = null;

const loadPyodide = async () => {
    if (pyodideInstance) return pyodideInstance;

    if (pyodideLoadingPromise) return pyodideLoadingPromise;

    pyodideLoadingPromise = (async () => {
        // Load Pyodide from CDN
        if (!window.loadPyodide) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
            document.head.appendChild(script);

            await new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = reject;
            });
        }

        pyodideInstance = await window.loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
        });

        return pyodideInstance;
    })();

    return pyodideLoadingPromise;
};

const PythonRunner = ({ snippet, shouldReduceMotion }) => {
    const [inputValue, setInputValue] = useState(snippet.interactive?.defaultInput || '');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pyodideReady, setPyodideReady] = useState(false);
    const outputRef = useRef(null);

    // Preload Pyodide when component mounts
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

            // Generate code from template
            const code = snippet.interactive.codeTemplate(inputValue.trim());

            // Capture stdout
            pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
            `);

            // Run the actual code
            pyodide.runPython(code);

            // Get the output
            const result = pyodide.runPython('sys.stdout.getvalue()');
            setOutput(result);

            // Reset stdout
            pyodide.runPython('sys.stdout = sys.__stdout__');

        } catch (err) {
            setError(err.message);
            console.error('Python execution error:', err);
        } finally {
            setIsRunning(false);
        }
    }, [inputValue, snippet.interactive]);

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
