/**
 * Constants related to task status
 */

// Valid task statuses
export const TASK_STATUSES = {
  PROPOSED: 'proposed',
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  DONE: 'done',
  REVIEWED: 'reviewed'
} as const;

// Status display names (for UI)
export const STATUS_DISPLAY_NAMES = {
  [TASK_STATUSES.PROPOSED]: 'Proposed',
  [TASK_STATUSES.TODO]: 'Todo',
  [TASK_STATUSES.IN_PROGRESS]: 'In Progress',
  [TASK_STATUSES.DONE]: 'Done',
  [TASK_STATUSES.REVIEWED]: 'Reviewed'
};

// Status color classes for badges
export const STATUS_COLORS = {
  [TASK_STATUSES.PROPOSED]: 'bg-purple-100 text-purple-800',
  [TASK_STATUSES.TODO]: 'bg-blue-100 text-blue-800',
  [TASK_STATUSES.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
  [TASK_STATUSES.DONE]: 'bg-green-100 text-green-800',
  [TASK_STATUSES.REVIEWED]: 'bg-indigo-100 text-indigo-800',
  DEFAULT: 'bg-gray-100 text-gray-800'
};

// Status descriptions for tooltips/popovers
export const STATUS_DESCRIPTIONS = {
  [TASK_STATUSES.PROPOSED]: 'Task has been proposed but not started yet',
  [TASK_STATUSES.TODO]: 'Task is ready to be worked on',
  [TASK_STATUSES.IN_PROGRESS]: 'Task is currently being worked on',
  [TASK_STATUSES.DONE]: 'Task has been completed',
  [TASK_STATUSES.REVIEWED]: 'Task has been completed and reviewed'
};

// Status transition helpers - what status can a task move to from its current status
export const NEXT_STATUS = {
  [TASK_STATUSES.PROPOSED]: TASK_STATUSES.TODO,
  [TASK_STATUSES.TODO]: TASK_STATUSES.IN_PROGRESS,
  [TASK_STATUSES.IN_PROGRESS]: TASK_STATUSES.DONE,
  [TASK_STATUSES.DONE]: TASK_STATUSES.REVIEWED
};

export const PREVIOUS_STATUS = {
  [TASK_STATUSES.TODO]: TASK_STATUSES.PROPOSED,
  [TASK_STATUSES.IN_PROGRESS]: TASK_STATUSES.TODO,
  [TASK_STATUSES.DONE]: TASK_STATUSES.IN_PROGRESS,
  [TASK_STATUSES.REVIEWED]: TASK_STATUSES.DONE
};

// Status action button text
export const STATUS_ACTION_TEXT = {
  [TASK_STATUSES.PROPOSED]: 'Move to Todo',
  [TASK_STATUSES.TODO]: 'Start Progress',
  [TASK_STATUSES.IN_PROGRESS]: 'Mark Done',
  [TASK_STATUSES.DONE]: 'Mark Reviewed',
  REOPEN: 'Reopen Task',
  STILL_WORKING: 'Still Working',
  MARK_TESTED: 'Mark Tested',
  DELETE: 'Delete'
};

// Status action help text (for popovers)
export const STATUS_ACTION_HELP = {
  [TASK_STATUSES.PROPOSED]: {
    title: 'Ready to work on this?',
    description: 'Click this button to accept this task proposal and move it to your todo list. This way your team knows you\'re planning to work on it soon.'
  },
  [TASK_STATUSES.TODO]: {
    title: 'Starting work on this?',
    description: 'Click this button when you begin working on this task so your team knows it\'s actively being worked on.'
  },
  [TASK_STATUSES.IN_PROGRESS]: {
    title: 'Finished the work?',
    description: 'Click this button when you\'ve completed all the work for this task and it\'s ready for someone to review it.'
  },
  [TASK_STATUSES.DONE]: {
    title: 'Reviewed this work?',
    description: 'After checking this completed task and confirming everything looks good, click this button to mark it as reviewed.'
  },
  STILL_WORKING: {
    title: 'Need more work?',
    description: 'If this task isn\'t actually complete and needs more work, click this button to move it back to in-progress.'
  },
  REOPEN: {
    title: 'Need another look?',
    description: 'If this task needs to be reviewed again or requires adjustments, click this button to reopen it.'
  },
  MARK_TESTED: {
    title: 'Tested and done?',
    description: 'If you\'ve completed this task and verified it works correctly, click this button to mark it as tested and complete in one step.'
  },
  DELETE: {
    title: 'Delete this task?',
    description: 'This will permanently remove the task from your system. This action cannot be undone.'
  }
};

// Export type for TypeScript
export type TaskStatus = keyof typeof TASK_STATUSES;