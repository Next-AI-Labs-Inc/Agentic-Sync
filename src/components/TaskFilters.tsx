import React, { useState, useEffect } from 'react';
import { Project, TaskFilterStatus, ProjectFilterType, SortOption, SortDirection, SavedFilter } from '@/types';
import { FaSave, FaTrash, FaFilter, FaBroom, FaEllipsisV, FaCog } from 'react-icons/fa';
import * as taskApiService from '@/services/taskApiService';
import { TASK_STATUSES, SORT_OPTIONS, SORT_DIRECTIONS, STATUS_DISPLAY, STORAGE_KEYS } from '@/config/constants';
import DropdownMenu, { DropdownMenuItem } from './DropdownMenu';
import ProjectSelector from './ProjectSelector';

interface TaskFiltersProps {
  projects: Project[];
  projectFilter: ProjectFilterType;
  setProjectFilter: (filter: ProjectFilterType) => void;
  completedFilter: TaskFilterStatus;
  setCompletedFilter: (filter: TaskFilterStatus) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  sortDirection: SortDirection;
  setSortDirection: (direction: SortDirection) => void;
  onAddNewClick: () => void;
  taskCountsByStatus?: Record<string, number>;
  refreshTasks?: () => Promise<any>;
  dedupeEnabled?: boolean;
  setDedupeEnabled?: (enabled: boolean) => void;
  runManualDedupe?: () => void;
}

