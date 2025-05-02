/**
 * Constants for UI elements and styles
 */
// Local storage keys for UI state persistence
export const UI_STORAGE_KEYS = {
  COMMANDS_EXPANDED: 'taskCommandsExpanded',
  TASK_EXPANDED: 'taskExpanded'
};

// Button style classes
export const BUTTON_STYLES = {
  PRIMARY: 'btn-outline-primary',
  SECONDARY: 'btn-outline-secondary',
  SUCCESS: 'btn-outline-success',
  DANGER: 'btn-outline-danger',
  INFO: 'btn-outline-info'
};

// Popover positions
export const POPOVER_POSITIONS = {
  TOP: 'top',
  RIGHT: 'right',
  BOTTOM: 'bottom',
  LEFT: 'left'
} as const;

// Badge styles
export const BADGE_STYLES = {
  STANDARD: 'badge',
  TESTED: 'badge badge-tested'
};

// Animation classes
export const ANIMATIONS = {
  FADE_IN: 'animate-fade-in',
  FADE_OUT: 'fade-out',
  STATUS_CHANGE_FLASH: 'status-change-flash'
};

// Common Tailwind classes
export const TAILWIND_CLASSES = {
  // Card states
  CARD_ACTIVE: 'bg-white',
  CARD_REVIEWED: 'bg-gray-50',
  CARD_BORDER: 'border border-gray-200',
  CARD_SHADOW: 'shadow-sm',
  CARD_ROUNDED: 'rounded-lg',
  CARD_TRANSITIONS: 'transition-all duration-200',
  
  // Text sizes
  TEXT_SMALL: 'text-sm',
  TEXT_BASE: 'text-base',
  TEXT_LARGE: 'text-lg',
  TEXT_XL: 'text-xl',
  
  // Text colors
  TEXT_PRIMARY: 'text-gray-800',
  TEXT_SECONDARY: 'text-gray-600',
  TEXT_MUTED: 'text-gray-500',
  TEXT_LIGHT: 'text-gray-400',
  
  // Spacing
  SPACING_SMALL: 'p-2',
  SPACING_MEDIUM: 'p-4',
  SPACING_LARGE: 'p-6'
};

// Export type for TypeScript
export type PopoverPosition = keyof typeof POPOVER_POSITIONS;