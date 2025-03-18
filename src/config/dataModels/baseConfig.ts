/**
 * Base Configuration for Data Model Systems
 * 
 * This file defines the structure and type definitions for configurable data model systems.
 * It serves as the foundation for creating new data management interfaces with consistent UX.
 */

import { ReactNode } from 'react';

/**
 * Field type definitions for model schemas
 */
export type FieldType = 
  | 'String' 
  | 'Number' 
  | 'Boolean' 
  | 'Date' 
  | 'Array' 
  | 'Object' 
  | 'Reference'
  | 'Enum';

/**
 * Configuration for a specific model field
 */
export interface FieldConfig {
  type: FieldType;
  required?: boolean;
  default?: any;
  label?: string;
  description?: string;
  placeholder?: string;
  helperText?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
  enum?: string[] | number[];
  of?: FieldType; // For Array type, specifies the type of array elements
  reference?: string; // For Reference type, the model being referenced
  component?: string; // UI component to use for this field
  displayInList?: boolean; // Whether to display this field in list views
  displayInDetail?: boolean; // Whether to display this field in detail views
  readOnly?: boolean; // Whether this field is read-only
  searchable?: boolean; // Whether this field is searchable
  filterable?: boolean; // Whether this field can be used as a filter
  sortable?: boolean; // Whether this field can be sorted
  hidden?: boolean; // Whether this field should be hidden in the UI
}

/**
 * Configuration for a model's fields
 */
export interface ModelFieldsConfig {
  [fieldName: string]: FieldConfig;
}

/**
 * Configuration for display of fields in a list view
 */
export interface ListViewConfig {
  fields: string[]; // List of field names to display
  actions?: string[]; // List of action names to display
  primaryField?: string; // Field to use as the primary display field
  secondaryField?: string; // Field to use as the secondary display field
  tertiaryField?: string; // Field to use as the tertiary display field
  layout?: 'table' | 'cards' | 'list'; // Layout for the list view
  itemsPerPage?: number; // Number of items to display per page
  orderBy?: string; // Default field to order by
  orderDirection?: 'asc' | 'desc'; // Default order direction
}

/**
 * Configuration for sections in a detail view
 */
export interface DetailSectionConfig {
  name: string;
  fields: string[];
  component?: string;
  expandable?: boolean;
  expanded?: boolean;
}

/**
 * Configuration for a detail view
 */
export interface DetailViewConfig {
  layout: 'basic' | 'tabbed' | 'sectioned';
  sections: DetailSectionConfig[];
  actions?: string[];
}

/**
 * Configuration for a filter
 */
export interface FilterConfig {
  field: string;
  type: 'dropdown' | 'multiselect' | 'text' | 'number' | 'date' | 'boolean' | 'custom';
  label?: string;
  options?: { value: string; label: string }[];
  component?: string;
  defaultValue?: any;
}

/**
 * Configuration for status display
 */
export interface StatusDisplayConfig {
  label: string;
  color: string;
  icon: string;
  description: string;
}

/**
 * Configuration for an API endpoint
 */
export interface ApiEndpointConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  handler: string;
  middleware?: string[];
  description?: string;
}

/**
 * Configuration for a data source
 */
export interface DataSourceConfig {
  type: 'mongodb' | 'rest' | 'graphql' | 'local';
  connectionString?: string;
  apiBaseUrl?: string;
  headers?: Record<string, string>;
  authentication?: {
    type: 'basic' | 'bearer' | 'jwt' | 'oauth2';
    credentials?: {
      username?: string;
      password?: string;
      token?: string;
    };
  };
}

/**
 * Comprehensive configuration for a data model system
 */
export interface DataModelConfig {
  // Basic information
  dataType: string; // Unique identifier for this data type
  slug: string; // URL-friendly identifier
  displayName: string; // Human-readable name
  description?: string; // Description of this data type
  
  // Model definition
  model: {
    fields: ModelFieldsConfig;
    timestamps?: boolean; // Whether to include created/updated timestamps
    indexes?: { fields: string[], unique?: boolean }[]; // Database indexes
  };
  
