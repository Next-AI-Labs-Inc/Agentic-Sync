import React, { useState, useEffect, useContext, createContext } from 'react';
import { useTasks } from '@/contexts/TaskContext';
import { useInitiatives } from '@/contexts/InitiativeContext';
import * as taskApiService from '@/services/taskApiService';

interface TrackedTask {
  id: string;
  title: string;
  description: string;
  status: 'proposed' | 'todo' | 'in-progress' | 'for-review' | 'done' | 'reviewed';
  timestamp: string;
}

interface TaskTrackerContextValue {
  trackedTasks: TrackedTask[];
  trackTask: (title: string, description: string) => Promise<TrackedTask | null>;
  updateTaskStatus: (taskId: string, status: 'proposed' | 'todo' | 'in-progress' | 'for-review' | 'done' | 'reviewed') => Promise<void>;
  activeInitiative: string | null;
}

// Create context
const TaskTrackerContext = createContext<TaskTrackerContextValue | undefined>(undefined);

// Custom hook to use the tracker
export function useTaskTracker() {
  const context = useContext(TaskTrackerContext);
  if (!context) {
    throw new Error('useTaskTracker must be used within a TaskTrackerProvider');
  }
  return context;
}

// Provider component
export function TaskTrackerProvider({ children }: { children: React.ReactNode }) {
  const [trackedTasks, setTrackedTasks] = useState<TrackedTask[]>([]);
  const { refreshTasks } = useTasks();
  const { refreshInitiatives } = useInitiatives();
  const [activeInitiative, setActiveInitiative] = useState<string | null>(null);
  
  // Load tracked tasks from localStorage
  useEffect(() => {
    const storedTasks = localStorage.getItem('userRequestedTasks');
    if (storedTasks) {
      try {
        setTrackedTasks(JSON.parse(storedTasks));
      } catch (e) {
        console.error('Failed to load tracked tasks:', e);
      }
    }
    
    // Check for active initiative
    const storedInitiative = localStorage.getItem('activeUserInitiative');
    if (storedInitiative) {
      setActiveInitiative(storedInitiative);
    }
  }, []);
  
  // Save tracked tasks to localStorage
  useEffect(() => {
    localStorage.setItem('userRequestedTasks', JSON.stringify(trackedTasks));
  }, [trackedTasks]);
  
  // Track a new task
  const trackTask = async (title: string, description: string) => {
    // Create initiative if needed
    if (!activeInitiative) {
      try {
        const newInitiative = await taskApiService.createInitiative({
          name: 'User Requested Tasks',
          description: 'Tasks requested by the user during conversation',
          status: 'in-progress',
          priority: 'high',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        
        if (newInitiative?.id) {
          setActiveInitiative(String(newInitiative.id));
          localStorage.setItem('activeUserInitiative', String(newInitiative.id));
          
          // Refresh initiatives in context
          refreshInitiatives();
        }
      } catch (error) {
        console.error('Failed to create initiative:', error);
      }
    }
    
    // Create task
    try {
      const newTask = await taskApiService.createTask({
        title,
        description,
        priority: 'high',
        project: 'ix-tasks',
        status: 'proposed',
        initiative: activeInitiative || 'User Requested Tasks',
        tags: 'user-requested',
        verificationSteps: '',
        nextSteps: ''
      });
      
      if (newTask?.id) {
        // Add to tracked tasks
        const trackedTask: TrackedTask = {
          id: newTask.id,
          title,
          description,
          status: 'proposed',
          timestamp: new Date().toISOString()
        };
        
        setTrackedTasks(prev => [...prev, trackedTask]);
        
        // Refresh tasks in context
        refreshTasks();
        
        return trackedTask;
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    }
    
    return null;
  };
  
  // Update task status
  const updateTaskStatus = async (taskId: string, status: 'proposed' | 'todo' | 'in-progress' | 'for-review' | 'done' | 'reviewed') => {
    try {
      await taskApiService.updateTaskStatus(taskId, status);
      
      // Update local tracked tasks
      setTrackedTasks(prev => 
        prev.map(task => 
          task.id === taskId ? { ...task, status } : task
        )
      );
      
      // Refresh tasks in context
      refreshTasks();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };
  
  const value = {
    trackedTasks,
    trackTask,
    updateTaskStatus,
    activeInitiative
  };
  
  return (
    <TaskTrackerContext.Provider value={value}>
      {children}
    </TaskTrackerContext.Provider>
  );
}

// Default export - empty component to satisfy import
export default function TaskTracker() {
  return null;
}