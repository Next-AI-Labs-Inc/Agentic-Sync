/**
 * This script updates all tasks with status "done" that were created by AI agents
 * to have status "for-review" instead.
 * 
 * Execute with: node scripts/update-ai-tasks.js
 */

// Import dependencies
require('dotenv').config();
const axios = require('axios');

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

// Main function to update tasks
async function updateAITasksToForReview() {
  try {
    console.log('Fetching all tasks...');
    const response = await apiClient.get('/api/developer/tasks');
    const tasks = response.data.data;
    
    console.log(`Found ${tasks.length} total tasks`);
    
    // Filter for tasks with status "done" created by AI agents
    // In this case, we're updating all tasks with status "done" since we know they were created by AI
    const aiTasksMarkedDone = tasks.filter(task => task.status === 'done');
    
    console.log(`Found ${aiTasksMarkedDone.length} tasks marked as "done" that need to be updated to "for-review"`);
    
    if (aiTasksMarkedDone.length === 0) {
      console.log('No tasks to update.');
      return;
    }
    
    console.log('Updating tasks...');
    
    // Update each task
    const updatePromises = aiTasksMarkedDone.map(async (task) => {
      try {
        const updateData = {
          status: 'for-review',
          updatedAt: new Date().toISOString()
        };
        
        const updateResponse = await apiClient.put(`/api/developer/tasks/${task.id || task._id}`, updateData);
        console.log(`Updated task: ${task.title} (ID: ${task.id || task._id})`);
        return updateResponse.data;
      } catch (error) {
        console.error(`Error updating task ${task.id || task._id}:`, error.message);
        return null;
      }
    });
    
    // Wait for all updates to complete
    const results = await Promise.all(updatePromises);
    const successCount = results.filter(result => result !== null).length;
    
    console.log(`Successfully updated ${successCount} out of ${aiTasksMarkedDone.length} tasks.`);
    
    if (successCount !== aiTasksMarkedDone.length) {
      console.warn(`Failed to update ${aiTasksMarkedDone.length - successCount} tasks.`);
    }
    
  } catch (error) {
    console.error('Error executing batch update:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Execute the main function
updateAITasksToForReview()
  .then(() => {
    console.log('Batch update completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });