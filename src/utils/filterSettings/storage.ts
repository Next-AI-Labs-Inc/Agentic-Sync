/**
 * Filter settings storage utilities
 * 
 * This file provides functions for saving and loading filter settings
 * to/from localStorage with proper error handling and type safety.
 */

import { 
  FilterSettings, 
  FilterStorageKeys,
  ProjectFilter,
  StatusFilter,
  SortSettings,
  FilterUIState
} from './types';
import { DEFAULT_FILTER_SETTINGS, FILTER_STORAGE_CONFIG } from './constants';
import { PROJECT_FILTERS } from '@/config/constants';

/**
 * Saves complete filter settings to localStorage
 * @param settings The filter settings to save
 * @returns boolean indicating success
 */
export function saveFilterSettings(settings: FilterSettings): boolean {
  try {
    if (typeof window === 'undefined') return false;
    
    // Save unified settings
    localStorage.setItem(
      FILTER_STORAGE_CONFIG.MAIN_KEY, 
      JSON.stringify(settings)
    );
    
    // For backward compatibility, also update legacy keys
    updateLegacyStorage(settings);
    
    return true;
  } catch (error) {
    console.error('Error saving filter settings:', error);
    return false;
  }
}

/**
 * Loads complete filter settings from localStorage
 * @returns The loaded filter settings, or default settings if none exist
 */
export function loadFilterSettings(): FilterSettings {
  try {
    if (typeof window === 'undefined') return DEFAULT_FILTER_SETTINGS;
    
    // Check for unified settings first
    const savedSettings = localStorage.getItem(FILTER_STORAGE_CONFIG.MAIN_KEY);
    if (savedSettings) {
      return JSON.parse(savedSettings) as FilterSettings;
    }
    
    // If unified settings don't exist, try to load from legacy storage
    return loadFromLegacyStorage();
  } catch (error) {
    console.error('Error loading filter settings:', error);
    return DEFAULT_FILTER_SETTINGS;
  }
}

/**
 * Saves project filter settings to localStorage
 * @param projectFilter The project filter settings to save
 * @returns boolean indicating success
 */
export function saveProjectFilter(projectFilter: ProjectFilter): boolean {
  try {
    if (typeof window === 'undefined') return false;
    
    // Load existing settings first to avoid overwriting other settings
    const currentSettings = loadFilterSettings();
    
    // Update project filter
    const updatedSettings: FilterSettings = {
      ...currentSettings,
      projectFilter
    };
    
    // Save updated settings
    return saveFilterSettings(updatedSettings);
  } catch (error) {
    console.error('Error saving project filter:', error);
    return false;
  }
}

/**
 * Loads project filter settings from localStorage
 * @returns The loaded project filter settings, or defaults if none exist
 */
export function loadProjectFilter(): ProjectFilter {
  try {
    // Load complete settings
    const settings = loadFilterSettings();
    
    // Return just the project filter part
    return settings.projectFilter;
  } catch (error) {
    console.error('Error loading project filter:', error);
    return DEFAULT_FILTER_SETTINGS.projectFilter;
  }
}

/**
 * Saves status filter settings to localStorage
 * @param statusFilter The status filter settings to save
 * @returns boolean indicating success
 */
export function saveStatusFilter(statusFilter: StatusFilter): boolean {
  try {
    if (typeof window === 'undefined') return false;
    
    // Load existing settings first
    const currentSettings = loadFilterSettings();
    
    // Update status filter
    const updatedSettings: FilterSettings = {
      ...currentSettings,
      statusFilter
    };
    
    // Save updated settings
    return saveFilterSettings(updatedSettings);
  } catch (error) {
    console.error('Error saving status filter:', error);
    return false;
  }
}

/**
 * Loads status filter settings from localStorage
 * @returns The loaded status filter settings, or defaults if none exist
 */
export function loadStatusFilter(): StatusFilter {
  try {
    // Load complete settings
    const settings = loadFilterSettings();
    
    // Return just the status filter part
    return settings.statusFilter;
  } catch (error) {
    console.error('Error loading status filter:', error);
    return DEFAULT_FILTER_SETTINGS.statusFilter;
  }
}

/**
 * Saves sort settings to localStorage
 * @param sortSettings The sort settings to save
 * @returns boolean indicating success
 */
export function saveSortSettings(sortSettings: SortSettings): boolean {
  try {
    if (typeof window === 'undefined') return false;
    
    // Load existing settings first
    const currentSettings = loadFilterSettings();
    
    // Update sort settings
    const updatedSettings: FilterSettings = {
      ...currentSettings,
      sortSettings
    };
    
    // Save updated settings
    return saveFilterSettings(updatedSettings);
  } catch (error) {
    console.error('Error saving sort settings:', error);
    return false;
  }
}

/**
 * Loads sort settings from localStorage
 * @returns The loaded sort settings, or defaults if none exist
 */
export function loadSortSettings(): SortSettings {
  try {
    // Load complete settings
    const settings = loadFilterSettings();
    
    // Return just the sort settings part
    return settings.sortSettings;
  } catch (error) {
    console.error('Error loading sort settings:', error);
    return DEFAULT_FILTER_SETTINGS.sortSettings;
  }
}

