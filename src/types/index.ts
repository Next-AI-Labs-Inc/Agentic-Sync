// Item status type for requirements, technical plan, and next steps
export type ItemStatus = 'proposed' | 'approved';

// Structure for items with status tracking
export interface ItemWithStatus {
  content: string;
  status: ItemStatus;
  id: string; // Unique identifier for the item
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
}

export interface Task {
  id: string;         // MongoDB _id
  _id?: string;       // Original MongoDB _id field
  title: string;
  description?: string;
  userImpact?: string; // Description of how this task impacts users
  quotes?: string;    // Direct quotes to be displayed in collapsed/expanded views
  requirements?: string; // List of requirements the solution must fulfill (legacy string format)
  technicalPlan?: string; // Step-by-step implementation plan (legacy string format)
  // New fields for structured items with status tracking
  requirementItems?: ItemWithStatus[]; // Requirements with status tracking
  technicalPlanItems?: ItemWithStatus[]; // Technical plan with status tracking
  nextStepItems?: ItemWithStatus[]; // Next steps with status tracking
  status: 'inbox' | 'brainstorm' | 'proposed' | 'backlog' | 'maybe' | 'todo' | 'in-progress' | 'on-hold' | 'for-review' | 'done' | 'reviewed' | 'archived';
  priority: 'low' | 'medium' | 'high';
  project: string;
  initiative?: string;
  branch?: string;
  tags?: string[];
  verificationSteps?: string[];
  verificationStepItems?: ItemWithStatus[];
  files?: string[];
  dependencies?: number[];
  nextSteps?: string[]; // Legacy format - simple array of strings
  url?: string;        // Full URL to the task (for easy access by AI agents)
  buildDocumentation?: Array<{
    id: string;
    title: string;
    content: string;
    format: 'markdown' | 'html' | 'text';
    createdAt: string;
    createdBy: string;
    updatedAt?: string;
    updatedBy?: string;
  }>;
  feedback?: Array<{
    id: string;
    content: string;
    createdAt: string;
    createdBy?: string;
    resolved?: boolean;
    resolvedAt?: string;
  }>;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
  reviewedAt?: string | null;
  tested?: boolean;
  budget?: string;
  owner?: string;
  createdBy?: string;
  _isNew?: boolean; // Flag for UI animations
  starred?: boolean; // Flag for "Today" filter
}

export interface Initiative {
  id: number;
  name: string;
  description: string;
  status: 'not-started' | 'planning' | 'in-progress' | 'completed' | 'on-hold';
  priority: 'low' | 'medium' | 'high';
  startDate?: string;
  targetDate?: string;
  owner?: string;
  budget?: string;
  tags?: string[];
  keyRisks?: string[];
  dependencies?: number[];
  linkedProjects?: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}

// KPI feature removed

export interface Changelog {
  version: string;
  date?: string;
  sections: {
    added?: string[];
    changed?: string[];
    fixed?: string[];
    removed?: string[];
  };
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  tech?: string;
  port?: number;
  apiPort?: number;
  path?: string;
  commands?: Record<string, string>;
  documentation?: Array<{
    name: string;
    url: string;
    isFilePath?: boolean;
    command?: string;
  }>;
  environments?: Array<{
    name: string;
    url: string;
    isFilePath?: boolean;
  }>;
  _isNew?: boolean; // Flag for UI animations
}

export type TaskFilterStatus = 'all' | 'inbox' | 'brainstorm' | 'proposed' | 'backlog' | 'maybe' | 'todo' | 'in-progress' | 'on-hold' | 'for-review' | 'done' | 'reviewed' | 'archived' | 'pending' | 'recent-completed' | 'source-tasks' | 'engaged' | 'review' | 'completions' | 'today';
export type ProjectFilterType = 'all' | 'none' | string | string[];
export type SortOption = 'priority' | 'updated' | 'created' | 'status';

export interface SavedFilter {
  id: string;
  name: string;
  statusFilter: TaskFilterStatus;
  projectFilter: ProjectFilterType;
  sortBy: SortOption;
  sortDirection: SortDirection;
}
export type SortDirection = 'asc' | 'desc';

// System prompt types for agent integration
export interface SystemPrompt {
  id: string;
  name: string;
  content: string;
  type: 'default' | 'implementation' | 'demo' | 'feedback' | 'custom';
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  isDefault?: boolean;
}

export interface AgentOptions {
  systemPromptId?: string;
  customSystemPrompt?: string;
  taskId: string;
  feedback?: string;
  mode: 'implement' | 'demo' | 'feedback';
}

export interface TaskFormData {
  title: string;
  description: string;
  userImpact?: string;
  quotes?: string;
  impactedFunctionality?: string; // List of components, behaviors, or user flows affected
  requirements?: string;
  technicalPlan?: string;
  priority: 'low' | 'medium' | 'high';
  project: string;
  status?: 'inbox' | 'brainstorm' | 'proposed' | 'backlog' | 'maybe' | 'todo' | 'in-progress' | 'for-review';
  initiative: string;
  tags: string;
  verificationSteps: string;
  nextSteps: string;
}

export interface FeedbackFormData {
  content: string;
}