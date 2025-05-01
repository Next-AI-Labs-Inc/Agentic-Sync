# Tasks Core Workflow Guide

This guide explains how to use the Tasks Core submodule and how it differs from the previous configuration-driven package approach.

> **Note**: When working with the tasks API for task management, use port 3002 (http://localhost:3002) instead of port 3007.

## Overview

Tasks Core is a Git submodule that contains the core components of the Tasks application with conditional logic for different business cases. This approach allows you to:

1. Directly modify code to fix bugs and add features
2. Share those improvements across all implementations 
3. Support multiple business cases through simple conditional logic
4. Maintain a familiar direct-coding workflow

## Setting Up Tasks Core as a Submodule

### In Your Main Project

```bash
# In your main project directory
git submodule add https://github.com/your-org/tasks-core
cd tasks-core
npm install
npm run build
```

### In a New Project

```bash
# Start with tasks-core
git clone https://github.com/your-org/tasks-core my-new-project
cd my-new-project
npm install
```

## Using Tasks Core

### Basic Usage

```jsx
import { TasksApp } from '@ix/tasks-core';

function App() {
  return <TasksApp />;
}
```

### For Different Business Cases

```jsx
// For a support desk application
import { TasksApp } from '@ix/tasks-core';

function SupportApp() {
  return <TasksApp businessCase="support" />;
}

// For a recruitment application
import { TasksApp } from '@ix/tasks-core';

function RecruitmentApp() {
  return <TasksApp businessCase="recruitment" />;
}
```

### With Custom Configuration

```jsx
import { TasksApp } from '@ix/tasks-core';

function CustomApp() {
  return (
    <TasksApp 
      businessCase="support"
      customConfig={{
        terminology: {
          task: "Issue",
          requirements: "Customer Needs"
        },
        api: {
          baseUrl: "https://api.example.com"
        },
        onTaskCreate: (task) => {
          // Custom handling
          console.log('New task created:', task);
        }
      }}
    />
  );
}
```

## Development Workflow

When working with Tasks Core, you'll be directly modifying the code rather than configuring it externally. Here's the typical workflow:

### 1. Fix bugs or add features

```bash
# In /Users/jedi/react_projects/ix/tasks-core
# Edit the components directly
code src/components/VerificationSteps.tsx

# Test your changes
npm run build
```

### 2. Add business case conditionals if needed

```jsx
// In your component
if (businessCase === 'support') {
  // Support desk specific implementation
  return <SupportUi />;
} else {
  // Default Tasks implementation
  return <TasksUi />;
}
```

### 3. Commit and push changes

```bash
# In /Users/jedi/react_projects/ix/tasks-core
git add .
git commit -m "Fix verification steps infinite reload bug"
git push
```

### 4. Update the submodule in consuming projects

```bash
# In projects using tasks-core as a submodule
git submodule update --remote
```

## Key Benefits Over Package Approach

1. **Familiar Workflow**: Continue coding directly in components
2. **Simpler Mental Model**: Use conditionals rather than complex configuration objects
3. **Faster Bug Fixes**: Fix once, propagate everywhere via the submodule
4. **Easier to Debug**: No complex abstraction layer to navigate
5. **More Control**: Full access to modify any part of the code as needed

## Example: Fixing the VerificationSteps Infinite Reload Bug

The VerificationSteps component in this project demonstrates how to fix the infinite reload bug from the original Tasks app:

```jsx
// In VerificationSteps.tsx

// FIX FOR INFINITE RELOAD: Use a stable state updater function
const handleStepChange = (index: number, value: string) => {
  if (!editable || !onChange) return;
  
  // Create a new array to avoid reference issues that cause infinite reloads
  const newSteps = steps.map((step, i) => {
    if (i === index) {
      return { ...step, text: value };
    }
    return step;
  });
  
  // Call onChange with the new array
  onChange(newSteps);
};
```

With this approach, you can fix bugs directly in the code and they'll automatically be available to all implementations using the tasks-core submodule.

## Getting Help

If you need assistance with Tasks Core, please contact the IX Team.