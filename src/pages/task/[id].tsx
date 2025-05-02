import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { getTask, updateTask } from '@/services/taskApiService';
import TaskCard from '@/components/TaskCard';
import BuildDocumentation from '@/components/BuildDocumentation';
import { Task } from '@/types';
import { TaskProvider, useTasks } from '@/contexts/TaskContext';
import { ClickableId } from '@/utils/clickable-id';

/**
 * Task detail component that uses the TaskContext
 */
function TaskDetail({ task }: { task: Task }) {
  // Use the Tasks context at the component level
  const { addTaskFeedback, launchAgentForTask } = useTasks();
  
  // Add state to manage task data locally
  const [localTask, setLocalTask] = useState(task);
  
  // Update local task state if the task prop changes
  useEffect(() => {
    setLocalTask(task);
  }, [task]);
  
  return (
    <div className="task-single-view">
      <TaskCard 
        task={{
          ...localTask,
          // Ensure markdown is properly initialized even if it was empty
          markdown: localTask.markdown || '' 
        }}
        onStatusChange={() => Promise.resolve()} // Read-only view
        onMarkTested={() => Promise.resolve()}   // Read-only view
        onDelete={() => Promise.resolve()}       // Read-only view
        onUpdateDate={() => Promise.resolve()}   // Read-only view
        onUpdateTask={async (taskId, projectId, updates) => {
          try {
            // Update the local state immediately for a responsive UI
            setLocalTask(prevTask => ({
              ...prevTask,
              ...updates
            }));
            
            // Actually update the task through the API
            console.log('Updating task:', taskId, updates);
            const result = await updateTask(taskId, updates);
            console.log('Update result:', result);
            
            return result;
          } catch (err) {
            console.error('Failed to update task:', err);
            // If there was an error, revert the local state
            setLocalTask(task);
            return Promise.resolve();
          }
        }}
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
          taskId={localTask.id} 
          className="bg-white"
        />
      </div>
    </div>
  );
}

/**
 * Get server-side props for the task detail page
 * This provides initial data for the page from the server
 */
export const getServerSideProps = async (context) => {
  const { id } = context.params;
  
  console.log('TASK DETAIL SSR - getServerSideProps called', { 
    params: context.params,
    id,
    requestUrl: context.req.url,
    query: context.query,
    resolvedUrl: context.resolvedUrl
  });
  
  try {
    console.log('TASK DETAIL SSR - Fetching task data');
    const task = await getTask(id);
    
    if (!task) {
      console.log('TASK DETAIL SSR - Task not found');
      return {
        props: {
          initialTask: null,
          error: 'Task not found',
          id,
          routeInfo: {
            resolvedUrl: context.resolvedUrl,
            actualPath: `/task/${id}`
          }
        }
      };
    }
    
    // Normalize the task to ensure consistent structure
    const normalizedTask = {
      ...task,
      id: task._id || task.id
    };
    
    console.log('TASK DETAIL SSR - Task found and normalized');
    return {
      props: {
        initialTask: normalizedTask,
        error: null,
        id, // Always pass the ID from the URL as a prop for direct access
        routeInfo: {
          resolvedUrl: context.resolvedUrl,
          actualPath: `/task/${id}`
        },
        debug: {
          path: `/task/${id}`,
          params: context.params,
          fetchTime: new Date().toISOString()
        }
      }
    };
  } catch (error) {
    console.error('TASK DETAIL SSR - Error fetching task:', error);
    return {
      props: {
        initialTask: null,
        error: 'Failed to load task. Please try again later.',
        id, // Always pass the ID even on error
        routeInfo: {
          resolvedUrl: context.resolvedUrl,
          actualPath: `/task/${id}`
        },
        debug: {
          error: error.message || 'Unknown error',
          path: `/task/${id}`,
          params: context.params
        }
      }
    };
  }
};

/**
 * Individual task view page
 * This page displays a single task by ID
 */
export default function SingleTaskPage({ initialTask, error: initialError, id: staticId, routeInfo }) {
  const router = useRouter();
  // Use the ID provided from getServerSideProps if available (more reliable)
  // Fall back to router.query only if we're missing the static ID
  const routerId = router.query.id;
  const id = staticId || (Array.isArray(routerId) ? routerId[0] : routerId);
  
  const [task, setTask] = useState(initialTask);
  const [loading, setLoading] = useState(!initialTask);
  const [error, setError] = useState(initialError);
  
  // Improve debugging
  useEffect(() => {
    console.log('Task detail component mounted with params:', {
      staticId,
      routerId,
      effectiveId: id,
      initialTask: !!initialTask,
      routerIsReady: router.isReady,
      routeInfo
    });
  }, []);
  
  // Primary data fetching effect
  useEffect(() => {
    // Only fetch if we don't have initial data and have an ID
    if (!initialTask && id) {
      // This log shows if we actually have a working ID parameter
      console.log('Task detail page - useEffect triggered with ID:', id);
      
      setLoading(true);
      
      // Fetch from API
      console.log('Fetching task data from API for ID:', id);
      getTask(id)
        .then(taskData => {
          // Ensure the task has an ID property
          if (taskData) {
            console.log('Task data received from API:', taskData);
            const normalizedTask = {
              ...taskData,
              id: taskData._id || taskData.id
            };
            setTask(normalizedTask);
          } else {
            console.error('Task not found in API response');
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
    } else {
      console.log('Task detail page - using initialTask data:', {
        hasInitialData: !!initialTask,
        id
      });
    }
  }, [id, initialTask, router.isReady]);

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
        
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800 mt-2">Task Details</h1>
          <ClickableId 
            id="CO_9105" 
            filePath="/src/pages/task/[id].tsx" 
            className="self-center"
          />
        </div>
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
        <TaskProvider initialTasks={[task]}>
          <TaskDetail task={task} />
        </TaskProvider>
      )}
    </>
  );
}