import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { TaskProvider } from '@/contexts/TaskContext';
import Head from 'next/head';
// Initiative feature removed
// KPI feature removed
import Layout from '@/components/Layout';
import { TaskTrackerProvider, useTaskTracker } from '@/components/TaskTracker';
import RouteTransition from '@/components/RouteTransition';

// Disable all console.log statements in production or when optimization flag is set
if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_OPTIMIZE_CPU === 'true') {
  console.log = () => {};
  console.debug = () => {};
  console.info = () => {};
}

// Component to expose global functions
function GlobalFunctionsExposer() {
  const { trackTask, updateTaskStatus } = useTaskTracker();
  
  // Expose functions to window object
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Expose to window for external access
      (window as any).trackUserTask = (title: string, description: string) => {
        return trackTask(title, description);
      };
      
      (window as any).updateUserTaskStatus = (taskId: string, status: string) => {
        return updateTaskStatus(taskId, status as any);
      };
    }
  }, [trackTask, updateTaskStatus]);
  
  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  // Add page loading state for smooth transitions
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Handle hydration mismatch by waiting for client-side hydration
  useEffect(() => {
    // Immediate state update for quick initial render
    setIsHydrated(true);
    
    // Disable throttling warning by adding browser check
    if (typeof window !== 'undefined') {
      // Add warning suppression for navigation throttling
      console.warn = (function(originalWarn) {
        return function(...args: any[]) {
          if (typeof args[0] === 'string' && args[0].includes('Throttling navigation')) {
            return; // Ignore throttling navigation warnings
          }
          originalWarn.apply(console, args);
        };
      })(console.warn);
    }
  }, []);

  return (
    <>
      <Head>
        <title>IX Agent Sync - Next AI Labs</title>
        <meta name="description" content="AI Task Management and Tracking System by Next AI Labs" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
        <ProjectProvider>
          <TaskProvider>
            <TaskTrackerProvider>
              <GlobalFunctionsExposer />
              <Layout>
                <RouteTransition>
                  {isHydrated ? (
                    <Component {...pageProps} />
                  ) : (
                    // Skeleton placeholder while hydrating
                    <div className="animate-pulse space-y-4">
                      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-64 bg-gray-100 rounded"></div>
                    </div>
                  )}
                </RouteTransition>
              </Layout>
            </TaskTrackerProvider>
          </TaskProvider>
        </ProjectProvider>
    </>
  );
}