import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { 
  Task, 
  TaskFilterStatus, 
  ProjectFilterType, 
  SortOption, 
  SortDirection 
} from '@/types';
import { useRouter } from 'next/router';
import { 
  createFilterPredicates, 
  filterTasksByStatus, 
  filterTasksBySearchTerm,
  shouldIncludeTaskByProject,
  getRecentCompletedThreshold,
  sortTasks
} from '@/utils/task';
import { STORAGE_KEYS } from '@/config/constants';

interface TaskFiltersHookProps {
  initialTasks: Task[];
}

interface TaskFiltersHookResult {
  // Filter states
  completedFilter: TaskFilterStatus;
  projectFilter: ProjectFilterType;
  sortBy: SortOption;
  sortDirection: SortDirection;
  searchTerm: string;
  
  // Filtered results
  filteredTasks: Task[];
  
  // Filter setters
  setCompletedFilter: (filter: TaskFilterStatus) => void;
  setProjectFilter: (filter: ProjectFilterType) => void;
  setSortBy: (sortBy: SortOption) => void;
  setSortDirection: (direction: SortDirection) => void;
  setSearchTerm: (term: string) => void;
  
  // Filter handlers
  saveFilterPreferences: () => void;
}

/**
 * Custom hook for managing task filtering, sorting, and search
 */
export function useTaskFilters({
  initialTasks
}: TaskFiltersHookProps): TaskFiltersHookResult {
  // IMPORTANT: Hooks must be called in exactly the same order on every render
  
  // 1. Router and state hooks first
  const router = useRouter();
  const [completedFilter, setCompletedFilter] = useState<TaskFilterStatus>('all');
  const [projectFilter, setProjectFilter] = useState<ProjectFilterType>('all');
  const [sortBy, setSortBy] = useState<SortOption>('created');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // 2. Refs next - keep all refs together at the top
  const isInitialRender = useRef(true);
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  
  // 3. memoizations 
  const twoDaysAgoMemo = useMemo(() => getRecentCompletedThreshold(), []);
  
  const filterPredicates = useMemo(() => 
    createFilterPredicates(twoDaysAgoMemo), 
  [twoDaysAgoMemo]);
  
  // 4. Callback functions
  
  // Storage preference function
  const savePreferencesToStorage = useCallback(() => {
    if (typeof window === 'undefined') return;

    const preferences = {
      completedFilter,
      projectFilter,
      sortBy,
      sortDirection
    };
    
    try {
      localStorage.setItem(STORAGE_KEYS.FILTER_PREFERENCES, JSON.stringify(preferences));
    } catch (err) {
      console.error('Failed to save filter preferences:', err);
    }
  }, [completedFilter, projectFilter, sortBy, sortDirection]);
  
  // URL update function - DISABLED to prevent query params in URLs
  const updateUrlParams = useCallback(() => {
    // Do nothing - URL params completely disabled
    return;
  }, []);
  
  // Combined function for backward compatibility
  const saveFilterPreferences = useCallback(() => {
    savePreferencesToStorage();
    
    // Skip URL update on initial render
    if (!isInitialRender.current) {
      updateUrlParams();
    }
  }, [savePreferencesToStorage, updateUrlParams]);
  
  // 5. Effects - Each with a single clear responsibility
  
  // Load preferences from localStorage DISABLED to prevent URL/routing issues 
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Mark initial render complete only - all preference loading disabled
    isInitialRender.current = false;
    
    // Cleanup function to clear any debounce timer
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []); // Empty deps - only run on mount
  
  // Save preferences when filters change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    saveFilterPreferences();
  }, [completedFilter, projectFilter, sortBy, sortDirection, saveFilterPreferences]);
  
  // 6. Final memoized result - the filtered tasks
  const filteredTasks = useMemo(() => {
    if (!initialTasks.length) return [];

    // First filter by status
    const statusFiltered = filterTasksByStatus(initialTasks, completedFilter, filterPredicates);
    
    // Then filter by project if needed
    const projectFiltered = projectFilter === 'all'
      ? statusFiltered
      : statusFiltered.filter(task => shouldIncludeTaskByProject(task, projectFilter));
    
    // Then filter by search term if present
    const searchFiltered = searchTerm
      ? filterTasksBySearchTerm(projectFiltered, searchTerm)
      : projectFiltered;
    
    // Finally, sort the results
    return sortTasks(searchFiltered, sortBy, sortDirection);
  }, [
    initialTasks, 
    completedFilter, 
    projectFilter, 
    searchTerm, 
    sortBy, 
    sortDirection, 
    filterPredicates
  ]);

  // Return all the filter state and methods
  return {
    // Filter states
    completedFilter,
    projectFilter,
    sortBy,
    sortDirection,
    searchTerm,
    
    // Filtered results
    filteredTasks,
    
    // Filter setters
    setCompletedFilter,
    setProjectFilter,
    setSortBy,
    setSortDirection,
    setSearchTerm,
    
    // Filter handlers
    saveFilterPreferences
  };
}