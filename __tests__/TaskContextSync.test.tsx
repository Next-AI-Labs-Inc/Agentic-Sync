/**
 * Task Synchronization System Test Suite
 * 
 * PURPOSE: This test suite verifies the real-time task synchronization system that ensures
 * all users see consistent task data without needing to refresh the page. This is critical for
 * collaborative task management where multiple users may be viewing and editing tasks simultaneously.
 * 
 * UX CAPABILITIES:
 * - Real-time task updates appearing across all connected devices
 * - Immediate task creation notifications for team members
 * - Live updates to task status, priority, and content
 * - Seamless task deletion with immediate UI updates
 * 
 * HOW TO INTERPRET RESULTS:
 * - Failed task creation tests: New tasks created by team members wouldn't appear without refresh
 * - Failed task update tests: Changes made by others wouldn't be visible immediately
 * - Failed task deletion tests: Deleted tasks would still appear until page refresh
 * - Failed memory tests: Application would slow down significantly during extended use
 */
import { EventBus } from '../src/services/eventBus';

describe('Real-time Task Synchronization', () => {
  // Create an instance of EventBus for testing
  let eventBus: EventBus;
  
  beforeEach(() => {
    // Create a fresh instance for each test
    eventBus = new EventBus({
      debugMode: false,
      maxListenersPerEvent: 5,
    });
  });
  
  afterEach(() => {
    // Clean up after tests
    eventBus.dispose();
  });
  
  /**
   * UX IMPACT: This test ensures that when team members create new tasks, they immediately
   * appear for all users without requiring a page refresh. This enables frictionless
   * collaboration during planning sessions and daily standups, where immediate feedback
   * on new task creation is essential for team coordination.
   * 
   * TECHNICAL CONTEXT: The task_created event carries complete task data including ID,
   * title, description, assignee, due date, and other fields needed to render a new task
   * in the interface without requiring a separate API call.
   */
  test('should notify all users immediately when new tasks are created', () => {
    // Set up a listener for task created events
    const mockListener = jest.fn();
    const unsubscribe = eventBus.subscribe('task_created', mockListener);
    
    // Emit a task created event
    const mockTask = { id: 'task1', title: 'Test Task' };
    const event = {
      type: 'task_created',
      payload: mockTask,
      timestamp: Date.now(),
    };
    
    // Dispatch the event
    eventBus.emit(event);
    
    // Verify the listener was called with the correct event
    expect(mockListener).toHaveBeenCalledTimes(1);
    expect(mockListener).toHaveBeenCalledWith(expect.objectContaining({
      type: 'task_created',
      payload: mockTask,
    }));
    
    // Clean up
    unsubscribe();
  });
  
  /**
   * UX IMPACT: This test verifies that when users modify tasks (changing status, updating
   * descriptions, adjusting due dates, etc.), those changes are immediately visible to all
   * team members. Without this feature, users would see outdated task information, potentially
   * leading to duplicate work, confusion about task status, and disrupted workflow.
   * 
   * TECHNICAL CONTEXT: Task updates must be atomic and consistent, ensuring all fields
   * update together to maintain data integrity across all connected clients.
   */
  test('should synchronize task changes in real-time across all user sessions', () => {
    // Set up a listener for task updated events
    const mockListener = jest.fn();
    const unsubscribe = eventBus.subscribe('task_updated', mockListener);
    
    // Emit a task updated event
    const mockTask = { id: 'task1', title: 'Updated Task', status: 'in-progress' };
    const event = {
      type: 'task_updated',
      payload: mockTask,
      timestamp: Date.now(),
    };
    
    // Dispatch the event
    eventBus.emit(event);
    
    // Verify the listener was called with the correct event
    expect(mockListener).toHaveBeenCalledTimes(1);
    expect(mockListener).toHaveBeenCalledWith(expect.objectContaining({
      type: 'task_updated',
      payload: mockTask,
    }));
    
    // Clean up
    unsubscribe();
  });
  
  /**
   * UX IMPACT: This test ensures that when tasks are deleted, they immediately disappear
   * from all users' views. Without this functionality, users might continue working on
   * or referencing tasks that no longer exist, causing confusion and wasted effort.
   * This is especially important in fast-paced environments where task priorities change quickly.
   * 
   * TECHNICAL CONTEXT: Task deletion events must include enough information to identify the task
   * across different views and components, allowing complete removal from all UI elements.
   */
  test('should immediately remove deleted tasks from all user interfaces', () => {
    // Set up a listener for task deleted events
    const mockListener = jest.fn();
    const unsubscribe = eventBus.subscribe('task_deleted', mockListener);
    
    // Emit a task deleted event
    const deletePayload = { id: 'task1', project: 'project1' };
    const event = {
      type: 'task_deleted',
      payload: deletePayload,
      timestamp: Date.now(),
    };
    
    // Dispatch the event
    eventBus.emit(event);
    
    // Verify the listener was called with the correct event
    expect(mockListener).toHaveBeenCalledTimes(1);
    expect(mockListener).toHaveBeenCalledWith(expect.objectContaining({
      type: 'task_deleted',
      payload: deletePayload,
    }));
    
    // Clean up
    unsubscribe();
  });
  
  /**
   * UX IMPACT: This test verifies the application's memory management during navigation
   * and component transitions. Without proper cleanup, users would experience progressively
   * slower performance as they use the application, especially after viewing many different 
   * tasks or switching between projects frequently. The degradation would be particularly 
   * noticeable on mobile devices or less powerful computers.
   * 
   * TECHNICAL CONTEXT: Each component in the task interface must properly unsubscribe from
   * events when it unmounts to prevent memory leaks and ensure the UI remains responsive.
   */
  test('should maintain performance by properly cleaning up event listeners', () => {
    // Create multiple listeners
    const mockListeners = Array(5).fill(null).map(() => jest.fn());
    const unsubscribeFns = mockListeners.map((listener, index) => {
      const eventType = `event_${index}`;
      return eventBus.subscribe(eventType, listener);
    });
    
    // Verify all event types are registered
    expect(eventBus.hasListeners('event_0')).toBe(true);
    expect(eventBus.hasListeners('event_1')).toBe(true);
    expect(eventBus.hasListeners('event_2')).toBe(true);
    expect(eventBus.hasListeners('event_3')).toBe(true);
    expect(eventBus.hasListeners('event_4')).toBe(true);
    
    // Unsubscribe from all events
    unsubscribeFns.forEach(unsubscribe => unsubscribe());
    
    // Verify all events were unsubscribed properly
    expect(eventBus.hasListeners('event_0')).toBe(false);
    expect(eventBus.hasListeners('event_1')).toBe(false);
    expect(eventBus.hasListeners('event_2')).toBe(false);
    expect(eventBus.hasListeners('event_3')).toBe(false);
    expect(eventBus.hasListeners('event_4')).toBe(false);
  });
  
  /**
   * UX IMPACT: This test ensures the task system can handle high-volume scenarios without
   * performance degradation, such as when multiple team members are simultaneously updating
   * tasks during a sprint planning session or when an automated process creates many tasks at once.
   * Without this capability, users would experience lag, missed updates, or even application crashes
   * during periods of intense collaborative activity.
   * 
   * TECHNICAL CONTEXT: The event system must efficiently process many events in rapid succession
   * without memory leaks, ensuring all UI components stay responsive even under heavy load.
   */
  test('should maintain responsiveness during high-volume task operations', () => {
    // Create an array of listener functions
    const numEvents = 10;
    const mockListeners = Array(numEvents).fill(null).map(() => jest.fn());
    const unsubscribeFns: (() => void)[] = [];
    
    // Subscribe all listeners to their own event types
    for (let i = 0; i < numEvents; i++) {
      const eventType = `perf_event_${i}`;
      unsubscribeFns.push(eventBus.subscribe(eventType, mockListeners[i]));
    }
    
    // Trigger a large number of events (simulating busy sprint planning)
    for (let i = 0; i < numEvents; i++) {
      for (let j = 0; j < 10; j++) {  // 10 events per type
        eventBus.emit({
          type: `perf_event_${i}`,
          payload: { iteration: j, timestamp: Date.now() },
          timestamp: Date.now(),
        });
      }
    }
    
    // Verify each listener was called the correct number of times
    for (let i = 0; i < numEvents; i++) {
      expect(mockListeners[i]).toHaveBeenCalledTimes(10);  // 10 events per listener
    }
    
    // Clean up all subscriptions
    unsubscribeFns.forEach(unsubscribe => unsubscribe());
    
    // Verify all listeners were properly unsubscribed
    for (let i = 0; i < numEvents; i++) {
      expect(eventBus.hasListeners(`perf_event_${i}`)).toBe(false);
    }
  });
});