/**
 * Project Enhancement Recommendations for Tasks App
 * 
 * This file contains proposed enhancements to the project and task data structures,
 * along with example data that could be used to enhance the application.
 */

import { Project, Task, Initiative } from '@/types';

// Enhanced Project structure with additional fields
export interface EnhancedProject extends Project {
  // Team/People
  teamMembers?: string[];                // Team members assigned to this project
  leads?: string[];                      // Project leads or maintainers
  stakeholders?: string[];               // Business stakeholders
  
  // Project metadata
  status: 'active' | 'archived' | 'planned' | 'on-hold'; // Project status
  startDate?: string;                    // When project was started
  targetDate?: string;                   // Target completion date
  priority: 'low' | 'medium' | 'high';   // Overall project priority
  
  // Progress tracking
  completionPercentage?: number;         // Overall project completion percentage
  lastActivity?: string;                 // Timestamp of last activity
  upcomingDeadlines?: {                  // Key deadlines
    date: string;
    description: string;
  }[];
  
  // Metrics
  taskStats?: {                          // Task statistics
    total: number;
    proposed: number; 
    todo: number;
    inProgress: number;
    done: number;
    reviewed: number;
  };
  
  // Technical
  repository?: string;                   // Git repository URL
  branches?: string[];                   // Active branches
  dependencies?: string[];               // Other project dependencies
  technicalDebt?: {                      // Technical debt items
    id: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
  }[];
  
  // Integration
  integrations?: {                       // External integrations
    name: string;
    type: string;
    url: string;
  }[];
  
  // Tooling/Environment
  localSetup?: string;                   // Local setup instructions
  cicd?: {                               // CI/CD information
    provider: string;
    url: string;
  };
}

// Example proposed tasks that could be created
export const proposedTasks: Partial<Task>[] = [
  {
    title: "Enhance project details page with progress visualization",
    description: "Add a visual progress bar and metrics dashboard to the project details page that shows task completion metrics, active contributors, and upcoming deadlines.",
    status: "proposed",
    priority: "medium",
    project: "tasks",
    initiative: "UX Improvements",
    tags: ["ui", "dashboard", "metrics"],
    verificationSteps: [
      "Navigate to a project details page",
      "Verify progress bar shows correct completion percentage",
      "Verify task statistics match actual task counts",
      "Confirm contributor list is accurate",
      "Check deadline visualization is clear and accurate"
    ],
    nextSteps: [
      "Design mockups for the metrics dashboard",
      "Define required API endpoints for metrics data",
      "Implement responsive layout for mobile view"
    ]
  },
  {
    title: "Implement team assignment for tasks",
    description: "Add the ability to assign team members to tasks and filter tasks by assignee. This includes updating the task form, task card display, and adding new filter options.",
    status: "proposed",
    priority: "high",
    project: "tasks",
    initiative: "Team Collaboration",
    tags: ["collaboration", "user-management", "filtering"],
    verificationSteps: [
      "Add assignee field to task creation form",
      "Verify assignee is displayed on task cards",
      "Test filtering tasks by assignee",
      "Check that assignee changes are saved correctly",
      "Verify assignee updates trigger real-time updates"
    ],
    nextSteps: [
      "Create UI mockups for assignee selection",
      "Update TaskContext to include assignee in task type",
      "Add API endpoint to fetch team members",
      "Update task filters to include assignee filter"
    ]
  },
  {
    title: "Create task dependency visualization",
    description: "Implement a visual graph that shows task dependencies and relationships. The graph should be interactive and allow users to see task chains and potential bottlenecks.",
    status: "proposed",
    priority: "medium",
    project: "tasks",
    initiative: "Project Planning",
    tags: ["visualization", "dependencies", "planning"],
    verificationSteps: [
      "Navigate to the new dependency view",
      "Verify tasks show up with their correct relationships",
      "Test adding a new dependency between tasks",
      "Check that cycles are detected and warned",
      "Verify graph is responsive and readable on different screen sizes"
    ],
    nextSteps: [
      "Research best visualization libraries (D3.js vs React Flow)",
      "Define data structure for dependency relationships",
      "Create API endpoints for dependency management",
      "Design the layout for the dependency view"
    ]
  },
  {
    title: "Add recurring task support",
    description: "Implement support for recurring tasks that automatically regenerate based on a schedule. This is useful for regular maintenance tasks, reviews, and recurring meetings.",
    status: "proposed",
    priority: "low",
    project: "tasks",
    initiative: "Task Management",
    tags: ["scheduling", "automation", "recurring"],
    verificationSteps: [
      "Create a task with a daily recurrence pattern",
      "Verify task is regenerated after completion",
      "Test weekly, monthly, and custom recurrence patterns",
      "Check that recurrence can be edited and stopped",
      "Verify notifications work for recurring tasks"
    ],
    nextSteps: [
      "Define recurrence patterns (daily, weekly, monthly, custom)",
      "Update task model to include recurrence information",
      "Implement scheduler to create recurring task instances",
      "Add UI for configuring recurrence"
    ]
  },
  {
    title: "Implement project health indicators",
    description: "Add health indicators to projects that show overall status based on task completion, deadline proximity, recent activity, and potential risks. This allows quick identification of projects that need attention.",
    status: "proposed",
    priority: "high",
    project: "tasks",
    initiative: "Project Monitoring",
    tags: ["monitoring", "health", "dashboard"],
    verificationSteps: [
      "Verify health indicators update automatically based on project metrics",
      "Check that risk factors are correctly identified",
      "Test health history tracking to see trends",
      "Confirm threshold settings affect health calculations correctly",
      "Verify notifications work for declining health"
    ],
    nextSteps: [
      "Define health score algorithm based on multiple factors",
      "Create health visualization components",
      "Add health tracking over time",
      "Implement threshold configuration",
      "Create notification system for health changes"
    ]
  }
];

