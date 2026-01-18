import { useState, useEffect, useCallback } from 'react';

// The classic Konami Code sequence
const KONAMI_CODE = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight'
];

/**
 * Custom hook that listens for the Konami Code sequence.
 * Returns [isActivated, reset] where:
 * - isActivated: boolean indicating if the code was entered
 * - reset: function to reset the activation state
 */
const useKonamiCode = () => {
    const [inputSequence, setInputSequence] = useState([]);
    const [isActivated, setIsActivated] = useState(() => {
        // Check localStorage for persisted state
        return localStorage.getItem('konami-mode') === 'true';
    });

    const reset = useCallback(() => {
        setIsActivated(false);
        setInputSequence([]);
        localStorage.removeItem('konami-mode');
        document.documentElement.classList.remove('retro-mode');
    }, []);

    const activate = useCallback(() => {
        setIsActivated(true);
        localStorage.setItem('konami-mode', 'true');
        document.documentElement.classList.add('retro-mode');
    }, []);

    // Apply retro mode on mount if already activated
    useEffect(() => {
        if (isActivated) {
            document.documentElement.classList.add('retro-mode');
        }
        return () => {
            // Cleanup on unmount
            document.documentElement.classList.remove('retro-mode');
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            // Don't trigger if user is typing in an input
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                return;
            }

            const newSequence = [...inputSequence, event.key].slice(-KONAMI_CODE.length);
            setInputSequence(newSequence);

            // Check if the sequence matches
            if (newSequence.length === KONAMI_CODE.length) {
                const isMatch = newSequence.every((key, index) => key === KONAMI_CODE[index]);
                if (isMatch && !isActivated) {
                    activate();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [inputSequence, isActivated, activate]);

    return [isActivated, reset];
};

export default useKonamiCode;
