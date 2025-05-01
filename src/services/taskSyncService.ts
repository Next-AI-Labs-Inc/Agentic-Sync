/**
 * TaskSyncService - Handles real-time updates for tasks via an event-driven approach
 * This implements a custom event system for real-time updates without relying on polling
 * Now integrated with React Query for immediate cache updates
 */

import { Task, Project } from '@/types';
import eventBus, { Event } from './eventBus';
import { QueryClient } from '@tanstack/react-query';

// Event types for task sync
export enum SyncEventType {
  TASK_CREATED = 'task_created',
  TASK_UPDATED = 'task_updated',
  TASK_DELETED = 'task_deleted',
  PROJECT_CREATED = 'project_created',
  PROJECT_UPDATED = 'project_updated',
  PROJECT_DELETED = 'project_deleted',
  SYNC_ERROR = 'sync_error',
}

// Custom event interface
export interface SyncEvent extends Event {
  type: SyncEventType;
  payload: any;
  timestamp: number;
}

// Listener type definition
export type SyncEventListener = (event: SyncEvent) => void;

// Payload type for task deletion event
export interface TaskDeletePayload {
  id: string;
  project: string;
}

/**
 * TaskSyncService - Manages real-time task synchronization
 * Uses the EventBus for efficient pub/sub with memory leak prevention
 * Now integrates with React Query for immediate cache updates
 */
class TaskSyncService {
  private eventSource: EventSource | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnected: boolean = false;
  private queryClient: QueryClient | null = null;
  
  // Static instance for singleton pattern
  private static instance: TaskSyncService;
  
  // Get singleton instance
  public static getInstance(): TaskSyncService {
    if (!TaskSyncService.instance) {
      TaskSyncService.instance = new TaskSyncService();
    }
    return TaskSyncService.instance;
  }
  
  // Connect to React Query client
  public connectQueryClient(client: QueryClient): void {
    this.queryClient = client;
    console.log('TaskSyncService connected to React Query client');
  }
  
  // Private constructor for singleton
  private constructor() { }
  
  /**
   * Initialize the sync service with SSE (Server-Sent Events)
   * For demo purposes, we're simulating this with a custom event emitter
   */
  public init(): void {
    // In a real implementation, this would connect to SSE or WebSockets
    console.log('Initializing real-time task sync service...');
    
    // Set up custom event handling to simulate SSE
    this.setupEventSimulation();
    
    // Flag as connected
    this.isConnected = true;
  }
  
  /**
   * Shutdown the sync service and clean up resources
   */
  public shutdown(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    // Clear all event listeners to prevent memory leaks
    this.clearAllListeners();
    
    this.isConnected = false;
  }
  
  /**
   * Clear all listeners for all event types
   */
  public clearAllListeners(): void {
    // Clear each event type individually to ensure all are covered
    Object.values(SyncEventType).forEach(eventType => {
      this.clearListeners(eventType as SyncEventType);
    });
  }
  
  /**
   * Subscribe to a specific event type
   * @param eventType The sync event type to subscribe to
   * @param listener The callback function to execute when event occurs
   * @returns Unsubscribe function to clean up the subscription
   */
  public subscribe(eventType: SyncEventType, listener: SyncEventListener): () => void {
    return eventBus.subscribe(eventType, listener as any);
  }
  
  /**
   * Emit a task created event
   * @param task The created task
   */
  public emitTaskCreated(task: Task): void {
    // Emit event via EventBus
    this.emit({
      type: SyncEventType.TASK_CREATED,
      payload: task,
      timestamp: Date.now()
    });
    
    // Also update React Query cache if available
    if (this.queryClient) {
      this.queryClient.setQueryData(['tasks'], (oldTasks: Task[] = []) => {
        // Add task to the cache if it doesn't already exist
        const exists = oldTasks.some(t => t.id === task.id);
        if (!exists) {
          return [...oldTasks, task];
        }
        return oldTasks;
      });
    }
  }
  
