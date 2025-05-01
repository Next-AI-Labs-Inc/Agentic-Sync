/**
 * Simplified Data Model System Component Exports for Tauri build
 */

import React from 'react';

// Simple placeholder components with proper props to match the interface
export const DataModelConfigEditor = () => <div>Config Editor (disabled in Tauri)</div>;

export const BackendGeneratorUI = ({ configOverride }: { configOverride?: any }) => 
  <div>Backend Generator (disabled in Tauri)</div>;

export const DataPreview = ({ config, limit }: { config?: any, limit?: number }) => 
  <div>Data Preview (disabled in Tauri)</div>;

export const DataModelSelector = () => <div>Model Selector (disabled in Tauri)</div>;
export const DataModelItem = () => <div>Model Item (disabled in Tauri)</div>;
export const CreateModelForm = () => <div>Create Model Form (disabled in Tauri)</div>;

// Mock provider and hook for compatibility
export const DataModelProvider = ({children}: {children: React.ReactNode}) => 
  <>{children}</>;

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

export type DataItem = any;
export type DataModelContextValue = ReturnType<typeof useDataModel>;