/**
 * @fileoverview Settings modal for controlling theme and cursor preferences.
 * Contains a 4-theme visual picker and a custom cursor toggle.
 */

import React, { useRef, useEffect } from 'react';
import { X, MousePointer2, Sun, Moon, Droplets, Cloud } from 'lucide-react';
import { useTheme } from './theme-context';
import { THEMES } from './theme-context';
import { useFocusTrap } from './useFocusTrap';

const THEME_OPTIONS = [
  {
    id: THEMES.neubrutalism,
    label: 'Neubrutalism',
    subtitle: 'Bold & Raw',
    icon: Sun,
    swatch: ['#fafafa', '#ffd54f', '#000000', '#9c0e4b'],
    swatchStyle: 'grid',
  },
  {
    id: THEMES.neubrutalismDark,
    label: 'Midnight Brutal',
    subtitle: 'Dark & Punchy',
    icon: Moon,
    swatch: ['#121212', '#ffd54f', '#f5f5f5', '#ff4081'],
    swatchStyle: 'grid',
  },
  {
    id: THEMES.liquid,
    label: 'Liquid Glass',
    subtitle: 'iOS Inspired',
    icon: Droplets,
    swatch: ['#f2f2f7', '#007aff', '#1d1d1f', '#af52de'],
    swatchStyle: 'glass',
  },
  {
    id: THEMES.liquidDark,
    label: 'Liquid Night',
    subtitle: 'Dark Glass',
    icon: Cloud,
    swatch: ['#000000', '#0a84ff', '#f5f5f7', '#bf5af2'],
    swatchStyle: 'glass',
  },
];

const ThemeCard = ({ option, isActive, onClick }) => {
  const Icon = option.icon;
  const isLiquidStyle = option.swatchStyle === 'glass';

  return (
    <button
      type="button"
      onClick={() => onClick(option.id)}
      aria-pressed={isActive}
      aria-label={`Select ${option.label} theme`}
      className="settings-theme-card"
      data-active={isActive}
      data-style={option.swatchStyle}
    >
      {/* Swatch preview */}
      <div className="settings-swatch" style={{ background: option.swatch[0] }} aria-hidden="true">
        {isLiquidStyle ? (
          <>
            <div className="swatch-blob swatch-blob-1" style={{ background: option.swatch[1] }} />
            <div className="swatch-blob swatch-blob-2" style={{ background: option.swatch[3] }} />
          </>
        ) : (
          <div className="swatch-nb-grid" style={{ borderColor: option.swatch[2] }}>
            <div style={{ background: option.swatch[1] }} />
            <div style={{ background: option.swatch[2] }} />
          </div>
        )}
      </div>

      {/* Card info */}
      <div className="settings-card-body">
        <div className="settings-card-top">
          <Icon size={14} aria-hidden="true" />
          <span className="settings-card-label">{option.label}</span>
        </div>
        <span className="settings-card-sub">{option.subtitle}</span>
      </div>

      {/* Active checkmark */}
      {isActive && (
        <div className="settings-card-check" aria-hidden="true">
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </button>
  );
};

/**
 * Modal for choosing theme and toggling custom cursor.
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Whether the modal is visible.
 * @param {Function} props.onClose - Close handler.
 * @param {boolean} props.cursorEnabled - Current cursor state.
 * @param {boolean} props.cursorToggleDisabled - Whether cursor toggle is locked by a11y prefs.
 * @param {Function} props.onToggleCursor - Cursor toggle handler.
 */
const SettingsModal = ({
  isOpen,
  onClose,
  cursorEnabled,
  cursorToggleDisabled,
  onToggleCursor,
}) => {
  const { theme, setTheme } = useTheme();
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);

  useFocusTrap({ isOpen, containerRef: modalRef, onClose });

  // Return focus to trigger on close
  useEffect(() => {
    if (!isOpen) return;
    return () => {
      // Brief delay so the gear button is mountable before focusing
      setTimeout(() => {
        document.getElementById('settings-open-btn')?.focus();
      }, 50);
    };
  }, [isOpen]);

  // Close on backdrop click
  const handleBackdropClick = e => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  const isLiquidVariant = theme === THEMES.liquid || theme === THEMES.liquidDark;

  return (
    <div
      className="settings-backdrop"
      onClick={handleBackdropClick}
      role="presentation"
      aria-hidden={!isOpen}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        className={`settings-modal ${isLiquidVariant ? 'settings-modal--liquid' : 'settings-modal--nb'}`}
      >
        {/* Header */}
        <div className="settings-header">
          <h2 className="settings-title">Settings</h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="settings-close-btn"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Theme section */}
        <section aria-labelledby="settings-theme-heading" className="settings-section">
          <h3 id="settings-theme-heading" className="settings-section-title">
            Appearance
          </h3>
          <div className="settings-theme-grid" role="radiogroup" aria-label="Select theme">
            {THEME_OPTIONS.map(option => (
              <ThemeCard
                key={option.id}
                option={option}
                isActive={theme === option.id}
                onClick={setTheme}
              />
            ))}
          </div>
        </section>

        {/* Cursor section */}
        <section
          aria-labelledby="settings-cursor-heading"
          className="settings-section settings-section--cursor"
        >
          <div className="settings-cursor-row">
            <div className="settings-cursor-info">
              <h3 id="settings-cursor-heading" className="settings-section-title">
                Custom Cursor
              </h3>
              <p className="settings-cursor-desc">
                {cursorToggleDisabled
                  ? 'Disabled by motion or pointer preferences'
                  : 'Animated cursor with trail effects'}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={cursorEnabled}
              aria-label="Toggle custom cursor"
              onClick={onToggleCursor}
              disabled={cursorToggleDisabled}
              className={`settings-toggle ${cursorEnabled ? 'settings-toggle--on' : 'settings-toggle--off'}`}
            >
              <span className="settings-toggle-thumb">
                <MousePointer2 size={10} aria-hidden="true" />
              </span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsModal;
