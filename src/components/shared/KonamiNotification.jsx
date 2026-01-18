import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, X } from 'lucide-react';

/**
 * A floating notification that appears when the Konami Code is activated.
 * Shows the retro mode status and allows users to disable it.
 */
const KonamiNotification = ({ isActive, onClose }) => {
    return (
        <AnimatePresence>
            {isActive && (
                <motion.div
                    initial={{ opacity: 0, y: 100, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 100, scale: 0.8 }}
                    transition={{
                        type: 'spring',
                        bounce: 0.5,
                        duration: 0.6
                    }}
                    className="fixed bottom-20 left-4 z-50"
                >
                    <motion.div
                        className="relative overflow-hidden"
                        animate={{
                            boxShadow: [
                                '0 0 20px #00ff00, 0 0 40px #ff00ff',
                                '0 0 30px #ff00ff, 0 0 60px #00ff00',
                                '0 0 20px #00ff00, 0 0 40px #ff00ff'
                            ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{
                            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 100%)',
                            border: '3px solid #ff00ff',
                            padding: '12px 16px',
                        }}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-1 right-1 p-1 hover:bg-white/10 transition-colors"
                            aria-label="Disable retro mode"
                            style={{ border: 'none', boxShadow: 'none' }}
                        >
                            <X size={14} style={{ color: '#ff00ff' }} />
                        </button>

                        <div className="flex items-center gap-3 pr-4">
                            <motion.div
                                animate={{ rotate: [0, -10, 10, -10, 0] }}
                                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                            >
                                <Gamepad2 size={24} style={{ color: '#00ff00' }} />
                            </motion.div>

                            <div>
                                <motion.p
                                    className="text-xs font-bold tracking-wide"
                                    style={{
                                        color: '#00ff00',
                                        fontFamily: "'Press Start 2P', cursive",
                                        fontSize: '0.6rem',
                                        textShadow: '0 0 10px #00ff00'
                                    }}
                                    animate={{ opacity: [1, 0.7, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                >
                                    RETRO MODE ON!
                                </motion.p>
                                <p
                                    className="text-xs mt-1"
                                    style={{
                                        color: '#ff00ff',
                                        fontFamily: "'Press Start 2P', cursive",
                                        fontSize: '0.45rem'
                                    }}
                                >
                                    ↑↑↓↓←→←→ ACTIVATED
                                </p>
                            </div>
                        </div>

                        {/* Animated scanlines */}
                        <motion.div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 3px)'
                            }}
                            animate={{ opacity: [0.3, 0.5, 0.3] }}
                            transition={{ duration: 0.1, repeat: Infinity }}
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default KonamiNotification;
