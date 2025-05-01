# Tasks Core

Shared implementation of the Tasks application that can be customized for different business cases.

## Usage

```jsx
import { TasksApp } from '@ix/tasks-core';

function App() {
  return (
    <TasksApp 
      businessCase="support"
      customConfig={{
        // Simple configuration options
        terminology: {
          task: "Ticket",
          requirements: "Customer Needs"
        }
      }}
    />
  );
}
```

## Available Business Cases

- `tasks` (default): Standard task management
- `support`: Support desk ticket tracking
- `recruitment`: Candidate tracking for recruiting
- `project`: Project management

## Configuration Options

```jsx
{
  // Change terminology throughout the app
  terminology: {
    task: "Ticket",               // What to call a "Task"
    tasks: "Tickets",            // Plural form
    requirements: "Customer Needs", // What to call "Requirements"
    verificationSteps: "Resolution Steps", // What to call "Verification Steps"
  },
  
  // API configuration
  api: {
    baseUrl: "https://api.example.com",
    apiKey: "your-api-key"
  },
  
  // Event callbacks
  onTaskCreate: (task) => {
    console.log('Task created:', task);
  },
  onTaskUpdate: (task) => {
    console.log('Task updated:', task);
  }
}
```