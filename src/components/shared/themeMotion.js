export const LIQUID_MOTION = {
  duration: {
    reveal: 0.6,
    interactive: 0.35,
    glow: 0.5,
  },
  easing: {
    reveal: [0.22, 1, 0.36, 1],
    glow: [0.4, 0, 0.2, 1],
  },
  spring: {
    reveal: { type: 'spring', stiffness: 300, damping: 30, mass: 0.8 },
    interactive: { type: 'spring', stiffness: 500, damping: 28 },
    gentle: { type: 'spring', stiffness: 200, damping: 20, mass: 1 },
    breathing: { type: 'spring', stiffness: 120, damping: 14, mass: 1.2 },
  },
  offset: {
    x: 10,
    y: 10,
    subtleY: 6,
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
  const spring = LIQUID_MOTION.spring.interactive;

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
      hidden: { opacity: 0, scale: 0.97, y: LIQUID_MOTION.offset.subtleY },
      visible: { opacity: 1, scale: 1, y: 0 },
    },
    'slide-up': {
      hidden: { opacity: 0, y: y + 4 },
      visible: { opacity: 1, y: 0 },
    },
    morph: {
      hidden: { opacity: 0, scale: 0.95, filter: 'blur(4px)' },
      visible: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: spring },
    },
    'glass-press': {
      hidden: { opacity: 0, scale: 0.98, filter: 'brightness(0.95)' },
      visible: { opacity: 1, scale: 1, filter: 'brightness(1)', transition: spring },
    },
  };
};

export const getLiquidRevealVariant = variant => {
  if (!LIQUID_VARIANTS_CACHE) {
    LIQUID_VARIANTS_CACHE = getLiquidVariants();
  }

  return LIQUID_VARIANTS_CACHE[variant] || LIQUID_VARIANTS_CACHE['fade-up'];
};
