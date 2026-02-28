import { useEffect, useRef, useCallback } from 'react';

let bodyScrollLockCount = 0;
let previousBodyOverflow = '';

const lockBodyScroll = () => {
  if (bodyScrollLockCount === 0) {
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  bodyScrollLockCount += 1;
};

const unlockBodyScroll = () => {
  if (bodyScrollLockCount === 0) {
    return;
  }

  bodyScrollLockCount -= 1;

  if (bodyScrollLockCount === 0) {
    document.body.style.overflow = previousBodyOverflow;
    previousBodyOverflow = '';
  }
};

/**
 * Hook to trap focus within a container, lock body scroll, and restore focus on close.
 *
 * @param {Object} options
 * @param {boolean} options.isOpen - Whether the modal/overlay is open.
 * @param {React.RefObject} options.containerRef - Ref to the container element to trap focus within.
 * @param {Function} options.onClose - Callback to close the overlay (e.g., on Escape).
 * @param {React.RefObject} [options.initialFocusRef] - Optional ref to focus initially when opened.
 * @param {boolean} [options.preventScroll=true] - Whether to prevent body scroll when open. Defaults to true.
 */
export const useFocusTrap = ({
  isOpen,
  containerRef,
  onClose,
  initialFocusRef,
  preventScroll = true,
}) => {
  const previousFocus = useRef(null);
  const initialFocusTimeoutRef = useRef(null);
  const hasScrollLock = useRef(false);

  // Manage focus restoration and scroll lock
  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement;

      // Initial focus
      // Small timeout to allow mounting/animation
      clearTimeout(initialFocusTimeoutRef.current);
      initialFocusTimeoutRef.current = setTimeout(() => {
        if (initialFocusRef?.current) {
          initialFocusRef.current.focus();
        } else if (containerRef?.current) {
          // Fallback to first focusable element
          const focusable = containerRef.current.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          focusable?.focus();
        }
      }, 50);

    } else {
      previousFocus.current?.focus?.();
    }

    return () => {
      clearTimeout(initialFocusTimeoutRef.current);
    };
  }, [isOpen, initialFocusRef, containerRef]);

  useEffect(() => {
    if (isOpen && preventScroll && !hasScrollLock.current) {
      lockBodyScroll();
      hasScrollLock.current = true;
    }

    if ((!isOpen || !preventScroll) && hasScrollLock.current) {
      unlockBodyScroll();
      hasScrollLock.current = false;
    }

    return () => {
      if (hasScrollLock.current) {
        unlockBodyScroll();
        hasScrollLock.current = false;
      }
    };
  }, [isOpen, preventScroll]);

  useEffect(() => () => clearTimeout(initialFocusTimeoutRef.current), []);

  // Handle keyboard navigation (Trap + Escape)
  const handleKeyDown = useCallback(
    e => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key !== 'Tab' || !containerRef.current) return;

      const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        "[tabindex]:not([tabindex='-1'])",
        "[contenteditable='true']",
      ];

      const focusableElements = Array.from(
        containerRef.current.querySelectorAll(focusableSelectors.join(', '))
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (e.shiftKey) {
        if (activeElement === firstElement || !focusableElements.includes(activeElement)) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (activeElement === lastElement || !focusableElements.includes(activeElement)) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    },
    [isOpen, onClose, containerRef]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);
};

export default useFocusTrap;
