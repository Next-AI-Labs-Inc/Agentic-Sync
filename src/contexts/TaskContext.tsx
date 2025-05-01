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
  TaskFormData,
  ItemWithStatus,
  AgentOptions
} from '@/types';
import * as taskApiService from '@/services/taskApiService';
import taskSyncService, { SyncEventType } from '@/services/taskSyncService';
import { TASK_STATUSES } from '@/constants/taskStatus';

interface TaskContextValue {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  completedFilter: TaskFilterStatus;
  projectFilter: ProjectFilterType;
  sortBy: SortOption;
  sortDirection: SortDirection;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  refreshTasks: () => Promise<Task[]>;
  setCompletedFilter: (filter: TaskFilterStatus) => void;
  setProjectFilter: (filter: ProjectFilterType) => void;
  setSortBy: (sort: SortOption) => void;
  setSortDirection: (direction: SortDirection) => void;
  updateTaskStatus: (
    taskId: string,
    project: string,
    status: 'inbox' | 'brainstorm' | 'proposed' | 'backlog' | 'maybe' | 'todo' | 'in-progress' | 'on-hold' | 'done' | 'reviewed' | 'archived'
  ) => Promise<void>;
  markTaskTested: (taskId: string, project: string) => Promise<void>;
  deleteTask: (taskId: string, project: string) => Promise<void>;
  addTask: (taskData: TaskFormData) => Promise<void>;
  updateTaskDate: (taskId: string, project: string, newDate: string) => Promise<void>;
  updateTask: (taskId: string, updateData: Partial<Task>) => Promise<void>;
  toggleTaskStar: (taskId: string, project: string) => Promise<void>;
  // Item status management functions
  approveRequirementItem: (taskId: string, itemId: string) => Promise<void>;
  vetoRequirementItem: (taskId: string, itemId: string) => Promise<void>;
  updateRequirementItems: (taskId: string, items: ItemWithStatus[]) => Promise<void>;
  approveTechnicalPlanItem: (taskId: string, itemId: string) => Promise<void>;
  vetoTechnicalPlanItem: (taskId: string, itemId: string) => Promise<void>;
  updateTechnicalPlanItems: (taskId: string, items: ItemWithStatus[]) => Promise<void>;
  approveNextStepItem: (taskId: string, itemId: string) => Promise<void>;
  vetoNextStepItem: (taskId: string, itemId: string) => Promise<void>;
  updateNextStepItems: (taskId: string, items: ItemWithStatus[]) => Promise<void>;
  // Agent integration functions
  addTaskFeedback: (taskId: string, content: string) => Promise<void>;
  launchAgentForTask: (taskId: string, mode: 'implement' | 'demo' | 'feedback', feedback?: string) => Promise<{success: boolean; message: string; command: string}>;
  filteredTasks: Task[];
  taskCountsByStatus: Record<string, number>;
  dedupeEnabled: boolean;
  setDedupeEnabled: (enabled: boolean) => void;
  runManualDedupe: () => void;
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
  // Search term for filtering tasks
  const [searchTerm, setSearchTerm] = useState<string>('');
  // Flag to make deduplication optional - default to false for better performance
  const [dedupeEnabled, setDedupeEnabled] = useState<boolean>(false);

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
    // Initialize counts with all valid task statuses from our constants
    const counts: Record<string, number> = {};
    
    // Get all real task statuses (excluding filter-only statuses)
    Object.values(TASK_STATUSES)
      .filter(status => !['all', 'pending', 'recent-completed', 'source-tasks'].includes(status))
      .forEach(status => {
        counts[status] = 0;
      });

    // Count tasks for each status
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

  // Update local cache when tasks change - optimized to only update if we have tasks
  useEffect(() => {
    // Skip if tasks array is empty
    if (tasks.length === 0) return;
    
    const newCache = new Map<string, Task>();
    tasks.forEach((task) => {
      if (task && task.id) { // Validate task objects
        newCache.set(task.id, task);
      }
    });
    setLocalTaskCache(newCache);
  }, [tasks]);

  // Function to manually trigger deduplication
  const runManualDedupe = useCallback(() => {
    if (tasks.length === 0) return;
    
    console.log('Manually running deduplication...');
    const deDupedTasks = deduplicateTasks(tasks);
    
    // Update tasks with deduplicated version
    setTasks(deDupedTasks);
    setTaskCountsByStatus(calculateStatusCounts(deDupedTasks));
    
    console.log(`Deduplication complete: ${tasks.length} → ${deDupedTasks.length} tasks`);
  }, [tasks]);
  
