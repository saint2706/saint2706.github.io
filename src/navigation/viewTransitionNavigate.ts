/**
 * @fileoverview Navigation helpers that optionally wrap route changes in the
 * View Transitions API when supported.
 */

/**
 * Returns whether the current browser supports document.startViewTransition.
 *
 * @returns {boolean}
 */
export const supportsViewTransition = () =>
  typeof document !== 'undefined' && typeof document.startViewTransition === 'function';

/**
 * Determines whether a link click should be handled as in-app navigation.
 * This preserves default browser behavior for modified clicks/new-tab actions.
 *
 * @param {MouseEvent | React.MouseEvent} event
 * @returns {boolean}
 */
export const shouldHandleClientNavigationClick = event => {
  if (!event || event.defaultPrevented) return false;
  if (event.button !== 0) return false;
  if (event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) return false;

  const target = event.currentTarget?.getAttribute?.('target');
  if (target && target !== '_self') return false;

  return true;
};

/**
 * Runs a React Router navigate function inside startViewTransition when possible.
 *
 * @template TTo
 * @template TOptions
 * @param {(to: TTo, options?: TOptions) => void} navigate
 * @param {TTo} to
 * @param {TOptions} [options]
 * @param {{ disabled?: boolean }} [config]
 */
export const viewTransitionNavigate = (navigate, to, options, config = {}) => {
  if (typeof navigate !== 'function') return;

  if (config.disabled || !supportsViewTransition()) {
    navigate(to, options);
    return;
  }

  document.startViewTransition(() => {
    navigate(to, options);
  });
};