  // UI configuration
  ui: {
    icon?: string; // Icon to use for this data type
    color?: string; // Primary color for this data type
    listView: ListViewConfig;
    detailView: DetailViewConfig;
    filters: FilterConfig[];
    searchFields?: string[]; // Fields to include in search
    customComponents?: {
      [componentName: string]: any; // Custom component definitions
    };
  };
  
  // Routing configuration
  routes: {
    base: string; // Base path for all routes
    list?: string; // Path for list view (default: '/')
    detail?: string; // Path for detail view (default: '/:id')
    new?: string; // Path for new item form (default: '/new')
    edit?: string; // Path for edit form (default: '/:id/edit')
  };
  
  // API configuration
  api: {
    version?: string; // API version (v1, v2, etc.)
    basePath?: string; // Base path for API endpoints
    endpoints: ApiEndpointConfig[];
  };
  
  // Status configuration (if applicable)
  statuses?: {
    values: { [key: string]: string }; // Status values (e.g., DRAFT: 'draft')
    displayNames?: { [key: string]: string }; // Display names for statuses
    colors?: { [key: string]: string }; // Color classes for statuses
    descriptions?: { [key: string]: string }; // Descriptions for statuses
    display?: { [key: string]: StatusDisplayConfig }; // Full display config for statuses
    transitions?: { [fromStatus: string]: string }; // Allowed status transitions
    actions?: { [status: string]: string }; // Action text for status transitions
    actionHelp?: { [status: string]: { title: string; description: string } }; // Help text for actions
    coaching?: { [status: string]: string }; // Coaching messages for statuses
  };
  
  // Data source configuration
  dataSource: DataSourceConfig;
  
  // Permissions
  permissions?: {
    create?: string[];
    read?: string[];
    update?: string[];
    delete?: string[];
  };
  
  // Synchronization configuration
  sync?: {
    enabled: boolean;
    realtime?: boolean;
    events?: string[];
    pollingInterval?: number;
  };
}

/**
 * Function to create a new data model config
 */
export function createDataModelConfig(config: Partial<DataModelConfig>): DataModelConfig {
  // Merge with default values
  return {
    dataType: config.dataType || 'generic',
    slug: config.slug || 'generic',
    displayName: config.displayName || 'Generic Data',
    
    model: {
      fields: config.model?.fields || {},
      timestamps: config.model?.timestamps !== undefined ? config.model.timestamps : true,
      indexes: config.model?.indexes || []
    },
    
    ui: {
      icon: config.ui?.icon || 'FaDatabase',
      color: config.ui?.color || 'blue',
      listView: config.ui?.listView || {
        fields: ['id', 'title', 'createdAt'],
        layout: 'cards',
        itemsPerPage: 20,
        orderBy: 'createdAt',
        orderDirection: 'desc'
      },
      detailView: config.ui?.detailView || {
        layout: 'basic',
        sections: [
          {
            name: 'Details',
            fields: ['title', 'description', 'createdAt', 'updatedAt']
          }
        ]
      },
      filters: config.ui?.filters || [],
      searchFields: config.ui?.searchFields || ['title', 'description'],
      customComponents: config.ui?.customComponents || {}
    },
    
    routes: {
      base: config.routes?.base || `/${config.slug || 'data'}`,
      list: config.routes?.list || '/',
      detail: config.routes?.detail || '/:id',
      new: config.routes?.new || '/new',
      edit: config.routes?.edit || '/:id/edit'
    },
    
    api: {
      version: config.api?.version || 'v1',
      basePath: config.api?.basePath || `/api/${config.slug || 'data'}`,
      endpoints: config.api?.endpoints || [
        { method: 'GET', path: '/', handler: 'list' },
        { method: 'GET', path: '/:id', handler: 'getById' },
        { method: 'POST', path: '/', handler: 'create' },
        { method: 'PUT', path: '/:id', handler: 'update' },
        { method: 'DELETE', path: '/:id', handler: 'delete' }
      ]
    },
    
    dataSource: config.dataSource || {
      type: 'mongodb',
      connectionString: process.env.MONGODB_URI || 'mongodb://localhost:27017'
    },
    
    sync: config.sync || {
      enabled: false
    },
    
    ...config
  } as DataModelConfig;
}

// No export type statement needed here, the interfaces are already exported above