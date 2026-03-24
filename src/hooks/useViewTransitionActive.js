import { useState, useEffect } from 'react';

/**
 * Hook that tracks whether a View Transition is currently in flight.
 *
 * Components can use this to apply conditional CSS classes (e.g., dim a
 * sidebar or disable pointer events) while the browser is mid-transition.
 *
 * On browsers without View Transitions API support this always returns false.
 *
 * @returns {boolean} `true` while a transition is animating, `false` otherwise.
 */
export const useViewTransitionActive = () => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    if (!('startViewTransition' in document)) return undefined;

    const original = document.startViewTransition.bind(document);

    document.startViewTransition = callback => {
      setIsActive(true);
      const transition = original(callback);
      transition.finished.finally(() => setIsActive(false));
      return transition;
    };

    return () => {
      document.startViewTransition = original;
    };
  }, []);

  return isActive;
};
