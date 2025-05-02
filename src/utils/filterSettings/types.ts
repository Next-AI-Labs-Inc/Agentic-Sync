/**
 * Filter settings type definitions
 * 
 * This file contains TypeScript types for filter settings management.
 * It provides consistent type definitions for all filter-related operations.
 */

import { ProjectFilterType, SortDirection, SortOption, TaskFilterStatus } from '@/types';

/**
 * Complete filter settings object that represents all possible
 * filter options in a unified structure
 */
export interface FilterSettings {
  // Project filtering
  projectFilter: ProjectFilter;
  
  // Task status filtering
  statusFilter: StatusFilter;
  
  // Sorting options
  sortSettings: SortSettings;
  
  // UI state
  uiState: FilterUIState;
}

/**
 * Project filter settings
 */
export interface ProjectFilter {
  // The current active filter value
  value: ProjectFilterType;
  
  // Selected project IDs (for multi-select mode)
  selectedProjects: string[];
}

/**
 * Status filter settings
 */
export interface StatusFilter {
  // The currently active status filter
  value: TaskFilterStatus;
}

/**
 * Sort settings configuration
 */
export interface SortSettings {
  // The field to sort by
  sortBy: SortOption;
  
  // The direction of sorting
  direction: SortDirection;
}

/**
 * UI state for filters
 */
export interface FilterUIState {
  // Whether filters panel is expanded
  filtersExpanded: boolean;
  
  // Whether project selector is expanded
  projectSelectorExpanded: boolean;
}

/**
 * Filter storage keys used by storage utility
 */
export enum FilterStorageKeys {
  // Complete settings object
  FILTER_SETTINGS = 'taskFilterSettings',
  
  // Legacy keys for backward compatibility
  LEGACY_PROJECT_FILTER = 'taskProjectFilter',
  LEGACY_SELECTED_PROJECTS = 'selectedProjects',
  LEGACY_FILTER_PREFERENCES = 'taskFilterPreferences',
  LEGACY_FILTERS_EXPANDED = 'taskFiltersExpanded'
}

/**
 * Filter validation result
 */
export interface FilterValidationResult {
  valid: boolean;
  message?: string;
}