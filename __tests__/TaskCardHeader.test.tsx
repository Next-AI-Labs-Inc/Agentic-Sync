import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskCardHeader from '@/components/TaskCard/TaskCardHeader';
import '@testing-library/jest-dom';

/**
 * UX IMPACT: These tests ensure that the task card header displays correctly and handles
 * various edge cases, especially when task data might be incomplete or undefined.
 * If these tests fail, users would experience errors when viewing task details,
 * particularly during loading states or with incomplete data.
 * 
 * TECHNICAL CONTEXT: The component must gracefully handle missing task IDs to prevent
 * the TypeError: Cannot read properties of undefined (reading 'substring') error
 * that was occurring when users clicked on task components.
 */
describe('TaskCardHeader', () => {
  // Mock the navigator.clipboard API
  const originalClipboard = { ...global.navigator.clipboard };
  
  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
      },
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      configurable: true,
    });
    jest.resetAllMocks();
  });

  /**
   * UX IMPACT: This test ensures that the task card header displays task information
   * correctly when all data is present, providing users with the expected information
   * about the task.
   */
  test('renders complete task information correctly', () => {
    const task = {
      id: '12345678abcdef',
      title: 'Test Task',
      status: 'in-progress' as const,
      priority: 'high' as const,
    };

    render(
      <TaskCardHeader
        task={task}
        isExpanded={false}
        onToggleExpand={jest.fn()}
      />
    );

    // Verify task title is displayed
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    
    // Verify truncated task ID is displayed (first 8 characters + ...)
    expect(screen.getByText('12345678...')).toBeInTheDocument();
    
    // Verify status badge is displayed
    expect(screen.getByText('in-progress')).toBeInTheDocument();
  });

  /**
   * UX IMPACT: This test ensures that the component handles missing task IDs gracefully,
   * preventing errors that would disrupt the user experience when viewing tasks with
   * incomplete data.
   */
  test('handles undefined task.id gracefully', () => {
    // Create a task without an ID
    const taskWithoutId = {
      id: undefined as unknown as string, // Force TypeScript to accept this
      title: 'Task Without ID',
      status: 'todo' as const,
      priority: 'medium' as const,
    };

    render(
      <TaskCardHeader
        task={taskWithoutId}
        isExpanded={false}
        onToggleExpand={jest.fn()}
      />
    );

    // Verify the fallback message is displayed
    expect(screen.getByText('ID unavailable')).toBeInTheDocument();
    
    // Verify copy buttons are disabled
    const copyButtons = screen.getAllByRole('button', { hidden: true });
    const idCopyButton = copyButtons.find(button => button.getAttribute('aria-label') === 'Copy task ID');
    const urlCopyButton = copyButtons.find(button => button.getAttribute('aria-label') === 'Copy task URL');
    
    expect(idCopyButton).toBeDisabled();
    expect(urlCopyButton).toBeDisabled();
  });

  /**
   * UX IMPACT: This test ensures that users can copy the task ID, which is important
   * for sharing or referencing tasks in other contexts.
   */
  test('copies task ID to clipboard when copy button is clicked', () => {
    const task = {
      id: '12345678abcdef',
      title: 'Test Task',
      status: 'in-progress' as const,
      priority: 'high' as const,
    };

    render(
      <TaskCardHeader
        task={task}
        isExpanded={false}
        onToggleExpand={jest.fn()}
      />
    );

    // Find and click the copy ID button
    const copyButtons = screen.getAllByRole('button', { hidden: true });
    const idCopyButton = copyButtons.find(button => button.getAttribute('aria-label') === 'Copy task ID')!;
    
    fireEvent.click(idCopyButton);
    
    // Verify clipboard API was called with the full task ID
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('12345678abcdef');
  });

  /**
   * UX IMPACT: This test ensures that users can copy the task URL, which is crucial
   * for sharing direct links to specific tasks.
   */
  test('copies task URL to clipboard when URL button is clicked', () => {
    const task = {
      id: '12345678abcdef',
      title: 'Test Task',
      status: 'in-progress' as const,
      priority: 'high' as const,
    };

    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'http://localhost:3000',
      },
      writable: true,
    });

    render(
      <TaskCardHeader
        task={task}
        isExpanded={false}
        onToggleExpand={jest.fn()}
      />
    );

    // Find and click the copy URL button
    const copyButtons = screen.getAllByRole('button', { hidden: true });
    const urlCopyButton = copyButtons.find(button => button.getAttribute('aria-label') === 'Copy task URL')!;
    
    fireEvent.click(urlCopyButton);
    
    // Verify clipboard API was called with the expected URL
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('http://localhost:3000/task-detail?id=12345678abcdef');
  });

  /**
   * UX IMPACT: This test ensures that the expand/collapse functionality works correctly,
   * allowing users to control how much task information is displayed at once.
   */
  test('calls onToggleExpand when expand button is clicked', () => {
    const task = {
      id: '12345678abcdef',
      title: 'Test Task',
      status: 'in-progress' as const,
      priority: 'high' as const,
    };
    
    const mockToggleExpand = jest.fn();

    render(
      <TaskCardHeader
        task={task}
        isExpanded={false}
        onToggleExpand={mockToggleExpand}
      />
    );

    // Find and click the expand button
    const expandButton = screen.getByLabelText('Expand task');
    fireEvent.click(expandButton);
    
    // Verify the callback was called
    expect(mockToggleExpand).toHaveBeenCalledTimes(1);
  });

  /**
   * UX IMPACT: This test ensures that users can edit task titles, which is important
   * for correcting or updating task information.
   */
  test('allows editing task title when edit button is clicked', async () => {
    const task = {
      id: '12345678abcdef',
      title: 'Original Title',
      status: 'todo' as const,
      priority: 'medium' as const,
    };
    
    const mockTitleEdit = jest.fn().mockResolvedValue(undefined);

    render(
      <TaskCardHeader
        task={task}
        isExpanded={false}
        onToggleExpand={jest.fn()}
        onTitleEdit={mockTitleEdit}
      />
    );

    // Initially, the title should be displayed
    expect(screen.getByText('Original Title')).toBeInTheDocument();
    
    // Find and click the edit button (it's only visible on hover, so it's harder to target)
    const editButton = screen.getByTitle('Edit title');
    fireEvent.click(editButton);
    
    // Input should now be visible
    const titleInput = screen.getByDisplayValue('Original Title');
    expect(titleInput).toBeInTheDocument();
    
    // Change the title
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
    expect(screen.getByDisplayValue('Updated Title')).toBeInTheDocument();
    
    // Save the title
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    // Verify the callback was called with the right arguments
    expect(mockTitleEdit).toHaveBeenCalledWith('12345678abcdef', 'Updated Title');
  });

  /**
   * UX IMPACT: This test ensures that all priority levels display correctly,
   * providing users with clear visual indicators of task priority.
   */
  test.each([
    ['high', 'High Priority', 'bg-red-500'],
    ['medium', 'Medium Priority', 'bg-yellow-500'],
    ['low', 'Low Priority', 'bg-green-500'],
  ])('displays correct priority indicator for %s priority', (priority, title, bgClass) => {
    const task = {
      id: '12345678abcdef',
      title: 'Test Task',
      status: 'todo' as const,
      priority: priority as 'high' | 'medium' | 'low',
    };

    render(
      <TaskCardHeader
        task={task}
        isExpanded={false}
        onToggleExpand={jest.fn()}
      />
    );

    // Find priority indicator
    const priorityIndicator = screen.getByTitle(title);
    expect(priorityIndicator).toBeInTheDocument();
    expect(priorityIndicator).toHaveClass(bgClass);
  });
});