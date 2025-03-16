/**
 * Constants related to task priority
 */

// Valid task priorities
export const TASK_PRIORITIES = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
} as const;

// Priority display names (for UI)
export const PRIORITY_DISPLAY_NAMES = {
  [TASK_PRIORITIES.HIGH]: 'High',
  [TASK_PRIORITIES.MEDIUM]: 'Medium',
  [TASK_PRIORITIES.LOW]: 'Low'
};

// Priority color classes for badges
export const PRIORITY_COLORS = {
  [TASK_PRIORITIES.HIGH]: 'bg-red-100 text-red-800',
  [TASK_PRIORITIES.MEDIUM]: 'bg-yellow-100 text-yellow-800',
  [TASK_PRIORITIES.LOW]: 'bg-blue-100 text-blue-800',
  DEFAULT: 'bg-gray-100 text-gray-800'
};

// Priority descriptions for tooltips/popovers
export const PRIORITY_DESCRIPTIONS = {
  [TASK_PRIORITIES.HIGH]: 'High priority tasks need immediate attention',
  [TASK_PRIORITIES.MEDIUM]: 'Medium priority tasks should be completed soon',
  [TASK_PRIORITIES.LOW]: 'Low priority tasks can be addressed when time permits'
};

// Export type for TypeScript
export type TaskPriority = keyof typeof TASK_PRIORITIES;