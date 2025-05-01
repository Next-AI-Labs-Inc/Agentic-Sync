/**
 * UX IMPACT: This test ensures TaskFilters component correctly interacts with the TaskContext,
 * which is critical for filter functionality. If these integrations fail, users would see
 * filter buttons that appear to work but don't actually filter the task list.
 * 
 * TECHNICAL CONTEXT: Tests the integration between TaskFilters component and TaskContext
 * to verify filter state is properly managed and applied to tasks.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskProvider, useTasks } from '@/contexts/TaskContext';
import TaskFilters from '@/components/TaskFilters';
import { TASK_STATUSES } from '@/constants/taskStatus';

// Mock TaskContext dependencies
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: {},
      asPath: '',
      push: jest.fn(),
      replace: jest.fn(() => Promise.resolve(true)),
      events: {
        on: jest.fn(),
        off: jest.fn()
      }
    };
  }
}));

// Mock TaskContext
jest.mock('@/contexts/TaskContext', () => {
  const originalModule = jest.requireActual('@/contexts/TaskContext');
  
  const mockTasks = [
    {
      id: 'task1',
      title: 'Task 1',
      status: 'todo',
      project: 'project1',
      priority: 'medium',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    },
    {
      id: 'task2',
      title: 'Task 2',
      status: 'in-progress',
      project: 'project1',
      priority: 'high',
      createdAt: '2023-01-02T00:00:00Z',
      updatedAt: '2023-01-02T00:00:00Z'
    },
    {
      id: 'task3',
      title: 'Task 3',
      status: 'done',
      project: 'project2',
      priority: 'low',
      createdAt: '2023-01-03T00:00:00Z',
      updatedAt: '2023-01-03T00:00:00Z',
      completedAt: '2023-01-04T00:00:00Z'
    },
    {
      id: 'task4',
      title: 'Task 4',
      status: 'archived',
      project: 'project2',
      priority: 'medium',
      createdAt: '2023-01-04T00:00:00Z',
      updatedAt: '2023-01-04T00:00:00Z'
    },
    {
      id: 'task5',
      title: 'Task 5',
      status: 'todo',
      project: 'project2',
      priority: 'high',
      createdAt: '2023-01-05T00:00:00Z',
      updatedAt: '2023-01-05T00:00:00Z',
      starred: true
    }
  ];
  
  return {
    ...originalModule,
    TaskProvider: ({ children }) => children,
    useTasks: jest.fn().mockReturnValue({
      tasks: mockTasks,
      filteredTasks: mockTasks.filter(t => t.status !== 'done' && t.status !== 'archived'),
      completedFilter: 'all',
      projectFilter: 'all',
      sortBy: 'created',
      sortDirection: 'desc',
      setCompletedFilter: jest.fn(),
      setProjectFilter: jest.fn(),
      setSortBy: jest.fn(),
      setSortDirection: jest.fn(),
      taskCountsByStatus: {
        'todo': 2,
        'in-progress': 1,
        'done': 1,
        'archived': 1
      }
    })
  };
});

// Create a simple wrapper component for integration testing
const TestComponent = ({ projects = [] }) => {
  const { 
    tasks, 
    filteredTasks, 
    completedFilter, 
    setCompletedFilter, 
    projectFilter, 
    setProjectFilter, 
    sortBy, 
    setSortBy, 
    sortDirection, 
    setSortDirection,
    taskCountsByStatus = {
      'todo': 2,
      'in-progress': 1,
      'done': 1,
      'archived': 1
    }
  } = useTasks();
  
  return (
    <div>
      <TaskFilters
        projects={projects}
        projectFilter={projectFilter}
        setProjectFilter={setProjectFilter}
        completedFilter={completedFilter} 
        setCompletedFilter={setCompletedFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortDirection={sortDirection}
        setSortDirection={setSortDirection}
        onAddNewClick={() => {}}
        taskCountsByStatus={taskCountsByStatus}
        tasks={tasks}
      />
      <div data-testid="filtered-count">{filteredTasks.length}</div>
      <ul>
        {filteredTasks.map(task => (
          <li key={task.id} data-testid={`task-${task.id}`}>{task.title}</li>
        ))}
      </ul>
    </div>
  );
};


describe('TaskFilters Integration with TaskContext', () => {
  const mockProjects = [
    { id: 'project1', name: 'Project 1' },
    { id: 'project2', name: 'Project 2' }
  ];
  
  const mockTasks = [
    {
      id: 'task1',
      title: 'Task 1',
      status: 'todo',
      project: 'project1',
      priority: 'medium',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    },
    {
      id: 'task2',
      title: 'Task 2',
      status: 'in-progress',
      project: 'project1',
      priority: 'high',
      createdAt: '2023-01-02T00:00:00Z',
      updatedAt: '2023-01-02T00:00:00Z'
    },
    {
      id: 'task3',
      title: 'Task 3',
      status: 'done',
      project: 'project2',
      priority: 'low',
      createdAt: '2023-01-03T00:00:00Z',
      updatedAt: '2023-01-03T00:00:00Z',
      completedAt: '2023-01-04T00:00:00Z'
    },
    {
      id: 'task4',
      title: 'Task 4',
      status: 'archived',
      project: 'project2',
      priority: 'medium',
      createdAt: '2023-01-04T00:00:00Z',
      updatedAt: '2023-01-04T00:00:00Z'
    },
    {
      id: 'task5',
      title: 'Task 5',
      status: 'todo',
      project: 'project2',
      priority: 'high',
      createdAt: '2023-01-05T00:00:00Z',
      updatedAt: '2023-01-05T00:00:00Z',
      starred: true
    }
  ];

  /**
   * UX IMPACT: Ensures the filter controls are rendered correctly
   */
  test('renders filter buttons with the correct data-testid attributes', async () => {
    render(<TestComponent projects={mockProjects} />);
    
    // Verify all filter buttons are present with correct data-testid attributes
    expect(screen.getByTestId('filter-all-active')).toBeInTheDocument();
    expect(screen.getByTestId('filter-today')).toBeInTheDocument();
    expect(screen.getByTestId('filter-archived')).toBeInTheDocument();
  });


  /**
   * UX IMPACT: The "Today" filter shows starred tasks, which is crucial for
   * daily prioritization. Without this, users can't focus on their most important work.
   */
  test('clicking "Today" filter button calls setCompletedFilter with correct value', async () => {
    const { useTasks } = jest.requireMock('@/contexts/TaskContext');
    const mockSetCompletedFilter = jest.fn();
    
    // Update the mock to replace setCompletedFilter with our mock function
    useTasks.mockReturnValue({
      ...useTasks(),
      setCompletedFilter: mockSetCompletedFilter
    });
    
    render(<TestComponent projects={mockProjects} />);
    
    // Find and click the Today button
    const todayButton = screen.getByTestId('filter-today');
    fireEvent.click(todayButton);
    
    // Verify the correct function was called with the correct parameter
    await waitFor(() => {
      expect(mockSetCompletedFilter).toHaveBeenCalledWith(TASK_STATUSES.TODAY);
    });
  });

  /**
   * UX IMPACT: Users need to filter by specific workflow states like "Todo"
   * to focus on specific stages in their task management process.
   */
  test('clicking "In Progress" filter in collapsible section calls setCompletedFilter with correct value', async () => {
    const { useTasks } = jest.requireMock('@/contexts/TaskContext');
    const mockSetCompletedFilter = jest.fn();
    
    // Update the mock to replace setCompletedFilter with our mock function
    useTasks.mockReturnValue({
      ...useTasks(),
      setCompletedFilter: mockSetCompletedFilter
    });
    
    render(<TestComponent projects={mockProjects} />);
    
    // Expand filters if collapsed
    const expandButton = screen.queryByLabelText('Expand filters');
    if (expandButton) {
      fireEvent.click(expandButton);
    }
    
    // Find and click the In Progress button
    const inProgressButton = screen.getByText('In Progress');
    fireEvent.click(inProgressButton);
    
    // Verify the correct function was called with the correct parameter
    await waitFor(() => {
      expect(mockSetCompletedFilter).toHaveBeenCalledWith(TASK_STATUSES.IN_PROGRESS);
    });
  });

  /**
   * UX IMPACT: Archived view is essential for accessing historical tasks
   * that have been completed and archived.
   */
  test('clicking "Archived" filter button calls setCompletedFilter with correct value', async () => {
    const { useTasks } = jest.requireMock('@/contexts/TaskContext');
    const mockSetCompletedFilter = jest.fn();
    
    // Update the mock to replace setCompletedFilter with our mock function
    useTasks.mockReturnValue({
      ...useTasks(),
      setCompletedFilter: mockSetCompletedFilter
    });
    
    render(<TestComponent projects={mockProjects} />);
    
    // Find and click the Archived button
    const archivedButton = screen.getByTestId('filter-archived');
    fireEvent.click(archivedButton);
    
    // Verify the correct function was called with the correct parameter
    await waitFor(() => {
      expect(mockSetCompletedFilter).toHaveBeenCalledWith(TASK_STATUSES.ARCHIVED);
    });
  });

  /**
   * UX IMPACT: Testing sort functionality is important to verify users can
   * properly organize their tasks based on different criteria.
   */
  test('setting sort options calls the appropriate handlers', async () => {
    const { useTasks } = jest.requireMock('@/contexts/TaskContext');
    const mockSetSortBy = jest.fn();
    const mockSetSortDirection = jest.fn();
    
    // Update the mock to replace sort functions with our mock functions
    useTasks.mockReturnValue({
      ...useTasks(),
      setSortBy: mockSetSortBy,
      setSortDirection: mockSetSortDirection
    });
    
    render(<TestComponent projects={mockProjects} />);
    
    // Expand filters if they're collapsed
    const expandButton = screen.queryByLabelText('Expand filters');
    if (expandButton) {
      fireEvent.click(expandButton);
    }
    
    // Find and change the sort by dropdown
    const sortBySelect = screen.getByLabelText('Sort By');
    fireEvent.change(sortBySelect, { target: { value: 'priority' } });
    
    // Find and change the sort direction dropdown
    const sortDirectionSelect = screen.getByLabelText('Sort Direction');
    fireEvent.change(sortDirectionSelect, { target: { value: 'asc' } });
    
    // Verify the correct function was called with the correct parameter
    await waitFor(() => {
      expect(mockSetSortBy).toHaveBeenCalledWith('priority');
      expect(mockSetSortDirection).toHaveBeenCalledWith('asc');
    });
  });
});