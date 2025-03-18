/**
 * Data Preview Component
 * 
 * Displays a preview of data from a selected data source,
 * allowing users to browse and explore the data structure.
 */

import React, { useState, useEffect } from 'react';
import { DataModelConfig } from '@/config/dataModels/baseConfig';

interface DataPreviewProps {
  config: DataModelConfig;
  limit?: number;
  onSelectItem?: (item: any) => void;
  className?: string;
}

export default function DataPreview({
  config,
  limit = 10,
  onSelectItem,
  className = ''
}: DataPreviewProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  
  // Fetch data from the configured data source
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Use appropriate fetch method based on data source type
        switch (config.dataSource.type) {
          case 'mongodb':
            // For MongoDB, use the configured API endpoint
            const response = await fetch(`${config.api.basePath}?limit=${limit}`);
            
            if (!response.ok) {
              throw new Error(`API error: ${response.status} ${response.statusText}`);
            }
            
            const jsonData = await response.json();
            setData(Array.isArray(jsonData) ? jsonData : []);
            break;
            
          case 'rest':
            // For REST API, use the configured API URL
            if (!config.dataSource.apiBaseUrl) {
              throw new Error('API base URL not configured');
            }
            
            const restResponse = await fetch(config.dataSource.apiBaseUrl, {
              headers: config.dataSource.headers || {}
            });
            
            if (!restResponse.ok) {
              throw new Error(`API error: ${restResponse.status} ${restResponse.statusText}`);
            }
            
            const restData = await restResponse.json();
            setData(Array.isArray(restData) ? restData : []);
            break;
            
          case 'local':
            // For local storage, check for data with the config's slug
            const localData = localStorage.getItem(`data_${config.slug}`);
            
            if (localData) {
              try {
                const parsedData = JSON.parse(localData);
                setData(Array.isArray(parsedData) ? parsedData : []);
              } catch (err) {
                throw new Error('Invalid data in local storage');
              }
            } else {
              setData([]);
            }
            break;
            
          default:
            throw new Error(`Unsupported data source type: ${config.dataSource.type}`);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [config, limit]);
  
  // Handle item selection
  const handleSelectItem = (item: any) => {
    setSelectedItem(item);
    
    if (onSelectItem) {
      onSelectItem(item);
    }
  };
  
  // Get the fields to display in the preview
  const getPreviewFields = (): string[] => {
    // If there are no fields defined, use defaults
    if (!config.ui?.listView?.fields?.length) {
      return ['id', 'title', 'name', 'createdAt'];
    }
    
    return config.ui.listView.fields;
  };
  
  // Format a field value for display
  const formatFieldValue = (item: any, field: string): string => {
    if (!item[field]) return '-';
    
    const fieldConfig = config.model.fields[field];
    
    // If there's no field config, just return the string value
    if (!fieldConfig) return String(item[field]);
    
    // Format based on field type
    switch (fieldConfig.type) {
      case 'Date':
        return new Date(item[field]).toLocaleString();
      case 'Array':
        if (Array.isArray(item[field])) {
          return item[field].join(', ');
        }
        return String(item[field]);
      default:
        return String(item[field]);
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className={`bg-white shadow rounded-lg p-4 ${className}`}>
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className={`bg-white shadow rounded-lg p-4 ${className}`}>
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Determine preview fields
  const previewFields = getPreviewFields();
  
  return (
    <div className={`bg-white shadow rounded-lg ${className}`}>
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          {config.displayName} Data Preview
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {data.length} items found in {config.dataSource.type} data source
        </p>
      </div>
      
      <div className="flex">
        {/* Data List */}
        <div className="w-1/2 border-r border-gray-200">
          {data.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No data available
            </div>
          ) : (
            <div className="overflow-y-auto max-h-96">
              <ul className="divide-y divide-gray-200">
                {data.map((item, index) => (
                  <li key={item.id || index}>
                    <button
                      className={`w-full text-left px-4 py-4 hover:bg-gray-50 focus:outline-none ${
                        selectedItem && selectedItem.id === item.id ? 'bg-indigo-50' : ''
                      }`}
                      onClick={() => handleSelectItem(item)}
                    >
                      <div className="space-y-1">
                        {previewFields.map((field) => (
                          <div key={field} className="flex items-start">
                            <span className="text-xs font-medium text-gray-500 w-1/3">
                              {config.model.fields[field]?.label || field}:
                            </span>
                            <span className="text-sm text-gray-900 w-2/3 truncate">
                              {formatFieldValue(item, field)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Item Detail */}
        <div className="w-1/2">
          {selectedItem ? (
            <div className="p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                {selectedItem.title || selectedItem.name || `Item ${selectedItem.id}`}
              </h4>
              
              <div className="space-y-2">
                {Object.entries(selectedItem).map(([key, value]) => (
                  <div key={key} className="flex">
                    <span className="text-sm font-medium text-gray-500 w-1/3">
                      {config.model.fields[key]?.label || key}:
                    </span>
                    <span className="text-sm text-gray-900 w-2/3 break-words">
                      {typeof value === 'object' 
                        ? JSON.stringify(value, null, 2) 
                        : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              Select an item to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}