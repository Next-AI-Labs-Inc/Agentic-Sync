import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { getTask } from '@/services/taskApiService';
import TaskCard from '@/components/TaskCard';
import BuildDocumentation from '@/components/BuildDocumentation';
import { Task } from '@/types';
import { TaskProvider, useTasks } from '@/contexts/TaskContext';

/**
 * Task detail component that uses the TaskContext
 */
function TaskDetail({ task }: { task: Task }) {
  // Use the Tasks context at the component level
  const { addTaskFeedback, launchAgentForTask } = useTasks();
  
  return (
    <div className="task-single-view">
      <TaskCard 
        task={task}
        onStatusChange={() => Promise.resolve()} // Read-only view
        onMarkTested={() => Promise.resolve()}   // Read-only view
        onDelete={() => Promise.resolve()}       // Read-only view
        onUpdateDate={() => Promise.resolve()}   // Read-only view
        onUpdateTask={() => Promise.resolve()}   // Read-only view
        onToggleStar={() => Promise.resolve()}   // Read-only view
        // Item approval functions (read-only)
        onApproveRequirementItem={() => Promise.resolve()}
        onVetoRequirementItem={() => Promise.resolve()}
        onUpdateRequirementItems={() => Promise.resolve()}
        onApproveTechnicalPlanItem={() => Promise.resolve()}
        onVetoTechnicalPlanItem={() => Promise.resolve()}
        onUpdateTechnicalPlanItems={() => Promise.resolve()}
        onApproveNextStepItem={() => Promise.resolve()}
        onVetoNextStepItem={() => Promise.resolve()}
        onUpdateNextStepItems={() => Promise.resolve()}
        // Agent integration functions - properly passed from context
        onAddFeedback={addTaskFeedback}
        onLaunchAgent={async (taskId, mode, feedback) => {
          // Call the function but don't propagate the return value
          await launchAgentForTask(taskId, mode, feedback);
          return Promise.resolve();
        }}
        expanded={true}           // Always show expanded
        hideExpand={true}         // Hide expand button
      />
      
      {/* Build Documentation Section */}
      <div className="mt-6">
        <BuildDocumentation 
          taskId={task.id} 
          className="bg-white"
        />
      </div>
    </div>
  );
}

/**
 * Individual task view page
 * This page displays a single task by ID
 */
export default function SingleTaskPage() {
  const router = useRouter();
  const { id } = router.query;
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Only proceed when we have an ID from the router
    if (!id) {
      return; // Router query params might not be available yet
    }
    
    const taskId = Array.isArray(id) ? id[0] : id;
    
    if (taskId) {
      setLoading(true);
      
      // First check if we have cached task data
      const cachedTaskJson = localStorage.getItem(`task_cache_${taskId}`);
      
      if (cachedTaskJson) {
        try {
          // Try to parse the cached task data
          const cachedTask = JSON.parse(cachedTaskJson);
          
          // Check if the cached task has sufficient data
          if (cachedTask && cachedTask.id) {
            console.log('Using cached task data:', cachedTask);
            
            // Normalize the task to ensure consistent structure
            const normalizedTask = {
              ...cachedTask,
              id: cachedTask._id || cachedTask.id
            };
            
            // Set the task from cache
            setTask(normalizedTask);
            setLoading(false);
            
            // Clean up the cache after using it
            localStorage.removeItem(`task_cache_${taskId}`);
            return; // Skip API call if we have valid cache data
          }
        } catch (cacheError) {
          console.error('Error parsing cached task data:', cacheError);
          // Continue to API call if cache parsing fails
        }
      }
      
      // If no cache or insufficient cache data, fetch from API
      getTask(taskId)
        .then(taskData => {
          // Ensure the task has an ID property
          if (taskData) {
            const normalizedTask = {
              ...taskData,
              id: taskData._id || taskData.id
            };
            setTask(normalizedTask);
          } else {
            setError('Task not found');
          }
        })
        .catch(err => {
          console.error('Error fetching task:', err);
          setError('Failed to load task. Please try again later.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  return (
    <>
      <Head>
        <title>{task ? `Task: ${task.title}` : 'Task Details'} | IX Projects</title>
        <meta name="description" content="Individual task view" />
      </Head>
      
      <div className="mb-6">
        <Link 
          href={{ 
            pathname: '/tasks',
            // Explicitly omit any query params from the task detail page
            query: {} 
          }} 
          className="text-primary-600 hover:underline mb-4 inline-flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Tasks
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-800 mt-2">Task Details</h1>
        {task && <p className="text-gray-600">Task ID: {task.id}</p>}
      </div>
      
      {/* Loading state */}
      {loading && (
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-6 bg-gray-200 rounded w-2/3"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <div className="mt-4">
            <button 
              onClick={() => router.push({ pathname: '/tasks', query: {} })}
              className="bg-red-100 text-red-800 px-4 py-2 rounded hover:bg-red-200"
            >
              Return to Tasks
            </button>
          </div>
        </div>
      )}
      
      {/* Task display */}
      {!loading && !error && task && (
        <TaskProvider initialCache={new Map([[task.id, task]])}>
          <TaskDetail task={task} />
        </TaskProvider>
      )}
    </>
  );
}