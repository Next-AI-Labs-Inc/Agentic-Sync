/**
 * EventBus - A lightweight pub/sub event system with memory leak prevention
 * Handles subscriptions to different event types with automatic memory management
 */

// Define the Event interface that all events will follow
export interface Event<T = any> {
  type: string;
  payload: T;
  timestamp: number;
}

// EventListener type definition
export type EventListener<T = any> = (event: Event<T>) => void;

// Optional configuration for the EventBus
export interface EventBusConfig {
  maxListenersPerEvent?: number; // Maximum listeners per event type (default: 10)
  debugMode?: boolean;           // Enable debug logging (default: false)
  cleanupInterval?: number;      // Interval in ms to check for stale listeners (default: 0 - disabled)
}

/**
 * EventBus - A centralized event management system with memory leak prevention
 */
export class EventBus {
  private listeners: Map<string, Set<EventListener>> = new Map();
  private maxListenersPerEvent: number;
  private debugMode: boolean;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private listenerUsage: Map<EventListener, number> = new Map();
  
  /**
   * Create a new EventBus instance
   * @param config Optional configuration
   */
  constructor(config: EventBusConfig = {}) {
    this.maxListenersPerEvent = config.maxListenersPerEvent || 10;
    this.debugMode = config.debugMode || false;
    
    // Set up automatic cleanup if enabled
    if (config.cleanupInterval && config.cleanupInterval > 0) {
      this.startCleanupTimer(config.cleanupInterval);
    }
    
    this.log('EventBus initialized');
  }
  
  /**
   * Subscribe to an event type
   * @param eventType The event type to subscribe to
   * @param listener The callback function to execute when event occurs
   * @returns Unsubscribe function
   */
  public subscribe<T = any>(eventType: string, listener: EventListener<T>): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    
    const eventListeners = this.listeners.get(eventType)!;
    
    // Check if we've hit the maximum listeners limit
    if (eventListeners.size >= this.maxListenersPerEvent) {
      this.warn(
        `Warning: Event '${eventType}' has exceeded the maximum listener limit (${this.maxListenersPerEvent}). ` +
        'This may indicate a memory leak in your application.'
      );
    }
    
    // Add the listener
    eventListeners.add(listener as EventListener);
    
    // Initialize usage counter for this listener
    this.listenerUsage.set(listener, 0);
    
    this.log(`Subscribed to event: ${eventType}, current count: ${eventListeners.size}`);
    
