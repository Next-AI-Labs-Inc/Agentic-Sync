import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { Task, ItemWithStatus } from '@/types';

/**
 * Format a date string in a readable format
 * @param dateString ISO date string to format
 * @param includeRelative Whether to include "X days ago" text
 */
export const formatDate = (dateString: string | undefined, includeRelative = false): string => {
  if (!dateString) return 'No date';
  
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    const formatted = format(date, 'MMM d, yyyy');
    
    if (includeRelative) {
      const relative = formatDistanceToNow(date, { addSuffix: true });
      return `${formatted} (${relative})`;
    }
    
    return formatted;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Get a CSS class based on task priority
 */
export const getPriorityClass = (priority: Task['priority']): string => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'low':
      return 'bg-green-100 text-green-800 border-green-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

/**
 * Check if the task has approval items with a specific status
 */
export const hasItemsWithStatus = (
  items: ItemWithStatus[] | undefined,
  status: 'pending' | 'approved' | 'rejected'
): boolean => {
  if (!items || !items.length) return false;
  return items.some(item => item.status === status);
};

/**
 * Count items by status
 */
export const countItemsByStatus = (
  items: ItemWithStatus[] | undefined
): { pending: number; approved: number; rejected: number; total: number } => {
  if (!items || !items.length) {
    return { pending: 0, approved: 0, rejected: 0, total: 0 };
  }
  
  return {
    pending: items.filter(item => item.status === 'pending').length,
    approved: items.filter(item => item.status === 'approved').length,
    rejected: items.filter(item => item.status === 'rejected').length,
    total: items.length
  };
};

/**
 * Generate a progress percentage for display in progress bars
 */
export const getProgressPercentage = (items: ItemWithStatus[] | undefined): number => {
  if (!items || !items.length) return 0;
  
  const counts = countItemsByStatus(items);
  if (counts.total === 0) return 0;
  
  return Math.round((counts.approved / counts.total) * 100);
};

/**
 * Check if all items in a list are approved
 */
export const areAllItemsApproved = (items: ItemWithStatus[] | undefined): boolean => {
  if (!items || !items.length) return false;
  
  const counts = countItemsByStatus(items);
  return counts.approved === counts.total;
};

/**
 * Extract first paragraph from markdown text
 */
export const getFirstParagraph = (text: string | undefined): string => {
  if (!text) return '';
  
  // Find the first paragraph, limited to 150 chars
  const match = text.match(/^(.+?)(?:\n|$)/);
  if (match && match[1]) {
    const firstPara = match[1].trim();
    return firstPara.length > 150 ? firstPara.substring(0, 147) + '...' : firstPara;
  }
  
  return text.length > 150 ? text.substring(0, 147) + '...' : text;
};