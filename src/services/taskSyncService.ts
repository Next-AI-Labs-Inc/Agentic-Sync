/**
 * TaskSyncService - Handles real-time updates for tasks via an event-driven approach
 * This implements a custom event system for real-time updates without relying on polling
 */

import { Task, Project } from '@/types';

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
export interface SyncEvent {
  type: SyncEventType;
  payload: any;
  timestamp: number;
}

// Listener type definition
type SyncEventListener = (event: SyncEvent) => void;

// The main TaskSyncService class
class TaskSyncService {
  private listeners: Map<SyncEventType, SyncEventListener[]> = new Map();
  private eventSource: EventSource | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnected: boolean = false;
  
  // Static instance for singleton pattern
  private static instance: TaskSyncService;
  
  // Get singleton instance
  public static getInstance(): TaskSyncService {
    if (!TaskSyncService.instance) {
      TaskSyncService.instance = new TaskSyncService();
    }
    return TaskSyncService.instance;
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
   * Shutdown the sync service
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
    
    // Clear all listeners
    this.listeners.clear();
    this.isConnected = false;
  }
  
  /**
   * Subscribe to a specific event type
   */
  public subscribe(eventType: SyncEventType, listener: SyncEventListener): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    
    this.listeners.get(eventType)!.push(listener);
    
    // Return unsubscribe function
    return () => {
      const typeListeners = this.listeners.get(eventType);
      if (typeListeners) {
        const index = typeListeners.indexOf(listener);
        if (index !== -1) {
          typeListeners.splice(index, 1);
        }
      }
    };
  }
  
  /**
   * Emit a task created event
   */
  public emitTaskCreated(task: Task): void {
    this.emit({
      type: SyncEventType.TASK_CREATED,
      payload: task,
      timestamp: Date.now()
    });
  }
  
  /**
   * Emit a task updated event
   */
  public emitTaskUpdated(task: Task): void {
    this.emit({
      type: SyncEventType.TASK_UPDATED,
      payload: task,
      timestamp: Date.now()
    });
  }
  
  /**
   * Emit a task deleted event
   */
  public emitTaskDeleted(taskId: string, projectId: string): void {
    this.emit({
      type: SyncEventType.TASK_DELETED,
      payload: { id: taskId, project: projectId },
      timestamp: Date.now()
    });
  }
  
  /**
   * Emit a project created event
   */
  public emitProjectCreated(project: Project): void {
    this.emit({
      type: SyncEventType.PROJECT_CREATED,
      payload: project,
      timestamp: Date.now()
    });
  }
  
  /**
   * Emit an event to all listeners
   */
  private emit(event: SyncEvent): void {
    const typeListeners = this.listeners.get(event.type);
    if (typeListeners) {
      typeListeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
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