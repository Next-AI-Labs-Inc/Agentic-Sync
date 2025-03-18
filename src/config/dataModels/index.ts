/**
 * Data Models Registry
 * 
 * This file exports all available data model configurations and provides a registry
 * to access them programmatically.
 */

import { DataModelConfig } from './baseConfig';
import tasksConfig from './tasksConfig';
import knowledgeBaseConfig from './knowledgeBaseConfig';

/**
 * Registry of all available data models
 */
const dataModels: Record<string, DataModelConfig> = {
  tasks: tasksConfig,
  knowledgeBase: knowledgeBaseConfig
};

/**
 * Get a data model configuration by slug
 */
export function getDataModelBySlug(slug: string): DataModelConfig | null {
  return dataModels[slug] || null;
}

/**
 * Get a list of all available data models
 */
export function getAvailableDataModels(): { slug: string; displayName: string; description?: string }[] {
  return Object.values(dataModels).map(model => ({
    slug: model.slug,
    displayName: model.displayName,
    description: model.description
  }));
}

/**
 * Register a new data model configuration
 */
export function registerDataModel(config: DataModelConfig): void {
  if (dataModels[config.slug]) {
    console.warn(`Data model with slug "${config.slug}" already exists. Overwriting.`);
  }
  dataModels[config.slug] = config;
}

/**
 * Create a duplicate of an existing data model with a new slug and name
 */
export function duplicateDataModel(
  sourceSlug: string, 
  newSlug: string, 
  newDisplayName: string
): DataModelConfig | null {
  const sourceModel = dataModels[sourceSlug];
  if (!sourceModel) {
    console.error(`Source data model "${sourceSlug}" not found.`);
    return null;
  }

  // Create a deep copy of the source model
  const newModel: DataModelConfig = JSON.parse(JSON.stringify(sourceModel));
  
  // Update basic information
  newModel.slug = newSlug;
  newModel.displayName = newDisplayName;
  
  // Update routes
  newModel.routes.base = `/${newSlug}`;
  
  // Update API paths
  newModel.api.basePath = `/api/${newSlug}`;
  
  // Register the new model
  registerDataModel(newModel);
  
  return newModel;
}

// Export individual models
export { tasksConfig, knowledgeBaseConfig };

// Export default registry
export default dataModels;