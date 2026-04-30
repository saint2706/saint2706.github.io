import { describe, it, expect } from 'vitest';
import { getGameThemeStyles } from './gameThemeStyles';

describe('getGameThemeStyles', () => {
  it('returns liquid theme styles when isLiquid is true', () => {
    const styles = getGameThemeStyles(true);
    expect(styles.scoreboard).toContain('lg-surface-2');
    expect(styles.scoreboard).toContain('rounded-2xl');
    expect(styles.separator).toContain('w-px');
    expect(styles.style.raised).toBeUndefined();
    expect(styles.style.board).toBeUndefined();
    expect(styles.style.tile).toBeUndefined();
    expect(styles.style.tileActive).toBeUndefined();
  });

  it('returns neubrutalism theme styles when isLiquid is false', () => {
    const styles = getGameThemeStyles(false);
    expect(styles.scoreboard).toContain('border-[3px]');
    expect(styles.separator).toContain('w-[3px]');
    expect(styles.style.raised).toBeDefined();
    expect(styles.style.board).toBeDefined();
    expect(styles.style.tile).toBeDefined();
    expect(styles.style.tileActive).toBeDefined();
  });

  it('filters out falsy values in join correctly', () => {
    // Tests join internally
    const styles = getGameThemeStyles(true);
    expect(styles.scoreboard).not.toContain('undefined');
    expect(styles.scoreboard).not.toContain('null');
    expect(styles.scoreboard).not.toContain('false');
  });
});
