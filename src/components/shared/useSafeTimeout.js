import { useCallback, useEffect, useRef } from 'react';

/**
 * Track timeout IDs and automatically clear them on unmount.
 *
 * @returns {{setSafeTimeout: Function, clear: Function, clearAll: Function}}
 */
export const useSafeTimeout = () => {
  const timeoutIdsRef = useRef(new Set());

  const clear = useCallback(id => {
    if (id == null) return;
    clearTimeout(id);
    timeoutIdsRef.current.delete(id);
  }, []);

  const clearAll = useCallback(() => {
    timeoutIdsRef.current.forEach(id => clearTimeout(id));
    timeoutIdsRef.current.clear();
  }, []);

  const setSafeTimeout = useCallback(
    (callback, delay = 0) => {
      const id = setTimeout(() => {
        timeoutIdsRef.current.delete(id);
        callback();
      }, delay);
      timeoutIdsRef.current.add(id);
      return id;
    },
    []
  );

  useEffect(() => clearAll, [clearAll]);

  return { setSafeTimeout, clear, clearAll };
};

export default useSafeTimeout;
