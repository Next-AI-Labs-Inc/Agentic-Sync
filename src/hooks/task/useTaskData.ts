import { useState, useEffect, useCallback } from 'react';
import { Task } from '@/types';
import * as taskApiService from '@/services/taskApiService';
import { calculateStatusCounts, deduplicateTasks, sortByNewestFirst } from '@/utils/task';
import { useTaskSync } from './useTaskSync';
import { getMemoryStats } from '@/utils/task/memoryStats';

/**
 * Custom hook for loading tasks from the API and handling real-time updates.
 * Uses memory-optimized event subscription management to prevent memory leaks.
 */
export function useTaskData() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [taskCountsByStatus, setTaskCountsByStatus] = useState<Record<string, number>>({});
  
  // Setup for deduplication - may be needed in some contexts
  const [dedupeEnabled, setDedupeEnabled] = useState(false);
  const [memoryUsage, setMemoryUsage] = useState<any>(null);

  // Handle task created events
  const handleTaskCreated = useCallback((newTask: Task) => {
    console.log('Real-time task created:', newTask);

    // Use a functional update to avoid dependency on tasks state
    setTasks((currentTasks) => {
      // Add _isNew flag for animation and ensure createdAt is valid
      const taskWithAnimation = {
        ...newTask,
        _isNew: true,
        createdAt: newTask.createdAt || new Date().toISOString()
      };

      // Add to tasks array and sort by newest first
      const updatedTasks = [...currentTasks, taskWithAnimation];
      let sortedTasks = sortByNewestFirst(updatedTasks);
      
      // Apply deduplication if enabled
      if (dedupeEnabled) {
        sortedTasks = deduplicateTasks(sortedTasks);
      }
      
      // Also update task counts in a separate call to avoid render loops
      setTimeout(() => {
        setTaskCountsByStatus(calculateStatusCounts(sortedTasks));
      }, 0);

      return sortedTasks;
    });
  }, [dedupeEnabled]);

  // Handle task updated events
  const handleTaskUpdated = useCallback((updatedTask: Task) => {
    console.log('Real-time task updated:', updatedTask);

    // Use a functional update to avoid dependency on tasks state
    // with optimized memory usage by manipulating specific tasks
    setTasks((currentTasks) => {
      // Find the index of the task if it exists
      const taskIndex = currentTasks.findIndex((t) => t.id === updatedTask.id);
      let newTasks;

      if (taskIndex >= 0) {
        // Update existing task - create a new array with only one element replaced
        newTasks = [...currentTasks];
        newTasks[taskIndex] = updatedTask;
      } else {
        // If task doesn't exist, add it
        newTasks = [...currentTasks, updatedTask];
      }

      // Apply deduplication and sorting - only when necessary
      // Most updates won't change sorting order, but we need to sort
      // if we add a new task or change a task's dates
      let resultTasks = sortByNewestFirst(newTasks);
      if (dedupeEnabled) {
        resultTasks = deduplicateTasks(resultTasks);
      }
      
      // Update task counts from the new task list in next tick
      // This avoids multiple renders in a single update cycle
      setTimeout(() => {
        setTaskCountsByStatus(calculateStatusCounts(resultTasks));
      }, 0);
      
      return resultTasks;
    });
  }, [dedupeEnabled]);

  // Handle task deleted events
  const handleTaskDeleted = useCallback((id: string) => {
    console.log('Real-time task deleted:', id);

    // Use a functional update to avoid dependency on tasks state
    // with memory-efficient task deletion
    setTasks((currentTasks) => {
      // Find the index of the task to remove
      const index = currentTasks.findIndex(t => t.id === id);
      if (index === -1) return currentTasks; // Not found, no change needed
      
      // Create a new array without the deleted task
      const newTasks = [...currentTasks];
      newTasks.splice(index, 1);
      
      // Update counters in next tick to prevent render loops
      setTimeout(() => {
        setTaskCountsByStatus(calculateStatusCounts(newTasks));
      }, 0);
      
      return newTasks;
    });
  }, []);

  // Initialize task sync with our handlers
  const taskSync = useTaskSync({
    onTaskCreated: handleTaskCreated,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
    enabled: true,
    debugMode: process.env.NODE_ENV === 'development'
  });

  // Periodically update memory usage statistics for debugging
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    const intervalId = setInterval(() => {
      setMemoryUsage({
        syncStats: taskSync.stats,
        memoryStats: getMemoryStats(),
        listenerCounts: taskSync.getListenerCounts()
      });
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, [taskSync]);

  // Refresh tasks from the MongoDB API
  const refreshTasks = useCallback(async () => {
    // Track current API request with an AbortController
    const abortController = new AbortController();
    const signal = abortController.signal;
    
    // Set loading state without clearing current tasks
    setLoading(true);

    try {
      // Build filters based on current state
      const filters: Record<string, string | string[]> = {};

      // Add timestamp to prevent caching
      filters._t = Date.now().toString();

      // Fetch tasks from the MongoDB API with the abort signal
      const tasksData = await taskApiService.getTasks(filters, signal);

      // If request was aborted, exit early
      if (signal.aborted) {
        return [];
      }

      // Only update tasks if we got valid data back
      if (tasksData && tasksData.length > 0) {
        console.log(`Loaded ${tasksData.length} tasks from API`);

        // Process tasks to match our Task interface
        const processedTasks = tasksData.map((task: any) => ({
          ...task,
          id: task._id || task.id // Use MongoDB _id as our id
        }));

        // Always sort by newest first
        const sortedTasks = sortByNewestFirst(processedTasks);

        // Batch our state updates to reduce renders
        setTasks(sortedTasks);
        setError(null); // Clear any previous errors on success
        setTaskCountsByStatus(calculateStatusCounts(sortedTasks));

        return sortedTasks;
      } else {
        // No tasks found, set empty array
        const emptyState = calculateStatusCounts([]);
        
        // Batch state updates
        setTasks([]);
        setTaskCountsByStatus(emptyState);

        return [];
      }
    } catch (error) {
      // Only report error if not aborted
      if (!signal.aborted) {
        console.error('Error fetching tasks from API:', error);
        setError('Failed to load tasks from the server. Please try again later.');
      }
      // Don't clear existing tasks on error to maintain UI stability
      throw error;
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
    
    // Return empty array as fallback
    return [];
  }, []);

  // Manual deduplication function
  const runManualDedupe = useCallback(() => {
    setTasks(currentTasks => {
      const dedupedTasks = deduplicateTasks(currentTasks);
      
      // If tasks were removed, update the counts
      if (dedupedTasks.length !== currentTasks.length) {
        // Schedule status count update
        setTimeout(() => {
          setTaskCountsByStatus(calculateStatusCounts(dedupedTasks));
        }, 0);
      }
      
      return dedupedTasks;
    });
  }, []);

  // Initial data loading
  useEffect(() => {
    // Reference to abort controller for cleanup
    let abortController: AbortController | null = null;

    // Initial load with abortion capability
    const loadInitialTasks = async () => {
      // Cancel any previous request
      if (abortController) {
        abortController.abort();
      }
      
      // Create new abort controller for this request
      abortController = new AbortController();
      
      try {
        await refreshTasks();
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error('Failed to fetch initial tasks:', error);
          setLoading(false);
        }
      }
    };
    
    // Load tasks immediately
    loadInitialTasks();
    
    // Clean up on unmount - abort any in-flight requests
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [refreshTasks]); 

  return {
    tasks,
    loading,
    error,
    taskCountsByStatus,
    refreshTasks,
    dedupeEnabled,
    setDedupeEnabled,
    runManualDedupe,
    // Also expose setTasks for components that need direct access
    setTasks,
    // Add memory usage tracking for debugging
    memoryUsage,
    // Expose task sync methods for external use
    emitTaskCreated: taskSync.emitTaskCreated,
    emitTaskUpdated: taskSync.emitTaskUpdated,
    emitTaskDeleted: taskSync.emitTaskDeleted
  };
}