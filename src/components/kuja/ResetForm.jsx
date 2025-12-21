import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const ResetForm = ({ onSubmit, isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-bg-secondary border border-border rounded-xl p-6 w-full max-w-md shadow-2xl relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold text-text-primary mb-6">Record a Loss</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Who are you?
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={50}
                  className="w-full px-4 py-2 rounded-lg bg-bg-primary border border-border focus:border-accent focus:outline-none text-text-primary transition-colors"
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  What did Kuja lose?
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  maxLength={200}
                  className="w-full px-4 py-2 rounded-lg bg-bg-primary border border-border focus:border-accent focus:outline-none text-text-primary transition-colors min-h-[100px]"
                  placeholder="Keys, wallet, sanity..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-accent hover:bg-accent/90 text-bg-primary font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Resetting Counter...' : 'Reset Counter'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ResetForm;
