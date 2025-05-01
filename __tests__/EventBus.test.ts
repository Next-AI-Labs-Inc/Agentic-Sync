/**
 * EventBus Test Suite
 * 
 * PURPOSE: This test suite verifies the core event system that powers the real-time task
 * updates throughout the Tasks application. The EventBus is a critical infrastructure
 * component that enables collaborative features across the app.
 * 
 * UX CAPABILITIES:
 * - Real-time task updates without page refreshes
 * - Instant notifications of task changes
 * - Collaborative editing with minimal latency
 * - Data consistency across multiple users and sessions
 * 
 * HOW TO INTERPRET RESULTS:
 * - Failed event subscription tests: Users would not receive real-time updates
 * - Failed event emission tests: User actions wouldn't propagate to other users
 * - Failed cleanup tests: Would cause memory leaks, gradually slowing the application
 */
import { EventBus } from '@/services/eventBus';

describe('EventBus', () => {
  let eventBus: EventBus;
  let mockListener1: jest.Mock;
  let mockListener2: jest.Mock;
  
  beforeEach(() => {
    // Create a fresh EventBus instance for each test
    eventBus = new EventBus({ debugMode: false });
    
    // Create mock listeners
    mockListener1 = jest.fn();
    mockListener2 = jest.fn();
  });
  
  afterEach(() => {
    // Clean up after tests
    eventBus.dispose();
  });

  /**
   * UX IMPACT: This test verifies the basic subscription mechanism that allows users to receive
   * real-time updates. Without this functionality, users would need to manually refresh
   * the page to see changes made by others, leading to potential data inconsistencies
   * and a fragmented collaborative experience.
   * 
   * TECHNICAL CONTEXT: The returned unsubscribe function is essential for proper memory management
   * and preventing memory leaks that would degrade application performance over time.
   */
  test('should allow subscribing to events', () => {
    // Subscribe to event
    const unsubscribe = eventBus.subscribe('test_event', mockListener1);
    
    // Verify unsubscribe is a function
    expect(typeof unsubscribe).toBe('function');
  });

  /**
   * UX IMPACT: This test ensures users receive immediate notifications when changes occur.
   * If this fails, users wouldn't see task updates, comments, or status changes in real-time,
   * creating a disconnected experience where collaboration becomes difficult and frustrating.
   * 
   * TECHNICAL CONTEXT: The event payload contains all the necessary information for the UI
   * to update appropriately, including the type of change and the data that changed.
   */
  test('should emit events to subscribers', () => {
    // Subscribe to event
    eventBus.subscribe('test_event', mockListener1);
    
    // Emit event
    const event = { type: 'test_event', payload: { data: 'test' }, timestamp: Date.now() };
    eventBus.emit(event);
    
    // Verify listener was called with correct event
    expect(mockListener1).toHaveBeenCalledTimes(1);
    expect(mockListener1).toHaveBeenCalledWith(expect.objectContaining({
      type: 'test_event',
      payload: { data: 'test' }
    }));
  });

  /**
   * UX IMPACT: This test verifies that components can stop listening for events when no longer needed.
   * Without proper unsubscribe functionality, users would experience gradually degrading performance 
   * as they navigate through the application, with the UI potentially becoming unresponsive 
   * after extended use.
   * 
   * TECHNICAL CONTEXT: When components unmount or when specific features are disabled by the user,
   * they must be able to unsubscribe from events to prevent memory leaks and unnecessary updates.
   */
  test('should handle unsubscribing correctly', () => {
    // Subscribe to event
    const unsubscribe = eventBus.subscribe('test_event', mockListener1);
    
    // Emit event
    eventBus.emit({ type: 'test_event', payload: {}, timestamp: Date.now() });
    
    // Verify listener was called
    expect(mockListener1).toHaveBeenCalledTimes(1);
    
    // Reset mock
    mockListener1.mockClear();
    
    // Unsubscribe
    unsubscribe();
    
    // Emit another event
    eventBus.emit({ type: 'test_event', payload: {}, timestamp: Date.now() });
    
    // Verify listener was not called after unsubscribing
    expect(mockListener1).not.toHaveBeenCalled();
  });

  /**
   * UX IMPACT: This test ensures that multiple components can respond to the same event,
   * enabling different parts of the UI to update simultaneously when a change occurs.
   * For example, when a task status changes, both the task list and the detail view
   * must update together to maintain a consistent user experience.
   * 
   * TECHNICAL CONTEXT: Multiple subscribers to the same event is a core pattern for
   * decoupled components that need to respond to the same system events.
   */
  test('should handle multiple subscribers to same event', () => {
    // Subscribe multiple listeners to same event
    eventBus.subscribe('test_event', mockListener1);
    eventBus.subscribe('test_event', mockListener2);
    
    // Emit event
    eventBus.emit({ type: 'test_event', payload: {}, timestamp: Date.now() });
    
    // Verify both listeners were called
    expect(mockListener1).toHaveBeenCalledTimes(1);
    expect(mockListener2).toHaveBeenCalledTimes(1);
  });

  /**
   * UX IMPACT: This test verifies the system's ability to manage event listeners throughout
   * the application lifecycle. Without proper cleanup, users would experience memory leaks
   * causing the application to become slower and potentially crash after extended use,
   * particularly in long-running sessions where many different views are accessed.
   * 
   * TECHNICAL CONTEXT: When features are disabled or when transitioning between major views,
   * the application needs to clean up all event listeners to prevent memory leaks.
   */
  test('should clear listeners correctly', () => {
    // Subscribe to events
    eventBus.subscribe('event1', mockListener1);
    eventBus.subscribe('event2', mockListener2);
    
    // Clear listeners for specific event
    eventBus.clearListeners('event1');
    
    // Emit events
    eventBus.emit({ type: 'event1', payload: {}, timestamp: Date.now() });
    eventBus.emit({ type: 'event2', payload: {}, timestamp: Date.now() });
    
    // Verify only the active listener was called
    expect(mockListener1).not.toHaveBeenCalled();
    expect(mockListener2).toHaveBeenCalledTimes(1);
    
    // Clear all listeners
    eventBus.clearAllListeners();
    
    // Reset mocks
    mockListener1.mockClear();
    mockListener2.mockClear();
    
    // Emit events again
    eventBus.emit({ type: 'event1', payload: {}, timestamp: Date.now() });
    eventBus.emit({ type: 'event2', payload: {}, timestamp: Date.now() });
    
    // Verify no listeners were called
    expect(mockListener1).not.toHaveBeenCalled();
    expect(mockListener2).not.toHaveBeenCalled();
  });
});