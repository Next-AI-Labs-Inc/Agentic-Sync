import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef
} from 'react';
import { useRouter } from 'next/router';
import {
  Task,
  TaskFilterStatus,
  ProjectFilterType,
  SortOption,
  SortDirection,
  TaskFormData
} from '@/types';
import * as taskApiService from '@/services/taskApiService';
import taskSyncService, { SyncEventType } from '@/services/taskSyncService';

interface TaskContextValue {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  completedFilter: TaskFilterStatus;
  projectFilter: ProjectFilterType;
  sortBy: SortOption;
  sortDirection: SortDirection;
  refreshTasks: () => Promise<Task[]>;
  setCompletedFilter: (filter: TaskFilterStatus) => void;
  setProjectFilter: (filter: ProjectFilterType) => void;
  setSortBy: (sort: SortOption) => void;
  setSortDirection: (direction: SortDirection) => void;
  updateTaskStatus: (
    taskId: string,
    project: string,
    status: 'proposed' | 'todo' | 'in-progress' | 'done' | 'reviewed'
  ) => Promise<void>;
  markTaskTested: (taskId: string, project: string) => Promise<void>;
  deleteTask: (taskId: string, project: string) => Promise<void>;
  addTask: (taskData: TaskFormData) => Promise<void>;
  updateTaskDate: (taskId: string, project: string, newDate: string) => Promise<void>;
  filteredTasks: Task[];
  taskCountsByStatus: Record<string, number>;
}

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

const FILTER_STORAGE_KEY = 'taskFilterPreferences';

// Simple function to sort tasks by creation date - newest first
const sortByNewestFirst = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return bTime - aTime; // Newest first
  });
};

// Expose deduplicateTasks function for testing
export const deduplicateTasks = (tasks: Task[]): Task[] => {
  // First, normalize IDs - some tasks might have both _id and id
  const normalizedTasks = tasks.map((task) => {
    // Ensure task has an id
    if (!task.id && task._id) {
      return { ...task, id: task._id };
    }
    return task;
  });

  // Map to store unique tasks by ID
  const uniqueTasksById = new Map<string, Task>();
  const idCount = new Map<string, number>(); // Count occurrences for logging

  // Also track tasks by title+project combination
  const titleProjectKey = new Map<string, Task>();
  const titleProjectCount = new Map<string, number>();

  // First pass - identify duplicates by ID
  normalizedTasks.forEach((task) => {
    // Track ID duplicates
    const count = idCount.get(task.id) || 0;
    idCount.set(task.id, count + 1);

    // Track title+project duplicates
    const titleProjectIdentifier = `${task.title}:::${task.project}`;
    const tpCount = titleProjectCount.get(titleProjectIdentifier) || 0;
    titleProjectCount.set(titleProjectIdentifier, tpCount + 1);
  });

  // Log ID-based duplicate counts
  let duplicateIdCount = 0;
  idCount.forEach((count, id) => {
    if (count > 1) {
      // Find the task title for better logging
      const taskWithId = normalizedTasks.find((t) => t.id === id);
      const taskTitle = taskWithId ? taskWithId.title : 'unknown';
      console.log(
        `Found ${count} duplicates for task ID: ${id} (Title: "${taskTitle.substring(0, 30)}${
          taskTitle.length > 30 ? '...' : ''
        }")`
      );
      duplicateIdCount += count - 1;
    }
  });

  // Log title+project duplicate counts
  let duplicateTitleCount = 0;
  titleProjectCount.forEach((count, titleProject) => {
    if (count > 1) {
      console.log(`Found ${count} duplicates with same title+project: "${titleProject}"`);
      duplicateTitleCount += count - 1;
    }
  });

  if (duplicateIdCount > 0 || duplicateTitleCount > 0) {
    console.log(
      `Total duplicates found: ${duplicateIdCount} by ID and ${duplicateTitleCount} by title+project out of ${normalizedTasks.length} tasks`
    );
  }

  // First deduplicate by ID (keeping most recently updated)
  normalizedTasks.forEach((task) => {
    // Skip invalid tasks
    if (!task.id) {
      console.warn('Task with no ID found:', task);
      return;
    }

    if (
      !uniqueTasksById.has(task.id) ||
      new Date(task.updatedAt) > new Date(uniqueTasksById.get(task.id)!.updatedAt)
    ) {
      uniqueTasksById.set(task.id, task);
    }
  });

  // Get the unique-by-ID tasks
  const tasksAfterIdDedup = Array.from(uniqueTasksById.values());

  // Then deduplicate by title+project (for cases where the same task exists with different IDs)
  const uniqueTasksByTitleProject = new Map<string, Task>();

  tasksAfterIdDedup.forEach((task) => {
    const titleProjectIdentifier = `${task.title}:::${task.project}`;

    if (
      !uniqueTasksByTitleProject.has(titleProjectIdentifier) ||
      new Date(task.updatedAt) >
        new Date(uniqueTasksByTitleProject.get(titleProjectIdentifier)!.updatedAt)
    ) {
      uniqueTasksByTitleProject.set(titleProjectIdentifier, task);
    }
  });

  const finalTasks = Array.from(uniqueTasksByTitleProject.values());

  if (tasksAfterIdDedup.length !== finalTasks.length) {
    console.log(
      `Further reduced from ${tasksAfterIdDedup.length} to ${finalTasks.length} tasks after title+project deduplication`
    );
  }

  return finalTasks;
};

