import React from 'react';
import { TASK_STATUSES } from '@/constants/taskStatus';

export interface TaskStatusBadgeProps {
  status: 'inbox' | 'brainstorm' | 'proposed' | 'backlog' | 'maybe' | 'todo' | 'in-progress' | 'on-hold' | 'for-review' | 'done' | 'reviewed' | 'archived';
}

/**
 * Displays a badge showing the task's current status with appropriate styling
 */
function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  // Get status info from constants
  const statusInfo = TASK_STATUSES.find(s => s.key === status) || {
    key: status,
    label: status,
    color: 'gray',
    group: 'other'
  };

  // Build class name based on status color
  const getColorClass = () => {
    switch (statusInfo.color) {
      case 'blue':
        return 'bg-blue-100 text-blue-800';
      case 'green':
        return 'bg-green-100 text-green-800';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800';
      case 'orange':
        return 'bg-orange-100 text-orange-800';
      case 'red':
        return 'bg-red-100 text-red-800';
      case 'purple':
        return 'bg-purple-100 text-purple-800';
      case 'pink':
        return 'bg-pink-100 text-pink-800';
      case 'indigo':
        return 'bg-indigo-100 text-indigo-800';
      case 'gray':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getColorClass()}`}
    >
      {statusInfo.label}
    </span>
  );
}

export default TaskStatusBadge;