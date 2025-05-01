import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project } from '@/types';
import taskSyncService, { SyncEventType } from '@/services/taskSyncService';

interface ProjectContextValue {
  projects: Project[];
  loading: boolean;
  error: string | null;
  updateProjectsFromTasks: (taskProjects: string[]) => void;
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

// Initial fallback projects
const fallbackProjects = [
  { id: 'gptcoach2', name: 'GPTCoach2 (IXC)' },
  { id: 'ixcoach-api', name: 'IXCoach API' },
  { id: 'ixcoach-landing', name: 'IXCoach Landing' },
  { id: 'tasks', name: 'Tasks' }
];

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(fallbackProjects);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to update projects from task data
  const updateProjectsFromTasks = (taskProjects: string[]) => {
    if (!taskProjects || taskProjects.length === 0) return;
    
    setProjects(currentProjects => {
      const newProjects: Project[] = [...currentProjects];
      
      // Process each unique project from tasks
      taskProjects.forEach(projectId => {
        // Skip if project doesn't have an ID or is "none"
        if (!projectId || projectId === 'none') return;
        
        // Check if project already exists
        if (!currentProjects.some(p => p.id === projectId)) {
          // Extract readable name from ID (remove timestamp suffix if present)
          const nameParts = projectId.split('-');
          const timestampSuffix = /^\d+$/.test(nameParts[nameParts.length - 1]);
          
          // Create project name by removing potential timestamp and converting dashes to spaces
          const name = timestampSuffix 
            ? nameParts.slice(0, -1).join(' ') 
            : nameParts.join(' ');
            
          // Add the new project
          newProjects.push({
            id: projectId,
            name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize first letter
            _isNew: true
          });
        }
      });
      
      return newProjects;
    });
  };

  useEffect(() => {
    // Track unsubscribe functions
    const unsubscribes: (() => void)[] = [];
    
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

  const value = { projects, loading, error, updateProjectsFromTasks };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}