/**
 * Data Model Configuration Editor
 * 
 * A comprehensive UI for editing data model configurations.
 * Allows users to customize all aspects of a data model.
 */

import React, { useState, useEffect } from 'react';
import { useConfig } from '@/contexts/ConfigContext';
import { DataModelConfig, FieldConfig, StatusDisplayConfig } from '@/config/dataModels/baseConfig';

interface DataModelConfigEditorProps {
  initialConfig?: DataModelConfig;
  onSave?: (config: DataModelConfig) => void;
  onPreview?: (config: DataModelConfig) => void;
  onCancel?: () => void;
}

export default function DataModelConfigEditor({
  initialConfig,
  onSave,
  onPreview,
  onCancel
}: DataModelConfigEditorProps) {
  const { currentModel, updateCurrentModel, saveModelConfiguration, previewModelConfiguration } = useConfig();
  
  // Use provided config or the current model from context
  const [config, setConfig] = useState<DataModelConfig | null>(initialConfig || currentModel);
  
  // Active tab for the editor
  const [activeTab, setActiveTab] = useState('general');
  
  // Track if form is dirty
  const [isDirty, setIsDirty] = useState(false);
  
  // Update local state when the current model changes
  useEffect(() => {
    if (!initialConfig && currentModel) {
      setConfig(currentModel);
    }
  }, [initialConfig, currentModel]);
  
  // Handle changes to the config
  const handleConfigChange = (path: string, value: any) => {
    if (!config) return;
    
    // Create a deep copy of the config
    const newConfig = JSON.parse(JSON.stringify(config));
    
    // Split the path into parts (e.g., "model.fields.title.required")
    const parts = path.split('.');
    
    // Navigate to the right part of the config
    let current = newConfig;
    for (let i = 0; i < parts.length - 1; i++) {
      // Create the path if it doesn't exist
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    
    // Set the value
    current[parts[parts.length - 1]] = value;
    
    // Update state
    setConfig(newConfig);
    setIsDirty(true);
  };
  
  // Handle saving the configuration
  const handleSave = () => {
    if (!config) return;
    
    if (onSave) {
      onSave(config);
    } else {
      saveModelConfiguration(config);
    }
    
    setIsDirty(false);
  };
  
  // Handle previewing the configuration
  const handlePreview = () => {
    if (!config) return;
    
    if (onPreview) {
      onPreview(config);
    } else {
      previewModelConfiguration(config);
    }
  };
  
  // Handle adding a new field
  const handleAddField = () => {
    if (!config) return;
    
    // Generate a unique field name
    let newFieldName = 'newField';
    let counter = 1;
    
    while (config.model.fields[newFieldName]) {
      newFieldName = `newField${counter}`;
      counter++;
    }
    
    // Create the new field
    const newField: FieldConfig = {
      type: 'String',
      required: false,
      label: 'New Field',
      description: 'Description for the new field',
      displayInList: false,
      displayInDetail: true
    };
    
    // Add to the config
    handleConfigChange(`model.fields.${newFieldName}`, newField);
  };
  
  // Handle removing a field
  const handleRemoveField = (fieldName: string) => {
    if (!config) return;
    
    // Create a copy of the fields object without the specified field
    const { [fieldName]: _, ...remainingFields } = config.model.fields;
    
    // Update the whole fields object
    handleConfigChange('model.fields', remainingFields);
  };
  
  // Handle adding a new status (if applicable)
  const handleAddStatus = () => {
    if (!config || !config.statuses) return;
    
    // Generate a unique status key
    let newStatusKey = 'NEW_STATUS';
    let counter = 1;
    
    while (config.statuses.values[newStatusKey]) {
      newStatusKey = `NEW_STATUS_${counter}`;
      counter++;
    }
    
    // Create new status value
    const newStatusValue = newStatusKey.toLowerCase().replace(/_/g, '-');
    
    // Add to values
    const newValues = {
      ...config.statuses.values,
      [newStatusKey]: newStatusValue
    };
    
    // Create display config
    const newDisplayConfig: StatusDisplayConfig = {
      label: newStatusKey.replace(/_/g, ' ').toLowerCase(),
      color: 'bg-gray-100 text-gray-800',
      icon: 'FaCircle',
      description: `Items with ${newStatusKey.toLowerCase()} status`
    };
    
    // Update the config
    handleConfigChange('statuses.values', newValues);
    handleConfigChange(`statuses.display.${newStatusValue}`, newDisplayConfig);
    handleConfigChange(`statuses.displayNames.${newStatusValue}`, newDisplayConfig.label);
  };
  
  // If no config is available, show a loading state
  if (!config) {
    return <div className="p-4">Loading configuration...</div>;
  }
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b border-gray-200">
        <nav className="flex">
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'general' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'model' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('model')}
          >
            Data Model
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'ui' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('ui')}
          >
            UI Configuration
          </button>
          {config.statuses && (
            <button
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'statuses' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('statuses')}
            >
              Statuses
            </button>
          )}
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'api' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('api')}
          >
            API
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'advanced' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('advanced')}
          >
            Advanced
          </button>
        </nav>
      </div>
      
      <div className="p-4">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">General Settings</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Display Name
                </label>
                <input
                  type="text"
                  value={config.displayName}
                  onChange={(e) => handleConfigChange('displayName', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
                <p className="mt-1 text-sm text-gray-500">Human-readable name for this data type</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Slug
                </label>
                <input
                  type="text"
                  value={config.slug}
                  onChange={(e) => handleConfigChange('slug', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
                <p className="mt-1 text-sm text-gray-500">URL-friendly identifier (no spaces, lowercase)</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={config.description || ''}
                onChange={(e) => handleConfigChange('description', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                rows={3}
              />
            </div>
          </div>
        )}
        
        {/* Data Model Settings */}
        {activeTab === 'model' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Data Model Fields</h2>
              <button
                onClick={handleAddField}
                className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
              >
                Add Field
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Field Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Required</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Label</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Display in List</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(config.model.fields).map(([fieldName, field]) => (
                    <tr key={fieldName}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{fieldName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <select
                          value={field.type}
                          onChange={(e) => handleConfigChange(`model.fields.${fieldName}.type`, e.target.value)}
                          className="block w-full border-gray-300 rounded-md shadow-sm"
                        >
                          <option value="String">String</option>
                          <option value="Number">Number</option>
                          <option value="Boolean">Boolean</option>
                          <option value="Date">Date</option>
                          <option value="Array">Array</option>
                          <option value="Object">Object</option>
                          <option value="Reference">Reference</option>
                          <option value="Enum">Enum</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input
                          type="checkbox"
                          checked={field.required || false}
                          onChange={(e) => handleConfigChange(`model.fields.${fieldName}.required`, e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input
                          type="text"
                          value={field.label || fieldName}
                          onChange={(e) => handleConfigChange(`model.fields.${fieldName}.label`, e.target.value)}
                          className="block w-full border-gray-300 rounded-md shadow-sm"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input
                          type="checkbox"
                          checked={field.displayInList || false}
                          onChange={(e) => handleConfigChange(`model.fields.${fieldName}.displayInList`, e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleRemoveField(fieldName)}
                          className="text-red-600 hover:text-red-900"
                          disabled={fieldName === 'id'} // Don't allow removing the ID field
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Include timestamps?</label>
              <input
                type="checkbox"
                checked={config.model.timestamps || false}
                onChange={(e) => handleConfigChange('model.timestamps', e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded"
              />
              <span className="ml-2 text-sm text-gray-500">Automatically add createdAt and updatedAt fields</span>
            </div>
          </div>
        )}
        
        {/* UI Configuration */}
        {activeTab === 'ui' && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">UI Configuration</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Icon
                </label>
                <input
                  type="text"
                  value={config.ui.icon || ''}
                  onChange={(e) => handleConfigChange('ui.icon', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
                <p className="mt-1 text-sm text-gray-500">Icon name (e.g., 'FaTasks')</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Primary Color
                </label>
                <input
                  type="text"
                  value={config.ui.color || ''}
                  onChange={(e) => handleConfigChange('ui.color', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
                <p className="mt-1 text-sm text-gray-500">Color name (e.g., 'blue', 'indigo')</p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-md font-medium text-gray-900">List View</h3>
              
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Layout
                  </label>
                  <select
                    value={config.ui.listView.layout || 'cards'}
                    onChange={(e) => handleConfigChange('ui.listView.layout', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  >
                    <option value="cards">Cards</option>
                    <option value="table">Table</option>
                    <option value="list">List</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Items Per Page
                  </label>
                  <input
                    type="number"
                    value={config.ui.listView.itemsPerPage || 20}
                    onChange={(e) => handleConfigChange('ui.listView.itemsPerPage', parseInt(e.target.value))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
              </div>
              
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700">
                  Fields to Display
                </label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {Object.keys(config.model.fields).map(fieldName => (
                    <div key={fieldName} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`list-field-${fieldName}`}
                        checked={config.ui.listView.fields.includes(fieldName)}
                        onChange={(e) => {
                          const fields = e.target.checked
                            ? [...config.ui.listView.fields, fieldName]
                            : config.ui.listView.fields.filter(f => f !== fieldName);
                          handleConfigChange('ui.listView.fields', fields);
                        }}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded"
                      />
                      <label htmlFor={`list-field-${fieldName}`} className="text-sm text-gray-700">
                        {config.model.fields[fieldName].label || fieldName}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-md font-medium text-gray-900">Detail View</h3>
              
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700">
                  Layout
                </label>
                <select
                  value={config.ui.detailView.layout}
                  onChange={(e) => handleConfigChange('ui.detailView.layout', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="basic">Basic</option>
                  <option value="tabbed">Tabbed</option>
                  <option value="sectioned">Sectioned</option>
                </select>
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700">Sections</h4>
                {config.ui.detailView.sections.map((section, index) => (
                  <div key={index} className="mt-2 p-2 border border-gray-200 rounded">
                    <div className="flex justify-between items-center">
                      <input
                        type="text"
                        value={section.name}
                        onChange={(e) => {
                          const newSections = [...config.ui.detailView.sections];
                          newSections[index].name = e.target.value;
                          handleConfigChange('ui.detailView.sections', newSections);
                        }}
                        className="block w-1/3 border-gray-300 rounded-md shadow-sm"
                      />
                      <button
                        onClick={() => {
                          const newSections = config.ui.detailView.sections.filter((_, i) => i !== index);
                          handleConfigChange('ui.detailView.sections', newSections);
                        }}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div className="mt-2">
                      <label className="block text-xs font-medium text-gray-700">
                        Fields
                      </label>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {Object.keys(config.model.fields).map(fieldName => (
                          <div key={fieldName} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`section-${index}-field-${fieldName}`}
                              checked={section.fields.includes(fieldName)}
                              onChange={(e) => {
                                const newSections = [...config.ui.detailView.sections];
                                if (e.target.checked) {
                                  newSections[index].fields.push(fieldName);
                                } else {
                                  newSections[index].fields = newSections[index].fields.filter(f => f !== fieldName);
                                }
                                handleConfigChange('ui.detailView.sections', newSections);
                              }}
                              className="h-3 w-3 text-indigo-600 focus:ring-indigo-500 rounded"
                            />
                            <label htmlFor={`section-${index}-field-${fieldName}`} className="text-xs text-gray-700">
                              {config.model.fields[fieldName].label || fieldName}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={() => {
                    const newSections = [...config.ui.detailView.sections, {
                      name: 'New Section',
                      fields: []
                    }];
                    handleConfigChange('ui.detailView.sections', newSections);
                  }}
                  className="mt-2 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200"
                >
                  Add Section
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Status Configuration */}
        {activeTab === 'statuses' && config.statuses && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Status Configuration</h2>
              <button
                onClick={handleAddStatus}
                className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
              >
                Add Status
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status Key</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Display Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Color</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Icon</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(config.statuses.values).map(([key, value]) => {
                    // Skip special filter values
                    if (['all', 'pending', 'recent-completed', 'source-tasks', 'engaged', 'review', 'completions'].includes(value)) {
                      return null;
                    }
                    
                    // Get display config if available
                    const displayConfig = config.statuses.display?.[value];
                    
                    return (
                      <tr key={key}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{key}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{value}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <input
                            type="text"
                            value={config.statuses.displayNames?.[value] || displayConfig?.label || ''}
                            onChange={(e) => handleConfigChange(`statuses.displayNames.${value}`, e.target.value)}
                            className="block w-full border-gray-300 rounded-md shadow-sm"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <input
                            type="text"
                            value={config.statuses.colors?.[value] || displayConfig?.color || ''}
                            onChange={(e) => handleConfigChange(`statuses.colors.${value}`, e.target.value)}
                            className="block w-full border-gray-300 rounded-md shadow-sm"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <input
                            type="text"
                            value={displayConfig?.icon || ''}
                            onChange={(e) => {
                              const newDisplay = {
                                ...(displayConfig || {}),
                                icon: e.target.value
                              };
                              handleConfigChange(`statuses.display.${value}`, newDisplay);
                            }}
                            className="block w-full border-gray-300 rounded-md shadow-sm"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <select
                            value={config.statuses.transitions?.[value] || ''}
                            onChange={(e) => handleConfigChange(`statuses.transitions.${value}`, e.target.value)}
                            className="block w-full border-gray-300 rounded-md shadow-sm"
                          >
                            <option value="">-- None --</option>
                            {Object.values(config.statuses.values)
                              .filter(v => typeof v === 'string' && !['all', 'pending', 'recent-completed', 'source-tasks', 'engaged', 'review', 'completions'].includes(v))
                              .map(v => (
                                <option key={v} value={v}>
                                  {config.statuses.displayNames?.[v] || v}
                                </option>
                              ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* API Configuration */}
        {activeTab === 'api' && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">API Configuration</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  API Base Path
                </label>
                <input
                  type="text"
                  value={config.api.basePath || ''}
                  onChange={(e) => handleConfigChange('api.basePath', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
                <p className="mt-1 text-sm text-gray-500">Base path for API endpoints (e.g., '/api/tasks')</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  API Version
                </label>
                <input
                  type="text"
                  value={config.api.version || ''}
                  onChange={(e) => handleConfigChange('api.version', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="text-md font-medium text-gray-900">API Endpoints</h3>
              
              <div className="mt-2 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Path</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Handler</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {config.api.endpoints.map((endpoint, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <select
                            value={endpoint.method}
                            onChange={(e) => {
                              const newEndpoints = [...config.api.endpoints];
                              newEndpoints[index].method = e.target.value as any;
                              handleConfigChange('api.endpoints', newEndpoints);
                            }}
                            className="block w-full border-gray-300 rounded-md shadow-sm"
                          >
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                            <option value="PUT">PUT</option>
                            <option value="DELETE">DELETE</option>
                            <option value="PATCH">PATCH</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <input
                            type="text"
                            value={endpoint.path}
                            onChange={(e) => {
                              const newEndpoints = [...config.api.endpoints];
                              newEndpoints[index].path = e.target.value;
                              handleConfigChange('api.endpoints', newEndpoints);
                            }}
                            className="block w-full border-gray-300 rounded-md shadow-sm"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <input
                            type="text"
                            value={endpoint.handler}
                            onChange={(e) => {
                              const newEndpoints = [...config.api.endpoints];
                              newEndpoints[index].handler = e.target.value;
                              handleConfigChange('api.endpoints', newEndpoints);
                            }}
                            className="block w-full border-gray-300 rounded-md shadow-sm"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => {
                              const newEndpoints = config.api.endpoints.filter((_, i) => i !== index);
                              handleConfigChange('api.endpoints', newEndpoints);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <button
                onClick={() => {
                  const newEndpoints = [...config.api.endpoints, {
                    method: 'GET',
                    path: '/',
                    handler: 'customHandler'
                  }];
                  handleConfigChange('api.endpoints', newEndpoints);
                }}
                className="mt-2 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
              >
                Add Endpoint
              </button>
            </div>
          </div>
        )}
        
        {/* Advanced Configuration */}
        {activeTab === 'advanced' && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">Advanced Configuration</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Data Source
              </label>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    value={config.dataSource.type}
                    onChange={(e) => handleConfigChange('dataSource.type', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  >
                    <option value="mongodb">MongoDB</option>
                    <option value="rest">REST API</option>
                    <option value="graphql">GraphQL</option>
                    <option value="local">Local Storage</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Connection String
                  </label>
                  <input
                    type="text"
                    value={config.dataSource.connectionString || ''}
                    onChange={(e) => handleConfigChange('dataSource.connectionString', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Sync Configuration
              </label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.sync?.enabled || false}
                    onChange={(e) => handleConfigChange('sync.enabled', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable synchronization</span>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.sync?.realtime || false}
                    onChange={(e) => handleConfigChange('sync.realtime', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable real-time updates</span>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Permissions
              </label>
              <div className="mt-2 grid grid-cols-2 gap-4">
                {['create', 'read', 'update', 'delete'].map(action => (
                  <div key={action}>
                    <label className="block text-sm font-medium text-gray-700">
                      {action.charAt(0).toUpperCase() + action.slice(1)}
                    </label>
                    <input
                      type="text"
                      value={(config.permissions?.[action] || []).join(', ')}
                      onChange={(e) => {
                        const roles = e.target.value
                          .split(',')
                          .map(role => role.trim())
                          .filter(Boolean);
                        handleConfigChange(`permissions.${action}`, roles);
                      }}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      placeholder="user, admin"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-md font-medium text-gray-900">Raw Configuration JSON</h3>
              <p className="text-sm text-gray-500">Advanced users can edit the raw configuration JSON directly</p>
              <textarea
                value={JSON.stringify(config, null, 2)}
                onChange={(e) => {
                  try {
                    const parsedConfig = JSON.parse(e.target.value);
                    setConfig(parsedConfig);
                    setIsDirty(true);
                  } catch (error) {
                    // Ignore parse errors while typing
                  }
                }}
                className="mt-1 block w-full h-64 font-mono text-sm border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 border-t border-gray-200">
        {onCancel && (
          <button
            onClick={onCancel}
            className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handlePreview}
          disabled={!isDirty}
          className={`mr-3 inline-flex justify-center py-2 px-4 border border-indigo-600 shadow-sm text-sm font-medium rounded-md ${
            isDirty ? 'text-indigo-600 bg-white hover:bg-indigo-50' : 'text-gray-400 bg-gray-50 cursor-not-allowed'
          }`}
        >
          Preview
        </button>
        <button
          onClick={handleSave}
          disabled={!isDirty}
          className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
            isDirty ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}