import { useState, useEffect, useCallback, useMemo } from 'react';
import { Task } from '@/types';
import * as taskApiService from '@/services/taskApiService';
import { calculateStatusCounts, deduplicateTasks, sortByNewestFirst } from '@/utils/task';
import { useTaskSync } from './useTaskSync';
import { getMemoryStats } from '@/utils/task/memoryStats';
import { useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Custom hook for loading tasks from the API and handling real-time updates.
 * Uses React Query for caching and memory-optimized event subscription management to prevent memory leaks.
 */
export function useTaskData() {
  const queryClient = useQueryClient();
  
  // Setup for deduplication - may be needed in some contexts
  const [dedupeEnabled, setDedupeEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [memoryUsage, setMemoryUsage] = useState<any>(null);

  // Use React Query to fetch and cache tasks
  const { 
    data: tasks = [],
    isLoading: loading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: async ({ signal }) => {
      try {
        // Build filters with timestamp to prevent browser caching
        const filters: Record<string, string | string[]> = {
          _t: Date.now().toString(),
          dedup: 'true'
        };

        // Fetch tasks from the API with the abort signal
        const tasksData = await taskApiService.getTasks(filters, signal);
        
        // Process tasks to match our Task interface
        const processedTasks = tasksData.map((task: any) => ({
          ...task,
          id: task._id || task.id // Use MongoDB _id as our id
        }));

        // Always sort by newest first
        return sortByNewestFirst(processedTasks);
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('Task fetch aborted');
          return [];
        }
        console.error('Error fetching tasks from API:', error);
        setError('Failed to load tasks from the server. Please try again later.');
        throw error;
      }
    },
    staleTime: 60000, // Consider data fresh for 1 minute
    cacheTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
  });

  // Calculate task counts by status
  const taskCountsByStatus = useMemo(() => {
    return calculateStatusCounts(tasks);
  }, [tasks]);

  // Handle task created events
  const handleTaskCreated = useCallback((newTask: Task) => {
    console.log('Real-time task created:', newTask);

    // Add _isNew flag for animation and ensure createdAt is valid
    const taskWithAnimation = {
      ...newTask,
      _isNew: true,
      createdAt: newTask.createdAt || new Date().toISOString()
    };

    // Update the query cache with the new task
    queryClient.setQueryData(['tasks'], (oldTasks: Task[] = []) => {
      // Add to tasks array and sort by newest first
      const updatedTasks = [...oldTasks, taskWithAnimation];
      let sortedTasks = sortByNewestFirst(updatedTasks);
      
      // Apply deduplication if enabled
      if (dedupeEnabled) {
        sortedTasks = deduplicateTasks(sortedTasks);
      }
      
      return sortedTasks;
    });
  }, [queryClient, dedupeEnabled]);

  // Handle task updated events
  const handleTaskUpdated = useCallback((updatedTask: Task) => {
    console.log('Real-time task updated:', updatedTask);

    // Update the query cache with the updated task
    queryClient.setQueryData(['tasks'], (oldTasks: Task[] = []) => {
      // Find the task if it exists
      const taskIndex = oldTasks.findIndex((t) => t.id === updatedTask.id);
      let newTasks;

      if (taskIndex >= 0) {
        // Update existing task
        newTasks = [...oldTasks];
        newTasks[taskIndex] = updatedTask;
      } else {
        // If task doesn't exist, add it
        newTasks = [...oldTasks, updatedTask];
      }

      // Apply sorting and deduplication
      let resultTasks = sortByNewestFirst(newTasks);
      if (dedupeEnabled) {
        resultTasks = deduplicateTasks(resultTasks);
      }
      
      return resultTasks;
    });
  }, [queryClient, dedupeEnabled]);

  // Handle task deleted events
  const handleTaskDeleted = useCallback((id: string) => {
    console.log('Real-time task deleted:', id);

    // Update the query cache to remove the task
    queryClient.setQueryData(['tasks'], (oldTasks: Task[] = []) => {
      return oldTasks.filter(task => task.id !== id);
    });
  }, [queryClient]);

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

  // Refresh tasks function - now using React Query's refetch
  const refreshTasks = useCallback(async () => {
    try {
      // Invalidate and refetch the tasks query
      await queryClient.invalidateQueries({queryKey: ['tasks']});
      const data = await refetch();
      return data.data || [];
    } catch (error) {
      console.error('Error refreshing tasks:', error);
      setError('Failed to refresh tasks from the server. Please try again later.');
      return [];
    }
  }, [queryClient, refetch]);

  // Manual deduplication function
  const runManualDedupe = useCallback(() => {
    queryClient.setQueryData(['tasks'], (oldTasks: Task[] = []) => {
      return deduplicateTasks(oldTasks);
    });
  }, [queryClient]);
  
  // Combine query error with state error
  const combinedError = error || (queryError ? String(queryError) : null);
  
  return {
    tasks,
    loading,
    error: combinedError,
    taskCountsByStatus,
    refreshTasks,
    dedupeEnabled,
    setDedupeEnabled,
    runManualDedupe,
    // Provide a way to directly set tasks in the cache
    setTasks: (newTasks: Task[]) => {
      queryClient.setQueryData(['tasks'], newTasks);
    },
    // Expose memory usage for debugging
    memoryUsage,
    // Expose task sync methods for external use
    emitTaskCreated: taskSync.emitTaskCreated,
    emitTaskUpdated: taskSync.emitTaskUpdated,
    emitTaskDeleted: taskSync.emitTaskDeleted
  };
}