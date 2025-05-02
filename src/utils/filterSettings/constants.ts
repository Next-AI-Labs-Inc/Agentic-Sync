/**
 * Filter settings constants
 * 
 * This file defines constants used throughout the filter settings system.
 * Centralizing these values ensures consistency across the application.
 */

import { FilterSettings, FilterStorageKeys } from './types';
import { PROJECT_FILTERS } from '@/config/constants';
import { TASK_STATUSES, SORT_OPTIONS, SORT_DIRECTIONS } from '@/config/constants';

/**
 * Default settings to use when no saved settings exist
 */
export const DEFAULT_FILTER_SETTINGS: FilterSettings = {
  projectFilter: {
    value: PROJECT_FILTERS.ALL,
    selectedProjects: []
  },
  statusFilter: {
    value: TASK_STATUSES.ALL
  },
  sortSettings: {
    sortBy: SORT_OPTIONS.UPDATED,
    direction: SORT_DIRECTIONS.DESC
  },
  uiState: {
    filtersExpanded: true,
    projectSelectorExpanded: false
  }
};

/**
 * Storage configuration for filters
 */
export const FILTER_STORAGE_CONFIG = {
  // Main storage key for unified filter settings
  MAIN_KEY: FilterStorageKeys.FILTER_SETTINGS,
  
  // Keys for legacy storage (for backward compatibility)
  LEGACY: {
    PROJECT_FILTER: FilterStorageKeys.LEGACY_PROJECT_FILTER,
    SELECTED_PROJECTS: FilterStorageKeys.LEGACY_SELECTED_PROJECTS,
    FILTER_PREFERENCES: FilterStorageKeys.LEGACY_FILTER_PREFERENCES,
    FILTERS_EXPANDED: FilterStorageKeys.LEGACY_FILTERS_EXPANDED
  }
};

/**
 * Filter validation configuration
 */
export const FILTER_VALIDATION = {
  MAX_SELECTED_PROJECTS: 50,
  MAX_FILTER_NAME_LENGTH: 50
};