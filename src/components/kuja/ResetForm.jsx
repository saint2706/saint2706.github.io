import React, { useState, useId, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';

const ResetForm = ({ onSubmit, isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nameId = useId();
  const reasonId = useId();
  const nameInputRef = useRef(null);

  // Focus management - focus input after modal animation completes
  useEffect(() => {
    if (isOpen && nameInputRef.current) {
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !reason.trim()) return;

    setIsSubmitting(true);
    await onSubmit(name, reason);
    setIsSubmitting(false);
    setName('');
    setReason('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            id="reset-form-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-form-title"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-bg-secondary border border-border rounded-xl p-6 w-full max-w-md shadow-2xl relative"
          >
            <button
              onClick={onClose}
              aria-label="Close form"
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-accent rounded-full p-1"
            >
              <X size={24} />
            </button>

            <h2 id="reset-form-title" className="text-2xl font-bold text-text-primary mb-6">Record a Loss</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor={nameId} className="block text-sm font-medium text-text-secondary mb-1">
                  Who are you?
                </label>
                <input
                  id={nameId}
                  ref={nameInputRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={50}
                  className="w-full px-4 py-2 rounded-lg bg-bg-primary border border-border focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent text-text-primary transition-colors"
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <label htmlFor={reasonId} className="block text-sm font-medium text-text-secondary mb-1">
                  What did Kuja lose?
                </label>
                <textarea
                  id={reasonId}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  maxLength={200}
                  className="w-full px-4 py-2 rounded-lg bg-bg-primary border border-border focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent text-text-primary transition-colors min-h-[100px]"
                  placeholder="Keys, wallet, sanity..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting ? "true" : "false"}
                className="w-full py-3 px-4 bg-accent hover:bg-accent/90 text-bg-primary font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-secondary flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Resetting Counter...</span>
                  </>
                ) : (
                  <span>Reset Counter</span>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ResetForm;
