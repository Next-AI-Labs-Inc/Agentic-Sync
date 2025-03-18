/**
 * Tests for the backend code generators
 */

import fs from 'fs';
import path from 'path';
import { generateDataModel } from '../src/config/dataModels/generators';
import tasksConfig from '../src/config/dataModels/tasksConfig';
import knowledgeBaseConfig from '../src/config/dataModels/knowledgeBaseConfig';

// Mock fs/promises module
jest.mock('fs/promises', () => ({
  mkdir: jest.fn(() => Promise.resolve()),
  writeFile: jest.fn(() => Promise.resolve())
}));

describe('Backend Code Generators', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('should generate API routes for tasks model', async () => {
    const mockFsPromises = require('fs/promises');
    const result = await generateDataModel(tasksConfig, '/tmp/test');
    
    expect(result.success).toBe(true);
    expect(result.modelPath).toBeDefined();
    expect(result.apiRoutes).toBeDefined();
    expect(result.apiRoutes?.length).toBeGreaterThan(0);
    
    // Should create directories
    expect(mockFsPromises.mkdir).toHaveBeenCalledWith(
      expect.stringContaining('models'),
      expect.anything()
    );
    expect(mockFsPromises.mkdir).toHaveBeenCalledWith(
      expect.stringContaining('api/tasks'),
      expect.anything()
    );
    
    // Should write files
    expect(mockFsPromises.writeFile).toHaveBeenCalledTimes(
      1 + // Model file
      result.apiRoutes?.length // API route files
    );
    
    // Model file should be written
    expect(mockFsPromises.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('tasks.js'),
      expect.stringContaining('TasksSchema')
    );
    
    // Main API route file should be written
    expect(mockFsPromises.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('index.js'),
      expect.stringContaining('Tasks API Routes')
    );
    
    // Item API route file should be written
    expect(mockFsPromises.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('[id].js'),
      expect.stringContaining('Tasks Item API Routes')
    );
  });
  
  test('should generate API routes for knowledge base model', async () => {
    const mockFsPromises = require('fs/promises');
    const result = await generateDataModel(knowledgeBaseConfig, '/tmp/test');
    
    expect(result.success).toBe(true);
    expect(result.modelPath).toBeDefined();
    expect(result.apiRoutes).toBeDefined();
    expect(result.apiRoutes?.length).toBeGreaterThan(0);
    
    // Should create directories
    expect(mockFsPromises.mkdir).toHaveBeenCalledWith(
      expect.stringContaining('api/kb'),
      expect.anything()
    );
    
    // Model file should be written with different schema name
    expect(mockFsPromises.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('kb.js'),
      expect.stringContaining('KnowledgeBaseSchema')
    );
    
    // Main API route file should have KB specific content
    expect(mockFsPromises.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('index.js'),
      expect.stringContaining('Knowledge Base API Routes')
    );
  });
  
  test('should handle errors during generation', async () => {
    const mockFsPromises = require('fs/promises');
    
    // Mock an error when creating directories
    mockFsPromises.mkdir.mockRejectedValueOnce(new Error('Failed to create directory'));
    
    const result = await generateDataModel(tasksConfig, '/tmp/test');
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toContain('Failed to create directory');
  });
});