export default function TaskFilters({
  projects,
  projectFilter,
  setProjectFilter,
  completedFilter,
  setCompletedFilter,
  sortBy,
  setSortBy,
  sortDirection,
  setSortDirection,
  onAddNewClick,
  taskCountsByStatus = {},
  refreshTasks,
  dedupeEnabled = false,
  setDedupeEnabled,
  runManualDedupe
}: TaskFiltersProps) {
  // Sort projects alphabetically by name
  const sortedProjects = [...projects].sort((a, b) => 
    a.name.localeCompare(b.name)
  );
  
  // State for selected projects in multi-select
  const [selectedProjects, setSelectedProjects] = useState<string[]>(
    Array.isArray(projectFilter) ? projectFilter : 
    projectFilter !== 'all' && projectFilter !== 'none' ? [projectFilter as string] : []
  );

  // State for saved filters
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [filterName, setFilterName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  
  // State for collapsible sections
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  
  // Remember user's preference for expanded/collapsed filters
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEYS.FILTERS_EXPANDED);
    if (savedState !== null) {
      setFiltersExpanded(savedState === 'true');
    }
  }, []);
  
  // Save filters expanded state
  const toggleFiltersExpanded = () => {
    const newState = !filtersExpanded;
    setFiltersExpanded(newState);
    localStorage.setItem(STORAGE_KEYS.FILTERS_EXPANDED, String(newState));
  };
  
  // Load saved filters from localStorage
  useEffect(() => {
    const storedFilters = localStorage.getItem(STORAGE_KEYS.SAVED_FILTERS);
    if (storedFilters) {
      try {
        setSavedFilters(JSON.parse(storedFilters));
      } catch (e) {
        console.error('Failed to parse saved filters:', e);
      }
    }
  }, []);
  
  // Save filters to localStorage when they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SAVED_FILTERS, JSON.stringify(savedFilters));
  }, [savedFilters]);
  
  // Handle multi-select project selection
  const handleProjectSelection = (projectId: string) => {
    const newSelectedProjects = selectedProjects.includes(projectId)
      ? selectedProjects.filter(id => id !== projectId)
      : [...selectedProjects, projectId];
    
    setSelectedProjects(newSelectedProjects);
    
    // Update the actual filter state
    if (newSelectedProjects.length === 0) {
      setProjectFilter('none');
    } else if (newSelectedProjects.length === projects.length) {
      setProjectFilter('all');
    } else if (newSelectedProjects.length === 1) {
      setProjectFilter(newSelectedProjects[0]);
    } else {
      setProjectFilter(newSelectedProjects);
    }
  };
  
  // Select/deselect all projects
  const handleSelectAllProjects = () => {
    if (selectedProjects.length === projects.length) {
      // Deselect all
      setSelectedProjects([]);
      setProjectFilter('none');
    } else {
      // Select all
      setSelectedProjects(projects.map(p => p.id));
      setProjectFilter('all');
    }
  };
  
  // Handle selecting none
  const handleSelectNone = () => {
    setSelectedProjects([]);
    setProjectFilter('none');
  };
  
  // Save current filter
  const saveCurrentFilter = () => {
    if (!filterName.trim()) return;
    
    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: filterName.trim(),
      statusFilter: completedFilter,
      projectFilter: projectFilter,
      sortBy: sortBy,
      sortDirection: sortDirection
    };
    
    setSavedFilters([...savedFilters, newFilter]);
    setFilterName('');
    setShowSaveForm(false);
  };
  
  // Apply saved filter
  const applySavedFilter = (filter: SavedFilter) => {
    setCompletedFilter(filter.statusFilter);
    setProjectFilter(filter.projectFilter);
    setSortBy(filter.sortBy);
    setSortDirection(filter.sortDirection);
    
    // Update selected projects state
    if (Array.isArray(filter.projectFilter)) {
      setSelectedProjects(filter.projectFilter);
    } else if (filter.projectFilter !== 'all' && filter.projectFilter !== 'none') {
      setSelectedProjects([filter.projectFilter as string]);
    } else {
      setSelectedProjects(filter.projectFilter === 'all' ? projects.map(p => p.id) : []);
    }
  };
  
  // Delete saved filter
  const deleteSavedFilter = (id: string) => {
    setSavedFilters(savedFilters.filter(f => f.id !== id));
  };
  
  // Clean up duplicate tasks in the database
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<{
    success: boolean;
    message: string;
    duplicatesRemoved?: number;
  } | null>(null);
  
  const handleCleanupDuplicates = async () => {
    // No confirmation dialog - execute immediately
    setIsCleaningUp(true);
    setCleanupResult(null);
    
    try {
      const result = await taskApiService.cleanupDuplicateTasks();
      setCleanupResult({
        success: true,
        message: result.message || `Successfully removed ${result.duplicatesRemoved} duplicate tasks.`,
        duplicatesRemoved: result.duplicatesRemoved
      });
      
      // Refresh the task list
      if (refreshTasks) {
        await refreshTasks();
      }
    } catch (error) {
      console.error('Error cleaning up duplicates:', error);
      setCleanupResult({
        success: false,
        message: 'Failed to clean up duplicates. Please try again later.'
      });
    } finally {
      setIsCleaningUp(false);
    }
  };
  
  // Actions for dropdown menu
  const getMenuItems = (): DropdownMenuItem[] => {
    const items: DropdownMenuItem[] = [
      {
        id: 'save-filter',
        label: 'Save Current Filter',
        icon: <FaSave size={14} />,
        onClick: () => setShowSaveForm(!showSaveForm),
        description: 'Save the current filter settings for future use'
      },
      {
        id: 'cleanup',
        label: isCleaningUp ? 'Cleaning...' : 'Clean Duplicate Tasks (Server)',
        icon: <FaBroom size={14} />,
        onClick: handleCleanupDuplicates,
        disabled: isCleaningUp,
        description: 'Remove duplicate tasks from the database'
      }
    ];
    
    // Add deduplication toggle if the prop is provided
    if (setDedupeEnabled) {
      items.push({
        id: 'toggle-dedupe',
        label: `${dedupeEnabled ? 'Disable' : 'Enable'} Client Deduplication`,
        icon: <FaBroom size={14} />,
        onClick: () => setDedupeEnabled(!dedupeEnabled),
        description: `${dedupeEnabled ? 'Disable' : 'Enable'} automatic client-side deduplication (impacts performance)`
      });
    }
    
    // Add manual deduplication button if the function is provided
    if (runManualDedupe) {
      items.push({
        id: 'manual-dedupe',
        label: 'Run Manual Deduplication',
        icon: <FaBroom size={14} />,
        onClick: runManualDedupe,
        description: 'Manually remove duplicate tasks from the current view'
      });
    }
    
    return items;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
        <div className="flex items-center">
          <button 
            onClick={toggleFiltersExpanded}
            className="mr-2 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label={filtersExpanded ? "Collapse filters" : "Expand filters"}
          >
            <svg 
              className={`h-5 w-5 transform transition-transform ${filtersExpanded ? 'rotate-0' : '-rotate-90'}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold">Task Filters</h2>
        </div>
        <div className="flex items-center gap-2 mt-2 md:mt-0">
          <DropdownMenu 
            trigger={
              <button className="btn-icon">
                <FaCog size={14} />
              </button>
            }
            items={getMenuItems()}
            label="Task actions"
          />
          <button 
            onClick={onAddNewClick}
            className="btn btn-primary relative overflow-hidden"
          >
            <span className="flex items-center">
              <span className="mr-1">+</span> Add New Task
              {/* Interactive ripple effect on click */}
              <span className="absolute inset-0 bg-white bg-opacity-30 transform scale-0 transition-transform duration-300 rounded-full hover:scale-0 active:scale-100 origin-center"></span>
            </span>
          </button>
        </div>
      </div>
      
      {/* Collapsible filter content */}
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          filtersExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
      
      {/* Cleanup result message */}
      {cleanupResult && (
        <div className={`mb-4 p-3 rounded-md ${cleanupResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <p className={`text-sm ${cleanupResult.success ? 'text-green-700' : 'text-red-700'}`}>
            {cleanupResult.message}
          </p>
        </div>
      )}
      
      {/* Status filter tabs with counts */}
      <div className="mb-4">
        <div className="flex overflow-x-auto space-x-1 pb-2">
          {/* All Tasks */}
          <button
            onClick={() => setCompletedFilter(TASK_STATUSES.ALL)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center whitespace-nowrap
              ${completedFilter === TASK_STATUSES.ALL ? STATUS_DISPLAY[TASK_STATUSES.ALL].color : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {STATUS_DISPLAY[TASK_STATUSES.ALL].label}
            {taskCountsByStatus && <span className="ml-1.5 bg-white bg-opacity-50 px-1.5 py-0.5 rounded-full text-xs">
              {Object.values(taskCountsByStatus).reduce((acc, count) => acc + count, 0)}
            </span>}
          </button>
          
          {/* Proposed */}
          <button
            onClick={() => setCompletedFilter(TASK_STATUSES.PROPOSED)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center whitespace-nowrap
              ${completedFilter === TASK_STATUSES.PROPOSED ? STATUS_DISPLAY[TASK_STATUSES.PROPOSED].color : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {STATUS_DISPLAY[TASK_STATUSES.PROPOSED].label}
            {taskCountsByStatus && <span className="ml-1.5 bg-white bg-opacity-50 px-1.5 py-0.5 rounded-full text-xs">
              {taskCountsByStatus[TASK_STATUSES.PROPOSED] || 0}
            </span>}
          </button>
          
          {/* Backlog */}
          <button
            onClick={() => setCompletedFilter(TASK_STATUSES.BACKLOG)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center whitespace-nowrap
              ${completedFilter === TASK_STATUSES.BACKLOG ? STATUS_DISPLAY[TASK_STATUSES.BACKLOG].color : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {STATUS_DISPLAY[TASK_STATUSES.BACKLOG].label}
            {taskCountsByStatus && <span className="ml-1.5 bg-white bg-opacity-50 px-1.5 py-0.5 rounded-full text-xs">
              {taskCountsByStatus[TASK_STATUSES.BACKLOG] || 0}
            </span>}
          </button>
          
          {/* Todo */}
          <button
            onClick={() => setCompletedFilter(TASK_STATUSES.TODO)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center whitespace-nowrap
              ${completedFilter === TASK_STATUSES.TODO ? STATUS_DISPLAY[TASK_STATUSES.TODO].color : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {STATUS_DISPLAY[TASK_STATUSES.TODO].label}
            {taskCountsByStatus && <span className="ml-1.5 bg-white bg-opacity-50 px-1.5 py-0.5 rounded-full text-xs">
              {taskCountsByStatus[TASK_STATUSES.TODO] || 0}
            </span>}
          </button>
          
          {/* In Progress */}
          <button
            onClick={() => setCompletedFilter(TASK_STATUSES.IN_PROGRESS)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center whitespace-nowrap
              ${completedFilter === TASK_STATUSES.IN_PROGRESS ? STATUS_DISPLAY[TASK_STATUSES.IN_PROGRESS].color : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {STATUS_DISPLAY[TASK_STATUSES.IN_PROGRESS].label}
            {taskCountsByStatus && <span className="ml-1.5 bg-white bg-opacity-50 px-1.5 py-0.5 rounded-full text-xs">
              {taskCountsByStatus[TASK_STATUSES.IN_PROGRESS] || 0}
            </span>}
          </button>
          
          {/* On Hold */}
          <button
            onClick={() => setCompletedFilter(TASK_STATUSES.ON_HOLD)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center whitespace-nowrap
              ${completedFilter === TASK_STATUSES.ON_HOLD ? STATUS_DISPLAY[TASK_STATUSES.ON_HOLD].color : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {STATUS_DISPLAY[TASK_STATUSES.ON_HOLD].label}
            {taskCountsByStatus && <span className="ml-1.5 bg-white bg-opacity-50 px-1.5 py-0.5 rounded-full text-xs">
              {taskCountsByStatus[TASK_STATUSES.ON_HOLD] || 0}
            </span>}
          </button>
          
          {/* Done */}
          <button
            onClick={() => setCompletedFilter(TASK_STATUSES.DONE)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center whitespace-nowrap
              ${completedFilter === TASK_STATUSES.DONE ? STATUS_DISPLAY[TASK_STATUSES.DONE].color : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {STATUS_DISPLAY[TASK_STATUSES.DONE].label}
            {taskCountsByStatus && <span className="ml-1.5 bg-white bg-opacity-50 px-1.5 py-0.5 rounded-full text-xs">
              {taskCountsByStatus[TASK_STATUSES.DONE] || 0}
            </span>}
          </button>
          
          {/* Reviewed */}
          <button
            onClick={() => setCompletedFilter(TASK_STATUSES.REVIEWED)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center whitespace-nowrap
              ${completedFilter === TASK_STATUSES.REVIEWED ? STATUS_DISPLAY[TASK_STATUSES.REVIEWED].color : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {STATUS_DISPLAY[TASK_STATUSES.REVIEWED].label}
            {taskCountsByStatus && <span className="ml-1.5 bg-white bg-opacity-50 px-1.5 py-0.5 rounded-full text-xs">
              {taskCountsByStatus[TASK_STATUSES.REVIEWED] || 0}
            </span>}
          </button>
          
          {/* Archived */}
          <button
            onClick={() => setCompletedFilter(TASK_STATUSES.ARCHIVED)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center whitespace-nowrap
              ${completedFilter === TASK_STATUSES.ARCHIVED ? STATUS_DISPLAY[TASK_STATUSES.ARCHIVED].color : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {STATUS_DISPLAY[TASK_STATUSES.ARCHIVED].label}
            {taskCountsByStatus && <span className="ml-1.5 bg-white bg-opacity-50 px-1.5 py-0.5 rounded-full text-xs">
              {taskCountsByStatus[TASK_STATUSES.ARCHIVED] || 0}
            </span>}
          </button>
          
          {/* All Pending */}
          <button
            onClick={() => setCompletedFilter(TASK_STATUSES.PENDING)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center whitespace-nowrap
              ${completedFilter === TASK_STATUSES.PENDING ? STATUS_DISPLAY[TASK_STATUSES.PENDING].color : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {STATUS_DISPLAY[TASK_STATUSES.PENDING].label}
            {taskCountsByStatus && <span className="ml-1.5 bg-white bg-opacity-50 px-1.5 py-0.5 rounded-full text-xs">
              {([TASK_STATUSES.PROPOSED, TASK_STATUSES.BACKLOG, TASK_STATUSES.TODO, TASK_STATUSES.IN_PROGRESS, TASK_STATUSES.ON_HOLD] as const)
                .reduce((acc, status) => acc + (taskCountsByStatus[status] || 0), 0)}
            </span>}
          </button>
          
          {/* Recently Completed */}
          <button
            onClick={() => setCompletedFilter(TASK_STATUSES.RECENT_COMPLETED)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center whitespace-nowrap
              ${completedFilter === TASK_STATUSES.RECENT_COMPLETED ? STATUS_DISPLAY[TASK_STATUSES.RECENT_COMPLETED].color : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {STATUS_DISPLAY[TASK_STATUSES.RECENT_COMPLETED].label}
          </button>
        </div>
      </div>
      
      {/* Save Filter Form */}
      {showSaveForm && (
        <div className="mb-4 p-3 border border-blue-200 rounded-md bg-blue-50">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Filter name"
              className="form-input"
            />
            <button
              onClick={saveCurrentFilter}
              disabled={!filterName.trim()}
              className={`btn-outline-primary ${!filterName.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Save
            </button>
            <button
              onClick={() => setShowSaveForm(false)}
              className="btn-outline-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {/* Saved Filters */}
      {savedFilters.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Saved Filters</h3>
          <div className="flex flex-wrap gap-2">
            {savedFilters.map(filter => (
              <div key={filter.id} className="flex items-center bg-gray-100 rounded-md pr-1">
                <button
                  onClick={() => applySavedFilter(filter)}
                  className="px-3 py-1 text-sm hover:bg-gray-200 rounded-l-md"
                >
                  <span className="mr-1">
                    <FaFilter size={10} className="inline text-gray-500" />
                  </span>
                  {filter.name}
                </button>
                <button
                  onClick={() => deleteSavedFilter(filter.id)}
                  className="ml-1 p-1 text-gray-500 hover:text-red-500 rounded"
                  aria-label={`Delete ${filter.name} filter`}
                >
                  <FaTrash size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Project multi-select filter */}
        <div className="lg:col-span-2">
          <ProjectSelector 
            projects={projects}
            selectedProjects={selectedProjects}
            onChange={setSelectedProjects}
            updateGlobalFilter={setProjectFilter}
          />
        </div>
        
        {/* Sort by */}
        <div>
          <label htmlFor="sort-by" className="form-label">
            Sort By
          </label>
          <select 
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="form-select"
          >
            <option value={SORT_OPTIONS.CREATED}>Creation Date</option>
            <option value={SORT_OPTIONS.UPDATED}>Last Updated</option>
            <option value={SORT_OPTIONS.PRIORITY}>Priority</option>
            <option value={SORT_OPTIONS.STATUS}>Status</option>
          </select>
        </div>
        
        {/* Sort direction */}
        <div>
          <label htmlFor="sort-direction" className="form-label">
            Sort Direction
          </label>
          <select 
            id="sort-direction"
            value={sortDirection}
            onChange={(e) => setSortDirection(e.target.value as SortDirection)}
            className="form-select"
          >
            <option value={SORT_DIRECTIONS.DESC}>Descending</option>
            <option value={SORT_DIRECTIONS.ASC}>Ascending</option>
          </select>
        </div>
      </div>
      
      </div> {/* End of collapsible section */}
    </div>
  );
}