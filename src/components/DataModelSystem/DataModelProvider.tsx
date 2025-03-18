/**
 * Data Model Provider
 * 
 * A provider component that supplies context for data model UI components.
 * It handles data fetching, state management, and operations for any data model.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/router';
import { DataModelConfig } from '@/config/dataModels/baseConfig';

// Generic type for data models
interface DataItem {
  id: string;
  [key: string]: any;
}

// Context interface
interface DataModelContextValue<T extends DataItem = DataItem> {
  // Data
  items: T[];
  loading: boolean;
  error: string | null;
  
  // Filtering and sorting
  filters: Record<string, any>;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  searchTerm: string;
  
  // Actions
  setSearchTerm: (term: string) => void;
  setFilter: (field: string, value: any) => void;
  clearFilter: (field: string) => void;
  clearAllFilters: () => void;
  setSortBy: (field: string) => void;
  setSortDirection: (direction: 'asc' | 'desc') => void;
  refreshItems: () => Promise<T[]>;
  
  // CRUD operations
  getItem: (id: string) => Promise<T | null>;
  createItem: (data: Partial<T>) => Promise<T>;
  updateItem: (id: string, data: Partial<T>) => Promise<T>;
  deleteItem: (id: string) => Promise<void>;
  
  // Status operations (if applicable)
  updateItemStatus?: (id: string, status: string) => Promise<T>;
  
  // Configuration
  config: DataModelConfig;
  
  // Computed values
  filteredItems: T[];
  itemCounts: Record<string, number>;
}

// Create the context
const DataModelContext = createContext<DataModelContextValue | undefined>(undefined);

// Storage key for filter preferences
const getFilterStorageKey = (slug: string) => `${slug}_filterPreferences`;

// Provider props
interface DataModelProviderProps {
  config: DataModelConfig;
  children: ReactNode;
  apiClient?: any; // Optional custom API client
}

// Provider component
export function DataModelProvider<T extends DataItem>({ 
  config, 
  children,
  apiClient
}: DataModelProviderProps) {
  const router = useRouter();
  
  // State
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sortBy, setSortBy] = useState<string>(config.ui.listView.orderBy || 'createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(
    config.ui.listView.orderDirection || 'desc'
  );
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [itemCounts, setItemCounts] = useState<Record<string, number>>({});
  
  // Load filter preferences from localStorage on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedPreferences = localStorage.getItem(getFilterStorageKey(config.slug));
        if (savedPreferences) {
          const preferences = JSON.parse(savedPreferences);
          
          // Don't apply saved filters if there are URL params
          const hasUrlParams = Object.keys(router.query).some((param) =>
            ['filter', 'sort', 'direction'].includes(param)
          );
          
          if (!hasUrlParams) {
            preferences.filters && setFilters(preferences.filters);
            preferences.sortBy && setSortBy(preferences.sortBy);
            preferences.sortDirection && setSortDirection(preferences.sortDirection);
          }
        }
      } catch (err) {
        console.error(`Failed to load filter preferences for ${config.slug}:`, err);
      }
    }
  }, [config.slug]);
  
  // Save filter preferences to localStorage
  const saveFilterPreferences = useCallback(() => {
    const preferences = {
      filters,
      sortBy,
      sortDirection
    };
    localStorage.setItem(getFilterStorageKey(config.slug), JSON.stringify(preferences));
    
    // Update URL with filter params
    const query: Record<string, string | string[]> = {};
    
    // Add filters to query
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query[`filter_${key}`] = Array.isArray(value) ? value : String(value);
      }
    });
    
    // Add sort params
    if (sortBy !== (config.ui.listView.orderBy || 'createdAt')) {
      query.sort = sortBy;
    }
    
    if (sortDirection !== (config.ui.listView.orderDirection || 'desc')) {
      query.direction = sortDirection;
    }
    
    // Add search term
    if (searchTerm) {
      query.search = searchTerm;
    }
    
    router.replace(
      {
        pathname: router.pathname,
        query
      },
      undefined,
      { shallow: true }
    );
  }, [filters, sortBy, sortDirection, searchTerm, config.slug, config.ui.listView, router]);
  
  // Save filter preferences when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      saveFilterPreferences();
    }
  }, [filters, sortBy, sortDirection, saveFilterPreferences]);
  
  // Set a filter value
  const setFilter = (field: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Clear a filter
  const clearFilter = (field: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[field];
      return newFilters;
    });
  };
  
  // Clear all filters
  const clearAllFilters = () => {
    setFilters({});
  };
  
  // Generic method to fetch data from the API
  const fetchData = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
    try {
      // If a custom API client was provided, use it
      if (apiClient && typeof apiClient[endpoint] === 'function') {
        return await apiClient[endpoint](options);
      }
      
      // Otherwise use fetch API
      const url = `${config.api.basePath}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json'
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching from ${endpoint}:`, error);
      throw error;
    }
  };
  
  // Refresh data from the API
  const refreshItems = useCallback(async (): Promise<T[]> => {
    setLoading(true);
    try {
      // Build query params
      const queryParams = new URLSearchParams();
      
      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v));
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
      
      // Add sort params
      if (sortBy) {
        queryParams.append('sort', sortBy);
        queryParams.append('direction', sortDirection);
      }
      
      // Add search term
      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }
      
      // Add timestamp to prevent caching
      queryParams.append('_t', Date.now().toString());
      
      // Fetch data
      const fetchedItems = await fetchData(`/?${queryParams.toString()}`);
      
      if (Array.isArray(fetchedItems)) {
        console.log(`Loaded ${fetchedItems.length} ${config.displayName} items from API`);
        
        // Process items to ensure they have an id property
        const processedItems = fetchedItems.map((item: any) => ({
          ...item,
          id: item.id || item._id // Use id or MongoDB _id
        }));
        
        // Sort items based on current sort settings
        const sortedItems = sortItems(processedItems, sortBy, sortDirection);
        
        // Calculate counts for statuses if applicable
        if (config.statuses) {
          const counts = calculateStatusCounts(processedItems);
          setItemCounts(counts);
        }
        
        // Update state
        setItems(sortedItems);
        setError(null);
        
        return sortedItems;
      } else {
        console.error('API did not return an array of items');
        setItems([]);
        setItemCounts({});
        setError('Failed to load data: Invalid response format');
        return [];
      }
    } catch (error) {
      console.error('Error refreshing items:', error);
      setError('Failed to load data from the server');
      return [];
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, sortDirection, searchTerm, config.displayName, config.statuses]);
  
  // Load initial data
  useEffect(() => {
    refreshItems();
  }, [refreshItems]);
  
  // Get a single item by ID
  const getItem = async (id: string): Promise<T | null> => {
    try {
      return await fetchData(`/${id}`);
    } catch (error) {
      console.error(`Error getting item ${id}:`, error);
      return null;
    }
  };
  
  // Create a new item
  const createItem = async (data: Partial<T>): Promise<T> => {
    try {
      const newItem = await fetchData('/', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      // Update local state optimistically
      setItems(prev => {
        const updatedItems = [...prev, newItem as T];
        return sortItems(updatedItems, sortBy, sortDirection);
      });
      
      // Refresh to ensure consistency
      refreshItems();
      
      return newItem;
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  };
  
  // Update an existing item
  const updateItem = async (id: string, data: Partial<T>): Promise<T> => {
    try {
      const updatedItem = await fetchData(`/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      
      // Update local state optimistically
      setItems(prev => {
        const updatedItems = prev.map(item => 
          item.id === id ? { ...item, ...updatedItem } : item
        );
        return sortItems(updatedItems, sortBy, sortDirection);
      });
      
      return updatedItem;
    } catch (error) {
      console.error(`Error updating item ${id}:`, error);
      throw error;
    }
  };
  
  // Delete an item
  const deleteItem = async (id: string): Promise<void> => {
    try {
      await fetchData(`/${id}`, {
        method: 'DELETE'
      });
      
      // Update local state optimistically
      setItems(prev => prev.filter(item => item.id !== id));
      
      // Update counts
      if (config.statuses) {
        setItemCounts(prev => {
          const deletedItem = items.find(item => item.id === id);
          if (deletedItem && deletedItem.status) {
            return {
              ...prev,
              [deletedItem.status]: Math.max(0, (prev[deletedItem.status] || 0) - 1)
            };
          }
          return prev;
        });
      }
    } catch (error) {
      console.error(`Error deleting item ${id}:`, error);
      throw error;
    }
  };
  
  // Update item status (if applicable)
  const updateItemStatus = config.statuses 
    ? async (id: string, status: string): Promise<T> => {
        try {
          const updatedItem = await fetchData(`/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
          });
          
          // Update local state optimistically
          setItems(prev => {
            const itemToUpdate = prev.find(item => item.id === id);
            const oldStatus = itemToUpdate?.status;
            
            const updatedItems = prev.map(item => 
              item.id === id ? { ...item, status, ...updatedItem } : item
            );
            
            // Update counts
            if (oldStatus) {
              setItemCounts(prevCounts => ({
                ...prevCounts,
                [oldStatus]: Math.max(0, (prevCounts[oldStatus] || 0) - 1),
                [status]: (prevCounts[status] || 0) + 1
              }));
            }
            
            return sortItems(updatedItems, sortBy, sortDirection);
          });
          
          return updatedItem;
        } catch (error) {
          console.error(`Error updating status for item ${id}:`, error);
          throw error;
        }
      }
    : undefined;
  
  // Sort items helper
  const sortItems = (itemsToSort: T[], field: string, direction: 'asc' | 'desc'): T[] => {
    return [...itemsToSort].sort((a, b) => {
      // Handle special cases like dates
      if (field === 'createdAt' || field === 'updatedAt' || field === 'completedAt' || field === 'publishedAt') {
        const aTime = new Date(a[field] || 0).getTime();
        const bTime = new Date(b[field] || 0).getTime();
        return direction === 'asc' ? aTime - bTime : bTime - aTime;
      }
      
      // Handle string fields
      if (typeof a[field] === 'string' && typeof b[field] === 'string') {
        return direction === 'asc' 
          ? a[field].localeCompare(b[field])
          : b[field].localeCompare(a[field]);
      }
      
      // Handle number fields
      if (typeof a[field] === 'number' && typeof b[field] === 'number') {
        return direction === 'asc' ? a[field] - b[field] : b[field] - a[field];
      }
      
      // Default sort by id or createdAt if field not found
      if (a.createdAt && b.createdAt) {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        return direction === 'asc' ? aTime - bTime : bTime - aTime;
      }
      
      return 0;
    });
  };
  
  // Calculate status counts if statuses are defined
  const calculateStatusCounts = (itemsToCount: T[]): Record<string, number> => {
    if (!config.statuses) return {};
    
    // Initialize counts with all valid statuses
    const counts: Record<string, number> = {};
    
    // Get all real statuses (excluding filter-only statuses)
    Object.values(config.statuses.values)
      .filter(status => typeof status === 'string')
      .forEach(status => {
        counts[status] = 0;
      });
    
    // Count items for each status
    itemsToCount.forEach(item => {
      if (item.status && counts[item.status] !== undefined) {
        counts[item.status]++;
      }
    });
    
    return counts;
  };
  
  // Apply filters and search to items
  const filteredItems = React.useMemo(() => {
    return items.filter(item => {
      // Apply status filter if present
      if (filters.status && item.status !== filters.status) {
        return false;
      }
      
      // Apply other filters
      for (const [field, value] of Object.entries(filters)) {
        if (field === 'status') continue; // Already handled
        
        if (value !== undefined && value !== null && value !== '') {
          // Handle array filters (e.g., tags)
          if (Array.isArray(value)) {
            if (!Array.isArray(item[field]) || !value.some(v => item[field].includes(v))) {
              return false;
            }
          } 
          // Handle simple equality
          else if (item[field] !== value) {
            return false;
          }
        }
      }
      
      // Apply search term if present
      if (searchTerm && searchTerm.trim() !== '') {
        const normalizedSearchTerm = searchTerm.trim().toLowerCase();
        const searchFields = config.ui.searchFields || ['title', 'description', 'id'];
        
        // Check if item matches search term in any search field
        return searchFields.some(field => {
          if (!item[field]) return false;
          
          // Handle array fields (e.g., tags)
          if (Array.isArray(item[field])) {
            return item[field].some((value: any) => 
              String(value).toLowerCase().includes(normalizedSearchTerm)
            );
          }
          
          // Handle string and other fields
          return String(item[field]).toLowerCase().includes(normalizedSearchTerm);
        });
      }
      
      return true;
    });
  }, [items, filters, searchTerm, config.ui.searchFields]);
  
  // Context value
  const value: DataModelContextValue<T> = {
    // Data
    items,
    loading,
    error,
    
    // Filtering and sorting
    filters,
    sortBy,
    sortDirection,
    searchTerm,
    
    // Actions
    setSearchTerm,
    setFilter,
    clearFilter,
    clearAllFilters,
    setSortBy,
    setSortDirection,
    refreshItems,
    
    // CRUD operations
    getItem,
    createItem,
    updateItem,
    deleteItem,
    
    // Status operations
    updateItemStatus,
    
    // Configuration
    config,
    
    // Computed values
    filteredItems,
    itemCounts
  };
  
  return <DataModelContext.Provider value={value}>{children}</DataModelContext.Provider>;
}

// Hook to use the data model context
export function useDataModel<T extends DataItem>() {
  const context = useContext(DataModelContext) as DataModelContextValue<T>;
  if (context === undefined) {
    throw new Error('useDataModel must be used within a DataModelProvider');
  }
  return context;
}

export type { DataItem, DataModelContextValue };
export default DataModelContext;