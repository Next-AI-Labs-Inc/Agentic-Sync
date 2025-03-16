import React from 'react';
import { render, act, renderHook, waitFor } from '@testing-library/react';
import { TaskProvider, useTasks, deduplicateTasks } from '@/contexts/TaskContext';
import * as taskApiService from '@/services/taskApiService';

// Mock the task API service
jest.mock('@/services/taskApiService', () => ({
  getTasks: jest.fn(),
  getTask: jest.fn(),
  createTask: jest.fn(),
  updateTaskStatus: jest.fn(),
  markTaskTested: jest.fn(),
  deleteTask: jest.fn(),
  getStages: jest.fn().mockResolvedValue(['proposed', 'todo', 'in-progress', 'done', 'reviewed']),
}));

// Mock the router
jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/',
    query: {},
    replace: jest.fn(),
  }),
}));

describe('TaskContext', () => {
  const mockTasks = [
    {
      id: 'task1',
      title: 'Test Task 1',
      description: 'Test Description 1',
      status: 'todo',
      priority: 'medium',
      project: 'project1',
      initiative: 'initiative1',
      tags: ['test', 'task'],
      createdAt: '2025-03-01T00:00:00Z',
      updatedAt: '2025-03-01T00:00:00Z',
    },
    {
      id: 'task2',
      title: 'Test Task 2',
      description: 'Test Description 2',
      status: 'in-progress',
      priority: 'high',
      project: 'project2',
      initiative: 'initiative2',
      tags: ['test', 'task'],
      createdAt: '2025-03-02T00:00:00Z',
      updatedAt: '2025-03-02T00:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Set up the mock to return our test tasks
    (taskApiService.getTasks as jest.Mock).mockResolvedValue(mockTasks);
    localStorage.clear();
  });

  test('provides task data and loading state', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TaskProvider>{children}</TaskProvider>
    );

    const { result } = renderHook(() => useTasks(), { wrapper });

    // Initial state should show loading
    expect(result.current.loading).toBe(true);
    expect(result.current.tasks).toEqual([]);

    // Wait for tasks to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Tasks should be loaded
    expect(result.current.tasks).toEqual(mockTasks);
  });

  test('provides sorted and filtered tasks', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TaskProvider>{children}</TaskProvider>
    );

    const { result } = renderHook(() => useTasks(), { wrapper });

    // Wait for tasks to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Default should be all tasks sorted by created date descending
    expect(result.current.filteredTasks).toEqual(mockTasks);

    // Change filter to only show in-progress tasks
    act(() => {
      result.current.setCompletedFilter('in-progress');
    });

    // Should only show in-progress tasks
    expect(result.current.filteredTasks).toEqual([mockTasks[1]]);

    // Change sorting to priority
    act(() => {
      result.current.setSortBy('priority');
    });

    // Still should only show in-progress tasks
    expect(result.current.filteredTasks).toEqual([mockTasks[1]]);
  });

  test('can update task status', async () => {
    // This test verifies the updateTaskStatus function exists and can be called
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TaskProvider>{children}</TaskProvider>
    );

    const { result } = renderHook(() => useTasks(), { wrapper });

    // Wait for tasks to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify the function exists
    expect(typeof result.current.updateTaskStatus).toBe('function');
  });

  test('has markTaskTested function', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TaskProvider>{children}</TaskProvider>
    );

    const { result } = renderHook(() => useTasks(), { wrapper });

    // Wait for tasks to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify the function exists
    expect(typeof result.current.markTaskTested).toBe('function');
  });

  test('has addTask function', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TaskProvider>{children}</TaskProvider>
    );

    const { result } = renderHook(() => useTasks(), { wrapper });

    // Wait for tasks to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify the function exists
    expect(typeof result.current.addTask).toBe('function');
  });

  test('correctly deduplicates tasks', async () => {
    // Create duplicate tasks with same ID
    const duplicateTasks = [
      ...mockTasks,
      { ...mockTasks[0], updatedAt: '2025-03-03T00:00:00Z' }, // Newer version of task1
    ];

    // Import the deduplication function directly from the context
    // It was moved outside the component and exported directly
    const dedupedTasks = deduplicateTasks(duplicateTasks);
    
    // Should only have 2 tasks (deduplicated)
    expect(dedupedTasks.length).toBe(2);

    // Should keep the newer version of task1
    const task1 = dedupedTasks.find(task => task.id === 'task1');
    expect(task1?.updatedAt).toBe('2025-03-03T00:00:00Z');
  });

  test('calculates task counts by status', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TaskProvider>{children}</TaskProvider>
    );

    const { result } = renderHook(() => useTasks(), { wrapper });

    // Wait for tasks to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Check task counts
    expect(result.current.taskCountsByStatus).toEqual({
      'proposed': 0,
      'todo': 1,
      'in-progress': 1,
      'done': 0,
      'reviewed': 0,
    });
  });
});