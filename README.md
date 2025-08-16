# Agentic Sync - AI-Native Task Management Platform

## What This Does For You

**Agentic Sync** is a production-ready task management system specifically designed for developers and AI agents to collaborate effectively. This is not just another todo app - it's a sophisticated **Getting Things Done (GTD)** implementation with built-in AI agent integration.

### 🎯 Core Value Proposition

**For Developers:**
- **Instant, social media-like UI** with optimistic updates that make task management feel effortless
- **Complete local deployment** - compiles to a native desktop app via Tauri with your own database
- **AI agent direct communication** - code agents can create, update, and complete tasks programmatically
- **Production GTD workflow** - handles complex task states, dependencies, and approval processes
- **Zero external dependencies** - runs entirely on your infrastructure

**For AI Agents:**
- **Direct task creation** - agents can log tasks without human intervention using the included client
- **Status management** - agents mark tasks as 'for-review' when complete, requiring human approval
- **Rich task context** - support for requirements, technical plans, verification steps, and dependencies
- **Project organization** - automatic categorization and initiative linking

### 🚀 What You Get

```javascript
// AI agents can directly create tasks like this:
const { createTask } = require('../ixcoach-api/utils/agentTaskClient');

await createTask({
  title: 'Implement user authentication',
  description: 'Add OAuth integration for Google and GitHub',
  userImpact: 'Users can securely log in and access personalized features',
  requirements: '- OAuth provider setup\n- User session management\n- Security audit',
  technicalPlan: '1. Install auth libraries\n2. Set up OAuth flows\n3. Create user model',
  status: 'proposed',
  priority: 'high',
  project: 'webapp'
});
```

The task automatically appears in your UI, follows GTD workflow, and waits for human approval when AI completes work.

## 🎬 Live Demo & Screenshots

