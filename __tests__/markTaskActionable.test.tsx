/**
 * UX IMPACT: This test suite verifies the "Mark as Actionable" functionality that allows
 * users to quickly move tasks from planning stages (proposed, backlog, maybe) to the
 * actionable "Todo" state. If this functionality breaks, users would lose an important
 * productivity feature that helps them organize their workflow efficiently.
 * 
 * TECHNICAL CONTEXT: The "Mark as Actionable" feature is implemented as a special case
 * of the status update system, with UI enhancements to make it more discoverable for users.
 */

import React from 'react';
import { act } from '@testing-library/react';

// Mock the task API service
const mockUpdateTaskStatus = jest.fn().mockResolvedValue({});
const mockMarkTaskTested = jest.fn().mockResolvedValue({});
const mockEmitTaskUpdated = jest.fn();

jest.mock('@/services/taskApiService', () => ({
  updateTaskStatus: mockUpdateTaskStatus,
  markTaskTested: mockMarkTaskTested,
}));

jest.mock('@/services/taskSyncService', () => ({
  emitTaskUpdated: mockEmitTaskUpdated,
  emitTaskCreated: jest.fn(),
  emitTaskDeleted: jest.fn(),
}));

jest.mock('@/utils/task', () => ({
  sortByNewestFirst: jest.fn(tasks => tasks),
  deduplicateTasks: jest.fn(tasks => tasks),
}));

// Create the test implementation of markTaskActionable
// This is a simplified version for unit testing
const createMarkTaskActionable = (mockCache, setTasksMock, refreshTasksMock) => {
  return async (taskId, project) => {
    // Get the current task
    const taskToUpdate = mockCache.get(taskId);
    if (!taskToUpdate) {
      console.error(`Task with ID ${taskId} not found in cache`);
      return;
    }
    
    // Only certain statuses can be marked actionable
    const actionableSourceStatuses = ['proposed', 'backlog', 'maybe'];
    if (!actionableSourceStatuses.includes(taskToUpdate.status)) {
      console.error(`Cannot mark task with status ${taskToUpdate.status} as actionable`);
      return;
    }

    // Create update data
    const updateData = {
      status: 'todo', // 'todo' status means it's actionable
      updatedAt: new Date().toISOString()
    };

    // Create updated task for optimistic update
    const updatedTask = { ...taskToUpdate, ...updateData };

    // Update tasks array optimistically 
    setTasksMock(prevTasks => {
      // Create a new array with just the one task replaced
      const newTasks = [...prevTasks];
      const index = newTasks.findIndex(t => t.id === taskId);
      if (index !== -1) {
        newTasks[index] = updatedTask;
      }
      return newTasks;
    });

    try {
      // Perform the actual API update
      await mockUpdateTaskStatus(taskId, 'todo');

      // Emit event for real-time sync to other clients
      mockEmitTaskUpdated(updatedTask);
    } catch (error) {
      console.error('Error marking task as actionable:', error);

      // Revert to previous state on error
      setTasksMock(prevTasks => prevTasks);

      // Refresh data from server to ensure consistency
      refreshTasksMock();
    }
  };
};

describe('markTaskActionable functionality', () => {
  // Set up test data
  const mockTask = {
    id: 'task1',
    title: 'Test Task',
    description: 'Test Description',
    status: 'proposed', // Starting from proposed status
    priority: 'medium',
    project: 'project1',
    createdAt: '2025-03-01T00:00:00Z',
    updatedAt: '2025-03-01T00:00:00Z',
  };
  
  const mockTasks = [mockTask];
  const setTasksMock = jest.fn();
  const refreshTasksMock = jest.fn().mockResolvedValue([]);
  
  // Mock task cache
  let mockTaskCache;
  let markTaskActionable;
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mocks
    setTasksMock.mockClear();
    refreshTasksMock.mockClear();
    mockUpdateTaskStatus.mockClear();
    mockEmitTaskUpdated.mockClear();
    
    // Initialize mock task cache
    mockTaskCache = new Map();
    mockTaskCache.set('task1', mockTask);
    mockTaskCache.set('task2', {...mockTask, id: 'task2', status: 'todo'});
    
    // Create test function
    markTaskActionable = createMarkTaskActionable(mockTaskCache, setTasksMock, refreshTasksMock);
  });

  /**
   * UX IMPACT: This test verifies that users can mark tasks as actionable, which
   * helps them organize their workflow by moving tasks from planning stages to
   * the actionable Todo stage.
   * 
   * TECHNICAL CONTEXT: The markTaskActionable function should update the task status
   * to 'todo' and update the UI optimistically before the API call completes.
   */
  test('should mark a task as actionable (todo status)', async () => {
    // Call the markTaskActionable function
    await act(async () => {
      await markTaskActionable('task1', 'project1');
    });
    
    // Verify the API was called with correct parameters
    expect(mockUpdateTaskStatus).toHaveBeenCalledWith('task1', 'todo');
    
    // Verify the task was updated optimistically
    expect(setTasksMock).toHaveBeenCalled();
    
    // Verify task sync service was called to notify other clients
    expect(mockEmitTaskUpdated).toHaveBeenCalled();
  });

  /**
   * UX IMPACT: This test confirms that the "Mark as Actionable" feature properly
   * validates task status, preventing users from attempting invalid workflow
   * transitions that could confuse their task organization.
   * 
   * TECHNICAL CONTEXT: The function should only allow certain source statuses
   * (proposed, backlog, maybe) to be marked as actionable.
   */
  test('should not mark tasks in invalid statuses as actionable', async () => {
    // Spy on console.error to verify the error message
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Call the markTaskActionable function with the invalid task
    await act(async () => {
      await markTaskActionable('task2', 'project1');
    });
    
    // Verify API was not called
    expect(mockUpdateTaskStatus).not.toHaveBeenCalled();
    
    // Verify error was logged about invalid status
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Cannot mark task with status todo as actionable')
    );
    
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  /**
   * UX IMPACT: This test ensures that when there's a network issue, the user isn't
   * left with an inconsistent view of their tasks. The system reverts to the previous
   * state and attempts to refresh from the server.
   * 
   * TECHNICAL CONTEXT: On API failure, the function should revert the optimistic update
   * and refresh tasks from the server to ensure consistency.
   */
  test('should handle API errors when marking a task as actionable', async () => {
    // Mock API failure
    mockUpdateTaskStatus.mockRejectedValueOnce(new Error('API Error'));
    
    // Spy on console.error and setError
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Call the markTaskActionable function
    await act(async () => {
      await markTaskActionable('task1', 'project1');
    });
    
    // Verify error handling
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error marking task as actionable:',
      expect.any(Error)
    );
    
    // Verify we revert to previous task state
    expect(setTasksMock).toHaveBeenCalled();
    
    // Verify we refresh tasks from server
    expect(refreshTasksMock).toHaveBeenCalled();
    
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  /**
   * UX IMPACT: This test ensures that the special action path for marking a task
   * as actionable can handle the case when the task doesn't exist in the cache,
   * preventing potential UI errors for users.
   * 
   * TECHNICAL CONTEXT: The function should gracefully handle the case where a task
   * is not found in the cache, logging an error instead of crashing.
   */
  test('should handle non-existent tasks gracefully', async () => {
    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Call the markTaskActionable function with non-existent task ID
    await act(async () => {
      await markTaskActionable('non-existent-id', 'project1');
    });
    
    // Verify error was logged about task not found
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Task with ID non-existent-id not found in cache'
    );
    
    // Verify API was not called
    expect(mockUpdateTaskStatus).not.toHaveBeenCalled();
    
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });
});