import { useCallback, useEffect, useRef } from 'react';
import { Task } from '@/types';
import taskSyncService, { SyncEvent, SyncEventType } from '@/services/taskSyncService';

// Memory leak statistics for debugging
interface MemoryStats {
  activeSubscriptions: number;
  totalEmissions: number;
  totalHandledEvents: number;
}

// Type definition for event handlers
type TaskCreatedHandler = (task: Task) => void;
type TaskUpdatedHandler = (task: Task) => void;
type TaskDeletedHandler = (taskId: string, projectId: string) => void;

/**
 * Options for the useTaskSync hook
 */
interface UseTaskSyncOptions {
  onTaskCreated?: TaskCreatedHandler;
  onTaskUpdated?: TaskUpdatedHandler;
  onTaskDeleted?: TaskDeletedHandler;
  enabled?: boolean;
  debugMode?: boolean;
}

/**
 * Custom hook for subscribing to real-time task updates with memory leak prevention
 * @param options Configuration options
 * @returns Functions for emitting events and memory usage statistics
 */
export function useTaskSync({
  onTaskCreated,
  onTaskUpdated,
  onTaskDeleted,
  enabled = true,
  debugMode = false
}: UseTaskSyncOptions = {}) {
  // Reference for stats tracking
  const stats = useRef<MemoryStats>({
    activeSubscriptions: 0,
    totalEmissions: 0,
    totalHandledEvents: 0
  });
  
  // References for handler functions to avoid unnecessary re-subscriptions
  const handlersRef = useRef({
    onTaskCreated,
    onTaskUpdated,
    onTaskDeleted
  });
  
  // Update handlers refs when they change
  useEffect(() => {
    handlersRef.current = {
      onTaskCreated,
      onTaskUpdated,
      onTaskDeleted
    };
  }, [onTaskCreated, onTaskUpdated, onTaskDeleted]);
  
  // Debug logging helper
  const logDebug = useCallback((message: string) => {
    if (debugMode) {
      console.log(`[TaskSync] ${message}`);
    }
  }, [debugMode]);
  
  // Subscribe to task sync events
  useEffect(() => {
    if (!enabled) {
      logDebug('Task sync disabled, skipping subscription setup');
      return;
    }
    
    logDebug('Setting up task sync subscriptions');
    const unsubscribes: (() => void)[] = [];
    
    // Handle task created events
    if (handlersRef.current.onTaskCreated) {
      const handleTaskCreated = (event: SyncEvent) => {
        stats.current.totalHandledEvents++;
        logDebug(`Received task created event for task id: ${(event.payload as Task).id}`);
        
        // Call the handler with the payload
        if (handlersRef.current.onTaskCreated) {
          handlersRef.current.onTaskCreated(event.payload as Task);
        }
      };
      
      // Subscribe to created events
      unsubscribes.push(
        taskSyncService.subscribe(SyncEventType.TASK_CREATED, handleTaskCreated)
      );
      
      stats.current.activeSubscriptions++;
      logDebug(`Subscribed to TASK_CREATED events (${stats.current.activeSubscriptions} active subscriptions)`);
    }
    
    // Handle task updated events
    if (handlersRef.current.onTaskUpdated) {
      const handleTaskUpdated = (event: SyncEvent) => {
        stats.current.totalHandledEvents++;
        logDebug(`Received task updated event for task id: ${(event.payload as Task).id}`);
        
        // Call the handler with the payload
        if (handlersRef.current.onTaskUpdated) {
          handlersRef.current.onTaskUpdated(event.payload as Task);
        }
      };
      
      // Subscribe to updated events
      unsubscribes.push(
        taskSyncService.subscribe(SyncEventType.TASK_UPDATED, handleTaskUpdated)
      );
      
      stats.current.activeSubscriptions++;
      logDebug(`Subscribed to TASK_UPDATED events (${stats.current.activeSubscriptions} active subscriptions)`);
    }
    
    // Handle task deleted events
    if (handlersRef.current.onTaskDeleted) {
      const handleTaskDeleted = (event: SyncEvent) => {
        stats.current.totalHandledEvents++;
        const { id, project } = event.payload;
        logDebug(`Received task deleted event for task id: ${id}`);
        
        // Call the handler with the payload
        if (handlersRef.current.onTaskDeleted) {
          handlersRef.current.onTaskDeleted(id, project);
        }
      };
      
      // Subscribe to deleted events
      unsubscribes.push(
        taskSyncService.subscribe(SyncEventType.TASK_DELETED, handleTaskDeleted)
      );
      
      stats.current.activeSubscriptions++;
      logDebug(`Subscribed to TASK_DELETED events (${stats.current.activeSubscriptions} active subscriptions)`);
    }
    
    // Cleanup function to unsubscribe from all events on unmount
    return () => {
      logDebug('Cleaning up task sync subscriptions');
      unsubscribes.forEach(unsubscribe => {
        unsubscribe();
        stats.current.activeSubscriptions--;
      });
      logDebug(`All subscriptions cleaned up (${stats.current.activeSubscriptions} remaining)`);
    };
  }, [enabled, logDebug]);
  
  // Function to emit task created event
  const emitTaskCreated = useCallback((task: Task) => {
    stats.current.totalEmissions++;
    logDebug(`Emitting task created event for task id: ${task.id}`);
    taskSyncService.emitTaskCreated(task);
  }, [logDebug]);
  
  // Function to emit task updated event
  const emitTaskUpdated = useCallback((task: Task) => {
    stats.current.totalEmissions++;
    logDebug(`Emitting task updated event for task id: ${task.id}`);
    taskSyncService.emitTaskUpdated(task);
  }, [logDebug]);
  
  // Function to emit task deleted event
  const emitTaskDeleted = useCallback((taskId: string, projectId: string) => {
    stats.current.totalEmissions++;
    logDebug(`Emitting task deleted event for task id: ${taskId}`);
    taskSyncService.emitTaskDeleted(taskId, projectId);
  }, [logDebug]);
  
  // Return event emitters and memory stats
  return {
    // Event emitters
    emitTaskCreated,
    emitTaskUpdated,
    emitTaskDeleted,
    
    // Memory stats for debugging
    stats: stats.current,
    
    // Utility functions
    getListenerCounts: useCallback(() => ({
      created: taskSyncService.listenerCount(SyncEventType.TASK_CREATED),
      updated: taskSyncService.listenerCount(SyncEventType.TASK_UPDATED),
      deleted: taskSyncService.listenerCount(SyncEventType.TASK_DELETED)
    }), [])
  };
}