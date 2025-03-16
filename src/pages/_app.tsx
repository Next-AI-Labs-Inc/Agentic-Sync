import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { TaskProvider } from '@/contexts/TaskContext';
import { InitiativeProvider } from '@/contexts/InitiativeContext';
import { KpiProvider } from '@/contexts/KpiContext';
import Layout from '@/components/Layout';
import { TaskTrackerProvider, useTaskTracker } from '@/components/TaskTracker';
import RouteTransition from '@/components/RouteTransition';

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
    setIsHydrated(true);
  }, []);

  return (
    <ProjectProvider>
      <TaskProvider>
        <InitiativeProvider>
          <KpiProvider>
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
          </KpiProvider>
        </InitiativeProvider>
      </TaskProvider>
    </ProjectProvider>
  );
}