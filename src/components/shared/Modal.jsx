/**
 * Modal Component Module
 *
 * Provides a reusable, accessible modal dialog component with focus management
 * and keyboard navigation. This component follows WAI-ARIA dialog best practices
 * including focus trapping, escape key handling, and proper ARIA attributes.
 *
 * Features:
 * - Focus trap: keyboard focus stays within modal when open
 * - Focus restoration: returns focus to trigger element when closed
 * - Escape key handling: closes modal on Escape press
 * - Click-outside: closes modal when clicking the backdrop
 * - Body scroll lock: prevents background scrolling when modal is open
 * - Smooth animations with AnimatePresence
 * - Fully accessible with ARIA attributes
 *
 * @module components/shared/Modal
 */

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useTheme } from './theme-context';
import { getOverlayShell } from './ThemedPrimitives.utils';
import { useFocusTrap } from './useFocusTrap';

/**
 * Accessible modal dialog component.
 *
 * This modal implements a complete focus management system using the useFocusTrap hook:
 * - Stores the previously focused element before opening
 * - Automatically focuses the close button when modal opens
 * - Prevents body scrolling while modal is open
 * - Restores focus to the original element when closing
 * - Handles Escape key to close
 * - Allows clicking backdrop to close
 *
 * @component
 * @param {object} props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onClose - Callback function when modal should close
 * @param {string} props.title - Modal title shown in header
 * @param {React.ReactNode} props.children - Content to render inside modal
 * @returns {JSX.Element|null} Modal dialog or null if closed
 *
 * @example
 * <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Example">
 *   <p>Modal content goes here</p>
 * </Modal>
 */
const Modal = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef(null);
  const { theme } = useTheme();
  const isLiquid = theme === 'liquid';
  const shell = getOverlayShell({ theme, depth: 'hover' });

  /**
   * Manages focus and scroll behavior when modal opens/closes.
   * This hook handles:
   * - Focus trapping
   * - Focus restoration
   * - Body scroll locking
   * - Escape key handling
   */
  useFocusTrap({
    isOpen,
    containerRef: modalRef,
    onClose,
    preventScroll: true,
  });

  /**
   * Closes the modal when clicking on the backdrop (outside the modal content).
   * Only triggers if the click target is the backdrop itself, not child elements.
   * This check (e.target === e.currentTarget) prevents closing when clicking
   * inside the modal content.
   *
   * @param {MouseEvent} e - Click event
   */
  const handleBackdropClick = e => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col ${shell.className}`}
            style={shell.style}
          >
            {/* Header */}
            <div
              className={
                isLiquid
                  ? 'flex items-center justify-between px-5 py-4 border-b border-[color:var(--border-soft)] bg-[color:var(--surface-muted)]'
                  : 'flex items-center justify-between px-5 py-4 border-b-2 border-[color:var(--color-border)] bg-secondary'
              }
            >
              <h2 id="modal-title" className="font-heading font-bold text-lg text-primary">
                {title}
              </h2>
              <button
                onClick={onClose}
                className={
                  isLiquid
                    ? 'group relative p-2 lg-surface-3 lg-pill lg-spring-hover rounded-full text-primary hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'
                    : 'group relative p-2 bg-card border-2 border-[color:var(--color-border)] rounded-nb text-primary hover:bg-fun-pink hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-secondary'
                }
                style={isLiquid ? undefined : { boxShadow: '2px 2px 0 var(--color-border)' }}
                aria-label="Close modal"
              >
                <X size={18} />
                <span
                  className="absolute top-full mt-2 right-0 bg-black text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 font-sans"
                  aria-hidden="true"
                >
                  Close
                </span>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
