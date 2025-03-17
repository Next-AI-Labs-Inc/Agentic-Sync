/**
 * Number indicator configurations and utilities for the Tasks app
 */

import { Task } from '@/types';

export interface NumberIndicator {
  value: number;
  label: string;
  trend?: 'up' | 'down' | 'flat';
  trendValue?: number; // Percentage change
  color?: string;
  tooltip?: string;
  isPercentage?: boolean;
}

// Static number indicators for demonstration
export const staticIndicators: Record<string, NumberIndicator> = {
  activeTasksCount: {
    value: 27,
    label: 'Active Tasks',
    trend: 'up',
    trendValue: 12.5,
    color: '#3b82f6', // Blue
    tooltip: 'Tasks with status "proposed", "todo", or "in-progress"'
  },
  completionRate: {
    value: 68,
    label: 'Completion Rate',
    trend: 'up',
    trendValue: 8.2,
    color: '#22c55e', // Green
    tooltip: 'Percentage of tasks completed in the last 30 days',
    isPercentage: true
  },
  avgCompletionTime: {
    value: 5.3,
    label: 'Avg Days to Complete',
    trend: 'down',
    trendValue: 15.3,
    color: '#eab308', // Yellow
    tooltip: 'Average number of days from task creation to completion'
  },
  overdueTasks: {
    value: 4,
    label: 'Overdue Tasks',
    trend: 'down',
    trendValue: 33.3,
    color: '#ef4444', // Red
    tooltip: 'Tasks that have passed their due date without completion'
  },
  upcomingDeadlines: {
    value: 8,
    label: 'Upcoming Deadlines',
    trend: 'up',
    trendValue: 14.2,
    color: '#9333ea', // Purple
    tooltip: 'Tasks with deadlines in the next 7 days'
  },
  blockedTasks: {
    value: 3,
    label: 'Blocked Tasks',
    trend: 'flat',
    trendValue: 0,
    color: '#64748b', // Slate
    tooltip: 'Tasks that are blocked by dependencies or other issues'
  }
};

/**
 * Calculate task status counts from a list of tasks
 * @param tasks Array of tasks to count
 * @returns Object with counts for each status
 */
export function calculateTaskStatusCounts(tasks: Task[]): Record<string, number> {
  const counts: Record<string, number> = {
    proposed: 0,
    backlog: 0,
    todo: 0,
    'in-progress': 0,
    'on-hold': 0,
    done: 0,
    reviewed: 0,
    archived: 0,
    total: tasks.length,
    active: 0,
    completed: 0
  };
  
  for (const task of tasks) {
    // Increment specific status count
    if (counts.hasOwnProperty(task.status)) {
      counts[task.status]++;
    }
    
    // Calculate aggregated counts
    if (['proposed', 'todo', 'in-progress'].includes(task.status)) {
      counts.active++;
    }
    
    if (['done', 'reviewed'].includes(task.status)) {
      counts.completed++;
    }
  }
  
  return counts;
}

/**
 * Generate number indicators from task data
 * @param tasks Current tasks array
 * @param previousTasks Optional tasks from previous period for trend calculation
 * @returns Object with calculated number indicators
 */
