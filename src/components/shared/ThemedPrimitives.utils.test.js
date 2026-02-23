import { describe, it, expect } from 'vitest';
import { joinClasses, getOverlayShell } from './ThemedPrimitives.utils';

describe('ThemedPrimitives utils', () => {
  describe('joinClasses', () => {
    it('joins multiple class strings', () => {
      expect(joinClasses('class1', 'class2')).toBe('class1 class2');
    });

    it('ignores falsy values', () => {
      expect(joinClasses('class1', false, null, undefined, '', 'class2')).toBe('class1 class2');
    });

    it('handles single class', () => {
      expect(joinClasses('class1')).toBe('class1');
    });

    it('returns empty string for no input', () => {
      expect(joinClasses()).toBe('');
    });

    it('returns empty string for all falsy inputs', () => {
      expect(joinClasses(false, null, undefined, '')).toBe('');
    });
  });

  describe('getOverlayShell', () => {
    describe('Neubrutalism (default)', () => {
      it('returns correct defaults', () => {
        const result = getOverlayShell();
        expect(result.className).toContain('bg-card');
        expect(result.className).toContain('border-nb');
        expect(result.className).toContain('rounded-nb');
        expect(result.style.boxShadow).toBe('var(--nb-shadow)');
      });

      it('handles tone prop', () => {
        const result = getOverlayShell({ tone: 'accent' });
        expect(result.className).toContain('bg-accent');
        expect(result.className).toContain('text-white');
      });

      it('handles depth prop', () => {
        const result = getOverlayShell({ depth: 'hover' });
        expect(result.style.boxShadow).toBe('var(--nb-shadow-hover)');
      });

      it('merges custom className', () => {
        const result = getOverlayShell({ className: 'custom-class' });
        expect(result.className).toContain('custom-class');
      });
    });

    describe('Liquid theme', () => {
      it('returns correct defaults for liquid theme', () => {
        const result = getOverlayShell({ theme: 'liquid' });
        expect(result.className).toContain('lg-surface-2');
        expect(result.className).toContain('border border-[color:var(--border-soft)]');
        expect(result.className).toContain('rounded-2xl');
        expect(result.style.boxShadow).toContain('var(--glass-drop-shadow');
      });

      it('handles tone prop for liquid theme', () => {
        const result = getOverlayShell({ theme: 'liquid', tone: 'accent' });
        expect(result.className).toContain('lg-surface-2');
        expect(result.className).toContain('lg-tint-blue');
      });

      it('handles depth prop for liquid theme', () => {
        const result = getOverlayShell({ theme: 'liquid', depth: 'hover' });
        expect(result.style.boxShadow).toContain('var(--glass-drop-shadow-hover');
      });
    });
  });
});
