import { useState, useCallback, useMemo, useEffect } from 'react';
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
  const router = useRouter();
  
  // Filter state
  const [completedFilter, setCompletedFilter] = useState<TaskFilterStatus>('all');
  const [projectFilter, setProjectFilter] = useState<ProjectFilterType>('all');
  const [sortBy, setSortBy] = useState<SortOption>('created');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Load filter preferences from localStorage on initial render
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedPreferences = localStorage.getItem(STORAGE_KEYS.FILTER_PREFERENCES);
      if (savedPreferences) {
        const preferences = JSON.parse(savedPreferences);

        // Don't apply saved filters if there are URL params
        const hasUrlParams = Object.keys(router.query).some((param) =>
          ['filter', 'project', 'sort', 'direction'].includes(param)
        );

        if (!hasUrlParams) {
          preferences.completedFilter && setCompletedFilter(preferences.completedFilter);
          preferences.projectFilter && setProjectFilter(preferences.projectFilter);
          preferences.sortBy && setSortBy(preferences.sortBy);
          preferences.sortDirection && setSortDirection(preferences.sortDirection);
        }
      }
    } catch (err) {
      console.error('Failed to load filter preferences:', err);
    }
  }, [router.query]);

  // Save filter preferences to localStorage and update URL
  const saveFilterPreferences = useCallback(() => {
    if (typeof window === 'undefined') return;

    const preferences = {
      completedFilter,
      projectFilter,
      sortBy,
      sortDirection
    };
    localStorage.setItem(STORAGE_KEYS.FILTER_PREFERENCES, JSON.stringify(preferences));

    // Update URL with filter params
    const query: Record<string, string | string[]> = {};

    if (completedFilter !== 'all') {
      query.filter = completedFilter;
    }

    if (projectFilter !== 'all') {
      query.project = Array.isArray(projectFilter)
        ? projectFilter
        : projectFilter === 'none'
        ? 'none'
        : projectFilter;
    }

    if (sortBy !== 'created') {
      query.sort = sortBy;
    }

    if (sortDirection !== 'desc') {
      query.direction = sortDirection;
    }

    router.replace(
      {
        pathname: router.pathname,
        query
      },
      undefined,
      { shallow: true }
    );
  }, [completedFilter, projectFilter, sortBy, sortDirection, router]);

  // Save filter preferences when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      saveFilterPreferences();
    }
  }, [completedFilter, projectFilter, sortBy, sortDirection, saveFilterPreferences]);

  // Memoize date for recent-completed filter calculation
  const twoDaysAgoMemo = useMemo(() => getRecentCompletedThreshold(), []);

  // Pre-compute filter predicates for better performance
  const filterPredicates = useMemo(() => 
    createFilterPredicates(twoDaysAgoMemo), 
  [twoDaysAgoMemo]);
  
  // Apply all filters and sorting to get the filtered tasks
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