/**
 * Saves UI state settings to localStorage
 * @param uiState The UI state settings to save
 * @returns boolean indicating success
 */
export function saveUIState(uiState: FilterUIState): boolean {
  try {
    if (typeof window === 'undefined') return false;
    
    // Load existing settings first
    const currentSettings = loadFilterSettings();
    
    // Update UI state
    const updatedSettings: FilterSettings = {
      ...currentSettings,
      uiState
    };
    
    // Save updated settings
    return saveFilterSettings(updatedSettings);
  } catch (error) {
    console.error('Error saving UI state:', error);
    return false;
  }
}

/**
 * Loads UI state settings from localStorage
 * @returns The loaded UI state settings, or defaults if none exist
 */
export function loadUIState(): FilterUIState {
  try {
    // Load complete settings
    const settings = loadFilterSettings();
    
    // Return just the UI state part
    return settings.uiState;
  } catch (error) {
    console.error('Error loading UI state:', error);
    return DEFAULT_FILTER_SETTINGS.uiState;
  }
}

/**
 * Clears all filter settings from localStorage
 * @returns boolean indicating success
 */
export function clearAllFilterSettings(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    
    // Clear unified settings
    localStorage.removeItem(FILTER_STORAGE_CONFIG.MAIN_KEY);
    
    // Clear legacy settings
    localStorage.removeItem(FILTER_STORAGE_CONFIG.LEGACY.PROJECT_FILTER);
    localStorage.removeItem(FILTER_STORAGE_CONFIG.LEGACY.SELECTED_PROJECTS);
    localStorage.removeItem(FILTER_STORAGE_CONFIG.LEGACY.FILTER_PREFERENCES);
    localStorage.removeItem(FILTER_STORAGE_CONFIG.LEGACY.FILTERS_EXPANDED);
    
    return true;
  } catch (error) {
    console.error('Error clearing filter settings:', error);
    return false;
  }
}

/**
 * Updates legacy storage keys for backward compatibility
 * @param settings The current settings to sync with legacy storage
 */
function updateLegacyStorage(settings: FilterSettings): void {
  try {
    if (typeof window === 'undefined') return;
    
    // Update legacy project filter
    if (settings.projectFilter.value === PROJECT_FILTERS.NONE) {
      localStorage.setItem(
        FILTER_STORAGE_CONFIG.LEGACY.PROJECT_FILTER, 
        PROJECT_FILTERS.NONE
      );
    } else {
      // For non-NONE filters, clear the explicit NONE setting
      localStorage.removeItem(FILTER_STORAGE_CONFIG.LEGACY.PROJECT_FILTER);
    }
    
    // Update legacy selected projects
    localStorage.setItem(
      FILTER_STORAGE_CONFIG.LEGACY.SELECTED_PROJECTS,
      JSON.stringify(settings.projectFilter.selectedProjects)
    );
    
    // Update legacy filters expanded state
    localStorage.setItem(
      FILTER_STORAGE_CONFIG.LEGACY.FILTERS_EXPANDED,
      String(settings.uiState.filtersExpanded)
    );
  } catch (error) {
    console.error('Error updating legacy storage:', error);
  }
}

/**
 * Loads settings from legacy storage for backward compatibility
 * @returns Settings loaded from legacy storage, or defaults if none exist
 */
function loadFromLegacyStorage(): FilterSettings {
  try {
    if (typeof window === 'undefined') return DEFAULT_FILTER_SETTINGS;
    
    // Start with default settings
    const settings: FilterSettings = { ...DEFAULT_FILTER_SETTINGS };
    
    // Load project filter (prioritize explicit NONE filter if exists)
    const savedProjectFilter = localStorage.getItem(FILTER_STORAGE_CONFIG.LEGACY.PROJECT_FILTER);
    if (savedProjectFilter === PROJECT_FILTERS.NONE) {
      settings.projectFilter.value = PROJECT_FILTERS.NONE;
      settings.projectFilter.selectedProjects = [];
    } else {
      // Try to load from selected projects
      const savedSelectedProjects = localStorage.getItem(FILTER_STORAGE_CONFIG.LEGACY.SELECTED_PROJECTS);
      if (savedSelectedProjects) {
        try {
          const parsedSelection = JSON.parse(savedSelectedProjects);
          if (Array.isArray(parsedSelection)) {
            settings.projectFilter.selectedProjects = parsedSelection;
            
            // Determine filter value based on selection
            if (parsedSelection.length === 0) {
              settings.projectFilter.value = PROJECT_FILTERS.NONE;
            } else if (parsedSelection.length === 1) {
              settings.projectFilter.value = parsedSelection[0];
            } else {
              settings.projectFilter.value = parsedSelection;
            }
          }
        } catch (e) {
          console.error('Error parsing legacy selected projects:', e);
        }
      }
    }
    
    // Load filters expanded state
    const savedFiltersExpanded = localStorage.getItem(FILTER_STORAGE_CONFIG.LEGACY.FILTERS_EXPANDED);
    if (savedFiltersExpanded !== null) {
      settings.uiState.filtersExpanded = savedFiltersExpanded === 'true';
    }
    
    return settings;
  } catch (error) {
    console.error('Error loading from legacy storage:', error);
    return DEFAULT_FILTER_SETTINGS;
  }
}