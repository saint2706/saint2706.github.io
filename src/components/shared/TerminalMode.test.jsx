import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import TerminalMode from './TerminalMode';

// Mock useNavigate from react-router-dom
const { mockNavigate } = vi.hoisted(() => ({ mockNavigate: vi.fn() }));
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('TerminalMode Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(<TerminalMode isOpen={false} onClose={mockOnClose} />);
    expect(screen.queryByRole('dialog', { name: /terminal mode/i })).not.toBeInTheDocument();
  });

  it('renders correctly when isOpen is true', () => {
    render(<TerminalMode isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByRole('dialog', { name: /terminal mode/i })).toBeInTheDocument();
  });

  it('closes when close button is clicked', () => {
    render(<TerminalMode isOpen={true} onClose={mockOnClose} />);

    // The component has two close buttons: one in the title bar and one on the right
    const closeButtons = screen.getAllByRole('button', { name: /close terminal/i });
    fireEvent.click(closeButtons[0]);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('closes when Escape key is pressed', () => {
    render(<TerminalMode isOpen={true} onClose={mockOnClose} />);

    const input = screen.getByRole('textbox', { name: /terminal input/i });
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('processes "help" command correctly', () => {
    render(<TerminalMode isOpen={true} onClose={mockOnClose} />);

    const input = screen.getByRole('textbox', { name: /terminal input/i });

    fireEvent.change(input, { target: { value: 'help' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(screen.getByText(/Available commands:/i)).toBeInTheDocument();
  });

  it('processes "echo" command correctly', () => {
    render(<TerminalMode isOpen={true} onClose={mockOnClose} />);

    const input = screen.getByRole('textbox', { name: /terminal input/i });

    fireEvent.change(input, { target: { value: 'echo hello world' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(screen.getByText('hello world')).toBeInTheDocument();
  });

  it('navigates command history using up/down arrows', () => {
    render(<TerminalMode isOpen={true} onClose={mockOnClose} />);

    const input = screen.getByRole('textbox', { name: /terminal input/i });

    // Add two commands
    fireEvent.change(input, { target: { value: 'cmd1' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    fireEvent.change(input, { target: { value: 'cmd2' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    // Press Up to get cmd2
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input.value).toBe('cmd2');

    // Press Up again to get cmd1
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input.value).toBe('cmd1');

    // Press Down to go back to cmd2
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input.value).toBe('cmd2');
  });

  it('shows error for unknown commands', () => {
    render(<TerminalMode isOpen={true} onClose={mockOnClose} />);

    const input = screen.getByRole('textbox', { name: /terminal input/i });

    fireEvent.change(input, { target: { value: 'unknown_command' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(screen.getByText(/Command not found/i)).toBeInTheDocument();
  });
});