export function generateNumberIndicatorsFromTasks(
  tasks: Task[],
  previousTasks?: Task[]
): Record<string, NumberIndicator> {
  const currentCounts = calculateTaskStatusCounts(tasks);
  const previousCounts = previousTasks ? calculateTaskStatusCounts(previousTasks) : null;
  
  // Calculate trends
  const calculateTrend = (current: number, previous: number | null): { trend: 'up' | 'down' | 'flat', value: number } => {
    if (!previous || previous === 0) return { trend: 'flat', value: 0 };
    
    const change = ((current - previous) / previous) * 100;
    
    if (change > 1) return { trend: 'up', value: Math.round(change * 10) / 10 };
    if (change < -1) return { trend: 'down', value: Math.abs(Math.round(change * 10) / 10) };
    return { trend: 'flat', value: 0 };
  };
  
  // Active tasks indicator
  const activeTrend = calculateTrend(
    currentCounts.active,
    previousCounts?.active || null
  );
  
  const indicators: Record<string, NumberIndicator> = {
    activeTasksCount: {
      value: currentCounts.active,
      label: 'Active Tasks',
      trend: activeTrend.trend,
      trendValue: activeTrend.value,
      color: '#3b82f6', // Blue
      tooltip: 'Tasks with status "proposed", "todo", or "in-progress"'
    }
  };
  
  // Calculate completion rate if we have both datasets
  if (previousTasks) {
    // Only include tasks that were created more than a week ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const relevantTasks = tasks.filter(task => {
      const createdDate = new Date(task.createdAt);
      return createdDate < oneWeekAgo;
    });
    
    const totalRelevant = relevantTasks.length;
    const completedRelevant = relevantTasks.filter(t => 
      ['done', 'reviewed'].includes(t.status)
    ).length;
    
    const completionRate = totalRelevant > 0 
      ? Math.round((completedRelevant / totalRelevant) * 100) 
      : 0;
    
    // Calculate previous completion rate
    const prevRelevantTasks = previousTasks.filter(task => {
      const createdDate = new Date(task.createdAt);
      const twoWeeksAgo = new Date(oneWeekAgo);
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 7);
      return createdDate < oneWeekAgo && createdDate >= twoWeeksAgo;
    });
    
    const prevTotalRelevant = prevRelevantTasks.length;
    const prevCompletedRelevant = prevRelevantTasks.filter(t => 
      ['done', 'reviewed'].includes(t.status)
    ).length;
    
    const prevCompletionRate = prevTotalRelevant > 0 
      ? Math.round((prevCompletedRelevant / prevTotalRelevant) * 100) 
      : 0;
    
    const completionTrend = calculateTrend(completionRate, prevCompletionRate);
    
    indicators.completionRate = {
      value: completionRate,
      label: 'Completion Rate',
      trend: completionTrend.trend,
      trendValue: completionTrend.value,
      color: '#22c55e', // Green
      tooltip: 'Percentage of tasks completed in the last 7 days',
      isPercentage: true
    };
  }
  
  // Add count indicators for each status
  const statusColors = {
    proposed: '#9333ea', // Purple
    todo: '#3b82f6',     // Blue
    'in-progress': '#eab308', // Yellow
    done: '#22c55e',     // Green
    reviewed: '#6366f1'  // Indigo
  };
  
  Object.entries(statusColors).forEach(([status, color]) => {
    const count = currentCounts[status] || 0;
    const prevCount = previousCounts?.[status] || null;
    const trend = calculateTrend(count, prevCount);
    
    indicators[`${status}Count`] = {
      value: count,
      label: `${status.charAt(0).toUpperCase() + status.slice(1)} Tasks`,
      trend: trend.trend,
      trendValue: trend.value,
      color,
      tooltip: `Number of tasks currently in ${status} status`
    };
  });
  
  return indicators;
}

/**
 * Generate indicators for the progress bar
 * @param counts Task status counts
 * @returns Array of progress segments with percentage and color
 */
export function generateProgressSegments(counts: Record<string, number>): Array<{percentage: number, color: string}> {
  const total = counts.total || 1; // Avoid division by zero
  
  return [
    { 
      percentage: (counts.reviewed / total) * 100, 
      color: '#6366f1' // Indigo
    },
    { 
      percentage: (counts.done / total) * 100, 
      color: '#22c55e' // Green
    },
    { 
      percentage: (counts['in-progress'] / total) * 100, 
      color: '#eab308' // Yellow
    },
    { 
      percentage: (counts.todo / total) * 100, 
      color: '#3b82f6' // Blue
    },
    { 
      percentage: (counts.proposed / total) * 100, 
      color: '#9333ea' // Purple
    }
  ];
}

/**
 * Calculate completion percentage based on task statuses
 * @param tasks Array of tasks to calculate completion from
 * @returns Percentage of completion (0-100)
 */
export function calculateCompletionPercentage(tasks: Task[]): number {
  if (!tasks.length) return 0;
  
  // Weight each status appropriately
  const weights: Record<string, number> = {
    'proposed': 0.1, // 10% progress
    'backlog': 0.15, // 15% progress
    'todo': 0.25, // 25% progress
    'in-progress': 0.5, // 50% progress
    'on-hold': 0.5, // 50% progress (same as in-progress)
    'done': 0.9, // 90% progress
    'reviewed': 1.0, // 100% progress
    'archived': 1.0 // 100% progress (same as reviewed)
  };
  
  // Calculate weighted sum
  let sum = 0;
  for (const task of tasks) {
    sum += weights[task.status] || 0;
  }
  
  // Calculate percentage
  return Math.round((sum / tasks.length) * 100);
}