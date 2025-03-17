import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { getTask } from '@/services/taskApiService';
import TaskCard from '@/components/TaskCard';
import { Task } from '@/types';
import { TaskProvider } from '@/contexts/TaskContext';

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
    // Only fetch the task when we have an ID
    if (id && typeof id === 'string') {
      setLoading(true);
      
      getTask(id)
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
        <Link href="/tasks" className="text-primary-600 hover:underline mb-4 inline-flex items-center">
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
              onClick={() => router.push('/tasks')}
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
          <div className="task-single-view">
            <TaskCard 
              task={task}
              onStatusChange={() => {}} // Read-only view
              onMarkTested={() => {}}   // Read-only view
              onDelete={() => {}}       // Read-only view
              onUpdateDate={() => {}}   // Read-only view
              onUpdateTask={() => {}}   // Read-only view
              expanded={true}           // Always show expanded
              hideExpand={true}         // Hide expand button
            />
          </div>
        </TaskProvider>
      )}
    </>
  );
}