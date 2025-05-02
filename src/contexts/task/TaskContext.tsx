import React, { createContext, useContext, ReactNode } from 'react';
import {
  Task,
  TaskFilterStatus,
  ProjectFilterType,
  SortOption,
  SortDirection,
  TaskFormData,
  ItemWithStatus,
  AgentOptions
} from '@/types';
import { useTaskData, useTaskFilters, useTaskOperations } from '@/hooks/task';

interface TaskContextValue {
  // Task state
  tasks: Task[];
  loading: boolean;
  error: string | null;
  taskCountsByStatus: Record<string, number>;
  
  // Filter state
  completedFilter: TaskFilterStatus;
  projectFilter: ProjectFilterType;
  sortBy: SortOption;
  sortDirection: SortDirection;
  searchTerm: string;
  
  // Filter setters
  setCompletedFilter: (filter: TaskFilterStatus) => void;
  setProjectFilter: (filter: ProjectFilterType) => void;
  setSortBy: (sort: SortOption) => void;
  setSortDirection: (direction: SortDirection) => void;
  setSearchTerm: (term: string) => void;
  
  // Data operations
  refreshTasks: () => Promise<Task[]>;
  
  // Task operations
  addTask: (taskData: TaskFormData) => Promise<void>;
  updateTask: (taskId: string, updateData: Partial<Task>) => Promise<void>;
  updateTaskStatus: (
    taskId: string,
    project: string,
    status: 'inbox' | 'brainstorm' | 'proposed' | 'backlog' | 'maybe' | 'todo' | 'in-progress' | 'on-hold' | 'for-review' | 'done' | 'reviewed' | 'archived'
  ) => Promise<void>;
  deleteTask: (taskId: string, project: string) => Promise<void>;
  toggleTaskStar: (taskId: string, project: string) => Promise<void>;
  markTaskTested: (taskId: string, project: string) => Promise<void>;
  markTaskActionable: (taskId: string, project: string) => Promise<void>;
  updateTaskDate: (taskId: string, project: string, newDate: string) => Promise<void>;
  
  // Item operations
  approveRequirementItem: (taskId: string, itemId: string) => Promise<void>;
  vetoRequirementItem: (taskId: string, itemId: string) => Promise<void>;
  updateRequirementItems: (taskId: string, items: ItemWithStatus[]) => Promise<void>;
  approveTechnicalPlanItem: (taskId: string, itemId: string) => Promise<void>;
  vetoTechnicalPlanItem: (taskId: string, itemId: string) => Promise<void>;
  updateTechnicalPlanItems: (taskId: string, items: ItemWithStatus[]) => Promise<void>;
  approveNextStepItem: (taskId: string, itemId: string) => Promise<void>;
  vetoNextStepItem: (taskId: string, itemId: string) => Promise<void>;
  updateNextStepItems: (taskId: string, items: ItemWithStatus[]) => Promise<void>;
  
  // Agent integration
  addTaskFeedback: (taskId: string, content: string) => Promise<void>;
  launchAgentForTask: (taskId: string, mode: 'implement' | 'demo' | 'feedback', feedback?: string) => Promise<{success: boolean; message: string; command: string}>;
  
  // Results
  filteredTasks: Task[];
  
  // Deduplication
  dedupeEnabled: boolean;
  setDedupeEnabled: (enabled: boolean) => void;
  runManualDedupe: () => void;
}

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

export function TaskProvider({
  children,
  initialTasks = []
}: {
  children: ReactNode;
  initialTasks?: Task[];
}) {
  // Use our custom hooks to manage task data, filtering, and operations
  const {
    tasks,
    loading,
    error: dataError,
    taskCountsByStatus,
    refreshTasks,
    dedupeEnabled,
    setDedupeEnabled,
    runManualDedupe,
    // We need to extract this from useTaskData
    setTasks
  } = useTaskData();

  const {
    completedFilter,
    projectFilter,
    sortBy,
    sortDirection,
    searchTerm,
    filteredTasks,
    setCompletedFilter,
    setProjectFilter,
    setSortBy,
    setSortDirection,
    setSearchTerm
  } = useTaskFilters({
    initialTasks: tasks
  });

  const {
    addTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    toggleTaskStar,
    markTaskTested,
    markTaskActionable,
    updateTaskDate,
    approveRequirementItem,
    vetoRequirementItem,
    updateRequirementItems,
    approveTechnicalPlanItem,
    vetoTechnicalPlanItem,
    updateTechnicalPlanItems,
    approveNextStepItem,
    vetoNextStepItem,
    updateNextStepItems,
    addTaskFeedback,
    launchAgentForTask,
    error: operationsError,
    setError: setOperationsError
  } = useTaskOperations({
    tasks,
    setTasks,
    refreshTasks
  });

  // Combine errors from data and operations
  const error = dataError || operationsError;

  const value: TaskContextValue = {
    // Task state
    tasks,
    loading,
    error,
    taskCountsByStatus,
    
    // Filter state
    completedFilter,
    projectFilter,
    sortBy,
    sortDirection,
    searchTerm,
    
    // Filter setters
    setCompletedFilter,
    setProjectFilter,
    setSortBy,
    setSortDirection,
    setSearchTerm,
    
    // Data operations
    refreshTasks,
    
    // Task operations
    addTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    toggleTaskStar,
    markTaskTested,
    markTaskActionable,
    updateTaskDate,
    
    // Item management
    approveRequirementItem,
    vetoRequirementItem,
    updateRequirementItems,
    approveTechnicalPlanItem,
    vetoTechnicalPlanItem,
    updateTechnicalPlanItems,
    approveNextStepItem,
    vetoNextStepItem,
    updateNextStepItems,
    
    // Agent integration
    addTaskFeedback,
    launchAgentForTask,
    
    // Results
    filteredTasks,
    
    // Deduplication
    dedupeEnabled,
    setDedupeEnabled,
    runManualDedupe
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
      {/* Memory monitor removed as requested */}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}