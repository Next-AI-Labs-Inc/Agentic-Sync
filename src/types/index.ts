export interface Task {
  id: string;         // MongoDB _id
  _id?: string;       // Original MongoDB _id field
  title: string;
  description?: string;
  userImpact?: string; // Description of how this task impacts users
  requirements?: string; // List of requirements the solution must fulfill
  technicalPlan?: string; // Step-by-step implementation plan
  status: 'proposed' | 'todo' | 'in-progress' | 'done' | 'reviewed';
  priority: 'low' | 'medium' | 'high';
  project: string;
  initiative?: string;
  branch?: string;
  tags?: string[];
  verificationSteps?: string[];
  files?: string[];
  dependencies?: number[];
  nextSteps?: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
  reviewedAt?: string | null;
  tested?: boolean;
  budget?: string;
  owner?: string;
  createdBy?: string;
  _isNew?: boolean; // Flag for UI animations
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

export type TaskFilterStatus = 'all' | 'proposed' | 'todo' | 'in-progress' | 'done' | 'reviewed' | 'pending' | 'recent-completed';
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

export interface TaskFormData {
  title: string;
  description: string;
  userImpact?: string;
  requirements?: string;
  technicalPlan?: string;
  priority: 'low' | 'medium' | 'high';
  project: string;
  status?: 'proposed' | 'todo' | 'in-progress' | 'done' | 'reviewed';
  initiative: string;
  tags: string;
  verificationSteps: string;
  nextSteps: string;
}