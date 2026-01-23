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
 * When activated, switches to the classic (old) theme.
 * Returns [isActivated, reset] where:
 * - isActivated: boolean indicating if classic mode is on
 * - reset: function to reset back to Neubrutalism
 */
const useKonamiCode = () => {
    const [inputSequence, setInputSequence] = useState([]);
    const [isActivated, setIsActivated] = useState(() => {
        // Check localStorage for persisted state
        return localStorage.getItem('classic_mode') === 'true';
    });

    const reset = useCallback(() => {
        setIsActivated(false);
        setInputSequence([]);
        localStorage.setItem('classic_mode', 'false');
        // Remove classic class, keep dark/light preference
        document.documentElement.classList.remove('classic', 'retro-mode');
    }, []);

    const activate = useCallback(() => {
        setIsActivated(true);
        localStorage.setItem('classic_mode', 'true');
        // Add classic class for old theme
        document.documentElement.classList.add('classic');
        // Remove retro-mode if it was there
        document.documentElement.classList.remove('retro-mode');
    }, []);

    // Apply classic mode on mount if already activated
    useEffect(() => {
        if (isActivated) {
            document.documentElement.classList.add('classic');
        }
        return () => {
            // Cleanup on unmount
            document.documentElement.classList.remove('classic');
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
