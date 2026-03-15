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

describe('storage utilities', () => {
  beforeEach(() => {
    // Keep reference to original objects

    // Default localStorage mock
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };

    Object.defineProperty(global.window, 'localStorage', {
      value: localStorageMock,
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('canUseDOM', () => {
    it('returns true when window and document are defined', () => {
      expect(canUseDOM()).toBe(true);
    });

    it('returns false when window is undefined', () => {
      const tempWindow = global.window;
      delete global.window;
      expect(canUseDOM()).toBe(false);
      global.window = tempWindow;
    });

    it('returns false when document is undefined', () => {
      const tempDoc = global.document;
      delete global.document;
      expect(canUseDOM()).toBe(false);
      global.document = tempDoc;
    });
  });

  describe('safeMediaQueryMatch', () => {
    it('returns true if matchMedia matches', () => {
      global.window.matchMedia = vi.fn().mockReturnValue({ matches: true });
      expect(safeMediaQueryMatch('(max-width: 768px)')).toBe(true);
    });

    it('returns false if matchMedia does not match', () => {
      global.window.matchMedia = vi.fn().mockReturnValue({ matches: false });
      expect(safeMediaQueryMatch('(max-width: 768px)')).toBe(false);
    });

    it('returns fallback if window is undefined', () => {
      const tempWindow = global.window;
      delete global.window;
      expect(safeMediaQueryMatch('(max-width: 768px)', true)).toBe(true);
      global.window = tempWindow;
    });

    it('returns fallback if matchMedia throws an error', () => {
      global.window.matchMedia = vi.fn().mockImplementation(() => {
        throw new Error('Test error');
      });
      expect(safeMediaQueryMatch('(max-width: 768px)', false)).toBe(false);
      expect(safeMediaQueryMatch('(max-width: 768px)', true)).toBe(true);
    });
  });

  describe('safeKeyboardKey', () => {
    it('returns the key string', () => {
      const event = { key: 'Enter' };
      expect(safeKeyboardKey(event)).toBe('Enter');
    });

    it('returns empty string if event is null', () => {
      expect(safeKeyboardKey(null)).toBe('');
    });

    it('returns empty string if key is not a string', () => {
      const event = { key: 123 };
      expect(safeKeyboardKey(event)).toBe('');
    });
  });

  describe('safeSetDocumentTheme', () => {
    it('sets the theme dataset property', () => {
      expect(safeSetDocumentTheme('dark')).toBe(true);
      expect(document.documentElement.dataset.theme).toBe('dark');
    });

    it('returns false if document is undefined', () => {
      const tempDoc = global.document;
      delete global.document;
      expect(safeSetDocumentTheme('dark')).toBe(false);
      global.document = tempDoc;
    });

    it('returns false if dataset throws an error', () => {
      // Create a mock document element that throws when its dataset is accessed
      const mockDocElement = {
        get dataset() {
          throw new Error('Test Error');
        },
      };

      const originalDocElement = document.documentElement;
      Object.defineProperty(document, 'documentElement', {
        value: mockDocElement,
        configurable: true,
      });

      expect(safeSetDocumentTheme('dark')).toBe(false);

      Object.defineProperty(document, 'documentElement', {
        value: originalDocElement,
        configurable: true,
      });
    });
  });

  describe('safeGetLocalStorage', () => {
    it('returns value from localStorage', () => {
      global.window.localStorage.getItem.mockReturnValue('value');
      expect(safeGetLocalStorage('key')).toBe('value');
    });

    it('returns fallback if value is null', () => {
      global.window.localStorage.getItem.mockReturnValue(null);
      expect(safeGetLocalStorage('key', 'fallback')).toBe('fallback');
    });

    it('returns fallback if localStorage is undefined', () => {
      // Temporarily redefine property
      const originalLS = global.window.localStorage;
      Object.defineProperty(global.window, 'localStorage', {
        get: () => undefined,
        configurable: true,
      });
      expect(safeGetLocalStorage('key', 'fallback')).toBe('fallback');
      Object.defineProperty(global.window, 'localStorage', {
        value: originalLS,
        configurable: true,
        writable: true,
      });
    });

    it('returns fallback if localStorage throws an error', () => {
      global.window.localStorage.getItem.mockImplementation(() => {
        throw new Error('Test error');
      });
      expect(safeGetLocalStorage('key', 'fallback')).toBe('fallback');
    });
  });

  describe('safeSetLocalStorage', () => {
    it('sets value in localStorage', () => {
      expect(safeSetLocalStorage('key', 'value')).toBe(true);
      expect(global.window.localStorage.setItem).toHaveBeenCalledWith('key', 'value');
    });

    it('returns false if localStorage is undefined', () => {
      const originalLS = global.window.localStorage;
      Object.defineProperty(global.window, 'localStorage', {
        get: () => undefined,
        configurable: true,
      });
      expect(safeSetLocalStorage('key', 'value')).toBe(false);
      Object.defineProperty(global.window, 'localStorage', {
        value: originalLS,
        configurable: true,
        writable: true,
      });
    });

    it('returns false if localStorage throws an error', () => {
      global.window.localStorage.setItem.mockImplementation(() => {
        throw new Error('Test error');
      });
      expect(safeSetLocalStorage('key', 'value')).toBe(false);
    });
  });

  describe('safeRemoveLocalStorage', () => {
    it('removes value from localStorage', () => {
      expect(safeRemoveLocalStorage('key')).toBe(true);
      expect(global.window.localStorage.removeItem).toHaveBeenCalledWith('key');
    });

    it('returns false if localStorage is undefined', () => {
      const originalLS = global.window.localStorage;
      Object.defineProperty(global.window, 'localStorage', {
        get: () => undefined,
        configurable: true,
      });
      expect(safeRemoveLocalStorage('key')).toBe(false);
      Object.defineProperty(global.window, 'localStorage', {
        value: originalLS,
        configurable: true,
        writable: true,
      });
    });

    it('returns false if localStorage throws an error', () => {
      global.window.localStorage.removeItem.mockImplementation(() => {
        throw new Error('Test error');
      });
      expect(safeRemoveLocalStorage('key')).toBe(false);
    });
  });
});
