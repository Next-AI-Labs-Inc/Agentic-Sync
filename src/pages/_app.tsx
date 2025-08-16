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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { taskSyncService } from '@/services/taskSyncService';
import RouteTransition from '@/components/RouteTransition';
import Router from 'next/router';

// Preserve original console methods
const originalConsole = {
  log: console.log,
  debug: console.debug,
  info: console.info,
  error: console.error
};

// Store original console methods for debugging purposes
if (typeof window !== 'undefined') {
  window._originalConsole = originalConsole;
}

// Enable router error logging even in production
const routingErrorLogger = (message, ...args) => {
  // Always log routing errors
  if (
    typeof message === 'string' && 
    (message.includes('router') || message.includes('route') || message.includes('fetch')) && 
    (message.includes('error') || message.includes('fail') || message.includes('abort'))
  ) {
    originalConsole.error('[ROUTER_DEBUG]', message, ...args);
    
    // Store in session for debugging
    if (typeof window !== 'undefined') {
      const routerErrors = JSON.parse(sessionStorage.getItem('ix_router_errors') || '[]');
      routerErrors.push({
        timestamp: new Date().toISOString(),
        message,
        args: JSON.stringify(args)
      });
      sessionStorage.setItem('ix_router_errors', JSON.stringify(routerErrors.slice(-20))); // Keep last 20
    }
    
    return;
  }
  
  // For non-routing errors in production, use empty function
  if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_OPTIMIZE_CPU === 'true') {
    return;
  }
  
  // Otherwise use original console in development
  originalConsole.error(message, ...args);
};

// Disable standard logs in production but keep routing error logs
if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_OPTIMIZE_CPU === 'true') {
  console.log = () => {};
  console.debug = () => {};
  console.info = () => {};
  console.error = routingErrorLogger;
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

// Create a client with appropriate settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // Consider data fresh for 1 minute
      cacheTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
      refetchOnWindowFocus: true, // Refresh data when user returns to tab
      refetchOnMount: 'always', // Always check for updates when component mounts
      retry: 1, // Retry failed requests once
    },
  },
});

// Connect TaskSyncService to React Query
taskSyncService.connectQueryClient(queryClient);

export default function App({ Component, pageProps }: AppProps) {
  // Add page loading state for smooth transitions
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Handle hydration mismatch by waiting for client-side hydration
  useEffect(() => {
    // Immediate state update for quick initial render
    setIsHydrated(true);
    
  }, []);

  return (
    <>
      <Head>
        <title>IX Tasks - AI-Native Task Management</title>
        <meta name="description" content="AI-Native Task Management Platform for Developers and AI Agents" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
        <QueryClientProvider client={queryClient}>
          <ProjectProvider>
            <TaskProvider>
              <TaskTrackerProvider>
                <GlobalFunctionsExposer />
                <Layout>
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
                </Layout>
              </TaskTrackerProvider>
            </TaskProvider>
          </ProjectProvider>
          {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
        </QueryClientProvider>
    </>
  );
}