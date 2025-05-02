import axios from 'axios';
import { Task, TaskFormData, Initiative, SystemPrompt, AgentOptions } from '@/types';

// Task API configuration
// For Tauri production builds, use the production API URL
const isTauriBuild = process.env.TAURI_BUILD === 'true';
const isVercelProduction = process.env.VERCEL_ENV === 'production';
const PRODUCTION_API_URL = 'https://api.ixcoach.com';

// Use production API URL for both Tauri builds and Vercel production deployments
const API_URL = (isTauriBuild || isVercelProduction) ? PRODUCTION_API_URL : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002');
const API_KEY = process.env.NEXT_PUBLIC_TASK_API_KEY || 'dev-api-key';

// Log API configuration
console.log(`📡 Task API Configuration:
- Environment: ${isTauriBuild ? 'PRODUCTION (Tauri Build)' : isVercelProduction ? 'PRODUCTION (Vercel)' : 'DEVELOPMENT'}
- API URL: ${API_URL}
- API Key: ${API_KEY.substring(0, 3)}...`);

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
      markdown: taskData.markdown,
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
    
    // Add URL for easy access by AI agents
    if (createdTask && createdTask.id && typeof window !== 'undefined') {
      const baseUrl = window.location.origin;
      createdTask.url = `${baseUrl}/task/${createdTask.id}`;
      
      // Update the task with the URL
      try {
        await apiClient.put(`/api/developer/tasks/${createdTask.id}`, { url: createdTask.url });
      } catch (urlError) {
        console.warn('Failed to update task with URL, but continuing:', urlError);
      }
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
 * 
 * This implementation properly uses the server API to store task stages,
 * rather than using localStorage which doesn't work consistently with SSR.
 */
export async function updateStages(stages: string[]) {
  try {
    // Send stages to API for persistent storage
    const response = await apiClient.post('/api/developer/config/stages', { stages });
    return response.data;
  } catch (error: any) {
    console.error('Error updating stages:', error);
    
    // Fallback to client-side storage if API fails
    // This ensures the app continues to work during API issues
    if (typeof window !== 'undefined') {
      console.log('API failed, using fallback client storage for stages');
      // Use sessionStorage instead of localStorage for better security
      sessionStorage.setItem('taskStages_fallback', JSON.stringify(stages));
    }
    
    // Still throw the error to inform calling code of the API failure
    throw error;
  }
}

/**
 * Get available stages
 * 
 * This implementation properly uses the server API to retrieve task stages,
 * with proper SSR support and fallbacks.
 */
export async function getStages(): Promise<string[]> {
  // Default stages to use if server doesn't have any stored
  const defaultStages = [
    'brainstorm', 'proposed', 'backlog', 'todo', 
    'in-progress', 'on-hold', 'done', 'reviewed', 'archived'
  ];
  
  try {
    // Get stages from the API
    const response = await apiClient.get('/api/developer/config/stages');
    
    // If API returns stages, use them
    if (response.data && Array.isArray(response.data.stages) && response.data.stages.length > 0) {
      return response.data.stages;
    }
    
    // Check for fallback storage
    if (typeof window !== 'undefined') {
      const fallbackStages = sessionStorage.getItem('taskStages_fallback');
      if (fallbackStages) {
        try {
          const parsed = JSON.parse(fallbackStages);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch (e) {
          console.error('Error parsing fallback stages:', e);
        }
      }
    }
    
    // If no stages found in API or fallback, return defaults
    return defaultStages;
  } catch (error: any) {
    console.error('Error fetching stages from API:', error);
    
    // Check for fallback storage
    if (typeof window !== 'undefined') {
      const fallbackStages = sessionStorage.getItem('taskStages_fallback');
      if (fallbackStages) {
        try {
          const parsed = JSON.parse(fallbackStages);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch (e) {
          console.error('Error parsing fallback stages:', e);
        }
      }
    }
    
    // Return default stages as last resort
    return defaultStages;
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
 * Toggle a task's starred status
 */
export async function toggleTaskStar(id: string, currentStarred: boolean) {
  try {
    const response = await apiClient.put(`/api/developer/tasks/${id}`, { 
      starred: !currentStarred 
    });
    return response.data.data;
  } catch (error: any) {
    console.error(`Error toggling starred status for task ${id}:`, error);
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

/**
 * Mark a task as complete and shut down the system
 * 
 * Used to signal task completion and trigger a graceful shutdown
 * 
 * @param id The task ID to mark complete
 * @returns Response data with shutdown message
 */
export async function completeTaskAndShutdown(id: string) {
  try {
    // First mark the task as completed
    const updatedTask = await updateTask(id, {
      status: 'reviewed',
      completedAt: new Date().toISOString(),
      reviewedAt: new Date().toISOString()
    });
    
    console.log('Task completed successfully. Shutting down...');
    
    // Signal successful task completion
    return {
      success: true,
      message: 'Task completed and system shutdown initiated',
      task: updatedTask
    };
  } catch (error: any) {
    console.error(`Error completing task ${id}:`, error);
    throw error;
  }
}

// =====================================================================
// Item Status Management (Requirements, Technical Plan, Next Steps)
// =====================================================================

/**
 * Add a new requirement item to a task
 * 
 * @param taskId Task ID
 * @param content Item content
 * @returns Updated task
 */
export async function addRequirementItem(taskId: string, content: string) {
  try {
    const now = new Date().toISOString();
    const newItem = {
      content,
      status: 'proposed',
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now
    };
    
    const response = await apiClient.post(`/api/developer/tasks/${taskId}/requirement-item`, newItem);
    return response.data.data;
  } catch (error: any) {
    console.error(`Error adding requirement item to task ${taskId}:`, error);
    throw error;
  }
}

/**
 * Update a requirement item's status
 * 
 * @param taskId Task ID
 * @param itemId Item ID
 * @param status New status ('proposed' or 'approved')
 * @param content Optional new content if being edited
 * @returns Updated task
 */
export async function updateRequirementItem(taskId: string, itemId: string, status: 'proposed' | 'approved', content?: string) {
  try {
    console.log(`📝 [API] updateRequirementItem: Starting request for task ${taskId}, item ${itemId}`);
    
    const updateData: any = {
      status
    };
    
    if (content !== undefined) {
      updateData.content = content;
    }
    
    // Add timestamp if being approved
    if (status === 'approved') {
      updateData.approvedAt = new Date().toISOString();
    }
    
    updateData.updatedAt = new Date().toISOString();
    
    console.log(`📝 [API] updateRequirementItem: Sending payload:`, JSON.stringify(updateData, null, 2));
    
    const endpoint = `/api/developer/tasks/${taskId}/requirement-item/${itemId}`;
    console.log(`📝 [API] updateRequirementItem: PUT ${endpoint}`);
    
    const startTime = performance.now();
    const response = await apiClient.put(endpoint, updateData);
    const endTime = performance.now();
    
    console.log(`✅ [API] updateRequirementItem: Request completed in ${(endTime - startTime).toFixed(2)}ms`);
    console.log(`✅ [API] updateRequirementItem: Response status: ${response.status}`);
    console.log(`✅ [API] updateRequirementItem: Response data:`, JSON.stringify(response.data, null, 2));
    
    return response.data.data;
  } catch (error: any) {
    console.error(`❌ [API] updateRequirementItem: Error updating requirement item ${itemId} for task ${taskId}:`, error);
    console.error(`❌ [API] updateRequirementItem: Error details:`, error.response?.data || error.message);
    throw error;
  }
}

/**
 * Delete a requirement item
 * 
 * @param taskId Task ID
 * @param itemId Item ID
 * @returns Updated task
 */
export async function deleteRequirementItem(taskId: string, itemId: string) {
  try {
    const response = await apiClient.delete(`/api/developer/tasks/${taskId}/requirement-item/${itemId}`);
    return response.data.data;
  } catch (error: any) {
    console.error(`Error deleting requirement item ${itemId} from task ${taskId}:`, error);
    throw error;
  }
}

/**
 * Add a new technical plan item to a task
 * 
 * @param taskId Task ID
 * @param content Item content
 * @returns Updated task
 */
export async function addTechnicalPlanItem(taskId: string, content: string) {
  try {
    const now = new Date().toISOString();
    const newItem = {
      content,
      status: 'proposed',
      id: `tp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now
    };
    
    const response = await apiClient.post(`/api/developer/tasks/${taskId}/technical-plan-item`, newItem);
    return response.data.data;
  } catch (error: any) {
    console.error(`Error adding technical plan item to task ${taskId}:`, error);
    throw error;
  }
}

/**
 * Update a technical plan item's status
 * 
 * @param taskId Task ID
 * @param itemId Item ID
 * @param status New status ('proposed' or 'approved')
 * @param content Optional new content if being edited
 * @returns Updated task
 */
export async function updateTechnicalPlanItem(taskId: string, itemId: string, status: 'proposed' | 'approved', content?: string) {
  try {
    console.log(`📝 [API] updateTechnicalPlanItem: Starting request for task ${taskId}, item ${itemId}`);
    
    const updateData: any = {
      status
    };
    
    if (content !== undefined) {
      updateData.content = content;
    }
    
    // Add timestamp if being approved
    if (status === 'approved') {
      updateData.approvedAt = new Date().toISOString();
    }
    
    updateData.updatedAt = new Date().toISOString();
    
    console.log(`📝 [API] updateTechnicalPlanItem: Sending payload:`, JSON.stringify(updateData, null, 2));
    
    const endpoint = `/api/developer/tasks/${taskId}/technical-plan-item/${itemId}`;
    console.log(`📝 [API] updateTechnicalPlanItem: PUT ${endpoint}`);
    
    const startTime = performance.now();
    const response = await apiClient.put(endpoint, updateData);
    const endTime = performance.now();
    
    console.log(`✅ [API] updateTechnicalPlanItem: Request completed in ${(endTime - startTime).toFixed(2)}ms`);
    console.log(`✅ [API] updateTechnicalPlanItem: Response status: ${response.status}`);
    console.log(`✅ [API] updateTechnicalPlanItem: Response data:`, JSON.stringify(response.data, null, 2));
    
    return response.data.data;
  } catch (error: any) {
    console.error(`❌ [API] updateTechnicalPlanItem: Error updating technical plan item ${itemId} for task ${taskId}:`, error);
    console.error(`❌ [API] updateTechnicalPlanItem: Error details:`, error.response?.data || error.message);
    throw error;
  }
}

/**
 * Delete a technical plan item
 * 
 * @param taskId Task ID
 * @param itemId Item ID
 * @returns Updated task
 */
export async function deleteTechnicalPlanItem(taskId: string, itemId: string) {
  try {
    const response = await apiClient.delete(`/api/developer/tasks/${taskId}/technical-plan-item/${itemId}`);
    return response.data.data;
  } catch (error: any) {
    console.error(`Error deleting technical plan item ${itemId} from task ${taskId}:`, error);
    throw error;
  }
}

/**
 * Add a new next step item to a task
 * 
 * @param taskId Task ID
 * @param content Item content
 * @returns Updated task
 */
export async function addNextStepItem(taskId: string, content: string) {
  try {
    const now = new Date().toISOString();
    const newItem = {
      content,
      status: 'proposed',
      id: `ns-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now
    };
    
    const response = await apiClient.post(`/api/developer/tasks/${taskId}/next-step-item`, newItem);
    return response.data.data;
  } catch (error: any) {
    console.error(`Error adding next step item to task ${taskId}:`, error);
    throw error;
  }
}

/**
 * Update a next step item's status
 * 
 * @param taskId Task ID
 * @param itemId Item ID
 * @param status New status ('proposed' or 'approved')
 * @param content Optional new content if being edited
 * @returns Updated task
 */
export async function updateNextStepItem(taskId: string, itemId: string, status: 'proposed' | 'approved', content?: string) {
  try {
    const updateData: any = {
      status
    };
    
    if (content !== undefined) {
      updateData.content = content;
    }
    
    // Add timestamp if being approved
    if (status === 'approved') {
      updateData.approvedAt = new Date().toISOString();
    }
    
    updateData.updatedAt = new Date().toISOString();
    
    const response = await apiClient.put(`/api/developer/tasks/${taskId}/next-step-item/${itemId}`, updateData);
    return response.data.data;
  } catch (error: any) {
    console.error(`Error updating next step item ${itemId} for task ${taskId}:`, error);
    throw error;
  }
}

/**
 * Delete a next step item
 * 
 * @param taskId Task ID
 * @param itemId Item ID
 * @returns Updated task
 */
export async function deleteNextStepItem(taskId: string, itemId: string) {
  try {
    const response = await apiClient.delete(`/api/developer/tasks/${taskId}/next-step-item/${itemId}`);
    return response.data.data;
  } catch (error: any) {
    console.error(`Error deleting next step item ${itemId} from task ${taskId}:`, error);
    throw error;
  }
}

// =====================================================================
// Feedback Management Functions
// =====================================================================

/**
 * Add feedback to a task
 * 
 * @param taskId Task ID
 * @param content Feedback content
 * @returns Updated task
 */
export async function addTaskFeedback(taskId: string, content: string) {
  try {
    const now = new Date().toISOString();
    const newFeedback = {
      id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content,
      createdAt: now,
      createdBy: 'admin', // Default to admin, can be updated with actual user later
      resolved: false
    };
    
    // Use the update task endpoint to add feedback
    const response = await apiClient.post(`/api/developer/tasks/${taskId}/feedback`, newFeedback);
    return response.data.data;
  } catch (error: any) {
    console.error(`Error adding feedback to task ${taskId}:`, error);
    throw error;
  }
}

/**
 * Mark feedback as resolved
 * 
 * @param taskId Task ID
 * @param feedbackId Feedback ID
 * @returns Updated task
 */
export async function resolveTaskFeedback(taskId: string, feedbackId: string) {
  try {
    const now = new Date().toISOString();
    const updateData = {
      resolved: true,
      resolvedAt: now
    };
    
    const response = await apiClient.put(
      `/api/developer/tasks/${taskId}/feedback/${feedbackId}`, 
      updateData
    );
    return response.data.data;
  } catch (error: any) {
    console.error(`Error resolving feedback ${feedbackId} for task ${taskId}:`, error);
    throw error;
  }
}

// =====================================================================
// System Prompt Management Functions
// =====================================================================

/**
 * Get all system prompts
 * 
 * Fetches system prompts from the API with proper SSR support
 * 
 * @returns Array of system prompts
 */
export async function getSystemPrompts() {
  // Define default prompts to use if API fails
  const defaultPrompts = [
    {
      id: 'default-implementation',
      name: 'Default Implementation Prompt',
      content: 'You are an AI assistant tasked with implementing this feature. Review the task details, requirements, and technical plan, then implement the solution.',
      type: 'implementation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDefault: true
    },
    {
      id: 'default-demo',
      name: 'Default Demo Prompt',
      content: 'You are an AI assistant tasked with demonstrating how this feature works. Set up the necessary environment, execute the relevant commands, and show the feature in action.',
      type: 'demo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDefault: true
    },
    {
      id: 'default-feedback',
      name: 'Default Feedback Prompt',
      content: 'You are an AI assistant tasked with addressing feedback on this task. Review the task and feedback, then implement the necessary changes.',
      type: 'feedback',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDefault: true
    }
  ];
  
  try {
    // Fetch prompts from API
    const response = await apiClient.get('/api/developer/system-prompts');
    
    // If API returns prompts, use them
    if (response.data && Array.isArray(response.data.prompts) && response.data.prompts.length > 0) {
      return response.data.prompts;
    }
    
    // If API returns no prompts, create defaults on server
    try {
      const createResponse = await apiClient.post('/api/developer/system-prompts/batch', {
        prompts: defaultPrompts
      });
      
      if (createResponse.data && Array.isArray(createResponse.data.prompts)) {
        return createResponse.data.prompts;
      }
    } catch (createError) {
      console.error('Failed to create default prompts on server:', createError);
    }
    
    // Return defaults as last resort
    return defaultPrompts;
  } catch (error) {
    console.error('Error fetching system prompts from API:', error);
    
    // Check if we have any stored in session for emergency fallback
    if (typeof window !== 'undefined') {
      try {
        const storedPrompts = sessionStorage.getItem('systemPrompts_fallback');
        if (storedPrompts) {
          const parsed = JSON.parse(storedPrompts);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (parseError) {
        console.error('Error parsing stored prompts:', parseError);
      }
    }
    
    // Store defaults in session storage as emergency fallback
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('systemPrompts_fallback', JSON.stringify(defaultPrompts));
    }
    
    return defaultPrompts;
  }
}

/**
 * Get a system prompt by ID
 * 
 * Fetches a specific system prompt by ID from the API
 * 
 * @param id Prompt ID
 * @returns System prompt
 */
export async function getSystemPrompt(id: string) {
  try {
    // Try to get the prompt directly from the API
    const response = await apiClient.get(`/api/developer/system-prompts/${id}`);
    
    if (response.data && response.data.prompt) {
      return response.data.prompt;
    }
    
    // If direct API call fails, try getting from all prompts
    const prompts = await getSystemPrompts();
    const prompt = prompts.find((p: any) => p.id === id);
    
    if (!prompt) {
      throw new Error(`System prompt with ID ${id} not found`);
    }
    
    return prompt;
  } catch (error: any) {
    console.error(`Error fetching system prompt ${id}:`, error);
    throw error;
  }
}

/**
 * Create a new system prompt
 * 
 * Creates a new system prompt via the API
 * 
 * @param promptData Prompt data
 * @returns Created system prompt
 */
export async function createSystemPrompt(promptData: Omit<SystemPrompt, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    // Create prompt via API
    const response = await apiClient.post('/api/developer/system-prompts', promptData);
    
    if (response.data && response.data.prompt) {
      // Update local cache if we're using it as fallback
      if (typeof window !== 'undefined') {
        try {
          const storedPrompts = sessionStorage.getItem('systemPrompts_fallback');
          if (storedPrompts) {
            const prompts = JSON.parse(storedPrompts);
            if (Array.isArray(prompts)) {
              sessionStorage.setItem(
                'systemPrompts_fallback', 
                JSON.stringify([...prompts, response.data.prompt])
              );
            }
          }
        } catch (e) {
          console.error('Error updating fallback cache:', e);
        }
      }
      
      return response.data.prompt;
    }
    
    throw new Error('API returned invalid data when creating prompt');
  } catch (error: any) {
    console.error('Error creating system prompt:', error);
    throw error;
  }
}

/**
 * Update a system prompt
 * 
 * Updates an existing system prompt via the API
 * 
 * @param id Prompt ID
 * @param updateData Update data
 * @returns Updated system prompt
 */
export async function updateSystemPrompt(id: string, updateData: Partial<SystemPrompt>) {
  try {
    // Update prompt via API
    const response = await apiClient.put(`/api/developer/system-prompts/${id}`, updateData);
    
    if (response.data && response.data.prompt) {
      // Update local cache if we're using it as fallback
      if (typeof window !== 'undefined') {
        try {
          const storedPrompts = sessionStorage.getItem('systemPrompts_fallback');
          if (storedPrompts) {
            const prompts = JSON.parse(storedPrompts);
            if (Array.isArray(prompts)) {
              const updatedPrompts = prompts.map(p => 
                p.id === id ? { ...p, ...updateData, updatedAt: new Date().toISOString() } : p
              );
              sessionStorage.setItem('systemPrompts_fallback', JSON.stringify(updatedPrompts));
            }
          }
        } catch (e) {
          console.error('Error updating fallback cache:', e);
        }
      }
      
      return response.data.prompt;
    }
    
    throw new Error('API returned invalid data when updating prompt');
  } catch (error: any) {
    console.error(`Error updating system prompt ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a system prompt
 * 
 * Deletes a system prompt via the API
 * 
 * @param id Prompt ID
 * @returns Success status
 */
export async function deleteSystemPrompt(id: string) {
  try {
    // First check if this is a default prompt
    const prompt = await getSystemPrompt(id);
    if (prompt && prompt.isDefault) {
      throw new Error('Cannot delete default system prompts');
    }
    
    // Delete prompt via API
    const response = await apiClient.delete(`/api/developer/system-prompts/${id}`);
    
    // Update local cache if we're using it as fallback
    if (typeof window !== 'undefined') {
      try {
        const storedPrompts = sessionStorage.getItem('systemPrompts_fallback');
        if (storedPrompts) {
          const prompts = JSON.parse(storedPrompts);
          if (Array.isArray(prompts)) {
            const filteredPrompts = prompts.filter(p => p.id !== id);
            sessionStorage.setItem('systemPrompts_fallback', JSON.stringify(filteredPrompts));
          }
        }
      } catch (e) {
        console.error('Error updating fallback cache:', e);
      }
    }
    
    return response.data || { success: true };
  } catch (error: any) {
    console.error(`Error deleting system prompt ${id}:`, error);
    throw error;
  }
}

// =====================================================================
// Agent Deployment Functions
// =====================================================================

/**
 * Launch a Claude agent for a task
 * 
 * @param options Agent options (task ID, system prompt, feedback, mode)
 * @returns Success status and message
 */
export async function launchAgentForTask(options: AgentOptions) {
  try {
    console.log('Launching agent with options:', options);
    
    // In a real implementation, this would use an API to launch the agent
    // For now, we'll construct the command that would be run
    
    let systemPrompt = '';
    if (options.systemPromptId) {
      // Get the system prompt by ID
      const prompt = await getSystemPrompt(options.systemPromptId);
      systemPrompt = prompt.content;
    } else if (options.customSystemPrompt) {
      systemPrompt = options.customSystemPrompt;
    } else {
      // Get default prompt for the mode
      const prompts = await getSystemPrompts();
      const defaultPrompt = prompts.find((p: any) => 
        p.type === (options.mode === 'implement' ? 'implementation' : 
                   options.mode === 'demo' ? 'demo' : 'feedback') && 
        p.isDefault
      );
      
      if (defaultPrompt) {
        systemPrompt = defaultPrompt.content;
      } else {
        throw new Error(`No default system prompt found for mode: ${options.mode}`);
      }
    }
    
    // Get the task to include its details
    const task = await getTask(options.taskId);
    
    // Prepare the command that would be run
    // This is just for demonstration; in reality, this would launch a terminal
    const command = constructAgentLaunchCommand(systemPrompt, task, options.feedback, options.mode);
    
    // Return a success response with the command
    return { 
      success: true, 
      message: 'Agent launched successfully',
      command
    };
  } catch (error: any) {
    console.error('Error launching agent:', error);
    throw error;
  }
}

/**
 * Construct the command to launch a Claude agent
 * 
 * @param systemPrompt System prompt
 * @param task Task object
 * @param feedback Optional feedback
 * @param mode Agent mode (implement, demo, feedback)
 * @returns Formatted command string
 */
function constructAgentLaunchCommand(
  systemPrompt: string, 
  task: Task, 
  feedback?: string,
  mode: 'implement' | 'demo' | 'feedback' = 'implement'
) {
  // Build the task context
  const taskContext = `
Task ID: ${task.id}
Title: ${task.title}
Description: ${task.description || 'No description provided'}
Requirements: ${task.requirements || 'No requirements provided'}
Technical Plan: ${task.technicalPlan || 'No technical plan provided'}
Status: ${task.status}
${feedback ? `\nFeedback: ${feedback}` : ''}
  `.trim();
  
  // Format the command
  // In a real implementation, this would launch a terminal with the claude command
  return `cd /Users/jedi/react_projects/ix && claude "${systemPrompt}\n\nHere is the task you need to ${mode === 'implement' ? 'implement' : mode === 'demo' ? 'demonstrate' : 'address feedback for'}:\n\n${taskContext}"`;
}

// Export the API client for direct use
export default apiClient;