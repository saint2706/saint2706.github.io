// Escher's Print Gallery, after de Smit and Lenstra, "The Mathematical Structure of Escher's
// Print Gallery", Notices of the AMS 50(4), 2003. Shared by the exhibit page and its script.

// One painting per room, nested like Escher's four studies: each hangs inside the one before at 1/4 size.
export const STUDIES = [
  'fall-of-icarus',
  'shakuntala-looking-back',
  'sleep-of-reason',
  'disrobing-of-draupadi',
];

/** Escher's straight picture repeats after four studies of 4x each: 4^4 = 256. */
export const PERIOD = 256;

/**
 * The twisted picture repeats when you zoom by gamma, where alpha * log(gamma) = log(256) and
 * alpha = (2*pi*i + log 256) / (2*pi*i). Returns the scale factor and the clockwise turn in degrees.
 */
export function selfSimilarity(period = PERIOD) {
  const L = Math.log(period);
  const d = L * L + 4 * Math.PI * Math.PI;
  // log(gamma) = 2*pi*i*L / (L + 2*pi*i) = L * (4*pi^2 + 2*pi*i*L) / (L^2 + 4*pi^2)
  return {
    scale: Math.exp((4 * Math.PI * Math.PI * L) / d),
    turn: ((2 * Math.PI * L * L) / d) * (180 / Math.PI),
  };
}
