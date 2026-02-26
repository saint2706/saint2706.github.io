import { useRef, useEffect } from 'react';

/**
 * Hook to track whether a component is currently mounted.
 * Useful for preventing state updates on unmounted components in async callbacks.
 *
 * @returns {React.MutableRefObject<boolean>} A ref that is true if mounted, false otherwise.
 */
export const useIsMounted = () => {
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return isMountedRef;
};
