/**
 * @fileoverview Navigation helpers that optionally wrap route changes in the
 * View Transitions API when supported.
 */

/**
 * Global feature flag to allow one-line rollback of transition-wrapped
 * navigation behavior.
 *
 * Disable by setting `VITE_ENABLE_VIEW_TRANSITION_NAVIGATION=false`.
 */
export const VIEW_TRANSITION_NAVIGATION_ENABLED =
  import.meta.env.VITE_ENABLE_VIEW_TRANSITION_NAVIGATION !== 'false';

/**
 * Returns the View Transition entrypoint when supported, else null.
 *
 * Progressive enhancement note:
 * - Browsers without `document.startViewTransition` should navigate immediately.
 * - Transition-only lifecycle styling/hooks must be skipped in that fallback path
 *   to avoid stale classes or visual state sticking around.
 *
 * @returns {Document['startViewTransition'] | null}
 */
const getStartViewTransition = () => {
  if (typeof document === 'undefined') return null;
  if (!('startViewTransition' in document)) return null;
  return typeof document.startViewTransition === 'function'
    ? document.startViewTransition.bind(document)
    : null;
};

/**
 * Returns whether the current browser supports document.startViewTransition.
 *
 * @returns {boolean}
 */
export const supportsViewTransition = () => Boolean(getStartViewTransition());

/**
 * Returns whether motion preferences allow transition animation.
 *
 * @returns {boolean}
 */
const canAnimateViewTransitions = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return true;
  }

  return window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
};

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
 * Determines whether Enter/Space should activate client-side navigation.
 *
 * @param {KeyboardEvent | React.KeyboardEvent} event
 * @returns {boolean}
 */
export const shouldHandleClientNavigationKeydown = event => {
  if (!event || event.defaultPrevented) return false;
  if (event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) return false;

  return event.key === 'Enter' || event.key === ' ';
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
  const startViewTransition = getStartViewTransition();

  if (
    config.disabled ||
    !VIEW_TRANSITION_NAVIGATION_ENABLED ||
    !startViewTransition ||
    !canAnimateViewTransitions()
  ) {
    navigate(to, options);
    return;
  }

  startViewTransition(() => {
    navigate(to, options);
  });
};
