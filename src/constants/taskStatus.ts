/**
 * Constants related to task status
 */

// Valid task statuses
export const TASK_STATUSES = {
  INBOX: 'inbox',
  PROPOSED: 'proposed',
  BACKLOG: 'backlog',
  MAYBE: 'maybe',
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  ON_HOLD: 'on-hold',
  DONE: 'done',
  REVIEWED: 'reviewed',
  ARCHIVED: 'archived'
} as const;

// Status display names (for UI)
export const STATUS_DISPLAY_NAMES = {
  [TASK_STATUSES.INBOX]: 'Inbox',
  [TASK_STATUSES.PROPOSED]: 'Proposed',
  [TASK_STATUSES.BACKLOG]: 'Backlog',
  [TASK_STATUSES.MAYBE]: 'Someday/Maybe',
  [TASK_STATUSES.TODO]: 'Todo',
  [TASK_STATUSES.IN_PROGRESS]: 'In Progress',
  [TASK_STATUSES.ON_HOLD]: 'On Hold',
  [TASK_STATUSES.DONE]: 'Done',
  [TASK_STATUSES.REVIEWED]: 'Reviewed',
  [TASK_STATUSES.ARCHIVED]: 'Archived'
};

// Status color classes for badges
export const STATUS_COLORS = {
  [TASK_STATUSES.INBOX]: 'bg-indigo-100 text-indigo-800',
  [TASK_STATUSES.PROPOSED]: 'bg-purple-100 text-purple-800',
  [TASK_STATUSES.BACKLOG]: 'bg-slate-100 text-slate-800',
  [TASK_STATUSES.MAYBE]: 'bg-purple-100 text-purple-800',
  [TASK_STATUSES.TODO]: 'bg-blue-100 text-blue-800',
  [TASK_STATUSES.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
  [TASK_STATUSES.ON_HOLD]: 'bg-amber-100 text-amber-800',
  [TASK_STATUSES.DONE]: 'bg-green-100 text-green-800',
  [TASK_STATUSES.REVIEWED]: 'bg-indigo-100 text-indigo-800',
  [TASK_STATUSES.ARCHIVED]: 'bg-gray-100 text-gray-800',
  DEFAULT: 'bg-gray-100 text-gray-800'
};

// Status descriptions for tooltips/popovers
export const STATUS_DESCRIPTIONS = {
  [TASK_STATUSES.INBOX]: 'Initial collection point for new ideas and tasks',
  [TASK_STATUSES.PROPOSED]: 'Task has been proposed but not started yet',
  [TASK_STATUSES.BACKLOG]: 'Task is in the backlog for future consideration',
  [TASK_STATUSES.MAYBE]: 'Items to consider in the future but not actionable now',
  [TASK_STATUSES.TODO]: 'Task is ready to be worked on',
  [TASK_STATUSES.IN_PROGRESS]: 'Task is currently being worked on',
  [TASK_STATUSES.ON_HOLD]: 'Task is temporarily paused',
  [TASK_STATUSES.DONE]: 'Task has been completed',
  [TASK_STATUSES.REVIEWED]: 'Task has been completed and reviewed',
  [TASK_STATUSES.ARCHIVED]: 'Task has been archived and is no longer active'
};

// Status transition helpers - what status can a task move to from its current status
export const NEXT_STATUS = {
  [TASK_STATUSES.INBOX]: TASK_STATUSES.BRAINSTORM,
  [TASK_STATUSES.PROPOSED]: TASK_STATUSES.TODO,
  [TASK_STATUSES.BACKLOG]: TASK_STATUSES.TODO,
  [TASK_STATUSES.MAYBE]: TASK_STATUSES.BACKLOG,
  [TASK_STATUSES.TODO]: TASK_STATUSES.IN_PROGRESS,
  [TASK_STATUSES.IN_PROGRESS]: TASK_STATUSES.DONE,
  [TASK_STATUSES.ON_HOLD]: TASK_STATUSES.IN_PROGRESS,
  [TASK_STATUSES.DONE]: TASK_STATUSES.REVIEWED,
  [TASK_STATUSES.REVIEWED]: TASK_STATUSES.ARCHIVED
};

export const PREVIOUS_STATUS = {
  [TASK_STATUSES.BRAINSTORM]: TASK_STATUSES.INBOX,
  [TASK_STATUSES.PROPOSED]: TASK_STATUSES.INBOX,
  [TASK_STATUSES.BACKLOG]: TASK_STATUSES.PROPOSED,
  [TASK_STATUSES.MAYBE]: TASK_STATUSES.PROPOSED,
  [TASK_STATUSES.TODO]: TASK_STATUSES.PROPOSED,
  [TASK_STATUSES.IN_PROGRESS]: TASK_STATUSES.TODO,
  [TASK_STATUSES.ON_HOLD]: TASK_STATUSES.IN_PROGRESS,
  [TASK_STATUSES.DONE]: TASK_STATUSES.IN_PROGRESS,
  [TASK_STATUSES.REVIEWED]: TASK_STATUSES.DONE,
  [TASK_STATUSES.ARCHIVED]: TASK_STATUSES.REVIEWED
};

// Status action button text
export const STATUS_ACTION_TEXT = {
  [TASK_STATUSES.INBOX]: 'Move to Brainstorm',
  [TASK_STATUSES.PROPOSED]: 'Move to Todo',
  [TASK_STATUSES.BACKLOG]: 'Move to Todo',
  [TASK_STATUSES.MAYBE]: 'Move to Backlog',
  [TASK_STATUSES.TODO]: 'Start Progress',
  [TASK_STATUSES.IN_PROGRESS]: 'Mark Done',
  [TASK_STATUSES.ON_HOLD]: 'Resume Progress',
  [TASK_STATUSES.DONE]: 'Mark Reviewed',
  [TASK_STATUSES.REVIEWED]: 'Archive Task',
  TO_BACKLOG: 'To Backlog',
  TO_MAYBE: 'To Someday/Maybe',
  ON_HOLD: 'Put On Hold',
  ARCHIVE: 'Archive',
  REOPEN: 'Reopen Task',
  STILL_WORKING: 'Still Working',
  MARK_TESTED: 'Mark Tested',
  DELETE: 'Delete'
};

// Status action help text (for popovers)
export const STATUS_ACTION_HELP = {
  [TASK_STATUSES.INBOX]: {
    title: 'Ready to develop this idea?',
    description: 'Click this button to move this task from your inbox to brainstorming phase, where you can further develop the concept.'
  },
  [TASK_STATUSES.MAYBE]: {
    title: 'Ready to consider this task?',
    description: 'Click this button to move this task from Someday/Maybe to your backlog, indicating it\'s now worth considering in the near future.'
  },
  [TASK_STATUSES.PROPOSED]: {
    title: 'Ready to work on this?',
    description: 'Click this button to accept this task proposal and move it to your todo list. This way your team knows you\'re planning to work on it soon.'
  },
  [TASK_STATUSES.BACKLOG]: {
    title: 'Ready to work on this backlog item?',
    description: 'Click this button to move this task from your backlog to your todo list, indicating it\'s now ready to be worked on.'
  },
  [TASK_STATUSES.TODO]: {
    title: 'Starting work on this?',
    description: 'Click this button when you begin working on this task so your team knows it\'s actively being worked on.'
  },
  [TASK_STATUSES.IN_PROGRESS]: {
    title: 'Finished the work?',
    description: 'Click this button when you\'ve completed all the work for this task and it\'s ready for someone to review it.'
  },
  [TASK_STATUSES.ON_HOLD]: {
    title: 'Ready to resume work?',
    description: 'Click this button to resume work on this task that was previously put on hold.'
  },
  [TASK_STATUSES.DONE]: {
    title: 'Reviewed this work?',
    description: 'After checking this completed task and confirming everything looks good, click this button to mark it as reviewed.'
  },
  [TASK_STATUSES.REVIEWED]: {
    title: 'Archive this task?',
    description: 'This task has been reviewed and can now be archived to reduce clutter in your active tasks.'
  },
  TO_BACKLOG: {
    title: 'Move to backlog?',
    description: 'This will move the task to your backlog for future consideration, keeping it in your system but out of your active workflow.'
  },
  ON_HOLD: {
    title: 'Put on hold?',
    description: 'This will temporarily pause work on this task, indicating that it\'s not being actively worked on but hasn\'t been abandoned.'
  },
  ARCHIVE: {
    title: 'Archive this task?',
    description: 'This will move the task to the archived state, keeping it for reference but removing it from your active task list.'
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