export const LIQUID_MOTION = {
  duration: {
    reveal: 0.5,
    interactive: 0.28,
    glow: 0.65,
  },
  easing: {
    reveal: [0.22, 1, 0.36, 1],
    glow: [0.4, 0, 0.2, 1],
  },
  offset: {
    x: 14,
    y: 14,
    subtleY: 10,
  },
};

/**
 * Lazy initialization of variant definitions to avoid object allocation on every call.
 * This function is called frequently by ScrollReveal, so caching is critical.
 */
let LIQUID_VARIANTS_CACHE = null;

const getLiquidVariants = () => {
  const x = LIQUID_MOTION.offset.x;
  const y = LIQUID_MOTION.offset.y;

  return {
    'fade-up': {
      hidden: { opacity: 0, y },
      visible: { opacity: 1, y: 0 },
    },
    'fade-down': {
      hidden: { opacity: 0, y: -y },
      visible: { opacity: 1, y: 0 },
    },
    'fade-left': {
      hidden: { opacity: 0, x: -x },
      visible: { opacity: 1, x: 0 },
    },
    'fade-right': {
      hidden: { opacity: 0, x },
      visible: { opacity: 1, x: 0 },
    },
    'scale-in': {
      hidden: { opacity: 0, scale: 0.98, y: LIQUID_MOTION.offset.subtleY },
      visible: { opacity: 1, scale: 1, y: 0 },
    },
    'slide-up': {
      hidden: { opacity: 0, y: y + 6 },
      visible: { opacity: 1, y: 0 },
    },
  };
};

export const getLiquidRevealVariant = variant => {
  if (!LIQUID_VARIANTS_CACHE) {
    LIQUID_VARIANTS_CACHE = getLiquidVariants();
  }

  return LIQUID_VARIANTS_CACHE[variant] || LIQUID_VARIANTS_CACHE['fade-up'];
};