    // Return unsubscribe function
    return () => {
      this.unsubscribe(eventType, listener as EventListener);
    };
  }
  
  /**
   * Unsubscribe from an event type
   * @param eventType The event type to unsubscribe from
   * @param listener The callback function to remove
   */
  public unsubscribe<T = any>(eventType: string, listener: EventListener<T>): void {
    const eventListeners = this.listeners.get(eventType);
    if (eventListeners) {
      eventListeners.delete(listener as EventListener);
      this.listenerUsage.delete(listener as EventListener);
      
      // If no listeners remain for this event type, clean up the set
      if (eventListeners.size === 0) {
        this.listeners.delete(eventType);
      }
      
      this.log(`Unsubscribed from event: ${eventType}, remaining: ${eventListeners?.size || 0}`);
    }
  }
  
  /**
   * Emit an event
   * @param event The event to emit
   */
  public emit<T = any>(event: Event<T>): void {
    const eventListeners = this.listeners.get(event.type);
    if (!eventListeners || eventListeners.size === 0) {
      // No listeners for this event type, skip emission
      return;
    }
    
    // Create a new event object to prevent mutation of the original
    const frozenEvent = Object.freeze({...event});
    
    // Track the number of listeners notified
    let notifiedCount = 0;
    
    // Call all listeners
    eventListeners.forEach(listener => {
      try {
        listener(frozenEvent);
        
        // Update usage counter for this listener
        const currentUsage = this.listenerUsage.get(listener) || 0;
        this.listenerUsage.set(listener, currentUsage + 1);
        
        notifiedCount++;
      } catch (error) {
        this.error(`Error in event listener for ${event.type}:`, error);
      }
    });
    
    this.log(`Emitted event: ${event.type}, notified ${notifiedCount} listeners`);
  }
  
  /**
   * Check if there are any listeners for a specific event type
   * @param eventType The event type to check
   * @returns True if there are listeners, false otherwise
   */
  public hasListeners(eventType: string): boolean {
    const eventListeners = this.listeners.get(eventType);
    return !!eventListeners && eventListeners.size > 0;
  }
  
  /**
   * Get the count of listeners for a specific event type
   * @param eventType The event type to check
   * @returns The number of listeners
   */
  public listenerCount(eventType: string): number {
    const eventListeners = this.listeners.get(eventType);
    return eventListeners ? eventListeners.size : 0;
  }
  
  /**
   * Clear all listeners for a specific event type
   * @param eventType The event type to clear
   */
  public clearListeners(eventType: string): void {
    const eventListeners = this.listeners.get(eventType);
    if (eventListeners) {
      // Clear usage counters for all listeners of this event type
      eventListeners.forEach(listener => {
        this.listenerUsage.delete(listener);
      });
      
      // Delete the event type from the map
      this.listeners.delete(eventType);
      this.log(`Cleared all listeners for event: ${eventType}`);
    }
  }
  
  /**
   * Clear all listeners for all event types
   */
  public clearAllListeners(): void {
    // Clear all usage counters
    this.listenerUsage.clear();
    
    // Clear all event listeners
    this.listeners.clear();
    this.log('Cleared all event listeners');
  }
  
  /**
   * Identify potentially leaked listeners that haven't been used in a while
   * @param unusedThreshold Number of emissions without usage to consider a listener stale
   */
  public identifyStaleListeners(unusedThreshold: number = 10): { eventType: string, count: number }[] {
    const staleEventTypes: { eventType: string, count: number }[] = [];
    
    // Check each event type
    this.listeners.forEach((listeners, eventType) => {
      let staleCount = 0;
      
      // Check each listener for this event type
      listeners.forEach(listener => {
        const usageCount = this.listenerUsage.get(listener) || 0;
        
        // If the listener hasn't been used much, it might be stale
        if (usageCount < unusedThreshold) {
          staleCount++;
        }
      });
      
      if (staleCount > 0) {
        staleEventTypes.push({ eventType, count: staleCount });
      }
    });
    
    return staleEventTypes;
  }
  
  /**
   * Start a timer to periodically check for and report possible memory leaks
   * @param interval Time in milliseconds between cleanup checks
   */
  private startCleanupTimer(interval: number): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    
    this.cleanupTimer = setInterval(() => {
      const staleListeners = this.identifyStaleListeners();
      
      if (staleListeners.length > 0) {
        this.warn('Possible memory leak detected. These event types have listeners that may need cleanup:');
        staleListeners.forEach(({ eventType, count }) => {
          this.warn(`  - ${eventType}: ${count} potentially stale listeners`);
        });
      }
    }, interval);
  }
  
  /**
   * Stop the cleanup timer
   */
  public stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
  
  /**
   * Dispose of the EventBus instance, clearing all listeners and timers
   */
  public dispose(): void {
    this.stopCleanupTimer();
    this.clearAllListeners();
    this.log('EventBus disposed');
  }
  
  // Logging utilities
  private log(message: string): void {
    if (this.debugMode) {
      console.log(`[EventBus] ${message}`);
    }
  }
  
  private warn(message: string): void {
    console.warn(`[EventBus] ${message}`);
  }
  
  private error(message: string, error?: any): void {
    console.error(`[EventBus] ${message}`, error);
  }
}

// Create and export a default instance
const defaultEventBus = new EventBus({ 
  debugMode: process.env.NODE_ENV === 'development',
  maxListenersPerEvent: 20,
  cleanupInterval: process.env.NODE_ENV === 'development' ? 60000 : 0 // 1 minute in dev, disabled in prod
});

export default defaultEventBus;