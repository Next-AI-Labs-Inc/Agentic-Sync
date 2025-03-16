import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Initiative } from '@/types';
import * as taskApiService from '@/services/taskApiService';
import axios from 'axios';

// Define new types for sorting and filtering
export type InitiativeSortOption = 'updated' | 'created' | 'priority' | 'status';
export type SortDirection = 'asc' | 'desc';
export type InitiativeFilterStatus = 'all' | 'not-started' | 'planning' | 'in-progress' | 'completed' | 'on-hold';

interface InitiativeContextValue {
  initiatives: Initiative[];
  filteredInitiatives: Initiative[];
  loading: boolean;
  error: string | null;
  refreshInitiatives: () => Promise<void>;
  createInitiative: (initiative: Partial<Initiative>) => Promise<void>;
  updateInitiative: (id: number, data: Partial<Initiative>) => Promise<void>;
  deleteInitiative: (id: number) => Promise<void>;
  
  // Sorting and filtering
  sortBy: InitiativeSortOption;
  sortDirection: SortDirection;
  statusFilter: InitiativeFilterStatus;
  setSortBy: (option: InitiativeSortOption) => void;
  setSortDirection: (direction: SortDirection) => void;
  setStatusFilter: (status: InitiativeFilterStatus) => void;
}

const InitiativeContext = createContext<InitiativeContextValue | undefined>(undefined);

// Preferences storage key
const FILTER_STORAGE_KEY = 'initiativeFilterPreferences';

// Function to deduplicate initiatives
const deduplicateInitiatives = (initiatives: Initiative[]): Initiative[] => {
  // Map to store unique initiatives by ID
  const uniqueInitiativesById = new Map<number, Initiative>();
  
  // First pass - collect most recent version of each initiative
  initiatives.forEach(initiative => {
    if (!uniqueInitiativesById.has(initiative.id) || 
        new Date(initiative.updatedAt) > new Date(uniqueInitiativesById.get(initiative.id)!.updatedAt)) {
      uniqueInitiativesById.set(initiative.id, initiative);
    }
  });
  
  return Array.from(uniqueInitiativesById.values());
};