export function TaskProvider({
  children,
  initialCache
}: {
  children: ReactNode;
  initialCache?: Map<string, Task>;
}) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedFilter, setCompletedFilter] = useState<TaskFilterStatus>('all');
  const [projectFilter, setProjectFilter] = useState<ProjectFilterType>('all');
  // Always default to created date sorting with newest first
  const [sortBy, setSortBy] = useState<SortOption>('created');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [taskCountsByStatus, setTaskCountsByStatus] = useState<Record<string, number>>({});

  // Load filter preferences from localStorage on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedPreferences = localStorage.getItem(FILTER_STORAGE_KEY);
        if (savedPreferences) {
          const preferences = JSON.parse(savedPreferences);

          // Don't apply saved filters if there are URL params
          const hasUrlParams = Object.keys(router.query).some((param) =>
            ['filter', 'project', 'sort', 'direction'].includes(param)
          );

          if (!hasUrlParams) {
            preferences.completedFilter && setCompletedFilter(preferences.completedFilter);
            preferences.projectFilter && setProjectFilter(preferences.projectFilter);
            preferences.sortBy && setSortBy(preferences.sortBy);
            preferences.sortDirection && setSortDirection(preferences.sortDirection);
          }
        }
      } catch (err) {
        console.error('Failed to load filter preferences:', err);
      }
    }
  }, []);

  // Save filter preferences to localStorage
  const saveFilterPreferences = useCallback(() => {
    const preferences = {
      completedFilter,
      projectFilter,
      sortBy,
      sortDirection
    };
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(preferences));

    // Update URL with filter params
    const query: Record<string, string | string[]> = {};

    if (completedFilter !== 'all') {
      query.filter = completedFilter;
    }

    if (projectFilter !== 'all') {
      query.project = Array.isArray(projectFilter)
        ? projectFilter
        : projectFilter === 'none'
        ? 'none'
        : projectFilter;
    }

    if (sortBy !== 'created') {
      query.sort = sortBy;
    }

    if (sortDirection !== 'desc') {
      query.direction = sortDirection;
    }

    router.replace(
      {
        pathname: router.pathname,
        query
      },
      undefined,
      { shallow: true }
    );
  }, [completedFilter, projectFilter, sortBy, sortDirection, router]);

  // Save filter preferences when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      saveFilterPreferences();
    }
  }, [completedFilter, projectFilter, sortBy, sortDirection, saveFilterPreferences]);

  // Track the last sort settings to prevent infinite loops
  const lastSortSettingsRef = useRef({ sortBy, sortDirection });

  // Re-sort tasks when sort preferences change
  useEffect(() => {
    // Only re-sort if we have tasks and the sort settings have actually changed
    if (
      tasks.length > 0 &&
      (lastSortSettingsRef.current.sortBy !== sortBy ||
        lastSortSettingsRef.current.sortDirection !== sortDirection)
    ) {
      console.log('Re-sorting tasks due to preference change');

      // Update ref to current settings
      lastSortSettingsRef.current = { sortBy, sortDirection };

      // Always sort by newest first regardless of user preferences
      const newlySortedTasks = sortByNewestFirst([...tasks]);

      // Set the tasks
      setTasks(newlySortedTasks);
    }
  }, [sortBy, sortDirection]);

  // Counts tasks by status
  const calculateStatusCounts = (tasks: Task[]): Record<string, number> => {
    const counts: Record<string, number> = {
      proposed: 0,
      todo: 0,
      'in-progress': 0,
      done: 0,
      reviewed: 0
    };

    tasks.forEach((task) => {
      if (counts[task.status] !== undefined) {
        counts[task.status]++;
      }
    });

    return counts;
  };

  // Store local task cache to allow optimistic updates
  const [localTaskCache, setLocalTaskCache] = useState<Map<string, Task>>(
    initialCache || new Map()
  );

  // Update local cache when tasks change
  useEffect(() => {
    const newCache = new Map<string, Task>();
    tasks.forEach((task) => newCache.set(task.id, task));
    setLocalTaskCache(newCache);
  }, [tasks]);

  // Refresh tasks from the MongoDB API
  const refreshTasks = useCallback(async () => {
    // Set loading state without clearing current tasks
    setLoading(true);

    try {
      // Build filters based on current state
      const filters: Record<string, string | string[]> = {};

      if (projectFilter !== 'all') {
        if (projectFilter === 'none') {
          // Handle 'none' filter special case
          filters.project = 'none';
        } else if (Array.isArray(projectFilter)) {
          // Handle multi-select case
          filters.projects = projectFilter;
        } else {
          // Handle single project case
          filters.project = projectFilter;
        }
      }

      // Add timestamp to prevent caching
      filters._t = Date.now().toString();

      // Clear tasks first to avoid duplicates
      setTasks([]);

      // Fetch tasks from the MongoDB API
      const tasksData = await taskApiService.getTasks(filters);

      // Only update tasks if we got valid data back
      if (tasksData.length > 0) {
        console.log(`Loaded ${tasksData.length} tasks from API`);

        // Process tasks to match our Task interface
        const processedTasks = tasksData.map((task: any) => ({
          ...task,
          id: task._id || task.id // Use MongoDB _id as our id
        }));

        // Double check with our deduplication function
        const deDupedTasks = deduplicateTasks(processedTasks);
        console.log(`After deduplication: ${deDupedTasks.length} tasks`);

        // Always sort by newest first
        const sortedTasks = sortByNewestFirst(deDupedTasks);

        // Verify sort order for first few tasks
        if (sortedTasks.length >= 2) {
          const first = sortedTasks[0];
          const second = sortedTasks[1];
          const firstDate = new Date(first.createdAt).getTime();
          const secondDate = new Date(second.createdAt).getTime();

          console.log(`First task timestamp: ${firstDate}, Second task timestamp: ${secondDate}`);

          if (firstDate <= secondDate) {
            console.error('ERROR: Sorting is incorrect - first task is not newer than second task');
          } else {
            console.log('Sorting is correct - newest tasks appear first');
          }
        }

        setTasks(sortedTasks);
        setError(null); // Clear any previous errors on success

        // Calculate counts by status
        setTaskCountsByStatus(calculateStatusCounts(sortedTasks));

        return sortedTasks;
      } else {
        // No tasks found, set empty array
        setTasks([]);
        setTaskCountsByStatus({
          proposed: 0,
          todo: 0,
          'in-progress': 0,
          done: 0,
          reviewed: 0
        });

        return [];
      }
    } catch (error) {
      console.error('Error fetching tasks from API:', error);
      setError('Failed to load tasks from the server. Please try again later.');
      // Don't clear existing tasks on error to maintain UI stability
      throw error;
    } finally {
      setLoading(false);
    }
  }, [projectFilter]);

  // Subscribe to real-time task updates
  useEffect(() => {
    // Reference to unsubscribe functions
    const unsubscribes: (() => void)[] = [];

    // Initial load
    refreshTasks().catch((error) => {
      console.error('Failed to fetch initial tasks:', error);
      setLoading(false);
    });

    // Subscribe to task created events
    unsubscribes.push(
      taskSyncService.subscribe(SyncEventType.TASK_CREATED, (event) => {
        console.log('Real-time task created:', event.payload);
        const newTask = event.payload as Task;

        // Check if task should be included based on current filters
        const shouldInclude = shouldIncludeTask(newTask, projectFilter);

        if (shouldInclude) {
          // Add new task to existing tasks with animation flag
          setTasks((currentTasks) => {
            // Add _isNew flag for animation and ensure createdAt is valid
            const taskWithAnimation = {
              ...newTask,
              _isNew: true,
              createdAt: newTask.createdAt || new Date().toISOString()
            };

            // Add to tasks array and sort by newest first
            const updatedTasks = [...currentTasks, taskWithAnimation];
            const dedupedTasks = deduplicateTasks(updatedTasks);
            const sortedTasks = sortByNewestFirst(dedupedTasks);

            return sortedTasks;
          });

          // Update counters
          setTaskCountsByStatus((currentCounts) => {
            const newCounts = { ...currentCounts };
            if (newCounts[newTask.status] !== undefined) {
              newCounts[newTask.status]++;
            }
            return newCounts;
          });
        }
      })
    );

    // Subscribe to task updated events
    unsubscribes.push(
      taskSyncService.subscribe(SyncEventType.TASK_UPDATED, (event) => {
        console.log('Real-time task updated:', event.payload);
        const updatedTask = event.payload as Task;

        setTasks((currentTasks) => {
          // Replace the task if it exists
          const taskExists = currentTasks.some((t) => t.id === updatedTask.id);

          let updatedTasks = currentTasks;

          if (taskExists) {
            // Update existing task
            updatedTasks = currentTasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
          } else {
            // If task doesn't exist but should be included in this view, add it
            const shouldInclude = shouldIncludeTask(updatedTask, projectFilter);
            if (shouldInclude) {
              updatedTasks = [...currentTasks, updatedTask];
            } else {
              return currentTasks;
            }
          }

          // Always deduplicate and sort by newest first
          const dedupedTasks = deduplicateTasks(updatedTasks);
          return sortByNewestFirst(dedupedTasks);
        });

        // Update task counts
        setTaskCountsByStatus(calculateStatusCounts(tasks));
      })
    );

    // Subscribe to task deleted events
    unsubscribes.push(
      taskSyncService.subscribe(SyncEventType.TASK_DELETED, (event) => {
        console.log('Real-time task deleted:', event.payload);
        const { id } = event.payload;

        setTasks((currentTasks) => {
          return currentTasks.filter((t) => t.id !== id);
        });

        // Update counters
        setTaskCountsByStatus(calculateStatusCounts(tasks.filter((t) => t.id !== id)));
      })
    );

    // Helper function to determine if a task should be included based on filters
    function shouldIncludeTask(task: Task, projectFilter: ProjectFilterType): boolean {
      if (projectFilter === 'all') {
        return true;
      } else if (projectFilter === 'none') {
        return !task.project;
      } else if (Array.isArray(projectFilter)) {
        return projectFilter.includes(task.project);
      } else {
        return task.project === projectFilter;
      }
    }

    // Clean up subscriptions on unmount
    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [refreshTasks, projectFilter]);

  // Filter tasks by status
  const filteredTasks = React.useMemo(() => {
    let filtered = [...tasks];

    // Filter by status
    if (completedFilter === 'pending') {
      filtered = filtered.filter((task) => task.status !== 'done' && task.status !== 'reviewed');
    } else if (completedFilter === 'recent-completed') {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      filtered = filtered.filter((task) => {
        return (
          (task.status === 'done' || task.status === 'reviewed') &&
          task.completedAt &&
          new Date(task.completedAt) > twoDaysAgo
        );
      });
    } else if (completedFilter !== 'all') {
      // Filter by specific status (proposed, todo, in-progress, done, reviewed)
      filtered = filtered.filter((task) => task.status === completedFilter);
    }

    return filtered;
  }, [tasks, completedFilter]);

  // Task operations with optimistic updates
  const updateTaskStatus = async (
    taskId: string,
    project: string,
    status: 'proposed' | 'todo' | 'in-progress' | 'done' | 'reviewed'
  ) => {
    // Get the current task
    const taskToUpdate = localTaskCache.get(taskId);
    if (!taskToUpdate) {
      console.error(`Task with ID ${taskId} not found in cache`);
      return;
    }

    // Create update data
    const updateData: Partial<Task> = {
      status,
      updatedAt: new Date().toISOString()
    };

    // Add appropriate timestamps
    if (status === 'done' && !taskToUpdate.completedAt) {
      updateData.completedAt = new Date().toISOString();
    } else if (status === 'reviewed') {
      updateData.reviewedAt = new Date().toISOString();
    }

    // Create updated task for optimistic update
    const updatedTask = { ...taskToUpdate, ...updateData };

    // Update local cache optimistically
    const newCache = new Map(localTaskCache);
    newCache.set(taskId, updatedTask);
    setLocalTaskCache(newCache);

    // Update tasks array optimistically and ensure newest tasks stay first
    const optimisticTasks = tasks.map((task) => (task.id === taskId ? updatedTask : task));

    // Always sort by newest first
    const sortedTasks = sortByNewestFirst(optimisticTasks);

    // Update state immediately for responsive UI
    setTasks(sortedTasks);
    setTaskCountsByStatus(calculateStatusCounts(sortedTasks));

    try {
      // Perform the actual API update
      await taskApiService.updateTask(taskId, updateData);

      // Emit event for real-time sync to other clients
      taskSyncService.emitTaskUpdated(updatedTask);

      // No need to refresh tasks as we've already updated locally
    } catch (error) {
      console.error('Error updating task status:', error);
      setError('Failed to update task status');

      // Revert to previous state on error
      setTasks(tasks);
      setTaskCountsByStatus(calculateStatusCounts(tasks));

      // Refresh data from server to ensure consistency
      refreshTasks();
    }
  };

  const markTaskTested = async (taskId: string, project: string) => {
    // Get the current task
    const taskToUpdate = localTaskCache.get(taskId);
    if (!taskToUpdate) {
      console.error(`Task with ID ${taskId} not found in cache`);
      return;
    }

    // Create update data with completion info
    const updateData: Partial<Task> = {
      tested: true,
      status: 'done',
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Create updated task for optimistic update
    const updatedTask = { ...taskToUpdate, ...updateData };

    // Update local cache
    const newCache = new Map(localTaskCache);
    newCache.set(taskId, updatedTask);
    setLocalTaskCache(newCache);

    // Update tasks array optimistically and ensure newest tasks stay first
    const optimisticTasks = tasks.map((task) => (task.id === taskId ? updatedTask : task));

    // Always sort by newest first
    const sortedTasks = sortByNewestFirst(optimisticTasks);

    // Update state immediately
    setTasks(sortedTasks);
    setTaskCountsByStatus(calculateStatusCounts(sortedTasks));

    try {
      // Perform the actual API update
      await taskApiService.markTaskTested(taskId);

      // Emit event for real-time sync to other clients
      taskSyncService.emitTaskUpdated(updatedTask);
    } catch (error) {
      console.error('Error marking task as tested:', error);

      // Revert and refresh on error
      setTasks(tasks);
      refreshTasks();
    }
  };

  const deleteTask = async (taskId: string, project: string) => {
    // Optimistically remove the task from the UI immediately
    const taskToDelete = localTaskCache.get(taskId);
    if (!taskToDelete) {
      console.error(`Task with ID ${taskId} not found in cache`);
      return;
    }

    // Remove from tasks array
    const optimisticTasks = tasks.filter((task) => task.id !== taskId);

    // Update state immediately
    setTasks(optimisticTasks);
    setTaskCountsByStatus(calculateStatusCounts(optimisticTasks));

    try {
      // Perform the actual API delete
      await taskApiService.deleteTask(taskId);

      // Emit event to sync service for real-time updates to other clients
      taskSyncService.emitTaskDeleted(taskId, project);
    } catch (error) {
      console.error('Error deleting task:', error);

      // Revert and refresh on error
      setTasks(tasks);
      refreshTasks();
    }
  };
  
  const updateTaskDate = async (taskId: string, project: string, newDate: string) => {
    // Get the current task
    const taskToUpdate = localTaskCache.get(taskId);
    if (!taskToUpdate) {
      console.error(`Task with ID ${taskId} not found in cache`);
      return;
    }

    // Validate the date format
    const isValidDate = !isNaN(new Date(newDate).getTime());
    if (!isValidDate) {
      console.error(`Invalid date format: ${newDate}`);
      return;
    }

    console.log(`Updating task ${taskId} date from ${taskToUpdate.createdAt} to ${newDate}`);

    // Create update data
    const updateData: Partial<Task> = {
      createdAt: newDate,
      updatedAt: new Date().toISOString()
    };

    // Create updated task for optimistic update
    const updatedTask = { ...taskToUpdate, ...updateData };

    // Update local cache optimistically
    const newCache = new Map(localTaskCache);
    newCache.set(taskId, updatedTask);
    setLocalTaskCache(newCache);

    // Update tasks array optimistically and ensure newest tasks stay first
    const optimisticTasks = tasks.map((task) => (task.id === taskId ? updatedTask : task));

    // Always sort by newest first 
    const sortedTasks = sortByNewestFirst(optimisticTasks);

    // Update state immediately for responsive UI
    setTasks(sortedTasks);

    try {
      // Perform the actual API update
      await taskApiService.updateTask(taskId, updateData);

      // Emit event for real-time sync to other clients
      taskSyncService.emitTaskUpdated(updatedTask);

      // No need to refresh tasks as we've already updated locally
    } catch (error) {
      console.error('Error updating task date:', error);

      // Revert to previous state on error
      setTasks(tasks);

      // Refresh data from server to ensure consistency
      refreshTasks();
    }
  };

  const addTask = async (taskData: TaskFormData) => {
    // Generate a deterministic ID for optimistic updates
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date().toISOString();

    // Create a temporary task for optimistic add with proper defaults for missing fields
    const tempTask: Task = {
      id: tempId,
      title: taskData.title,
      description: taskData.description || '',
      status: taskData.status || 'todo',
      priority: taskData.priority,
      project: taskData.project,
      initiative: taskData.initiative || '',
      tags: taskData.tags
        ? taskData.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [],
      verificationSteps: taskData.verificationSteps
        ? taskData.verificationSteps
            .split('\n')
            .map((step) => step.trim())
            .filter(Boolean)
        : [],
      nextSteps: taskData.nextSteps
        ? taskData.nextSteps
            .split('\n')
            .map((step) => step.trim())
            .filter(Boolean)
        : [],
      createdAt: now,
      updatedAt: now,
      _isNew: true // Flag to identify newly created tasks for animation
    };

    console.log('Creating optimistic task:', tempTask);

    // Add to the local cache immediately
    const newCache = new Map(localTaskCache);
    newCache.set(tempId, tempTask);
    setLocalTaskCache(newCache);

    // Add to tasks array and ensure newest tasks stay first
    const optimisticTasks = [...tasks, tempTask];
    const sortedOptimisticTasks = sortByNewestFirst(optimisticTasks);

    // Update state immediately
    setTasks(sortedOptimisticTasks);
    setTaskCountsByStatus(calculateStatusCounts(sortedOptimisticTasks));

    // Launch API call in the background without blocking UI
    setTimeout(() => {
      taskApiService
        .createTask(taskData)
        .then((createdTask) => {
          if (createdTask) {
            // Make sure createdAt is a valid date string
            const createdAt = createdTask.createdAt || now;

            const realTask = {
              ...createdTask,
              id: createdTask._id || createdTask.id,
              createdAt: createdAt,
              _isNew: false // Remove animation flag
            };

            console.log('Task created successfully:', realTask);

            // Update local cache
            const updatedCache = new Map(localTaskCache);
            updatedCache.delete(tempId);
            updatedCache.set(realTask.id, realTask);
            setLocalTaskCache(updatedCache);

            // Replace temp task with real one from server and maintain sort order
            setTasks((currentTasks) => {
              // Replace the temp task with the real one
              let updatedTasks = currentTasks.map((task) => (task.id === tempId ? realTask : task));

              // Apply deduplication and sorting
              const dedupedTasks = deduplicateTasks(updatedTasks);
              const sortedTasks = sortByNewestFirst(dedupedTasks);

              return sortedTasks;
            });

            // Emit event to sync service for real-time updates to other clients
            taskSyncService.emitTaskCreated(realTask);
          }
        })
        .catch((error) => {
          console.error('Error finalizing task creation:', error);
          // Silent failure - keep the optimistic task in UI to prevent disruption
        });
    }, 0);

    // Return immediately to ensure form closes right away
    return Promise.resolve();
  };

  const value = {
    tasks,
    loading,
    error,
    completedFilter,
    projectFilter,
    sortBy,
    sortDirection,
    refreshTasks,
    setCompletedFilter,
    setProjectFilter,
    setSortBy,
    setSortDirection,
    updateTaskStatus,
    markTaskTested,
    deleteTask,
    addTask,
    updateTaskDate,
    filteredTasks,
    taskCountsByStatus
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
