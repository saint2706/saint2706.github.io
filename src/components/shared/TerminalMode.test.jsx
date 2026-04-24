import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import TerminalMode from './TerminalMode';

import { useTheme } from './theme-context';
import { useReducedMotion } from 'framer-motion';

// Mock useNavigate from react-router-dom
const { mockNavigate } = vi.hoisted(() => ({ mockNavigate: vi.fn() }));
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('./theme-context', () => ({
  useTheme: vi.fn(() => ({ theme: 'neubrutalism' })),
}));

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    useReducedMotion: vi.fn(() => false),
  };
});

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

  it('processes "echo" command with no args correctly', () => {
    render(<TerminalMode isOpen={true} onClose={mockOnClose} />);
    const input = screen.getByRole('textbox', { name: /terminal input/i });

    fireEvent.change(input, { target: { value: 'echo' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByText('$ echo')).toBeInTheDocument();
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

  it('does not change input when pressing ArrowUp if history is empty', () => {
    render(<TerminalMode isOpen={true} onClose={mockOnClose} />);
    const input = screen.getByRole('textbox', { name: /terminal input/i });
    fireEvent.change(input, { target: { value: 'some text' } });

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input.value).toBe('some text');
  });

  it('shows error for unknown commands', () => {
    render(<TerminalMode isOpen={true} onClose={mockOnClose} />);

    const input = screen.getByRole('textbox', { name: /terminal input/i });

    fireEvent.change(input, { target: { value: 'unknown_command' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(screen.getByText(/Command not found/i)).toBeInTheDocument();
  });

  it('does not re-initialize if terminal is closed', () => {
    const { rerender } = render(<TerminalMode isOpen={true} onClose={mockOnClose} />);
    rerender(<TerminalMode isOpen={false} onClose={mockOnClose} />);
    expect(screen.queryByRole('dialog', { name: /terminal mode/i })).not.toBeInTheDocument();
  });

  it('handles state change when opening with closed terminal initially', () => {
    const { rerender } = render(<TerminalMode isOpen={false} onClose={mockOnClose} />);
    rerender(<TerminalMode isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByRole('dialog', { name: /terminal mode/i })).toBeInTheDocument();
  });

  it('initializes history with a welcome message when provided', () => {
    const { rerender } = render(
      <TerminalMode isOpen={false} onClose={mockOnClose} welcomeMessage="Hello test user" />
    );
    rerender(<TerminalMode isOpen={true} onClose={mockOnClose} welcomeMessage="Hello test user" />);

    expect(screen.getByText('Hello test user')).toBeInTheDocument();
  });

  it('does not re-initialize history when reopening if welcomeMessage is empty', () => {
    const { rerender } = render(
      <TerminalMode isOpen={false} onClose={mockOnClose} welcomeMessage="" />
    );
    rerender(<TerminalMode isOpen={true} onClose={mockOnClose} welcomeMessage="" />);

    expect(screen.getByText(/Type 'help' for available commands/i)).toBeInTheDocument();
  });

  it('processes "ls" command correctly', () => {
    render(<TerminalMode isOpen={true} onClose={mockOnClose} />);
    const input = screen.getByRole('textbox', { name: /terminal input/i });

    fireEvent.change(input, { target: { value: 'ls' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(screen.getByText(/Available pages:/i)).toBeInTheDocument();
    expect(screen.getByText(/📁 home/i)).toBeInTheDocument();
  });

  it('processes "cd" command and navigates to the page', () => {
    vi.useFakeTimers();
    render(<TerminalMode isOpen={true} onClose={mockOnClose} />);
    const input = screen.getByRole('textbox', { name: /terminal input/i });

    fireEvent.change(input, { target: { value: 'cd projects' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(screen.getByText(/Navigating to \/projects.../i)).toBeInTheDocument();

    vi.runAllTimers();
    expect(mockOnClose).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/projects');
    vi.useRealTimers();
  });

  it('processes "goto" command and navigates to home if no argument is passed', () => {
    vi.useFakeTimers();
    render(<TerminalMode isOpen={true} onClose={mockOnClose} />);
    const input = screen.getByRole('textbox', { name: /terminal input/i });

    fireEvent.change(input, { target: { value: 'goto' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(screen.getByText(/Navigating to \/home.../i)).toBeInTheDocument();

    vi.runAllTimers();
    expect(mockOnClose).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/');
    vi.useRealTimers();
  });

  it('shows error for "cd" or "goto" with invalid page', () => {
    render(<TerminalMode isOpen={true} onClose={mockOnClose} />);
    const input = screen.getByRole('textbox', { name: /terminal input/i });

    fireEvent.change(input, { target: { value: 'cd nonexistentpage' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(screen.getByText(/Error: page 'nonexistentpage' not found/i)).toBeInTheDocument();
  });

  it('processes "whoami" command correctly', () => {
    render(<TerminalMode isOpen={true} onClose={mockOnClose} />);
    const input = screen.getByRole('textbox', { name: /terminal input/i });

    fireEvent.change(input, { target: { value: 'whoami' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    // Since resumeData is used, we look for the email symbol which is definitely printed in whoami output
    expect(screen.getByText(/📧/i)).toBeInTheDocument();
  });

  it('processes "skills" command correctly', () => {
    render(<TerminalMode isOpen={true} onClose={mockOnClose} />);
    const input = screen.getByRole('textbox', { name: /terminal input/i });

    fireEvent.change(input, { target: { value: 'skills' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    // Assert that we printed some skills data from the mock, e.g., Programming or Soft Skills
    expect(screen.getByText(/Programming/i)).toBeInTheDocument();
  });

  it('processes "projects" command correctly', () => {
    render(<TerminalMode isOpen={true} onClose={mockOnClose} />);
    const input = screen.getByRole('textbox', { name: /terminal input/i });

    fireEvent.change(input, { target: { value: 'projects' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    // Assuming some featured projects are listed
    expect(screen.getByText(/★/i)).toBeInTheDocument();
  });

  it('processes "clear" command correctly', () => {
    render(<TerminalMode isOpen={true} onClose={mockOnClose} />);
    const input = screen.getByRole('textbox', { name: /terminal input/i });

    // By default, terminal may or may not print welcome header immediately in tests depending on state,
    // but running 'echo test' ensures we have something.
    fireEvent.change(input, { target: { value: 'echo sometext' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByText('sometext')).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'clear' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(screen.queryByText('sometext')).not.toBeInTheDocument();
  });

  it('processes "exit" and "quit" commands correctly', () => {
    vi.useFakeTimers();
    render(<TerminalMode isOpen={true} onClose={mockOnClose} />);
    const input = screen.getByRole('textbox', { name: /terminal input/i });

    fireEvent.change(input, { target: { value: 'quit' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(screen.getByText(/Goodbye! 👋/i)).toBeInTheDocument();

    vi.runAllTimers();
    expect(mockOnClose).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('processes "sudo" commands correctly', () => {
    render(<TerminalMode isOpen={true} onClose={mockOnClose} />);
    const input = screen.getByRole('textbox', { name: /terminal input/i });

    // Unknown sudo command
    fireEvent.change(input, { target: { value: 'sudo make me a sandwich' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByText(/sudo: command not recognized/i)).toBeInTheDocument();

    // sudo hire rishabh
    fireEvent.change(input, { target: { value: 'sudo hire rishabh' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByText(/EXCELLENT CHOICE! Rishabh has been hired!/i)).toBeInTheDocument();
  });

  it('clears input when pressing ArrowDown at the end of history', () => {
    render(<TerminalMode isOpen={true} onClose={mockOnClose} />);
    const input = screen.getByRole('textbox', { name: /terminal input/i });

    fireEvent.change(input, { target: { value: 'cmd1' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input.value).toBe('cmd1');

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input.value).toBe('');
  });

  it('focuses input when clicking the terminal output area', () => {
    render(<TerminalMode isOpen={true} onClose={mockOnClose} />);
    const input = screen.getByRole('textbox', { name: /terminal input/i });

    // Simulate clicking the container - get the div wrapping the output which has the onClick
    const inputContainer = input.parentElement;
    const outputArea = inputContainer.parentElement; // The div with flex-1 overflow-y-auto that has the onClick handler

    // Remove focus first
    input.blur();
    expect(input).not.toHaveFocus();

    fireEvent.click(outputArea);

    expect(input).toHaveFocus();
  });

  it('does nothing when processing an empty command', () => {
    render(<TerminalMode isOpen={true} onClose={mockOnClose} />);
    const input = screen.getByRole('textbox', { name: /terminal input/i });

    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(input.value).toBe('');
  });

  it('renders correctly with liquid theme and reduced motion', () => {
    vi.mocked(useTheme).mockReturnValueOnce({ theme: 'liquid' });
    vi.mocked(useReducedMotion).mockReturnValueOnce(true);
    render(<TerminalMode isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByRole('dialog', { name: /terminal mode/i })).toBeInTheDocument();
  });

  it('ignores irrelevant key presses', () => {
    render(<TerminalMode isOpen={true} onClose={mockOnClose} />);
    const input = screen.getByRole('textbox', { name: /terminal input/i });

    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.keyDown(input, { key: 'Shift' });
    expect(input.value).toBe('test');
  });

  it('handles custom line types', () => {
    render(<TerminalMode isOpen={true} onClose={mockOnClose} />);
    // The pushOutput function is not exposed, but we can trigger an error which uses the error line type.
    const input = screen.getByRole('textbox', { name: /terminal input/i });
    fireEvent.change(input, { target: { value: 'nonexistent_command' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    const errorLine = screen.getByText(/Command not found/i);
    expect(errorLine).toHaveClass('text-red-400');
  });

  it('handles custom line types with default color fallback', () => {
    render(<TerminalMode isOpen={true} onClose={mockOnClose} />);
    const input = screen.getByRole('textbox', { name: /terminal input/i });
    fireEvent.change(input, { target: { value: 'clear' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    // The clear command will add the command to the cmd history then clear it
    // Let's verify no error occurred and the terminal input is empty
    expect(input.value).toBe('');
    expect(screen.queryByText(/Command not found/i)).not.toBeInTheDocument();
  });
});
