/**
 * ConfigAwareTaskHeader.tsx
 * 
 * This is a demonstration component that shows how to implement
 * config-aware features that adapt based on the active system mode.
 * 
 * AGENT IMPLEMENTATION EXAMPLE:
 * This file provides a concrete example of how to:
 * 1. Check the current system configuration
 * 2. Conditionally render features based on feature flags
 * 3. Adapt UI based on configuration values
 */

import React from 'react';
import { useSystemConfig, useFeatureFlag, ConditionalFeature } from '../contexts/SystemConfigContext';

// Mock components for demonstration
const TagSelector = ({ tags }: { tags: string[] }) => (
  <div className="tags-container">
    {tags.map(tag => (
      <span key={tag} className="tag">{tag}</span>
    ))}
    <button className="add-tag">+ Add</button>
  </div>
);

const CategorySelector = ({ categories }: { categories: string[] }) => (
  <div className="category-selector">
    <select>
      <option>Select Category</option>
      {categories.map(category => (
        <option key={category} value={category}>{category}</option>
      ))}
    </select>
  </div>
);

interface TaskHeaderProps {
  title: string;
  description?: string;
  tags?: string[];
  categories?: string[];
}

/**
 * Configuration-aware task header component
 * 
 * AGENT NOTE: This component demonstrates best practices for creating
 * components that adapt based on the system configuration.
 * 
 * Key features demonstrated:
 * 1. Using useSystemConfig to access the full configuration
 * 2. Using useFeatureFlag for specific feature checks 
 * 3. Using ConditionalFeature for declarative conditional rendering
 * 4. Adapting UI based on workflow type
 */
const ConfigAwareTaskHeader: React.FC<TaskHeaderProps> = ({
  title,
  description,
  tags = [],
  categories = []
}) => {
  // Get the current system configuration
  const { config } = useSystemConfig();
  
  // Check if specific features are enabled
  const tagsEnabled = useFeatureFlag('modules.tasks.useTags');
  const categoriesEnabled = useFeatureFlag('modules.tasks.useCategories');
  
  // Get the workflow type to adapt UI accordingly
  const workflowType = config.modules.tasks.workflow;
  
  // Example of workflow-specific rendering
  const renderWorkflowSpecificControls = () => {
    switch (workflowType) {
      case 'gtd':
        return (
          <div className="gtd-controls">
            <select className="gtd-context">
              <option>Next Actions</option>
              <option>Waiting For</option>
              <option>Someday/Maybe</option>
              <option>Projects</option>
            </select>
          </div>
        );
      case 'kanban':
        return (
          <div className="kanban-controls">
            <select className="kanban-column">
              <option>Backlog</option>
              <option>In Progress</option>
              <option>Review</option>
              <option>Done</option>
            </select>
          </div>
        );
      default:
        return (
          <div className="standard-controls">
            <select className="status-selector">
              <option>To Do</option>
              <option>In Progress</option>
              <option>Done</option>
            </select>
          </div>
        );
    }
  };
  
  return (
    <div className={`task-header ${config.ui.theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      <div className="task-header-main">
        <h2 className="task-title">{title}</h2>
        
        {/* Instance name indicator - shows which configuration is active */}
        <div className="instance-indicator">
          {config.name}
        </div>
      </div>
      
      {description && (
        <p className="task-description">{description}</p>
      )}
      
      <div className="task-controls">
        {/* Workflow-specific controls */}
        {renderWorkflowSpecificControls()}
        
        {/* Feature flag using explicit check */}
        {tagsEnabled && tags.length > 0 && (
          <TagSelector tags={tags} />
        )}
        
        {/* Feature flag using ConditionalFeature component */}
        <ConditionalFeature featurePath="modules.tasks.useCategories">
          <CategorySelector categories={categories} />
        </ConditionalFeature>
        
        {/* Example of UI density adaptation */}
        <div className={`task-actions ${config.ui.density === 'compact' ? 'compact' : 'comfortable'}`}>
          <button className="task-action">Edit</button>
          <button className="task-action">Delete</button>
          
          {/* Show agents button only if agents are enabled */}
          <ConditionalFeature featurePath="modules.tasks.useAgents">
            <button className="task-action agent-action">Run Agent</button>
          </ConditionalFeature>
        </div>
      </div>
    </div>
  );
};

export default ConfigAwareTaskHeader;

/**
 * AGENT USAGE EXAMPLES
 * 
 * Example 1: Adding a new feature that's only available in personal mode
 * 
 * 1. First, update the SystemConfig interface in system-config.ts:
 * ```typescript
 * modules: {
 *   tasks: {
 *     // Existing properties...
 *     useReminders: boolean; // New feature flag
 *   }
 * }
 * ```
 * 
 * 2. Update all configurations, setting it to false in business mode:
 * ```typescript
 * BUSINESS_CONFIG = {
 *   //...
 *   modules: {
 *     tasks: {
 *       //...
 *       useReminders: false // OFF for business mode
 *     }
 *   }
 * }
 * 
 * PERSONAL_CONFIG = {
 *   //...
 *   modules: {
 *     tasks: {
 *       //...
 *       useReminders: true // ON for personal mode
 *     }
 *   }
 * }
 * ```
 * 
 * 3. In your component, use the feature flag:
 * ```tsx
 * const remindersEnabled = useFeatureFlag('modules.tasks.useReminders');
 * 
 * // Or with the declarative approach
 * <ConditionalFeature featurePath="modules.tasks.useReminders">
 *   <ReminderSelector date={task.dueDate} />
 * </ConditionalFeature>
 * ```
 */