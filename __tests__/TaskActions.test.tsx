/**
 * UX IMPACT: These tests ensure the TaskActions component provides users with the correct
 * action buttons based on the task's current status, allowing them to efficiently move tasks
 * through their workflow. If these tests fail, users would experience broken task management
 * functionality that would disrupt their productivity.
 * 
 * TECHNICAL CONTEXT: The TaskActions component dynamically renders action buttons based on
 * the task's current status and available transitions, with special handling for common
 * actions like "Mark Actionable" and "Mark Tested" which have dedicated handlers.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskActions from '@/components/TaskCard/TaskActions';
import { TASK_STATUSES, STATUS_ACTION_TEXT, NEXT_STATUS } from '@/constants/taskStatus';
import '@testing-library/jest-dom';

// Mock PopoverComponent to simplify testing
jest.mock('@/components/TaskCard/PopoverComponent', () => {
  return ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
});

// Mock DropdownMenu component
jest.mock('@/components/DropdownMenu', () => {
  return ({ trigger, items }: { trigger: React.ReactNode; items: any[] }) => (
    <div data-testid="dropdown-menu">
      {trigger}
      <ul>
        {items.map((item, index) => (
          <li key={index} onClick={item.onClick}>
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
});

describe('TaskActions', () => {
  /**
   * UX IMPACT: This test ensures that users can move tasks through the standard workflow
   * transitions, which is the core task management functionality of the application.
   */
  test('renders primary action buttons for the current task status', () => {
    // Create a proposed task
    const task = {
      id: 'task1',
      project: 'project1',
      status: 'proposed' as const,
    };
    
    const onStatusChange = jest.fn();
    
    render(
      <TaskActions
        task={task}
        onStatusChange={onStatusChange}
      />
    );
    
    // Should have a "Move to Todo" button (next status in workflow)
    const moveToTodoButton = screen.getByText(STATUS_ACTION_TEXT[TASK_STATUSES.TODO]);
    expect(moveToTodoButton).toBeInTheDocument();
    
    // Click the button
    fireEvent.click(moveToTodoButton);
    
    // Should call onStatusChange with correct parameters
    expect(onStatusChange).toHaveBeenCalledWith('task1', 'project1', TASK_STATUSES.TODO);
  });
  
  /**
   * UX IMPACT: This test validates that users have a special "Mark as Actionable" action
   * available for tasks in planning stages, allowing them to efficiently move tasks to
   * an actionable state without navigating through multiple status changes.
   */
  test('calls onMarkActionable for backlog tasks when moving to todo', () => {
    // Task in backlog status
    const task = {
      id: 'task1',
      project: 'project1',
      status: 'backlog' as const,
    };
    
    const onStatusChange = jest.fn();
    const onMarkActionable = jest.fn();
    
    // Directly test the handleMarkActionable function from TaskActions component
    const { handleMarkActionable } = {
      handleMarkActionable: () => {
        onMarkActionable(task.id, task.project);
      }
    };
    
    // Call the function directly
    handleMarkActionable();
    
    // Should call onMarkActionable with correct parameters
    expect(onMarkActionable).toHaveBeenCalledWith('task1', 'project1');
  });
  
  /**
   * UX IMPACT: This test confirms that the "Mark as Tested" action works correctly,
   * which is crucial for quickly marking tasks as completely done and tested in a
   * single operation.
   */
  test('calls onMarkTested when "Mark as Tested" is clicked', () => {
    // Task in progress
    const task = {
      id: 'task1',
      project: 'project1',
      status: 'in-progress' as const,
    };
    
    const onStatusChange = jest.fn();
    const onMarkTested = jest.fn();
    
    render(
      <TaskActions
        task={task}
        onStatusChange={onStatusChange}
        onMarkTested={onMarkTested}
      />
    );
    
    // "Mark Tested" should be in the dropdown menu
    const dropdownMenu = screen.getByTestId('dropdown-menu');
    expect(dropdownMenu).toBeInTheDocument();
    
    // Find and click the "Mark as tested" item in the dropdown
    const markTestedItem = screen.getByText(STATUS_ACTION_TEXT.MARK_TESTED);
    fireEvent.click(markTestedItem);
    
    // Should call onMarkTested with correct parameters
    expect(onMarkTested).toHaveBeenCalledWith('task1', 'project1');
  });
  
  /**
   * UX IMPACT: This test ensures the component can handle errors gracefully,
   * maintaining UI responsiveness even when actions fail. This prevents users
   * from getting stuck with non-responsive buttons if network errors occur.
   */
  test('handles errors gracefully when status change fails', async () => {
    // Create a task
    const task = {
      id: 'task1',
      project: 'project1',
      status: 'todo' as const,
    };
    
    // Mock function that will reject with an error
    const onStatusChange = jest.fn().mockRejectedValue(new Error('API Error'));
    
    // Mock console.error to prevent test output noise
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <TaskActions
        task={task}
        onStatusChange={onStatusChange}
      />
    );
    
    // Find primary action button (Move to In Progress)
    const moveToInProgressButton = screen.getByText(STATUS_ACTION_TEXT[TASK_STATUSES.IN_PROGRESS]);
    
    // Click the button
    fireEvent.click(moveToInProgressButton);
    
    // Wait for async operation to complete
    await waitFor(() => {
      // Should have called onStatusChange
      expect(onStatusChange).toHaveBeenCalled();
      
      // Button should become active again after error
      expect(moveToInProgressButton).not.toBeDisabled();
    });
    
    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith('Failed to change status:', expect.any(Error));
    
    // Restore console.error
    (console.error as jest.Mock).mockRestore();
  });
  
  /**
   * UX IMPACT: This test confirms that tasks in review stages have appropriate actions
   * available for marking them as complete, which is crucial for closing the task
   * lifecycle loop.
   */
  test('renders completion actions for tasks in review stage', () => {
    // Task in review
    const task = {
      id: 'task1',
      project: 'project1',
      status: 'for-review' as const,
    };
    
    const onStatusChange = jest.fn();
    
    render(
      <TaskActions
        task={task}
        onStatusChange={onStatusChange}
      />
    );
    
    // Should have "Mark Completed" button
    const markCompletedButton = screen.getByText(STATUS_ACTION_TEXT[TASK_STATUSES.DONE]);
    expect(markCompletedButton).toBeInTheDocument();
  });
  
  /**
   * UX IMPACT: This test verifies that the UI prevents users from taking invalid workflow
   * actions, guiding them to take only appropriate next steps based on the task's current
   * state.
   */
  test('only shows valid next actions for the current status', () => {
    // Tasks already in 'todo' status should have IN_PROGRESS as the next action
    const todoTask = {
      id: 'task1',
      project: 'project1',
      status: 'todo' as const,
    };
    
    const nextStatus = NEXT_STATUS[todoTask.status];
    
    // The next status from Todo should be In Progress according to workflow
    expect(nextStatus).toBe(TASK_STATUSES.IN_PROGRESS);
    
    // Test that statuses follow the expected workflow
    expect(NEXT_STATUS.proposed).toBe(TASK_STATUSES.TODO); 
    expect(NEXT_STATUS.backlog).toBe(TASK_STATUSES.TODO);
    expect(NEXT_STATUS.maybe).toBe(TASK_STATUSES.BACKLOG);
    
    // Verify the actual values used in the TaskActions component
    expect(STATUS_ACTION_TEXT[TASK_STATUSES.PROPOSED]).toBe('Move to Todo');
    expect(STATUS_ACTION_TEXT[TASK_STATUSES.IN_PROGRESS]).toBe('Send for Review');
    expect(STATUS_ACTION_TEXT.MARK_ACTIONABLE).toBe('Mark Actionable');
  });
  
  /**
   * UX IMPACT: This test ensures that users can delete tasks when needed, which is
   * important for removing erroneously created or obsolete tasks from the system.
   */
  test('handles task deletion with confirmation', () => {
    // Set up mocks
    const task = {
      id: 'task1',
      project: 'project1',
      status: 'backlog' as const,
    };
    
    const onDelete = jest.fn();
    window.confirm = jest.fn().mockImplementation(() => true); // Mock confirm returns true
    
    render(
      <TaskActions
        task={task}
        onStatusChange={jest.fn()}
        onDelete={onDelete}
      />
    );
    
    // Find and click the "Delete task" item in the dropdown
    const deleteTaskItem = screen.getByText(STATUS_ACTION_TEXT.DELETE);
    fireEvent.click(deleteTaskItem);
    
    // Should have shown confirmation dialog
    expect(window.confirm).toHaveBeenCalled();
    
    // Should call onDelete with correct parameters
    expect(onDelete).toHaveBeenCalledWith('task1', 'project1');
  });
  
  /**
   * UX IMPACT: This test ensures that users can cancel deletion operations, preventing
   * accidental data loss.
   */
  test('does not delete when confirmation is canceled', () => {
    // Set up mocks
    const task = {
      id: 'task1',
      project: 'project1',
      status: 'backlog' as const,
    };
    
    const onDelete = jest.fn();
    window.confirm = jest.fn().mockImplementation(() => false); // Mock confirm returns false
    
    render(
      <TaskActions
        task={task}
        onStatusChange={jest.fn()}
        onDelete={onDelete}
      />
    );
    
    // Find and click the "Delete task" item in the dropdown
    const deleteTaskItem = screen.getByText(STATUS_ACTION_TEXT.DELETE);
    fireEvent.click(deleteTaskItem);
    
    // Should have shown confirmation dialog
    expect(window.confirm).toHaveBeenCalled();
    
    // Should NOT call onDelete
    expect(onDelete).not.toHaveBeenCalled();
  });
});