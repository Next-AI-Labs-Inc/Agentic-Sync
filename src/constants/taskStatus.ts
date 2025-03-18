/**
 * Constants related to task status
 */

// Valid task statuses
export const TASK_STATUSES = {
  // Real task statuses
  INBOX: 'inbox',
  BRAINSTORM: 'brainstorm',
  PROPOSED: 'proposed',
  BACKLOG: 'backlog',
  MAYBE: 'maybe',
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  ON_HOLD: 'on-hold',
  DONE: 'done',
  REVIEWED: 'reviewed',
  ARCHIVED: 'archived',
  
  // Special filter options
  ALL: 'all',
  PENDING: 'pending', // All non-completed tasks
  RECENT_COMPLETED: 'recent-completed',
  SOURCE_TASKS: 'source-tasks' // Group for backlog/brainstorm tasks
} as const;

// Status display names (for UI)
export const STATUS_DISPLAY_NAMES = {
  [TASK_STATUSES.INBOX]: 'Inbox',
  [TASK_STATUSES.BRAINSTORM]: 'Brainstorm',
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
  [TASK_STATUSES.BRAINSTORM]: 'bg-blue-100 text-blue-800',
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
  [TASK_STATUSES.BRAINSTORM]: 'Space to develop ideas and flesh out tasks',
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

// Status display configuration (for UI presentation)
export const STATUS_DISPLAY = {
  [TASK_STATUSES.INBOX]: {
    label: 'Inbox',
    color: 'bg-indigo-100 text-indigo-800',
    icon: 'FaInbox',
    description: 'Initial collection point for new ideas and tasks'
  },
  [TASK_STATUSES.MAYBE]: {
    label: 'Someday/Maybe',
    color: 'bg-purple-100 text-purple-800',
    icon: 'FaCalendarAlt',
    description: 'Items to consider in the future but not actionable now'
  },
  [TASK_STATUSES.BRAINSTORM]: {
    label: 'Brainstorm',
    color: 'bg-teal-100 text-teal-800',
    icon: 'FaBrain',
    description: 'Initial brainstorming phase for task ideas'
  },
  [TASK_STATUSES.PROPOSED]: {
    label: 'Proposed',
    color: 'bg-purple-100 text-purple-800',
    icon: 'FaRegLightbulb',
    description: 'Task has been proposed but not started yet'
  },
  [TASK_STATUSES.BACKLOG]: {
    label: 'Backlog',
    color: 'bg-slate-100 text-slate-800',
    icon: 'FaListAlt',
    description: 'Task is in the backlog for future consideration'
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
  [TASK_STATUSES.ON_HOLD]: {
    label: 'On Hold',
    color: 'bg-amber-100 text-amber-800',
    icon: 'FaPause',
    description: 'Task is temporarily paused'
  },
  [TASK_STATUSES.DONE]: {
    label: 'For Review',
    color: 'bg-green-100 text-green-800',
    icon: 'FaCheckCircle',
    description: 'Task has been completed and is ready for review'
  },
  [TASK_STATUSES.REVIEWED]: {
    label: 'Done',
    color: 'bg-indigo-100 text-indigo-800',
    icon: 'FaCheck',
    description: 'Task has been completed and reviewed'
  },
  [TASK_STATUSES.ARCHIVED]: {
    label: 'Archived',
    color: 'bg-gray-100 text-gray-800',
    icon: 'FaArchive',
    description: 'Task has been archived and is no longer active'
  },
  [TASK_STATUSES.ALL]: {
    label: 'All Active',
    color: 'bg-blue-100 text-blue-800',
    icon: 'FaTasks',
    description: 'All active tasks (excludes done and reviewed)'
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
  },
  [TASK_STATUSES.SOURCE_TASKS]: {
    label: 'Source Tasks',
    color: 'bg-slate-100 text-slate-800',
    icon: 'FaStream',
    description: 'Source tasks from backlog and brainstorming'
  }
} as const;

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
  // Primary Actions by Status
  [TASK_STATUSES.INBOX]: 'Move to Brainstorm',
  [TASK_STATUSES.PROPOSED]: 'Move to Todo',
  [TASK_STATUSES.BACKLOG]: 'Move to Todo',
  [TASK_STATUSES.MAYBE]: 'Move to Backlog',
  [TASK_STATUSES.TODO]: 'Start Progress',
  [TASK_STATUSES.IN_PROGRESS]: 'Mark Done',
  [TASK_STATUSES.ON_HOLD]: 'Resume Progress',
  [TASK_STATUSES.DONE]: 'Mark Reviewed',
  [TASK_STATUSES.REVIEWED]: 'Archive Task',
  
  // Common transitions
  TO_BACKLOG: 'To Backlog',
  TO_MAYBE: 'To Someday/Maybe',
  ON_HOLD: 'Put On Hold',
  ARCHIVE: 'Archive',
  REOPEN: 'Reopen Task',
  STILL_WORKING: 'Still Working',
  MARK_TESTED: 'Mark Tested',
  DELETE: 'Delete',
  
  // New actions from the workflow plan
  MARK_ACTIONABLE: 'Mark Actionable',
  MOVE_TO_BRAINSTORM: 'Move to Brainstorm',
  MOVE_TO_SOMEDAY: 'Move to Someday/Maybe',
  MARK_REFERENCE: 'Mark as Reference',
  MOVE_TO_PROPOSED: 'Move to Proposed',
  MOVE_TO_INBOX: 'Move to Inbox',
  REJECT: 'Reject',
  MOVE_TO_REVIEW: 'Move to Review',
  UNARCHIVE: 'Unarchive',
  DELETE_PERMANENTLY: 'Delete Permanently',
  MOVE_TO_DONE: 'Move to Done'
};

// Status action help text (for popovers)
export const STATUS_ACTION_HELP = {
  // Base status actions
  [TASK_STATUSES.INBOX]: {
    title: 'Ready to develop this idea?',
    description: 'Click this button to move this task from your inbox to brainstorming phase, where you can further develop the concept.'
  },
  [TASK_STATUSES.BRAINSTORM]: {
    title: 'Ready to propose this idea?',
    description: 'Click this button to move this task from brainstorming to the proposed stage, making it visible for consideration by your team.'
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
  
  // Common transitions
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
  },
  
  // New actions from workflow plan
  MARK_ACTIONABLE: {
    title: 'Ready to act on this?',
    description: 'Mark this task as actionable and move it to your Todo list, indicating you can work on it now.'
  },
  MOVE_TO_BRAINSTORM: {
    title: 'Need more thinking?',
    description: 'Move this task to the Brainstorm stage to develop the idea further before deciding on next steps.'
  },
  MOVE_TO_SOMEDAY: {
    title: 'Save for the future?',
    description: 'Move this task to Someday/Maybe for ideas that are worth keeping but not actionable now.'
  },
  MARK_REFERENCE: {
    title: 'Keep as reference?',
    description: 'Mark this as reference material to keep for future use without requiring action.'
  },
  MOVE_TO_PROPOSED: {
    title: 'Propose for consideration?',
    description: 'Move this to the Proposed stage to get feedback or consideration from others.'
  },
  MOVE_TO_INBOX: {
    title: 'Back to Inbox?',
    description: 'Return this task to your Inbox for reconsideration or to restart the processing workflow.'
  },
  REJECT: {
    title: 'Reject this proposal?',
    description: 'Reject and delete this task if it\'s not valuable or relevant to your work.'
  },
  MOVE_TO_REVIEW: {
    title: 'Ready for review?',
    description: 'Move this task to the For Review stage to indicate it\'s ready for someone to verify.'
  },
  UNARCHIVE: {
    title: 'Bring back to active?',
    description: 'Unarchive this task and move it back to the backlog for reconsideration.'
  },
  DELETE_PERMANENTLY: {
    title: 'Delete permanently?',
    description: 'This will permanently remove the task with no way to recover it. Are you sure?'
  },
  MOVE_TO_DONE: {
    title: 'Mark as Done?',
    description: 'Move this task to the Done status, indicating the work is complete.'
  }
};

// Coaching messages for each task status
export const STATUS_COACHING = {
  [TASK_STATUSES.INBOX]: "Quick decision time: Can you act on this now? Move to Todo if yes. Need more thinking? Send to Brainstorm. Something for the future? Add to Someday/Maybe.",
  [TASK_STATUSES.BRAINSTORM]: "Is this idea ready for action yet? If so, mark it actionable. Need input from others? Move to Proposed. Not ready but worth keeping? Move to Someday/Maybe.",
  [TASK_STATUSES.PROPOSED]: "Time to decide on this suggestion. Ready to take it on? Mark actionable. Not now but later? Move to backlog. Not valuable? Reject it.",
  [TASK_STATUSES.BACKLOG]: "Your waiting list. Is this task a priority now? Mark actionable. Not now but someday? Move to Someday/Maybe. No longer relevant? Archive or delete.",
  [TASK_STATUSES.MAYBE]: "Your future possibilities. Has this become relevant now? Mark actionable. Getting closer to relevant? Move to backlog. Still interesting but very future? Leave here.",
  [TASK_STATUSES.TODO]: "What's your next move here? Ready to work on it now? Start progress. Something blocking it? Put on hold. Not a priority right now? Move to backlog.",
  [TASK_STATUSES.IN_PROGRESS]: "Focus on completing this. Finished with your part? Move to review. Completely done? Mark done. Stuck? Put on hold with a note about why.",
  [TASK_STATUSES.ON_HOLD]: "Something's blocking this task. Has the blocker been resolved? Resume progress. Will remain blocked for a while? Move to backlog.",
  [TASK_STATUSES.DONE]: "Nicely done! Ready to put this away? Archive it. Need formal sign-off? Mark reviewed. Need to revisit? Reopen it.",
  [TASK_STATUSES.REVIEWED]: "This task has passed review. Archive for reference or reopen if anything needs to be addressed.",
  [TASK_STATUSES.ARCHIVED]: "Reference material kept for history. Need to revive this task? Unarchive it back to the backlog."
};

// Export type for TypeScript
export type TaskStatus = keyof typeof TASK_STATUSES;