// Enhanced indicators for project statistics display
export const projectIndicators = {
  // Current task distribution by status
  taskDistribution: {
    title: "Task Distribution",
    description: "Distribution of tasks by current status",
    data: [
      { status: 'proposed', count: 8, color: '#9333ea' },  // Purple
      { status: 'todo', count: 12, color: '#3b82f6' },     // Blue
      { status: 'in-progress', count: 7, color: '#eab308' }, // Yellow
      { status: 'done', count: 15, color: '#22c55e' },     // Green
      { status: 'reviewed', count: 9, color: '#6366f1' }   // Indigo
    ]
  },
  
  // Velocity/completion rate over time
  velocity: {
    title: "Velocity",
    description: "Tasks completed per week over the last 8 weeks",
    data: [
      { week: '1', count: 3 },
      { week: '2', count: 5 },
      { week: '3', count: 2 },
      { week: '4', count: 7 },
      { week: '5', count: 6 },
      { week: '6', count: 4 },
      { week: '7', count: 8 },
      { week: '8', count: 5 }
    ]
  },
  
  // Task creation vs completion
  taskFlow: {
    title: "Task Flow",
    description: "Tasks created vs completed per week",
    data: [
      { week: '1', created: 5, completed: 3 },
      { week: '2', created: 7, completed: 5 },
      { week: '3', created: 4, completed: 2 },
      { week: '4', created: 8, completed: 7 },
      { week: '5', created: 6, completed: 6 },
      { week: '6', created: 9, completed: 4 },
      { week: '7', created: 5, completed: 8 },
      { week: '8', created: 3, completed: 5 }
    ]
  },
  
  // Tasks by priority
  priorityDistribution: {
    title: "Priority Distribution",
    description: "Distribution of tasks by priority level",
    data: [
      { priority: 'high', count: 8, color: '#ef4444' },    // Red
      { priority: 'medium', count: 16, color: '#eab308' }, // Yellow
      { priority: 'low', count: 27, color: '#3b82f6' }     // Blue
    ]
  },
  
  // Task aging (time in specific status)
  taskAging: {
    title: "Task Aging",
    description: "Average time (days) tasks spend in each status",
    data: [
      { status: 'proposed', avgDays: 5.2 },
      { status: 'todo', avgDays: 8.7 },
      { status: 'in-progress', avgDays: 6.3 },
      { status: 'done', avgDays: 3.1 },
      { status: 'reviewed', avgDays: 0 }  // Terminal state
    ]
  },
  
  // Team member task distribution
  teamDistribution: {
    title: "Team Workload",
    description: "Active tasks by team member",
    data: [
      { member: 'Alex', count: 7 },
      { member: 'Jordan', count: 5 },
      { member: 'Taylor', count: 9 },
      { member: 'Morgan', count: 3 },
      { member: 'Casey', count: 6 }
    ]
  }
};