  // Refresh tasks from the MongoDB API
  const refreshTasks = useCallback(async () => {
    // Track current API request with an AbortController
    const abortController = new AbortController();
    const signal = abortController.signal;
    
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

      // Fetch tasks from the MongoDB API with the abort signal
      const tasksData = await taskApiService.getTasks(filters, signal);

      // If request was aborted, exit early
      if (signal.aborted) {
        return [];
      }

      // Only update tasks if we got valid data back
      if (tasksData && tasksData.length > 0) {
        console.log(`Loaded ${tasksData.length} tasks from API`);

        // Process tasks to match our Task interface
        const processedTasks = tasksData.map((task: any) => ({
          ...task,
          id: task._id || task.id // Use MongoDB _id as our id
        }));

        // Only run deduplication if enabled
        let finalTasks = processedTasks;
        if (dedupeEnabled) {
          console.log('Deduplication is enabled, running deduplication...');
          finalTasks = deduplicateTasks(processedTasks);
          console.log(`After deduplication: ${finalTasks.length} tasks`);
        } else {
          console.log('Deduplication is disabled for better performance');
        }

        // Always sort by newest first
        const sortedTasks = sortByNewestFirst(finalTasks);

        // Only do verification in development mode
        if (process.env.NODE_ENV === 'development' && sortedTasks.length >= 2) {
          const first = sortedTasks[0];
          const second = sortedTasks[1];
          const firstDate = new Date(first.createdAt).getTime();
          const secondDate = new Date(second.createdAt).getTime();

          if (firstDate <= secondDate) {
            console.error('ERROR: Sorting is incorrect - first task is not newer than second task');
          }
        }

        // Batch our state updates to reduce renders
        setTasks(sortedTasks);
        setError(null); // Clear any previous errors on success
        setTaskCountsByStatus(calculateStatusCounts(sortedTasks));

        return sortedTasks;
      } else {
        // No tasks found, set empty array
        const emptyState = {
          proposed: 0,
          todo: 0,
          'in-progress': 0,
          done: 0,
          reviewed: 0
        };
        
        // Batch state updates
        setTasks([]);
        setTaskCountsByStatus(emptyState);

        return [];
      }
    } catch (error) {
      // Only report error if not aborted
      if (!signal.aborted) {
        console.error('Error fetching tasks from API:', error);
        setError('Failed to load tasks from the server. Please try again later.');
      }
      // Don't clear existing tasks on error to maintain UI stability
      throw error;
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
    
    // Abort requests when component unmounts via useEffect cleanup
    // Return empty array as fallback
    return [];
  }, [projectFilter]);

