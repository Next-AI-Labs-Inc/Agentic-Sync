/**
 * Tasks Module Configuration
 * 
 * This file contains the complete configuration for the Tasks data model.
 * It defines all fields, statuses, UI components, and behaviors specific to the Tasks system.
 */

import { createDataModelConfig, DataModelConfig, StatusDisplayConfig } from './baseConfig';
import { TASK_STATUSES, STATUS_DISPLAY_NAMES, STATUS_COLORS, STATUS_DESCRIPTIONS, 
  STATUS_DISPLAY, NEXT_STATUS, PREVIOUS_STATUS, STATUS_ACTION_TEXT, 
  STATUS_ACTION_HELP, STATUS_COACHING } from '@/constants/taskStatus';

/**
 * Full configuration for the Tasks data model
 */
const tasksConfig: DataModelConfig = createDataModelConfig({
  // Basic information
  dataType: 'tasks',
  slug: 'tasks',
  displayName: 'Tasks',
  description: 'A comprehensive task management system with workflow stages',
  
  // Model definition with all fields
  model: {
    fields: {
      id: {
        type: 'String',
        required: true,
        description: 'Unique identifier for the task',
        displayInList: false,
        displayInDetail: false,
        searchable: true
      },
      title: {
        type: 'String',
        required: true,
        label: 'Task Title',
        description: 'Short, descriptive title for the task',
        placeholder: 'Enter task title...',
        validation: {
          minLength: 3,
          maxLength: 200
        },
        displayInList: true,
        displayInDetail: true,
        searchable: true,
        filterable: false,
        sortable: true
      },
      description: {
        type: 'String',
        required: false,
        label: 'Description',
        description: 'Detailed description of the task',
        placeholder: 'Enter task description...',
        component: 'textarea',
        displayInList: false,
        displayInDetail: true,
        searchable: true
      },
      status: {
        type: 'Enum',
        required: true,
        enum: [
          'inbox', 'brainstorm', 'proposed', 'backlog', 'maybe', 
          'todo', 'in-progress', 'on-hold', 'for-review', 
          'done', 'reviewed', 'archived'
        ],
        default: 'inbox',
        label: 'Status',
        description: 'Current workflow status of the task',
        displayInList: true,
        displayInDetail: true,
        searchable: false,
        filterable: true,
        sortable: true
      },
      priority: {
        type: 'Enum',
        required: false,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
        label: 'Priority',
        description: 'Task priority level',
        displayInList: true,
        displayInDetail: true,
        searchable: false,
        filterable: true,
        sortable: true
      },
      dueDate: {
        type: 'Date',
        required: false,
        label: 'Due Date',
        description: 'Date when the task is due',
        component: 'datepicker',
        displayInList: true,
        displayInDetail: true,
        searchable: false,
        filterable: true,
        sortable: true
      },
      project: {
        type: 'String',
        required: false,
        label: 'Project',
        description: 'Project the task belongs to',
        displayInList: true,
        displayInDetail: true,
        searchable: true,
        filterable: true,
        sortable: true
      },
      initiative: {
        type: 'String',
        required: false,
        label: 'Initiative',
        description: 'Higher-level initiative this task belongs to',
        displayInList: false,
        displayInDetail: true,
        searchable: true,
        filterable: true,
        sortable: false
      },
      tags: {
        type: 'Array',
        of: 'String',
        required: false,
        label: 'Tags',
        description: 'Categories or labels for the task',
        component: 'tagInput',
        displayInList: true,
        displayInDetail: true,
        searchable: true,
        filterable: true,
        sortable: false
      },
      createdAt: {
        type: 'Date',
        required: true,
        label: 'Created',
        description: 'When the task was created',
        displayInList: true,
        displayInDetail: true,
        searchable: false,
        filterable: false,
        sortable: true
      },
      updatedAt: {
        type: 'Date',
        required: true,
        label: 'Updated',
        description: 'When the task was last updated',
        displayInList: false,
        displayInDetail: true,
        searchable: false,
        filterable: false,
        sortable: true
      },
      completedAt: {
        type: 'Date',
        required: false,
        label: 'Completed',
        description: 'When the task was completed',
        displayInList: false,
        displayInDetail: true,
        searchable: false,
        filterable: false,
        sortable: true
      },
      reviewedAt: {
        type: 'Date',
        required: false,
        label: 'Reviewed',
        description: 'When the task was reviewed',
        displayInList: false,
        displayInDetail: true,
        searchable: false,
        filterable: false,
        sortable: true
      },
      tested: {
        type: 'Boolean',
        required: false,
        default: false,
        label: 'Tested',
        description: 'Whether the task has been tested',
        displayInList: false,
        displayInDetail: true,
        searchable: false,
        filterable: true,
        sortable: false
      },
      verificationSteps: {
        type: 'Array',
        of: 'String',
        required: false,
        label: 'Verification Steps',
        description: 'Steps to verify the task is complete',
        component: 'listEditor',
        displayInList: false,
        displayInDetail: true,
        searchable: true,
        filterable: false,
        sortable: false
      },
      nextSteps: {
        type: 'Array',
        of: 'String',
        required: false,
        label: 'Next Steps',
        description: 'Future actions related to this task',
        component: 'listEditor',
        displayInList: false,
        displayInDetail: true,
        searchable: true,
        filterable: false,
        sortable: false
      },
      dependencies: {
        type: 'Array',
        of: 'Reference',
        reference: 'tasks',
        required: false,
        label: 'Dependencies',
        description: 'Tasks that this task depends on',
        component: 'referenceList',
        displayInList: false,
        displayInDetail: true,
        searchable: false,
        filterable: false,
        sortable: false
      },
      files: {
        type: 'Array',
        of: 'String',
        required: false,
        label: 'Files',
        description: 'Files related to this task',
        component: 'fileList',
        displayInList: false,
        displayInDetail: true,
        searchable: true,
        filterable: false,
        sortable: false
      },
      buildDocumentation: {
        type: 'Array',
        of: 'Object',
        required: false,
        label: 'Build Documentation',
        description: 'Documentation related to building and implementing this task',
        component: 'documentationList',
        displayInList: false,
        displayInDetail: true,
        searchable: true,
        filterable: false,
        sortable: false
      },
      // New fields for item approval functionality
      requirementItems: {
        type: 'Array',
        of: 'Object',
        required: false,
        label: 'Requirements With Approval Status',
        description: 'Requirements with approval status tracking - each item can be proposed, approved, or vetoed',
        component: 'approvalItemList',
        displayInList: false,
        displayInDetail: true,
        searchable: true,
        filterable: false,
        sortable: false
      },
      technicalPlanItems: {
        type: 'Array',
        of: 'Object',
        required: false,
        label: 'Technical Plan With Approval Status',
        description: 'Technical plan steps with approval status tracking - each item can be proposed, approved, or vetoed',
        component: 'approvalItemList',
        displayInList: false,
        displayInDetail: true,
        searchable: true,
        filterable: false,
        sortable: false
      },
      nextStepItems: {
        type: 'Array',
        of: 'Object',
        required: false,
        label: 'Next Steps With Approval Status',
        description: 'Next steps with approval status tracking - each item can be proposed, approved, or vetoed',
        component: 'approvalItemList',
        displayInList: false,
        displayInDetail: true,
        searchable: true,
        filterable: false,
        sortable: false
      }
    },
    timestamps: true,
    indexes: [
      { fields: ['status'], unique: false },
      { fields: ['project'], unique: false },
      { fields: ['title', 'project'], unique: true }
    ]
  },
  
  // UI configuration
  ui: {
    icon: 'FaTasks',
    color: 'blue',
    listView: {
      fields: ['title', 'status', 'priority', 'project', 'createdAt'],
      actions: ['edit', 'delete', 'changeStatus'],
      primaryField: 'title',
      secondaryField: 'description',
      tertiaryField: 'status',
      layout: 'cards',
      itemsPerPage: 50,
      orderBy: 'createdAt',
      orderDirection: 'desc'
    },
    detailView: {
      layout: 'sectioned',
      sections: [
        {
          name: 'Overview',
          fields: ['title', 'description', 'status', 'priority', 'project', 'initiative']
        },
        {
          name: 'Details',
          fields: ['tags', 'dueDate', 'createdAt', 'updatedAt', 'completedAt', 'reviewedAt']
        },
        {
          name: 'Verification',
          fields: ['tested', 'verificationSteps']
        },
        {
          name: 'Related',
          fields: ['nextSteps', 'dependencies', 'files']
        }
      ],
      actions: ['edit', 'delete', 'changeStatus', 'markTested']
    },
    filters: [
      {
        field: 'status',
        type: 'dropdown',
        label: 'Status',
        options: Object.entries(STATUS_DISPLAY_NAMES).map(([key, value]) => ({
          value: key,
          label: value
        }))
      },
      {
        field: 'project',
        type: 'dropdown',
        label: 'Project'
      },
      {
        field: 'priority',
        type: 'dropdown',
        label: 'Priority',
        options: [
          { value: 'high', label: 'High' },
          { value: 'medium', label: 'Medium' },
          { value: 'low', label: 'Low' }
        ]
      },
      {
        field: 'tags',
        type: 'multiselect',
        label: 'Tags'
      }
    ],
    searchFields: ['title', 'description', 'id', 'initiative', 'project', 'tags']
  },
  
  // Routing configuration
  routes: {
    base: '/tasks',
    list: '/',
    detail: '/:id',
    new: '/new',
    edit: '/:id/edit'
  },
  
  // API configuration
  api: {
    basePath: '/api/tasks',
    endpoints: [
      { method: 'GET', path: '/', handler: 'list' },
      { method: 'GET', path: '/:id', handler: 'getById' },
      { method: 'POST', path: '/', handler: 'create' },
      { method: 'PUT', path: '/:id', handler: 'update' },
      { method: 'DELETE', path: '/:id', handler: 'delete' },
      { method: 'PUT', path: '/:id/status', handler: 'updateStatus' },
      { method: 'PUT', path: '/:id/tested', handler: 'markTested' },
      // New endpoints for item status management
      { method: 'PUT', path: '/:id/requirement-item/:itemId', handler: 'updateRequirementItem' },
      { method: 'PUT', path: '/:id/technical-plan-item/:itemId', handler: 'updateTechnicalPlanItem' },
      { method: 'PUT', path: '/:id/next-step-item/:itemId', handler: 'updateNextStepItem' },
      { method: 'DELETE', path: '/:id/requirement-item/:itemId', handler: 'deleteRequirementItem' },
      { method: 'DELETE', path: '/:id/technical-plan-item/:itemId', handler: 'deleteTechnicalPlanItem' },
      { method: 'DELETE', path: '/:id/next-step-item/:itemId', handler: 'deleteNextStepItem' },
      { method: 'POST', path: '/:id/requirement-item', handler: 'addRequirementItem' },
      { method: 'POST', path: '/:id/technical-plan-item', handler: 'addTechnicalPlanItem' },
      { method: 'POST', path: '/:id/next-step-item', handler: 'addNextStepItem' }
    ]
  },
  
  // Status configuration
  statuses: {
    values: TASK_STATUSES,
    displayNames: STATUS_DISPLAY_NAMES,
    colors: STATUS_COLORS,
    descriptions: STATUS_DESCRIPTIONS,
    display: STATUS_DISPLAY as Record<string, StatusDisplayConfig>,
    transitions: NEXT_STATUS,
    actions: STATUS_ACTION_TEXT,
    actionHelp: STATUS_ACTION_HELP,
    coaching: STATUS_COACHING
  },
  
  // Data source configuration
  dataSource: {
    type: 'mongodb',
    connectionString: process.env.MONGODB_URI || 'mongodb://localhost:27017/ix-tasks'
  },
  
  // Permissions
  permissions: {
    create: ['user', 'admin'],
    read: ['user', 'admin'],
    update: ['user', 'admin'],
    delete: ['admin']
  },
  
  // Synchronization configuration
  sync: {
    enabled: true,
    realtime: true,
    events: ['create', 'update', 'delete', 'status-change']
  }
});

export default tasksConfig;