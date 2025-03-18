/**
 * Configuration Context
 * 
 * Provides access to data model configurations and functions to manage them.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DataModelConfig } from '@/config/dataModels/baseConfig';
import dataModels, { 
  getDataModelBySlug, 
  getAvailableDataModels, 
  registerDataModel,
  duplicateDataModel
} from '@/config/dataModels';

// Context interface
interface ConfigContextValue {
  // Data models
  dataModels: Record<string, DataModelConfig>;
  currentModel: DataModelConfig | null;
  availableModels: { slug: string; displayName: string; description?: string }[];
  
  // Actions
  setCurrentModelBySlug: (slug: string) => void;
  updateCurrentModel: (updates: Partial<DataModelConfig>) => void;
  createModelFromTemplate: (sourceSlug: string, newSlug: string, newDisplayName: string) => DataModelConfig | null;
  saveModelConfiguration: (config: DataModelConfig) => void;
  previewModelConfiguration: (config: DataModelConfig) => void;
  
  // Preview state
  isPreviewMode: boolean;
  previewModel: DataModelConfig | null;
  exitPreview: () => void;
}

// Create the context
const ConfigContext = createContext<ConfigContextValue | undefined>(undefined);

// Storage key for persisting configurations
const CONFIG_STORAGE_KEY = 'dataModelConfigurations';

// Provider component
export function ConfigProvider({ children }: { children: ReactNode }) {
  // State to track all data models
  const [modelConfigs, setModelConfigs] = useState<Record<string, DataModelConfig>>(dataModels);
  
  // Currently selected model
  const [currentModelSlug, setCurrentModelSlug] = useState<string | null>(null);
  const [currentModel, setCurrentModel] = useState<DataModelConfig | null>(null);
  
  // Available models list
  const [availableModels, setAvailableModels] = useState(getAvailableDataModels());
  
  // Preview mode state
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewModel, setPreviewModel] = useState<DataModelConfig | null>(null);
  
  // Load saved configurations from localStorage on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedConfigs = localStorage.getItem(CONFIG_STORAGE_KEY);
        if (savedConfigs) {
          const parsedConfigs = JSON.parse(savedConfigs);
          // Merge with default configurations
          const mergedConfigs = { ...dataModels };
          
          // Apply any saved configurations, overwriting defaults
          Object.keys(parsedConfigs).forEach(slug => {
            mergedConfigs[slug] = parsedConfigs[slug];
          });
          
          setModelConfigs(mergedConfigs);
          setAvailableModels(Object.values(mergedConfigs).map(model => ({
            slug: model.slug,
            displayName: model.displayName,
            description: model.description
          })));
        }
      } catch (err) {
        console.error('Failed to load saved configurations:', err);
      }
    }
  }, []);
  
  // Set current model when currentModelSlug changes
  useEffect(() => {
    if (currentModelSlug) {
      const model = modelConfigs[currentModelSlug] || null;
      setCurrentModel(model);
    } else {
      setCurrentModel(null);
    }
  }, [currentModelSlug, modelConfigs]);
  
  // Set the current model by slug
  const setCurrentModelBySlug = (slug: string) => {
    // Exit preview mode when switching models
    if (isPreviewMode) {
      setIsPreviewMode(false);
      setPreviewModel(null);
    }
    setCurrentModelSlug(slug);
  };
  
  // Update the current model with partial updates
  const updateCurrentModel = (updates: Partial<DataModelConfig>) => {
    if (!currentModel || !currentModelSlug) return;
    
    // Create updated model
    const updatedModel = {
      ...currentModel,
      ...updates,
      // Handle nested updates for specific properties
      model: {
        ...currentModel.model,
        ...(updates.model || {})
      },
      ui: {
        ...currentModel.ui,
        ...(updates.ui || {})
      },
      routes: {
        ...currentModel.routes,
        ...(updates.routes || {})
      },
      api: {
        ...currentModel.api,
        ...(updates.api || {})
      },
      statuses: currentModel.statuses ? {
        ...currentModel.statuses,
        ...(updates.statuses || {})
      } : updates.statuses,
      dataSource: {
        ...currentModel.dataSource,
        ...(updates.dataSource || {})
      }
    };
    
    // Update model in state
    setModelConfigs(prevConfigs => ({
      ...prevConfigs,
      [currentModelSlug]: updatedModel
    }));
    
    // Also update current model for immediate UI updates
    setCurrentModel(updatedModel);
    
    // Save to localStorage
    saveConfigurationsToStorage({
      ...modelConfigs,
      [currentModelSlug]: updatedModel
    });
  };
  
  // Create a new model from an existing template
  const createModelFromTemplate = (
    sourceSlug: string, 
    newSlug: string, 
    newDisplayName: string
  ): DataModelConfig | null => {
    // Validate inputs
    if (!sourceSlug || !newSlug || !newDisplayName) {
      console.error('Invalid parameters for creating model');
      return null;
    }
    
    // Check if new slug already exists
    if (modelConfigs[newSlug]) {
      console.error(`Model with slug "${newSlug}" already exists`);
      return null;
    }
    
    // Get source model
    const sourceModel = modelConfigs[sourceSlug];
    if (!sourceModel) {
      console.error(`Source model "${sourceSlug}" not found`);
      return null;
    }
    
    // Create deep copy of source model
    const newModel: DataModelConfig = JSON.parse(JSON.stringify(sourceModel));
    
    // Update basic information
    newModel.slug = newSlug;
    newModel.displayName = newDisplayName;
    newModel.description = `${newDisplayName} (created from ${sourceModel.displayName})`;
    
    // Update routes
    newModel.routes.base = `/${newSlug}`;
    
    // Update API paths
    newModel.api.basePath = `/api/${newSlug}`;
    
    // Update data source if needed
    if (newModel.dataSource.connectionString) {
      newModel.dataSource.connectionString = newModel.dataSource.connectionString.replace(
        new RegExp(sourceSlug, 'g'), 
        newSlug
      );
    }
    
    // Add to model configurations
    const updatedConfigs = {
      ...modelConfigs,
      [newSlug]: newModel
    };
    
    // Update state
    setModelConfigs(updatedConfigs);
    setAvailableModels(Object.values(updatedConfigs).map(model => ({
      slug: model.slug,
      displayName: model.displayName,
      description: model.description
    })));
    
    // Save to localStorage
    saveConfigurationsToStorage(updatedConfigs);
    
    // Set as current model
    setCurrentModelSlug(newSlug);
    
    return newModel;
  };
  
  // Save model configuration
  const saveModelConfiguration = (config: DataModelConfig) => {
    if (!config.slug) {
      console.error('Cannot save configuration without a slug');
      return;
    }
    
    // Update model configs
    const updatedConfigs = {
      ...modelConfigs,
      [config.slug]: config
    };
    
    // Update state
    setModelConfigs(updatedConfigs);
    setAvailableModels(Object.values(updatedConfigs).map(model => ({
      slug: model.slug,
      displayName: model.displayName,
      description: model.description
    })));
    
    // If this is the current model, update current model state
    if (currentModelSlug === config.slug) {
      setCurrentModel(config);
    }
    
    // Save to localStorage
    saveConfigurationsToStorage(updatedConfigs);
    
    // Exit preview mode if active
    if (isPreviewMode) {
      setIsPreviewMode(false);
      setPreviewModel(null);
    }
  };
  
  // Preview a model configuration without saving
  const previewModelConfiguration = (config: DataModelConfig) => {
    setPreviewModel(config);
    setIsPreviewMode(true);
  };
  
  // Exit preview mode
  const exitPreview = () => {
    setIsPreviewMode(false);
    setPreviewModel(null);
  };
  
  // Helper function to save configurations to localStorage
  const saveConfigurationsToStorage = (configs: Record<string, DataModelConfig>) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(configs));
      } catch (err) {
        console.error('Failed to save configurations to localStorage:', err);
      }
    }
  };
  
  // Context value
  const value: ConfigContextValue = {
    dataModels: modelConfigs,
    currentModel,
    availableModels,
    setCurrentModelBySlug,
    updateCurrentModel,
    createModelFromTemplate,
    saveModelConfiguration,
    previewModelConfiguration,
    isPreviewMode,
    previewModel,
    exitPreview
  };
  
  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

// Hook to use the config context
export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}

export default ConfigContext;