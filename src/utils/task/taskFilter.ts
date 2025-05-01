import { Task, TaskFilterStatus, ProjectFilterType } from '@/types';
import { TASK_STATUSES } from '@/constants/taskStatus';

/**
 * FilterPredicates interface provides a collection of functions for filtering tasks
 */
export interface FilterPredicates {
  all: (task: Task) => boolean;
  pending: (task: Task) => boolean;
  sourceTasks: (task: Task) => boolean;
  recentCompleted: (task: Task) => boolean;
  today: (task: Task) => boolean;
  byStatus: (status: string) => (task: Task) => boolean;
}

/**
 * Creates a set of filter predicates for filtering tasks
 * @param twoDaysAgo Timestamp representing two days ago for recent completed filter
 * @returns Object containing filter predicates
 */
export const createFilterPredicates = (twoDaysAgo: number): FilterPredicates => {
  return {
    // Default 'all' filter (excludes done/reviewed)
    all: (task: Task): boolean => 
      task.status !== 'done' && task.status !== 'reviewed',
    
    // 'pending' filter (excludes done/reviewed) - identical to 'all'
    pending: (task: Task): boolean => 
      task.status !== 'done' && task.status !== 'reviewed',
    
    // 'source-tasks' filter (only backlog and brainstorm)
    sourceTasks: (task: Task): boolean => 
      task.status === 'backlog' || task.status === 'brainstorm',
    
    // 'recent-completed' filter (done/reviewed within last 2 days)
    recentCompleted: (task: Task): boolean => {
      return Boolean(
        (task.status === 'done' || task.status === 'reviewed') &&
        task.completedAt &&
        new Date(task.completedAt).getTime() > twoDaysAgo
      );
    },
    
    // 'today' filter (starred tasks) - show all stages as long as starred is true
    today: (task: Task): boolean => Boolean(task.starred),
    
    // Status-specific filters
    byStatus: (status: string) => (task: Task): boolean => task.status === status
  };
};

/**
 * Filters tasks by status using the appropriate predicate
 * @param tasks Tasks to filter
 * @param statusFilter Status filter to apply
 * @param filterPredicates Filter predicates to use
 * @returns Filtered tasks
 */
export const filterTasksByStatus = (
  tasks: Task[],
  statusFilter: TaskFilterStatus,
  filterPredicates: FilterPredicates
): Task[] => {
  if (tasks.length === 0) return [];

  // Select the appropriate filter predicate
  let filterFn: (task: Task) => boolean;
  
  if (statusFilter === TASK_STATUSES.ALL) {
    filterFn = filterPredicates.all;
  } else if (statusFilter === TASK_STATUSES.PENDING) {
    filterFn = filterPredicates.pending;
  } else if (statusFilter === TASK_STATUSES.RECENT_COMPLETED) {
    filterFn = filterPredicates.recentCompleted;
  } else if (statusFilter === TASK_STATUSES.SOURCE_TASKS) {
    filterFn = filterPredicates.sourceTasks;
  } else if (statusFilter === TASK_STATUSES.TODAY) {
    filterFn = filterPredicates.today;
  } else {
    // Status-specific filter
    filterFn = filterPredicates.byStatus(statusFilter);
  }
  
  return tasks.filter(filterFn);
};

/**
 * Determines if a task should be included based on the project filter
 * @param task Task to check
 * @param projectFilter Project filter to apply
 * @returns Boolean indicating if the task should be included
 */
export const shouldIncludeTaskByProject = (
  task: Task,
  projectFilter: ProjectFilterType
): boolean => {
  if (projectFilter === 'all') {
    return true;
  } else if (projectFilter === 'none') {
    return !task.project;
  } else if (Array.isArray(projectFilter)) {
    return projectFilter.includes(task.project);
  } else {
    return task.project === projectFilter;
  }
};

/**
 * Filters tasks by the search term across several fields
 * @param tasks Tasks to filter
 * @param searchTerm Search term to apply
 * @returns Filtered tasks
 */
export const filterTasksBySearchTerm = (
  tasks: Task[],
  searchTerm: string
): Task[] => {
  if (!searchTerm || searchTerm.trim() === '') {
    return tasks;
  }

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  
  return tasks.filter(task => 
    task.title.toLowerCase().includes(normalizedSearchTerm) ||
    (task.description && task.description.toLowerCase().includes(normalizedSearchTerm)) ||
    task.id.toLowerCase().includes(normalizedSearchTerm) ||
    (task.initiative && task.initiative.toLowerCase().includes(normalizedSearchTerm)) ||
    (task.project && task.project.toLowerCase().includes(normalizedSearchTerm)) ||
    (task.tags && task.tags.some(tag => tag.toLowerCase().includes(normalizedSearchTerm)))
  );
};