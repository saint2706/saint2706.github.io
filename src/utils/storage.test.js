import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import {
  canUseDOM,
  safeMediaQueryMatch,
  safeKeyboardKey,
  safeSetDocumentTheme,
  safeGetLocalStorage,
  safeSetLocalStorage,
  safeRemoveLocalStorage,
} from './storage';

describe('Storage Utils', () => {
  const originalWindow = global.window;
  const originalDocument = global.document;

  afterEach(() => {
    vi.restoreAllMocks();
    global.window = originalWindow;
    global.document = originalDocument;
  });

  describe('canUseDOM', () => {
    it('returns true when window and document are defined', () => {
      expect(canUseDOM()).toBe(true);
    });

    it('returns false when window is undefined', () => {
      // We need to be careful not to break Vitest runner which might rely on window
      const original = global.window;
      global.window = undefined;
      expect(canUseDOM()).toBe(false);
      global.window = original;
    });

    it('returns false when document is undefined', () => {
      const original = global.document;
      global.document = undefined;
      expect(canUseDOM()).toBe(false);
      global.document = original;
    });
  });

  describe('safeMediaQueryMatch', () => {
    it('returns true if query matches', () => {
      window.matchMedia = vi.fn().mockReturnValue({ matches: true });
      expect(safeMediaQueryMatch('(min-width: 768px)')).toBe(true);
    });

    it('returns false if query does not match', () => {
      window.matchMedia = vi.fn().mockReturnValue({ matches: false });
      expect(safeMediaQueryMatch('(min-width: 768px)')).toBe(false);
    });

    it('returns fallback if matchMedia is not a function', () => {
      window.matchMedia = undefined;
      expect(safeMediaQueryMatch('(min-width: 768px)', true)).toBe(true);
    });

    it('returns fallback if matchMedia throws', () => {
      window.matchMedia = vi.fn().mockImplementation(() => {
        throw new Error('Error');
      });
      expect(safeMediaQueryMatch('(min-width: 768px)', true)).toBe(true);
    });
  });

  describe('safeKeyboardKey', () => {
    it('returns key value from event', () => {
      const event = { key: 'Enter' };
      expect(safeKeyboardKey(event)).toBe('Enter');
    });

    it('returns empty string if event is null', () => {
      expect(safeKeyboardKey(null)).toBe('');
    });

    it('returns empty string if key is not a string', () => {
      expect(safeKeyboardKey({ key: 123 })).toBe('');
    });
  });

  describe('safeSetDocumentTheme', () => {
    it('sets data-theme attribute on documentElement', () => {
      expect(safeSetDocumentTheme('dark')).toBe(true);
      expect(document.documentElement.dataset.theme).toBe('dark');
    });

    it('returns false if documentElement is missing', () => {
      vi.spyOn(document, 'documentElement', 'get').mockReturnValue(undefined);
      expect(safeSetDocumentTheme('dark')).toBe(false);
    });

    it('returns false if error occurs', () => {
      // Simulate error by making dataset read-only or similar
      const originalDataset = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'dataset');
      Object.defineProperty(HTMLElement.prototype, 'dataset', {
        get: () => {
          throw new Error('Access denied');
        },
        configurable: true,
      });

      expect(safeSetDocumentTheme('dark')).toBe(false);

      // Restore
      if (originalDataset) {
        Object.defineProperty(HTMLElement.prototype, 'dataset', originalDataset);
      }
    });
  });

  describe('LocalStorage Utils', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
      window.localStorage.clear();
    });

    describe('safeGetLocalStorage', () => {
      it('returns stored value', () => {
        window.localStorage.setItem('testKey', 'testValue');
        expect(safeGetLocalStorage('testKey')).toBe('testValue');
      });

      it('returns fallback if key missing', () => {
        expect(safeGetLocalStorage('missingKey', 'default')).toBe('default');
      });

      it('returns fallback if localStorage throws', () => {
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
          throw new Error('QuotaExceeded');
        });
        expect(safeGetLocalStorage('testKey', 'default')).toBe('default');
      });

      it('returns fallback if window.localStorage is undefined', () => {
        const originalLocalStorage = window.localStorage;
        // We can't delete localStorage from window in JSDOM easily,
        // but we can try to shadow it or use stubGlobal if applicable,
        // but checking 'typeof window.localStorage' logic:
        // hasStorage() checks typeof window.localStorage !== 'undefined'

        // In JSDOM, window.localStorage is a property.
        Object.defineProperty(window, 'localStorage', { value: undefined, configurable: true });

        expect(safeGetLocalStorage('key', 'fallback')).toBe('fallback');

        Object.defineProperty(window, 'localStorage', {
          value: originalLocalStorage,
          configurable: true,
        });
      });
    });

    describe('safeSetLocalStorage', () => {
      it('sets value in localStorage', () => {
        expect(safeSetLocalStorage('key', 'value')).toBe(true);
        expect(window.localStorage.getItem('key')).toBe('value');
      });

      it('returns false if localStorage throws', () => {
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
          throw new Error('QuotaExceeded');
        });
        expect(safeSetLocalStorage('key', 'value')).toBe(false);
      });
    });

    describe('safeRemoveLocalStorage', () => {
      it('removes value from localStorage', () => {
        window.localStorage.setItem('key', 'value');
        expect(safeRemoveLocalStorage('key')).toBe(true);
        expect(window.localStorage.getItem('key')).toBeNull();
      });

      it('returns false if localStorage throws', () => {
        vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
          throw new Error('Error');
        });
        expect(safeRemoveLocalStorage('key')).toBe(false);
      });
    });
  });
});
