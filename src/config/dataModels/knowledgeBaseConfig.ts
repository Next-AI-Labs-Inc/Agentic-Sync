/**
 * Knowledge Base Module Configuration
 * 
 * This file contains the complete configuration for a Knowledge Base data model.
 * It demonstrates how the same configuration structure can be used for a different data type.
 */

import { createDataModelConfig, DataModelConfig, StatusDisplayConfig } from './baseConfig';

/**
 * Status values for knowledge base articles
 */
const KB_STATUSES = {
  DRAFT: 'draft',
  REVIEW: 'review',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
  
  // Special filter options (similar to tasks)
  ALL: 'all',
  PENDING: 'pending', // All non-published articles
  RECENT: 'recent' // Recently published
};

/**
 * Status display information for knowledge base statuses
 */
const KB_STATUS_DISPLAY: Record<string, StatusDisplayConfig> = {
  [KB_STATUSES.DRAFT]: {
    label: 'Draft',
    color: 'bg-gray-100 text-gray-800',
    icon: 'FaEdit',
    description: 'Article is in draft state and not yet ready for review'
  },
  [KB_STATUSES.REVIEW]: {
    label: 'In Review',
    color: 'bg-yellow-100 text-yellow-800',
    icon: 'FaEye',
    description: 'Article is being reviewed for accuracy and completeness'
  },
  [KB_STATUSES.PUBLISHED]: {
    label: 'Published',
    color: 'bg-green-100 text-green-800',
    icon: 'FaBook',
    description: 'Article is published and available to users'
  },
  [KB_STATUSES.ARCHIVED]: {
    label: 'Archived',
    color: 'bg-red-100 text-red-800',
    icon: 'FaArchive',
    description: 'Article is archived and no longer actively maintained'
  },
  [KB_STATUSES.ALL]: {
    label: 'All Articles',
    color: 'bg-blue-100 text-blue-800',
    icon: 'FaBookOpen',
    description: 'All knowledge base articles'
  },
  [KB_STATUSES.PENDING]: {
    label: 'Pending Articles',
    color: 'bg-purple-100 text-purple-800',
    icon: 'FaHourglass',
    description: 'Articles that are not yet published'
  },
  [KB_STATUSES.RECENT]: {
    label: 'Recent Articles',
    color: 'bg-teal-100 text-teal-800',
    icon: 'FaClock',
    description: 'Recently published articles'
  }
};

/**
 * Status transitions for knowledge base articles
 */
const KB_TRANSITIONS = {
  [KB_STATUSES.DRAFT]: KB_STATUSES.REVIEW,
  [KB_STATUSES.REVIEW]: KB_STATUSES.PUBLISHED,
  [KB_STATUSES.PUBLISHED]: KB_STATUSES.ARCHIVED,
  [KB_STATUSES.ARCHIVED]: KB_STATUSES.DRAFT
};

/**
 * Full configuration for the Knowledge Base data model
 */
