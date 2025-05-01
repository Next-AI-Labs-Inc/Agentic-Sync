import { renderHook, act } from '@testing-library/react';
import { useTaskFilters } from '../useTaskFilters';
import { Task } from '@/types';

// Mock next/router
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

const mockTasks: Task[] = [
  {
    id: 'task1',
    title: 'Test Task 1',
    description: 'First test task',
    status: 'todo',
    priority: 'medium',
    project: 'project1',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
    tags: ['test', 'important']
  },
  {
    id: 'task2',
    title: 'Test Task 2',
    description: 'Second test task',
    status: 'in-progress',
    priority: 'high',
    project: 'project1',
    createdAt: '2025-01-05T00:00:00Z',
    updatedAt: '2025-01-05T00:00:00Z',
    tags: ['test']
  },
  {
    id: 'task3',
    title: 'Test Task 3',
    description: 'Third test task with feature',
    status: 'done',
    priority: 'low',
    project: 'project2',
    completedAt: '2025-01-20T00:00:00Z',
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-20T00:00:00Z',
    tags: ['test', 'feature']
  },
  {
    id: 'task4',
    title: 'Test Task 4',
    description: 'Fourth test task with feature',
    status: 'reviewed',
    priority: 'medium',
    project: 'project2',
    completedAt: '2025-01-01T00:00:00Z',
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    tags: ['test', 'feature', 'old']
  },
  {
    id: 'task5',
    title: 'Test Task 5',
    description: 'Fifth task with no project',
    status: 'backlog',
    priority: 'low',
    project: '',
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z',
    tags: ['test', 'noproject']
  }
];

describe('useTaskFilters hook', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  });
  
  test('provides default filters and all tasks initially', () => {
    const { result } = renderHook(() => useTaskFilters({ initialTasks: mockTasks }));
    
    // Check default filter values
    expect(result.current.completedFilter).toBe('all');
    expect(result.current.projectFilter).toBe('all');
    expect(result.current.sortBy).toBe('created');
    expect(result.current.sortDirection).toBe('desc');
    expect(result.current.searchTerm).toBe('');
    
    // Should exclude done and reviewed tasks by default with 'all' filter
    const activeTasks = mockTasks.filter(task => 
      task.status !== 'done' && task.status !== 'reviewed'
    );
    
    expect(result.current.filteredTasks.length).toBe(activeTasks.length);
  });
  
  test('filters tasks by status', () => {
    const { result } = renderHook(() => useTaskFilters({ initialTasks: mockTasks }));
    
    // Filter to show only 'in-progress' tasks
    act(() => {
      result.current.setCompletedFilter('in-progress');
    });
    
    expect(result.current.filteredTasks.length).toBe(1);
    expect(result.current.filteredTasks[0].id).toBe('task2');
  });
  
  test('filters tasks by project', () => {
    const { result } = renderHook(() => useTaskFilters({ initialTasks: mockTasks }));
    
    // Filter to show only 'project2' tasks
    act(() => {
      result.current.setProjectFilter('project2');
    });
    
    // Should only show active tasks from project2
    expect(result.current.filteredTasks.length).toBe(0); // No active tasks in project2 (both are done/reviewed)
    
    // Change filter to include completed tasks
    act(() => {
      result.current.setCompletedFilter('done');
    });
    
    // Now we should see the completed task from project2
    expect(result.current.filteredTasks.length).toBe(1);
    expect(result.current.filteredTasks[0].id).toBe('task3');
  });
  
  test('filters tasks by search term', () => {
    const { result } = renderHook(() => useTaskFilters({ initialTasks: mockTasks }));
    
    // Search for tasks with 'feature' in their description
    act(() => {
      result.current.setSearchTerm('feature');
    });
    
    // By default with 'all' filter, should only show active tasks with feature
    // But in this case, both feature tasks are done/reviewed, so we need to change filter
    act(() => {
      result.current.setCompletedFilter('done');
    });
    
    expect(result.current.filteredTasks.length).toBe(1);
    expect(result.current.filteredTasks[0].id).toBe('task3');
  });
  
  test('sorts tasks according to sort options', () => {
    const { result } = renderHook(() => useTaskFilters({ initialTasks: mockTasks }));
    
    // Change filter to include all statuses
    act(() => {
      result.current.setCompletedFilter('all'); // Include all except done/reviewed
    });
    
    // Sort by priority (high first)
    act(() => {
      result.current.setSortBy('priority');
      result.current.setSortDirection('desc');
    });
    
    expect(result.current.filteredTasks[0].id).toBe('task2'); // high priority
    
    // Reverse the sort direction
    act(() => {
      result.current.setSortDirection('asc');
    });
    
    expect(result.current.filteredTasks[0].id).toBe('task5'); // low priority
  });
  
  test('saves and loads filter preferences', () => {
    // First render to set preferences
    const { result } = renderHook(() => useTaskFilters({ initialTasks: mockTasks }));
    
    // Set some filter values
    act(() => {
      result.current.setCompletedFilter('todo');
      result.current.setProjectFilter('project1');
      result.current.setSortBy('priority');
    });
    
    // Explicitly save preferences
    act(() => {
      result.current.saveFilterPreferences();
    });
    
    // Unmount and remount to simulate page refresh
    const { unmount } = renderHook(() => useTaskFilters({ initialTasks: mockTasks }));
    unmount();
    
    // New render should load saved preferences
    const { result: newResult } = renderHook(() => useTaskFilters({ initialTasks: mockTasks }));
    
    // Check that preferences were loaded
    expect(newResult.current.completedFilter).toBe('todo');
    expect(newResult.current.projectFilter).toBe('project1');
    expect(newResult.current.sortBy).toBe('priority');
  });
});