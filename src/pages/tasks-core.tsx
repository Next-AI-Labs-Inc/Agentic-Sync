import React, { useState } from 'react';
import Head from 'next/head';
import { useTasks } from '@/contexts/TaskContext';
import { ProjectFilterType } from '@/types';
import TaskFilters from '@/components/TaskFilters';
import TaskCard from '@/components/TaskCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import TaskForm from '@/components/TaskForm';

/**
 * Optimized Tasks Page - Core functionality only
 * This is a streamlined version of the tasks page without all the extra features
 */
export default function TasksCorePage() {
  const { 
    filteredTasks,
    loading, 
    error,
    completedFilter,
    setCompletedFilter,
    projectFilter,
    setProjectFilter,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    updateTaskStatus,
    markTaskTested,
    deleteTask,
    updateTaskDate,
    addTask,
    taskCountsByStatus
  } = useTasks();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const handleFormOpen = () => {
    setIsFormOpen(true);
  };
  
  const handleFormClose = () => {
    setIsFormOpen(false);
  };
  
  const handleAddTask = async (formData: any) => {
    // Create task
    await addTask(formData);
    
    // Close form
    setIsFormOpen(false);
  };
  
  return (
    <>
      <Head>
        <title>Tasks | IX Projects</title>
        <meta name="description" content="Manage tasks across IX projects" />
      </Head>
      
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold mb-1 text-gray-800">Tasks</h1>
          <p className="text-gray-600">Manage and track tasks across projects</p>
        </div>
        
        <button
          onClick={handleFormOpen}
          className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Task
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-lg border border-red-200 mb-4">
          <h3 className="text-base font-medium mb-1">Error Loading Tasks</h3>
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <TaskFilters 
          completedFilter={completedFilter}
          onCompletedFilterChange={setCompletedFilter}
          projectFilter={projectFilter as ProjectFilterType}
          onProjectFilterChange={setProjectFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortDirection={sortDirection}
          onSortDirectionChange={setSortDirection}
          counts={taskCountsByStatus}
        />
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <LoadingSpinner size="lg" />
          <p className="mt-2 text-gray-600">Loading tasks...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <svg
            className="w-16 h-16 mx-auto text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No tasks found</h3>
          <p className="mt-1 text-gray-600">
            {completedFilter !== 'all'
              ? `No ${completedFilter} tasks found for the current project filter.`
              : 'No tasks found for the current filter settings.'}
          </p>
          <button
            onClick={handleFormOpen}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none"
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Create New Task
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={updateTaskStatus}
              onMarkTested={markTaskTested}
              onDelete={deleteTask}
              onDateChange={updateTaskDate}
            />
          ))}
        </div>
      )}
      
      {isFormOpen && (
        <TaskForm onClose={handleFormClose} onSubmit={handleAddTask} />
      )}
    </>
  );
}