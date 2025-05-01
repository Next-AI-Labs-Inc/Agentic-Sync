/**
 * Data Models Management Page
 * 
 * This page provides a complete UI for managing data models:
 * - Viewing available data models
 * - Creating new data models from templates
 * - Customizing data model configurations
 * - Generating backend code
 * - Previewing data from various sources
 */

import React, { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { ConfigProvider, useConfig } from '@/contexts/ConfigContext';
import { 
  DataModelProvider,
  DataModelSelector,
  DataModelConfigEditor,
  BackendGeneratorUI,
  DataPreview
} from '@/components/DataModelSystem';
import { DataModelConfig } from '@/config/dataModels/baseConfig';

// Main content component (wrapped with ConfigProvider)
const DataModelsContent: React.FC = () => {
  const { currentModel, isPreviewMode, previewModel, exitPreview } = useConfig();
  const [activeTab, setActiveTab] = useState<'config' | 'backend' | 'preview'>('config');
  
  // Get the active model (either current or preview)
  const activeModel = isPreviewMode ? previewModel : currentModel;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="col-span-1">
          <DataModelSelector />
        </div>
        
        {/* Main content */}
        <div className="col-span-3">
          {!activeModel ? (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-700">
                Select a Data Model
              </h2>
              <p className="mt-2 text-gray-500">
                Choose a data model from the sidebar or create a new one to get started.
              </p>
            </div>
          ) : (
            <>
              {/* Preview mode notification */}
              {isPreviewMode && (
                <div className="mb-4 rounded-md bg-yellow-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Preview Mode</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          You are previewing changes to this data model. These changes have not been saved yet.
                        </p>
                      </div>
                      <div className="mt-4">
                        <div className="-mx-2 -my-1.5 flex">
                          <button
                            onClick={exitPreview}
                            className="px-2 py-1.5 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                          >
                            Exit Preview
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Tabs */}
              <div className="mb-4 border-b border-gray-200">
                <nav className="-mb-px flex">
                  <button
                    className={`mr-8 py-4 px-1 text-sm font-medium ${
                      activeTab === 'config'
                        ? 'text-indigo-600 border-b-2 border-indigo-500'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('config')}
                  >
                    Configuration
                  </button>
                  <button
                    className={`mr-8 py-4 px-1 text-sm font-medium ${
                      activeTab === 'backend'
                        ? 'text-indigo-600 border-b-2 border-indigo-500'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('backend')}
                  >
                    Backend Generator
                  </button>
                  <button
                    className={`py-4 px-1 text-sm font-medium ${
                      activeTab === 'preview'
                        ? 'text-indigo-600 border-b-2 border-indigo-500'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('preview')}
                  >
                    Data Preview
                  </button>
                </nav>
              </div>
              
              {/* Tab content */}
              {activeTab === 'config' && (
                <DataModelConfigEditor />
              )}
              
              {activeTab === 'backend' && (
                <BackendGeneratorUI 
                  configOverride={isPreviewMode ? previewModel : undefined}
                />
              )}
              
              {activeTab === 'preview' && (
                <DataPreview 
                  config={activeModel as DataModelConfig}
                  limit={20}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Page component
const DataModelsPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Data Models Management</title>
        <meta name="description" content="Manage data models for your application" />
      </Head>
      
      <ConfigProvider>
        <DataModelsContent />
      </ConfigProvider>
    </>
  );
};

export default DataModelsPage;