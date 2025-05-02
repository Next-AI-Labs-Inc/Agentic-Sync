/**
 * Filter settings actions
 * 
 * This file provides pure functions for manipulating filter state.
 * These functions handle the logic of changing filters without side effects.
 */

import {
  FilterSettings,
  ProjectFilter,
  StatusFilter,
  SortSettings
} from './types';
import { PROJECT_FILTERS } from '@/config/constants';

/**
 * Sets the project filter to select a specific project
 * @param settings Current filter settings
 * @param projectId The project ID to select
 * @returns Updated settings with the project selected
 */
export function selectProject(
  settings: FilterSettings,
  projectId: string
): FilterSettings {
  // Check if project is already selected
  const isSelected = settings.projectFilter.selectedProjects.includes(projectId);
  
  // If already selected, remove it; otherwise add it
  const selectedProjects = isSelected
    ? settings.projectFilter.selectedProjects.filter(id => id !== projectId)
    : [...settings.projectFilter.selectedProjects, projectId];
  
  // Determine the appropriate filter value based on selection
  let filterValue: ProjectFilter['value'];
  if (selectedProjects.length === 0) {
    filterValue = PROJECT_FILTERS.NONE;
  } else if (selectedProjects.length === 1) {
    filterValue = selectedProjects[0];
  } else {
    filterValue = selectedProjects;
  }
  
  // Return updated settings
  return {
    ...settings,
    projectFilter: {
      value: filterValue,
      selectedProjects
    }
  };
}

/**
 * Selects all available projects
 * @param settings Current filter settings
 * @param availableProjects List of all available project IDs
 * @returns Updated settings with all projects selected
 */
export function selectAllProjects(
  settings: FilterSettings,
  availableProjects: string[]
): FilterSettings {
  // Check if all projects are already selected
  const allSelected = availableProjects.length > 0 && 
    availableProjects.every(id => 
      settings.projectFilter.selectedProjects.includes(id)
    );
  
  // If all are selected, clear selection; otherwise select all
  const selectedProjects = allSelected ? [] : [...availableProjects];
  
  // Determine filter value
  const filterValue = allSelected 
    ? PROJECT_FILTERS.NONE 
    : PROJECT_FILTERS.ALL;
  
  // Return updated settings
  return {
    ...settings,
    projectFilter: {
      value: filterValue,
      selectedProjects
    }
  };
}

/**
 * Clears all project selections (select none)
 * @param settings Current filter settings
 * @returns Updated settings with no projects selected
 */
export function selectNoProjects(settings: FilterSettings): FilterSettings {
  return {
    ...settings,
    projectFilter: {
      value: PROJECT_FILTERS.NONE,
      selectedProjects: []
    }
  };
}

/**
 * Sets a specific status filter
 * @param settings Current filter settings
 * @param statusValue The status value to set
 * @returns Updated settings with the status filter set
 */
export function setStatusFilter(
  settings: FilterSettings,
  statusValue: StatusFilter['value']
): FilterSettings {
  return {
    ...settings,
    statusFilter: {
      value: statusValue
    }
  };
}

/**
 * Sets sort settings
 * @param settings Current filter settings
 * @param sortSettings New sort settings
 * @returns Updated settings with sort options set
 */
export function setSortSettings(
  settings: FilterSettings,
  sortSettings: SortSettings
): FilterSettings {
  return {
    ...settings,
    sortSettings
  };
}

/**
 * Toggles the expanded state of the filters panel
 * @param settings Current filter settings
 * @returns Updated settings with toggled filters expanded state
 */
export function toggleFiltersExpanded(
  settings: FilterSettings
): FilterSettings {
  return {
    ...settings,
    uiState: {
      ...settings.uiState,
      filtersExpanded: !settings.uiState.filtersExpanded
    }
  };
}

/**
 * Applies filters from another settings object
 * @param settings Current filter settings
 * @param newFilters Filter settings to apply
 * @returns Updated settings with new filters applied
 */
export function applyFilters(
  settings: FilterSettings,
  newFilters: Partial<FilterSettings>
): FilterSettings {
  return {
    ...settings,
    ...(newFilters.projectFilter && { projectFilter: newFilters.projectFilter }),
    ...(newFilters.statusFilter && { statusFilter: newFilters.statusFilter }),
    ...(newFilters.sortSettings && { sortSettings: newFilters.sortSettings }),
    ...(newFilters.uiState && { uiState: newFilters.uiState })
  };
}