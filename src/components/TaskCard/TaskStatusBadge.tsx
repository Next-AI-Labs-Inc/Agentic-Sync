import React from 'react';
import { TASK_STATUSES, STATUS_DISPLAY_NAMES, STATUS_COLORS, STATUS_DESCRIPTIONS } from '@/constants/taskStatus';
import PopoverComponent from './PopoverComponent';

export interface TaskStatusBadgeProps {
  status: 'inbox' | 'brainstorm' | 'proposed' | 'backlog' | 'maybe' | 'todo' | 'in-progress' | 'on-hold' | 'for-review' | 'done' | 'reviewed' | 'archived';
}

/**
 * Displays a badge showing the task's current status with appropriate styling
 * Now includes a tooltip with status description on hover
 */
function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  // Get status info from constants
  const statusLabel = STATUS_DISPLAY_NAMES[status] || status;
  const statusColorClass = STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
  const statusDescription = STATUS_DESCRIPTIONS[status] || 'No description available';

  // Wrap the badge with the PopoverComponent to provide a tooltip
  return (
    <PopoverComponent 
      content={statusDescription}
      position="top"
    >
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColorClass}`}
        data-testid="status-badge"
      >
        {statusLabel}
      </span>
    </PopoverComponent>
  );
}

export default TaskStatusBadge;