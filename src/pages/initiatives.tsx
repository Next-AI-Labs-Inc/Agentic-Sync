import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useTasks } from '@/contexts/TaskContext';
import { useInitiatives } from '@/contexts/InitiativeContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import TaskCard from '@/components/TaskCard';
import InitiativeCard from '@/components/InitiativeCard';

export default function InitiativesPage() {
  const { 
    tasks, 
    loading: tasksLoading, 
    error: tasksError,
    updateTaskStatus,
    markTaskTested,
    deleteTask
  } = useTasks();
  
  const {
    initiatives,
    filteredInitiatives,
    loading: initiativesLoading,
    error: initiativesError,
    refreshInitiatives,
    deleteInitiative,
    updateInitiative,
    sortBy,
    sortDirection,
    setSortBy,
    setSortDirection,
    statusFilter,
    setStatusFilter
  } = useInitiatives();
  
  const [selectedInitiative, setSelectedInitiative] = useState<string | null>(null);
  
  // Function to group tasks by initiative
  const groupTasksByInitiative = () => {
    const tasksByInitiative: Record<string, any[]> = {};
    const tasksWithoutInitiative: any[] = [];
    
    tasks.forEach(task => {
      if (task.initiative) {
        if (!tasksByInitiative[task.initiative]) {
          tasksByInitiative[task.initiative] = [];
        }
        tasksByInitiative[task.initiative].push(task);
      } else {
        tasksWithoutInitiative.push(task);
      }
    });
    
    return { tasksByInitiative, tasksWithoutInitiative };
  };
  
  const { tasksByInitiative, tasksWithoutInitiative } = groupTasksByInitiative();
  
  // Get unique initiative names from both initiatives and tasks
  const allInitiativeNames = new Set([
    ...initiatives.map(initiative => initiative.name),
    ...Object.keys(tasksByInitiative)
  ]);
  
  // Sort initiatives alphabetically
  const sortedInitiativeNames = Array.from(allInitiativeNames).sort();
  
  // Handle initiative status update
  const handleUpdateInitiativeStatus = async (id: number, status: string) => {
    try {
      await updateInitiative(id, { status: status as any });
    } catch (error) {
      console.error('Error updating initiative status:', error);
    }
  };

  // Handle initiative priority update
  const handleUpdateInitiativePriority = async (id: number, priority: string) => {
    try {
      await updateInitiative(id, { priority: priority as any });
    } catch (error) {
      console.error('Error updating initiative priority:', error);
    }
  };
  
  // Delete an initiative using the context's deleteInitiative function
  const handleDeleteInitiative = async (id: number) => {
    try {
      await deleteInitiative(id);
    } catch (error) {
      console.error('Error deleting initiative:', error);
    }
  };
  
  return (
    <>
      <Head>
        <title>Initiatives | IX Projects</title>
        <meta name="description" content="Initiatives for IX Projects" />
      </Head>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Initiatives</h1>
        <p className="text-gray-600">View initiatives and related tasks from IX-Sync</p>
      </div>
      
      {/* Show errors as subtle warnings but continue showing the UI */}
      {(tasksError || initiativesError) ? (
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg border border-yellow-200 mb-4 animate-fade-in">
          <h3 className="text-base font-medium mb-1">Connection Notice</h3>
          <p className="text-sm">{tasksError || initiativesError}</p>
        </div>
      ) : null}
      
      {/* Subtle loading indicator at top of page */}
      {(tasksLoading || initiativesLoading) && (
        <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-600 animate-pulse-bg rounded mb-4"></div>
      )}
      
      {/* Sorting and filtering controls */}
      {initiatives.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
              <select 
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="updated">Recently Updated</option>
                <option value="created">Recently Created</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="direction" className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
              <select 
                id="direction"
                value={sortDirection}
                onChange={(e) => setSortDirection(e.target.value as any)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status Filter</label>
              <select 
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="all">All Statuses</option>
                <option value="not-started">Not Started</option>
                <option value="planning">Planning</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
              </select>
            </div>
          </div>
        </div>
      )}
      
      {/* Main content - always render regardless of loading or error state */}
      {initiatives.length === 0 && sortedInitiativeNames.length === 0 && tasksWithoutInitiative.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No initiatives found</h3>
          <p className="text-gray-500 mb-6">
            Start by adding initiatives or tasks with initiative tags
          </p>
          <Link href="/tasks" className="btn btn-primary">
            Go to Tasks
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* IX-Sync Initiatives */}
          {initiatives.length > 0 && (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">IX-Sync Initiatives</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredInitiatives.map(initiative => (
                  <InitiativeCard 
                    key={initiative.id} 
                    initiative={initiative}
                    onDelete={handleDeleteInitiative}
                    onUpdateStatus={handleUpdateInitiativeStatus}
                    onUpdatePriority={handleUpdateInitiativePriority}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Tasks grouped by initiative */}
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Initiative Tasks</h2>
          {sortedInitiativeNames.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500">No tasks assigned to initiatives</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedInitiativeNames.map(initiative => (
                <div key={initiative} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">{initiative}</h3>
                    {tasksByInitiative[initiative] && (
                      <div className="mt-1 text-sm text-gray-500">
                        {tasksByInitiative[initiative].length} {tasksByInitiative[initiative].length === 1 ? 'task' : 'tasks'}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 space-y-4">
                    {tasksByInitiative[initiative] && tasksByInitiative[initiative].map(task => (
                      <TaskCard 
                        key={`${task.id}-${task.project}`}
                        task={task}
                        onStatusChange={updateTaskStatus}
                        onMarkTested={markTaskTested}
                        onDelete={deleteTask}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Tasks without initiative */}
          {tasksWithoutInitiative.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-8">
              <div className="bg-gray-50 p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Uncategorized Tasks</h3>
                <div className="mt-1 text-sm text-gray-500">
                  {tasksWithoutInitiative.length} {tasksWithoutInitiative.length === 1 ? 'task' : 'tasks'}
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                {tasksWithoutInitiative.map(task => (
                  <TaskCard 
                    key={`${task.id}-${task.project}`}
                    task={task}
                    onStatusChange={updateTaskStatus}
                    onMarkTested={markTaskTested}
                    onDelete={deleteTask}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}