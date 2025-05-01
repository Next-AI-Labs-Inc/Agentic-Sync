# Tasks Core Integration Guide

This guide explains how to integrate the tasks-core submodule into your application, and how to migrate from the existing Tasks app to the new tasks-core approach.

## Introduction

tasks-core is a Git submodule that provides modular, business-case-aware components for the Tasks app. It uses conditional rendering to support different business cases (tasks, support, recruitment, project) while maintaining a familiar direct-coding workflow.

### Key Benefits

1. **Direct Code Access**: Fix bugs directly in the components rather than through configuration
2. **Shared Improvements**: Changes propagate to all implementations via the Git submodule
3. **Simple Conditionals**: Use if/else rather than complex configuration objects
4. **Flexible Customization**: Business cases come with defaults but allow customization
5. **Fixed Bugs**: The infinite reload bug in VerificationSteps is fixed

## Setup Instructions

### 1. Add the tasks-core submodule

```bash
# In your project directory
git submodule add https://github.com/your-org/tasks-core
cd tasks-core
npm install
npm run build
```

### 2. Add a reference in package.json

```json
"dependencies": {
  "@ix/tasks-core": "file:./tasks-core"
}
```

### 3. Install dependencies and build the submodule

```bash
npm install
npm run build:tasks-core  # Add this script to your package.json
```

## Using tasks-core Components

### TasksApp Component

This is the main container component for the Tasks application:

```jsx
import { TasksApp } from '@ix/tasks-core';

function App() {
  return (
    <TasksApp 
      businessCase="support" 
      customConfig={{
        terminology: {
          task: "Ticket",
          requirements: "Customer Needs"
        }
      }}
    />
  );
}
```

### TaskCard Component

This component renders a task card with business case specific styling:

```jsx
import { TaskCard } from '@ix/tasks-core';

function TaskList({ tasks }) {
  return (
    <div>
      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          businessCase="recruitment"
        />
      ))}
    </div>
  );
}
```

### VerificationSteps Component

This component displays verification steps with the infinite reload bug fixed:

```jsx
import { VerificationSteps } from '@ix/tasks-core';

function TaskDetail({ task }) {
  const handleStepsChange = (newSteps) => {
    // Update task with new steps
    updateTask(task.id, { verificationSteps: newSteps });
  };

  return (
    <VerificationSteps
      task={task}
      businessCase="project"
      editable={true}
      onChange={handleStepsChange}
    />
  );
}
```

## Migration from Current Tasks App

To migrate from the current Tasks app to the tasks-core approach, follow these steps:

### 1. Identify components to replace

Start with these key components:
- TaskVerificationSteps → Replace with VerificationSteps from tasks-core
- TaskCard → Replace with TaskCard from tasks-core
- TasksApp → Replace with TasksApp from tasks-core

### 2. Update imports

Change imports from local components to tasks-core:

```jsx
// Before
import TaskVerificationSteps from '@/components/TaskCard/TaskVerificationSteps';

// After
import { VerificationSteps } from '@ix/tasks-core';
```

### 3. Add business case parameter

When using tasks-core components, add the businessCase parameter:

```jsx
// Before
<TaskVerificationSteps task={task} isExpanded={true} />

// After
<VerificationSteps task={task} businessCase="tasks" editable={true} />
```

### 4. Update component usage

The tasks-core components might have slightly different props, so update your component usage:

```jsx
// Example for TaskCard
<TaskCard
  task={task}
  businessCase="tasks"
  customConfig={{
    terminology: {
      requirements: "Requirements",
      verificationSteps: "Verification Steps"
    }
  }}
/>
```

### 5. Incrementally migrate

You can migrate one component at a time, starting with VerificationSteps to fix the infinite reload bug.

## Demo Pages

We've created demo pages to help you understand how to use tasks-core:

1. `/tasks-core` - Shows all tasks-core components with business case switching
2. `/verification-steps-demo` - Demonstrates the fixed VerificationSteps component

## Troubleshooting

### Component not found

Make sure you've built the tasks-core module:

```bash
cd tasks-core
npm run build
```

### Types not recognized

Import types explicitly:

```jsx
import { BusinessCase, TasksConfig } from '@ix/tasks-core';
```

### Business case not working

Ensure you're passing a valid business case value:

```jsx
<TasksApp businessCase="support" /> // Valid values: 'tasks', 'support', 'recruitment', 'project'
```

## Additional Resources

- [WORKFLOW_GUIDE.md](../tasks-core-module/WORKFLOW_GUIDE.md) - Instructions for working with the tasks-core submodule
- [TASKS_PROPOSAL.md](../tasks-core-module/TASKS_PROPOSAL.md) - The original proposal for the tasks-core approach