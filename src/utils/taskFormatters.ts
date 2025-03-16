import { formatDistanceToNow, format } from 'date-fns';
import { Task } from '@/types';

/**
 * Formats a date as a relative time string (e.g. "2 days ago")
 * @param dateString ISO date string to format
 * @returns Formatted relative time string or empty string if date is invalid
 */
export const formatTimeAgo = (dateString?: string | null): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Formats a date as a specific format string
 * @param dateString ISO date string to format
 * @param formatString Format string for date-fns
 * @returns Formatted date string or empty string if date is invalid
 */
export const formatDate = (dateString?: string | null, formatString = 'PPP'): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return format(date, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Formats a project name for display by converting from kebab-case to Title Case
 * @param projectId Project identifier in kebab-case format
 * @returns Formatted project name in Title Case format
 */
export const formatProjectName = (projectId: string): string => {
  if (!projectId) return 'Unknown';

  return projectId
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

/**
 * Validates if a string is a valid ISO date
 * @param dateString String to validate as ISO date
 * @returns boolean indicating if the string is a valid ISO date
 */
export const isValidISODate = (dateString: string): boolean => {
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  } catch (error) {
    return false;
  }
};

/**
 * Sort tasks by creation date, newest first
 * @param tasks Array of tasks to sort
 * @returns New array of tasks sorted by creation date (newest first)
 */
export const sortTasksByNewestFirst = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => {
    const aTime = new Date(a.createdAt || 0).getTime();
    const bTime = new Date(b.createdAt || 0).getTime();
    return bTime - aTime; // Newest first
  });
};

/**
 * Sort tasks by creation date based on specified direction
 * @param tasks Array of tasks to sort
 * @param direction Sort direction ('asc' or 'desc')
 * @returns New array of tasks sorted by creation date
 */
export const sortTasksByCreationDate = (tasks: Task[], direction = 'desc'): Task[] => {
  return [...tasks].sort((a, b) => {
    const aTime = new Date(a.createdAt || 0).getTime();
    const bTime = new Date(b.createdAt || 0).getTime();
    return direction === 'desc' ? bTime - aTime : aTime - bTime;
  });
};

/**
 * Get a user-friendly message for empty task lists based on filters
 * @param projectFilter Current project filter value
 * @param completedFilter Current completion status filter value
 * @param projectName Function to get project name from ID
 * @returns Appropriate message explaining why no tasks are shown
 */
export const getEmptyStateMessage = (
  projectFilter: string | string[],
  completedFilter: string,
  projectName: (id: string) => string
): string => {
  if (projectFilter !== 'all' && projectFilter !== 'none') {
    if (Array.isArray(projectFilter)) {
      return `No tasks found for the selected projects`;
    }
    return `No tasks found for the selected project: ${projectName(projectFilter)}`;
  }
  
  if (projectFilter === 'none') {
    return 'No tasks found with no project assigned';
  }
  
  if (completedFilter !== 'all') {
    if (completedFilter === 'pending') {
      return 'No pending tasks found';
    } else if (completedFilter === 'recent-completed') {
      return 'No recently completed tasks found';
    } else {
      return `No tasks with status "${completedFilter}" found`;
    }
  }
  
  return 'No tasks found';
};