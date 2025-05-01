import axios from 'axios';
import { Task, TaskFormData, Initiative } from '@/types';

// Task API configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
const API_KEY = process.env.NEXT_PUBLIC_TASK_API_KEY || 'dev-api-key';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY
  }
});

/**
 * Get all tasks with optional filtering and cancellation support
 */
export async function getTasks(filters?: Record<string, string | string[]>, signal?: AbortSignal) {
  try {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          // Handle array values for multi-select
          value.forEach(v => {
            queryParams.append(`${key}[]`, v);
          });
        } else if (value) {
          queryParams.append(key, value);
        }
      });
    }

    // Add dedup parameter to signal the server to remove duplicates
    queryParams.append('dedup', 'true');
    
    // Only add timestamp in development for debugging
    if (process.env.NODE_ENV === 'development') {
      queryParams.append('_t', Date.now().toString());
    }
    
    const url = `/api/developer/tasks?${queryParams.toString()}`;
    console.log(`Fetching tasks from: ${url}`);
    
    // Add AbortSignal to request config if provided
    const requestConfig = signal ? { signal } : undefined;
    const response = await apiClient.get(url, requestConfig);
    
    // Early exit if request was aborted
    if (signal?.aborted) {
      console.log('Task fetch request was aborted');
      return [];
    }
    
    // Get the tasks from the response
    const tasks = response.data.data;
    if (Array.isArray(tasks)) {
      // Skip deduplication if the server already did it or request was aborted
      if (signal?.aborted) {
        return [];
      }
      
      // Only do minimal normalization without expensive client-side deduplication
      // (the server should be responsible for deduplication)
      const normalizedTasks = tasks.map(task => ({
        ...task,
        id: task._id || task.id // Ensure each task has an id property
      }));
      
      // In development, just log the task count
      if (process.env.NODE_ENV === 'development') {
        console.log(`API returned ${normalizedTasks.length} tasks`);
      }
      
      return normalizedTasks;
    }
    
    return response.data.data;
  } catch (error: any) {
    // Handle aborted requests separately
    if (error.name === 'AbortError' || signal?.aborted) {
      console.log('Task fetch request was aborted');
      return [];
    }
    
    console.error('Error fetching tasks:', error);
    throw error;
  }
}

/**
 * Get a single task by ID
 */
export async function getTask(id: string) {
  try {
    const response = await apiClient.get(`/api/developer/tasks/${id}`);
    return response.data.data;
  } catch (error: any) {
    console.error(`Error fetching task ${id}:`, error);
    throw error;
  }
}

/**
 * Create a new task
 */
export async function createTask(taskData: TaskFormData) {
  try {
    // Handle 'none' project case
    const project = taskData.project === 'none' ? '' : taskData.project;
    
    // Format the task data for the API
    const now = new Date().toISOString();
    const apiTaskData = {
      title: taskData.title,
      description: taskData.description,
      userImpact: taskData.userImpact,
      impactedFunctionality: taskData.impactedFunctionality,
      requirements: taskData.requirements,
      technicalPlan: taskData.technicalPlan,
      priority: taskData.priority,
      project: project,
      status: taskData.status || 'todo', // Default to todo if not specified
      initiative: taskData.initiative,
      tags: taskData.tags ? taskData.tags.split(',').map(tag => tag.trim()).filter(t => t.length > 0) : [],
      verificationSteps: taskData.verificationSteps ? taskData.verificationSteps.split('\n').filter(step => step.length > 0) : [],
      nextSteps: taskData.nextSteps ? taskData.nextSteps.split('\n').filter(step => step.length > 0) : [],
      createdAt: now, // Explicitly set creation date
      updatedAt: now  // Explicitly set updated date
    };

    console.log('Creating task with data:', apiTaskData);
    
    const response = await apiClient.post('/api/developer/tasks', apiTaskData);
    
    // Validate the response data has proper timestamps
    const createdTask = response.data.data;
    
    // Ensure the task has valid timestamps before returning
    if (createdTask && (!createdTask.createdAt || !createdTask.updatedAt)) {
      console.warn('API returned task without proper timestamps, adding them client-side:', createdTask);
      createdTask.createdAt = createdTask.createdAt || now;
      createdTask.updatedAt = createdTask.updatedAt || now;
    }
    
    return createdTask;
  } catch (error: any) {
    console.error('Error creating task:', error);
    throw error;
  }
}

/**
 * Create a new initiative
 * 
 * Creates a new initiative in the database
 * 
 * @param initiativeData - Initiative data to create
 * @returns The created initiative object
 */
export async function createInitiative(initiativeData: Partial<Initiative>) {
  try {
    console.log('Creating initiative:', initiativeData);
    
    // Send the initiative data to the API
    const response = await axios.post('/api/initiatives', initiativeData);
    
    // Return the created initiative
    return response.data;
  } catch (error: any) {
    console.error('Error creating initiative:', error);
    throw error;
  }
}

/**
 * Get all initiatives
 * 
 * Retrieves all initiatives from the database
 * 
 * @returns Array of initiatives
 */
