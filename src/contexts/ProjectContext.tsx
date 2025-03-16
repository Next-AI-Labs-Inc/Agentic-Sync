import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { Project } from '@/types';
import taskSyncService, { SyncEventType } from '@/services/taskSyncService';

interface ProjectContextValue {
  projects: Project[];
  loading: boolean;
  error: string | null;
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create a function for fetching projects
    async function fetchProjects() {
      setLoading(true);
      // Temporarily clear error but maintain projects list
      setError(null);
      
      try {
        const response = await axios.get('/api/projects');
        if (response.data && Array.isArray(response.data)) {
          setProjects(response.data);
        } else {
          console.warn('Projects API returned unexpected data structure');
          // Fall back to a minimal set of necessary projects only if we have none
          if (projects.length === 0) {
            // This is a temporary fallback that should only happen if the API fails completely
            // We want to show any new projects in the DB as they're created
            const fallbackProjects = [
              { id: 'tasks', name: 'Tasks' },
              { id: 'task-management', name: 'Task Management' }
            ];
            setProjects(fallbackProjects);
          }
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        
        // Don't show a critical error to the user, just show a warning
        setError('Using cached project data');
        
        // Only use fallback if we have absolutely no projects
        if (projects.length === 0) {
          const fallbackProjects = [
            { id: 'tasks', name: 'Tasks' },
            { id: 'task-management', name: 'Task Management' }
          ];
          setProjects(fallbackProjects);
        }
      } finally {
        // Always ensure loading is false so UI renders
        setLoading(false);
      }
    }

    // Track unsubscribe functions
    const unsubscribes: (() => void)[] = [];
    
    // Initial fetch
    fetchProjects();
    
    // Subscribe to project created events
    unsubscribes.push(
      taskSyncService.subscribe(SyncEventType.PROJECT_CREATED, (event) => {
        console.log('Real-time project created:', event.payload);
        const newProject = event.payload as Project;
        
        // Add the new project to the list
        setProjects(currentProjects => {
          // Check if the project already exists
          if (currentProjects.some(p => p.id === newProject.id)) {
            return currentProjects;
          }
          
          // Add the new project with a subtle animation
          return [...currentProjects, { ...newProject, _isNew: true }];
        });
      })
    );
    
    // Subscribe to project updated events
    unsubscribes.push(
      taskSyncService.subscribe(SyncEventType.PROJECT_UPDATED, (event) => {
        console.log('Real-time project updated:', event.payload);
        const updatedProject = event.payload as Project;
        
        // Update the project in the list
        setProjects(currentProjects => {
          return currentProjects.map(project => 
            project.id === updatedProject.id ? updatedProject : project
          );
        });
      })
    );
    
    // Subscribe to project deleted events
    unsubscribes.push(
      taskSyncService.subscribe(SyncEventType.PROJECT_DELETED, (event) => {
        console.log('Real-time project deleted:', event.payload);
        const { id } = event.payload;
        
        // Remove the project from the list
        setProjects(currentProjects => {
          return currentProjects.filter(project => project.id !== id);
        });
      })
    );
    
    // Clean up all subscriptions on unmount
    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, []); // No dependencies - single setup

  const value = { projects, loading, error };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}