  /**
   * Emit a task updated event
   * @param task The updated task
   */
  public emitTaskUpdated(task: Task): void {
    // Emit event via EventBus
    this.emit({
      type: SyncEventType.TASK_UPDATED,
      payload: task,
      timestamp: Date.now()
    });
    
    // Also update React Query cache if available
    if (this.queryClient) {
      this.queryClient.setQueryData(['tasks'], (oldTasks: Task[] = []) => {
        // Update the task in the cache
        return oldTasks.map(t => t.id === task.id ? task : t);
      });
    }
  }
  
  /**
   * Emit a task deleted event
   * @param taskId The ID of the deleted task
   * @param projectId The project ID the task belonged to
   */
  public emitTaskDeleted(taskId: string, projectId: string): void {
    // Emit event via EventBus
    this.emit({
      type: SyncEventType.TASK_DELETED,
      payload: { id: taskId, project: projectId },
      timestamp: Date.now()
    });
    
    // Also update React Query cache if available
    if (this.queryClient) {
      this.queryClient.setQueryData(['tasks'], (oldTasks: Task[] = []) => {
        // Remove the task from the cache
        return oldTasks.filter(t => t.id !== taskId);
      });
    }
  }
  
  /**
   * Emit a project created event
   * @param project The created project
   */
  public emitProjectCreated(project: Project): void {
    this.emit({
      type: SyncEventType.PROJECT_CREATED,
      payload: project,
      timestamp: Date.now()
    });
  }
  
  /**
   * Emit a project updated event
   * @param project The updated project
   */
  public emitProjectUpdated(project: Project): void {
    this.emit({
      type: SyncEventType.PROJECT_UPDATED,
      payload: project,
      timestamp: Date.now()
    });
  }
  
  /**
   * Emit a project deleted event
   * @param projectId The ID of the deleted project
   */
  public emitProjectDeleted(projectId: string): void {
    this.emit({
      type: SyncEventType.PROJECT_DELETED,
      payload: { id: projectId },
      timestamp: Date.now()
    });
  }
  
  /**
   * Emit a sync error event
   * @param error The error that occurred
   */
  public emitSyncError(error: Error): void {
    this.emit({
      type: SyncEventType.SYNC_ERROR,
      payload: error,
      timestamp: Date.now()
    });
  }
  
  /**
   * Get number of listeners for an event type
   * @param eventType The event type to check
   * @returns The number of listeners
   */
  public listenerCount(eventType: SyncEventType): number {
    return eventBus.listenerCount(eventType);
  }
  
  /**
   * Check if there are any listeners for a specific event type
   * @param eventType The event type to check
   * @returns True if there are listeners, false otherwise
   */
  public hasListeners(eventType: SyncEventType): boolean {
    return eventBus.hasListeners(eventType);
  }
  
  /**
   * Clear all listeners for a specific event type
   * @param eventType The event type to clear
   */
  public clearListeners(eventType: SyncEventType): void {
    eventBus.clearListeners(eventType);
  }
  
  /**
   * Emit an event to all listeners
   * @param event The event to emit
   */
  private emit(event: SyncEvent): void {
    eventBus.emit(event);
  }
  
  /**
   * Set up event simulation for development
   * In production, this would be replaced with SSE or WebSocket connection
   */
  private setupEventSimulation(): void {
    console.log('Setting up real-time event simulation');
    
    // This would normally be actual SSE or WebSocket code
    // For demo purposes, our TaskContext will emit events directly
    // into this service, which will then broadcast them to all listeners
    
    // In a real implementation, we would connect to a server endpoint:
    /*
    this.eventSource = new EventSource('/api/events/tasks');
    
    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit(data);
      } catch (error) {
        console.error('Error parsing event data:', error);
      }
    };
    
    this.eventSource.onerror = () => {
      // Handle reconnection
      this.eventSource?.close();
      this.eventSource = null;
      
      this.reconnectTimer = setTimeout(() => {
        this.init();
      }, 3000);
    };
    */
  }
}

// Export singleton instance
export const taskSyncService = TaskSyncService.getInstance();

// Initialize on import
taskSyncService.init();

export default taskSyncService;