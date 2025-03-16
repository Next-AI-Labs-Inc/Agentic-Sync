import React from 'react';
import Head from 'next/head';
import { TaskProvider } from '@/contexts/TaskContext';
import { ProjectProvider } from '@/contexts/ProjectContext';
import TasksCorePage from './tasks-core';

/**
 * Minimal entry point that only loads the core Tasks functionality
 * No initiatives, no extra providers, no unnecessary features
 */
export default function MinimalApp() {
  return (
    <>
      <Head>
        <title>IX Tasks | Minimal</title>
        <meta name="description" content="Optimized task management interface" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProjectProvider>
            <TaskProvider>
              <TasksCorePage />
            </TaskProvider>
          </ProjectProvider>
        </div>
      </div>
    </>
  );
}