export async function getInitiatives() {
  try {
    console.log('Fetching initiatives');
    
    // Use the dedicated initiatives API
    const response = await axios.get('/api/initiatives');
    
    return response.data;
  } catch (error: any) {
    console.error('Error fetching initiatives:', error);
    
    // Return fallback data in case of error
    console.log('Using fallback initiative data');
    return [
      {
        id: 1,
        name: "User Impact UI Enhancement",
        description: "Improve UI to highlight user impact in task cards",
        status: "in-progress",
        priority: "high",
        startDate: "2025-03-14",
        targetDate: "2025-03-21",
        createdAt: "2025-03-14T09:00:00Z",
        updatedAt: "2025-03-14T14:30:00Z"
      },
      {
        id: 2,
        name: "Task Inline Editing System",
        description: "Implement inline editing for all task fields",
        status: "in-progress",
        priority: "high",
        startDate: "2025-03-13",
        targetDate: "2025-03-25",
        createdAt: "2025-03-13T09:00:00Z",
        updatedAt: "2025-03-13T14:30:00Z"
      }
    ];
  }
}

/**
 * Delete an initiative
 * 
 * Deletes an initiative from the database
 * 
 * @param id - Initiative ID to delete
 * @returns Result of the delete operation
 */
export async function deleteInitiative(id: number) {
  try {
    console.log('Deleting initiative:', id);
    
    // Send delete request to the API
    const response = await axios.delete(`/api/initiatives/${id}`);
    
    return response.data;
  } catch (error: any) {
    console.error('Error deleting initiative:', error);
    throw error;
  }
}

/**
 * Update an initiative
 * 
 * Updates an existing initiative in the database
 * 
 * @param id - Initiative ID to update
 * @param updateData - Data to update
 * @returns The updated initiative
 */
export async function updateInitiative(id: number, updateData: Partial<Initiative>) {
  try {
    console.log('Updating initiative:', id, updateData);
    
    // Send the update data to the API
    const response = await axios.put(`/api/initiatives/${id}`, updateData);
    
    return response.data;
  } catch (error: any) {
    console.error('Error updating initiative:', error);
    throw error;
  }
}

/**
 * Update the stages array
 */
export async function updateStages(stages: string[]) {
  try {
    // Store stages in localStorage for now
    // In a real implementation, these would be stored on the server
    localStorage.setItem('taskStages', JSON.stringify(stages));
    return { success: true };
  } catch (error: any) {
    console.error('Error updating stages:', error);
    throw error;
  }
}

/**
 * Get available stages
 */
export async function getStages(): Promise<string[]> {
  try {
    // Retrieve stages from localStorage
    // In a real implementation, these would come from the server
    const storedStages = localStorage.getItem('taskStages');
    if (storedStages) {
      return JSON.parse(storedStages);
    }
    
    // Default stages if none are stored
    return ['brainstorm', 'proposed', 'backlog', 'todo', 'in-progress', 'on-hold', 'done', 'reviewed', 'archived'];
  } catch (error: any) {
    console.error('Error fetching stages:', error);
    return ['brainstorm', 'proposed', 'backlog', 'todo', 'in-progress', 'on-hold', 'done', 'reviewed', 'archived'];
  }
}

/**
 * Update an existing task
 */
export async function updateTask(id: string, updateData: Partial<Task>) {
  try {
    const response = await apiClient.put(`/api/developer/tasks/${id}`, updateData);
    return response.data.data;
  } catch (error: any) {
    console.error(`Error updating task ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a task
 */
export async function deleteTask(id: string) {
  try {
    const response = await apiClient.delete(`/api/developer/tasks/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error deleting task ${id}:`, error);
    throw error;
  }
}

/**
 * Update a task's status
 */
export async function updateTaskStatus(id: string, status: 'brainstorm' | 'proposed' | 'backlog' | 'todo' | 'in-progress' | 'on-hold' | 'for-review' | 'done' | 'reviewed' | 'archived') {
  const updateData: Partial<Task> = { status };
  
  // Add timestamps for status changes
  if (status === 'for-review') {
    // AI agents mark tasks as for-review when they complete work
    // No timestamp is added yet as this needs human verification
  } else if (status === 'done') {
    // Human reviewers mark for-review tasks as done after verification
    updateData.completedAt = new Date().toISOString();
  } else if (status === 'reviewed') {
    // Final verification stage after completion
    updateData.reviewedAt = new Date().toISOString();
  }
  
  return updateTask(id, updateData);
}

/**
 * Mark a task as tested
 * 
 * AI agents should use this function to mark tasks as tested and ready for review
 */
export async function markTaskTested(id: string) {
  return updateTask(id, { 
    tested: true, 
    status: 'for-review', // AI agents mark tasks as for-review, not done
    // No completedAt timestamp yet - added when human reviewer marks as done
  });
}

/**
 * Clean up duplicate tasks in the database
 * This will identify and remove duplicate tasks based on title+project combinations
 */
export async function cleanupDuplicateTasks() {
  try {
    const response = await apiClient.post('/api/developer/tasks/cleanup-duplicates');
    return response.data;
  } catch (error: any) {
    console.error('Error cleaning up duplicate tasks:', error);
    throw error;
  }
}

// Export the API client for direct use
export default apiClient;