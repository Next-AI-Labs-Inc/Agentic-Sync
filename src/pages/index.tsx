import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useTasks } from '@/contexts/TaskContext';
import { useProjects } from '@/contexts/ProjectContext';
import { useInitiatives } from '@/contexts/InitiativeContext';
// KPI feature removed
import LoadingSpinner from '@/components/LoadingSpinner';
import TaskCard from '@/components/TaskCard';
import InitiativeCard from '@/components/InitiativeCard';
// KPI feature removed

export default function HomePage() {
  const { 
    tasks, 
    loading: tasksLoading, 
    error: tasksError, 
    updateTaskStatus,
    markTaskTested,
    deleteTask
  } = useTasks();
  
  const { initiatives, loading: initiativesLoading } = useInitiatives();
  const { kpis, loading: kpisLoading } = useKpis();
  const { projects, loading: projectsLoading } = useProjects();
  
  // Combine loading states for UI
  const loading = tasksLoading || projectsLoading || initiativesLoading || kpisLoading;
  const error = tasksError;
  
  // Get recent tasks (last 5 updated tasks)
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);
  
  // Get pending high priority tasks
  const highPriorityTasks = tasks.filter(
    task => task.priority === 'high' && task.status !== 'done' && task.status !== 'reviewed'
  ).slice(0, 5);
  
  // Get recent initiatives (up to 2)
  const recentInitiatives = [...initiatives]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 2);
  
  // KPI feature removed
  
  return (
    <>
      <Head>
        <title>IX Projects Dashboard</title>
        <meta name="description" content="IX Projects Task Management Dashboard" />
      </Head>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Overview of tasks across all IX projects</p>
      </div>
      
      {/* Show errors as warning banners but continue showing the UI */}
      {error ? (
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg border border-yellow-200 mb-4">
          <h3 className="text-base font-medium mb-1">Connection Notice</h3>
          <p className="text-sm">{error}</p>
        </div>
      ) : null}
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Link href="/tasks" className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 block hover:shadow-md transition-shadow">
          <h3 className="text-lg font-medium text-gray-800">Total Tasks</h3>
          <div className="h-10 flex items-center">
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <p className="text-3xl font-bold text-primary-600">{tasks.length}</p>
            )}
          </div>
        </Link>
        
        <Link href="/tasks?filter=pending" className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 block hover:shadow-md transition-shadow">
          <h3 className="text-lg font-medium text-gray-800">Pending Tasks</h3>
          <div className="h-10 flex items-center">
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <p className="text-3xl font-bold text-blue-600">
                {tasks.filter(task => task.status !== 'done' && task.status !== 'reviewed').length}
              </p>
            )}
          </div>
        </Link>
        
        <Link href="/tasks?filter=done" className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 block hover:shadow-md transition-shadow">
          <h3 className="text-lg font-medium text-gray-800">Done Tasks</h3>
          <div className="h-10 flex items-center">
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <p className="text-3xl font-bold text-green-600">
                {tasks.filter(task => task.status === 'done' || task.status === 'reviewed').length}
              </p>
            )}
          </div>
        </Link>
        
        <Link href="/tasks?sort=priority&direction=desc" className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 block hover:shadow-md transition-shadow">
          <h3 className="text-lg font-medium text-gray-800">High Priority</h3>
          <div className="h-10 flex items-center">
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <p className="text-3xl font-bold text-red-600">
                {tasks.filter(task => task.priority === 'high' && task.status !== 'done' && task.status !== 'reviewed').length}
              </p>
            )}
          </div>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Recently Updated Tasks</h2>
            <Link href="/tasks" className="text-primary-600 text-sm hover:underline">
              View All
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-4">
              <LoadingSpinner />
            </div>
          ) : recentTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No tasks found
            </div>
          ) : (
            <div className="space-y-4">
              {recentTasks.map(task => (
                <TaskCard 
                  key={`${task.id}-${task.project}`}
                  task={task}
                  onStatusChange={updateTaskStatus}
                  onMarkTested={markTaskTested}
                  onDelete={deleteTask}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* High Priority Tasks */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">High Priority Tasks</h2>
            <Link href="/tasks" className="text-primary-600 text-sm hover:underline">
              View All
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-4">
              <LoadingSpinner />
            </div>
          ) : highPriorityTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No high priority tasks found
            </div>
          ) : (
            <div className="space-y-4">
              {highPriorityTasks.map(task => (
                <TaskCard 
                  key={`${task.id}-${task.project}`}
                  task={task}
                  onStatusChange={updateTaskStatus}
                  onMarkTested={markTaskTested}
                  onDelete={deleteTask}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* IX-Sync Data Section */}
      <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">IX-Sync Data</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Initiatives */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Recent Initiatives</h2>
            <Link href="/initiatives" className="text-primary-600 text-sm hover:underline">
              View All
            </Link>
          </div>
          
          {initiativesLoading ? (
            <div className="text-center py-4">
              <LoadingSpinner />
            </div>
          ) : recentInitiatives.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No initiatives found
            </div>
          ) : (
            <div className="space-y-4">
              {recentInitiatives.map(initiative => (
                <InitiativeCard 
                  key={initiative.id}
                  initiative={initiative}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* KPIs section removed */}
      </div>
    </>
  );
}