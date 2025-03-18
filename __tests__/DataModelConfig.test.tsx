/**
 * Tests for the data model configuration system
 */

import { createDataModelConfig, DataModelConfig } from '../src/config/dataModels/baseConfig';
import tasksConfig from '../src/config/dataModels/tasksConfig';
import knowledgeBaseConfig from '../src/config/dataModels/knowledgeBaseConfig';
import { getDataModelBySlug, duplicateDataModel } from '../src/config/dataModels';

describe('Data Model Configuration System', () => {
  describe('Base Configuration', () => {
    test('should create a valid data model config with minimal options', () => {
      const minimalConfig = createDataModelConfig({
        dataType: 'test',
        slug: 'test',
        displayName: 'Test Model'
      });
      
      expect(minimalConfig).toBeDefined();
      expect(minimalConfig.slug).toBe('test');
      expect(minimalConfig.displayName).toBe('Test Model');
      expect(minimalConfig.model).toBeDefined();
      expect(minimalConfig.ui).toBeDefined();
      expect(minimalConfig.routes).toBeDefined();
      expect(minimalConfig.api).toBeDefined();
      expect(minimalConfig.dataSource).toBeDefined();
    });
    
    test('should override default values with provided options', () => {
      const customConfig = createDataModelConfig({
        dataType: 'custom',
        slug: 'custom',
        displayName: 'Custom Model',
        model: {
          fields: {
            name: { type: 'String', required: true }
          },
          timestamps: false
        },
        ui: {
          color: 'purple',
          icon: 'FaStar'
        }
      });
      
      expect(customConfig.slug).toBe('custom');
      expect(customConfig.ui.color).toBe('purple');
      expect(customConfig.ui.icon).toBe('FaStar');
      expect(customConfig.model.timestamps).toBe(false);
      expect(customConfig.model.fields.name).toBeDefined();
      expect(customConfig.model.fields.name.type).toBe('String');
      expect(customConfig.model.fields.name.required).toBe(true);
    });
  });
  
  describe('Task Configuration', () => {
    test('should have the correct slug and display name', () => {
      expect(tasksConfig.slug).toBe('tasks');
      expect(tasksConfig.displayName).toBe('Tasks');
    });
    
    test('should have appropriate task-specific fields', () => {
      const fields = tasksConfig.model.fields;
      
      expect(fields.title).toBeDefined();
      expect(fields.description).toBeDefined();
      expect(fields.status).toBeDefined();
      expect(fields.priority).toBeDefined();
      expect(fields.project).toBeDefined();
    });
    
    test('should have status configurations', () => {
      expect(tasksConfig.statuses).toBeDefined();
      expect(tasksConfig.statuses?.values).toBeDefined();
      expect(tasksConfig.statuses?.displayNames).toBeDefined();
      expect(tasksConfig.statuses?.colors).toBeDefined();
      expect(tasksConfig.statuses?.transitions).toBeDefined();
    });
    
    test('should have appropriate API endpoints', () => {
      expect(tasksConfig.api.endpoints).toBeDefined();
      expect(tasksConfig.api.endpoints.length).toBeGreaterThan(0);
      
      // Check for essential endpoints
      const hasList = tasksConfig.api.endpoints.some(e => 
        e.method === 'GET' && e.path === '/' && e.handler === 'list'
      );
      const hasGet = tasksConfig.api.endpoints.some(e => 
        e.method === 'GET' && e.path === '/:id' && e.handler === 'getById'
      );
      const hasCreate = tasksConfig.api.endpoints.some(e => 
        e.method === 'POST' && e.path === '/' && e.handler === 'create'
      );
      
      expect(hasList).toBe(true);
      expect(hasGet).toBe(true);
      expect(hasCreate).toBe(true);
    });
  });
  
  describe('Knowledge Base Configuration', () => {
    test('should have the correct slug and display name', () => {
      expect(knowledgeBaseConfig.slug).toBe('kb');
      expect(knowledgeBaseConfig.displayName).toBe('Knowledge Base');
    });
    
    test('should have appropriate knowledge base fields', () => {
      const fields = knowledgeBaseConfig.model.fields;
      
      expect(fields.title).toBeDefined();
      expect(fields.content).toBeDefined();
      expect(fields.status).toBeDefined();
      expect(fields.category).toBeDefined();
      expect(fields.tags).toBeDefined();
      expect(fields.author).toBeDefined();
    });
    
    test('should have different status values than tasks', () => {
      expect(knowledgeBaseConfig.statuses).toBeDefined();
      expect(knowledgeBaseConfig.statuses?.values).toBeDefined();
      
      // KB should have different statuses than tasks
      const kbStatusValues = Object.values(knowledgeBaseConfig.statuses?.values || {});
      expect(kbStatusValues).toContain('draft');
      expect(kbStatusValues).toContain('published');
      
      // Should not contain task-specific statuses
      expect(kbStatusValues).not.toContain('todo');
      expect(kbStatusValues).not.toContain('in-progress');
    });
  });
  
  describe('Data Model Registry', () => {
    test('should retrieve a model by slug', () => {
      const tasksModel = getDataModelBySlug('tasks');
      const kbModel = getDataModelBySlug('kb');
      const nonExistentModel = getDataModelBySlug('non-existent');
      
      expect(tasksModel).toBeDefined();
      expect(tasksModel?.slug).toBe('tasks');
      
      expect(kbModel).toBeDefined();
      expect(kbModel?.slug).toBe('kb');
      
      expect(nonExistentModel).toBeNull();
    });
    
    test('should duplicate a model with a new slug', () => {
      // Reset the module to ensure a clean test
      jest.resetModules();
      
      const duplicatedModel = duplicateDataModel('tasks', 'custom-tasks', 'Custom Tasks');
      
      expect(duplicatedModel).toBeDefined();
      expect(duplicatedModel?.slug).toBe('custom-tasks');
      expect(duplicatedModel?.displayName).toBe('Custom Tasks');
      expect(duplicatedModel?.routes.base).toBe('/custom-tasks');
      expect(duplicatedModel?.api.basePath).toBe('/api/custom-tasks');
      
      // Should have the same structure as the source model
      expect(duplicatedModel?.model.fields).toEqual(tasksConfig.model.fields);
      expect(duplicatedModel?.statuses?.values).toEqual(tasksConfig.statuses?.values);
    });
  });
});