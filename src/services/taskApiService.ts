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
 * Get all tasks with optional filtering
 */
export async function getTasks(filters?: Record<string, string | string[]>) {
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
    
    // Add cache-busting timestamp
    queryParams.append('_t', Date.now().toString());
    
    const url = `/api/developer/tasks?${queryParams.toString()}`;
    console.log(`Fetching tasks from: ${url}`);
    
    const response = await apiClient.get(url);
    
    // Check for and log duplicates before returning
    const tasks = response.data.data;
    if (Array.isArray(tasks)) {
      // Track duplicates by ID
      const idMap = new Map();
      const duplicatesById = [];
      
      // Track duplicates by title+project
      const titleProjectMap = new Map();
      const duplicatesByTitleProject = [];
      
      for (const task of tasks) {
        // ID-based duplicate check
        const id = task._id || task.id;
        if (idMap.has(id)) {
          duplicatesById.push({
            id,
            title: task.title.substring(0, 30) + (task.title.length > 30 ? '...' : ''),
            project: task.project
          });
        } else {
          idMap.set(id, true);
        }
        
        // Title+Project based duplicate check
        const titleProjectKey = `${task.title}:::${task.project}`;
        if (titleProjectMap.has(titleProjectKey)) {
          const existingId = titleProjectMap.get(titleProjectKey);
          if (existingId !== id) { // Don't count if it's the same task (same ID)
            duplicatesByTitleProject.push({
              id,
              existingId,
              title: task.title.substring(0, 30) + (task.title.length > 30 ? '...' : ''),
              project: task.project
            });
          }
        } else {
          titleProjectMap.set(titleProjectKey, id);
        }
      }
      
      // Log duplicate details
      if (duplicatesById.length > 0) {
        console.warn(`API returned ${duplicatesById.length} duplicate task IDs. Examples:`);
        duplicatesById.slice(0, 5).forEach(dup => {
          console.warn(`- ID: ${dup.id}, Title: "${dup.title}", Project: ${dup.project}`);
        });
      }
      
      if (duplicatesByTitleProject.length > 0) {
        console.warn(`API returned ${duplicatesByTitleProject.length} tasks with duplicate title+project but different IDs. Examples:`);
        duplicatesByTitleProject.slice(0, 5).forEach(dup => {
          console.warn(`- "${dup.title}" (Project: ${dup.project}) has IDs: ${dup.id} and ${dup.existingId}`);
        });
      }
      
      console.log(`API returned ${tasks.length} tasks (${idMap.size} unique by ID, ${titleProjectMap.size} unique by title+project)`);
      
      // First deduplicate by ID
      const uniqueTasksById = [];
      const seenIds = new Set();
      for (const task of tasks) {
        const id = task._id || task.id;
        if (!seenIds.has(id)) {
          seenIds.add(id);
          uniqueTasksById.push(task);
        }
      }
      
      // Then deduplicate by title+project
      const uniqueTasks: any[] = [];
      const seenTitleProjects = new Map<string, any>(); // Map from title+project to task
      
      for (const task of uniqueTasksById) {
        const titleProjectKey = `${task.title}:::${task.project}`;
        const id = task._id || task.id;
        
        if (!seenTitleProjects.has(titleProjectKey)) {
          // New title+project combination
          seenTitleProjects.set(titleProjectKey, task);
          uniqueTasks.push(task);
        } else {
          // Title+project exists, keep the newer one
          const existingTask = seenTitleProjects.get(titleProjectKey);
          const existingDate = new Date(existingTask.updatedAt);
          const currentDate = new Date(task.updatedAt);
          
          if (currentDate > existingDate) {
            // Replace the older task with this newer one
            const indexToReplace = uniqueTasks.findIndex(t => 
              (t._id || t.id) === (existingTask._id || existingTask.id)
            );
            
            if (indexToReplace !== -1) {
              uniqueTasks[indexToReplace] = task;
              seenTitleProjects.set(titleProjectKey, task);
              console.log(`Replaced older task "${existingTask.title}" (${existingTask._id || existingTask.id}) with newer version (${id})`);
            }
          } else {
            console.log(`Skipped newer task ID ${id} with duplicate title+project but older date`);
          }
        }
      }
      
      console.log(`Deduplicated ${tasks.length} → ${uniqueTasksById.length} → ${uniqueTasks.length} tasks`);
      return uniqueTasks;
    }
    
    return response.data.data;
  } catch (error) {
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
  } catch (error) {
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
      priority: taskData.priority,
      project: project,
      status: taskData.status || 'todo', // Default to todo if not specified
      initiative: taskData.initiative,
      tags: taskData.tags ? taskData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      verificationSteps: taskData.verificationSteps ? taskData.verificationSteps.split('\n').map(step => step.trim()).filter(Boolean) : [],
      nextSteps: taskData.nextSteps ? taskData.nextSteps.split('\n').map(step => step.trim()).filter(Boolean) : [],
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
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
}

/**
 * Create a new initiative
 */
export async function createInitiative(initiativeData: Partial<Initiative>) {
  try {
    const response = await apiClient.post('/api/initiatives', initiativeData);
    return response.data;
  } catch (error) {
    console.error('Error creating initiative:', error);
    throw error;
  }
}

/**
 * Get all initiatives
 */
export async function getInitiatives() {
  try {
    const response = await apiClient.get('/api/initiatives');
    return response.data;
  } catch (error) {
    console.error('Error fetching initiatives:', error);
    throw error;
  }
}

/**
 * Delete an initiative
 */
export async function deleteInitiative(id: number) {
  try {
    const response = await apiClient.delete(`/api/initiatives/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting initiative ${id}:`, error);
    throw error;
  }
}

/**
 * Update an initiative
 */
export async function updateInitiative(id: number, updateData: Partial<Initiative>) {
  try {
    const response = await apiClient.put(`/api/initiatives/${id}`, updateData);
    return response.data;
  } catch (error) {
    console.error(`Error updating initiative ${id}:`, error);
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
  } catch (error) {
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
    return ['proposed', 'todo', 'in-progress', 'done', 'reviewed'];
  } catch (error) {
    console.error('Error fetching stages:', error);
    return ['proposed', 'todo', 'in-progress', 'done', 'reviewed'];
  }
}

/**
 * Update an existing task
 */
export async function updateTask(id: string, updateData: Partial<Task>) {
  try {
    const response = await apiClient.put(`/api/developer/tasks/${id}`, updateData);
    return response.data.data;
  } catch (error) {
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
  } catch (error) {
    console.error(`Error deleting task ${id}:`, error);
    throw error;
  }
}

/**
 * Update a task's status
 */
export async function updateTaskStatus(id: string, status: 'proposed' | 'todo' | 'in-progress' | 'done' | 'reviewed') {
  const updateData: Partial<Task> = { status };
  
  // Add timestamps for status changes
  if (status === 'done') {
    updateData.completedAt = new Date().toISOString();
  } else if (status === 'reviewed') {
    updateData.reviewedAt = new Date().toISOString();
  }
  
  return updateTask(id, updateData);
}

/**
 * Mark a task as tested
 */
export async function markTaskTested(id: string) {
  return updateTask(id, { 
    tested: true, 
    status: 'done',
    completedAt: new Date().toISOString()
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
  } catch (error) {
    console.error('Error cleaning up duplicate tasks:', error);
    throw error;
  }
}

// Export the API client for direct use
export default apiClient;