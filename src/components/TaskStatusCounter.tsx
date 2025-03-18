import React from 'react';
import { useTasks } from '@/contexts/TaskContext';
import { TASK_STATUSES } from '@/constants/taskStatus';

/**
 * Component that displays the count of tasks for each status
 * Used to verify our fixes for the task count issue
 */
const TaskStatusCounter: React.FC = () => {
  const { taskCountsByStatus, loading } = useTasks();

  if (loading) return <div>Loading task counts...</div>;

  // Get all the real task statuses (exclude filter-only statuses)
  const realStatuses = Object.values(TASK_STATUSES)
    .filter(status => !['all', 'pending', 'recent-completed', 'source-tasks'].includes(status));

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Task Status Counts</h2>
      <div className="grid grid-cols-3 gap-4">
        {realStatuses.map(status => (
          <div key={status} className="p-2 bg-gray-50 rounded-md">
            <div className="text-sm font-medium">{status}</div>
            <div className="text-2xl font-bold">{taskCountsByStatus[status] || 0}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskStatusCounter;