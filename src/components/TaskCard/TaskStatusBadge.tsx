import React from 'react';
import { TASK_STATUSES, STATUS_DISPLAY_NAMES, STATUS_COLORS } from '@/constants/taskStatus';

export interface TaskStatusBadgeProps {
  status: 'inbox' | 'brainstorm' | 'proposed' | 'backlog' | 'maybe' | 'todo' | 'in-progress' | 'on-hold' | 'for-review' | 'done' | 'reviewed' | 'archived';
}

/**
 * Displays a badge showing the task's current status with appropriate styling
 */
function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  // Get status info from constants
  const statusLabel = STATUS_DISPLAY_NAMES[status] || status;
  const statusColorClass = STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';

  // No color switch needed anymore, we use the pre-defined class from constants

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColorClass}`}
      data-testid="status-badge"
    >
      {statusLabel}
    </span>
  );
}

export default TaskStatusBadge;