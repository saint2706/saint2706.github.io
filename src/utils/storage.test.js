import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  canUseDOM,
  safeMediaQueryMatch,
  safeKeyboardKey,
  safeSetDocumentTheme,
  safeGetLocalStorage,
  safeSetLocalStorage,
  safeRemoveLocalStorage,
} from './storage';

describe('Storage Utilities', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('canUseDOM', () => {
    it('should return true in JSDOM environment', () => {
      expect(canUseDOM()).toBe(true);
    });

    it('should return false when window is undefined', () => {
      const originalWindow = global.window;
      vi.stubGlobal('window', undefined);
      expect(canUseDOM()).toBe(false);
      vi.stubGlobal('window', originalWindow);
    });
  });

  describe('safeMediaQueryMatch', () => {
    it('should return match result when available', () => {
      const matchMedia = vi.fn().mockReturnValue({ matches: true });
      vi.stubGlobal('matchMedia', matchMedia);
      window.matchMedia = matchMedia;

      expect(safeMediaQueryMatch('(min-width: 768px)')).toBe(true);
      expect(matchMedia).toHaveBeenCalledWith('(min-width: 768px)');
    });

    it('should return fallback when matchMedia throws', () => {
        const matchMedia = vi.fn().mockImplementation(() => {
            throw new Error('Error');
        });
        window.matchMedia = matchMedia;
        expect(safeMediaQueryMatch('(min-width: 768px)', false)).toBe(false);
    });

    it('should return fallback when matchMedia is not a function', () => {
        window.matchMedia = undefined;
        expect(safeMediaQueryMatch('(min-width: 768px)', true)).toBe(true);
    });

    it('should return fallback when DOM is not available', () => {
      const originalWindow = global.window;
      vi.stubGlobal('window', undefined);
      expect(safeMediaQueryMatch('(min-width: 768px)', true)).toBe(true);
      vi.stubGlobal('window', originalWindow);
    });
  });

  describe('safeKeyboardKey', () => {
    it('should return key from event', () => {
      const event = { key: 'Enter' };
      expect(safeKeyboardKey(event)).toBe('Enter');
    });

    it('should return empty string if event is null', () => {
      expect(safeKeyboardKey(null)).toBe('');
    });

    it('should return empty string if key is not a string', () => {
      expect(safeKeyboardKey({ key: 123 })).toBe('');
    });
  });

  describe('safeSetDocumentTheme', () => {
    it('should set data-theme attribute', () => {
      document.documentElement.dataset.theme = '';
      const result = safeSetDocumentTheme('dark');
      expect(result).toBe(true);
      expect(document.documentElement.dataset.theme).toBe('dark');
    });

    it('should return false if DOM is not available', () => {
        const originalWindow = global.window;
        vi.stubGlobal('window', undefined);
        expect(safeSetDocumentTheme('dark')).toBe(false);
        vi.stubGlobal('window', originalWindow);
    });

    it('should return false if documentElement is missing', () => {
        const originalDocument = global.document;
        // Temporarily mock document to not have documentElement
        vi.stubGlobal('document', { });
        expect(safeSetDocumentTheme('dark')).toBe(false);
        vi.stubGlobal('document', originalDocument);
    });

    it('should return false if setting throws', () => {
       // Mock dataset to throw. In JSDOM/Node environment, modifying prototype might be tricky or affect other tests
       // A safer way is to spy on document.documentElement property access if possible, or mock document.documentElement
       const originalDocumentElement = document.documentElement;

       // Create a proxy that throws on dataset access
       const throwingElement = new Proxy(document.createElement('div'), {
           get(target, prop) {
               if (prop === 'dataset') throw new Error('Access denied');
               return Reflect.get(target, prop);
           }
       });

       Object.defineProperty(document, 'documentElement', {
           value: throwingElement,
           writable: true,
           configurable: true
       });

       expect(safeSetDocumentTheme('dark')).toBe(false);

       // Restore
       Object.defineProperty(document, 'documentElement', {
           value: originalDocumentElement,
           writable: true,
           configurable: true
       });
    });
  });

  describe('LocalStorage Helpers', () => {
    beforeEach(() => {
      window.localStorage.clear();
      vi.spyOn(Storage.prototype, 'getItem');
      vi.spyOn(Storage.prototype, 'setItem');
      vi.spyOn(Storage.prototype, 'removeItem');
    });

    describe('safeGetLocalStorage', () => {
      it('should return stored value', () => {
        window.localStorage.setItem('key', 'value');
        expect(safeGetLocalStorage('key')).toBe('value');
      });

      it('should return fallback if key missing', () => {
        expect(safeGetLocalStorage('missing', 'default')).toBe('default');
      });

      it('should return fallback if localStorage throws', () => {
        window.localStorage.getItem.mockImplementation(() => {
          throw new Error('Access denied');
        });
        expect(safeGetLocalStorage('key', 'default')).toBe('default');
      });

      it('should return fallback if storage not available', () => {
         const originalWindow = global.window;
         vi.stubGlobal('window', undefined);
         expect(safeGetLocalStorage('key', 'default')).toBe('default');
         vi.stubGlobal('window', originalWindow);
      });
    });

    describe('safeSetLocalStorage', () => {
      it('should set value and return true', () => {
        const result = safeSetLocalStorage('key', 'value');
        expect(result).toBe(true);
        expect(window.localStorage.getItem('key')).toBe('value');
      });

      it('should return false if localStorage throws', () => {
        window.localStorage.setItem.mockImplementation(() => {
          throw new Error('Quota exceeded');
        });
        expect(safeSetLocalStorage('key', 'value')).toBe(false);
      });

      it('should return false if storage not available', () => {
         const originalWindow = global.window;
         vi.stubGlobal('window', undefined);
         expect(safeSetLocalStorage('key', 'value')).toBe(false);
         vi.stubGlobal('window', originalWindow);
      });
    });

    describe('safeRemoveLocalStorage', () => {
      it('should remove value and return true', () => {
        window.localStorage.setItem('key', 'value');
        const result = safeRemoveLocalStorage('key');
        expect(result).toBe(true);
        expect(window.localStorage.getItem('key')).toBeNull();
      });

      it('should return false if localStorage throws', () => {
        window.localStorage.removeItem.mockImplementation(() => {
          throw new Error('Access denied');
        });
        expect(safeRemoveLocalStorage('key')).toBe(false);
      });

      it('should return false if storage not available', () => {
         const originalWindow = global.window;
         vi.stubGlobal('window', undefined);
         expect(safeRemoveLocalStorage('key')).toBe(false);
         vi.stubGlobal('window', originalWindow);
      });
    });
  });
});
