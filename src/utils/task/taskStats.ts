import { Task } from '@/types';
import { TASK_STATUSES } from '@/constants/taskStatus';

/**
 * Calculates the count of tasks by status
 * @param tasks Array of tasks
 * @returns Record with status keys and count values
 */
export const calculateStatusCounts = (tasks: Task[]): Record<string, number> => {
  // Initialize counts with all valid task statuses from constants
  const counts: Record<string, number> = {};
  
  // Get all real task statuses (excluding filter-only statuses)
  Object.values(TASK_STATUSES)
    .filter(status => !['all', 'pending', 'recent-completed', 'source-tasks', 'engaged', 'review', 'completions', 'today'].includes(status))
    .forEach(status => {
      counts[status] = 0;
    });

  // Count tasks for each status
  tasks.forEach((task) => {
    if (counts[task.status] !== undefined) {
      counts[task.status]++;
    }
  });

  return counts;
};

/**
 * Gets the date threshold for "recent" completed tasks
 * Default is 2 days ago from now
 * @param daysThreshold Optional number of days to consider "recent" (default: 2)
 * @returns Timestamp for the threshold
 */
export const getRecentCompletedThreshold = (daysThreshold: number = 2): number => {
  const date = new Date();
  date.setDate(date.getDate() - daysThreshold);
  return date.getTime();
};