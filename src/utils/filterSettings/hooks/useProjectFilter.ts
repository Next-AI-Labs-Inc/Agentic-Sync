/**
 * Project filter hook
 * 
 * Custom React hook for managing project filter state with localStorage persistence.
 * Provides a clean API for components to interact with project filters.
 */

import { useState, useEffect, useCallback } from 'react';
import { ProjectFilter } from '../types';
import { DEFAULT_FILTER_SETTINGS } from '../constants';
import { 
  loadProjectFilter,
  saveProjectFilter
} from '../storage';
import {
  selectAllProjects,
  selectNoProjects,
  selectProject
} from '../actions';
import { PROJECT_FILTERS } from '@/config/constants';
import { Project, ProjectFilterType } from '@/types';

/**
 * Hook for managing project filter state
 * @param projects Available projects
 * @param initialFilter Optional initial filter value
 * @returns Project filter state and operations
 */
export function useProjectFilter(
  projects: Project[],
  initialFilter?: ProjectFilterType
) {
  // Get initial filter state
  const getInitialState = useCallback(() => {
    // If an initial filter was provided, use it
    if (initialFilter) {
      if (initialFilter === PROJECT_FILTERS.ALL) {
        return {
          value: PROJECT_FILTERS.ALL,
          selectedProjects: projects.map(p => p.id)
        };
      } else if (initialFilter === PROJECT_FILTERS.NONE) {
        return {
          value: PROJECT_FILTERS.NONE,
          selectedProjects: []
        };
      } else if (typeof initialFilter === 'string') {
        return {
          value: initialFilter,
          selectedProjects: [initialFilter]
        };
      } else if (Array.isArray(initialFilter)) {
        return {
          value: initialFilter,
          selectedProjects: initialFilter
        };
      }
    }
    
    // Otherwise load from storage
    const storedFilter = loadProjectFilter();
    
    // Validate stored projects against current projects
    const validProjectIds = projects.map(p => p.id);
    const validSelectedProjects = storedFilter.selectedProjects.filter(
      id => validProjectIds.includes(id)
    );
    
    // If stored projects are no longer valid, use default
    if (
      storedFilter.selectedProjects.length > 0 && 
      validSelectedProjects.length === 0
    ) {
      return DEFAULT_FILTER_SETTINGS.projectFilter;
    }
    
    // Return valid stored filter
    return {
      ...storedFilter,
      selectedProjects: validSelectedProjects
    };
  }, [projects, initialFilter]);
  
  // Initialize state
  const [projectFilter, setProjectFilter] = useState<ProjectFilter>(getInitialState);
  
  // Sync with storage when filter changes
  useEffect(() => {
    saveProjectFilter(projectFilter);
  }, [projectFilter]);
  
  // Update when projects change (to handle projects being added/removed)
  useEffect(() => {
    const validProjectIds = projects.map(p => p.id);
    const validSelectedProjects = projectFilter.selectedProjects.filter(
      id => validProjectIds.includes(id)
    );
    
    // If selected projects changed due to validation, update state
    if (validSelectedProjects.length !== projectFilter.selectedProjects.length) {
      setProjectFilter(prev => ({
        ...prev,
        selectedProjects: validSelectedProjects,
        value: getFilterValue(validSelectedProjects, projects)
      }));
    }
  }, [projects, projectFilter.selectedProjects]);
  
  /**
   * Helper to determine filter value from selected projects
   */
  const getFilterValue = (
    selectedProjects: string[], 
    availableProjects: Project[]
  ): ProjectFilterType => {
    if (selectedProjects.length === 0) {
      return PROJECT_FILTERS.NONE;
    } else if (
      selectedProjects.length === availableProjects.length && 
      availableProjects.length > 0
    ) {
      return PROJECT_FILTERS.ALL;
    } else if (selectedProjects.length === 1) {
      return selectedProjects[0];
    } else {
      return selectedProjects;
    }
  };
  
  /**
   * Toggle selection of a specific project
   */
  const toggleProject = useCallback((projectId: string) => {
    setProjectFilter(prev => {
      // Create a new settings object to apply the action to
      const settings = {
        projectFilter: prev,
        statusFilter: DEFAULT_FILTER_SETTINGS.statusFilter,
        sortSettings: DEFAULT_FILTER_SETTINGS.sortSettings,
        uiState: DEFAULT_FILTER_SETTINGS.uiState
      };
      
      // Apply the action
      const updated = selectProject(settings, projectId);
      
      // Return just the project filter part
      return updated.projectFilter;
    });
  }, []);
  
  /**
   * Select all projects
   */
  const selectAll = useCallback(() => {
    setProjectFilter(prev => {
      // Create a new settings object to apply the action to
      const settings = {
        projectFilter: prev,
        statusFilter: DEFAULT_FILTER_SETTINGS.statusFilter,
        sortSettings: DEFAULT_FILTER_SETTINGS.sortSettings,
        uiState: DEFAULT_FILTER_SETTINGS.uiState
      };
      
      // Apply the action
      const updated = selectAllProjects(settings, projects.map(p => p.id));
      
      // Return just the project filter part
      return updated.projectFilter;
    });
  }, [projects]);
  
  /**
   * Select no projects
   */
  const selectNone = useCallback(() => {
    setProjectFilter(prev => {
      // Create a new settings object to apply the action to
      const settings = {
        projectFilter: prev,
        statusFilter: DEFAULT_FILTER_SETTINGS.statusFilter,
        sortSettings: DEFAULT_FILTER_SETTINGS.sortSettings,
        uiState: DEFAULT_FILTER_SETTINGS.uiState
      };
      
      // Apply the action
      const updated = selectNoProjects(settings);
      
      // Return just the project filter part
      return updated.projectFilter;
    });
  }, []);
  
  /**
   * Set selected projects directly
   * Uses deep equality check to prevent unnecessary updates
   */
  const setSelectedProjects = useCallback((projectIds: string[]) => {
    // Perform deep equality check to prevent unnecessary re-renders
    setProjectFilter(prev => {
      // Check if arrays have the same elements (regardless of order)
      const prevSorted = [...prev.selectedProjects].sort();
      const newSorted = [...projectIds].sort();
      
      // If they're the same, return previous state unmodified
      if (JSON.stringify(prevSorted) === JSON.stringify(newSorted)) {
        return prev;
      }
      
      // Otherwise, update state with new values
      return {
        ...prev,
        selectedProjects: projectIds,
        value: getFilterValue(projectIds, projects)
      };
    });
  }, [projects]);
  
  /**
   * Set filter value directly
   */
  const setFilterValue = useCallback((filter: ProjectFilterType) => {
    let selectedProjects: string[] = [];
    
    if (filter === PROJECT_FILTERS.ALL) {
      selectedProjects = projects.map(p => p.id);
    } else if (filter === PROJECT_FILTERS.NONE) {
      selectedProjects = [];
    } else if (typeof filter === 'string') {
      selectedProjects = [filter];
    } else if (Array.isArray(filter)) {
      selectedProjects = filter;
    }
    
    setProjectFilter({
      value: filter,
      selectedProjects
    });
  }, [projects]);
  
  // Return state and operations
  return {
    // State
    filter: projectFilter.value,
    selectedProjects: projectFilter.selectedProjects,
    
    // Operations
    toggleProject,
    selectAll,
    selectNone,
    setSelectedProjects,
    setFilterValue
  };
}