import React, { useState, useRef, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { useTasks } from "@/contexts/TaskContext";
import { useProjects } from "@/contexts/ProjectContext";
import TaskFilters from "@/components/TaskFilters";
import TaskCard from "@/components/TaskCard";
import TaskForm from "@/components/TaskForm";
import { FixedSizeList as List } from "react-window";
import { ClickableId } from "@/utils/clickable-id";
import { useLocalStorage, useLocalStorageBoolean, STORAGE_KEYS } from "@/utils/localStorage-helpers";
import ControlsToggle from "@/components/ControlsToggle";
import { Task } from "@/types";
// import { withAuth } from '@/utils/withAuth';

// Helper function for detailed router debugging
const debugRouter = (router: any, taskId: string) => {
  // Use originalConsole if available to ensure logs are shown even in production
  const logger = (window as any)._originalConsole?.error || console.error;
  
  logger('[ROUTER_DEBUG] ---NAVIGATION DEBUG---');
  logger(`[ROUTER_DEBUG] TaskID: ${taskId}`);
  logger(`[ROUTER_DEBUG] Router available routes:`, router.components);
  logger(`[ROUTER_DEBUG] Router events:`, router.events);
  logger(`[ROUTER_DEBUG] Router state:`, {
    pathname: router.pathname,
    asPath: router.asPath,
    route: router.route,
    query: router.query,
    locale: router.locale,
    isReady: router.isReady,
    isFallback: router.isFallback
  });
  
  // Check for the existence of /task/[id] in router state
  const hasTaskRoute = Object.keys(router.components || {}).some(path => 
    path === '/task/[id]' || path.startsWith('/task/')
  );
  logger(`[ROUTER_DEBUG] Has task route in components: ${hasTaskRoute}`);
  
  // Log any potentially conflicting routes
  const possibleConflictingRoutes = Object.keys(router.components || {}).filter(path => 
    path.includes('task')
  );
  logger(`[ROUTER_DEBUG] Possible conflicting routes:`, possibleConflictingRoutes);
  
  // Store in session storage for later inspection
  if (typeof window !== 'undefined') {
    try {
      const routerDebugInfo = {
        timestamp: new Date().toISOString(),
        taskId,
        components: router.components ? Object.keys(router.components) : [],
        state: {
          pathname: router.pathname,
          asPath: router.asPath,
          route: router.route,
          query: router.query,
          hasTaskRoute,
          conflictingRoutes: possibleConflictingRoutes
        }
      };
      
      // Save to session storage
      const debugHistory = JSON.parse(sessionStorage.getItem('ix_router_debug') || '[]');
      debugHistory.push(routerDebugInfo);
      sessionStorage.setItem('ix_router_debug', JSON.stringify(debugHistory.slice(-20))); // Keep last 20
      
      // Also add a UI indicator if needed
      const debugElement = document.getElementById('router-debug-indicator');
      if (debugElement) {
        debugElement.classList.remove('hidden');
      }
    } catch (e) {
      logger('[ROUTER_DEBUG] Error storing debug info:', e);
    }
  }
};

// CompactTaskItem Component - Shows a single task in one-line format
const CompactTaskItem = ({ 
  task, 
  onStatusChange, 
  onToggleStar,
  router
}: { 
  task: Task; 
  onStatusChange: (taskId: string, project: string, status: Task['status']) => Promise<void>;
  onToggleStar?: (taskId: string, project: string) => Promise<void>;
  router: any;
}) => {
  // For diagnostics only
  const handleDiagnosticClick = () => {
    console.log('Diagnostic click on task title');
    debugRouter(router, task.id);
  };
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
      
      {/* Task title - uses standard Next.js Link with explicit empty query to prevent param inheritance */}
      <div 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          router.push({
            pathname: `/task/${task.id}`,
            query: {} // Explicitly empty query to prevent inheriting URL params
          });
        }}
        className="flex-grow font-medium truncate cursor-pointer"
        title="Open task details"
      >
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
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [windowHeight, setWindowHeight] = useState(800); // Default height for SSR
  const [isClient, setIsClient] = useState(false);
  
  // Important: We're using functions in useState initializers to ensure
  // localStorage values are used immediately on first render
  
  // Only need viewMode state here now, since ControlsToggle manages its own state
  const [viewMode, setViewMode] = useLocalStorage<'card' | 'compact'>(STORAGE_KEYS.VIEW_MODE, 'card');
  
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

  const { projects, loading: projectsLoading, updateProjectsFromTasks } = useProjects();
  
  // Update project list from task data when tasks change
  useEffect(() => {
    if (filteredTasks && filteredTasks.length > 0) {
      // Use a ref to keep track of previous project IDs to avoid unnecessary updates
      const projectIdsJson = JSON.stringify(
        [...new Set(filteredTasks.map(task => task.project))].filter(Boolean)
      );
      
      // Store the JSON in a data attribute to avoid re-renders
      const prevProjectIds = document.documentElement.getAttribute('data-project-ids');
      
      // Only update if the project IDs have changed
      if (projectIdsJson !== prevProjectIds) {
        document.documentElement.setAttribute('data-project-ids', projectIdsJson);
        
        // Extract all unique project IDs from tasks
        const projectIds = JSON.parse(projectIdsJson);
        
        // Update projects context with these IDs
        updateProjectsFromTasks(projectIds);
      }
    }
  }, [filteredTasks, updateProjectsFromTasks]);

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
        return `Nothing here yet.`;
      }
      return `Nothing here yet.`;
    }

    if (projectFilter === "none") {
      return "Nothing here yet.";
    }

    if (completedFilter !== "all") {
      if (completedFilter === "pending") {
        return "Nothing here yet.";
      } else if (completedFilter === "recent-completed") {
        return "Nothing here yet.";
      } else {
        return `Nothing here yet.`;
      }
    }

    return "Nothing here yet.";
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

      {/* Modern loading indicator at top of page */}
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
          initialStatus={completedFilter !== 'all' && completedFilter !== 'pending' && completedFilter !== 'recent-completed' ? completedFilter : undefined}
          initialProject={typeof projectFilter === 'string' && projectFilter !== 'all' && projectFilter !== 'none' ? projectFilter : 
                         Array.isArray(projectFilter) && projectFilter.length === 1 ? projectFilter[0] : undefined}
        />
      )}

      {/* Tasks List - Always displayed regardless of loading state */}
      <div className="tasks-list mt-4" data-testid="task-list">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            {loading || projectsLoading ? (
              <div className="flex flex-col items-center justify-center py-4">
                <div className="spinner">
                  <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
                </div>
                <p className="mt-4 text-gray-600 font-medium">Loading tasks...</p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-gray-800 mb-2"></h3>
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
                    <span className="mr-1">+</span> Create a Task
                    <span className="absolute inset-0 bg-white bg-opacity-30 transform scale-0 transition-transform duration-300 rounded-full hover:scale-0 active:scale-100 origin-center"></span>
                  </span>
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-500 animate-fade-in flex items-center justify-between">
              <div>
                {filteredTasks.length}{" "}
                {filteredTasks.length === 1 ? "task" : "tasks"} found
              </div>
              <div className="flex items-center">
                {/* Add Task Button */}
                <button 
                  onClick={() => setShowAddForm(true)}
                  className="mr-3 px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-blue-100 text-blue-700 hover:bg-blue-200 flex items-center"
                  aria-label="Add new task"
                >
                  <span className="mr-1">+</span> Add Task
                </button>
                
                {/* Show Controls Toggle Button */}
                <ControlsToggle className="mr-3" />
                
                {/* View Mode Toggle */}
                <div className="mr-3 flex items-center gap-2 bg-white p-1 rounded-md border border-gray-200">
                  <button
                    onClick={() => setViewMode('card')}
                    className={`px-2 py-1 rounded text-sm ${
                      viewMode === 'card' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    aria-label="Card view"
                    title="Card view"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('compact')}
                    className={`px-2 py-1 rounded text-sm ${
                      viewMode === 'compact' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    aria-label="Compact view"
                    title="Compact view"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
                <ClickableId
                  id="CO_9104"
                  filePath="/src/pages/tasks.tsx"
                  className="px-3"
                />
              </div>
            </div>
            <div className="mb-4 text-sm flex justify-between">
              <div>
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
              {/* Router Debug Indicator */}
              <div id="router-debug-indicator" className="hidden">
                <button 
                  onClick={() => {
                    // Display the routing debug info from session storage
                    const debugInfo = JSON.parse(sessionStorage.getItem('ix_router_debug') || '[]');
                    const routingErrors = JSON.parse(sessionStorage.getItem('ix_router_errors') || '[]');
                    
                    // Use original console to ensure visibility
                    if ((window as any)._originalConsole) {
                      (window as any)._originalConsole.error('=== ROUTER DEBUG INFO ===', debugInfo);
                      (window as any)._originalConsole.error('=== ROUTER ERRORS ===', routingErrors);
                    } else {
                      console.error('=== ROUTER DEBUG INFO ===', debugInfo);
                      console.error('=== ROUTER ERRORS ===', routingErrors);
                    }
                    
                    // Create a UI display
                    const debugModal = document.createElement('div');
                    debugModal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
                    debugModal.innerHTML = `
                      <div class="bg-white rounded-lg shadow-xl p-6 max-w-4xl max-h-[80vh] overflow-auto">
                        <h2 class="text-lg font-bold mb-4">Router Debug Information</h2>
                        <div class="mb-4">
                          <h3 class="font-semibold mb-2">Routing Errors (${routingErrors.length})</h3>
                          <pre class="bg-red-50 p-3 rounded text-sm overflow-auto max-h-40">${JSON.stringify(routingErrors, null, 2)}</pre>
                        </div>
                        <div>
                          <h3 class="font-semibold mb-2">Navigation History (${debugInfo.length})</h3>
                          <pre class="bg-gray-50 p-3 rounded text-sm overflow-auto max-h-60">${JSON.stringify(debugInfo, null, 2)}</pre>
                        </div>
                        <div class="mt-4 flex justify-end">
                          <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" id="close-debug-modal">Close</button>
                        </div>
                      </div>
                    `;
                    document.body.appendChild(debugModal);
                    
                    document.getElementById('close-debug-modal')?.addEventListener('click', () => {
                      document.body.removeChild(debugModal);
                    });
                  }}
                  className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full border border-yellow-300 hover:bg-yellow-200"
                >
                  Router Debug Info
                </button>
              </div>
            </div>

            {loading || projectsLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="spinner relative">
                  <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
                  <div className="w-12 h-12 border-b-4 border-indigo-600 border-solid rounded-full animate-spin absolute top-0" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                </div>
              </div>
            ) : viewMode === 'card' ? (
              // Card View - Original layout
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
            ) : (
              // Compact View - One line per task
              <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                {/* Compact view header */}
                <div className="bg-gray-50 py-2 px-3 border-b border-gray-200 flex items-center text-sm font-medium text-gray-500">
                  <div className="w-8"></div> {/* Star column */}
                  <div className="flex-grow">Title</div>
                  <div className="w-24 text-right">Status</div>
                </div>
                
                {/* Compact task list */}
                <div className="compact-task-list">
                  {loading || projectsLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="spinner relative">
                        <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
                        <div className="w-12 h-12 border-b-4 border-indigo-600 border-solid rounded-full animate-spin absolute top-0" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                      </div>
                    </div>
                  ) : (
                    filteredTasks.map((task) => (
                    <div key={`${task.id}-${task.project}-compact-wrapper`}>
                      <CompactTaskItem
                        key={`${task.id}-${task.project}-compact`}
                        task={task}
                        onStatusChange={updateTaskStatus}
                        onToggleStar={toggleTaskStar}
                        router={router}
                      /* Add debugging button temporarily */
                      extraButtons={
                        <div className="mt-1 mb-1">
                          <button
                            onClick={() => {
                              console.log("Navigating to legacy URL format");
                              router.push({
                                pathname: '/task-detail',
                                query: { id: task.id } // Only include id, no other params
                              }, undefined, { shallow: false });
                            }}
                            className="px-2 py-1 bg-red-500 text-white text-xs rounded mr-2"
                          >
                            Legacy URL
                          </button>
                          <button
                            onClick={() => {
                              console.log("Navigating to new URL format");
                              router.push({
                                pathname: `/task/${task.id}`,
                                query: {} // Explicitly empty query
                              }, undefined, { shallow: false });
                            }}
                            className="px-2 py-1 bg-green-500 text-white text-xs rounded"
                          >
                            New URL
                          </button>
                        </div>
                      }
                      />
                    </div>
                  )))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

// Export the page component wrapped with auth requiring admin role
export default TasksPage;
