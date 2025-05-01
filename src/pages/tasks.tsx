import React, { useState, useRef, useEffect } from "react";
import Head from "next/head";
import { useTasks } from "@/contexts/TaskContext";
import { useProjects } from "@/contexts/ProjectContext";
import TaskFilters from "@/components/TaskFilters";
import TaskCard from "@/components/TaskCard";
import TaskForm from "@/components/TaskForm";
import { FixedSizeList as List } from "react-window";
import { ClickableId } from "@/utils/clickable-id";
import { Task } from "@/types";
// import { withAuth } from '@/utils/withAuth';

// CompactTaskItem Component - Shows a single task in one-line format
const CompactTaskItem = ({ 
  task, 
  onStatusChange, 
  onToggleStar 
}: { 
  task: Task; 
  onStatusChange: (taskId: string, project: string, status: Task['status']) => Promise<void>;
  onToggleStar?: (taskId: string, project: string) => Promise<void>;
}) => {
  // Status colors mapping
  const statusColors = {
    'inbox': 'bg-gray-200 text-gray-800',
    'brainstorm': 'bg-indigo-100 text-indigo-800',
    'proposed': 'bg-purple-100 text-purple-800',
    'backlog': 'bg-blue-100 text-blue-800',
    'maybe': 'bg-gray-100 text-gray-800',
    'todo': 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-green-100 text-green-800',
    'on-hold': 'bg-orange-100 text-orange-800',
    'for-review': 'bg-pink-100 text-pink-800',
    'done': 'bg-teal-100 text-teal-800',
    'reviewed': 'bg-blue-100 text-blue-800',
    'archived': 'bg-gray-100 text-gray-600',
  };

  // Generate next status based on current status
  const getNextStatus = (currentStatus: Task['status']): Task['status'] => {
    const statusFlow: { [key: string]: Task['status'] } = {
      'inbox': 'brainstorm',
      'brainstorm': 'proposed',
      'proposed': 'todo',
      'backlog': 'todo',
      'maybe': 'todo',
      'todo': 'in-progress',
      'in-progress': 'done',
      'on-hold': 'in-progress',
      'for-review': 'done',
      'done': 'reviewed',
      'reviewed': 'archived',
      'archived': 'todo'
    };
    
    return statusFlow[currentStatus] || 'todo';
  };

  return (
    <div className="flex items-center py-2 px-3 border-b border-gray-200 hover:bg-gray-50">
      {/* Star toggle */}
      <button 
        onClick={() => onToggleStar && onToggleStar(task.id, task.project)}
        className="mr-3 text-gray-400 hover:text-yellow-500 focus:outline-none"
        aria-label={task.starred ? "Unstar task" : "Star task"}
      >
        {task.starred ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )}
      </button>
      
      {/* Task title - takes most of the space */}
      <div className="flex-grow font-medium truncate">
        {task.title}
      </div>
      
      {/* Status badge & button to advance status */}
      <div className="ml-4 flex-shrink-0">
        <button
          onClick={() => onStatusChange(task.id, task.project, getNextStatus(task.status))}
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[task.status] || 'bg-gray-100 text-gray-800'}`}
        >
          {task.status}
        </button>
      </div>
    </div>
  );
};

function TasksPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [windowHeight, setWindowHeight] = useState(800); // Default height for SSR
  const [isClient, setIsClient] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'compact'>('card'); // New state for view toggle

  // Handle window size calculation after client-side mount
  useEffect(() => {
    setIsClient(true);
    setWindowHeight(window.innerHeight);

    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const {
    filteredTasks,
    loading,
    error,
    completedFilter,
    projectFilter,
    sortBy,
    sortDirection,
    searchTerm,
    setSearchTerm,
    setCompletedFilter,
    setProjectFilter,
    setSortBy,
    setSortDirection,
    updateTaskStatus,
    markTaskTested,
    deleteTask,
    addTask,
    updateTaskDate,
    updateTask,
    toggleTaskStar,
    // Item status management functions
    approveRequirementItem,
    vetoRequirementItem,
    updateRequirementItems,
    approveTechnicalPlanItem,
    vetoTechnicalPlanItem,
    updateTechnicalPlanItems,
    approveNextStepItem,
    vetoNextStepItem,
    updateNextStepItems,
    refreshTasks,
    taskCountsByStatus,
    dedupeEnabled,
    setDedupeEnabled,
    runManualDedupe,
  } = useTasks();

  const { projects, loading: projectsLoading } = useProjects();

  // Format project name for display in empty state
  const getProjectName = (projectId: string) => {
    if (!projectId || projectId === "all" || projectId === "none") {
      return projectId;
    }

    const project = projects.find((p) => p.id === projectId);
    return project ? project.name : projectId;
  };

  // Get empty state message based on filters
  const getEmptyStateMessage = () => {
    if (projectFilter !== "all" && projectFilter !== "none") {
      if (Array.isArray(projectFilter)) {
        return `No tasks found for the selected projects`;
      }
      return `No tasks found for the selected project: ${getProjectName(
        projectFilter as string
      )}`;
    }

    if (projectFilter === "none") {
      return "No tasks found with no project assigned";
    }

    if (completedFilter !== "all") {
      if (completedFilter === "pending") {
        return "No pending tasks found";
      } else if (completedFilter === "recent-completed") {
        return "No recently completed tasks found";
      } else {
        return `No tasks with status "${completedFilter}" found`;
      }
    }

    return "No active tasks found (done and reviewed tasks are filtered out)";
  };

  return (
    <>
      <Head>
        <title>Tasks | IX Projects</title>
        <meta name="description" content="Tasks management for IX Projects" />
      </Head>

      <div className="mb-6 relative">
        <h1 className="text-3xl font-bold text-gray-800">Tasks</h1>
        <p className="text-gray-600">
          Manage and track tasks across all IX projects
        </p>
      </div>

      {/* Subtle loading indicator at top of page */}
      {(loading || projectsLoading) && (
        <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-600 animate-pulse-bg rounded mb-4"></div>
      )}

      {/* Show non-critical errors as subtle warning banners but still display content */}
      {error ? (
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg border border-yellow-200 mb-4 animate-fade-in">
          <h3 className="text-base font-medium mb-1">Connection Notice</h3>
          <p className="text-sm">{error}</p>
        </div>
      ) : null}

      {/* Task Filters */}
      <TaskFilters
        projects={projects}
        projectFilter={projectFilter}
        setProjectFilter={setProjectFilter}
        completedFilter={completedFilter}
        setCompletedFilter={setCompletedFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortDirection={sortDirection}
        setSortDirection={setSortDirection}
        onAddNewClick={() => setShowAddForm(true)}
        taskCountsByStatus={taskCountsByStatus}
        refreshTasks={refreshTasks}
        dedupeEnabled={dedupeEnabled}
        setDedupeEnabled={setDedupeEnabled}
        runManualDedupe={runManualDedupe}
        tasks={filteredTasks}
      />

      {/* Task Creation Form */}
      {showAddForm && (
        <TaskForm
          projects={projects}
          onSubmit={addTask}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Tasks List - Always displayed regardless of loading state */}
      <div className="tasks-list mt-4" data-testid="task-list">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No tasks found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm
                ? `No tasks match the search term "${searchTerm}"`
                : getEmptyStateMessage()}
            </p>
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm("")}
                className="btn btn-outline-primary mr-3"
              >
                Clear search
              </button>
            ) : null}
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary relative overflow-hidden"
            >
              <span className="flex items-center">
                <span className="mr-1">+</span> Create your first task
                <span className="absolute inset-0 bg-white bg-opacity-30 transform scale-0 transition-transform duration-300 rounded-full hover:scale-0 active:scale-100 origin-center"></span>
              </span>
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-500 animate-fade-in flex items-center justify-between">
              <div>
                {filteredTasks.length}{" "}
                {filteredTasks.length === 1 ? "task" : "tasks"} found
              </div>
              <ClickableId
                id="CO_9104"
                filePath="/src/pages/tasks.tsx"
                className="px-3"
              />
            </div>
            <div className="mb-4 text-sm flex">
              {searchTerm && (
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs flex items-center">
                  Search: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm("")}
                    className="ml-1 text-blue-500 hover:text-blue-700"
                    aria-label="Clear search"
                    title="Clear search"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              )}
            </div>

            {/* Always use the same rendering approach regardless of list size to ensure consistency */}
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <div
                  key={`${task.id}-${task.project}`}
                  className="task-card-container relative"
                >
                  <TaskCard
                    task={task}
                    onStatusChange={updateTaskStatus}
                    onMarkTested={markTaskTested}
                    onDelete={deleteTask}
                    onUpdateDate={updateTaskDate}
                    onUpdateTask={(taskId, project, updates) => updateTask(taskId, updates)}
                    onToggleStar={toggleTaskStar}
                    // Item approval functions
                    onApproveRequirementItem={(taskId, itemId) => approveRequirementItem(taskId, itemId)}
                    onVetoRequirementItem={(taskId, itemId) => vetoRequirementItem(taskId, itemId)}
                    onUpdateRequirementItems={(taskId, items) => updateRequirementItems(taskId, items)}
                    onApproveTechnicalPlanItem={(taskId, itemId) => approveTechnicalPlanItem(taskId, itemId)}
                    onVetoTechnicalPlanItem={(taskId, itemId) => vetoTechnicalPlanItem(taskId, itemId)}
                    onUpdateTechnicalPlanItems={(taskId, items) => updateTechnicalPlanItems(taskId, items)}
                    onApproveNextStepItem={(taskId, itemId) => approveNextStepItem(taskId, itemId)}
                    onVetoNextStepItem={(taskId, itemId) => vetoNextStepItem(taskId, itemId)}
                    onUpdateNextStepItems={(taskId, items) => updateNextStepItems(taskId, items)}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

// Export the page component wrapped with auth requiring admin role
export default TasksPage;
