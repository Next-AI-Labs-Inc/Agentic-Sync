/**
 * Data Model Selector
 * 
 * Component for selecting and managing data models.
 * Allows users to switch between different data models and create new ones.
 */

import React, { useState } from 'react';
import { useConfig } from '@/contexts/ConfigContext';
import CreateModelForm from './CreateModelForm';

interface DataModelSelectorProps {
  onSelectModel?: (slug: string) => void;
  className?: string;
}

export default function DataModelSelector({ onSelectModel, className = '' }: DataModelSelectorProps) {
  const { availableModels, currentModel, setCurrentModelBySlug } = useConfig();
  const [isCreating, setIsCreating] = useState(false);
  
  // Handle model selection
  const handleModelSelect = (slug: string) => {
    setCurrentModelBySlug(slug);
    
    if (onSelectModel) {
      onSelectModel(slug);
    }
  };
  
  // Handle creating a new model
  const handleCreateSuccess = (slug: string) => {
    setIsCreating(false);
    handleModelSelect(slug);
  };
  
  return (
    <div className={`bg-white shadow rounded-lg ${className}`}>
      {isCreating ? (
        <div className="p-4">
          <CreateModelForm 
            onSuccess={handleCreateSuccess} 
            onCancel={() => setIsCreating(false)} 
          />
        </div>
      ) : (
        <>
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <div className="flex flex-wrap items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Data Models
              </h3>
              <button
                onClick={() => setIsCreating(true)}
                className="ml-3 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create New
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Select a data model to view or manage
            </p>
          </div>
          
          <ul className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
            {availableModels.map((model) => (
              <li key={model.slug}>
                <button
                  onClick={() => handleModelSelect(model.slug)}
                  className={`w-full px-4 py-4 flex items-center hover:bg-gray-50 focus:outline-none ${
                    currentModel?.slug === model.slug ? 'bg-indigo-50' : ''
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center">
                      <p className={`text-sm font-medium ${
                        currentModel?.slug === model.slug ? 'text-indigo-600' : 'text-gray-900'
                      }`}>
                        {model.displayName}
                      </p>
                      <p className="ml-2 text-xs text-gray-500">
                        /{model.slug}
                      </p>
                    </div>
                    {model.description && (
                      <p className="mt-1 text-sm text-gray-500 truncate">
                        {model.description}
                      </p>
                    )}
                  </div>
                  
                  {currentModel?.slug === model.slug && (
                    <span className="ml-2 flex-shrink-0 text-indigo-600">
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </button>
              </li>
            ))}
            
            {availableModels.length === 0 && (
              <li className="px-4 py-5 text-center text-sm text-gray-500">
                No data models available. Click "Create New" to get started.
              </li>
            )}
          </ul>
        </>
      )}
    </div>
  );
}