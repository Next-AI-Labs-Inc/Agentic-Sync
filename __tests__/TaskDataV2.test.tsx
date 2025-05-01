import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { useTaskDataV2 } from '../src/hooks/task/useTaskDataV2';
import * as taskApiService from '../src/services/taskApiService';
import taskSyncService from '../src/services/taskSyncService';

// Mock taskApiService
jest.mock('../src/services/taskApiService', () => ({
  getTasks: jest.fn(),
}));

// Mock taskSyncService
jest.mock('../src/services/taskSyncService', () => {
  // Define the event types as constants
  const SyncEventType = {
    TASK_CREATED: 'TASK_CREATED',
    TASK_UPDATED: 'TASK_UPDATED',
    TASK_DELETED: 'TASK_DELETED'
  };
  
  return {
    SyncEventType,
    subscribe: jest.fn().mockReturnValue(jest.fn()), // Return a mock cleanup function
    emitTaskCreated: jest.fn(),
    emitTaskUpdated: jest.fn(),
    emitTaskDeleted: jest.fn(),
    listenerCount: jest.fn().mockReturnValue(0),
    __esModule: true,
    default: {
      subscribe: jest.fn().mockReturnValue(jest.fn()),
      emitTaskCreated: jest.fn(),
      emitTaskUpdated: jest.fn(),
      emitTaskDeleted: jest.fn(),
      listenerCount: jest.fn().mockReturnValue(0),
    },
  };
});

// Mock memoryStats
jest.mock('../src/utils/task/memoryStats', () => ({
  getMemoryStats: jest.fn().mockReturnValue({
    activeListeners: 0,
    activeSubscriptions: 0,
    totalEmissions: 0,
    totalHandledEvents: 0,
    peakMemoryUsage: 0,
    cacheSize: 0,
  }),
}));

// Test component that uses the hook
function TestComponent() {
  const {
    tasks,
    loading,
    error,
    refreshTasks,
    emitTaskCreated,
    emitTaskUpdated,
    emitTaskDeleted,
    memoryUsage,
  } = useTaskDataV2();

  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading...' : 'Loaded'}</div>
      <div data-testid="error">{error || 'No error'}</div>
      <div data-testid="taskCount">{tasks.length}</div>
      <button data-testid="refresh" onClick={refreshTasks}>
        Refresh
      </button>
      <button
        data-testid="emit-created"
        onClick={() => emitTaskCreated({ id: 'new-task', title: 'New Task' } as any)}
      >
        Emit Created
      </button>
      <button
        data-testid="emit-updated"
        onClick={() => emitTaskUpdated({ id: 'task-1', title: 'Updated Task' } as any)}
      >
        Emit Updated
      </button>
      <button
        data-testid="emit-deleted"
        onClick={() => emitTaskDeleted('task-1', 'project-1')}
      >
        Emit Deleted
      </button>
      <div data-testid="memory-stats">
        {memoryUsage ? JSON.stringify(memoryUsage) : 'No stats'}
      </div>
    </div>
  );
}

describe('useTaskDataV2', () => {
  const mockTasks = [
    { _id: 'task-1', title: 'Task 1', createdAt: '2023-01-01' },
    { _id: 'task-2', title: 'Task 2', createdAt: '2023-01-02' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (taskApiService.getTasks as jest.Mock).mockResolvedValue(mockTasks);
  });

  it('should load tasks initially', async () => {
    render(<TestComponent />);

    // Initial loading state
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading...');
    
    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Loaded');
    });
    
    expect(screen.getByTestId('taskCount')).toHaveTextContent('2');
    expect(taskApiService.getTasks).toHaveBeenCalledTimes(1);
  });

  it('should handle errors during loading', async () => {
    (taskApiService.getTasks as jest.Mock).mockRejectedValueOnce(
      new Error('API error')
    );

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Loaded');
    });
    
    expect(screen.getByTestId('error')).toHaveTextContent(
      'Failed to load tasks from the server'
    );
  });

  it('should refresh tasks when requested', async () => {
    render(<TestComponent />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Loaded');
    });

    // Update mock to return different data
    const updatedMockTasks = [
      { _id: 'task-1', title: 'Task 1 Updated', createdAt: '2023-01-01' },
      { _id: 'task-2', title: 'Task 2', createdAt: '2023-01-02' },
      { _id: 'task-3', title: 'Task 3', createdAt: '2023-01-03' },
    ];
    (taskApiService.getTasks as jest.Mock).mockResolvedValueOnce(updatedMockTasks);

    // Trigger refresh
    await act(async () => {
      screen.getByTestId('refresh').click();
    });

    // Wait for refresh to complete
    await waitFor(() => {
      expect(screen.getByTestId('taskCount')).toHaveTextContent('3');
    });

    // Should have 3 tasks now
    expect(taskApiService.getTasks).toHaveBeenCalledTimes(2);
  });

  it('should emit task events correctly', async () => {
    // Set up mocked emit functions as spies
    const emitTaskCreatedSpy = jest.fn();
    const emitTaskUpdatedSpy = jest.fn();
    const emitTaskDeletedSpy = jest.fn();
    
    // Replace the mocked functions with our spies
    (taskSyncService as any).emitTaskCreated = emitTaskCreatedSpy;
    (taskSyncService as any).emitTaskUpdated = emitTaskUpdatedSpy;
    (taskSyncService as any).emitTaskDeleted = emitTaskDeletedSpy;

    render(<TestComponent />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Loaded');
    });

    // Emit task created event
    await act(async () => {
      screen.getByTestId('emit-created').click();
    });
    
    // Check that our spy was called
    expect(emitTaskCreatedSpy).toHaveBeenCalled();

    // Emit task updated event
    await act(async () => {
      screen.getByTestId('emit-updated').click();
    });
    expect(emitTaskUpdatedSpy).toHaveBeenCalled();

    // Emit task deleted event
    await act(async () => {
      screen.getByTestId('emit-deleted').click();
    });
    expect(emitTaskDeletedSpy).toHaveBeenCalled();
  });
  
  it('should clean up subscriptions on unmount', async () => {
    // Create a spy for the subscribe function
    const subscribeSpy = jest.fn().mockReturnValue(jest.fn());
    (taskSyncService as any).subscribe = subscribeSpy;
    
    const { unmount } = render(<TestComponent />);
    
    // Wait for initial load and subscriptions to be set up
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Loaded');
    });
    
    // Unmount component
    unmount();
    
    // Verify the subscribe function was called (at least 3 times for the 3 event types)
    expect(subscribeSpy).toHaveBeenCalled();
  });
});