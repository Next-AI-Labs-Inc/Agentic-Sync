import React, { useState } from 'react';
import Head from 'next/head';
import { useTasks } from '@/contexts/TaskContext';
import { useProjects } from '@/contexts/ProjectContext';
import TaskFilters from '@/components/TaskFilters';
import TaskCard from '@/components/TaskCard';
import TaskForm from '@/components/TaskForm';

export default function TasksPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  
  const { 
    filteredTasks, 
    loading, 
    error,
    completedFilter,
    projectFilter,
    sortBy,
    sortDirection,
    setCompletedFilter,
    setProjectFilter,
    setSortBy,
    setSortDirection,
    updateTaskStatus,
    markTaskTested,
    deleteTask,
    addTask,
    updateTaskDate,
    refreshTasks,
    taskCountsByStatus
  } = useTasks();
  
  const { projects, loading: projectsLoading } = useProjects();
  
  // Format project name for display in empty state
  const getProjectName = (projectId: string) => {
    if (!projectId || projectId === 'all' || projectId === 'none') {
      return projectId;
    }
    
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : projectId;
  };
  
  // Get empty state message based on filters
  const getEmptyStateMessage = () => {
    if (projectFilter !== 'all' && projectFilter !== 'none') {
      if (Array.isArray(projectFilter)) {
        return `No tasks found for the selected projects`;
      }
      return `No tasks found for the selected project: ${getProjectName(projectFilter as string)}`;
    }
    
    if (projectFilter === 'none') {
      return 'No tasks found with no project assigned';
    }
    
    if (completedFilter !== 'all') {
      if (completedFilter === 'pending') {
        return 'No pending tasks found';
      } else if (completedFilter === 'recent-completed') {
        return 'No recently completed tasks found';
      } else {
        return `No tasks with status "${completedFilter}" found`;
      }
    }
    
    return 'No tasks found';
  };
  
  return (
    <>
      <Head>
        <title>Tasks | IX Projects</title>
        <meta name="description" content="Tasks management for IX Projects" />
      </Head>
      
      <div className="mb-6 relative">
        <h1 className="text-3xl font-bold text-gray-800">Tasks</h1>
        <p className="text-gray-600">Manage and track tasks across all IX projects</p>
      </div>
      
      {/* Subtle loading indicator at top of page */}
      {(loading || projectsLoading) && (
        <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-600 animate-pulse-bg rounded mb-4"></div>
      )}
      
      {/* Show non-critical errors as subtle warning banners but still display content */}
      {error ? (
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg border border-yellow-200 mb-4 animate-fade-in">
          <h3 className="text-base font-medium mb-1">Connection Notice</h3>
          <p className="text-sm">{error}</p>
        </div>
      ) : null}
      
      {/* Task Filters */}
      <TaskFilters 
        projects={projects}
        projectFilter={projectFilter}
        setProjectFilter={setProjectFilter}
        completedFilter={completedFilter}
        setCompletedFilter={setCompletedFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortDirection={sortDirection}
        setSortDirection={setSortDirection}
        onAddNewClick={() => setShowAddForm(true)}
        taskCountsByStatus={taskCountsByStatus}
        refreshTasks={refreshTasks}
      />
      
      {/* Task Creation Form */}
      {showAddForm && (
        <TaskForm 
          projects={projects} 
          onSubmit={addTask} 
          onCancel={() => setShowAddForm(false)} 
        />
      )}
      
      {/* Tasks List - Always displayed regardless of loading state */}
      <div className="tasks-list mt-4">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No tasks found</h3>
            <p className="text-gray-500 mb-6">
              {getEmptyStateMessage()}
            </p>
            <button 
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary relative overflow-hidden"
            >
              <span className="flex items-center">
                <span className="mr-1">+</span> Create your first task
                <span className="absolute inset-0 bg-white bg-opacity-30 transform scale-0 transition-transform duration-300 rounded-full hover:scale-0 active:scale-100 origin-center"></span>
              </span>
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-500 animate-fade-in">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found
            </div>
            
            <div className="space-y-4">
              {filteredTasks.map((task, index) => (
                <div 
                  key={`${task.id}-${task.project}`}
                  className="task-card-container animate-fade-in"
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <TaskCard 
                    task={task}
                    onStatusChange={updateTaskStatus}
                    onMarkTested={markTaskTested}
                    onDelete={deleteTask}
                    onUpdateDate={updateTaskDate}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}