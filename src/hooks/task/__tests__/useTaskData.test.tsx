import { renderHook, act, waitFor } from '@testing-library/react';
import { useTaskData } from '../useTaskData';
import * as taskApiService from '@/services/taskApiService';
import taskSyncService from '@/services/taskSyncService';

// Mock dependencies
jest.mock('@/services/taskApiService');
jest.mock('@/services/taskSyncService', () => ({
  subscribe: jest.fn().mockReturnValue(jest.fn()),
  SyncEventType: {
    TASK_CREATED: 'TASK_CREATED',
    TASK_UPDATED: 'TASK_UPDATED',
    TASK_DELETED: 'TASK_DELETED'
  }
}));

describe('useTaskData hook', () => {
  // Mock tasks for testing
  const mockTasks = [
    {
      id: 'task1',
      title: 'Test Task 1',
      description: 'First test task',
      status: 'todo',
      priority: 'medium',
      project: 'project1',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-10T00:00:00Z'
    },
    {
      id: 'task2',
      title: 'Test Task 2',
      description: 'Second test task',
      status: 'in-progress',
      priority: 'high',
      project: 'project1',
      createdAt: '2025-01-05T00:00:00Z',
      updatedAt: '2025-01-05T00:00:00Z'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup API mock responses
    (taskApiService.getTasks as jest.Mock).mockResolvedValue(mockTasks);
  });

  test('initializes with loading state and empty tasks', () => {
    const { result } = renderHook(() => useTaskData());
    
    expect(result.current.loading).toBe(true);
    expect(result.current.tasks).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  test('loads tasks successfully from API', async () => {
    const { result } = renderHook(() => useTaskData());
    
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    expect(result.current.tasks).toHaveLength(mockTasks.length);
    expect(result.current.error).toBeNull();
    expect(taskApiService.getTasks).toHaveBeenCalled();
  });

  test('handles API errors properly', async () => {
    // Override the mock to simulate an error
    (taskApiService.getTasks as jest.Mock).mockRejectedValue(new Error('API error'));
    
    const { result } = renderHook(() => useTaskData());
    
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    expect(result.current.error).not.toBeNull();
  });

  test('refreshTasks method fetches tasks from API', async () => {
    const { result } = renderHook(() => useTaskData());
    
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Clear the mock and call refreshTasks
    (taskApiService.getTasks as jest.Mock).mockClear();
    
    await act(async () => {
      await result.current.refreshTasks();
    });
    
    expect(taskApiService.getTasks).toHaveBeenCalled();
  });

  test('handles real-time task created events', async () => {
    const { result } = renderHook(() => useTaskData());
    
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    const newTask = {
      id: 'task3',
      title: 'New Task',
      description: 'Real-time created task',
      status: 'todo',
      priority: 'high',
      project: 'project1',
      createdAt: '2025-01-20T00:00:00Z',
      updatedAt: '2025-01-20T00:00:00Z'
    };
    
    // Simulate a task creation event
    const subscribeCall = (taskSyncService.subscribe as jest.Mock).mock.calls.find(
      call => call[0] === 'TASK_CREATED'
    );
    
    if (subscribeCall && typeof subscribeCall[1] === 'function') {
      act(() => {
        subscribeCall[1]({ payload: newTask });
      });
      
      expect(result.current.tasks).toEqual(expect.arrayContaining([
        expect.objectContaining({ id: newTask.id })
      ]));
    }
  });

  test('handles real-time task updated events', async () => {
    const { result } = renderHook(() => useTaskData());
    
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    const updatedTask = {
      ...mockTasks[0],
      title: 'Updated Task Title',
      status: 'in-progress'
    };
    
    // Simulate a task update event
    const subscribeCall = (taskSyncService.subscribe as jest.Mock).mock.calls.find(
      call => call[0] === 'TASK_UPDATED'
    );
    
    if (subscribeCall && typeof subscribeCall[1] === 'function') {
      act(() => {
        subscribeCall[1]({ payload: updatedTask });
      });
      
      const hasUpdatedTask = result.current.tasks.some(task => 
        task.id === updatedTask.id && 
        task.title === updatedTask.title && 
        task.status === updatedTask.status
      );
      
      expect(hasUpdatedTask).toBe(true);
    }
  });

  test('handles real-time task deleted events', async () => {
    const { result } = renderHook(() => useTaskData());
    
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    const deletedTaskId = mockTasks[0].id;
    
    // Simulate a task deletion event
    const subscribeCall = (taskSyncService.subscribe as jest.Mock).mock.calls.find(
      call => call[0] === 'TASK_DELETED'
    );
    
    if (subscribeCall && typeof subscribeCall[1] === 'function') {
      act(() => {
        subscribeCall[1]({ payload: { id: deletedTaskId } });
      });
      
      const hasDeletedTask = result.current.tasks.some(task => task.id === deletedTaskId);
      expect(hasDeletedTask).toBe(false);
    }
  });

  test('cleans up subscriptions on unmount', () => {
    // Setup some unsubscribe mocks
    const unsubscribeMock1 = jest.fn();
    const unsubscribeMock2 = jest.fn();
    const unsubscribeMock3 = jest.fn();
    
    (taskSyncService.subscribe as jest.Mock)
      .mockReturnValueOnce(unsubscribeMock1)
      .mockReturnValueOnce(unsubscribeMock2)
      .mockReturnValueOnce(unsubscribeMock3);
    
    const { unmount } = renderHook(() => useTaskData());
    
    // Unmount to trigger cleanup
    unmount();
    
    expect(unsubscribeMock1).toHaveBeenCalled();
    expect(unsubscribeMock2).toHaveBeenCalled();
    expect(unsubscribeMock3).toHaveBeenCalled();
  });
});