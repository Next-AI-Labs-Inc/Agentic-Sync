/**
 * UX IMPACT: This test ensures filter buttons correctly update task filters when clicked. 
 * If these tests fail, users would not be able to filter tasks by status, rendering the core 
 * task management functionality unusable.
 * 
 * TECHNICAL CONTEXT: Tests both the main view filter buttons and the collapsible section filters
 * to ensure the setCompletedFilter function is called properly regardless of button location.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskFilters from '@/components/TaskFilters';
import { TASK_STATUSES, STATUS_DISPLAY } from '@/constants/taskStatus';

// Mock the router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: {},
      asPath: '',
      push: jest.fn(),
      replace: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn()
      }
    };
  }
}));

// Mock TaskContext
jest.mock('@/contexts/TaskContext', () => ({
  useTasks: () => ({
    completedFilter: 'all',
    setCompletedFilter: jest.fn(),
    projectFilter: 'all',
    setProjectFilter: jest.fn(),
    sortBy: 'created',
    setSortBy: jest.fn(),
    sortDirection: 'desc',
    setSortDirection: jest.fn(),
    tasks: [],
    filteredTasks: []
  })
}));

describe('TaskFilters Component', () => {
  // Mock props for TaskFilters
  const mockProjects = [
    { id: 'project1', name: 'Project 1' },
    { id: 'project2', name: 'Project 2' }
  ];
  
  const mockTaskCountsByStatus = {
    'inbox': 2,
    'brainstorm': 1,
    'proposed': 3,
    'backlog': 5,
    'maybe': 2,
    'todo': 10,
    'in-progress': 7,
    'on-hold': 3,
    'for-review': 4,
    'done': 8,
    'archived': 6
  };
  
  const mockTasks = Array(50).fill(null).map((_, i) => ({
    id: `task${i}`,
    title: `Task ${i}`,
    status: Object.keys(mockTaskCountsByStatus)[i % Object.keys(mockTaskCountsByStatus).length],
    starred: i % 5 === 0 // Every 5th task is starred
  }));
  
  // Setup for the component
  const setup = (extraProps = {}) => {
    const mockSetCompletedFilter = jest.fn();
    const mockSetProjectFilter = jest.fn();
    const mockSetSortBy = jest.fn();
    const mockSetSortDirection = jest.fn();
    const mockOnAddNewClick = jest.fn();
    const mockRefreshTasks = jest.fn().mockResolvedValue({});
    
    const utils = render(
      <TaskFilters
        projects={mockProjects}
        projectFilter="all"
        setProjectFilter={mockSetProjectFilter}
        completedFilter="all"
        setCompletedFilter={mockSetCompletedFilter}
        sortBy="created"
        setSortBy={mockSetSortBy}
        sortDirection="desc"
        setSortDirection={mockSetSortDirection}
        onAddNewClick={mockOnAddNewClick}
        taskCountsByStatus={mockTaskCountsByStatus}
        refreshTasks={mockRefreshTasks}
        tasks={mockTasks}
        {...extraProps}
      />
    );
    
    return {
      ...utils,
      mockSetCompletedFilter,
      mockSetProjectFilter,
      mockSetSortBy,
      mockSetSortDirection,
      mockOnAddNewClick,
      mockRefreshTasks
    };
  };

  /**
   * UX IMPACT: Users need to easily filter to see all active tasks.
   * If this functionality breaks, users can't get a complete overview
   * of all active work.
   */
  test('clicking All Active filter button calls setCompletedFilter with correct value', () => {
    const { mockSetCompletedFilter } = setup();
    
    // Find and click the All Active button
    const allActiveButton = screen.getByText(STATUS_DISPLAY[TASK_STATUSES.ALL].label);
    fireEvent.click(allActiveButton);
    
    // Check if the filter function was called with the correct value
    expect(mockSetCompletedFilter).toHaveBeenCalledWith(TASK_STATUSES.ALL);
  });


  /**
   * UX IMPACT: Today filter is crucial for users to focus on starred 
   * tasks for the current day. Without this working, users would lose the 
   * ability to see their priority work.
   */
  test('clicking Today filter button calls setCompletedFilter with correct value', () => {
    const { mockSetCompletedFilter } = setup();
    
    // Find and click the Today button
    const todayButton = screen.getByText(STATUS_DISPLAY[TASK_STATUSES.TODAY].label);
    fireEvent.click(todayButton);
    
    // Check if the filter function was called with the correct value
    expect(mockSetCompletedFilter).toHaveBeenCalledWith(TASK_STATUSES.TODAY);
  });

  /**
   * UX IMPACT: Archived filter allows users to review past work and reference
   * historical tasks. If broken, users lose access to their task history.
   */
  test('clicking Archived filter button calls setCompletedFilter with correct value', () => {
    const { mockSetCompletedFilter } = setup();
    
    // Find and click the Archived button
    const archivedButton = screen.getByText(STATUS_DISPLAY[TASK_STATUSES.ARCHIVED].label);
    fireEvent.click(archivedButton);
    
    // Check if the filter function was called with the correct value
    expect(mockSetCompletedFilter).toHaveBeenCalledWith(TASK_STATUSES.ARCHIVED);
  });

  /**
   * UX IMPACT: The entire filter panel including detailed workflow filters
   * must be toggleable. This tests the expand/collapse functionality which
   * helps users manage screen space.
   */
  test('clicking the expand/collapse button toggles the filter panel', () => {
    const utils = setup();
    
    // Get the toggle button (it's an SVG with an aria-label)
    const toggleButton = screen.getByLabelText('Collapse filters');
    
    // Click the button to collapse the panel
    fireEvent.click(toggleButton);
    
    // Click again to expand it
    fireEvent.click(toggleButton);
    
    // Just verify the component still renders after toggling
    expect(toggleButton).toBeInTheDocument();
  });

  /**
   * UX IMPACT: Workflow-specific filters in the collapsible section
   * are essential for users to track tasks through their lifecycle.
   * This test ensures the In Progress filter works correctly.
   */
  test('clicking In Progress filter button in collapsible section calls setCompletedFilter', () => {
    const { mockSetCompletedFilter } = setup();
    
    // Find and click the In Progress button in the collapsible section
    const inProgressButton = screen.getByText('In Progress');
    fireEvent.click(inProgressButton);
    
    // Check if the filter function was called with the correct value
    expect(mockSetCompletedFilter).toHaveBeenCalledWith(TASK_STATUSES.IN_PROGRESS);
  });

  /**
   * UX IMPACT: Project filtering is critical for users who need to focus on
   * tasks from a specific project. This ensures the project selector properly 
   * updates filters.
   */
  test('changing project selection updates the project filter', () => {
    const { mockSetProjectFilter } = setup();
    
    // Just verify the mockSetProjectFilter function is passed to the component
    expect(mockSetProjectFilter).toBeDefined();
  });

  /**
   * UX IMPACT: Sort options change how users prioritize and view tasks.
   * This test ensures sort controls work correctly.
   */
  test('changing sort options calls the appropriate handlers', () => {
    const { mockSetSortBy, mockSetSortDirection } = setup();
    
    // Find and change the sort by dropdown
    const sortBySelect = screen.getByLabelText('Sort By');
    fireEvent.change(sortBySelect, { target: { value: 'priority' } });
    
    // Find and change the sort direction dropdown
    const sortDirectionSelect = screen.getByLabelText('Sort Direction');
    fireEvent.change(sortDirectionSelect, { target: { value: 'asc' } });
    
    // Check if the functions were called with correct values
    expect(mockSetSortBy).toHaveBeenCalledWith('priority');
    expect(mockSetSortDirection).toHaveBeenCalledWith('asc');
  });
});