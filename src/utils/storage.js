/**
 * Storage Utilities Module
 *
 * Safe localStorage helpers that gracefully handle unavailable storage,
 * restricted browser contexts, and private mode quota errors.
 * Also includes DOM and media query helpers.
 *
 * @module utils/storage
 */

/**
 * Checks if localStorage is available and accessible.
 * @returns {boolean} True if localStorage is available.
 */
const hasStorage = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

/**
 * Checks if the DOM is available (i.e., we are running in a browser environment).
 * @returns {boolean} True if window and document are defined.
 *
 * @example
 * const isBrowser = canUseDOM();
 * // => true
 */
/**
 * Checks if the DOM is available (i.e., running in a browser environment).
 * @returns {boolean} True if the DOM is available, false otherwise.
 */
export const canUseDOM = () => typeof window !== 'undefined' && typeof document !== 'undefined';

/**
 * Safely checks if a media query matches, handling SSR and errors.
 * @param {string} query - The media query string to match.
 * @param {boolean} [fallback=false] - The fallback value if matchMedia is unavailable.
 * @returns {boolean} True if the media query matches, otherwise the fallback.
 *
 * @example
 * const isMobile = safeMediaQueryMatch('(max-width: 768px)');
 * // => true
 */
export const safeMediaQueryMatch = (query, fallback = false) => {
  if (!canUseDOM() || typeof window.matchMedia !== 'function') return fallback;

  try {
    return window.matchMedia(query).matches;
  } catch {
    return fallback;
  }
};

/**
 * Safely retrieves the key property from a keyboard event.
 * @param {KeyboardEvent} event - The keyboard event.
 * @returns {string} The key value or an empty string if invalid.
 *
 * @example
 * const key = safeKeyboardKey(new KeyboardEvent('keydown', { key: 'Enter' }));
 * // => 'Enter'
 */
/**
 * Safely extracts the key from a keyboard event.
 * @param {KeyboardEvent} event - The keyboard event.
 * @returns {string} The key pressed, or an empty string if unavailable.
 */
export const safeKeyboardKey = event => {
  if (!event || typeof event.key !== 'string') return '';
  return event.key;
};

/**
 * Safely sets the theme data attribute on the document element.
 * @param {string} theme - The theme name to set.
 * @returns {boolean} True if successful, false otherwise.
 *
 * @example
 * const success = safeSetDocumentTheme('dark');
 * // => true
 */
/**
 * Safely sets the document's theme attribute.
 * @param {string} theme - The theme to set (e.g., 'neubrutalism' or 'liquid').
 * @returns {boolean} True if the theme was successfully set, false otherwise.
 */
export const safeSetDocumentTheme = theme => {
  if (!canUseDOM() || !document.documentElement) return false;

  try {
    document.documentElement.dataset.theme = theme;
    return true;
  } catch {
    return false;
  }
};

/**
 * Safely retrieves an item from localStorage.
 * @param {string} key - The key to retrieve.
 * @param {string|null} [fallback=null] - The fallback value if the key is missing or error occurs.
 * @returns {string|null} The stored value or the fallback.
 *
 * @example
 * const theme = safeGetLocalStorage('theme', 'light');
 * // => 'dark'
 */
/**
 * Safely retrieves an item from localStorage.
 * @param {string} key - The key of the item to retrieve.
 * @param {*} [fallback=null] - The fallback value if the item is not found or localStorage is unavailable.
 * @returns {*} The value from localStorage, or the fallback value.
 */
export const safeGetLocalStorage = (key, fallback = null) => {
  if (!hasStorage()) return fallback;

  try {
    const value = window.localStorage.getItem(key);
    return value ?? fallback;
  } catch {
    return fallback;
  }
};

/**
 * Safely sets an item in localStorage.
 * @param {string} key - The key to set.
 * @param {string} value - The value to store.
 * @returns {boolean} True if successful, false otherwise.
 *
 * @example
 * const success = safeSetLocalStorage('theme', 'dark');
 * // => true
 */
/**
 * Safely sets an item in localStorage.
 * @param {string} key - The key of the item to set.
 * @param {string} value - The value to store.
 * @returns {boolean} True if the item was successfully set, false otherwise.
 */
export const safeSetLocalStorage = (key, value) => {
  if (!hasStorage()) return false;

  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};

/**
 * Safely removes an item from localStorage.
 * @param {string} key - The key to remove.
 * @returns {boolean} True if successful, false otherwise.
 *
 * @example
 * const success = safeRemoveLocalStorage('theme');
 * // => true
 */
/**
 * Safely removes an item from localStorage.
 * @param {string} key - The key of the item to remove.
 * @returns {boolean} True if the item was successfully removed, false otherwise.
 */
export const safeRemoveLocalStorage = key => {
  if (!hasStorage()) return false;

  try {
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
};
