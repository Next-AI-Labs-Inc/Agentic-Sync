import { useState, useCallback } from 'react';
import { Task, TaskFormData, ItemWithStatus } from '@/types';
import * as taskApiService from '@/services/taskApiService';
import taskSyncService, { SyncEventType } from '@/services/taskSyncService';
import { sortByNewestFirst, deduplicateTasks } from '@/utils/task';

interface UseTaskOperationsProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  refreshTasks: () => Promise<Task[]>;
}

interface UseTaskOperationsResult {
  // Task management functions
  addTask: (taskData: TaskFormData) => Promise<void>;
  updateTask: (taskId: string, updateData: Partial<Task>) => Promise<void>;
  updateTaskStatus: (
    taskId: string,
    project: string,
    status: 'inbox' | 'brainstorm' | 'proposed' | 'backlog' | 'maybe' | 'todo' | 'in-progress' | 'on-hold' | 'for-review' | 'done' | 'reviewed' | 'archived'
  ) => Promise<void>;
  deleteTask: (taskId: string, project: string) => Promise<void>;
  toggleTaskStar: (taskId: string, project: string) => Promise<void>;
  markTaskTested: (taskId: string, project: string) => Promise<void>;
  updateTaskDate: (taskId: string, project: string, newDate: string) => Promise<void>;
  
  // Item management functions
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
  launchAgentForTask: (
    taskId: string, 
    mode: 'implement' | 'demo' | 'feedback', 
    feedback?: string
  ) => Promise<{success: boolean; message: string; command: string}>;
  
  // Task cache
  localTaskCache: Map<string, Task>;
  
  // Error state
  error: string | null;
  setError: (error: string | null) => void;
}

/**
 * Custom hook for task operations like CRUD and status changes
 */
