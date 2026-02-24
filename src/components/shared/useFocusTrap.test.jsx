import { render, screen, fireEvent } from '@testing-library/react';
import { useRef } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useFocusTrap } from './useFocusTrap';

const TestComponent = ({ isOpen, onClose, preventScroll = true, initialFocus = false }) => {
  const containerRef = useRef(null);
  const initialFocusRef = useRef(null);

  useFocusTrap({
    isOpen,
    containerRef,
    onClose,
    initialFocusRef: initialFocus ? initialFocusRef : undefined,
    preventScroll,
  });

  return (
    <div>
      <button data-testid="outside-button">Outside</button>
      <div ref={containerRef} data-testid="container">
        <button data-testid="first-button">First</button>
        <input data-testid="input" ref={initialFocusRef} />
        <button data-testid="last-button">Last</button>
      </div>
    </div>
  );
};

describe('useFocusTrap', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.style.overflow = '';
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    document.body.style.overflow = '';
    vi.restoreAllMocks();
  });

  it('traps focus when open', () => {
    const onClose = vi.fn();
    render(<TestComponent isOpen={true} onClose={onClose} />);

    // Fast-forward initial focus timeout
    vi.advanceTimersByTime(100);

    const firstButton = screen.getByTestId('first-button');
    const lastButton = screen.getByTestId('last-button');

    // Initially should focus first element (fallback)
    expect(document.activeElement).toBe(firstButton);

    // Focus last element manually to test cycling
    lastButton.focus();
    expect(document.activeElement).toBe(lastButton);

    // Tab from last element -> should go to first
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(firstButton);

    // Shift+Tab from first element -> should go to last
    firstButton.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(lastButton);
  });

  it('restores focus on close', () => {
    const onClose = vi.fn();
    const { rerender } = render(<TestComponent isOpen={false} onClose={onClose} />);

    const outsideButton = screen.getByTestId('outside-button');
    outsideButton.focus();
    expect(document.activeElement).toBe(outsideButton);

    // Open trap
    rerender(<TestComponent isOpen={true} onClose={onClose} />);
    vi.advanceTimersByTime(100);
    // Focus should have moved inside
    expect(document.activeElement).not.toBe(outsideButton);

    // Close trap
    rerender(<TestComponent isOpen={false} onClose={onClose} />);
    // Focus should be restored
    expect(document.activeElement).toBe(outsideButton);
  });

  it('uses initialFocusRef if provided', () => {
    const onClose = vi.fn();
    render(<TestComponent isOpen={true} onClose={onClose} initialFocus={true} />);
    vi.advanceTimersByTime(100);

    const input = screen.getByTestId('input');
    expect(document.activeElement).toBe(input);
  });

  it('calls onClose on Escape', () => {
    const onClose = vi.fn();
    render(<TestComponent isOpen={true} onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('locks body scroll when open and preventScroll is true', () => {
    const onClose = vi.fn();
    render(<TestComponent isOpen={true} onClose={onClose} preventScroll={true} />);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('does not lock body scroll when preventScroll is false', () => {
    const onClose = vi.fn();
    render(<TestComponent isOpen={true} onClose={onClose} preventScroll={false} />);
    expect(document.body.style.overflow).toBe('');
  });

  it('unlocks body scroll on close', () => {
    const onClose = vi.fn();
    const { rerender } = render(<TestComponent isOpen={true} onClose={onClose} />);
    expect(document.body.style.overflow).toBe('hidden');

    rerender(<TestComponent isOpen={false} onClose={onClose} />);
    expect(document.body.style.overflow).toBe('');
  });

  it('redirects focus to first element when tabbing from outside', () => {
    const onClose = vi.fn();
    render(<TestComponent isOpen={true} onClose={onClose} />);
    vi.advanceTimersByTime(100);

    // Manually focus outside
    const outsideButton = screen.getByTestId('outside-button');
    outsideButton.focus();

    fireEvent.keyDown(document, { key: 'Tab' });

    const firstButton = screen.getByTestId('first-button');
    expect(document.activeElement).toBe(firstButton);
  });

  it('redirects focus to last element when shift-tabbing from outside', () => {
    const onClose = vi.fn();
    render(<TestComponent isOpen={true} onClose={onClose} />);
    vi.advanceTimersByTime(100);

    // Manually focus outside
    const outsideButton = screen.getByTestId('outside-button');
    outsideButton.focus();

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });

    const lastButton = screen.getByTestId('last-button');
    expect(document.activeElement).toBe(lastButton);
  });

  it('does nothing if no focusable elements exist', () => {
    const TestEmpty = ({ isOpen }) => {
      const containerRef = useRef(null);
      useFocusTrap({ isOpen, containerRef, onClose: vi.fn() });
      return <div ref={containerRef}>Nothing here</div>;
    };

    render(<TestEmpty isOpen={true} />);
    // Just ensure no crash and coverage hit
    fireEvent.keyDown(document, { key: 'Tab' });
  });

  it('allows normal tab navigation from middle element', () => {
    const onClose = vi.fn();
    render(<TestComponent isOpen={true} onClose={onClose} />);
    vi.advanceTimersByTime(100);

    const input = screen.getByTestId('input');
    input.focus();

    const preventDefaultSpy = vi.spyOn(Event.prototype, 'preventDefault');
    fireEvent.keyDown(input, { key: 'Tab' });
    expect(preventDefaultSpy).not.toHaveBeenCalled();
    preventDefaultSpy.mockRestore();
  });

  it('allows normal shift-tab navigation from middle element', () => {
    const onClose = vi.fn();
    render(<TestComponent isOpen={true} onClose={onClose} />);
    vi.advanceTimersByTime(100);

    const input = screen.getByTestId('input');
    input.focus();

    const preventDefaultSpy = vi.spyOn(Event.prototype, 'preventDefault');
    fireEvent.keyDown(input, { key: 'Tab', shiftKey: true });
    expect(preventDefaultSpy).not.toHaveBeenCalled();
    preventDefaultSpy.mockRestore();
  });

  it('does nothing if containerRef is invalid', () => {
    // Test component where ref is not attached
    const TestInvalidRef = ({ isOpen }) => {
      const containerRef = useRef(null);
      useFocusTrap({ isOpen, containerRef, onClose: vi.fn() });
      return <div>No Ref</div>;
    };

    render(<TestInvalidRef isOpen={true} />);
    fireEvent.keyDown(document, { key: 'Tab' });
    // Should return early
  });
});
