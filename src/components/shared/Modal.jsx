import React, { useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
    const modalRef = useRef(null);
    const previousFocus = useRef(null);

    // Store the previously focused element and focus the modal when it opens
    useEffect(() => {
        if (isOpen) {
            previousFocus.current = document.activeElement;
            // Focus the close button after a short delay
            setTimeout(() => {
                modalRef.current?.querySelector('button')?.focus();
            }, 50);
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            // Restore focus when closing
            previousFocus.current?.focus?.();
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Handle escape key
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') {
            onClose();
        }
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, handleKeyDown]);

    // Handle click outside
    const handleBackdropClick = (e) => {
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
                        className="relative w-full max-w-2xl max-h-[85vh] bg-card border-nb border-[color:var(--color-border)] rounded-nb overflow-hidden flex flex-col"
                        style={{ boxShadow: 'var(--nb-shadow-hover)' }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-[color:var(--color-border)] bg-secondary">
                            <h2
                                id="modal-title"
                                className="font-heading font-bold text-lg text-primary"
                            >
                                {title}
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 bg-card border-2 border-[color:var(--color-border)] rounded-nb text-primary hover:bg-fun-pink hover:text-white transition-colors"
                                style={{ boxShadow: '2px 2px 0 var(--color-border)' }}
                                aria-label="Close modal"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-auto p-5">
                            {children}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Modal;