export function InitiativeProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Local initiative cache for optimistic updates
  const [localInitiativeCache, setLocalInitiativeCache] = useState<Map<number, Initiative>>(new Map());
  
  // Sorting and filtering state
  const [sortBy, setSortBy] = useState<InitiativeSortOption>('updated');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [statusFilter, setStatusFilter] = useState<InitiativeFilterStatus>('all');

  // Update local cache when initiatives change
  useEffect(() => {
    const newCache = new Map<number, Initiative>();
    initiatives.forEach(initiative => newCache.set(initiative.id, initiative));
    setLocalInitiativeCache(newCache);
  }, [initiatives]);

  // Load filter preferences from localStorage on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedPreferences = localStorage.getItem(FILTER_STORAGE_KEY);
        if (savedPreferences) {
          const preferences = JSON.parse(savedPreferences);
          
          // Don't apply saved filters if there are URL params
          const hasUrlParams = Object.keys(router.query).some(param => 
            ['filter', 'sort', 'direction'].includes(param)
          );
          
          if (!hasUrlParams) {
            preferences.statusFilter && setStatusFilter(preferences.statusFilter);
            preferences.sortBy && setSortBy(preferences.sortBy);
            preferences.sortDirection && setSortDirection(preferences.sortDirection);
          }
        }
      } catch (err) {
        console.error('Failed to load filter preferences:', err);
      }
    }
  }, []);
  
  // Save filter preferences to localStorage
  const saveFilterPreferences = useCallback(() => {
    const preferences = {
      statusFilter,
      sortBy,
      sortDirection
    };
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(preferences));
    
    // Store filter preferences in localStorage only, don't update URL to avoid navigation issues
    // This removes the URL-based approach that was causing sluggish navigation
  }, [statusFilter, sortBy, sortDirection, router]);
  
  // Save filter preferences when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      saveFilterPreferences();
    }
  }, [statusFilter, sortBy, sortDirection, saveFilterPreferences]);

  const refreshInitiatives = async () => {
    // Set loading without clearing existing initiatives to avoid flashing
    setLoading(true);
    setError(null);
    
    try {
      // Try using direct axios call as a fallback since the real API server may not be running
      console.log("Fetching initiatives directly via axios");
      try {
        const response = await axios.get('/api/initiatives', {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 5000
        });
        
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          console.log(`Successfully retrieved ${response.data.length} initiatives directly`);
          setInitiatives(deduplicateInitiatives(response.data));
          setError(null);
          setLoading(false);
          return;
        }
      } catch (axiosError) {
        console.log("Direct axios attempt failed:", axiosError?.message);
      }
      
      // Fall back to taskApiService
      console.log("Falling back to taskApiService.getInitiatives()");
      const data = await taskApiService.getInitiatives();
      
      if (data && Array.isArray(data) && data.length > 0) {
        // We got valid data from the API
        setInitiatives(deduplicateInitiatives(data));
        setError(null);
      } else {
        // Empty array or invalid data
        console.warn('API returned empty or invalid initiative data');
        
        // If we don't have any initiatives yet, use sample data
        if (initiatives.length === 0) {
          // Sample fallback initiatives
          const sampleInitiatives = [
            {
              id: 1,
              name: "User Impact UI Enhancement",
              description: "Improve UI to highlight user impact in task cards",
              status: "in-progress",
              priority: "high",
              startDate: "2025-03-14",
              targetDate: "2025-03-21",
              createdAt: "2025-03-14T09:00:00Z",
              updatedAt: "2025-03-14T14:30:00Z"
            },
            {
              id: 2,
              name: "Task Inline Editing System",
              description: "Implement inline editing for all task fields",
              status: "in-progress",
              priority: "high",
              startDate: "2025-03-13",
              targetDate: "2025-03-25",
              createdAt: "2025-03-13T09:00:00Z",
              updatedAt: "2025-03-13T14:30:00Z"
            }
          ];
          
          // Try to create these sample initiatives via the API
          try {
            console.log('No initiatives found - creating sample initiatives');
            
            // Create each sample initiative
            for (const initiative of sampleInitiatives) {
              await taskApiService.createInitiative(initiative);
            }
            
            // Fetch the newly created initiatives
            const freshData = await taskApiService.getInitiatives();
            if (freshData && Array.isArray(freshData) && freshData.length > 0) {
              setInitiatives(deduplicateInitiatives(freshData));
            } else {
              // If API still fails, use the samples directly
              setInitiatives(sampleInitiatives);
              setError('Created sample initiatives but could not fetch them.');
            }
          } catch (createError) {
            console.error('Error creating sample initiatives:', createError);
            // Use sample data directly
            setInitiatives(sampleInitiatives);
            setError('Using sample initiatives - could not connect to API.');
          }
        } else {
          // Keep existing initiatives if we have them
          setError('Could not refresh initiatives from API. Using cached data.');
        }
      }
    } catch (err) {
      console.error('Error fetching initiatives:', err);
      setError('Failed to fetch initiatives. Using cached data.');
      
      // Use fallback data if we don't have any initiatives yet
      if (initiatives.length === 0) {
        // Sample fallback initiatives
        setInitiatives([
          {
            id: 1,
            name: "User Impact UI Enhancement",
            description: "Improve UI to highlight user impact in task cards",
            status: "in-progress",
            priority: "high",
            startDate: "2025-03-14",
            targetDate: "2025-03-21",
            createdAt: "2025-03-14T09:00:00Z",
            updatedAt: "2025-03-14T14:30:00Z"
          },
          {
            id: 2,
            name: "Task Inline Editing System",
            description: "Implement inline editing for all task fields",
            status: "in-progress",
            priority: "high",
            startDate: "2025-03-13",
            targetDate: "2025-03-25",
            createdAt: "2025-03-13T09:00:00Z",
            updatedAt: "2025-03-13T14:30:00Z"
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshInitiatives();
    
    // Don't set up polling to avoid performance issues
  }, []);

  const createInitiative = async (initiativeData: Partial<Initiative>) => {
    // Create a temporary ID for optimistic updates
    const tempId = Date.now();
    const now = new Date().toISOString();
    
    // Create a temporary initiative for optimistic add
    const tempInitiative: Initiative = {
      id: tempId,
      name: initiativeData.name || 'New Initiative',
      description: initiativeData.description || '',
      status: initiativeData.status || 'not-started',
      priority: initiativeData.priority || 'medium',
      startDate: initiativeData.startDate,
      targetDate: initiativeData.targetDate,
      createdAt: now,
      updatedAt: now,
      completedAt: null,
      // Add any other initiative properties with fallbacks
      tags: initiativeData.tags || [],
      keyRisks: initiativeData.keyRisks || [],
      linkedProjects: initiativeData.linkedProjects || []
    };
    
    // Add to the local cache immediately
    const newCache = new Map(localInitiativeCache);
    newCache.set(tempId, tempInitiative);
    setLocalInitiativeCache(newCache);
    
    // Update initiatives array optimistically
    const optimisticInitiatives = [tempInitiative, ...initiatives];
    setInitiatives(optimisticInitiatives);
    
    try {
      await taskApiService.createInitiative(initiativeData);
      // Refresh to get the real data from server
      refreshInitiatives();
    } catch (error) {
      console.error('Error creating initiative:', error);
      setError('Failed to create initiative');
      
      // Revert optimistic update
      setInitiatives(initiatives.filter(i => i.id !== tempId));
    }
  };

  const updateInitiative = async (id: number, updateData: Partial<Initiative>) => {
    // Get the current initiative
    const initiativeToUpdate = localInitiativeCache.get(id);
    if (!initiativeToUpdate) {
      console.error(`Initiative with ID ${id} not found in cache`);
      return;
    }
    
    // Create updated initiative for optimistic update
    const updatedInitiative = { 
      ...initiativeToUpdate, 
      ...updateData, 
      updatedAt: new Date().toISOString() 
    };
    
    // Update local cache optimistically
    const newCache = new Map(localInitiativeCache);
    newCache.set(id, updatedInitiative);
    
    // Update initiatives array optimistically
    const optimisticInitiatives = initiatives.map(initiative => 
      initiative.id === id ? updatedInitiative : initiative
    );
    
    // Update state immediately for responsive UI
    setInitiatives(optimisticInitiatives);
    
    try {
      // Make the API call to update the initiative
      await taskApiService.updateInitiative(id, updateData);
    } catch (error) {
      console.error('Error updating initiative:', error);
      setError('Failed to update initiative');
      
      // Revert to previous state on error
      setInitiatives(initiatives);
      
      // Refresh data from server to ensure consistency
      refreshInitiatives();
    }
  };

  const deleteInitiative = async (id: number) => {
    // Remove from initiatives array optimistically
    const optimisticInitiatives = initiatives.filter(initiative => initiative.id !== id);
    
    // Update state immediately
    setInitiatives(optimisticInitiatives);
    
    try {
      // Make the API call to delete the initiative
      await taskApiService.deleteInitiative(id);
    } catch (error) {
      console.error('Error deleting initiative:', error);
      setError('Failed to delete initiative');
      
      // Revert and refresh on error
      refreshInitiatives();
    }
  };

  // Filter and sort initiatives
  const filteredInitiatives = React.useMemo(() => {
    let filtered = [...initiatives];
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(initiative => initiative.status === statusFilter);
    }
    
    // Sort initiatives
    filtered.sort((a, b) => {
      const sortMultiplier = sortDirection === 'desc' ? -1 : 1;
      
      if (sortBy === 'updated') {
        return (new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()) * sortMultiplier;
      } else if (sortBy === 'created') {
        return (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) * sortMultiplier;
      } else if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority] - priorityOrder[a.priority]) * sortMultiplier;
      } else if (sortBy === 'status') {
        const statusOrder = { 
          'not-started': 5,
          'planning': 4, 
          'in-progress': 3, 
          'completed': 2, 
          'on-hold': 1 
        };
        const aOrder = statusOrder[a.status] || 0;
        const bOrder = statusOrder[b.status] || 0;
        return (bOrder - aOrder) * sortMultiplier;
      }
      return 0;
    });
    
    return filtered;
  }, [initiatives, statusFilter, sortBy, sortDirection]);

  return (
    <InitiativeContext.Provider value={{ 
      initiatives, 
      filteredInitiatives,
      loading, 
      error, 
      refreshInitiatives,
      createInitiative,
      updateInitiative,
      deleteInitiative,
      
      // Sorting and filtering
      sortBy,
      sortDirection,
      statusFilter,
      setSortBy,
      setSortDirection,
      setStatusFilter
    }}>
      {children}
    </InitiativeContext.Provider>
  );
}

export function useInitiatives() {
  const context = useContext(InitiativeContext);
  if (context === undefined) {
    throw new Error('useInitiatives must be used within an InitiativeProvider');
  }
  return context;
}