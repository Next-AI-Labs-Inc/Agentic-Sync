/**
 * Task Management System Configuration
 * 
 * This file contains centralized constants that can be reused across
 * the task management system or adapted for other similar systems.
 */

/**
 * Status configuration for task workflow
 */
export const TASK_STATUSES = {
  PROPOSED: 'proposed',
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  DONE: 'done',
  REVIEWED: 'reviewed',
  
  // Special filter options
  ALL: 'all',
  PENDING: 'pending', // All non-completed tasks
  RECENT_COMPLETED: 'recent-completed',
} as const;

/**
 * Status display configuration (for UI presentation)
 */
export const STATUS_DISPLAY = {
  [TASK_STATUSES.PROPOSED]: {
    label: 'Proposed',
    color: 'bg-purple-100 text-purple-800',
    icon: 'FaRegLightbulb',
    description: 'Task has been proposed but not started yet'
  },
  [TASK_STATUSES.TODO]: {
    label: 'To Do',
    color: 'bg-blue-100 text-blue-800',
    icon: 'FaRegCircle',
    description: 'Task is ready to be worked on'
  },
  [TASK_STATUSES.IN_PROGRESS]: {
    label: 'In Progress',
    color: 'bg-yellow-100 text-yellow-800',
    icon: 'FaSpinner',
    description: 'Task is currently being worked on'
  },
  [TASK_STATUSES.DONE]: {
    label: 'Done',
    color: 'bg-green-100 text-green-800',
    icon: 'FaCheckCircle',
    description: 'Task has been completed'
  },
  [TASK_STATUSES.REVIEWED]: {
    label: 'Reviewed',
    color: 'bg-indigo-100 text-indigo-800',
    icon: 'FaCheck',
    description: 'Task has been completed and reviewed'
  },
  [TASK_STATUSES.ALL]: {
    label: 'All Tasks',
    color: 'bg-blue-100 text-blue-800',
    icon: 'FaTasks',
    description: 'All tasks regardless of status'
  },
  [TASK_STATUSES.PENDING]: {
    label: 'All Pending',
    color: 'bg-blue-100 text-blue-800',
    icon: 'FaHourglass',
    description: 'All tasks that are not yet complete'
  },
  [TASK_STATUSES.RECENT_COMPLETED]: {
    label: 'Recently Completed',
    color: 'bg-green-100 text-green-800',
    icon: 'FaClock',
    description: 'Tasks completed in the last two days'
  }
} as const;

/**
 * Priority configuration
 */
export const TASK_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
} as const;

/**
 * Priority display configuration (for UI presentation)
 */
export const PRIORITY_DISPLAY = {
  [TASK_PRIORITIES.LOW]: {
    label: 'Low',
    color: 'bg-blue-100 text-blue-800',
    description: 'Low priority tasks can be addressed when time permits'
  },
  [TASK_PRIORITIES.MEDIUM]: {
    label: 'Medium',
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Medium priority tasks should be completed soon'
  },
  [TASK_PRIORITIES.HIGH]: {
    label: 'High',
    color: 'bg-red-100 text-red-800',
    description: 'High priority tasks need immediate attention'
  }
} as const;

/**
 * Sort options for tasks
 */
export const SORT_OPTIONS = {
  UPDATED: 'updated',
  CREATED: 'created',
  PRIORITY: 'priority',
  STATUS: 'status'
} as const;

/**
 * Sort directions
 */
export const SORT_DIRECTIONS = {
  ASC: 'asc',
  DESC: 'desc'
} as const;

/**
 * Local storage keys for persisting user preferences
 */
export const STORAGE_KEYS = {
  FILTER_PREFERENCES: 'taskFilterPreferences',
  SAVED_FILTERS: 'taskSavedFilters',
  LAST_PROJECT: 'taskForm_lastProject',
  TASK_STAGES: 'taskStages',
  FILTERS_EXPANDED: 'taskFiltersExpanded'
} as const;

/**
 * Project filter special values
 */
export const PROJECT_FILTERS = {
  ALL: 'all',
  NONE: 'none'
} as const;

/**
 * Safe project names for database operations
 * These are the only projects that can be affected by cleanup operations
 */
export const SAFE_PROJECT_NAMES = ['tasks', 'task-management'];

/**
 * Z-index values for UI components
 */
export const Z_INDICES = {
  POPOVER: 1000,
  MODAL: 1100,
  DROPDOWN: 950,
  HEADER: 900,
  TOOLTIP: 1000
} as const;