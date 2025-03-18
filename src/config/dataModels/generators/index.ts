/**
 * Data Model Generator Service
 * 
 * Coordinates the generation of all aspects of a data model:
 * - MongoDB schemas
 * - API routes
 * - Client hooks
 */

import path from 'path';
import { DataModelConfig } from '../baseConfig';
import routeGenerator from './routeGenerator';
import modelGenerator from './modelGenerator';

/**
 * Generator result interface
 */
export interface GenerationResult {
  success: boolean;
  modelPath?: string;
  apiRoutes?: string[];
  error?: string;
}

/**
 * Generate all files for a data model
 */
export async function generateDataModel(
  config: DataModelConfig, 
  basePath: string
): Promise<GenerationResult> {
  try {
    // Use absolute path
    const absolutePath = path.resolve(basePath);
    
    // Generate MongoDB model
    const modelPath = await modelGenerator.generateModel(config, absolutePath);
    
    // Generate API routes
    const apiRoutes = await routeGenerator.generateApiRoutes(config, absolutePath);
    
    return {
      success: true,
      modelPath,
      apiRoutes
    };
  } catch (error) {
    console.error('Error generating data model:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Export all generators
export { default as routeGenerator } from './routeGenerator';
export { default as modelGenerator } from './modelGenerator';

// Default export
export default {
  generateDataModel,
  routeGenerator,
  modelGenerator
};