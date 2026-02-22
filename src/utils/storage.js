/**
 * Safe localStorage helpers that gracefully handle unavailable storage,
 * restricted browser contexts, and private mode quota errors.
 */

const hasStorage = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const canUseDOM = () => typeof window !== 'undefined' && typeof document !== 'undefined';

export const safeMediaQueryMatch = (query, fallback = false) => {
  if (!canUseDOM() || typeof window.matchMedia !== 'function') return fallback;

  try {
    return window.matchMedia(query).matches;
  } catch {
    return fallback;
  }
};

export const safeKeyboardKey = event => {
  if (!event || typeof event.key !== 'string') return '';
  return event.key;
};

export const safeSetDocumentTheme = theme => {
  if (!canUseDOM() || !document.documentElement) return false;

  try {
    document.documentElement.dataset.theme = theme;
    return true;
  } catch {
    return false;
  }
};

export const safeGetLocalStorage = (key, fallback = null) => {
  if (!hasStorage()) return fallback;

  try {
    const value = window.localStorage.getItem(key);
    return value ?? fallback;
  } catch {
    return fallback;
  }
};

export const safeSetLocalStorage = (key, value) => {
  if (!hasStorage()) return false;

  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};

export const safeRemoveLocalStorage = key => {
  if (!hasStorage()) return false;

  try {
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
};
