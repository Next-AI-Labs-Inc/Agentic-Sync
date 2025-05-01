import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskCard from '@/components/TaskCard';
import '@testing-library/jest-dom';

/**
 * UX IMPACT: These tests ensure that the entire TaskCard component works correctly and
 * handles edge cases gracefully. The TaskCard is the primary interface for users to view
 * and interact with tasks, so any failures would significantly impact the user experience.
 * 
 * TECHNICAL CONTEXT: The component must handle various task data structures, including
 * those with missing or undefined fields, without causing errors or crashes.
 */
describe('TaskCard', () => {
  // Mock functions for the required props
  const mockStatusChange = jest.fn().mockResolvedValue(undefined);
  const mockMarkTested = jest.fn().mockResolvedValue(undefined);
  const mockDelete = jest.fn().mockResolvedValue(undefined);
  
  // Reset mocks between tests
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * UX IMPACT: This test ensures that the task card displays correctly with complete data,
   * showing all the essential information that users need to understand a task.
   */
  test('renders complete task information correctly', () => {
    const task = {
      id: '12345678abcdef',
      title: 'Test Task',
      description: 'This is a test task description',
      userImpact: 'This impacts test users',
      requirements: '- Requirement 1\n- Requirement 2',
      technicalPlan: '1. Step 1\n2. Step 2',
      status: 'in-progress' as const,
      priority: 'high' as const,
      project: 'test-project',
      initiative: 'Test Initiative',
      tags: ['test', 'task'],
      createdAt: '2025-03-01T00:00:00Z',
      updatedAt: '2025-03-02T00:00:00Z',
    };

    render(
      <TaskCard
        task={task}
        onStatusChange={mockStatusChange}
        onMarkTested={mockMarkTested}
        onDelete={mockDelete}
      />
    );

    // Verify key task information is displayed
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText(/This is a test task description/i)).toBeInTheDocument();
    expect(screen.getByText('in-progress')).toBeInTheDocument();
    
    // Verify task ID is displayed (truncated to first 8 chars)
    expect(screen.getByText('12345678...')).toBeInTheDocument();
  });

  /**
   * UX IMPACT: This test ensures that the component handles tasks with missing data
   * gracefully, preventing errors that would disrupt the user experience.
   */
  test('handles task with missing data gracefully', () => {
    // Create a minimal task with only required fields
    const minimalTask = {
      id: '12345678abcdef',
      title: 'Minimal Task',
      status: 'todo' as const,
      priority: 'medium' as const,
      project: 'test-project',
      createdAt: '2025-03-01T00:00:00Z',
      updatedAt: '2025-03-01T00:00:00Z',
    };

    render(
      <TaskCard
        task={minimalTask}
        onStatusChange={mockStatusChange}
        onMarkTested={mockMarkTested}
        onDelete={mockDelete}
      />
    );

    // Verify the task title is displayed
    expect(screen.getByText('Minimal Task')).toBeInTheDocument();
    
    // Verify the task ID is displayed
    expect(screen.getByText('12345678...')).toBeInTheDocument();
  });

  /**
   * UX IMPACT: This test ensures that the component handles the extreme edge case of
   * a task with an undefined ID without crashing, allowing users to still view other
   * task information even when the ID is missing.
   */
  test('handles task with undefined ID gracefully', () => {
    // Create a task with undefined ID
    const taskWithoutId = {
      id: undefined as unknown as string, // Force TypeScript to accept this
      title: 'Task Without ID',
      status: 'todo' as const,
      priority: 'low' as const,
      project: 'test-project',
      createdAt: '2025-03-01T00:00:00Z',
      updatedAt: '2025-03-01T00:00:00Z',
    };

    render(
      <TaskCard
        task={taskWithoutId}
        onStatusChange={mockStatusChange}
        onMarkTested={mockMarkTested}
        onDelete={mockDelete}
      />
    );

    // Verify the task title is displayed
    expect(screen.getByText('Task Without ID')).toBeInTheDocument();
    
    // Verify the fallback message for missing ID is displayed
    expect(screen.getByText('ID unavailable')).toBeInTheDocument();
  });

  /**
   * UX IMPACT: This test ensures that the expand/collapse functionality works correctly,
   * allowing users to control how much task information is displayed at once.
   */
  test('expands and collapses when clicked', () => {
    const task = {
      id: '12345678abcdef',
      title: 'Expandable Task',
      description: 'This is a test task description',
      requirements: '- Must be expandable\n- Must be collapsible',
      technicalPlan: '1. Implement expand\n2. Implement collapse',
      status: 'todo' as const,
      priority: 'medium' as const,
      project: 'test-project',
      createdAt: '2025-03-01T00:00:00Z',
      updatedAt: '2025-03-01T00:00:00Z',
    };

    render(
      <TaskCard
        task={task}
        onStatusChange={mockStatusChange}
        onMarkTested={mockMarkTested}
        onDelete={mockDelete}
      />
    );

    // Initially, detailed content should not be visible
    expect(screen.queryByText(/Implement expand/)).not.toBeInTheDocument();
    
    // Find and click the task card to expand it
    const taskCard = screen.getByText('Expandable Task').closest('.task-card');
    fireEvent.click(taskCard as HTMLElement);
    
    // Now detailed content should be visible
    expect(screen.getByText(/Implement expand/)).toBeInTheDocument();
    
    // Click again to collapse
    fireEvent.click(taskCard as HTMLElement);
    
    // Detailed content should no longer be visible
    expect(screen.queryByText(/Implement expand/)).not.toBeInTheDocument();
  });

  /**
   * UX IMPACT: This test ensures that status changes work correctly, which is critical
   * for users to track task progress through the workflow.
   */
  test('calls onStatusChange when status button is clicked', async () => {
    const task = {
      id: '12345678abcdef',
      title: 'Status Change Task',
      status: 'todo' as const,
      priority: 'high' as const,
      project: 'test-project',
      createdAt: '2025-03-01T00:00:00Z',
      updatedAt: '2025-03-01T00:00:00Z',
    };

    render(
      <TaskCard
        task={task}
        onStatusChange={mockStatusChange}
        onMarkTested={mockMarkTested}
        onDelete={mockDelete}
      />
    );

    // Find and click a status change button (e.g., "Start" to move from todo to in-progress)
    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);
    
    // Verify onStatusChange was called with correct parameters
    expect(mockStatusChange).toHaveBeenCalledWith('12345678abcdef', 'test-project', 'in-progress');
  });

  /**
   * UX IMPACT: This test ensures that clicking interactive elements within the task card
   * doesn't accidentally trigger the expand/collapse function, which would disrupt the user's
   * interaction with those elements.
   */
  test('clicking interactive elements does not expand/collapse the card', () => {
    const task = {
      id: '12345678abcdef',
      title: 'Interactive Elements Task',
      status: 'in-progress' as const,
      priority: 'medium' as const,
      project: 'test-project',
      createdAt: '2025-03-01T00:00:00Z',
      updatedAt: '2025-03-01T00:00:00Z',
    };

    render(
      <TaskCard
        task={task}
        onStatusChange={mockStatusChange}
        onMarkTested={mockMarkTested}
        onDelete={mockDelete}
      />
    );

    // Initially, the card should not be expanded
    const taskCard = screen.getByText('Interactive Elements Task').closest('.task-card');
    expect(taskCard).not.toHaveClass('expanded');
    
    // Find and click a button (e.g., a status change button)
    const statusButton = screen.getByText('Complete');
    fireEvent.click(statusButton);
    
    // The card should still not be expanded
    expect(taskCard).not.toHaveClass('expanded');
    
    // And the status change function should have been called
    expect(mockStatusChange).toHaveBeenCalled();
  });

  /**
   * UX IMPACT: This test verifies that tasks with the _isNew flag show the appropriate
   * animation, providing users with visual feedback when new tasks are added.
   */
  test('applies "new-task" class for tasks with _isNew flag', () => {
    const newTask = {
      id: '12345678abcdef',
      title: 'Brand New Task',
      status: 'proposed' as const,
      priority: 'high' as const,
      project: 'test-project',
      createdAt: '2025-03-01T00:00:00Z',
      updatedAt: '2025-03-01T00:00:00Z',
      _isNew: true,
    };

    render(
      <TaskCard
        task={newTask}
        onStatusChange={mockStatusChange}
        onMarkTested={mockMarkTested}
        onDelete={mockDelete}
      />
    );

    // The task card should have the "new-task" class
    const taskCard = screen.getByText('Brand New Task').closest('.task-card');
    expect(taskCard).toHaveClass('new-task');
  });
});