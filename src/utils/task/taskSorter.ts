import { Task, SortOption, SortDirection } from '@/types';
import { SORT_OPTIONS, SORT_DIRECTIONS } from '@/config/constants';

/**
 * Sorts tasks by creation date - newest first
 * @param tasks Array of tasks to sort
 * @returns Sorted array of tasks (newest first)
 */
export const sortByNewestFirst = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return bTime - aTime; // Newest first
  });
};

/**
 * Sorts tasks based on provided sort criteria
 * @param tasks Array of tasks to sort
 * @param sortBy Sort criteria
 * @param sortDirection Sort direction (asc or desc)
 * @returns Sorted array of tasks
 */
export const sortTasks = (
  tasks: Task[],
  sortBy: SortOption = SORT_OPTIONS.CREATED,
  sortDirection: SortDirection = SORT_DIRECTIONS.DESC
): Task[] => {
  if (tasks.length === 0) return [];

  const sortedTasks = [...tasks];

  switch (sortBy) {
    case SORT_OPTIONS.CREATED:
      sortedTasks.sort((a, b) => {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        return sortDirection === SORT_DIRECTIONS.DESC ? bTime - aTime : aTime - bTime;
      });
      break;
    
    case SORT_OPTIONS.UPDATED:
      sortedTasks.sort((a, b) => {
        const aTime = new Date(a.updatedAt).getTime();
        const bTime = new Date(b.updatedAt).getTime();
        return sortDirection === SORT_DIRECTIONS.DESC ? bTime - aTime : aTime - bTime;
      });
      break;
    
    case SORT_OPTIONS.PRIORITY:
      // Sort by priority (high > medium > low)
      const priorityValues = { high: 3, medium: 2, low: 1 };
      sortedTasks.sort((a, b) => {
        const aPriority = priorityValues[a.priority] || 0;
        const bPriority = priorityValues[b.priority] || 0;
        return sortDirection === SORT_DIRECTIONS.DESC 
          ? bPriority - aPriority 
          : aPriority - bPriority;
      });
      break;
    
    case SORT_OPTIONS.STATUS:
      // Order by status progression (earlier statuses first)
      const statusOrder = [
        'inbox', 'brainstorm', 'proposed', 'backlog', 'maybe',
        'todo', 'in-progress', 'on-hold', 'for-review', 'done', 'reviewed', 'archived'
      ];
      sortedTasks.sort((a, b) => {
        const aIndex = statusOrder.indexOf(a.status);
        const bIndex = statusOrder.indexOf(b.status);
        return sortDirection === SORT_DIRECTIONS.DESC
          ? bIndex - aIndex
          : aIndex - bIndex;
      });
      break;
  }

  return sortedTasks;
};

/**
 * Removes duplicate tasks based on their ID
 * @param tasks Array of tasks that may contain duplicates
 * @returns Array of tasks with duplicates removed
 */
export const deduplicateTasks = (tasks: Task[]): Task[] => {
  const taskMap = new Map<string, Task>();
  
  // Use a Map to keep only the latest version of each task
  tasks.forEach(task => {
    const existingTask = taskMap.get(task.id);
    
    // If the task doesn't exist yet or this version is newer, add/update it
    if (!existingTask || new Date(task.updatedAt) > new Date(existingTask.updatedAt)) {
      taskMap.set(task.id, task);
    }
  });
  
  return Array.from(taskMap.values());
};