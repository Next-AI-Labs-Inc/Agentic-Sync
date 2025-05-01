/**
 * TaskSyncContext - Context for real-time task sync functionality
 * Provides optimized real-time updates with memory leak prevention
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Task, ProjectFilterType } from '@/types';
import taskSyncService, { SyncEventType, SyncEvent } from '@/services/taskSyncService';
import { calculateTaskCounts } from '@/utils/taskFormatters';

interface TaskSyncContextValue {
  // Methods for emitting events
  emitTaskCreated: (task: Task) => void;
  emitTaskUpdated: (task: Task) => void;
  emitTaskDeleted: (taskId: string, projectId: string) => void;
  
  // Stats for monitoring
  listenerCounts: {
    created: number;
    updated: number;
    deleted: number;
  };
}

// Create context with default values
const TaskSyncContext = createContext<TaskSyncContextValue>({
  emitTaskCreated: () => {},
  emitTaskUpdated: () => {},
  emitTaskDeleted: () => {},
  listenerCounts: { created: 0, updated: 0, deleted: 0 }
});

// Hook to use the task sync context
export const useTaskSync = () => {
  const context = useContext(TaskSyncContext);
  if (!context) {
    throw new Error('useTaskSync must be used within a TaskSyncProvider');
  }
  return context;
};

// Props for the TaskSyncProvider
interface TaskSyncProviderProps {
  children: ReactNode;
  
  // Handlers for sync events
  onTaskCreated?: (task: Task) => void;
  onTaskUpdated?: (task: Task) => void;
  onTaskDeleted?: (taskId: string, projectId: string) => void;
  
  // Filtering for tasks
  projectFilter?: ProjectFilterType;
}

/**
 * Provider component for task sync context
 */
export const TaskSyncProvider: React.FC<TaskSyncProviderProps> = ({
  children,
  onTaskCreated,
  onTaskUpdated,
  onTaskDeleted,
  projectFilter = 'all'
}) => {
  // Track listener counts for monitoring
  const [listenerCounts, setListenerCounts] = useState({
    created: 0,
    updated: 0,
    deleted: 0
  });
  
  // Function to determine if a task should be included based on project filter
  const shouldIncludeTask = useCallback(
    (task: Task, filter: ProjectFilterType): boolean => {
      if (filter === 'all') {
        return true;
      } else if (filter === 'none') {
        return !task.project;
      } else if (Array.isArray(filter)) {
        return filter.includes(task.project);
      } else {
        return task.project === filter;
      }
    },
    []
  );
  
  // Subscribe to real-time task updates
  useEffect(() => {
    // Create event handlers
    const handleTaskCreated = (event: SyncEvent) => {
      console.log('Real-time task created:', event.payload);
      const newTask = event.payload as Task;
      
      // Check if task should be included based on current filters
      if (shouldIncludeTask(newTask, projectFilter) && onTaskCreated) {
        onTaskCreated(newTask);
      }
    };
    
    const handleTaskUpdated = (event: SyncEvent) => {
      console.log('Real-time task updated:', event.payload);
      const updatedTask = event.payload as Task;
      
      if (onTaskUpdated) {
        onTaskUpdated(updatedTask);
      }
    };
    
    const handleTaskDeleted = (event: SyncEvent) => {
      console.log('Real-time task deleted:', event.payload);
      const { id, project } = event.payload;
      
      if (onTaskDeleted) {
        onTaskDeleted(id, project);
      }
    };
    
    // Set up subscriptions
    const unsubscribeCreated = taskSyncService.subscribe(
      SyncEventType.TASK_CREATED, 
      handleTaskCreated
    );
    
    const unsubscribeUpdated = taskSyncService.subscribe(
      SyncEventType.TASK_UPDATED, 
      handleTaskUpdated
    );
    
    const unsubscribeDeleted = taskSyncService.subscribe(
      SyncEventType.TASK_DELETED, 
      handleTaskDeleted
    );
    
    // Update listener counts
    setListenerCounts({
      created: taskSyncService.listenerCount(SyncEventType.TASK_CREATED),
      updated: taskSyncService.listenerCount(SyncEventType.TASK_UPDATED),
      deleted: taskSyncService.listenerCount(SyncEventType.TASK_DELETED)
    });
    
    // Clean up subscriptions on unmount
    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribeDeleted();
    };
  }, [onTaskCreated, onTaskUpdated, onTaskDeleted, projectFilter, shouldIncludeTask]);
  
  // Create context value
  const contextValue: TaskSyncContextValue = {
    // Methods to emit events
    emitTaskCreated: useCallback((task: Task) => {
      taskSyncService.emitTaskCreated(task);
    }, []),
    
    emitTaskUpdated: useCallback((task: Task) => {
      taskSyncService.emitTaskUpdated(task);
    }, []),
    
    emitTaskDeleted: useCallback((taskId: string, projectId: string) => {
      taskSyncService.emitTaskDeleted(taskId, projectId);
    }, []),
    
    // Listener stats
    listenerCounts
  };
  
  return (
    <TaskSyncContext.Provider value={contextValue}>
      {children}
    </TaskSyncContext.Provider>
  );
};

export default TaskSyncContext;