export function useTaskOperations({
  tasks,
  setTasks,
  refreshTasks
}: UseTaskOperationsProps): UseTaskOperationsResult {
  // Local task cache for optimistic updates
  const [localTaskCache, setLocalTaskCache] = useState<Map<string, Task>>(new Map());
  
  // Error state
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Add a new task
   */
  const addTask = useCallback(async (taskData: TaskFormData) => {
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

    // Add to tasks array optimistically - for adding new tasks
    // We need to sort because new tasks should appear at the top
    setTasks(prevTasks => {
      // Create a new array with the new task and sort
      const newTasks = [...prevTasks, tempTask];
      return sortByNewestFirst(newTasks);
    });

    try {
      // Immediately create task in API
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

        // Replace temp task with real one from server with efficient updates
        setTasks((currentTasks) => {
          // Find the index of the temporary task
          const tempIndex = currentTasks.findIndex((task) => task.id === tempId);
          
          // If temp task not found, just add the real one
          if (tempIndex === -1) {
            const newTasks = [...currentTasks, realTask];
            return sortByNewestFirst(deduplicateTasks(newTasks));
          }
          
          // Create a new array with just the temp task replaced
          const newTasks = [...currentTasks];
          newTasks[tempIndex] = realTask;
          
          // Apply deduplication and sorting
          return sortByNewestFirst(deduplicateTasks(newTasks));
        });

        // Emit event to sync service for real-time updates to other clients
        taskSyncService.emitTaskCreated(realTask);
      }
    } catch (error) {
      console.error('Error finalizing task creation:', error);
      // Silent failure - keep the optimistic task in UI to prevent disruption
      // We could add a toast notification here in the future
    }
  }, [tasks, localTaskCache, setTasks]);

  /**
   * Update an existing task
   */
  const updateTask = useCallback(async (taskId: string, updateData: Partial<Task>) => {
    try {
      const updatedTask = await taskApiService.updateTask(taskId, updateData);
      
      // Update the task in local state with memory-efficient approach
      setTasks(currentTasks => {
        // Find the index of the task to update
        const index = currentTasks.findIndex(t => t.id === taskId);
        if (index === -1) return currentTasks; // Not found, no change needed
        
        // Create a new array with just the specific task updated
        const newTasks = [...currentTasks];
        newTasks[index] = { ...newTasks[index], ...updateData };
        return newTasks;
      });
      
      // Update the task in local cache
      setLocalTaskCache(cache => {
        const newCache = new Map(cache);
        const existingTask = newCache.get(taskId);
        if (existingTask) {
          newCache.set(taskId, { ...existingTask, ...updateData });
        }
        return newCache;
      });
      
      // Emit update event
      if (updatedTask) {
        taskSyncService.emitTaskUpdated(updatedTask);
      }
      
      return updatedTask;
    } catch (error) {
      console.error(`Error updating task ${taskId}:`, error);
      setError(`Failed to update task: ${error.message}`);
      throw error;
    }
  }, [setTasks]);

  /**
   * Update a task's status
   */
  const updateTaskStatus = useCallback(async (
    taskId: string,
    project: string,
    status: 'inbox' | 'brainstorm' | 'proposed' | 'backlog' | 'maybe' | 'todo' | 'in-progress' | 'on-hold' | 'for-review' | 'done' | 'reviewed' | 'archived'
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

    // Update tasks array optimistically with minimal object creation
    // Instead of copying the entire array and then sorting, we use React's state updater pattern
    // to modify only the specific task that changed
    setTasks(prevTasks => {
      // Find the index of the task to update
      const index = prevTasks.findIndex(t => t.id === taskId);
      if (index === -1) return prevTasks; // Task not found, return unchanged
      
      // Create a new array with just the one task replaced
      const newTasks = [...prevTasks];
      newTasks[index] = updatedTask;
      
      // Sort only when necessary - most operations shouldn't affect sort order
      // This avoids the memory-intensive operation of sorting the entire array on every update
      return sortByNewestFirst(newTasks);
    });

    try {
      // Perform the actual API update
      await taskApiService.updateTaskStatus(taskId, status);

      // Emit event for real-time sync to other clients
      taskSyncService.emitTaskUpdated(updatedTask);

      // No need to refresh tasks as we've already updated locally
    } catch (error) {
      console.error('Error updating task status:', error);
      setError('Failed to update task status');

      // Revert to previous state on error
      setTasks(tasks);

      // Refresh data from server to ensure consistency
      refreshTasks();
    }
  }, [tasks, localTaskCache, setTasks, refreshTasks]);

  /**
   * Delete a task
   */
  const deleteTask = useCallback(async (taskId: string, project: string) => {
    // Optimistically remove the task from the UI immediately
    const taskToDelete = localTaskCache.get(taskId);
    if (!taskToDelete) {
      console.error(`Task with ID ${taskId} not found in cache`);
      return;
    }

    // Remove from tasks array using functional update
    // This avoids creating an intermediate array with all tasks
    setTasks(prevTasks => {
      // Find the index of the task to remove
      const index = prevTasks.findIndex(t => t.id === taskId);
      if (index === -1) return prevTasks; // Task not found, return unchanged
      
      // Create a new array without the deleted task
      const newTasks = [...prevTasks];
      newTasks.splice(index, 1);
      return newTasks;
    });

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
  }, [tasks, localTaskCache, setTasks, refreshTasks]);

  /**
   * Toggle a task's star status
   */
  const toggleTaskStar = useCallback(async (taskId: string, project: string) => {
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

    // Update tasks array optimistically with efficient memory usage
    setTasks(prevTasks => {
      // Find the index of the task to update
      const index = prevTasks.findIndex(t => t.id === taskId);
      if (index === -1) return prevTasks; // Task not found, return unchanged
      
      // Create a new array with just the one task replaced
      const newTasks = [...prevTasks];
      newTasks[index] = updatedTask;
      return newTasks;
    });

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
  }, [tasks, localTaskCache, setTasks, refreshTasks]);

  /**
   * Mark a task as tested
   */
  const markTaskTested = useCallback(async (taskId: string, project: string) => {
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

    // Update tasks array optimistically with memory-efficient updates
    setTasks(prevTasks => {
      // Find the index of the task to update
      const index = prevTasks.findIndex(t => t.id === taskId);
      if (index === -1) return prevTasks; // Task not found, return unchanged
      
      // Create a new array with just the one task replaced
      const newTasks = [...prevTasks];
      newTasks[index] = updatedTask;
      
      // Sort only when necessary (completion status affects sorting in some views)
      return sortByNewestFirst(newTasks);
    });

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
  }, [tasks, localTaskCache, setTasks, refreshTasks]);

  /**
   * Update a task's creation date
   */
  const updateTaskDate = useCallback(async (taskId: string, project: string, newDate: string) => {
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

    // Update tasks array optimistically with memory-efficient update
    setTasks(prevTasks => {
      // Find the index of the task to update
      const index = prevTasks.findIndex(t => t.id === taskId);
      if (index === -1) return prevTasks; // Task not found, return unchanged
      
      // Create a new array with just the one task replaced
      const newTasks = [...prevTasks];
      newTasks[index] = updatedTask;
      
      // Only resort in cases where the createdAt date changes
      // as that's the only change that would affect sorting order
      return sortByNewestFirst(newTasks);
    });

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
  }, [tasks, localTaskCache, setTasks, refreshTasks]);

  // === Item status management functions ===

  /**
   * Approve a requirement item
   */
  const approveRequirementItem = useCallback(async (taskId: string, itemId: string) => {
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

    // Update tasks array optimistically with memory-efficient approach
    setTasks(prevTasks => {
      // Find the index of the task to update
      const index = prevTasks.findIndex(t => t.id === taskId);
      if (index === -1) return prevTasks; // Task not found, return unchanged
      
      // Create a new array with just the one task replaced
      const newTasks = [...prevTasks];
      newTasks[index] = updatedTask;
      return newTasks;
    });

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
  }, [tasks, localTaskCache, setTasks, refreshTasks]);

  /**
   * Veto (delete) a requirement item
   */
  const vetoRequirementItem = useCallback(async (taskId: string, itemId: string) => {
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

    // Update tasks array optimistically with memory-efficient approach
    setTasks(prevTasks => {
      // Find the index of the task to update
      const index = prevTasks.findIndex(t => t.id === taskId);
      if (index === -1) return prevTasks; // Task not found, return unchanged
      
      // Create a new array with just the one task replaced
      const newTasks = [...prevTasks];
      newTasks[index] = updatedTask;
      return newTasks;
    });

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
  }, [tasks, localTaskCache, setTasks, refreshTasks]);

  /**
   * Update requirement items
   */
  const updateRequirementItems = useCallback(async (taskId: string, items: ItemWithStatus[]) => {
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

    // Update tasks array optimistically with memory-efficient approach
    setTasks(prevTasks => {
      // Find the index of the task to update
      const index = prevTasks.findIndex(t => t.id === taskId);
      if (index === -1) return prevTasks; // Task not found, return unchanged
      
      // Create a new array with just the one task replaced
      const newTasks = [...prevTasks];
      newTasks[index] = updatedTask;
      return newTasks;
    });

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
  }, [tasks, localTaskCache, setTasks, refreshTasks]);

  /**
   * Approve a technical plan item
   */
  const approveTechnicalPlanItem = useCallback(async (taskId: string, itemId: string) => {
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

    // Update tasks array optimistically with memory-efficient approach
    setTasks(prevTasks => {
      // Find the index of the task to update
      const index = prevTasks.findIndex(t => t.id === taskId);
      if (index === -1) return prevTasks; // Task not found, return unchanged
      
      // Create a new array with just the one task replaced
      const newTasks = [...prevTasks];
      newTasks[index] = updatedTask;
      return newTasks;
    });

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
  }, [tasks, localTaskCache, setTasks, refreshTasks]);

  /**
   * Veto (delete) a technical plan item
   */
  const vetoTechnicalPlanItem = useCallback(async (taskId: string, itemId: string) => {
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

    // Update tasks array optimistically with memory-efficient approach
    setTasks(prevTasks => {
      // Find the index of the task to update
      const index = prevTasks.findIndex(t => t.id === taskId);
      if (index === -1) return prevTasks; // Task not found, return unchanged
      
      // Create a new array with just the one task replaced
      const newTasks = [...prevTasks];
      newTasks[index] = updatedTask;
      return newTasks;
    });

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
  }, [tasks, localTaskCache, setTasks, refreshTasks]);

  /**
   * Update technical plan items
   */
  const updateTechnicalPlanItems = useCallback(async (taskId: string, items: ItemWithStatus[]) => {
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

    // Update tasks array optimistically with memory-efficient approach
    setTasks(prevTasks => {
      // Find the index of the task to update
      const index = prevTasks.findIndex(t => t.id === taskId);
      if (index === -1) return prevTasks; // Task not found, return unchanged
      
      // Create a new array with just the one task replaced
      const newTasks = [...prevTasks];
      newTasks[index] = updatedTask;
      return newTasks;
    });

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
  }, [tasks, localTaskCache, setTasks, refreshTasks]);

  /**
   * Approve a next step item
   */
  const approveNextStepItem = useCallback(async (taskId: string, itemId: string) => {
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

    // Update tasks array optimistically with memory-efficient approach
    setTasks(prevTasks => {
      // Find the index of the task to update
      const index = prevTasks.findIndex(t => t.id === taskId);
      if (index === -1) return prevTasks; // Task not found, return unchanged
      
      // Create a new array with just the one task replaced
      const newTasks = [...prevTasks];
      newTasks[index] = updatedTask;
      return newTasks;
    });

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
  }, [tasks, localTaskCache, setTasks, refreshTasks]);

  /**
   * Veto (delete) a next step item
   */
  const vetoNextStepItem = useCallback(async (taskId: string, itemId: string) => {
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

    // Update tasks array optimistically with memory-efficient approach
    setTasks(prevTasks => {
      // Find the index of the task to update
      const index = prevTasks.findIndex(t => t.id === taskId);
      if (index === -1) return prevTasks; // Task not found, return unchanged
      
      // Create a new array with just the one task replaced
      const newTasks = [...prevTasks];
      newTasks[index] = updatedTask;
      return newTasks;
    });

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
  }, [tasks, localTaskCache, setTasks, refreshTasks]);

  /**
   * Update next step items
   */
  const updateNextStepItems = useCallback(async (taskId: string, items: ItemWithStatus[]) => {
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

    // Update tasks array optimistically with memory-efficient approach
    setTasks(prevTasks => {
      // Find the index of the task to update
      const index = prevTasks.findIndex(t => t.id === taskId);
      if (index === -1) return prevTasks; // Task not found, return unchanged
      
      // Create a new array with just the one task replaced
      const newTasks = [...prevTasks];
      newTasks[index] = updatedTask;
      return newTasks;
    });

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
  }, [tasks, localTaskCache, setTasks, refreshTasks]);

  /**
   * Add feedback to a task
   */
  const addTaskFeedback = useCallback(async (taskId: string, content: string) => {
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
        
        // Update tasks array with memory-efficient approach
        setTasks(prevTasks => {
          // Find the index of the task to update
          const index = prevTasks.findIndex(t => t.id === taskId);
          if (index === -1) return prevTasks; // Task not found, return unchanged
          
          // Create a new array with just the one task replaced
          const newTasks = [...prevTasks];
          newTasks[index] = updatedTask;
          return newTasks;
        });
        
        // Emit task updated event for real-time sync
        taskSyncService.emitTaskUpdated(updatedTask);
      }
    } catch (error) {
      console.error(`Error adding feedback to task ${taskId}:`, error);
      setError(`Failed to add feedback: ${error.message}`);
      throw error;
    }
  }, [tasks, localTaskCache, setTasks]);

  /**
   * Launch an agent for a task
   */
  const launchAgentForTask = useCallback(async (
    taskId: string, 
    mode: 'implement' | 'demo' | 'feedback', 
    feedback?: string
  ) => {
    try {
      // Get the current task
      const taskToUpdate = localTaskCache.get(taskId);
      if (!taskToUpdate) {
        console.error(`Task with ID ${taskId} not found in cache`);
        throw new Error(`Task with ID ${taskId} not found in cache`);
      }
      
      // Prepare agent options
      const options = {
        taskId,
        mode,
        feedback
      };
      
      // Launch the agent
      const result = await taskApiService.launchAgentForTask(options);
      
      // Return the result
      return result;
    } catch (error) {
      console.error(`Error launching agent for task ${taskId}:`, error);
      setError(`Failed to launch agent: ${error.message}`);
      throw error;
    }
  }, [localTaskCache]);

  return {
    // Task management functions
    addTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    toggleTaskStar,
    markTaskTested,
    updateTaskDate,
    
    // Item management functions
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
    
    // Task cache
    localTaskCache,
    
    // Error state
    error,
    setError
  };
}