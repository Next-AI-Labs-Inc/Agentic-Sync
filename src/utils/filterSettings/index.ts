/**
 * Filter settings module
 * 
 * This file exports the public API for the filter settings system.
 * It provides components with a clean interface for managing filter state.
 */

// Export hooks
export { useProjectFilter } from './hooks/useProjectFilter';

// Export types
export type {
  FilterSettings,
  ProjectFilter,
  StatusFilter,
  SortSettings,
  FilterUIState,
  FilterValidationResult
} from './types';

// Export constants
export { DEFAULT_FILTER_SETTINGS } from './constants';

// Export storage utilities
export {
  saveFilterSettings,
  loadFilterSettings,
  saveProjectFilter,
  loadProjectFilter,
  saveStatusFilter,
  loadStatusFilter,
  saveSortSettings,
  loadSortSettings,
  saveUIState,
  loadUIState,
  clearAllFilterSettings
} from './storage';

// Export actions
export {
  selectProject,
  selectAllProjects,
  selectNoProjects,
  setStatusFilter,
  setSortSettings,
  toggleFiltersExpanded,
  applyFilters
} from './actions';