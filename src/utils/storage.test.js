import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
      // jsdom environment has window and document defined by default
      expect(canUseDOM()).toBe(true);
    });

    it('returns false when window is undefined', () => {
      global.window = undefined;
      expect(canUseDOM()).toBe(false);
    });

    it('returns false when document is undefined', () => {
      global.document = undefined;
      expect(canUseDOM()).toBe(false);
    });
  });

  describe('safeMediaQueryMatch', () => {
    it('returns fallback when DOM is not available', () => {
      global.window = undefined;
      expect(safeMediaQueryMatch('(min-width: 600px)', true)).toBe(true);
    });

    it('returns fallback when matchMedia is not a function', () => {
      global.window.matchMedia = undefined;
      expect(safeMediaQueryMatch('(min-width: 600px)', true)).toBe(true);
    });

    it('returns matches value', () => {
      const matchMediaMock = vi.fn().mockReturnValue({ matches: true });
      global.window.matchMedia = matchMediaMock;
      expect(safeMediaQueryMatch('(min-width: 600px)')).toBe(true);
      expect(matchMediaMock).toHaveBeenCalledWith('(min-width: 600px)');
    });

    it('returns fallback on error', () => {
      global.window.matchMedia = vi.fn().mockImplementation(() => {
        throw new Error('Error');
      });
      expect(safeMediaQueryMatch('(min-width: 600px)', true)).toBe(true);
    });
  });

  describe('safeKeyboardKey', () => {
    it('returns key when event is valid', () => {
      const event = { key: 'Enter' };
      expect(safeKeyboardKey(event)).toBe('Enter');
    });

    it('returns empty string when event is null', () => {
      expect(safeKeyboardKey(null)).toBe('');
    });

    it('returns empty string when event.key is not a string', () => {
      expect(safeKeyboardKey({ key: 123 })).toBe('');
    });
  });

  describe('safeSetDocumentTheme', () => {
    it('sets theme when DOM is available', () => {
      document.documentElement.dataset.theme = '';
      const result = safeSetDocumentTheme('dark');
      expect(result).toBe(true);
      expect(document.documentElement.dataset.theme).toBe('dark');
    });

    it('returns false when DOM is not available', () => {
      global.document = undefined;
      expect(safeSetDocumentTheme('dark')).toBe(false);
    });

    it('returns false on error', () => {
      Object.defineProperty(global.document, 'documentElement', {
        value: {
          get dataset() {
            throw new Error('Access denied');
          },
        },
        configurable: true,
      });
      expect(safeSetDocumentTheme('dark')).toBe(false);
    });
  });

  describe('LocalStorage helpers', () => {
    let getItemSpy, setItemSpy, removeItemSpy;

    beforeEach(() => {
      getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
      setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');
    });

    describe('safeGetLocalStorage', () => {
      it('returns value from localStorage', () => {
        getItemSpy.mockReturnValue('test-value');
        expect(safeGetLocalStorage('key')).toBe('test-value');
        expect(getItemSpy).toHaveBeenCalledWith('key');
      });

      it('returns fallback when value is null', () => {
        getItemSpy.mockReturnValue(null);
        expect(safeGetLocalStorage('key', 'fallback')).toBe('fallback');
      });

      it('returns fallback when storage is not available', () => {
        const originalLocalStorage = global.window.localStorage;
        Object.defineProperty(global.window, 'localStorage', {
          value: undefined,
          writable: true,
        });

        expect(safeGetLocalStorage('key', 'fallback')).toBe('fallback');

        global.window.localStorage = originalLocalStorage;
      });

      it('returns fallback on error', () => {
        getItemSpy.mockImplementation(() => {
          throw new Error('Access denied');
        });
        expect(safeGetLocalStorage('key', 'fallback')).toBe('fallback');
      });
    });

    describe('safeSetLocalStorage', () => {
      it('sets value in localStorage', () => {
        const result = safeSetLocalStorage('key', 'value');
        expect(result).toBe(true);
        expect(setItemSpy).toHaveBeenCalledWith('key', 'value');
      });

      it('returns false when storage is not available', () => {
        const originalLocalStorage = global.window.localStorage;
        Object.defineProperty(global.window, 'localStorage', {
          value: undefined,
          writable: true,
        });

        expect(safeSetLocalStorage('key', 'value')).toBe(false);

        global.window.localStorage = originalLocalStorage;
      });

      it('returns false on error', () => {
        setItemSpy.mockImplementation(() => {
          throw new Error('Quota exceeded');
        });
        expect(safeSetLocalStorage('key', 'value')).toBe(false);
      });
    });

    describe('safeRemoveLocalStorage', () => {
      it('removes value from localStorage', () => {
        const result = safeRemoveLocalStorage('key');
        expect(result).toBe(true);
        expect(removeItemSpy).toHaveBeenCalledWith('key');
      });

      it('returns false when storage is not available', () => {
        const originalLocalStorage = global.window.localStorage;
        Object.defineProperty(global.window, 'localStorage', {
          value: undefined,
          writable: true,
        });

        expect(safeRemoveLocalStorage('key')).toBe(false);

        global.window.localStorage = originalLocalStorage;
      });

      it('returns false on error', () => {
        removeItemSpy.mockImplementation(() => {
          throw new Error('Access denied');
        });
        expect(safeRemoveLocalStorage('key')).toBe(false);
      });
    });
  });
});
