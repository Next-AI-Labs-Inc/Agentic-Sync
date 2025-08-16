# IX Tasks

A comprehensive task management system aligned with the Getting Things Done (GTD) methodology and enhanced to support AI agent workflow integration.

## Project Status

- **Active Development**: This project is currently under active development
- **Tasks View**: Fully functional with inline editing, optimistic updates, and item approval workflow
- **Initiatives View**: Functional but being updated to match Tasks UI pattern
- **Documentation**: Currently only the home page is available. Sub-pages have been temporarily disabled due to routing issues and will be reimplemented in a future update.

## Shared Components System

The IX Tasks application uses a modular component architecture for shared components:

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
- **Author/Owner Display**: Tasks show their creator/owner (automatically detects current user as "Jonathan")
- **AI Agent Integration**: Special support for AI-generated tasks with deployment capabilities

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

- Current user (Jonathan) as the author for local tasks
- Other users' names for tasks they create
- Author information is visible in both compact and expanded views

## Documentation

### Architecture & Design
- [Data Models](./docs/architecture/README-DATA-MODELS.md): Core data structures and schema definitions for tasks and initiatives
- [Component Documentation](./docs/architecture/TASK_COMPONENT_DOCUMENTATION.md): Detailed guide to TaskCard and related components architecture
- [Dependency Paths](./docs/architecture/DEPENDENCY_PATHS.md): Module dependency mapping and import relationships
- [Workflows](./docs/architecture/Workflows.md): Complete workflow definitions and status transitions for GTD methodology
- [Modular Tasks](./docs/architecture/modularizeTasks.md): Strategy for breaking down the monolithic task system into smaller modules

### Configuration & Setup
- [Remote Sync](./docs/configuration/REMOTE_SYNC.md): Git repository synchronization setup between personal and organization repos
- [Memory Optimization](./docs/configuration/MEMORY_OPTIMIZATION.md): Performance tuning and memory management configuration guidelines
- [Multi-Instance Setup](./docs/configuration/MULTI_INSTANCE_README.md): Running multiple instances of the task system simultaneously
- [Whitespace Preservation](./docs/configuration/PR_WHITESPACE_PRESERVATION.md): Git configuration for maintaining code formatting in pull requests

### Migration Guides
- [Migration Guide](./docs/migration/MIGRATION_GUIDE.md): Step-by-step guide for upgrading between major versions of the task system
- [Shared Components Migration](./docs/migration/SHARED_COMPONENTS_MIGRATION.md): Transition from monolithic to modular component architecture
- [Tauri Integration](./docs/migration/TAURI_INTEGRATION.md): Native desktop application integration using Tauri framework

### Completed Features
- [Task Completion](./docs/completed/TASK_COMPLETION.md): Documentation of completed task management functionality and user workflows
- [Task Documentation](./docs/completed/TASK_DOCUMENTATION.md): Comprehensive guide to completed task system features and capabilities
- [Build Summary](./docs/completed/build-summary.md): Summary of completed build system improvements and optimizations

### Known Issues
- [Task Card Bug Fix](./docs/issues/TASK_CARD_BUG_FIX.md): Resolution documentation for TaskCard component display issues
- [Tauri Refresh Button Issue](./docs/issues/TAURI_REFRESH_BUTTON_ISSUE.md): Known issue with refresh functionality in desktop application

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

## License

This project is licensed under the [Next AI Labs Inc Proprietary License](../LICENSE.md). All rights reserved. This codebase is proprietary and confidential, and usage is strictly governed by the terms outlined in the license agreement.

---

© 2025 Next AI Labs Inc. All rights reserved.