const knowledgeBaseConfig: DataModelConfig = createDataModelConfig({
  // Basic information
  dataType: 'knowledgeBase',
  slug: 'kb',
  displayName: 'Knowledge Base',
  description: 'A knowledge base system for documentation and articles',
  
  // Model definition
  model: {
    fields: {
      id: {
        type: 'String',
        required: true,
        description: 'Unique identifier for the article',
        displayInList: false,
        displayInDetail: false,
        searchable: true
      },
      title: {
        type: 'String',
        required: true,
        label: 'Article Title',
        description: 'Descriptive title for the article',
        placeholder: 'Enter article title...',
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
      content: {
        type: 'String',
        required: true,
        label: 'Content',
        description: 'Article content in Markdown format',
        placeholder: 'Enter article content...',
        component: 'markdown',
        displayInList: false,
        displayInDetail: true,
        searchable: true
      },
      summary: {
        type: 'String',
        required: false,
        label: 'Summary',
        description: 'Brief summary of the article',
        placeholder: 'Enter a brief summary...',
        validation: {
          maxLength: 500
        },
        displayInList: true,
        displayInDetail: true,
        searchable: true
      },
      status: {
        type: 'Enum',
        required: true,
        enum: ['draft', 'review', 'published', 'archived'],
        default: 'draft',
        label: 'Status',
        description: 'Current status of the article',
        displayInList: true,
        displayInDetail: true,
        searchable: false,
        filterable: true,
        sortable: true
      },
      category: {
        type: 'String',
        required: true,
        label: 'Category',
        description: 'Primary category for the article',
        displayInList: true,
        displayInDetail: true,
        searchable: true,
        filterable: true,
        sortable: true
      },
      tags: {
        type: 'Array',
        of: 'String',
        required: false,
        label: 'Tags',
        description: 'Keywords or topics related to the article',
        component: 'tagInput',
        displayInList: true,
        displayInDetail: true,
        searchable: true,
        filterable: true,
        sortable: false
      },
      author: {
        type: 'String',
        required: false,
        label: 'Author',
        description: 'Article author',
        displayInList: true,
        displayInDetail: true,
        searchable: true,
        filterable: true,
        sortable: true
      },
      createdAt: {
        type: 'Date',
        required: true,
        label: 'Created',
        description: 'When the article was created',
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
        description: 'When the article was last updated',
        displayInList: true,
        displayInDetail: true,
        searchable: false,
        filterable: false,
        sortable: true
      },
      publishedAt: {
        type: 'Date',
        required: false,
        label: 'Published',
        description: 'When the article was published',
        displayInList: false,
        displayInDetail: true,
        searchable: false,
        filterable: false,
        sortable: true
      },
      relatedArticles: {
        type: 'Array',
        of: 'Reference',
        reference: 'knowledgeBase',
        required: false,
        label: 'Related Articles',
        description: 'Other articles that are related to this one',
        component: 'referenceList',
        displayInList: false,
        displayInDetail: true,
        searchable: false,
        filterable: false,
        sortable: false
      },
      attachments: {
        type: 'Array',
        of: 'String',
        required: false,
        label: 'Attachments',
        description: 'Files attached to this article',
        component: 'fileList',
        displayInList: false,
        displayInDetail: true,
        searchable: false,
        filterable: false,
        sortable: false
      }
    },
    timestamps: true,
    indexes: [
      { fields: ['status'], unique: false },
      { fields: ['category'], unique: false },
      { fields: ['title'], unique: true }
    ]
  },
  
  // UI configuration
  ui: {
    icon: 'FaBook',
    color: 'indigo',
    listView: {
      fields: ['title', 'status', 'category', 'author', 'updatedAt'],
      actions: ['view', 'edit', 'delete', 'changeStatus'],
      primaryField: 'title',
      secondaryField: 'summary',
      tertiaryField: 'category',
      layout: 'cards',
      itemsPerPage: 20,
      orderBy: 'updatedAt',
      orderDirection: 'desc'
    },
    detailView: {
      layout: 'tabbed',
      sections: [
        {
          name: 'Content',
          fields: ['title', 'content', 'summary']
        },
        {
          name: 'Metadata',
          fields: ['category', 'tags', 'author', 'status', 'createdAt', 'updatedAt', 'publishedAt']
        },
        {
          name: 'Related',
          fields: ['relatedArticles', 'attachments']
        }
      ],
      actions: ['edit', 'delete', 'changeStatus', 'preview']
    },
    filters: [
      {
        field: 'status',
        type: 'dropdown',
        label: 'Status',
        options: [
          { value: 'draft', label: 'Draft' },
          { value: 'review', label: 'In Review' },
          { value: 'published', label: 'Published' },
          { value: 'archived', label: 'Archived' }
        ]
      },
      {
        field: 'category',
        type: 'dropdown',
        label: 'Category'
      },
      {
        field: 'tags',
        type: 'multiselect',
        label: 'Tags'
      },
      {
        field: 'author',
        type: 'dropdown',
        label: 'Author'
      }
    ],
    searchFields: ['title', 'content', 'summary', 'category', 'tags', 'author']
  },
  
  // Routing configuration
  routes: {
    base: '/kb',
    list: '/',
    detail: '/:id',
    new: '/new',
    edit: '/:id/edit'
  },
  
  // API configuration
  api: {
    basePath: '/api/kb',
    endpoints: [
      { method: 'GET', path: '/', handler: 'list' },
      { method: 'GET', path: '/:id', handler: 'getById' },
      { method: 'POST', path: '/', handler: 'create' },
      { method: 'PUT', path: '/:id', handler: 'update' },
      { method: 'DELETE', path: '/:id', handler: 'delete' },
      { method: 'PUT', path: '/:id/status', handler: 'updateStatus' },
      { method: 'GET', path: '/categories', handler: 'listCategories' },
      { method: 'GET', path: '/tags', handler: 'listTags' }
    ]
  },
  
  // Status configuration
  statuses: {
    values: KB_STATUSES,
    displayNames: {
      [KB_STATUSES.DRAFT]: 'Draft',
      [KB_STATUSES.REVIEW]: 'In Review',
      [KB_STATUSES.PUBLISHED]: 'Published',
      [KB_STATUSES.ARCHIVED]: 'Archived',
      [KB_STATUSES.ALL]: 'All Articles',
      [KB_STATUSES.PENDING]: 'Pending Articles',
      [KB_STATUSES.RECENT]: 'Recent Articles'
    },
    colors: {
      [KB_STATUSES.DRAFT]: 'bg-gray-100 text-gray-800',
      [KB_STATUSES.REVIEW]: 'bg-yellow-100 text-yellow-800',
      [KB_STATUSES.PUBLISHED]: 'bg-green-100 text-green-800',
      [KB_STATUSES.ARCHIVED]: 'bg-red-100 text-red-800'
    },
    descriptions: {
      [KB_STATUSES.DRAFT]: 'Article is in draft state and not yet ready for review',
      [KB_STATUSES.REVIEW]: 'Article is being reviewed for accuracy and completeness',
      [KB_STATUSES.PUBLISHED]: 'Article is published and available to users',
      [KB_STATUSES.ARCHIVED]: 'Article is archived and no longer actively maintained'
    },
    display: KB_STATUS_DISPLAY,
    transitions: KB_TRANSITIONS,
    actions: {
      [KB_STATUSES.DRAFT]: 'Submit for Review',
      [KB_STATUSES.REVIEW]: 'Publish Article',
      [KB_STATUSES.PUBLISHED]: 'Archive Article',
      [KB_STATUSES.ARCHIVED]: 'Restore to Draft'
    },
    actionHelp: {
      [KB_STATUSES.DRAFT]: {
        title: 'Ready for review?',
        description: 'Submit this article for review before publishing.'
      },
      [KB_STATUSES.REVIEW]: {
        title: 'Ready to publish?',
        description: 'Publish this article to make it available to users.'
      },
      [KB_STATUSES.PUBLISHED]: {
        title: 'Archive this article?',
        description: 'Archive this article if it is no longer relevant or accurate.'
      },
      [KB_STATUSES.ARCHIVED]: {
        title: 'Restore as draft?',
        description: 'Restore this article to draft status to make updates.'
      }
    },
    coaching: {
      [KB_STATUSES.DRAFT]: "This article is in draft status. Once you've completed the content, submit it for review.",
      [KB_STATUSES.REVIEW]: "This article is being reviewed. Check for accuracy, clarity, and completeness before publishing.",
      [KB_STATUSES.PUBLISHED]: "This article is published and available to users. Update it if information changes.",
      [KB_STATUSES.ARCHIVED]: "This article is archived and not shown to users. Restore to draft if updates are needed."
    }
  },
  
  // Data source configuration
  dataSource: {
    type: 'mongodb',
    connectionString: process.env.MONGODB_URI || 'mongodb://localhost:27017/ix-kb'
  },
  
  // Permissions
  permissions: {
    create: ['editor', 'admin'],
    read: ['user', 'editor', 'admin'],
    update: ['editor', 'admin'],
    delete: ['admin']
  },
  
  // Synchronization configuration
  sync: {
    enabled: true,
    realtime: true,
    events: ['create', 'update', 'delete', 'status-change']
  }
});

export default knowledgeBaseConfig;