  // Subscribe to real-time task updates
  useEffect(() => {
    // Reference to unsubscribe functions and abort controllers
    const unsubscribes: (() => void)[] = [];
    let abortController: AbortController | null = null;

    // Create a memoized shouldIncludeTask function to avoid recreating it on each render
    const shouldIncludeTask = (task: Task, filter: ProjectFilterType): boolean => {
      if (filter === 'all') {
        return true;
      } else if (filter === 'none') {
        return !task.project;
      } else if (Array.isArray(filter)) {
        return filter.includes(task.project);
      } else {
        return task.project === filter;
      }
    };

    // Initial load with abortion capability
    const loadInitialTasks = async () => {
      // Cancel any previous request
      if (abortController) {
        abortController.abort();
      }
      
      // Create new abort controller for this request
      abortController = new AbortController();
      
      try {
        await refreshTasks();
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error('Failed to fetch initial tasks:', error);
          setLoading(false);
        }
      }
    };
    
    // Load tasks immediately
    loadInitialTasks();

    // Subscribe to task created events
    unsubscribes.push(
      taskSyncService.subscribe(SyncEventType.TASK_CREATED, (event) => {
        console.log('Real-time task created:', event.payload);
        const newTask = event.payload as Task;

        // Check if task should be included based on current filters
        const shouldIncludeThisTask = shouldIncludeTask(newTask, projectFilter);

        if (shouldIncludeThisTask) {
          // Use a functional update to avoid dependency on tasks state
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
            
            // Also update task counts in a separate call to avoid render loops
            setTimeout(() => {
              setTaskCountsByStatus(calculateStatusCounts(sortedTasks));
            }, 0);

            return sortedTasks;
          });
        }
      })
    );

    // Subscribe to task updated events
    unsubscribes.push(
      taskSyncService.subscribe(SyncEventType.TASK_UPDATED, (event) => {
        console.log('Real-time task updated:', event.payload);
        const updatedTask = event.payload as Task;

        // Use a functional update to avoid dependency on tasks state
        setTasks((currentTasks) => {
          // Replace the task if it exists
          const taskExists = currentTasks.some((t) => t.id === updatedTask.id);

          let updatedTasks = currentTasks;

          if (taskExists) {
            // Update existing task
            updatedTasks = currentTasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
          } else {
            // If task doesn't exist but should be included in this view, add it
            const shouldIncludeThisTask = shouldIncludeTask(updatedTask, projectFilter);
            if (shouldIncludeThisTask) {
              updatedTasks = [...currentTasks, updatedTask];
            } else {
              return currentTasks;
            }
          }

          // Always deduplicate and sort by newest first
          const dedupedTasks = deduplicateTasks(updatedTasks);
          const sortedTasks = sortByNewestFirst(dedupedTasks);
          
          // Update task counts from the new task list in next tick
          // This avoids multiple renders in a single update cycle
          setTimeout(() => {
            setTaskCountsByStatus(calculateStatusCounts(sortedTasks));
          }, 0);
          
          return sortedTasks;
        });
      })
    );

    // Subscribe to task deleted events
    unsubscribes.push(
      taskSyncService.subscribe(SyncEventType.TASK_DELETED, (event) => {
        console.log('Real-time task deleted:', event.payload);
        const { id } = event.payload;

        // Use a functional update to avoid dependency on tasks state
        setTasks((currentTasks) => {
          const filteredTasks = currentTasks.filter((t) => t.id !== id);
          
          // Update counters in next tick
          setTimeout(() => {
            setTaskCountsByStatus(calculateStatusCounts(filteredTasks));
          }, 0);
          
          return filteredTasks;
        });
      })
    );

    // Clean up subscriptions and abort any in-flight requests on unmount
    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
      if (abortController) {
        abortController.abort();
      }
    };
  }, [projectFilter]); // Remove refreshTasks from dependencies to prevent loops

  // Memoize date for recent-completed filter calculation
  const twoDaysAgoMemo = React.useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 2);
    return date.getTime();
  }, []);

  // Pre-compute filter predicates for better performance
  const filterPredicates = React.useMemo(() => {
    return {
      // Default 'all' filter (excludes done/reviewed)
      all: (task: Task): boolean => task.status !== 'done' && task.status !== 'reviewed',
      
      // 'pending' filter (excludes done/reviewed) - identical to 'all'
      pending: (task: Task): boolean => task.status !== 'done' && task.status !== 'reviewed',
      
      // 'source-tasks' filter (only backlog and brainstorm)
      sourceTasks: (task: Task): boolean => task.status === 'backlog' || task.status === 'brainstorm',
      
      // 'recent-completed' filter (done/reviewed within last 2 days)
      recentCompleted: (task: Task): boolean => {
        return Boolean(
          (task.status === 'done' || task.status === 'reviewed') &&
          task.completedAt &&
          new Date(task.completedAt).getTime() > twoDaysAgoMemo
        );
      },
      
      // 'today' filter (starred tasks)
      today: (task: Task): boolean => Boolean(task.starred),
      
      // Status-specific filters
      byStatus: (status: string) => (task: Task): boolean => task.status === status
    };
  }, [twoDaysAgoMemo]);
  
  // Filter tasks by status and search term with optimized memoization
  const filteredTasks = React.useMemo(() => {
    // Quick return for empty tasks array
    if (!tasks.length) return [];
    
    // Select the appropriate filter predicate
    let filterFn: (task: Task) => boolean;
    
    if (completedFilter === 'all') {
      filterFn = filterPredicates.all;
    } else if (completedFilter === 'pending') {
      filterFn = filterPredicates.pending;
    } else if (completedFilter === 'recent-completed') {
      filterFn = filterPredicates.recentCompleted;
    } else if (completedFilter === 'source-tasks') {
      filterFn = filterPredicates.sourceTasks;
    } else if (completedFilter === 'today') {
      filterFn = filterPredicates.today;
    } else {
      // Status-specific filter
      filterFn = filterPredicates.byStatus(completedFilter);
    }
    
    // Apply the selected filter predicate first
    let filtered = tasks.filter(filterFn);
    
    // Apply search term filter if provided
    if (searchTerm && searchTerm.trim() !== '') {
      const normalizedSearchTerm = searchTerm.trim().toLowerCase();
      
      // Check if search term contains parts that look like task ID (alphanumeric with hyphens)
      // but don't navigate directly to allow filtering when a non-exact ID is entered
      filtered = filtered.filter(task => {
        // Search in title, description, and ID
        return (
          task.title.toLowerCase().includes(normalizedSearchTerm) ||
          (task.description && task.description.toLowerCase().includes(normalizedSearchTerm)) ||
          task.id.toLowerCase().includes(normalizedSearchTerm) ||
          (task.initiative && task.initiative.toLowerCase().includes(normalizedSearchTerm)) ||
          (task.project && task.project.toLowerCase().includes(normalizedSearchTerm)) ||
          (task.tags && task.tags.some(tag => tag.toLowerCase().includes(normalizedSearchTerm)))
        );
      });
    }
    
    return filtered;
  }, [tasks, completedFilter, filterPredicates, searchTerm]);

  // Task operations with optimistic updates
  const updateTaskStatus = async (
    taskId: string,
    project: string,
    status: 'inbox' | 'brainstorm' | 'proposed' | 'backlog' | 'maybe' | 'todo' | 'in-progress' | 'on-hold' | 'done' | 'reviewed' | 'archived'
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

    if (process.env.NODE_ENV === 'development') {
      console.log('Creating optimistic task:', tempTask);
    }

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

    try {
      // Immediately create task in API without setTimeout
      const createdTask = await taskApiService.createTask(taskData);
      
      if (createdTask) {
        // Make sure createdAt is a valid date string
        const createdAt = createdTask.createdAt || now;

        const realTask = {
          ...createdTask,
          id: createdTask._id || createdTask.id,
          createdAt: createdAt,
          _isNew: false // Remove animation flag
        };

        if (process.env.NODE_ENV === 'development') {
          console.log('Task created successfully:', realTask);
        }

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
    } catch (error) {
      console.error('Error finalizing task creation:', error);
      // Silent failure - keep the optimistic task in UI to prevent disruption
      // We could add a toast notification here in the future
    }

    // Return immediately to ensure form closes right away
    return Promise.resolve();
  };

  // Create a wrapper for the updateTask function from taskApiService
  const updateTask = async (taskId: string, updateData: Partial<Task>) => {
    try {
      const updatedTask = await taskApiService.updateTask(taskId, updateData);
      
      // Update the task in local state
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, ...updateData } : task
      );
      
      setTasks(updatedTasks);
      
      return updatedTask;
    } catch (error) {
      console.error(`Error updating task ${taskId}:`, error);
      throw error;
    }
  };

  // Toggle a task's star status
  const toggleTaskStar = async (taskId: string, project: string) => {
    // Get the current task
    const taskToUpdate = localTaskCache.get(taskId);
    if (!taskToUpdate) {
      console.error(`Task with ID ${taskId} not found in cache`);
      return;
    }

    // Get current starred status
    const currentStarred = Boolean(taskToUpdate.starred);
    
    // Create update data
    const updateData: Partial<Task> = {
      starred: !currentStarred,
      updatedAt: new Date().toISOString()
    };

    // Create updated task for optimistic update
    const updatedTask = { ...taskToUpdate, ...updateData };

    // Update local cache optimistically
    const newCache = new Map(localTaskCache);
    newCache.set(taskId, updatedTask);
    setLocalTaskCache(newCache);

    // Update tasks array optimistically
    const optimisticTasks = tasks.map((task) => (task.id === taskId ? updatedTask : task));
    setTasks(optimisticTasks);

    try {
      // Perform the actual API update
      await taskApiService.toggleTaskStar(taskId, currentStarred);

      // Emit event for real-time sync to other clients
      taskSyncService.emitTaskUpdated(updatedTask);

    } catch (error) {
      console.error('Error toggling task star:', error);
      setError('Failed to update task star status');

      // Revert to previous state on error
      setTasks(tasks);

      // Refresh data from server to ensure consistency
      refreshTasks();
    }
  };

  // =========================================================================
  // Item Status Management Functions
  // =========================================================================

  // Approve a requirement item
  const approveRequirementItem = async (taskId: string, itemId: string) => {
    // Get the current task
    const taskToUpdate = localTaskCache.get(taskId);
    if (!taskToUpdate) {
      console.error(`Task with ID ${taskId} not found in cache`);
      return;
    }

    // Ensure requirementItems exists
    if (!taskToUpdate.requirementItems || taskToUpdate.requirementItems.length === 0) {
      console.error(`Task ${taskId} has no requirement items`);
      return;
    }

    // Find the item
    const itemIndex = taskToUpdate.requirementItems.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      console.error(`Requirement item ${itemId} not found in task ${taskId}`);
      return;
    }

    // Create an optimistic update
    const now = new Date().toISOString();
    const updatedItems = [...taskToUpdate.requirementItems];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      status: 'approved',
      approvedAt: now,
      updatedAt: now
    };

    // Create the update data
    const updateData: Partial<Task> = {
      requirementItems: updatedItems,
      updatedAt: now
    };

    // Create updated task for optimistic update
    const updatedTask = { ...taskToUpdate, ...updateData };

    // Update local cache optimistically
    const newCache = new Map(localTaskCache);
    newCache.set(taskId, updatedTask);
    setLocalTaskCache(newCache);

    // Update tasks array optimistically
    const optimisticTasks = tasks.map((task) => (task.id === taskId ? updatedTask : task));
    setTasks(optimisticTasks);

    try {
      // Perform the actual API update
      await taskApiService.updateRequirementItem(taskId, itemId, 'approved');

      // Emit event for real-time sync to other clients
      taskSyncService.emitTaskUpdated(updatedTask);
    } catch (error) {
      console.error(`Error approving requirement item ${itemId}:`, error);
      setError('Failed to approve requirement item');

      // Revert to previous state on error
      setTasks(tasks);

      // Refresh data from server to ensure consistency
      refreshTasks();
    }
  };

  // Veto (delete) a requirement item
  const vetoRequirementItem = async (taskId: string, itemId: string) => {
    // Get the current task
    const taskToUpdate = localTaskCache.get(taskId);
    if (!taskToUpdate) {
      console.error(`Task with ID ${taskId} not found in cache`);
      return;
    }

    // Ensure requirementItems exists
    if (!taskToUpdate.requirementItems || taskToUpdate.requirementItems.length === 0) {
      console.error(`Task ${taskId} has no requirement items`);
      return;
    }

    // Create optimistic update by removing the item
    const updatedItems = taskToUpdate.requirementItems.filter(item => item.id !== itemId);
    const now = new Date().toISOString();

    // Create the update data
    const updateData: Partial<Task> = {
      requirementItems: updatedItems,
      updatedAt: now
    };

    // Create updated task for optimistic update
    const updatedTask = { ...taskToUpdate, ...updateData };

    // Update local cache optimistically
    const newCache = new Map(localTaskCache);
    newCache.set(taskId, updatedTask);
    setLocalTaskCache(newCache);

    // Update tasks array optimistically
    const optimisticTasks = tasks.map((task) => (task.id === taskId ? updatedTask : task));
    setTasks(optimisticTasks);

    try {
      // Perform the actual API update
      await taskApiService.deleteRequirementItem(taskId, itemId);

      // Emit event for real-time sync to other clients
      taskSyncService.emitTaskUpdated(updatedTask);
    } catch (error) {
      console.error(`Error vetoing requirement item ${itemId}:`, error);
      setError('Failed to veto requirement item');

      // Revert to previous state on error
      setTasks(tasks);

      // Refresh data from server to ensure consistency
      refreshTasks();
    }
  };

  // Update requirement items
  const updateRequirementItems = async (taskId: string, items: ItemWithStatus[]) => {
    // Get the current task
    const taskToUpdate = localTaskCache.get(taskId);
    if (!taskToUpdate) {
      console.error(`Task with ID ${taskId} not found in cache`);
      return;
    }

    const now = new Date().toISOString();

    // Create the update data
    const updateData: Partial<Task> = {
      requirementItems: items,
      updatedAt: now
    };

    // Create updated task for optimistic update
    const updatedTask = { ...taskToUpdate, ...updateData };

    // Update local cache optimistically
    const newCache = new Map(localTaskCache);
    newCache.set(taskId, updatedTask);
    setLocalTaskCache(newCache);

    // Update tasks array optimistically
    const optimisticTasks = tasks.map((task) => (task.id === taskId ? updatedTask : task));
    setTasks(optimisticTasks);

    try {
      // Perform the actual API update
      await taskApiService.updateTask(taskId, { requirementItems: items });

      // Emit event for real-time sync to other clients
      taskSyncService.emitTaskUpdated(updatedTask);
    } catch (error) {
      console.error(`Error updating requirement items for task ${taskId}:`, error);
      setError('Failed to update requirement items');

      // Revert to previous state on error
      setTasks(tasks);

      // Refresh data from server to ensure consistency
      refreshTasks();
    }
  };

  // Approve a technical plan item
  const approveTechnicalPlanItem = async (taskId: string, itemId: string) => {
    // Get the current task
    const taskToUpdate = localTaskCache.get(taskId);
    if (!taskToUpdate) {
      console.error(`Task with ID ${taskId} not found in cache`);
      return;
    }

    // Ensure technicalPlanItems exists
    if (!taskToUpdate.technicalPlanItems || taskToUpdate.technicalPlanItems.length === 0) {
      console.error(`Task ${taskId} has no technical plan items`);
      return;
    }

    // Find the item
    const itemIndex = taskToUpdate.technicalPlanItems.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      console.error(`Technical plan item ${itemId} not found in task ${taskId}`);
      return;
    }

    // Create an optimistic update
    const now = new Date().toISOString();
    const updatedItems = [...taskToUpdate.technicalPlanItems];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      status: 'approved',
      approvedAt: now,
      updatedAt: now
    };

    // Create the update data
    const updateData: Partial<Task> = {
      technicalPlanItems: updatedItems,
      updatedAt: now
    };

    // Create updated task for optimistic update
    const updatedTask = { ...taskToUpdate, ...updateData };

    // Update local cache optimistically
    const newCache = new Map(localTaskCache);
    newCache.set(taskId, updatedTask);
    setLocalTaskCache(newCache);

    // Update tasks array optimistically
    const optimisticTasks = tasks.map((task) => (task.id === taskId ? updatedTask : task));
    setTasks(optimisticTasks);

    try {
      // Perform the actual API update
      await taskApiService.updateTechnicalPlanItem(taskId, itemId, 'approved');

      // Emit event for real-time sync to other clients
      taskSyncService.emitTaskUpdated(updatedTask);
    } catch (error) {
      console.error(`Error approving technical plan item ${itemId}:`, error);
      setError('Failed to approve technical plan item');

      // Revert to previous state on error
      setTasks(tasks);

      // Refresh data from server to ensure consistency
      refreshTasks();
    }
  };

  // Veto (delete) a technical plan item
  const vetoTechnicalPlanItem = async (taskId: string, itemId: string) => {
    // Get the current task
    const taskToUpdate = localTaskCache.get(taskId);
    if (!taskToUpdate) {
      console.error(`Task with ID ${taskId} not found in cache`);
      return;
    }

    // Ensure technicalPlanItems exists
    if (!taskToUpdate.technicalPlanItems || taskToUpdate.technicalPlanItems.length === 0) {
      console.error(`Task ${taskId} has no technical plan items`);
      return;
    }

    // Create optimistic update by removing the item
    const updatedItems = taskToUpdate.technicalPlanItems.filter(item => item.id !== itemId);
    const now = new Date().toISOString();

    // Create the update data
    const updateData: Partial<Task> = {
      technicalPlanItems: updatedItems,
      updatedAt: now
    };

    // Create updated task for optimistic update
    const updatedTask = { ...taskToUpdate, ...updateData };

    // Update local cache optimistically
    const newCache = new Map(localTaskCache);
    newCache.set(taskId, updatedTask);
    setLocalTaskCache(newCache);

    // Update tasks array optimistically
    const optimisticTasks = tasks.map((task) => (task.id === taskId ? updatedTask : task));
    setTasks(optimisticTasks);

    try {
      // Perform the actual API update
      await taskApiService.deleteTechnicalPlanItem(taskId, itemId);

      // Emit event for real-time sync to other clients
      taskSyncService.emitTaskUpdated(updatedTask);
    } catch (error) {
      console.error(`Error vetoing technical plan item ${itemId}:`, error);
      setError('Failed to veto technical plan item');

      // Revert to previous state on error
      setTasks(tasks);

      // Refresh data from server to ensure consistency
      refreshTasks();
    }
  };

  // Update technical plan items
  const updateTechnicalPlanItems = async (taskId: string, items: ItemWithStatus[]) => {
    // Get the current task
    const taskToUpdate = localTaskCache.get(taskId);
    if (!taskToUpdate) {
      console.error(`Task with ID ${taskId} not found in cache`);
      return;
    }

    const now = new Date().toISOString();

    // Create the update data
    const updateData: Partial<Task> = {
      technicalPlanItems: items,
      updatedAt: now
    };

    // Create updated task for optimistic update
    const updatedTask = { ...taskToUpdate, ...updateData };

    // Update local cache optimistically
    const newCache = new Map(localTaskCache);
    newCache.set(taskId, updatedTask);
    setLocalTaskCache(newCache);

    // Update tasks array optimistically
    const optimisticTasks = tasks.map((task) => (task.id === taskId ? updatedTask : task));
    setTasks(optimisticTasks);

    try {
      // Perform the actual API update
      await taskApiService.updateTask(taskId, { technicalPlanItems: items });

      // Emit event for real-time sync to other clients
      taskSyncService.emitTaskUpdated(updatedTask);
    } catch (error) {
      console.error(`Error updating technical plan items for task ${taskId}:`, error);
      setError('Failed to update technical plan items');

      // Revert to previous state on error
      setTasks(tasks);

      // Refresh data from server to ensure consistency
      refreshTasks();
    }
  };

  // Approve a next step item
  const approveNextStepItem = async (taskId: string, itemId: string) => {
    // Get the current task
    const taskToUpdate = localTaskCache.get(taskId);
    if (!taskToUpdate) {
      console.error(`Task with ID ${taskId} not found in cache`);
      return;
    }

    // Ensure nextStepItems exists
    if (!taskToUpdate.nextStepItems || taskToUpdate.nextStepItems.length === 0) {
      console.error(`Task ${taskId} has no next step items`);
      return;
    }

    // Find the item
    const itemIndex = taskToUpdate.nextStepItems.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      console.error(`Next step item ${itemId} not found in task ${taskId}`);
      return;
    }

    // Create an optimistic update
    const now = new Date().toISOString();
    const updatedItems = [...taskToUpdate.nextStepItems];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      status: 'approved',
      approvedAt: now,
      updatedAt: now
    };

    // Create the update data
    const updateData: Partial<Task> = {
      nextStepItems: updatedItems,
      updatedAt: now
    };

    // Create updated task for optimistic update
    const updatedTask = { ...taskToUpdate, ...updateData };

    // Update local cache optimistically
    const newCache = new Map(localTaskCache);
    newCache.set(taskId, updatedTask);
    setLocalTaskCache(newCache);

    // Update tasks array optimistically
    const optimisticTasks = tasks.map((task) => (task.id === taskId ? updatedTask : task));
    setTasks(optimisticTasks);

    try {
      // Perform the actual API update
      await taskApiService.updateNextStepItem(taskId, itemId, 'approved');

      // Emit event for real-time sync to other clients
      taskSyncService.emitTaskUpdated(updatedTask);
    } catch (error) {
      console.error(`Error approving next step item ${itemId}:`, error);
      setError('Failed to approve next step item');

      // Revert to previous state on error
      setTasks(tasks);

      // Refresh data from server to ensure consistency
      refreshTasks();
    }
  };

  // Veto (delete) a next step item
  const vetoNextStepItem = async (taskId: string, itemId: string) => {
    // Get the current task
    const taskToUpdate = localTaskCache.get(taskId);
    if (!taskToUpdate) {
      console.error(`Task with ID ${taskId} not found in cache`);
      return;
    }

    // Ensure nextStepItems exists
    if (!taskToUpdate.nextStepItems || taskToUpdate.nextStepItems.length === 0) {
      console.error(`Task ${taskId} has no next step items`);
      return;
    }

    // Create optimistic update by removing the item
    const updatedItems = taskToUpdate.nextStepItems.filter(item => item.id !== itemId);
    const now = new Date().toISOString();

    // Create the update data
    const updateData: Partial<Task> = {
      nextStepItems: updatedItems,
      updatedAt: now
    };

    // Create updated task for optimistic update
    const updatedTask = { ...taskToUpdate, ...updateData };

    // Update local cache optimistically
    const newCache = new Map(localTaskCache);
    newCache.set(taskId, updatedTask);
    setLocalTaskCache(newCache);

    // Update tasks array optimistically
    const optimisticTasks = tasks.map((task) => (task.id === taskId ? updatedTask : task));
    setTasks(optimisticTasks);

    try {
      // Perform the actual API update
      await taskApiService.deleteNextStepItem(taskId, itemId);

      // Emit event for real-time sync to other clients
      taskSyncService.emitTaskUpdated(updatedTask);
    } catch (error) {
      console.error(`Error vetoing next step item ${itemId}:`, error);
      setError('Failed to veto next step item');

      // Revert to previous state on error
      setTasks(tasks);

      // Refresh data from server to ensure consistency
      refreshTasks();
    }
  };

  // Update next step items
  const updateNextStepItems = async (taskId: string, items: ItemWithStatus[]) => {
    // Get the current task
    const taskToUpdate = localTaskCache.get(taskId);
    if (!taskToUpdate) {
      console.error(`Task with ID ${taskId} not found in cache`);
      return;
    }

    const now = new Date().toISOString();

    // Create the update data
    const updateData: Partial<Task> = {
      nextStepItems: items,
      updatedAt: now
    };

    // Create updated task for optimistic update
    const updatedTask = { ...taskToUpdate, ...updateData };

    // Update local cache optimistically
    const newCache = new Map(localTaskCache);
    newCache.set(taskId, updatedTask);
    setLocalTaskCache(newCache);

    // Update tasks array optimistically
    const optimisticTasks = tasks.map((task) => (task.id === taskId ? updatedTask : task));
    setTasks(optimisticTasks);

    try {
      // Perform the actual API update
      await taskApiService.updateTask(taskId, { nextStepItems: items });

      // Emit event for real-time sync to other clients
      taskSyncService.emitTaskUpdated(updatedTask);
    } catch (error) {
      console.error(`Error updating next step items for task ${taskId}:`, error);
      setError('Failed to update next step items');

      // Revert to previous state on error
      setTasks(tasks);

      // Refresh data from server to ensure consistency
      refreshTasks();
    }
  };

  // Agent integration functions
  const addTaskFeedback = async (taskId: string, content: string) => {
    try {
      // Get the current task
      const taskToUpdate = localTaskCache.get(taskId);
      if (!taskToUpdate) {
        console.error(`Task with ID ${taskId} not found in cache`);
        return;
      }
      
      // Add feedback to the task
      const result = await taskApiService.addTaskFeedback(taskId, content);
      
      // Update local state with the server response
      if (result) {
        // Get the updated task
        const updatedTask = result;
        
        // Update local cache
        const newCache = new Map(localTaskCache);
        newCache.set(taskId, updatedTask);
        setLocalTaskCache(newCache);
        
        // Update tasks array
        const optimisticTasks = tasks.map((task) => (task.id === taskId ? updatedTask : task));
        setTasks(optimisticTasks);
        
        // Emit task updated event for real-time sync
        taskSyncService.emitTaskUpdated(updatedTask);
      }
    } catch (error) {
      console.error(`Error adding feedback to task ${taskId}:`, error);
      throw error;
    }
  };
  
  // Launch agent for a task
  const launchAgentForTask = async (taskId: string, mode: 'implement' | 'demo' | 'feedback', feedback?: string) => {
    try {
      // Get the current task
      const taskToUpdate = localTaskCache.get(taskId);
      if (!taskToUpdate) {
        console.error(`Task with ID ${taskId} not found in cache`);
        throw new Error(`Task with ID ${taskId} not found in cache`);
      }
      
      // Prepare agent options
      const options: AgentOptions = {
        taskId,
        mode
      };
      
      // Add feedback if provided
      if (feedback) {
        options.feedback = feedback;
      }
      
      // Launch the agent
      const result = await taskApiService.launchAgentForTask(options);
      
      // Return the result (guaranteed to be non-undefined by this point)
      return result;
    } catch (error) {
      console.error(`Error launching agent for task ${taskId}:`, error);
      throw error;
    }
  };

  const value = {
    tasks,
    loading,
    error,
    completedFilter,
    projectFilter,
    sortBy,
    sortDirection,
    searchTerm,
    setSearchTerm,
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
    updateTask,
    toggleTaskStar,
    // Item status management functions
    approveRequirementItem,
    vetoRequirementItem,
    updateRequirementItems,
    approveTechnicalPlanItem,
    vetoTechnicalPlanItem,
    updateTechnicalPlanItems,
    approveNextStepItem,
    vetoNextStepItem,
    updateNextStepItems,
    // Agent integration functions
    addTaskFeedback,
    launchAgentForTask,
    filteredTasks,
    taskCountsByStatus,
    dedupeEnabled,
    setDedupeEnabled,
    runManualDedupe
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
