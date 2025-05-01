import taskSyncService, { SyncEventType } from '@/services/taskSyncService';

describe('TaskSyncService', () => {
  let mockListener1: jest.Mock;
  let mockListener2: jest.Mock;
  
  beforeEach(() => {
    // Reset the service before each test
    taskSyncService.shutdown();
    taskSyncService.init();
    
    // Create mock listeners
    mockListener1 = jest.fn();
    mockListener2 = jest.fn();
  });
  
  afterEach(() => {
    // Clean up after tests
    taskSyncService.shutdown();
  });

  test('should allow subscribing to events', () => {
    // Subscribe to event
    const unsubscribe = taskSyncService.subscribe(SyncEventType.TASK_CREATED, mockListener1);
    
    // Verify unsubscribe is a function
    expect(typeof unsubscribe).toBe('function');
  });

  test('should emit task created events', () => {
    // Subscribe to event
    taskSyncService.subscribe(SyncEventType.TASK_CREATED, mockListener1);
    
    // Create mock task
    const mockTask = { id: 'task1', title: 'Test Task' };
    
    // Emit event
    taskSyncService.emitTaskCreated(mockTask);
    
    // Verify listener was called with correct event
    expect(mockListener1).toHaveBeenCalledTimes(1);
    expect(mockListener1).toHaveBeenCalledWith(
      expect.objectContaining({
        type: SyncEventType.TASK_CREATED,
        payload: mockTask
      })
    );
  });

  test('should emit task updated events', () => {
    // Subscribe to event
    taskSyncService.subscribe(SyncEventType.TASK_UPDATED, mockListener1);
    
    // Create mock task
    const mockTask = { id: 'task1', title: 'Test Task' };
    
    // Emit event
    taskSyncService.emitTaskUpdated(mockTask);
    
    // Verify listener was called with correct event
    expect(mockListener1).toHaveBeenCalledTimes(1);
    expect(mockListener1).toHaveBeenCalledWith(
      expect.objectContaining({
        type: SyncEventType.TASK_UPDATED,
        payload: mockTask
      })
    );
  });

  test('should emit task deleted events', () => {
    // Subscribe to event
    taskSyncService.subscribe(SyncEventType.TASK_DELETED, mockListener1);
    
    // Emit event
    taskSyncService.emitTaskDeleted('task1', 'project1');
    
    // Verify listener was called with correct event
    expect(mockListener1).toHaveBeenCalledTimes(1);
    expect(mockListener1).toHaveBeenCalledWith(
      expect.objectContaining({
        type: SyncEventType.TASK_DELETED,
        payload: { id: 'task1', project: 'project1' }
      })
    );
  });

  test('should handle unsubscribing correctly', () => {
    // Subscribe to event
    const unsubscribe = taskSyncService.subscribe(SyncEventType.TASK_UPDATED, mockListener1);
    
    // Create mock task
    const mockTask = { id: 'task1', title: 'Test Task' };
    
    // Emit event
    taskSyncService.emitTaskUpdated(mockTask);
    
    // Verify listener was called
    expect(mockListener1).toHaveBeenCalledTimes(1);
    
    // Reset mock
    mockListener1.mockClear();
    
    // Unsubscribe
    unsubscribe();
    
    // Emit another event
    taskSyncService.emitTaskUpdated(mockTask);
    
    // Verify listener was not called after unsubscribing
    expect(mockListener1).not.toHaveBeenCalled();
  });

  test('should not leak memory when shutdown is called', () => {
    // Subscribe to events
    taskSyncService.subscribe(SyncEventType.TASK_CREATED, mockListener1);
    taskSyncService.subscribe(SyncEventType.TASK_UPDATED, mockListener2);
    
    // Shutdown service
    taskSyncService.shutdown();
    
    // Create mock task
    const mockTask = { id: 'task1', title: 'Test Task' };
    
    // Emit events
    taskSyncService.emitTaskCreated(mockTask);
    taskSyncService.emitTaskUpdated(mockTask);
    
    // Verify no listeners were called
    expect(mockListener1).not.toHaveBeenCalled();
    expect(mockListener2).not.toHaveBeenCalled();
  });
});