**Enhancing AI Agent Communication with a User-Friendly Interface** 🚀  
👉 [**Watch the demo on Loom**](https://www.loom.com/share/121fb242c0ba4c0c856abb31733342bb)

<div align="center">

[<img src="https://github.com/user-attachments/assets/7caca448-9d17-44cd-a6d5-1fa344fa6e41" width="300"/>](https://github.com/user-attachments/assets/7caca448-9d17-44cd-a6d5-1fa344fa6e41)
[<img src="https://github.com/user-attachments/assets/78e6d33f-f443-41ed-b400-223f9cad7675" width="300"/>](https://github.com/user-attachments/assets/78e6d33f-f443-41ed-b400-223f9cad7675)
[<img src="https://github.com/user-attachments/assets/c8766685-7cea-478f-bac5-68d8ed0796af" width="300"/>](https://github.com/user-attachments/assets/c8766685-7cea-478f-bac5-68d8ed0796af)

[<img src="https://github.com/user-attachments/assets/9ea38dca-1edb-4964-9b5c-81e598cd30b9" width="300"/>](https://github.com/user-attachments/assets/9ea38dca-1edb-4964-9b5c-81e598cd30b9)
[<img src="https://github.com/user-attachments/assets/b60ad38f-f7b4-4c6d-b824-05acca9a5308" width="300"/>](https://github.com/user-attachments/assets/b60ad38f-f7b4-4c6d-b824-05acca9a5308)

</div>

### 📱 Deployment Options

1. **Web Application** - Next.js app with MongoDB backend
2. **Desktop Application** - Tauri compilation for native Windows/Mac/Linux
3. **Local Database** - SQLite support for completely offline operation
4. **Cloud Deployment** - Vercel/Netlify ready with environment configuration

## Current Status & Development Roadmap

### ✅ Production Ready
- **Core task management** - Create, update, track tasks with full GTD workflow
- **AI agent integration** - Direct task creation and status management via API
- **MongoDB backend** - Complete CRUD operations with optimistic UI updates
- **Initiative tracking** - Strategic project organization and KPI linking
- **Memory optimized** - Efficient EventBus system prevents memory leaks
- **Instant UI feedback** - Social media-like responsiveness with animations

### 🚧 In Development
- **Requirement approval system** - Human review interface for AI-generated requirements ([docs/issues/TaskCard_Approve_Veto_Buttons_Analysis.md](./docs/issues/TaskCard_Approve_Veto_Buttons_Analysis.md))
- **Agent launcher UI** - Deploy AI agents directly from task cards to work on specific tasks
- **Tauri desktop compilation** - Native app builds (basic structure ready, needs testing)
- **SQLite local storage** - Offline-first database option for local deployments

### 🎯 Next Quarter
- **Collaborative workflows** - Multi-user task assignment and approval chains
- **Advanced integrations** - GitHub, Jira, and VS Code extensions
- **Agent marketplace** - Pre-configured AI agents for common development tasks

## Shared Components System

The Agentic Sync application uses a modular component architecture for shared components:

- **Modular Architecture**: Individual components are packaged separately instead of as a monolithic library
- **Local Development**: Components are referenced via local file paths for seamless development
- **Automated Migration**: Utilities to manage the transition from monolithic to modular imports
- **Import Verification**: Tools to ensure consistent component usage patterns

## Repository Setup

This repository is configured to sync with both personal and organization remotes automatically through git hooks. When pushing to main, changes are propagated to both repositories.

## Task Status Workflow

This task management system implements GTD methodology with stages optimized for both human and AI agent workflows:

```
┌───────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐
│ Collection │  │ Processing │  │ Organizing │  │  Engaging  │  │  Reference │
└─────┬─────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘
      │              │               │               │               │
      ▼              ▼               ▼               ▼               ▼
   [INBOX]       [PROPOSED]       [TODO]       [IN-PROGRESS]    [REVIEWED]
[BRAINSTORM]     [BACKLOG]       [MAYBE]         [DONE]        [ARCHIVED]
                                               [ON-HOLD]
```

### GTD Workflow Status Actions

#### Collection Phase
- **Inbox**: Initial collection point for new ideas and tasks
  - *Primary Action*: Move to Brainstorm
  - *Secondary Actions*: Mark Tested, Delete

- **Brainstorm**: Development phase for new ideas
  - *Primary Action*: Move to Proposed for consideration
  - *Secondary Actions*: Mark Tested, Delete
  
#### Processing Phase
- **Proposed**: Task has been proposed (often by AI) but not accepted
  - *Primary Action*: Move to Todo 
  - *Secondary Actions*: Mark Tested, Delete

- **Backlog**: Task is in the backlog for future consideration
  - *Primary Action*: Move to Todo
  - *Secondary Actions*: Mark Tested, Delete
  
#### Organizing Phase
- **Maybe** (Someday/Maybe): Items to consider later but not currently actionable
  - *Primary Action*: Move to Backlog
  - *Secondary Actions*: Mark Tested, Delete
  
- **Todo**: Task is ready to be worked on
  - *Primary Actions*: Start Progress, To Backlog
  - *Secondary Actions*: Mark Tested, Delete
  
#### Engaging Phase
- **In Progress**: Task is currently being worked on
  - *Primary Actions*: Mark Done, Put On Hold
  - *Secondary Actions*: Mark Tested, Delete
  
- **On Hold**: Task is temporarily paused
  - *Primary Action*: Resume Progress
  - *Secondary Actions*: Mark Tested, Delete
  
- **Done**: Task has been completed and is ready for review
  - *Primary Actions*: Mark Reviewed, Still Working
  - *Secondary Actions*: Delete
  
#### Reference Phase
- **Reviewed**: Task has been completed and reviewed
  - *Primary Actions*: Archive Task, Reopen Task
  - *Secondary Actions*: Delete
  
- **Archived**: Task has been archived
  - *Primary Actions*: Unarchive
  - *Secondary Actions*: Delete

### Special Filters
- **All**: Shows all tasks (except archived)
- **Pending**: All tasks that are not yet completed or reviewed

## Features

- **Instant UI Feedback**: All operations feel immediate with optimistic updates
- **Task Management**: Create, update, and track tasks across projects
- **Initiative Tracking**: Organize work under strategic initiatives
- **MongoDB Integration**: Seamless synchronization with the database
- **Author/Owner Display**: Tasks show their creator/owner (automatically detects current user)
- **AI Agent Integration**: Special support for AI-generated tasks with deployment capabilities

## Demo Mode vs Full Setup

### 🎬 **For Showcase/Demo Purposes**
This repository demonstrates:
- **Advanced React/Next.js architecture** with optimistic updates
- **Sophisticated GTD workflow implementation** with complex state management  
- **AI agent integration patterns** for programmatic task management
- **Social media-like UX** with instant feedback and animations
- **Production-ready component structure** with memory optimization

**You can explore the codebase, UI patterns, and architecture without any backend setup.**

### 🔧 **For Full Functionality** 
To run the complete system, you'll need to set up a MongoDB backend. See the [Backend Reference Implementation](./docs/BACKEND_REFERENCE_IMPLEMENTATION.md) for complete setup guide.

## Backend Integration Requirements

⚠️ **Note**: The frontend expects a compatible backend API for full functionality. For demo purposes, the UI will show loading states when backend is unavailable.

### Required Backend API Endpoints

To integrate this frontend with your backend system, implement the following API endpoints that match our reference implementation:

#### Tasks API (`/api/developer/tasks` or `/api/tasks/*`)

**Tasks Collection API:**
```javascript
// GET /api/developer/tasks - Fetch all tasks
// Optional query parameters: ?project=projectName&status=status&priority=priority
// Returns: { data: Array<Task>, count: number }

// POST /api/developer/tasks - Create new task
// Headers: { 'Content-Type': 'application/json', 'X-API-Key': 'your-api-key' }
// Body: Task object (see schema below)
// Returns: { data: Task, message: 'Task created successfully' }
```

**Individual Task Operations:**
```javascript
// GET /api/developer/tasks/:id - Get specific task by ID
// Returns: { data: Task }

// PUT /api/developer/tasks/:id - Update existing task
// Body: Partial task object with updated fields
// Returns: { data: Task, message: 'Task updated successfully' }

// DELETE /api/developer/tasks/:id - Delete task
// Returns: { message: 'Task deleted successfully' }
```

#### Initiatives API (`/api/initiatives/*`)

**Initiatives Collection API:**
```javascript
// GET /api/initiatives - Fetch all initiatives with automatic deduplication
// Returns: Array<Initiative> (automatically deduplicated by name+project)

// POST /api/initiatives - Create new initiative
// Body: Initiative object (see schema below)
// Returns: Initiative object with generated _id and numeric id
// Error 409: If initiative with same name+project already exists
```

**Individual Initiative Operations:**
```javascript
// GET /api/initiatives/:id - Get specific initiative by ID
// Supports both numeric ID and MongoDB ObjectId
// Returns: Initiative object
// Error 404: If initiative not found

// PUT /api/initiatives/:id - Update existing initiative
// Body: Partial initiative object (automatically sets updatedAt and completedAt if status becomes 'completed')
// Returns: Updated initiative object
// Error 400: If trying to change ID
// Error 404: If initiative not found

// DELETE /api/initiatives/:id - Delete initiative
// Returns: { message: 'Initiative deleted successfully' }
// Error 404: If initiative not found
```

### Required Data Models

#### Task Schema
```typescript
interface Task {
  _id: string;                    // MongoDB ObjectId
  title: string;                  // Required: Task title
  description?: string;           // Optional: Task description
  userImpact?: string;           // Optional: How this affects users
  impactedFunctionality?: string; // Optional: What components/behaviors change
  requirements?: string;          // Optional: List of requirements
  technicalPlan?: string;         // Optional: Implementation steps
  status: TaskStatus;             // Required: Current task status
  priority: 'high' | 'medium' | 'low'; // Required: Task priority
  project?: string;               // Optional: Project name
  initiative?: string;            // Optional: Initiative name
  branch?: string;                // Optional: Git branch
  tags?: string[];                // Optional: Categorization tags
  verificationSteps?: string[];   // Optional: Steps to verify completion
  files?: string[];               // Optional: Related file paths
  dependencies?: string[];        // Optional: Task IDs this depends on
  nextSteps?: string[];           // Optional: Future work after completion
  author?: string;                // Optional: Task creator
  createdAt: Date;                // Required: Creation timestamp
  updatedAt: Date;                // Required: Last update timestamp
  markdown?: string;              // Optional: Rich text content
}

type TaskStatus = 
  | 'inbox' | 'brainstorm' | 'proposed' | 'backlog' | 'maybe' 
  | 'todo' | 'in-progress' | 'on-hold' | 'for-review' | 'done' 
  | 'reviewed' | 'archived';
```

#### Initiative Schema
```typescript
interface Initiative {
  _id: string;                    // MongoDB ObjectId (auto-generated)
  id: number;                     // Numeric ID (auto-generated)
  name: string;                   // Required: Initiative name
  description?: string;           // Optional: Initiative description
  status: 'not-started' | 'planning' | 'active' | 'completed' | 'archived'; // Default: 'not-started'
  priority: 'high' | 'medium' | 'low'; // Default: 'medium'
  startDate: string;              // ISO date string (auto-set to now if not provided)
  targetDate?: string;            // Optional: Target completion date
  owner?: string;                 // Optional: Initiative owner
  budget?: number;                // Optional: Budget allocation
  tags: string[];                 // Array of tags (default: [])
  keyRisks: string[];             // Array of risk descriptions (default: [])
  dependencies: string[];         // Array of dependency IDs (default: [])
  linkedProjects: string[];       // Array of linked project names (default: [])
  linkedKpis: string[];           // Array of linked KPI names (default: [])
  createdAt: string;              // ISO date string (auto-generated)
  updatedAt: string;              // ISO date string (auto-updated)
  completedAt?: string;           // ISO date string (auto-set when status becomes 'completed')
  project: string;                // Project name (default: 'tasks')
}
```

### Environment Configuration

Set the following environment variables in your backend:

```bash
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017  # Your MongoDB connection string
MONGODB_DB=ix-tasks                    # Database name

# Optional: Authentication (if implementing auth)
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret
```

### Example Implementation Reference

This repository includes reference implementations:
- **Backend API**: Complete setup guide in [Backend Reference Implementation](./docs/BACKEND_REFERENCE_IMPLEMENTATION.md)
- **Frontend API Integration**: `src/pages/api/initiatives/*` (working examples)
- **AI Agent Client Pattern**: Demonstrated in documentation and README examples

The reference implementation demonstrates:
- MongoDB connection handling
- CRUD operations for tasks and initiatives  
- Error handling and validation
- Network resilience with retry logic
- AI agent integration patterns

### Integration Checklist

- [ ] Implement all required API endpoints
- [ ] Set up MongoDB database with correct schemas
- [ ] Configure environment variables
- [ ] Test API endpoints with frontend application
- [ ] Verify real-time updates work correctly
- [ ] Ensure optimistic UI updates sync properly with backend

For detailed API documentation and examples, refer to the [Initiatives Guide](./docs/initiatives-guide.md).

## Recent Enhancements

This project has been enhanced with:

- **GTD Methodology Integration**: Full Getting Things Done workflow implementation
- **AI Agent Workflow**: Support for AI-generated tasks with special handling
- **Instant, Social Media-like Experience**: Tasks appear, update, and disappear instantly
- **Optimistic UI Updates**: All changes happen immediately in the UI before server confirmation
- **Animation System**: Subtle animations provide visual feedback for all actions
- **Memory Optimization**: Enhanced event system to prevent memory leaks with efficient subscription management

### Tasks Enhancements (March 2025)

- **Claude Agent Deployment**: Each task can launch a terminal with task-specific system prompts
- **Improved Task Status Flow**: Reorganized to support GTD methodology
- **Flexible Filter Layout**: Horizontal scrolling filters with logical grouping
- **Enhanced Task Cards**: Improved inline editing and expandable details
- **Memory-Optimized Event System**: Reduced memory usage in real-time updates with EventBus pattern
- **Memory Usage Monitoring**: Debug tools for tracking subscription and listener counts

## Author/Owner Display

Tasks display their author/owner information. The system automatically detects:

- Current user as the author for local tasks
- Other users' names for tasks they create
- Author information is visible in both compact and expanded views

## Documentation

### 📚 Getting Started & Overview
- [Documentation Index](./docs/index.md): Main documentation portal with comprehensive overview of the Agentic Sync system and user experience guidelines
- [Using Tasks](./docs/using-tasks.md): Basic usage guide for navigating and managing tasks effectively in the GTD workflow
- [Getting Started Tutorial](./docs/doc-test.md): Step-by-step verification guide for testing documentation navigation and system functionality

### 🎯 User Experience & Interface
- [Enhanced UI Guide](./docs/ENHANCED_UI_GUIDE.md): Instant social media-like interactions with optimistic updates and smooth animations
- [Social Media-Like Experience](./docs/SOCIAL_MEDIA_LIKE_EXPERIENCE.md): Transform task management into responsive, instant feedback workflows
- [Documentation Viewer](./docs/DOCUMENTATION_VIEWER.md): Built-in markdown documentation system with automatic file discovery

### 📋 Task Management & Features
- [Markdown Support](./docs/MARKDOWN_SUPPORT.md): Rich text formatting for task descriptions with full markdown rendering capabilities
- [Tasks Core Integration](./docs/TASKS_CORE_INTEGRATION.md): Modular business-case-aware components for flexible task management implementations
- [Initiatives Guide](./docs/initiatives-guide.md): Strategic initiative management with comprehensive API documentation and data models
- [Backend Reference Implementation](./docs/BACKEND_REFERENCE_IMPLEMENTATION.md): Complete backend setup guide with copy-paste API endpoints and MongoDB schema

### 🏗️ Architecture & Design
- [Component Documentation](./docs/architecture/TASK_COMPONENT_DOCUMENTATION.md): Comprehensive TaskCard architecture with GTD methodology integration and collaboration workflows
- [Data Models](./docs/architecture/README-DATA-MODELS.md): Flexible framework for configurable data models with dynamic UI generation and backend code creation
- [Dependency Paths](./docs/architecture/DEPENDENCY_PATHS.md): Module relationship mapping with circular dependency detection and refactoring guidance
- [Workflows](./docs/architecture/Workflows.md): Complete GTD status transitions and workflow definitions
- [Modular Tasks](./docs/architecture/modularizeTasks.md): Strategy for decomposing monolithic systems into maintainable modules

### ⚙️ Configuration & Setup
- [Memory Optimization](./docs/configuration/MEMORY_OPTIMIZATION.md): Prevent memory leaks with efficient task operation optimization and EventBus patterns
- [Multi-Instance Setup](./docs/configuration/MULTI_INSTANCE_README.md): Run multiple simultaneous instances for development and testing environments
- [Remote Sync](./docs/configuration/REMOTE_SYNC.md): Automated git synchronization between personal and organization repositories
- [Whitespace Preservation](./docs/configuration/PR_WHITESPACE_PRESERVATION.md): Maintain consistent code formatting across pull requests

### 🔄 Migration & Integration
- [Shared Components Migration](./docs/SHARED_COMPONENTS_MIGRATION.md): Transition from local to modular component architecture with build failure prevention
- [Shared Components Migration Plan](./docs/SHARED_COMPONENTS_MIGRATION_PLAN.md): Strategic roadmap for component library modernization
- [Migration Guide](./docs/migration/MIGRATION_GUIDE.md): Version upgrade procedures and compatibility guidelines
- [Tauri Integration](./docs/migration/TAURI_INTEGRATION.md): Desktop application integration with native system capabilities
- [Tauri Conversion Guide](./docs/tauri-conversion.md): Complete instructions for converting the web app to a native desktop application using Tauri

### 🚀 Deployment & Infrastructure
- [Vercel Configuration](./docs/vercel-config.md): Production deployment configuration and setup guide for Vercel hosting platform

### ✅ Completed Features & Achievements
- [Task Completion](./docs/completed/TASK_COMPLETION.md): Finalized task management workflows and user interaction patterns
- [Task Documentation](./docs/completed/TASK_DOCUMENTATION.md): Complete feature set documentation for the task management system
- [Build Summary](./docs/completed/build-summary.md): Optimization achievements and system performance improvements

### 🔧 Issues & Troubleshooting
- [Issues Overview](./docs/issues/README.md): Comprehensive index of identified issues and their resolution status across the application
- [Task Card Bug Fix](./docs/issues/TASK_CARD_BUG_FIX.md): Resolved display and interaction issues in TaskCard components
- [Tauri Refresh Button Issue](./docs/issues/TAURI_REFRESH_BUTTON_ISSUE.md): Known desktop application refresh functionality limitations
- [Next.js Routing Issues](./docs/issues/NEXT_JS_ROUTING_ISSUES.md): Route handling challenges and implementation solutions
- [Next.js Routing Implementation Plan](./docs/issues/NEXT_JS_ROUTING_IMPLEMENTATION_PLAN.md): Detailed technical plan for resolving routing architecture issues
- [TaskCard Approve/Veto Analysis](./docs/issues/TaskCard_Approve_Veto_Buttons_Analysis.md): Interactive task review functionality development
- [TaskCard Markdown Support](./docs/issues/2025_05_02_TaskCard_Markdown_Field_Support.md): Enhancement analysis for rich text markdown rendering in task cards
- [Filter Message Updates](./docs/issues/CO_9101_filter_message_update.md): Task filter system improvements and message handling optimizations

### 🧩 Tasks Core Module
- [Tasks Core Module](./tasks-core-module/README.md): Shared task implementation that can be customized for different business cases and use patterns
- [Tasks Core Proposal](./tasks-core-module/TASKS_PROPOSAL.md): Strategic proposal and technical specification for modular task system architecture
- [Tasks Core Workflow Guide](./tasks-core-module/WORKFLOW_GUIDE.md): Implementation workflow and integration patterns for the modular task core system

### 🛠️ Developer Resources
- [Testing Guide](./\_\_tests\_\_/TESTING.md): Comprehensive testing documentation focusing on real-time synchronization and EventBus components
- [Editable Items Components](./src/components/EditableItems/README.md): Documentation for task requirements, technical plans, and next steps editing components
- [Item Hooks](./src/hooks/items/README.md): Custom hooks for managing editable item lists with approval and veto functionality
- [Filter Settings System](./src/utils/filterSettings/README.md): Centralized filter architecture with layered design for consistency and maintainability

### 📋 Project Management
- [Changelog](./CHANGELOG.md): Version history and feature additions tracking for the Agentic Sync application
- [TODO List](./TODO.md): High-priority development tasks including Claude agent deployment and system enhancements
- [Project Instructions](./CLAUDE.md): Detailed project-specific documentation and AI agent integration guidelines for development

## Getting Started

```bash
# Install dependencies
npm install

# Set up shared components
npm run setup:components

# Migrate import statements (if needed)
npm run migrate:imports

# Verify import consistency
npm run verify:imports

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Technical Details

- **Stack**: Next.js, React, TypeScript, Tailwind CSS
- **State Management**: React Context API
- **Data Storage**: MongoDB
- **API Integration**: RESTful API calls with optimistic updates
- **Animation**: CSS animations and React state transitions
- **Event System**: EventBus pattern for memory-efficient real-time updates
- **Memory Management**: Custom hooks with cleanup to prevent memory leaks
- **Component Architecture**: Modular component packages with local file references

### Memory Optimization

The application features a sophisticated memory management system:

- **EventBus Pattern**: Centralized event management with organized subscription tracking
- **Memory Usage Monitoring**: Real-time tracking of active listeners and subscriptions
- **Optimized Subscriptions**: Automatic cleanup of listeners when components unmount
- **Custom Hooks**: Specialized hooks like `useTaskSync` for efficient event handling
- **Memory Debug Tools**: UI components that show subscription counts and memory usage
- **Development Mode**: Special debug features available in development only

## License Overview

This project is free to use for noncommercial purposes (personal projects, research, nonprofits, education, tinkering, contributing plugins).

Commercial use is not allowed without prior written permission from Next AI Labs. If you're a company, startup, or enterprise and want to use this code in a product or service, contact us to discuss licensing.

For the full legal details, see the [LICENSE](./LICENSE) file.