/**
 * Simplified Data Model System Component Exports for Tauri build
 */

import React from 'react';

// Placeholder components
export const DataModelConfigEditor = () => React.createElement('div', null, 'Config Editor (disabled in Tauri)');
export const BackendGeneratorUI = ({ configOverride }) => React.createElement('div', null, 'Backend Generator (disabled in Tauri)');
export const DataPreview = ({ config, limit }) => React.createElement('div', null, 'Data Preview (disabled in Tauri)');
export const DataModelSelector = () => React.createElement('div', null, 'Model Selector (disabled in Tauri)');
export const DataModelItem = () => React.createElement('div', null, 'Model Item (disabled in Tauri)');
export const CreateModelForm = () => React.createElement('div', null, 'Create Model Form (disabled in Tauri)');

// Mock types and hooks for compatibility
export const DataModelProvider = ({children}) => React.createElement(React.Fragment, null, children);
export const useDataModel = () => ({
  items: [],
  loading: false,
  error: null,
  selectedItem: null,
  setSelectedItem: () => {},
  fetchData: async () => {},
  createItem: async () => {},
  updateItem: async () => {},
  deleteItem: async () => {},
  setStatusFilter: () => {},
  setSearchTerm: () => {},
  setSortField: () => {},
  setSortDirection: () => {},
  statusCounts: {},
  setCustomFilter: () => {},
  applyCustomFilter: () => {},
  refreshData: async () => {}
});

// Mock types
export const DataItem = {};
export const DataModelContextValue = {};